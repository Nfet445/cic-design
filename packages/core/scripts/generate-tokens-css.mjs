// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file generate-tokens-css.mjs
 * @input The `*Defaults` groups in `packages/core/src/theme/tokenVars.ts`.
 * @output `packages/core/src/theme/tokens.css`, the custom properties those
 *   defaults declare, and a build failure when the file has drifted.
 * @position packages/core/scripts; runs inside `build:css` before the sheets,
 *   and standalone with `--check` for the drift test.
 *
 * The defaults are the single source: a page that loads `astryx.css` gets these
 * declarations inside `@layer astryx-base`, and a page that loads only the
 * Tailwind sheet imports this file. Hand-editing `tokens.css` fails
 * `tokens.test.ts`, which regenerates it the same way.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CORE = path.resolve(HERE, '..');
const SOURCE = path.join(CORE, 'src/theme/tokenVars.ts');
const OUTPUT = path.join(CORE, 'src/theme/tokens.css');

/** The banner every generated sheet starts with. */
const BANNER = `/* Astryx token defaults — generated from packages/core/src/theme/tokenVars.ts */
/* Auto-generated. Do not edit manually. */
`;

/**
 * Read the default groups in declaration order.
 * @returns {{name: string, defaults: Record<string, string>}[]}
 */
export async function readTokenGroups() {
  const module = await import(SOURCE);
  return Object.entries(module)
    .filter(([name]) => name.endsWith('Defaults'))
    // A module namespace enumerates its exports alphabetically, so sorting here
    // keeps the file byte-identical whichever runtime imports it.
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([name, defaults]) => ({
      name: name.slice(0, -'Defaults'.length),
      defaults,
    }));
}

/**
 * Render the defaults as one `:root` rule.
 * @param groups - Groups from `readTokenGroups`.
 * @returns The stylesheet text.
 */
export function renderTokenCss(groups) {
  const declarations = groups
    .flatMap(group => Object.entries(group.defaults))
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');
  return `${BANNER}\n:root {\n${declarations}\n}\n`;
}

/** Regenerate the file, or with `--check`, fail when it is stale. */
async function main() {
  const check = process.argv.includes('--check');
  const groups = await readTokenGroups();
  const css = renderTokenCss(groups);
  const current = await fs
    .readFile(OUTPUT, 'utf8')
    .catch(() => '');
  if (check) {
    if (current !== css) {
      console.error(
        'packages/core/src/theme/tokens.css is stale — run `node packages/core/scripts/generate-tokens-css.mjs`.',
      );
      process.exit(1);
    }
    return;
  }
  await fs.writeFile(OUTPUT, css, 'utf8');
  const count = groups.reduce(
    (total, group) => total + Object.keys(group.defaults).length,
    0,
  );
  console.log(`tokens.css: ${count} declarations from ${groups.length} groups`);
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
