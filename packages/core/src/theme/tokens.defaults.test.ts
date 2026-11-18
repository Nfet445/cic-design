// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tokens.defaults.test.ts
 * @input The token defaults in `tokenVars.ts`, the generated `tokens.css`, and
 *   the built `dist/astryx.css` when a build has run.
 * @output A failing test when the stylesheet has drifted from the defaults, or
 *   when the built sheet stopped carrying them.
 * @position packages/core/src/theme/tokens.defaults.test.ts; the guard for the one
 *   declaration every other declaration depends on.
 *
 * The defaults used to reach `astryx.css` as StyleX `defineVars` output. They
 * now reach it as a generated stylesheet (spec:AST-119 FR4), so a lost
 * declaration fails here instead of rendering every `var(--token)` as zero.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';
import * as tokenVars from './tokenVars';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CORE = path.resolve(HERE, '../..');
const TOKENS_CSS = path.join(HERE, 'tokens.css');
const BUILT_CSS = path.join(CORE, 'dist/astryx.css');

/** The defaults, in the declaration order the generator writes them. */
function defaultGroups(): [string, Record<string, string>][] {
  return Object.entries(tokenVars).filter(([name]) =>
    name.endsWith('Defaults'),
  ) as [string, Record<string, string>][];
}

describe('token defaults', () => {
  it('generates tokens.css from the defaults', () => {
    const declarations = defaultGroups()
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .flatMap(([, defaults]) => Object.entries(defaults))
      .map(([name, value]) => `  ${name}: ${value};`)
      .join('\n');
    const css = fs.readFileSync(TOKENS_CSS, 'utf8');
    expect(css).toContain(declarations);
    expect(css.startsWith('/* Astryx token defaults')).toBe(true);
  });

  it('declares every default exactly once', () => {
    const css = fs.readFileSync(TOKENS_CSS, 'utf8');
    const declared = [...css.matchAll(/^\s{2}(--[A-Za-z0-9-]+):/gm)].map(
      match => match[1],
    );
    const expected = defaultGroups().flatMap(([, defaults]) =>
      Object.keys(defaults),
    );
    expect(declared.sort()).toEqual(expected.sort());
  });

  it('keeps each token reference spelled as its custom property', () => {
    expect(tokenVars.spacingVars['--spacing-2']).toBe('var(--spacing-2)');
    expect(tokenVars.colorVars['--color-accent']).toBe('var(--color-accent)');
    for (const [name, defaults] of defaultGroups()) {
      const vars = (tokenVars as Record<string, unknown>)[
        `${name.slice(0, -'Defaults'.length)}Vars`
      ] as Record<string, string>;
      expect(Object.keys(vars)).toEqual(Object.keys(defaults));
      for (const property of Object.keys(defaults)) {
        expect(vars[property]).toBe(`var(${property})`);
      }
    }
  });

  it.skipIf(!fs.existsSync(BUILT_CSS))(
    'carries every default in the built StyleX sheet',
    () => {
      const built = fs.readFileSync(BUILT_CSS, 'utf8');
      const missing = defaultGroups()
        .flatMap(([, defaults]) => Object.keys(defaults))
        .filter(property => !built.includes(`${property}:`));
      expect(missing).toEqual([]);
    },
  );
});
