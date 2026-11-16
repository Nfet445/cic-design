// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Compile the Tailwind utilities that migrated components use into
 * `packages/core/dist/astryx-tailwind.css`.
 *
 * The input stylesheet registers the Astryx cascade layers, imports the
 * Tailwind utilities layer as `astryx-base`, and scans the component
 * directories it lists. Output is the library's prebuilt stylesheet for
 * components whose own styles are Tailwind classes — the counterpart of
 * `scripts/build-css.mjs` for StyleX components.
 *
 * SYNC: tailwind/astryx.input.css names the scanned sources.
 */

import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import tailwind from '@tailwindcss/postcss';
import postcss from 'postcss';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INPUT = path.resolve(ROOT, 'tailwind/astryx.input.css');
const OUTPUT = path.resolve(ROOT, 'dist/astryx-tailwind.css');

const BANNER =
  '/* Astryx Core Pre-compiled Tailwind CSS — layout primitives */';
const result = await postcss([tailwind()]).process(
  await readFile(INPUT, 'utf8'),
  {from: INPUT},
);

const css = `${BANNER}\n/* Auto-generated. Do not edit manually. */\n\n${result.css}`;
await writeFile(OUTPUT, css);

const kilobytes = (Buffer.byteLength(css) / 1024).toFixed(1);
console.log(`Wrote ${path.relative(ROOT, OUTPUT)} (${kilobytes} kB)`);
