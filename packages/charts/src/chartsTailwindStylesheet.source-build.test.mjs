// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file chartsTailwindStylesheet.source-build.test.mjs
 * @input Uses the shared Tailwind build, the charts class maps, and the
 *   stylesheet harness in `core/src/__tests__/classNameAssertions`
 * @output Verifies the shipped charts stylesheet declares what the components
 *   can emit: every class the maps produce has a rule, the sheet stays inside
 *   its size gate, and the rules sit behind a registered layer order
 * @position Cases for the declaration half of the styling contract (AST-119
 *   FR8, FR10); the components' own tests assert the class set
 */

import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {buildTailwindStylesheet} from '../../build/src/tailwind-stylesheet.mjs';
import {
  describeTailwindStylesheet,
  STYLEX_GZIP_BUDGETS,
} from '../../core/src/__tests__/classNameAssertions';
import {
  chartAreaClassName,
  chartContainerClassName,
  chartTitleClassName,
} from './chartClasses';
import {
  chartAxisLineClassName,
  chartAxisTickMarkClassName,
} from './chartAxisClasses';
import {chartGridLineClassName} from './chartGridClasses';
import {
  chartSwatchClassName,
  chartSwatchFillClassName,
  chartSwatchVariantClassName,
} from './chartSwatchClasses';
import {
  chartTooltipCardClassName,
  chartTooltipCrosshairClassName,
} from './chartTooltipClasses';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const sheet = await buildTailwindStylesheet({
  root: ROOT,
  input: path.resolve(ROOT, 'tailwind/charts.input.css'),
  banner:
    'Astryx Charts Pre-compiled Tailwind CSS — data visualization components',
});

/** Every class this package's maps can emit, one token each. */
function chartClassNames() {
  const names = new Set();
  const add = value => {
    for (const className of value.split(/\s+/)) {
      if (className !== '') {
        names.add(className);
      }
    }
  };
  for (const value of [
    chartContainerClassName,
    chartTitleClassName,
    chartAreaClassName,
    chartAxisLineClassName,
    chartAxisTickMarkClassName,
    chartGridLineClassName,
    chartSwatchClassName,
    ...Object.values(chartSwatchVariantClassName),
    chartSwatchFillClassName,
    chartTooltipCardClassName,
    chartTooltipCrosshairClassName,
  ]) {
    add(value);
  }
  return [...names];
}

// The StyleX sheet this package shipped at f35022021 gzipped to 686 B, which
// the 1.15x gate turns into 788 B. This package's Tailwind sheet gzips to
// 1153 B, because a Tailwind selector repeats the declaration value it
// escapes while a StyleX selector is a short hash, and a sheet this small has
// no shared prefix to amortise that. The constant is the measured deviation
// approved for ticket 29, not the StyleX baseline; the ticket records the
// numbers.
describeTailwindStylesheet({
  name: 'dist/charts-tailwind.css',
  css: sheet,
  classNames: chartClassNames(),
  budget: STYLEX_GZIP_BUDGETS.charts,
});
