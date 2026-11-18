// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Step.tsx
 * @input Uses React, stylex, theme tokens (including the motion duration token
 *   the connector fill animates on), StepperContext, and per-step theme selector
 *   state
 * @output Exports Step component and StepProps
 * @position Individual step item; used inside Stepper
 *
 * Every connector this file draws — the separated progress bars and the
 * on-track segments alike — paints its accent fill as a scaled ::before rather
 * than by swapping a background color, so a step the flow advances into grows
 * its line along the track. See the CONNECTOR FILL block in the styles below
 * for the axis/RTL/reduced-motion rules that go with it.
 *
 * Exactly one change animates: advancing a single step. Going back, jumping
 * forward by more than one, and mounting mid-flow all land at once. The rule
 * and the reasoning behind it sit above the styles; the arithmetic that keeps
 * the one animated span reading as a single front — an on-track span is drawn
 * by two steps, three where a content slot splits it — is in the component.
 * Nothing about it is public API: Stepper hands each Step the step it came
 * from through context, and the rest is derived. In a compact horizontal
 * Stepper, each track node is presentational rather than clickable; navigation
 * moves to the named previous/next controls in the summary row. The on-track
 * layout keeps each indicator on the rail and does not repeat the active one
 * beside the summary label. Each public content slot stays mounted and is
 * hidden to preserve local state.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Stepper/Stepper.doc.mjs
 * - /packages/core/src/Stepper/Stepper.test.tsx
 * - /packages/core/src/Stepper/index.ts
 * - /apps/storybook/stories/Stepper.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/Stepper/ (showcase blocks)
 * - /packages/cli/assets/templates/blocks/components/Step/ (showcase blocks)
 */

import {useId, useLayoutEffect, type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import * as stylex from '@stylexjs/stylex';

import {
  colorVarNames,
  durationVarNames,
  spacingVarNames,
} from '../theme/tokenVars';
import {mergeProps, isRenderable, themeProps} from '../utils';
import {focusOutlineFocusVisibleClassName} from '../utils/focusOutlineClasses';
import {tw} from '../utils/tw';
import {
  buttonResetClassName,
  connectorEmptyHClassName,
  connectorEmptyVClassName,
  connectorFillHClassName,
  connectorFillVClassName,
  contentIndentClassName,
  contentIndentNoIndicatorClassName,
  densityBlockClassName,
  densityInlineClassName,
  descriptionClassName,
  descriptionRowClassName,
  descriptionRowWithIndicatorClassName,
  horizontalBarClassName,
  horizontalStepClassName,
  iconAccentClassName,
  iconClassName,
  iconDisabledClassName,
  iconErrorClassName,
  iconLabelRowClassName,
  iconNotStartedClassName,
  iconSuccessClassName,
  iconWarningClassName,
  labelClassName,
  labelDisabledClassName,
  labelInProgressClassName,
  labelNotStartedClassName,
  numberAccentClassName,
  numberBadgeClassName,
  numberDisabledClassName,
  numberErrorClassName,
  numberNotStartedClassName,
  numberOnAccentClassName,
  numberSuccessClassName,
  numberWarningClassName,
  optionalClassName,
  otBodyClassName,
  otColWrapClassName,
  otContentClassName,
  otContentIndentClassName,
  otContentIndentNoIndicatorClassName,
  otContentSegClassName,
  otContentWrapClassName,
  otHorizontalRootClassName,
  otIndicatorColClassName,
  otInteractiveClassName,
  otLabelRowCenterClassName,
  otLabelRowStartClassName,
  otLabelWrapHClassName,
  otMarginTopClassName,
  otPadBlockClassName,
  otRailBridgeClassName,
  otRowPadClassName,
  otRowWrapClassName,
  otSegBaseVClassName,
  otSegFlexVClassName,
  otSegGapLeadHClassName,
  otSegGapLeadVClassName,
  otSegGapRailHClassName,
  otSegGapRailVClassName,
  otSegHClassName,
  otSegHiddenIfFirstClassName,
  otSegHiddenIfLastClassName,
  otSegLeadVClassName,
  otTrackRowClassName,
  otVerticalRootClassName,
  stepContentClassName,
  stepItemClassName,
  stepVars,
  summaryRootClassName,
  verticalBarClassName,
  verticalBodyClassName,
  verticalRootClassName,
} from './stepClasses';
import {interactionOverlayStyles} from '../utils/interactionOverlay.stylex';
import {interactionOverlayBackgroundColorClassName} from '../utils/interactionOverlayClasses';
import {xstyleProps} from '../utils/xstyle';
import {usePressFeedback} from '../hooks/usePressFeedback';
import type {BaseProps} from '../BaseProps';
import {Icon} from '../Icon';
import {VisuallyHidden} from '../VisuallyHidden';
import {useStepperInternalContext} from './StepperContext';
import type {StepStatus} from './StepStatus';
import {
  registerEnglishFallback,
  useComponentTranslator,
} from '../i18n/useComponentTranslator';
import english from '../i18n/generated-english/Stepper/Step.generated';

registerEnglishFallback(english);

/** The inline density custom properties the step classes read. */
type StepStyle = React.CSSProperties &
  Partial<Record<(typeof stepVars)[keyof typeof stepVars], string>>;

const densityStyle = (block: string, inline: string): StepStyle => ({
  [stepVars.density]: block,
  [stepVars.densityInline]: inline,
});

/**
 * Built-in indicator presets. Anything other than these strings passed to
 * `indicator` is treated as a custom ReactNode (e.g. an `<Icon />`).
 * - 'auto': numbered badge for not-yet-reached steps, a check once completed
 *   (default)
 * - 'number': always a numbered badge
 * - 'none': no indicator — just the progress bar and label
 */
export type StepIndicatorPreset = 'auto' | 'number' | 'none';
export type StepDensity = 'compact' | 'balanced' | 'spacious';

export interface StepProps extends BaseProps<HTMLLIElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLLIElement>;
  /**
   * Zero-based index of this step. Used to derive progress (completed /
   * active / not-started) relative to the parent's `activeStep`.
   */
  step: number;
  /**
   * Step label text.
   */
  label: string;
  /**
   * Optional description shown below the label.
   */
  description?: string;
  /**
   * Content rendered below the label and description. Useful in vertical
   * steppers to show form fields or detailed content for each step. Compact
   * horizontal steppers hide it without unmounting it, preserving local state.
   */
  children?: ReactNode;

  /**
   * Semantic status for the step, mapped to the global Astryx semantic tokens
   * (`accent`, `success`, `warning`, `error`). In the default `auto` indicator
   * mode it sets both the indicator color and a matching glyph: `success` shows
   * a green check-circle, `warning`/`error` show the shared Input status icons.
   * `accent` is color-only. The current (in-progress) step always keeps its
   * current-step indicator regardless of `status`. Never recolors the
   * connector/track.
   *
   * Because the indicator glyphs are decorative (aria-hidden), the status also
   * reaches assistive technology as text: visually hidden "completed" /
   * "warning" / "error" next to the label, and composed into the accessible
   * name of clickable steps.
   */
  status?: StepStatus;
  /**
   * Disable interaction for this step.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Marks the step as optional, appending an "Optional" affordance after the
   * label.
   * @default false
   */
  isOptional?: boolean;
  /**
   * Trailing content rendered at the end of the label row (e.g. a timestamp
   * or status chip).
   */
  endContent?: ReactNode;
  /**
   * What to show as the step indicator. Accepts a preset string or any
   * ReactNode:
   * - 'auto': numbered badge until completed, then a check (default)
   * - 'number': always a numbered badge
   * - 'none': no indicator, just the bar + label
   * - ReactNode: any custom icon or element to render as the indicator
   * @default 'auto'
   */
  indicator?: StepIndicatorPreset | ReactNode;
  /**
   * Controls vertical padding of the step. Falls back to the stepper-level
   * density when unset.
   * - 'compact': minimal padding (4px block)
   * - 'balanced': default (8px block)
   * - 'spacious': generous (12px block, 12px inline)
   */
  density?: StepDensity;
}

