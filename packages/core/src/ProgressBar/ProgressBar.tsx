// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ProgressBar.tsx
 * @input Uses React, useId, stylex, progressBarClasses, ProgressBarTouch and
 *   resolveMotion
 * @output Exports ProgressBar component, ProgressBarProps, ProgressBarVariant types
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/ProgressBar/ProgressBar.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/ProgressBar/ProgressBar.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/ProgressBar/ProgressBarMarkTooltip.tsx (the lazy Tooltip wrapper for labeled marks)
 * - /packages/core/src/ProgressBar/index.ts (exports if types change)
 * - /apps/storybook/stories/ProgressBar.stories.tsx (storybook stories)
 * - /packages/cli/assets/templates/blocks/components/ProgressBar/ (showcase blocks)
 */

import {lazy, Suspense, useId, type CSSProperties} from 'react';
import * as stylex from '@stylexjs/stylex';

import {mergeProps} from '../utils';
import {tw} from '../utils/tw';
import {focusOutlineStyles} from '../utils/focusOutline.stylex';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';
import {VisuallyHidden} from '../VisuallyHidden';
import type {ProgressBarVariantMap} from './index';
import {useProgressBarTouch} from './ProgressBarTouch';
import {
  progressBarClassName,
  progressBarHeaderClassName,
  progressBarIndeterminateFillClassName,
  progressBarLabelClassName,
  progressBarLabelDisabledClassName,
  progressBarLabelHiddenClassName,
  progressBarMarkClassName,
  progressBarMarkOnFillClassName,
  progressBarMarkOnTrackClassName,
  progressBarTrackClassName,
  progressBarTrackContainerClassName,
  progressBarValueLabelClassName,
  progressBarValueLabelDisabledClassName,
  progressBarVariantClassName,
} from './progressBarClasses';
import {progressBarFillStyles} from './progressBarFill.stylex';
import {formatMotionRoleValue} from '../motion/roles';
import {resolveMotion} from '../motion/resolveMotion';
import {progressBar} from '../motion/uikit/progressBar';
import {timing} from '../motion/uikit/timing';

// Every mark is wrapped in a Tooltip (marks always carry a label), so load it
// lazily: a ProgressBar with no marks never bundles the Tooltip chunk. While it
// loads, the Suspense fallback shows the bare mark, so nothing disappears; the
// tooltip simply attaches once the chunk is ready.
const LazyProgressBarMarkTooltip = lazy(
  async () => import('./ProgressBarMarkTooltip'),
);

/**
 * Progress bar variant type — maps to semantic color tokens.
 * Extensible via module augmentation of ProgressBarVariantMap.
 */
export type ProgressBarVariant = keyof ProgressBarVariantMap;

/**
 * A fixed target mark drawn on the progress track.
 *
 * Positioned by `value` in the same `0..max` scale as the bar's `value` prop —
 * mirroring the object shape of Slider's `marks` so the two APIs stay
 * consistent.
 */
export interface ProgressBarMark {
  /**
   * Position of the mark in the same `0..max` scale as `value`. Values
   * outside the range are clamped to the track edges.
   */
  value: number;
  /**
   * Names the mark. A mark stands for something meaningful on the track — a
   * goal, a threshold, a quarter target — so a label is required: it is the
   * mark's accessible name and the text revealed in a `Tooltip` on hover and
   * keyboard focus. Can be the value itself (e.g. `'70%'`) or something richer
   * (e.g. `'Q1 target: 50%'`).
   */
  label: string;
}

export interface ProgressBarProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Current value of the progress bar.
   * Ignored when `isIndeterminate` is true.
   */
  value?: number;
  /**
   * Maximum value of the progress bar.
   * @default 100
   */
  max?: number;
  /**
   * Accessible label for the progress bar. Required for a11y.
   * Shown visually above the bar unless `isLabelHidden` is true.
   */
  label: string;
  /**
   * When true, the label is visually hidden but remains accessible to screen readers.
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * When true, displays the formatted value (e.g. "75%") next to the label.
   * Ignored when `isIndeterminate` is true.
   * @default false
   */
  hasValueLabel?: boolean;
  /**
   * Custom formatter for the value label.
   * @default (value, max) => `${Math.round((value / max) * 100)}%`
   */
  formatValueLabel?: (value: number, max: number) => string;
  /**
   * Visual style variant mapped to semantic color tokens.
   * @default 'accent'
   */
  variant?: ProgressBarVariant;
  /**
   * When true, renders an animated indeterminate progress indicator.
   * Use when the progress amount is unknown (e.g. loading, processing).
   * The `value` and `hasValueLabel` props are ignored in this mode.
   * Under reduced motion it pulses in place instead of sliding.
   * @default false
   */
  isIndeterminate?: boolean;
  /**
   * Target marks drawn on the track at fixed points in the same `0..max`
   * scale as `value` — e.g. a goal line. Marks stay visible whether progress
   * is below or past them, and take their color from what they sit on: a mark
   * inside the filled area uses the fill variant's on-color (on-accent,
   * on-warning, on-error, …), while a mark still out on the bare track uses
   * `--color-text-primary` (`--color-text-secondary` on a disabled bar, which
   * dims everything it draws). Each mark's required `label` names it for
   * assistive tech and is revealed via a `Tooltip` on hover/focus. Ignored when
   * `isIndeterminate` is true.
   */
  marks?: ReadonlyArray<ProgressBarMark>;
  /**
   * When true, the progress bar is visually disabled — the fill bar and
   * text use disabled colors. Use for canceled or inactive operations.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Test ID for testing utilities.
   */
  'data-testid'?: string;
}

