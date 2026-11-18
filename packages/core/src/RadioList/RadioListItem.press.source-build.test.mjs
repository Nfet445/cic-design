// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file RadioListItem.press.source-build.test.mjs
 * @input Uses Babel, the StyleX plugin as the package stylesheet compiles it,
 *   the RadioListItem source, the row layer's owner module and the class the
 *   row's press paint spells
 * @output Verifies the shipped mouse press reaches the radio circle through an
 *   inherited custom property, with no `:has()` ancestor scan. Its press
 *   exempts the nested controls the row's container rule names
 * @position Regression test for the compiled CSS of the RadioListItem module
 *   and the class text of its row press paint
 *   (`rowPressPaintRadioRowClassName`)
 *
 * The circle's pressed layer once read the row through
 * `.layer:where(.row:active:not(:has(...)) *)`. That shape makes the browser
 * restyle everything under the row on every DOM change. The row now declares
 * the press's paint under a `:has()` on itself, and the layer reads it.
 */

import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {transformAsync} from '@babel/core';
import stylexBabelPlugin from '@stylexjs/babel-plugin';
import {describe, expect, it} from 'vitest';
import stylexResolution from '../../../../scripts/stylex-module-resolution.cjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Core declares the presets, so they resolve from here, not from the folder
// the tests run in.
const require = createRequire(import.meta.url);
// The press attribute's owner module writes the row layer.
const PRESS_OWNER = '../privateAttributes/press.stylex.ts';
// The row's press paint is a class, so its selector is the class text.
const {rowPressPaintRadioRowClassName} =
  await import('../privateAttributes/pressClasses.ts');
/** The class token that declares the paint, without the coarse-pointer arm. */
const PAINT_CLASS = rowPressPaintRadioRowClassName
  .split(/\s+/)
  .find(className => className.startsWith('[&:active'));
/** The same paint under a coarse primary pointer. */
const COARSE_PAINT_CLASS = rowPressPaintRadioRowClassName
  .split(/\s+/)
  .find(className => className.startsWith('pointer-coarse:'));

async function compiledCss(fileName) {
  const file = path.join(__dirname, fileName);
  const result = await transformAsync(await fs.readFile(file, 'utf8'), {
    babelrc: false,
    configFile: false,
    filename: file,
    presets: [
      [
        require.resolve('@babel/preset-typescript'),
        {isTSX: true, allExtensions: true},
      ],
      [require.resolve('@babel/preset-react'), {runtime: 'automatic'}],
    ],
    plugins: [
      [
        stylexBabelPlugin,
        {
          dev: false,
          runtimeInjection: false,
          genConditionalClasses: true,
          treeshakeCompensation: true,
          unstable_moduleResolution: stylexResolution.stylexModuleResolution,
        },
      ],
    ],
  });
  return stylexBabelPlugin.processStylexRules(
    result?.metadata?.stylex ?? [],
    false,
  );
}

/** Every selector in `css`, one per rule. */
function selectorsOf(css) {
  return [...css.matchAll(/([^{}]+)\{[^{}]*\}/g)].map(match => match[1].trim());
}

/** The parts of a selector list, split at the commas outside any brackets. */
function listParts(list) {
  const parts = [''];
  let depth = 0;
  for (const char of list) {
    if (char === ',' && depth === 0) {
      parts.push('');
      continue;
    }
    if (char === '(' || char === '[') {
      depth += 1;
    } else if (char === ')' || char === ']') {
      depth -= 1;
    }
    parts[parts.length - 1] += char;
  }
  return parts.map(part => part.replace(/\s+/g, ''));
}

describe('the shipped RadioListItem mouse press', () => {
  it('ships no :has() followed by a descendant *', async () => {
    const selectors = [
      ...selectorsOf(await compiledCss('RadioListItem.tsx')),
      ...selectorsOf(await compiledCss(PRESS_OWNER)),
    ];
    expect(
      selectors.filter(selector => /:has\([^{]*\)[^{,]* \*/.test(selector)),
    ).toEqual([]);
  });

  it('keeps the nested-control exclusion on the row itself, and leaves a press the controller paints to its image', () => {
    expect(PAINT_CLASS).toBeDefined();
    expect(PAINT_CLASS).toMatch(
      /:active:not\(\[data-astryx-press="on"\],\[data-astryx-press="fading"\]\):not\(:has\(button:/,
    );
    expect(PAINT_CLASS).not.toMatch(/ \*/);
    expect(PAINT_CLASS).toContain(
      ':[--_radio-row-press:var(--color-overlay-pressed)]',
    );
    // A finger presses nothing into the row; only the circle answers.
    expect(COARSE_PAINT_CLASS).toBeDefined();
    expect(COARSE_PAINT_CLASS).toContain(':[--_radio-row-press:transparent]');
  });

  it('exempts the nested controls the row’s container rule names, less read-only ones and the row’s own radio', async () => {
    const {INTERACTIVE_SELECTORS} =
      await import('../hooks/useClickableContainer.ts');
    const expected = INTERACTIVE_SELECTORS.split(',').map(control =>
      control === 'input'
        ? 'input:not([type="radio"],[aria-readonly="true"]):active'
        : `${control}:not([aria-readonly="true"]):active`,
    );
    const exempt = /:not\(:has\((.*?)\)\)\]:\[--_radio-row-press/.exec(
      PAINT_CLASS,
    )?.[1];
    if (exempt == null) {
      throw new Error('the row press class names no nested-control exclusion');
    }
    expect(listParts(exempt)).toEqual(listParts(expected.join(',')));
  });
});