// --- Default progress icons (16px) ---
//
// The `completed` progress state and the current-step ring are drawn as local
// <svg> glyphs rather than sourced from the Icon registry. This is a deliberate
// exception to the "glyphs come from the registry" convention (audit rule T17),
// for two reasons:
//
//  1. `CurrentIcon` (a dot inside a ring) has no registry equivalent — it is a
//     progress affordance, not a general-purpose icon.
//  2. `CheckCircleIcon` (a filled circle with a check) is intentionally NOT the
//     registry `success` glyph, even though the two look similar. They mean
//     different things and must stay independently restyleable: `completed`
//     marks *progress through the sequence* (every step you've passed), while
//     the semantic `success` status marks a step's *outcome*. A stepper can
//     show a completed step that also carries a `warning`/`error` status, so
//     collapsing the two glyphs would conflate progress with outcome. The
//     semantic `success`/`warning`/`error` STATUS glyphs DO defer to the themed
//     registry (see the status branch below), so those share one visual
//     language; only the progress marks are local.
//
// Both glyphs paint via `currentColor`, so the indicator's color is still
// controlled by tokens on the wrapper (never hardcoded), and the wrapper
// carries the `astryx-step-indicator` theme target.

/** Filled circle with a check — shown for a completed step in 'auto' mode. */
function CheckCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill="currentColor" />
      <path
        d="M4.75 8.25 7 10.5l4.25-4.5"
        stroke={colorVarNames['--color-background-surface']}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Filled dot in a ring — shown for the active step in 'auto' mode. */
function CurrentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" />
      <circle cx="8" cy="8" r="4" fill="currentColor" />
    </svg>
  );
}

// --- Styles ---

/**
 * How much of itself a connector gives up where it meets the indicator, read
 * from the public `--step-connector-gap` declared on the Stepper root.
 *
 * Clipped, not padded. The gap has to apply to two layers — the track, which is
 * the segment's own background, and the accent fill, which is an absolutely
 * placed `::before`. Spending it on each separately meant two declarations on
 * two boxes: a percentage then resolved against a different containing block
 * for each and stopped them ~1.2px apart. `clip-path` is ONE declaration on the
 * segment that clips the element and its pseudo-element together, against one
 * reference box — so every accepted value behaves the same way on both layers,
 * which is what a public input owes its full value domain.
 *
 * Clipping also cannot change layout: the segment keeps its box, so the node it
 * positions cannot move and the Stepper cannot grow. A raw `1rem` padding grew
 * a 180px stepper to 240px.
 *
 * Still clamped, because the value arrives with nothing in between to reject
 * it. Both halves earn their place, and not for the reasons padding needed:
 *
 * - `max(0px, …)` — `inset()` ACCEPTS a negative length. Chromium computes
 *   `inset(0 0 -4px 0)` as-is rather than dropping it, which is the opposite
 *   of padding (there CSS clamps a negative to `0` for you). This normalises
 *   it to `0` so a negative gap means "no gap" rather than a clip rect
 *   stretched outside the segment's own box.
 * - `min(…, --spacing-2)` — the flexible segment's own `min-height`, so an
 *   oversized gap leaves a short track rather than an unbounded one.
 *
 * The Stepper root explicitly inherits the property, so a horizontal Stepper
 * can receive a consumer value (or its 0px default) from the styled frame while
 * a theme can still set the property directly on the `stepper` target. The
 * use-site fallback supplies the same default to an unframed vertical Stepper.
 */
