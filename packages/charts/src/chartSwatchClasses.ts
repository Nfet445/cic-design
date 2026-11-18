// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file chartSwatchClasses.ts
 * @input The swatch variant, and the caller's series colour
 * @output The utility class strings a legend or tooltip swatch carries
 * @position Style primitives; the Tailwind build scans it for class names
 *
 * The colour is a per-instance value no class can name: the element carries it
 * in `--astryx-chart-swatch-color`, and one class reads that variable, so a
 * series colour never lands in a style attribute a consumer cannot
 * override.
 */

import {tw} from './tw';
import type {ChartSwatchVariant} from './ChartSwatch';

export const chartSwatchClassName = 'flex-shrink-0';

export const chartSwatchVariantClassName: Record<ChartSwatchVariant, string> = {
  square: tw('h-2', 'w-2', 'rounded-[2px]', 'mx-1'),
  line: tw('h-[3px]', 'w-2.5', 'rounded-[1.5px]'),
};

export const chartSwatchFillClassName =
  '[background-color:var(--astryx-chart-swatch-color)]';

/** The variable the fill class reads on the swatch element. */
export const CHART_SWATCH_COLOR_VARIABLE = '--astryx-chart-swatch-color';
