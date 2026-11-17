// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file radialChartClasses.ts
 * @input Accepts nothing: every class is fixed
 * @output The width class the chart container always carries and the touch
 *   class an interactive chart adds
 * @position Style primitives; the Tailwind build scans it for class names
 */

import {tw} from '../tw';

/** The chart fills its column; the svg is sized from the measured width. */
export const radialChartClassName = tw('w-full');

/**
 * Drag-to-filter marks need the browser's pan gestures off the plot, so a
 * touch drag rotates or selects instead of scrolling the page.
 */
export const radialChartInteractiveClassName = tw(
  radialChartClassName,
  'touch-none',
);