// The reduced-motion pulse's variables, from the progress table.
type PulseStyle = CSSProperties &
  Record<
    | '--_progress-bar-pulse'
    | '--_progress-bar-pulse-curve'
    | '--_progress-bar-pulse-floor',
    string
  >;

// `CSSProperties` has no index signature for custom properties, so the fill's
// inline style — which publishes the filled share as the private
// `--_progress-bar-fill` — needs this augmentation to typecheck.
type FillStyle = CSSProperties &
  Record<
    | '--_progress-bar-fill'
    | '--_progress-bar-move'
    | '--_progress-bar-curve'
    | '--_progress-bar-flip'
    | '--_progress-bar-min',
    string
  >;

/**
 * The reduced-motion pulse plays the `progress.reducedMotionPulseMs` role on
 * the `timing.curves.move` curve, down to the progress table's floor.
 */
function pulseStyle(element: Element | null): PulseStyle {
  const pulseMs = resolveMotion(element, progressBar, 'reducedMotionPulseMs');
  const curve = resolveMotion(element, timing.curves.move);
  return {
    '--_progress-bar-pulse': `${pulseMs}ms`,
    '--_progress-bar-pulse-curve': formatMotionRoleValue('curve', curve),
    '--_progress-bar-pulse-floor': String(progressBar.reducedMotionPulseFloor),
  };
}

function defaultFormatValueLabel(value: number, max: number): string {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return `${pct}%`;
}

/**
 * A progress bar for displaying determinate or indeterminate progress.
 *
 * In determinate mode, displays a known value within a range (upload progress,
 * disk usage, etc). In indeterminate mode, shows an animated loading indicator
 * for unknown progress.
 *
 * ProgressBar is intentionally minimal — compose additional labels, status
 * icons, and descriptions alongside the bar using layout components rather
 * than adding props to ProgressBar itself. The exception is on-track content
 * like `marks`, which are positioned by value over the track.
 *
 * Styles use Astryx theme tokens via StyleX.
 * Wrap your app in <Theme> to apply a theme.
 *
 * @example
 * ```
 * <ProgressBar value={75} label="Upload progress" />
 * <ProgressBar isIndeterminate label="Loading..." />
 * <ProgressBar value={3.2} max={5} label="Disk usage" hasValueLabel
 *   formatValueLabel={(v, m) => `${v} GB / ${m} GB`} />
 * <ProgressBar value={30} label="Canceled" isDisabled hasValueLabel />
 * <ProgressBar value={45} label="Fundraiser" marks={[{value: 80, label: 'Goal'}]} />
 * ```
 *
 * A mark's height, width, and color are directly themeable via the
 * `progress-bar-mark` target. The target reflects `data-placement`
 * (`"fill"` when the mark sits inside the filled area, `"track"` when it is
 * still out on the bare track) and `data-variant` (the fill's variant), so a
 * theme can style the two cases separately — e.g. a taller "goal flag" tick
 * that overhangs the bar (centered, so the overhang is symmetric):
 *
 * @example
 * ```
 * defineTheme({
 *   name: 'campaign',
 *   components: {
 *     'progress-bar-mark': {base: {height: '16px', backgroundColor: 'red'}},
 *   },
 * });
 * ```
 */
