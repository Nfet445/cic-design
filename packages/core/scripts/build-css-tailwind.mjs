// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Compile the Tailwind utilities that migrated components use into
 * `packages/core/dist/astryx-tailwind.css`.
 *
 * The input stylesheet registers the Astryx cascade layers, imports the
 * Tailwind utilities layer, and scans the class-map modules it names. Output
 * is the library's prebuilt stylesheet for components whose own styles are
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
 * SYNC: tailwind/astryx.input.css names the scanned sources.
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
import {fileURLToPath} from 'node:url';

import tailwind from '@tailwindcss/postcss';
import postcss from 'postcss';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INPUT = path.resolve(ROOT, 'tailwind/astryx.input.css');
const OUTPUT = path.resolve(ROOT, 'dist/astryx-tailwind.css');
const CACHE_DIR = path.resolve(ROOT, 'node_modules/.cache/astryx-tailwind-css');
const LAYER = 'astryx-base';

const BANNER =
  '/* Astryx Core Pre-compiled Tailwind CSS — layout primitives */';
const GENERATED = '/* Auto-generated. Do not edit manually. */';

/**
 * Move every rule Tailwind printed into the `astryx-base` layer, leaving the
 * layer statements that fix the cascade order in place.
 *
 * Tailwind also declares an empty top-level `properties` layer before those
 * statements. Its reset block lands inside `astryx-base`, so the declaration
 * is a leftover; the package must begin with its own order registration.
 */
const intoLayer = {
  postcssPlugin: 'astryx-wrap-utilities-in-layer',
  Once(root) {
    const layer = postcss.atRule({name: 'layer', params: LAYER});
    for (const node of [...root.nodes]) {
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
      layer.append(node.clone());
      node.remove();
    }
    if (layer.nodes.length > 0) {
      root.append(layer);
    }
  },
};

/**
 * Bumped when a change to this file changes the sheet it compiles. The value
 * is part of the cache key, because the key cannot see the code that reads it.
 */
const CACHE_VERSION = '1';

/** The compiled sheet, and the entries the key that names it was built from. */
const SHEET = 'sheet.css';
const MANIFEST = 'manifest.json';

const require = createRequire(import.meta.url);

function sha256(data) {
  return createHash('sha256').update(data).digest('hex');
}

/** A path as the cache records it: relative to the package, `/`-separated. */
function cachePath(file) {
  return path.relative(ROOT, file).split(path.sep).join('/');
}

/**
 * A dependency's installed version. Its `package.json` is not an export, so
 * the version is read from the package directory the entry point resolves
 * into; the key must move when the compiler a build used moves.
 */
async function dependencyVersion(specifier) {
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

/**
 * The files the input stylesheet scans: every `@source` pattern, resolved
 * against the stylesheet's directory. A bare specifier names a dependency's
 * files, which this package's cache cannot key on a path of its own, so it is
 * not cached; the package names its candidate sources by path.
 */
async function scannedModules(inputCss) {
  const modules = new Set();
  const stylesheetDir = path.dirname(INPUT);
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
async function fingerprintModules(modules, previous) {
  const entries = {};
  let hits = 0;
  let misses = 0;
  for (const file of modules) {
    const key = cachePath(file);
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
async function stylesheetHashes(file, cssText = null, seen = new Set()) {
  const absolute = path.resolve(file);
  if (seen.has(absolute)) {
    return {};
  }
  seen.add(absolute);
  const css = cssText ?? (await readFile(absolute, 'utf8'));
  const hashes = {[cachePath(absolute)]: sha256(css)};
  for (const [, specifier] of css.matchAll(/@import\s+'([^']+)'/g)) {
    if (!specifier.startsWith('.')) {
      continue;
    }
    Object.assign(
      hashes,
      await stylesheetHashes(
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
 * stylesheets, and the compiler versions. A stamp is not part of it, because
 * a file that was touched holds the same bytes.
 */
async function sheetKey(entries, inputCss) {
  const versions = {};
  for (const specifier of ['@tailwindcss/postcss', 'tailwindcss', 'postcss']) {
    versions[specifier] = await dependencyVersion(specifier);
  }
  return sha256(
    JSON.stringify({
      version: CACHE_VERSION,
      versions,
      stylesheets: await stylesheetHashes(INPUT, inputCss),
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
      await readFile(path.join(cacheDir, MANIFEST), 'utf8'),
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
    return await readFile(path.join(cacheDir, SHEET), 'utf8');
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

/**
 * Compile the stylesheet without writing it, so a test can assert the
 * declarations the build produces.
 *
 * @param {object} [options]
 * @param {string} [options.cacheDir] where the entries and the sheet are kept.
 * @param {(report: {hits: number, misses: number, reused: boolean}) => void}
 *   [options.onCacheReport] called once per build: how many modules were
 *   served from the cache and how many were read, and whether the sheet was
 *   reused or compiled.
 */
export async function buildAstryxTailwindCss({
  cacheDir = CACHE_DIR,
  onCacheReport,
} = {}) {
  const inputCss = await readFile(INPUT, 'utf8');
  const previous = await readManifest(cacheDir);
  const {entries, hits, misses} = await fingerprintModules(
    await scannedModules(inputCss),
    previous?.modules ?? {},
  );
  const key = await sheetKey(entries, inputCss);

  const cached = await readCachedSheet(cacheDir, key);
  let css = cached;
  if (css == null) {
    const result = await postcss([tailwind(), intoLayer]).process(inputCss, {
      from: INPUT,
    });
    css = `${BANNER}\n${GENERATED}\n\n${result.css}`;
    await writeCache(cacheDir, SHEET, css);
  }
  // A stamp moves without a content change, on a checkout or a formatter run.
  // The entries are therefore rewritten whenever a module was read again, or
  // the next build would read that module again for nothing.
  if (cached == null || misses > 0) {
    await writeCache(
      cacheDir,
      MANIFEST,
      JSON.stringify({key, modules: entries}),
    );
  }

  onCacheReport?.({hits, misses, reused: cached != null});
  return css;
}

/** `3 hits`, `1 hit`: the count a reader sees, spelled for its number. */
function count(number, one, many) {
  return `${number} ${number === 1 ? one : many}`;
}

const isEntryPoint =
  process.argv[1] != null &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isEntryPoint) {
  const css = await buildAstryxTailwindCss({
    onCacheReport: ({hits, misses, reused}) =>
      console.log(
        `Cache: ${count(hits, 'hit', 'hits')}, ${count(
          misses,
          'miss',
          'misses',
        )}, ${reused ? 'reused' : 'rebuilt'} the sheet`,
      ),
  });
  await mkdir(path.dirname(OUTPUT), {recursive: true});
  await writeFile(OUTPUT, css);
  const kilobytes = (Buffer.byteLength(css) / 1024).toFixed(1);
  console.log(`Wrote ${path.relative(ROOT, OUTPUT)} (${kilobytes} kB)`);
}