const CONNECTOR_GAP = `max(0px, min(var(--step-connector-gap, 0px), ${spacingVarNames['--spacing-2']}))`;

// --- Connector fill motion ---
//
// One change animates: advancing exactly one step. Going back, jumping
// forward by more than one, and mounting mid-flow all apply at once.
//
// Animating the others was tried and read worse than not animating them. A
// retreat is the clearest case: run forward, the transition ends with a bar
// that is nearly full, and nearly full is indistinguishable from full, so the
// eye calls it arrived well before it settles. Run backward, the same curve
// ends with a shrinking stub of accent still on the track, and a remnant that
// is still there reads unmistakably as not finished. Identical arithmetic in
// both directions — measurably so — and the backward one still feels slow,
// because the tail is what is visible rather than what is hidden. No easing
// fixes that; only not animating it does. A multi-step jump fails differently:
// it is a navigation rather than a progression, and sweeping a front across
// four segments makes the user sit through a journey they asked to skip.
//
// What is left is the one gesture where the movement carries the meaning: the
// flow went forward one step, and the line grows to show it. That span takes
// the medium band — a fill crossing a whole segment is a spatial change, not a
// micro-interaction, so per `astryx docs motion` it sits above the fast band
// reserved for high-frequency states like hover.
const FILL_SPAN_TIME = durationVarNames['--duration-medium'];

// Share of one node-to-node span owned by the segment *arriving* at the far
// node; the segment leaving the near node takes the rest. On-track spans are
// drawn by two steps (see the ON-TRACK section), and the time has to be split
// the way the length is or the two halves sweep at visibly different speeds.
//
// Horizontal: both halves are `flex: 1` inside equal-width steps, so an even
// split is the proportional one.
//
// Vertical: the halves are nothing like equal, and no constant can be right
// for all of them. The arriving half is otSegLeadV, a cap fixed at one density
// space; the leaving half is otSegFlexV, grown to whatever is left of the step
// row, so its length turns on label and description lengths this file cannot
// see. Measured in the browser the cap is 40% of a plain balanced span (8 of
// 20px) but 21% once the step carries a description (8 of 38px). 0.3 is the
// value that minimises the worse of those two: it leaves the cap ~1.6x off the
// rail's speed either way, where tuning to one case puts the other past 2x.
// Matching each case exactly would mean measuring the rendered rail, a layout
// read this system avoids.
// No motion: both halves of the timing are pinned to zero, so a segment that
// mounts already filled still lands in one frame.
const ZERO_FILL_TIMING: StepStyle = {
  [stepVars.fillDuration]: '0s',
  [stepVars.fillDelay]: '0s',
};

const OT_ARRIVAL_SHARE_H = 0.5;
const OT_ARRIVAL_SHARE_V = 0.3;
// A vertical step carrying a content slot draws a third segment down the side
// of it (otContentSegV) which continues the leaving half past the row, so the
// leaving half's time splits again. A slot runs several times the rail left
// above it — 34px of rail to 108px of slot in the spacious content story — and
// this is the middle of that range. Matching it exactly would mean measuring
// the rendered slot; the ordering is what keeps the front contiguous, and this
// keeps its speed in the right neighbourhood.
const OT_RAIL_SHARE_OF_LEAVING = 0.25;

/** Scale a CSS `<time>` by a unitless factor, collapsing the trivial cases. */
function fillTimeSlice(time: string, factor: number): string {
  if (factor <= 0) {
    return '0s';
  }
  if (factor === 1) {
    return time;
  }
  // Rounded because the factors are sums of shares, and float noise would
  // otherwise reach the emitted custom property as `calc(... * 0.7000000001)`.
  return `calc(${time} * ${Number(factor.toFixed(4))})`;
}

/**
 * An individual step within an Stepper. Renders a 4px progress-bar segment,
 * an indicator (numbered badge, check, or any custom icon), a label with
 * optional description, and an optional content slot.
 *
 * Progress (completed / active / not-started) is derived from the parent's
 * `activeStep` and this step's `step` prop. The optional `status` prop layers a
 * semantic meaning on top: in the default `auto` indicator mode it recolors the
 * indicator and swaps in a matching glyph (`success` → green check-circle,
 * `warning`/`error` → the shared Input status icons). The current step always
 * keeps its current-step ring. `status` never recolors the connector/track.
 *
 * @example
 * ```
 * <Step step={0} label="Account details" description="Enter your email" />
 * ```
 *
 * @example
 * ```
 * <Step step={1} label="Payment" status="error" />
 * ```
 */
