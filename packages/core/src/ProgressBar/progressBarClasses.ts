// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file progressBarClasses.ts
 * @input Accepts the fill variant and the mark's placement
 * @output Tailwind utility class names for the bar's frame, label row, track,
 *   variants, the indeterminate fill and the marks
 * @position Internal to ProgressBar.
 *
 * The determinate fill stays in `progressBarFill.stylex.ts`: its forced-colors
 * arm has to beat its touch arm, and a class can only win that by sheet order,
 * which Tailwind fixes per variant. Everything else picks one class per
 * property, so two classes here never paint the same declaration.
 */

import {tw} from '../utils/tw';
import type {ProgressBarVariant} from './ProgressBar';

/** The fill also has a `disabled` arm, which no variant prop reaches. */
type FillVariant = ProgressBarVariant | 'disabled';

/** The bar's column: the label row above the track. */
export const progressBarClassName = tw(
  'flex flex-col',
  'gap-[var(--spacing-1)]',
  'w-full min-w-[48px]',
);

/** The label row: the label at the inline start, the value at the end. */
export const progressBarHeaderClassName = 'flex justify-between items-baseline';

export const progressBarLabelClassName = tw(
  'text-[length:var(--text-body-size)] leading-[var(--text-body-leading)]',
  '[font-weight:var(--font-weight-medium)]',
  'text-[color:var(--color-text-primary)]',
);

export const progressBarLabelDisabledClassName =
  'text-[color:var(--color-text-disabled)]';

/** The value beside the label: the same type, one step quieter. */
export const progressBarValueLabelClassName = tw(
  'text-[length:var(--text-body-size)] leading-[var(--text-body-leading)]',
  '[font-weight:var(--font-weight-normal)]',
  'text-[color:var(--color-text-secondary)]',
);

export const progressBarValueLabelDisabledClassName =
  'text-[color:var(--color-text-disabled)]';

/** A visually hidden label keeps its place in the accessibility tree. */
export const progressBarLabelHiddenClassName = 'sr-only';

/**
 * The in-flow track's containing block. Marks share its geometry without
 * depending on the label row's height or entering the progressbar's
 * presentational subtree. It stays unclipped so themed tall marks can overhang
 * the track symmetrically.
 */
export const progressBarTrackContainerClassName = 'relative w-full';

/**
 * The semantic rail holds only the fill and clips it to the rounded rail: the
 * determinate fill slides in from the inline-start side and the indeterminate
 * one overshoots both ends. Marks live outside the track, so the clip never
 * cuts a themed tall mark.
 */
export const progressBarTrackClassName = tw(
  'w-full h-[8px]',
  'bg-[color:var(--color-background-muted)]',
  'rounded-[var(--radius-full)] overflow-hidden',
);

export const progressBarVariantClassName: Record<FillVariant, string> = {
  accent: 'bg-[color:var(--color-accent)]',
  success: 'bg-[color:var(--color-success)]',
  warning: 'bg-[color:var(--color-warning)]',
  error: 'bg-[color:var(--color-error)]',
  neutral: 'bg-[color:var(--color-text-disabled)]',
  disabled: 'bg-[color:var(--color-text-disabled)]',
};

/**
 * A mark inside the filled area is drawn *on* the bar, so it takes the on-color
 * that pairs with the fill's own variant color — the same pairing Badge uses
 * for solid semantic backgrounds. `neutral` and `disabled` fill with the muted
 * gray, which has no dedicated on-token: a live `neutral` bar keeps the full
 * foreground, a deliberate `disabled` one steps down to the secondary.
 */
export const progressBarMarkOnFillClassName: Record<FillVariant, string> = {
  accent: 'bg-[color:var(--color-on-accent)]',
  success: 'bg-[color:var(--color-on-success)]',
  warning: 'bg-[color:var(--color-on-warning)]',
  error: 'bg-[color:var(--color-on-error)]',
  neutral: 'bg-[color:var(--color-text-primary)]',
  disabled: 'bg-[color:var(--color-text-secondary)]',
};

