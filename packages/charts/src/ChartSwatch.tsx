// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChartSwatch.tsx
 * @input Caller-owned CSS color and optional square or line shape
 * @output Color swatch primitive for legends, tooltips, and standalone use
 * @position Composable primitive — used by ChartLegend and ChartTooltip, or
 *           independently anywhere a series indicator is needed.
 *
 * @example
 * ```
 * <ChartSwatch color="#3b82f6" variant="square" />
 * <ChartSwatch color="#f59e0b" variant="line" />
 * ```
 */

import {memo, type CSSProperties} from 'react';
import {
  CHART_SWATCH_COLOR_VARIABLE,
  chartSwatchClassName,
  chartSwatchFillClassName,
  chartSwatchVariantClassName,
} from './chartSwatchClasses';
import {tw} from './tw';

/**
 * Visual variant — drives shape.
 * - `'square'` — square chip (bar series)
 * - `'line'` — short stroke (line, dot, area, and other non-bar series)
 */
export type ChartSwatchVariant = 'square' | 'line';

export interface ChartSwatchProps {
  /** Fill color — typically a series color token */
  color: string;
  /** Visual variant. Default: `'square'`. */
  variant?: ChartSwatchVariant;
}

/**
 * Color swatch primitive.
 *
 * Used by ChartLegend (and ChartTooltip) to render the colored
 * indicator next to a series label. Exported as a primitive so consumers
 * can build their own custom legend/tooltip layouts while keeping visuals
 * consistent.
 */
function ChartSwatchImpl({color, variant = 'square'}: ChartSwatchProps) {
  return (
    <div
      aria-hidden
      className={tw(
        chartSwatchClassName,
        chartSwatchVariantClassName[variant],
        chartSwatchFillClassName,
      )}
      // A series colour is data, not a token: the caller owns the value, so it
      // rides the variable the fill class reads.
      style={{[CHART_SWATCH_COLOR_VARIABLE]: color} as CSSProperties}
    />
  );
}

/**
 * Memoized — swatches are static for a given (color, variant) tuple
 * and can render many times in a tooltip/legend with several series.
 */
export const ChartSwatch = memo(ChartSwatchImpl);

/**
 * Map a SeriesDef.type string to its swatch variant.
 *
 * Bar series get a square chip; everything else (line, dot, area, and any
 * other non-bar mark) gets a short stroke. Centralized so legend, tooltip,
 * and any custom chrome stay consistent.
 */
export function swatchVariantForType(
  type: string | undefined,
): ChartSwatchVariant {
  return type === 'bar' ? 'square' : 'line';
}
