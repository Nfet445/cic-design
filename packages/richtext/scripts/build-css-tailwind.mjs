// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file build-css-tailwind.mjs
 * @input The class maps the richtext components carry, and the Tailwind input
 *   stylesheet in `tailwind/richtext.input.css`
 * @output `dist/richtext-tailwind.css`, and its declaration beside it
 * @position `build:css` step, after the StyleX sheet; the counterpart of
 *   `scripts/build-css.mjs` for components whose own styles are Tailwind
 *   classes
 *
 * The build itself, its cache and the layer wrapping live in
 * `@astryxdesign/build`; this file names the package's paths.
 *
 * SYNC: tailwind/richtext.input.css names the scanned sources.
 */

import {copyFile, mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {buildTailwindStylesheet} from '../../build/src/tailwind-stylesheet.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INPUT = path.resolve(ROOT, 'tailwind/richtext.input.css');
const OUTPUT = path.resolve(ROOT, 'dist/richtext-tailwind.css');
const DECLARATION = path.resolve(ROOT, 'tailwind/richtext-tailwind.css.d.ts');
const BANNER =
  'Astryx Rich Text Pre-compiled Tailwind CSS — Lexical editor and viewer';

/** `3 hits`, `1 hit`: the count a reader sees, spelled for its number. */
function count(number, one, many) {
  return `${number} ${number === 1 ? one : many}`;
}

const css = await buildTailwindStylesheet({
  root: ROOT,
  input: INPUT,
  banner: BANNER,
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
// A consumer imports the built sheet, so its `types` condition names the
// declaration beside it; the authored file stays in `tailwind/`.
await copyFile(DECLARATION, `${OUTPUT}.d.ts`);

const kilobytes = (Buffer.byteLength(css) / 1024).toFixed(1);
console.log(`Wrote ${path.relative(ROOT, OUTPUT)} (${kilobytes} kB)`);