export function ProgressBar({
  value = 0,
  max = 100,
  label,
  isLabelHidden = false,
  hasValueLabel = false,
  formatValueLabel = defaultFormatValueLabel,
  variant = 'accent',
  isIndeterminate = false,
  isDisabled = false,
  marks,
  xstyle,
  className,
  style,
  'data-testid': dataTestId,
  ref,
  ...rest
}: ProgressBarProps) {
  const labelId = useId();
  // A non-finite value or max (e.g. a NaN from an upstream `loaded / total`
  // with total 0) would otherwise leak into aria-valuenow, the value label,
  // and the fill width as the string "NaN". Treat it as empty progress,
  // matching the max=0 handling below.
  const safeValue = Number.isFinite(value) ? value : 0;
  const safeMax = Number.isFinite(max) ? max : 0;
  const clampedValue = Math.min(Math.max(0, safeValue), safeMax);
  const percentage = safeMax > 0 ? (clampedValue / safeMax) * 100 : 0;
  const valueText = formatValueLabel(clampedValue, safeMax);

  const showValueLabel = hasValueLabel && !isIndeterminate;

  const fillVariant = isDisabled ? 'disabled' : variant;
  // Under a finger the fill moves as UIProgressView's does and draws at least
  // 16px; what that needs from script is the touch layer's (ProgressBarTouch).
  const touch = useProgressBarTouch(
    percentage,
    !isIndeterminate && (marks?.length ?? 0) > 0,
  );
  const fillStyle: FillStyle = {
    '--_progress-bar-fill': `${percentage}%`,
    ...touch.fillVars,
  };

  // Marks make no sense without a determinate value, so they are only drawn
  // in determinate mode. Non-finite mark values are dropped; the rest are
  // clamped to the track edges, matching the bar's own `clampedValue`.
  //
  // Each mark also records whether it lands on the filled part of the bar
  // (`isOnFill`), which decides its color: a mark inside the fill reads against
  // the variant color, one out on the bare track reads against the track. A
  // mark exactly at the fill's leading edge counts as on the fill — it is the
  // "reached the target" moment — except at zero progress, where there is no
  // fill for it to sit on.
  const resolvedMarks =
    !isIndeterminate && marks
      ? marks
          .filter(mark => Number.isFinite(mark.value))
          .map(mark => {
            const clamped = Math.min(Math.max(0, mark.value), safeMax);
            const pct = safeMax > 0 ? (clamped / safeMax) * 100 : 0;
            return {
              value: mark.value,
              label: mark.label,
              pct,
              isOnFill: percentage > 0 && pct <= touch.drawnPercentage,
            };
          })
      : [];

  return (
    <div
      ref={ref}
      {...mergeProps(
        mergeProps(themeProps('progress-bar', {variant}), {
          className: progressBarClassName,
        }),
        stylex.props(xstyle),
        className,
        style,
      )}
      data-testid={dataTestId}
      {...rest}>
      {/* Label row */}
      {!isLabelHidden || showValueLabel ? (
        <div className={progressBarHeaderClassName}>
          <span
            id={labelId}
            className={tw(
              progressBarLabelClassName,
              isLabelHidden && progressBarLabelHiddenClassName,
              isDisabled && progressBarLabelDisabledClassName,
            )}>
            {label}
          </span>
          {showValueLabel && (
            <span
              className={tw(
                progressBarValueLabelClassName,
                isDisabled && progressBarValueLabelDisabledClassName,
              )}>
              {valueText}
            </span>
          )}
        </div>
      ) : (
        <VisuallyHidden id={labelId}>{label}</VisuallyHidden>
      )}

      <div className={progressBarTrackContainerClassName}>
        <div
          role="progressbar"
          aria-valuenow={isIndeterminate ? undefined : clampedValue}
          aria-valuemin={isIndeterminate ? undefined : 0}
          aria-valuemax={isIndeterminate ? undefined : safeMax}
          aria-labelledby={labelId}
          aria-valuetext={isIndeterminate ? undefined : valueText}
          ref={touch.trackRef}
          {...mergeProps(themeProps('progress-bar-track'), {
            className: progressBarTrackClassName,
          })}>
          {isIndeterminate ? (
            <div
              {...mergeProps(
                themeProps('progress-bar-fill', {variant: fillVariant}),
                {
                  className: tw(
                    progressBarIndeterminateFillClassName,
                    progressBarVariantClassName[fillVariant],
                  ),
                  style: pulseStyle(null),
                },
              )}
            />
          ) : (
            <div
              {...mergeProps(
                mergeProps(
                  themeProps('progress-bar-fill', {variant: fillVariant}),
                  {className: progressBarVariantClassName[fillVariant]},
                ),
                stylex.props(
                  progressBarFillStyles.fill,
                  percentage === 0 && progressBarFillStyles.fillEmpty,
                ),
                fillStyle,
              )}
            />
          )}
        </div>
        {/* Marks overlay the fill but live outside the semantic progressbar.
          Their Tooltip descriptions remain independently reachable on focus. */}
        {resolvedMarks.map(mark => {
          // The tick element. It is both the Tooltip's anchor and the Suspense
          // fallback shown while the lazy Tooltip chunk loads, so the tick is
          // always visible and the tooltip attaches once ready. The list `key`
          // lives on the mapped <Suspense>, not here.
          //
          // `placement` is reflected as `data-placement` (and a class) so a
          // theme can style the two cases separately on the
          // `progress-bar-mark` target; `variant` mirrors the fill's variant
          // for the same reason.
          const markEl = (
            <span
              role="img"
              aria-label={mark.label}
              tabIndex={0}
              {...mergeProps(
                themeProps('progress-bar-mark', {
                  variant: fillVariant,
                  placement: mark.isOnFill ? 'fill' : 'track',
                }),
                stylex.props(focusOutlineStyles.focusVisible),
                tw(
                  progressBarMarkClassName,
                  mark.isOnFill
                    ? progressBarMarkOnFillClassName[fillVariant]
                    : isDisabled
                      ? progressBarMarkOnTrackClassName.trackDisabled
                      : progressBarMarkOnTrackClassName.track,
                ),
                {insetInlineStart: `${mark.pct}%`},
              )}
            />
          );
          return (
            <Suspense key={`${mark.value}:${mark.label}`} fallback={markEl}>
              <LazyProgressBarMarkTooltip content={mark.label}>
                {markEl}
              </LazyProgressBarMarkTooltip>
            </Suspense>
          );
        })}
      </div>
    </div>
  );
}

ProgressBar.displayName = 'ProgressBar';
