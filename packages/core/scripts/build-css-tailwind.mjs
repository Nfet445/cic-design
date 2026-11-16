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
const LAYER = 'astryx-base';

const BANNER =
  '/* Astryx Core Pre-compiled Tailwind CSS — layout primitives */';

/**
 * Move every rule Tailwind printed into the `astryx-base` layer, leaving the
 * layer statement that fixes the cascade order in place.
 */
const intoLayer = {
  postcssPlugin: 'astryx-wrap-utilities-in-layer',
  Once(root) {
    const layer = postcss.atRule({name: 'layer', params: LAYER});
    for (const node of [...root.nodes]) {
      if (node.type === 'atrule' && node.name === 'layer' && node.nodes == null) {
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
 * Compile the stylesheet without writing it, so a test can assert the
 * declarations the build produces.
 */
export async function buildAstryxTailwindCss() {
  const result = await postcss([tailwind(), intoLayer]).process(
    await readFile(INPUT, 'utf8'),
    {from: INPUT},
  );

  return `${BANNER}\n/* Auto-generated. Do not edit manually. */\n\n${result.css}`;
}

const isEntryPoint =
  process.argv[1] != null &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isEntryPoint) {
  const css = await buildAstryxTailwindCss();
  await writeFile(OUTPUT, css);
  const kilobytes = (Buffer.byteLength(css) / 1024).toFixed(1);
  console.log(`Wrote ${path.relative(ROOT, OUTPUT)} (${kilobytes} kB)`);
}