/**
 * A mark out on the bare track is a foreground tick over the muted track
 * background, so it takes `--color-text-primary`.
 *
 * The obvious candidate was `--color-border-emphasized` — the emphasized
 * divider color `Divider`'s `strong` variant and `Slider`'s marks use — but
 * divider tokens sit a step or two from the track on the same neutral ramp, so
 * a mark drawn in one is at or near invisible: measured against each shipped
 * theme's track it lands between 1.00:1 (theme-neutral, both modes, where the
 * track is aliased to that very token) and 2.9:1, under the 3:1 WCAG 1.4.11
 * non-text floor in 7 of 8 themes. `--color-text-secondary` still misses in
 * two. `--color-text-primary` is the one foreground guaranteed to read against
 * every surface a theme defines: 5.8:1 to 15.7:1 on the track across all
 * themes and both modes.
 */
export const progressBarMarkOnTrackClassName = {
  track: 'bg-[color:var(--color-text-primary)]',
  /** A disabled bar dims everything it draws. */
  trackDisabled: 'bg-[color:var(--color-text-secondary)]',
} as const;

/**
 * A mark is a vertical tick centered on the track via their shared positioning
 * container. It stays outside role="progressbar" so it remains independently
 * focusable. The centering translate keeps themed overhang symmetric;
 * `inset-inline-start` and the mirrored translate preserve RTL.
 *
 * The dimensions read private vars rather than being plain declarations: a
 * theme writes `width`/`height` on the `progressbar-mark` target as usual and
 * the derived-var registry emits them as these vars instead of as competing
 * properties. Nothing else declares them, so the theme value lands whatever
 * the consumer's cascade looks like — a source-build app that compiles StyleX
 * without `useCSSLayers` leaves the atomics unlayered, where they outrank every
 * rule in `@layer astryx-theme`.
 *
 * The tick's color is not set here: it depends on what the mark sits on, so it
 * comes from the on-fill or on-track class above.
 */
export const progressBarMarkClassName = tw(
  'absolute top-1/2',
  'w-[var(--_progressbar-mark-width,2px)]',
  'h-[var(--_progressbar-mark-height,8px)]',
  '[transform:translate(-50%,-50%)]',
  'rtl:[transform:translate(50%,-50%)]',
);

/** The boundary that keeps the fill's shape where forced colors replace it. */
export const progressBarForcedColorsOutlineClassName = tw(
  'forced-colors:outline-[1px]',
  'forced-colors:outline-solid',
  'forced-colors:outline-[color:CanvasText]',
  'forced-colors:[outline-offset:-1px]',
);

/**
 * The indeterminate fill. Its keyframes live in `tailwind/astryx.input.css` as
 * `@keyframes astryxProgressBar*`, because the build scans class maps and a
 * keyframe in a `.ts` file would never reach the sheet.
 *
 * Under reduced motion, on every pointer, the fill spans the whole track as one
 * solid bar, and only its opacity pulses on the `progress.reducedMotionPulseMs`
 * role (`--_progress-bar-pulse`, `--_progress-bar-pulse-curve`, set inline from
 * the progress table). The reduced-motion keys come after the direction key in
 * the sheet, so the pulse replaces the slide in both writing directions.
 */
export const progressBarIndeterminateFillClassName = tw(
  'h-full w-[40%] rounded-[var(--radius-full)]',
  'animate-[astryxProgressBarSlide_1.5s_ease-in-out_infinite]',
  'rtl:[animation-name:astryxProgressBarSlideRtl]',
  'motion-reduce:w-full',
  'motion-reduce:[animation-name:astryxProgressBarPulse]',
  // Tailwind orders `motion-reduce` before `rtl`, so the direction key above
  // would otherwise outrank the pulse in an RTL subtree. The stacked key is
  // emitted after both.
  'rtl:motion-reduce:[animation-name:astryxProgressBarPulse]',
  'motion-reduce:[animation-duration:var(--_progress-bar-pulse)]',
  'motion-reduce:[animation-timing-function:var(--_progress-bar-pulse-curve)]',
  'motion-reduce:[animation-direction:alternate]',
  progressBarForcedColorsOutlineClassName,
);
