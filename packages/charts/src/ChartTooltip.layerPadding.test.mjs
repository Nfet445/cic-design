// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChartTooltip.layerPadding.test.mjs
 * @input The Layer host's reset source, and the tooltip card's class map
 * @output Verifies the card's class map pads every side the Layer host resets,
 *   so the card keeps its padding when the host's own stylesheet loads after
 *   the charts one
 * @position Regression test for the published charts stylesheet
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHARTS_ROOT = path.resolve(__dirname, '..');
const LAYER_SOURCE = path.resolve(
  CHARTS_ROOT,
  '../core/src/Layer/useLayer.tsx',
);
const CARD_CLASSES = path.join(__dirname, 'chartTooltipClasses.ts');

/** `paddingBlockStart` → `padding-block-start`. */
function kebabCase(property) {
  return property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
}

/** The class spelling the card map must carry for a reset longhand. */
function spellings(property) {
  const utility = {
    'padding-inline-start': 'ps-',
    'padding-inline-end': 'pe-',
  }[property];
  return utility == null ? [`[${property}:`] : [utility, `[${property}:`];
}

describe('ChartTooltip card padding', () => {
  it('pads the card on every side the Layer host resets', async () => {
    const [layerSource, cardClasses] = await Promise.all([
      fs.readFile(LAYER_SOURCE, 'utf8'),
      fs.readFile(CARD_CLASSES, 'utf8'),
    ]);

    const resets = [
      ...layerSource.matchAll(/^\s*(padding[A-Za-z]*):\s*'?0'?,?$/gm),
    ].map(([, property]) => kebabCase(property));
    expect(resets.length).toBeGreaterThan(0);

    // The card is a layer host, whose own stylesheet zeroes its padding. Both
    // stylesheets use the same class-level specificity, so the card names each
    // longhand itself: whichever sheet the page loads last, the card padding
    // still applies. A shorthand would leave the reset's longhand winning.
    // An inline side takes Tailwind's logical utility, a block side the
    // arbitrary longhand.
    for (const property of resets) {
      const found = spellings(property);
      expect(
        found.some(spelling => cardClasses.includes(spelling)),
        `card sets ${property}, which the Layer host resets, as ${found.join(
          ' or ',
        )}`,
      ).toBe(true);
    }
  });
});
