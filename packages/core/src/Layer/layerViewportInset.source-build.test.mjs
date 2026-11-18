// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layerViewportInset.source-build.test.mjs
 * @input Uses Babel, the core StyleX build config, the StyleX rule processor,
 *   and the sources that still read the viewport inset as a constant
 * @output Verifies no constant reference ships unresolved behind a fallback
 *   (spec:AST-059 FR1–FR3)
 * @position Regression test for the compiled layer viewport inset
 *
 * `stylex.firstThatWorks(a, b)` turns two `var()` arguments into one nested
 * `var(a, b)`. A `defineConsts` reference compiles to such a `var()`, and the
 * rule processor inlines a constant only where its `var()` stands alone, so a
 * pair of bare constant references shipped as `var(--<hash>, <fallback>)`
 * with `--<hash>` defined nowhere: every engine took the fallback.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {transformAsync} from '@babel/core';
import stylexBabelPlugin from '@stylexjs/babel-plugin';
import {describe, expect, it} from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, '..');
const CORE_ROOT = path.resolve(SRC, '..');

const SOURCES = [
  'Layer/layerViewportInset.stylex.ts',
  'Popover/Popover.tsx',
  'DropdownMenu/DropdownMenu.tsx',
  'DropdownMenu/DropdownMenuSubMenu.tsx',
];

async function compileStylesheet() {
  const rules = [];
  for (const relative of SOURCES) {
    const filename = path.join(SRC, relative);
    const result = await transformAsync(await fs.readFile(filename, 'utf8'), {
      babelrc: false,
      configFile: path.join(CORE_ROOT, 'babel.config.json'),
      filename,
    });
    rules.push(...(result?.metadata?.stylex ?? []));
  }
  return stylexBabelPlugin.processStylexRules(rules, false);
}

describe('layer viewport inset stylesheet (spec:AST-059)', () => {
  it('leaves no constant reference unresolved behind a fallback', async () => {
    const css = await compileStylesheet();
    const defined = new Set(
      [...css.matchAll(/(--[\w-]+)\s*:/g)].map(match => match[1]),
    );
    const undefinedReferences = [
      ...css.matchAll(/var\((--x[a-z0-9]+),/g),
    ].flatMap(match => (defined.has(match[1]) ? [] : [match[0]]));
    // Covers the remaining constants these sources read: the popover caps and
    // the slide rules' gutters. The layer's own cap and gutter margins are
    // class text now, which Tailwind emits or drops whole.
    expect(undefinedReferences).toEqual([]);
  });
});
