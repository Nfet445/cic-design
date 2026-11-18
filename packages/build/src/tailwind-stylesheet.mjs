// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tailwind-stylesheet.js
 * @input A package root, its Tailwind input stylesheet, its output path and
 *   its banner
 * @output The compiled stylesheet, cached against the sources it scanned
 * @position Build shared by every satellite package that ships a Tailwind
 *   sheet; `packages/core/scripts/build-css-tailwind.mjs` is the same build
 *   for core and can delegate here once this module settles.
 *
 * The input stylesheet registers the Astryx cascade layers, imports the
 * Tailwind utilities layer, and scans the class-map modules it names. Output
 * is the package's prebuilt stylesheet for components whose own styles are
 * Tailwind classes — the counterpart of `scripts/build-css.mjs` for StyleX
 * components.
 *
 * The utilities are wrapped in `@layer astryx-base` here, not by the import
 * line: Tailwind 4.3.2 prints `@import ... source(none) layer(astryx-base)` as
 * `@media layer(astryx-base)`, which no browser reads as a layer.
 *
 * The build caches its sheet against the sources it scanned. Each class-map
 * module gets an entry keyed by its modification stamp, as the StyleX build
 * keys its per-module cache, so a build reads only the files that changed;
 * the compiled sheet is reused while every module's content hash, the input
 * stylesheet and the compiler's versions are unchanged. The cached sheet is
 * the sheet itself, so a reused build writes the same bytes.
 *
 * The compiler is resolved from the package root, not from this module: each
 * package declares its own `tailwindcss` and `postcss`, and the cache key
 * names the versions that package resolved.
 */

