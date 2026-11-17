// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file generate-tokens-css.mjs
 * @input The `*Defaults` groups in `packages/core/src/theme/tokenVars.ts` and
 *   `packages/core/src/theme/dataTokenVars.ts`.
 * @output `packages/core/src/theme/tokens.css` and
 *   `packages/core/src/theme/dataTokens.css`, the custom properties those
 *   defaults declare, and a build failure when a file has drifted.
 * @position packages/core/scripts; runs inside `build:css` before the sheets,
 *   and standalone with `--check` for the drift test.
 *
 * The defaults are the single source: a page that loads `astryx.css` gets these
 * declarations inside `@layer astryx-base`, and a page that loads only the
 * Tailwind sheet imports `tokens.css`. Hand-editing a sheet fails
 * `tokens.test.ts`, which regenerates it the same way.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CORE = path.resolve(HERE, '..');
const THEME = path.join(CORE, 'src/theme');

/**
 * The sheets this script writes, in write order. Each reads one module's
 * `*Defaults` exports and declares them in one `:root` rule.
 */
export const SHEETS = [
  {
    name: 'tokens.css',
    source: path.join(THEME, 'tokenVars.ts'),
    banner:
      'Astryx token defaults — generated from packages/core/src/theme/tokenVars.ts',
  },
  {
    name: 'dataTokens.css',
    source: path.join(THEME, 'dataTokenVars.ts'),
    banner:
      'Astryx data token defaults — generated from packages/core/src/theme/dataTokenVars.ts',
  },
];

/**
 * Read a module's default groups in declaration order.
 * @param source - The module that exports them.
 * @returns {{name: string, defaults: Record<string, string>}[]}
 */
export async function readTokenGroups(source = SHEETS[0].source) {
  const module = await import(source);
  return (
    Object.entries(module)
      .filter(([name]) => name.endsWith('Defaults'))
      // A module namespace enumerates its exports alphabetically, so sorting here
      // keeps the file byte-identical whichever runtime imports it.
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([name, defaults]) => ({
        name: name.slice(0, -'Defaults'.length),
        defaults,
      }))
  );
}

/**
 * Render the defaults as one `:root` rule.
 * @param groups - Groups from `readTokenGroups`.
 * @param banner - The generated-file banner the sheet starts with.
 * @returns The stylesheet text.
 */
export function renderTokenCss(groups, banner = `/* ${SHEETS[0].banner} */`) {
  const declarations = groups
    .flatMap(group => Object.entries(group.defaults))
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');
  return `${banner}
/* Auto-generated. Do not edit manually. */
\n:root {\n${declarations}\n}\n`;
}

/** Regenerate every sheet, or with `--check`, fail when one is stale. */
async function main() {
  const check = process.argv.includes('--check');
  for (const sheet of SHEETS) {
    const output = path.join(THEME, sheet.name);
    const groups = await readTokenGroups(sheet.source);
    const css = renderTokenCss(groups, `/* ${sheet.banner} */`);
    const current = await fs.readFile(output, 'utf8').catch(() => '');
    if (check) {
      if (current !== css) {
        console.error(
          `packages/core/src/theme/${sheet.name} is stale — run \`node packages/core/scripts/generate-tokens-css.mjs\`.`,
        );
        process.exitCode = 1;
      }
      continue;
    }
    await fs.writeFile(output, css, 'utf8');
    const count = groups.reduce(
      (total, group) => total + Object.keys(group.defaults).length,
      0,
    );
    console.log(
      `${sheet.name}: ${count} declarations from ${groups.length} groups`,
    );
  }
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