export function Step({
  step,
  label,
  description,
  children,
  status,
  isDisabled = false,
  isOptional = false,
  endContent,
  indicator: indicatorProp,
  density: densityProp,
  xstyle,
  className,
  style,
  ref,
  'data-testid': dataTestId,
  ...rest
}: StepProps) {
  const pressable = usePressFeedback();
  const t = useComponentTranslator();
  const ctx = useStepperInternalContext();
  const {
    activeStep,
    previousActiveStep,
    orientation,
    onStepClick,
    density: ctxDensity,
    indicatorPosition,
    registerStep,
    isCompact,
    summarySlot,
  } = ctx;

  // Register this step index with the parent Stepper, which uses the tally to
  // warn about duplicate indices and work out how much width each step gets.
  // The optional getter keeps disabled state owned by this Step while compact
  // navigation can read its latest registration.
  //
  // A layout effect, not an effect: the width each step has is the stepper's
  // width divided by this count, so a stepper narrow enough to collapse can
  // only know it once every step is counted. Running after paint would show
  // the full stepper for a frame and then snap it shut.
  useLayoutEffect(
    () => registerStep(step, {getIsDisabled: () => isDisabled}),
    [registerStep, step, isDisabled],
  );

  const density = densityProp ?? ctxDensity;
  // Inline padding of a separated step's hover target. Density varies the block
  // padding freely, but the inline value has to be readable from out here: the
  // content slot renders outside that target and re-applies it to stay aligned
  // (see contentIndent), so keeping it in one place is what stops the two
  // drifting apart.
  const separatedDensityInline =
    density === 'spacious'
      ? spacingVarNames['--spacing-3']
      : spacingVarNames['--spacing-2'];
  // Block padding of a step, and the space the on-track rail bridges.
  const densitySpace =
    density === 'compact'
      ? spacingVarNames['--spacing-1']
      : density === 'spacious'
        ? spacingVarNames['--spacing-3']
        : spacingVarNames['--spacing-2'];

  // Resolve indicator prop — may be a preset string or a custom ReactNode.
  const isCustomIndicator =
    indicatorProp != null && typeof indicatorProp !== 'string';
  const indicator: StepIndicatorPreset = isCustomIndicator
    ? 'auto'
    : ((indicatorProp as StepIndicatorPreset | undefined) ?? 'auto');

  // Internal progress, derived from the parent's activeStep. This is NOT the
  // public `status` prop — `status` controls semantic color only.
  const progress: 'completed' | 'in-progress' | 'not-started' =
    step === activeStep
      ? 'in-progress'
      : step < activeStep
        ? 'completed'
        : 'not-started';

  const isVertical = orientation === 'vertical';
  const isActive = progress === 'in-progress';
  // A compact horizontal stepper moves navigation to the named controls in its
  // summary row. Its track — including the on-track indicators — stays purely
  // presentational so it does not expose a second, denser set of click targets.
  const hasButton = onStepClick != null && !isCompact;
  // A disabled step keeps its button, focusable and aria-disabled, so it
  // keeps its tab stop, is announced as unavailable, and keeps focus when it
  // becomes disabled while focused (`spec:AST-085` FR1, FR4, FR5); only
  // activation is withheld.
  const isClickable = hasButton && !isDisabled;

  const handleClick = () => {
    if (isClickable && onStepClick) {
      onStepClick(step);
    }
  };

  // Bar fill is purely progress-based. `status` never recolors the bar — it
  // only recolors the indicator (icon / number badge) below.
  const isBarFilled = progress === 'completed' || progress === 'in-progress';

  // --- This step's slice of the animated span ---
  // Both layouts are measured in the same unit, the node-to-node span: on-track
  // span k runs from node k to node k+1, and a separated step's lone bar is the
  // span arriving at it (bar s fills on exactly the condition span s-1 does).
  // So one rule serves both, and neither needs to know the step count.
  //
  // Only a single forward step animates, and the span it crosses is the one
  // leaving the step the flow came from. Every other segment — the untouched
  // ones, and every segment of a jump or a retreat — is handed a zero
  // duration, so it lands at once and carries no stale delay into a later
  // change.
  const isSingleAdvance = activeStep === previousActiveStep + 1;
  const animatedSpan = previousActiveStep;

  /**
   * Timing for the segment covering `[offset, offset + share)` of span
   * `spanIndex`, both expressed as fractions of that span.
   */
  const fillTiming = (
    spanIndex: number,
    offset: number,
    share: number,
  ): StepStyle => {
    if (!isSingleAdvance || spanIndex !== animatedSpan) {
      return ZERO_FILL_TIMING;
    }
    return {
      [stepVars.fillDuration]: fillTimeSlice(FILL_SPAN_TIME, share),
      [stepVars.fillDelay]: fillTimeSlice(FILL_SPAN_TIME, offset),
    };
  };

  // A separated step draws the whole span arriving at it, so it fills for the
  // span's entire slice with nothing to sequence against.
  const barTiming = fillTiming(step - 1, 0, 1);

  // --- Build indicator node ---
  // 'auto': number for not-started, check/dot icon once reached
  // 'number': always number badge
  // 'none': nothing
  // custom ReactNode (or `icon` prop): render as-is
  let indicatorNode: ReactNode = null;

  const customIcon = isCustomIndicator ? indicatorProp : null;

  // Semantic `status` drives a distinct indicator glyph (default 'auto' mode,
  // no custom icon), all sourced from the themed Icon registry so a step reads
  // the same as the rest of the system:
  //  - success → the themed `success` glyph (same check-circle as a completed
  //    step), tinted success — i.e. a green check
  //  - warning → the themed `warning` glyph
  //  - error   → the themed `error` glyph
  // The current (in-progress) step always shows the current-step ring — its
  // indicator "replaces" any status glyph. `accent` has no distinct glyph and
  // falls through to the progress-derived default.
  const statusGlyph: 'success' | 'warning' | 'error' | null =
    indicator === 'auto' &&
    customIcon == null &&
    !isActive &&
    (status === 'success' || status === 'warning' || status === 'error')
      ? status
      : null;

  if (indicator !== 'none') {
    const showNumber =
      customIcon == null &&
      statusGlyph == null &&
      (indicator === 'number' ||
        (indicator === 'auto' && progress === 'not-started'));

    if (showNumber) {
      // Status only fills the badge once the step is reached. A not-started
      // step stays neutral — otherwise `accent` (which has no glyph to swap in)
      // would paint an inverted accent badge on an upcoming step, making it
      // read as active/completed.
      const isReached = progress === 'completed' || progress === 'in-progress';
      const numberColorClassName = isDisabled
        ? numberDisabledClassName
        : isReached && status === 'accent'
          ? numberAccentClassName
          : isReached && status === 'success'
            ? numberSuccessClassName
            : isReached && status === 'warning'
              ? numberWarningClassName
              : isReached && status === 'error'
                ? numberErrorClassName
                : progress === 'completed'
                  ? numberOnAccentClassName
                  : progress === 'in-progress'
                    ? numberOnAccentClassName
                    : numberNotStartedClassName;

      indicatorNode = (
        <div
          aria-hidden="true"
          {...mergeProps(
            themeProps('step-indicator', {
              progress,
              status: status ?? undefined,
              disabled: isDisabled ? 'disabled' : null,
            }),
            tw(numberBadgeClassName, numberColorClassName),
          )}>
          {step + 1}
        </div>
      );
    } else {
      // Priority: explicit custom icon → status glyph (non-current steps) →
      // progress-derived default (check when completed, ring when current).
      const iconContent: ReactNode =
        customIcon != null ? (
          customIcon
        ) : statusGlyph === 'success' ? (
          <Icon
            icon="success"
            size="sm"
            color={isDisabled ? 'disabled' : 'success'}
          />
        ) : statusGlyph === 'warning' ? (
          <Icon
            icon="warning"
            size="sm"
            color={isDisabled ? 'disabled' : 'warning'}
          />
        ) : statusGlyph === 'error' ? (
          <Icon
            icon="error"
            size="sm"
            color={isDisabled ? 'disabled' : 'error'}
          />
        ) : progress === 'completed' ? (
          <CheckCircleIcon />
        ) : (
          <CurrentIcon />
        );

      // Wrapper tint drives the currentColor glyphs (check-circle / ring /
      // custom icon). The <Icon> status glyphs set their own color, but we tint
      // the wrapper to match so the indicator's color reflects `status` too.
      const iconColorClassName = isDisabled
        ? iconDisabledClassName
        : customIcon != null
          ? status === 'accent'
            ? iconAccentClassName
            : status === 'success'
              ? iconSuccessClassName
              : status === 'warning'
                ? iconWarningClassName
                : status === 'error'
                  ? iconErrorClassName
                  : progress === 'completed'
                    ? iconAccentClassName
                    : progress === 'in-progress'
                      ? iconAccentClassName
                      : iconNotStartedClassName
          : statusGlyph === 'success'
            ? iconSuccessClassName
            : statusGlyph === 'warning'
              ? iconWarningClassName
              : statusGlyph === 'error'
                ? iconErrorClassName
                : progress === 'completed'
                  ? iconAccentClassName
                  : progress === 'in-progress'
                    ? iconAccentClassName
                    : iconNotStartedClassName;

      indicatorNode = (
        <div
          aria-hidden="true"
          {...mergeProps(
            themeProps('step-indicator', {
              progress,
              status: status ?? undefined,
              disabled: isDisabled ? 'disabled' : null,
            }),
            tw(iconClassName, iconColorClassName),
          )}>
          {iconContent}
        </div>
      );
    }
  }

  // Every indicator glyph above is aria-hidden (pure decoration), so the
  // step's progress/status must also reach assistive tech as text
  // (WCAG 1.4.1 / 1.3.1). `error`/`warning` announce the semantic status;
  // `success` and a completed step both announce "completed". The current
  // step is announced via aria-current="step" instead, and not-started steps
  // stay silent (the default state needs no qualifier).
  const statusText: string | null =
    status === 'error'
      ? t('@astryx.step.status.error')
      : status === 'warning'
        ? t('@astryx.step.status.warning')
        : status === 'success' || progress === 'completed'
          ? t('@astryx.step.status.completed')
          : null;

  // Rendered next to the label: hidden text for static steps, and composed
  // into the button's accessible name for clickable ones (an aria-label on
  // the button would otherwise override the hidden text). Two separate keys
  // rather than string concatenation so translations control the joiner.
  const statusTextNode = isRenderable(statusText) ? (
    <VisuallyHidden>{statusText}</VisuallyHidden>
  ) : null;
  const stepAriaLabel =
    statusText != null
      ? t('@astryx.step.goToStepWithStatus', {
          stepNumber: step + 1,
          label,
          status: statusText,
        })
      : t('@astryx.step.goToStep', {stepNumber: step + 1, label});

  const hasIndicator = indicator !== 'none';

  const labelColorClassName = isDisabled
    ? labelDisabledClassName
    : progress === 'not-started'
      ? labelNotStartedClassName
      : isActive
        ? labelInProgressClassName
        : undefined;

  // Both text parts carry {progress, status}, the phase vocabulary of
  // `step-indicator` above. The indicator and the label each own disabled
  // paint, so each carries disabled; the description does not.
  const labelThemeProps = themeProps('step-label', {
    progress,
    status: status ?? undefined,
    disabled: isDisabled ? 'disabled' : null,
  });
  const descriptionThemeProps = themeProps('step-description', {
    progress,
    status: status ?? undefined,
  });

  // Indicator + Label row. In compact on-track mode the indicator remains
  // visible on the rail, so the summary reuses this row without drawing the
  // active indicator a second time beside the label.
  const iconLabelNode = (
    <div className={iconLabelRowClassName}>
      {(!isCompact || indicatorPosition !== 'on-track') && indicatorNode}
      {/* A space between the indicator and the label: the row is a flex
          container, which drops whitespace-only text, so nothing changes on
          screen, but a text reading of the button then keeps "1 Account" as two
          words instead of "1Account". */}{' '}
      <span
        {...mergeProps(
          labelThemeProps,
          tw(labelClassName, labelColorClassName),
        )}>
        {label}
      </span>
      {statusTextNode}
      {isOptional && (
        <>
          <span aria-hidden="true">•</span>
          <span className={optionalClassName}>
            {t('@astryx.step.optional')}
          </span>
        </>
      )}
      {endContent}
    </div>
  );

  // A clickable step's name is its number, label and status word; the
  // description describes it, so a disabled step's reason reaches assistive
  // technology too (spec:AST-085 FR5).
  const descriptionID = useId();
  const descriptionNode = isRenderable(description) ? (
    <div
      id={descriptionID}
      className={tw(
        hasIndicator
          ? descriptionRowWithIndicatorClassName
          : descriptionRowClassName,
      )}>
      <span {...mergeProps(descriptionThemeProps, descriptionClassName)}>
        {description}
      </span>
    </div>
  ) : null;

  // Compact horizontal layouts hide public step content without unmounting it,
  // so local state survives as the container crosses the threshold.
  const contentNode = isRenderable(children) ? (
    <div
      hidden={isCompact || undefined}
      className={tw(
        stepContentClassName,
        hasIndicator
          ? contentIndentClassName
          : contentIndentNoIndicatorClassName,
      )}
      style={densityStyle(densitySpace, separatedDensityInline)}>
      {children}
    </div>
  ) : null;

  // The step paints nothing of its own when disabled, so it carries no
  // `disabled` selector.
  const stepThemeProps = themeProps('step', {
    progress,
    status: status ?? undefined,
  });

  // ======= SUMMARY: this step, drawn below a collapsed track =======
  //
  // Only the current step draws one, into a row the stepper owns and keeps
  // outside the `<ol>` — so the list is left with exactly the children it was
  // given, and the on-track connectors go on reading their own
  // `:first-child`/`:last-child` position to decide which caps to hide.
  //
  // Rendered here rather than handed up as data because it reuses
  // `iconLabelNode`: indicator resolution, status glyphs, completed checks,
  // disabled tints, and the compact on-track rule above stay in one place. The
  // description is re-wrapped, though — the row version indents itself under
  // an indicator, and centred under a track there is nothing to line it up with.
  const summaryNode =
    isCompact && isActive && summarySlot != null
      ? createPortal(
          <div {...mergeProps(stepThemeProps, summaryRootClassName)}>
            {iconLabelNode}
            {isRenderable(description) ? (
              <span className={descriptionClassName}>{description}</span>
            ) : null}
          </div>,
          summarySlot,
        )
      : null;

  // Every compact step is presentational, including on-track indicators, so
  // each item restores its label and status as hidden text. The list stays a
  // complete ordered sequence with `aria-current` intact, while the summary row
  // below it owns the compact navigation controls and remains decorative apart
  // from those buttons.
  // A compact step has no button to carry `aria-disabled`, and a list item
  // cannot carry it, so a disabled step adds a hidden status word.
  const compactNameNode = isCompact ? (
    <>
      <VisuallyHidden>{label}</VisuallyHidden>
      {statusTextNode}
      {isDisabled ? (
        <VisuallyHidden>{t('@astryx.step.status.unavailable')}</VisuallyHidden>
      ) : null}
    </>
  ) : null;

  // ======= ON-TRACK: indicator is a node on the connector =======
  if (indicatorPosition === 'on-track') {
    // Connector fill is purely progress-based (matches the separated bar):
    // the segment before the indicator is "reached" once we're at/past this
    // step; the segment after is filled only once this step is completed.
    // `status` never recolors the connector — only the indicator.
    const beforeFilled = step <= activeStep;
    const afterFilled = step < activeStep;
    // Both segments animate their fill along the track (see connectorTrack), so
    // the pair is picked by orientation: the vertical column scales down its
    // block axis, the horizontal row along the reading direction.
    const segFilledClassName = isVertical
      ? connectorFillVClassName
      : connectorFillHClassName;
    const segEmptyClassName = isVertical
      ? connectorEmptyVClassName
      : connectorEmptyHClassName;
    const beforeSegClassName = beforeFilled
      ? segFilledClassName
      : segEmptyClassName;
    const afterSegClassName = afterFilled
      ? segFilledClassName
      : segEmptyClassName;
    // First/last connector visibility is decided structurally from the step's
    // own <li> position (see otSegHiddenIfFirst/Last), not by counting children
    // in the parent — so grouping steps in a fragment can't break it.

    // A node-to-node span is drawn by two steps: this one's trailing segments
    // leave its own node, the next one's leading cap arrives at the next node.
    // Both flip on the same condition, so left to themselves they fill together
    // and one gap between two nodes reads as two dashes converging on the space
    // between them. Handing each its own slice of the span's time, in track
    // order — the leaving half first, then the arriving one — is what closes
    // that into a single line growing.
    const arrivalShare = isVertical ? OT_ARRIVAL_SHARE_V : OT_ARRIVAL_SHARE_H;
    const leavingShare = 1 - arrivalShare;
    // A content slot's segment continues the leaving half below the row, so the
    // two divide the leaving time between them; with no slot the rail segment
    // takes all of it. Each step can work this out for its own trailing side
    // alone: the arriving cap always takes the span's last `arrivalShare`, so
    // the step drawing it never has to know whether the step before it carries
    // a slot.
    const hasContentSeg = isVertical && isRenderable(children);
    const railShare =
      leavingShare * (hasContentSeg ? OT_RAIL_SHARE_OF_LEAVING : 1);
    const contentShare = leavingShare - railShare;

    const beforeTiming = fillTiming(step - 1, leavingShare, arrivalShare);
    const railTiming = fillTiming(step, 0, railShare);
    const contentTiming = fillTiming(step, railShare, contentShare);

    const labelLineNode = (
      <div
        className={
          isVertical ? otLabelRowStartClassName : otLabelRowCenterClassName
        }>
        <span
          {...mergeProps(
            labelThemeProps,
            tw(labelClassName, labelColorClassName),
          )}>
          {label}
        </span>
        {statusTextNode}
        {isOptional && (
          <>
            <span aria-hidden="true">•</span>
            <span className={optionalClassName}>
              {t('@astryx.step.optional')}
            </span>
          </>
        )}
        {endContent}
      </div>
    );

    const otDescriptionNode = isRenderable(description) ? (
      <span
        id={descriptionID}
        {...mergeProps(descriptionThemeProps, descriptionClassName)}>
        {description}
      </span>
    ) : null;

    const otContentNode = !isRenderable(children) ? null : isVertical ? (
      <div className={otContentWrapClassName}>
        <div
          aria-hidden="true"
          {...mergeProps(
            themeProps('step-connector'),
            // This segment is absolutely placed on the rail beside the content
            // slot, so it keeps that placement; an absolute box is a
            // containing block too, so its fill still pins to it.
            tw(
              otContentSegClassName,
              afterSegClassName,
              otSegHiddenIfLastClassName,
            ),
            contentTiming,
          )}
        />
        <div
          className={tw(
            otContentClassName,
            hasIndicator
              ? otContentIndentClassName
              : otContentIndentNoIndicatorClassName,
          )}>
          {children}
        </div>
      </div>
    ) : (
      <div hidden={isCompact || undefined} className={otContentClassName}>
        {children}
      </div>
    );

    if (isVertical) {
      const inner = (
        <>
          <div className={tw(otIndicatorColClassName, otRailBridgeClassName)}>
            <div
              aria-hidden="true"
              {...mergeProps(
                themeProps('step-connector'),
                tw(
                  otSegBaseVClassName,
                  otSegLeadVClassName,
                  hasIndicator && otSegGapLeadVClassName,
                  beforeSegClassName,
                  otSegHiddenIfFirstClassName,
                ),
                beforeTiming,
              )}
            />
            {indicatorNode}
            <div
              aria-hidden="true"
              {...mergeProps(
                themeProps('step-connector'),
                tw(
                  otSegBaseVClassName,
                  otSegFlexVClassName,
                  hasIndicator && otSegGapRailVClassName,
                  afterSegClassName,
                  otSegHiddenIfLastClassName,
                ),
                railTiming,
              )}
            />
          </div>
          {/* Whitespace between the indicator column and the label, as in
              iconLabelNode. */}{' '}
          <div className={otBodyClassName}>
            {labelLineNode}
            {otDescriptionNode}
          </div>
        </>
      );

      return (
        <li
          ref={ref}
          {...mergeProps(
            stepThemeProps,
            xstyleProps(xstyle),
            tw(stepItemClassName, otVerticalRootClassName, className),
            {...densityStyle(densitySpace, separatedDensityInline), ...style},
          )}
          data-testid={dataTestId}
          {...rest}
          // Keep this after `{...rest}` so a caller's `aria-current` cannot replace it.
          aria-current={isActive ? 'step' : undefined}>
          {hasButton ? (
            <button
              type="button"
              onClick={handleClick}
              aria-label={stepAriaLabel}
              aria-describedby={
                isRenderable(description) ? descriptionID : undefined
              }
              aria-disabled={isDisabled || undefined}
              {...pressable}
              {...mergeProps(
                stylex.props(interactionOverlayStyles.pressedAlpha),
                tw(
                  otInteractiveClassName,
                  otRowWrapClassName,
                  // The hover and press colour; its strength and release stay
                  // the StyleX arm above.
                  interactionOverlayBackgroundColorClassName,
                  focusOutlineFocusVisibleClassName,
                ),
              )}>
              {inner}
            </button>
          ) : (
            <div className={tw(otRowWrapClassName, otRowPadClassName)}>
              {inner}
            </div>
          )}
          {otContentNode}
        </li>
      );
    }

    // Horizontal on-track
    const innerH = (
      <>
        <div className={otTrackRowClassName}>
          <div
            aria-hidden="true"
            {...mergeProps(
              themeProps('step-connector'),
              tw(
                otSegHClassName,
                hasIndicator && otSegGapLeadHClassName,
                beforeSegClassName,
                otSegHiddenIfFirstClassName,
              ),
              beforeTiming,
            )}
          />
          {indicatorNode}
          <div
            aria-hidden="true"
            {...mergeProps(
              themeProps('step-connector'),
              tw(
                otSegHClassName,
                hasIndicator && otSegGapRailHClassName,
                afterSegClassName,
                otSegHiddenIfLastClassName,
              ),
              railTiming,
            )}
          />
        </div>
        {/* Whitespace between the rail and the label, as in iconLabelNode. */}{' '}
        {/* The on-track indicator remains visible as a node on the rail at
            compact widths, but the wrapper becomes presentational with its
            label. Navigation moves to the named controls in the summary row. */}
        {!isCompact && (
          <div className={tw(otLabelWrapHClassName, otMarginTopClassName)}>
            {labelLineNode}
            {otDescriptionNode}
          </div>
        )}
      </>
    );

    return (
      <li
        ref={ref}
        {...mergeProps(
          stepThemeProps,
          xstyleProps(xstyle),
          tw(stepItemClassName, otHorizontalRootClassName, className),
          {...densityStyle(densitySpace, separatedDensityInline), ...style},
        )}
        data-testid={dataTestId}
        {...rest}
        // Keep this after `{...rest}` so a caller's `aria-current` cannot replace it.
        aria-current={isActive ? 'step' : undefined}>
        {hasButton ? (
          <button
            type="button"
            onClick={handleClick}
            aria-label={stepAriaLabel}
            aria-describedby={
              isRenderable(description) ? descriptionID : undefined
            }
            aria-disabled={isDisabled || undefined}
            {...pressable}
            {...mergeProps(
              stylex.props(interactionOverlayStyles.pressedAlpha),
              tw(
                otInteractiveClassName,
                otColWrapClassName,
                otPadBlockClassName,
                // The hover and press colour; its strength and release stay the
                // StyleX arm above.
                interactionOverlayBackgroundColorClassName,
                focusOutlineFocusVisibleClassName,
              ),
            )}>
            {innerH}
          </button>
        ) : (
          <div className={tw(otColWrapClassName, otPadBlockClassName)}>
            {innerH}
          </div>
        )}
        {compactNameNode}
        {otContentNode}
        {summaryNode}
      </li>
    );
  }

  // ======= VERTICAL =======
  if (isVertical) {
    return (
      <li
        ref={ref}
        {...mergeProps(
          stepThemeProps,
          xstyleProps(xstyle),
          tw(stepItemClassName, verticalRootClassName, className),
          {...densityStyle(densitySpace, separatedDensityInline), ...style},
        )}
        data-testid={dataTestId}
        {...rest}
        // Keep this after `{...rest}` so a caller's `aria-current` cannot replace it.
        aria-current={isActive ? 'step' : undefined}>
        {/* 4px progress bar */}
        <div
          {...mergeProps(
            themeProps('step-bar'),
            tw(
              verticalBarClassName,
              isBarFilled ? connectorFillVClassName : connectorEmptyVClassName,
            ),
            barTiming,
          )}
          aria-hidden="true"
        />
        {/* Body: button wraps only label area, children render outside */}
        <div className={verticalBodyClassName}>
          {hasButton ? (
            <button
              type="button"
              onClick={handleClick}
              aria-label={stepAriaLabel}
              aria-describedby={
                isRenderable(description) ? descriptionID : undefined
              }
              aria-disabled={isDisabled || undefined}
              {...pressable}
              {...mergeProps(
                stylex.props(interactionOverlayStyles.pressedAlpha),
                tw(
                  buttonResetClassName,
                  densityBlockClassName,
                  densityInlineClassName,
                  // The hover and press colour; its strength and release stay
                  // the StyleX arm above.
                  interactionOverlayBackgroundColorClassName,
                  focusOutlineFocusVisibleClassName,
                ),
                densityStyle(densitySpace, separatedDensityInline),
              )}>
              {iconLabelNode}
              {descriptionNode}
            </button>
          ) : (
            <div
              className={tw(densityBlockClassName, densityInlineClassName)}
              style={densityStyle(densitySpace, separatedDensityInline)}>
              {iconLabelNode}
              {descriptionNode}
            </div>
          )}
          {contentNode}
        </div>
      </li>
    );
  }

  // ======= HORIZONTAL =======
  return (
    <li
      ref={ref}
      {...mergeProps(
        stepThemeProps,
        xstyleProps(xstyle),
        tw(stepItemClassName, horizontalStepClassName, className),
        {...densityStyle(densitySpace, separatedDensityInline), ...style},
      )}
      data-testid={dataTestId}
      {...rest}
      // Keep this after `{...rest}` so a caller's `aria-current` cannot replace it.
      aria-current={isActive ? 'step' : undefined}>
      {/* 4px progress bar segment for this step */}
      <div
        {...mergeProps(
          themeProps('step-bar'),
          tw(
            horizontalBarClassName,
            isBarFilled ? connectorFillHClassName : connectorEmptyHClassName,
          ),
          barTiming,
        )}
        aria-hidden="true"
      />
      {/* The click target goes with the label, deliberately. A step narrow
          enough to lose its label is narrow enough that all that would be left
          to press is a 4px bar; the stepper puts a pair of named controls
          under the track instead. */}
      {isCompact ? (
        compactNameNode
      ) : hasButton ? (
        <button
          type="button"
          onClick={handleClick}
          aria-label={stepAriaLabel}
          aria-describedby={
            isRenderable(description) ? descriptionID : undefined
          }
          aria-disabled={isDisabled || undefined}
          {...mergeProps(
            stylex.props(interactionOverlayStyles.pressedAlpha),
            tw(
              buttonResetClassName,
              densityBlockClassName,
              densityInlineClassName,
              // The hover and press colour; its strength and release stay the
              // StyleX arm above.
              interactionOverlayBackgroundColorClassName,
              focusOutlineFocusVisibleClassName,
            ),
            densityStyle(densitySpace, separatedDensityInline),
          )}>
          {iconLabelNode}
          {descriptionNode}
        </button>
      ) : (
        <div
          className={tw(densityBlockClassName, densityInlineClassName)}
          style={densityStyle(densitySpace, separatedDensityInline)}>
          {iconLabelNode}
          {descriptionNode}
        </div>
      )}
      {contentNode}
      {summaryNode}
    </li>
  );
}

Step.displayName = 'Step';