import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {
  mkdir,
  readdir,
  readFile,
  rename,
  stat,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';

/** The layer every Astryx package prints its own rules into. */
export const ASTRYX_BASE_LAYER = 'astryx-base';

/** `pattern` as a matcher over `/`-separated paths; `*` stays in one segment. */
function globToRegExp(pattern) {
  const body = pattern
    .split(/(\*\*\/|\*\*|\*|\?)/)
    .map(part => {
      if (part === '**/') {
        return '(?:[^/]+/)*';
      }
      if (part === '**') {
        return '.*';
      }
      if (part === '*') {
        return '[^/]*';
      }
      if (part === '?') {
        return '[^/]';
      }
      return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('');
  return new RegExp(`^${body}$`);
}

function sha256(data) {
  return createHash('sha256').update(data).digest('hex');
}

/** The path as the cache records it: relative to the package, `/`-separated. */
function cachePath(root, file) {
  return path.relative(root, file).split(path.sep).join('/');
}

/**
 * A dependency's installed version. Its `package.json` is not an export, so
 * the version is read from the package directory the entry point resolves
 * into; the key must move when the compiler a build used moves.
 */
async function dependencyVersion(require, specifier) {
  let dir = path.dirname(require.resolve(specifier));
  while (dir !== path.dirname(dir)) {
    let manifest = null;
    try {
      manifest = JSON.parse(
        await readFile(path.join(dir, 'package.json'), 'utf8'),
      );
    } catch {
      // No package.json here: the package root is further up.
    }
    if (manifest != null) {
      return manifest.version;
    }
    dir = path.dirname(dir);
  }
  throw new Error(`No package.json above ${specifier}`);
}

/**
 * The files the input stylesheet scans: every `@source` pattern, resolved
 * against the stylesheet's directory. A bare specifier names a dependency's
 * files, which this package's cache cannot key on a path of its own, so it is
 * not cached; a package names its candidate sources by path.
 */
async function scannedModules(input, inputCss) {
  const modules = new Set();
  const stylesheetDir = path.dirname(input);
  for (const [, pattern] of inputCss.matchAll(/@source\s+'([^']+)'/g)) {
    if (!pattern.startsWith('.')) {
      continue;
    }
    const matcher = globToRegExp(
      path.resolve(stylesheetDir, pattern).split(path.sep).join('/'),
    );
    // The literal part of the pattern is the directory the walk starts from.
    const [literal] = pattern.split(/[*?]/);
    const from = path.resolve(
      stylesheetDir,
      literal.endsWith('/') ? literal : path.dirname(literal),
    );
    const entries = await readdir(from, {recursive: true}).catch(error => {
      if (error.code === 'ENOENT') {
        // A pattern whose directory is absent matches no file.
        return [];
      }
      throw error;
    });
    for (const entry of entries) {
      const file = path.join(from, entry);
      if (matcher.test(file.split(path.sep).join('/'))) {
        modules.add(file);
      }
    }
  }
  return [...modules].sort();
}

/**
 * Every scanned module's content hash, keyed by its path in the package, with
 * the modification stamp that let this build skip reading it. A file whose
 * stamp moved is read again: the sheet depends on its bytes, not its date.
 */
async function fingerprintModules(root, modules, previous) {
  const entries = {};
  let hits = 0;
  let misses = 0;
  for (const file of modules) {
    const key = cachePath(root, file);
    const {mtimeMs, size} = await stat(file);
    const stamp = `${mtimeMs}:${size}`;
    if (previous[key]?.stamp === stamp) {
      entries[key] = previous[key];
      hits += 1;
    } else {
      entries[key] = {stamp, hash: sha256(await readFile(file))};
      misses += 1;
    }
  }
  return {entries, hits, misses};
}

/**
 * The content hash of a stylesheet and of every relative stylesheet it
 * imports. The class maps produce the utilities, but the layer statements,
 * the theme bridge and the keyframes reach the sheet from these files.
 */
async function stylesheetHashes(root, file, cssText = null, seen = new Set()) {
  const absolute = path.resolve(file);
  if (seen.has(absolute)) {
    return {};
  }
  seen.add(absolute);
  const css = cssText ?? (await readFile(absolute, 'utf8'));
  const hashes = {[cachePath(root, absolute)]: sha256(css)};
  for (const [, specifier] of css.matchAll(/@import\s+'([^']+)'/g)) {
    if (!specifier.startsWith('.')) {
      continue;
    }
    Object.assign(
      hashes,
      await stylesheetHashes(
        root,
        path.resolve(path.dirname(absolute), specifier),
        null,
        seen,
      ),
    );
  }
  return hashes;
}

/**
 * What the sheet is a function of: the scanned modules' content, the
 * stylesheets, and the compiler versions. A stamp is not part of it, because a
 * file that was touched holds the same bytes.
 */
async function sheetKey(root, require, entries, input, inputCss, version) {
  const versions = {};
  for (const specifier of ['@tailwindcss/postcss', 'tailwindcss', 'postcss']) {
    versions[specifier] = await dependencyVersion(require, specifier);
  }
  return sha256(
    JSON.stringify({
      version,
      versions,
      stylesheets: await stylesheetHashes(root, input, inputCss),
      modules: Object.fromEntries(
        Object.entries(entries).map(([key, {hash}]) => [key, hash]),
      ),
    }),
  );
}

/** The recorded entries, or none when the cache is cold or unreadable. */
async function readManifest(cacheDir) {
  try {
    const manifest = JSON.parse(
      await readFile(path.join(cacheDir, 'manifest.json'), 'utf8'),
    );
    return typeof manifest.key === 'string' &&
      manifest.modules != null &&
      typeof manifest.modules === 'object'
      ? manifest
      : null;
  } catch {
    return null;
  }
}

/** The cached sheet, or `null` when the cache holds another build's sheet. */
async function readCachedSheet(cacheDir, key) {
  const manifest = await readManifest(cacheDir);
  if (manifest?.key !== key) {
    return null;
  }
  try {
    return await readFile(path.join(cacheDir, 'sheet.css'), 'utf8');
  } catch {
    return null;
  }
}

/**
 * Write a cache file whole, by renaming it into place: another process
 * building the same sheet reads one version or the other, never half of one.
 */
async function writeCache(cacheDir, name, data) {
  await mkdir(cacheDir, {recursive: true});
  const file = path.join(cacheDir, name);
  const temporary = `${file}.${process.pid}.tmp`;
  await writeFile(temporary, data);
  await rename(temporary, file);
}

/** Drop formatting whitespace without rewriting selectors or values. */
export function compactTailwindFormatting(root) {
  root.walk(node => {
    if (node.type === 'comment') {
      return;
    }
    node.raws.before = '';
    if (node.nodes != null) {
      node.raws.after = '';
    }
    if (node.type === 'decl') {
      node.raws.between = ':';
    }
    if (node.type === 'rule') {
      node.raws.between = '';
    }
  });
  root.raws.after = '';
}

/**
 * Compile a package's stylesheet without writing it, so a test can assert the
 * declarations the build produces.
 *
 * @param {object} options
 * @param {string} options.root the package directory the paths are relative
 *   to and whose compiler versions the cache keys.
 * @param {string} options.input the Tailwind input stylesheet.
 * @param {string} options.banner the sheet's first comment.
 * @param {string} [options.layer] the layer every rule sits in.
 * @param {string} [options.cacheDir] where the entries and the sheet are kept.
 * @param {boolean} [options.compact] omit formatting whitespace in the generated CSS.
 * @param {string} [options.cacheVersion] bumped when this file changes the
 *   sheet it compiles: the key cannot see the code that reads it.
 * @param {(report: {hits: number, misses: number, reused: boolean}) => void}
 *   [options.onCacheReport] how many modules were served from the cache and
 *   how many were read, and whether the sheet was reused or compiled.
 */
export async function buildTailwindStylesheet({
  root,
  input,
  banner,
  layer = ASTRYX_BASE_LAYER,
  cacheDir = path.resolve(root, 'node_modules/.cache/astryx-tailwind-css'),
  cacheVersion = '1',
  compact = false,
  onCacheReport,
}) {
  const require = createRequire(path.join(root, 'package.json'));
  const postcss = require('postcss');
  const tailwind = require('@tailwindcss/postcss');

  const inputCss = await readFile(input, 'utf8');
  const previous = await readManifest(cacheDir);
  const {entries, hits, misses} = await fingerprintModules(
    root,
    await scannedModules(input, inputCss),
    previous?.modules ?? {},
  );
  const key = await sheetKey(
    root,
    require,
    entries,
    input,
    inputCss,
    compact ? `${cacheVersion}:compact` : cacheVersion,
  );

  const cached = await readCachedSheet(cacheDir, key);
  let css = cached;
  if (css == null) {
    const wrap = {
      postcssPlugin: 'astryx-wrap-utilities-in-layer',
      Once(cssRoot) {
        const wrapper = postcss.atRule({name: 'layer', params: layer});
        for (const node of [...cssRoot.nodes]) {
          if (
            node.type === 'atrule' &&
            node.name === 'layer' &&
            node.nodes == null
          ) {
            if (node.params === 'properties') {
              node.remove();
            }
            continue;
          }
          wrapper.append(node.clone());
          node.remove();
        }
        if (wrapper.nodes.length > 0) {
          cssRoot.append(wrapper);
        }
        if (compact) {
          compactTailwindFormatting(cssRoot);
        }
      },
    };
    const result = await postcss([tailwind(), wrap]).process(inputCss, {
      from: input,
    });
    css = `/* ${banner} */\n/* Auto-generated. Do not edit manually. */\n\n${result.css}`;
    await writeCache(cacheDir, 'sheet.css', css);
  }
  // A stamp moves without a content change, on a checkout or a formatter run.
  // The entries are therefore rewritten whenever a module was read again, or
  // the next build would read that module again for nothing.
  if (cached == null || misses > 0) {
    await writeCache(
      cacheDir,
      'manifest.json',
      JSON.stringify({key, modules: entries}),
    );
  }

  onCacheReport?.({hits, misses, reused: cached != null});
  return css;
}
