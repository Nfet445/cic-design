// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file sliderClasses.ts
 * @input The control's orientation and disabled state, whether a mark falls in
 *   the filled range, whether the thumb is held and whether it carries a touch
 *   target
 * @output Every part of the slider as a Tailwind class string
 * @position Internal to Slider; the Tailwind build scans it for class names
 *
 * The thumbs and the fill travel by `translate` in container units (`cqi` /
 * `cqb`) of the travel box, read from the private properties the component
 * writes inline. So a moving thumb never lays out. The inline centering of a
 * vertical track comes from the shared `rtlCenterInlineClassName`
 * (`utils/rtlClasses.ts`), and the shared focus ring stays StyleX.
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from '../utils/tw';

// Every class below is spelled out: a class assembled from pieces at runtime
// reaches the DOM with no rule behind it, and the package's stylesheet test is
// what catches it.

/** The row that holds the control and its text value. */
export function sliderRowClassName({
  hasMarkLabels,
}: {
  hasMarkLabels: boolean;
}): string {
  return tw(
    'flex items-center gap-2',
    // A horizontal mark label hangs below the middle of the control. The row
    // keeps room for the part of the label's line below it, so the content
    // after the slider starts below the labels.
    hasMarkLabels &&
      '[padding-block-end:calc(4px_+_var(--text-supporting-size)_*_var(--text-supporting-leading))] pointer-coarse:[padding-block-end:calc(2px_+_var(--text-supporting-size)_*_var(--text-supporting-leading))]',
  );
}

/**
 * The box every part sits in. It fills the control's padding box, so padding
 * on the control moves no part. Its size never depends on its content.
 */
export const sliderTravelBoxClassName =
  'absolute inset-0 [container-type:size]';

/** The value tooltip's layout anchor, at the thumb's value. */
export function sliderValueAnchorClassName({
  isHorizontal,
}: {
  isHorizontal: boolean;
}): string {
  return tw(
    'absolute size-5 pointer-events-none',
    isHorizontal
      ? '[top:calc(50%_-_10px)] [inset-inline-start:calc(var(--_slider-progress)*(100cqi_-_20px))]'
      : '[inset-inline-start:calc(50%_-_10px)] [bottom:calc(var(--_slider-progress)*(100cqb_-_20px))]',
  );
}

/**
 * The control box: the part a press lands on and the container the travel is
 * measured in. Under a finger the control leaves the browser its pans, so a
 * swipe from the track or across a thumb scrolls the page; the gesture host
 * narrows that per element and never widens it. A mouse keeps `none`.
 */
export function sliderControlClassName({
  isHorizontal,
  isDisabled,
}: {
  isHorizontal: boolean;
  isDisabled: boolean;
}): string {
  return tw(
    'relative flex grow items-center [touch-action:none] pointer-coarse:[touch-action:manipulation] select-none isolate',
    isHorizontal
      ? // The whole track is the tap target, but it is only 20px tall, under
        // the 24px WCAG 2.5.8 AA minimum. Floor its block size under a finger;
        // the rail and thumb center on 50%, so only the tappable area grows.
        'h-5 w-full pointer-coarse:min-h-6'
      : // Rotated, the short axis is the inline one, so floor that instead.
        'h-40 w-5 flex-col justify-center pointer-coarse:min-w-6',
    isDisabled ? 'opacity-50 cursor-default' : 'cursor-pointer',
  );
}

/** The unfilled rail. */
export function sliderTrackClassName({
  isHorizontal,
}: {
  isHorizontal: boolean;
}): string {
  return tw(
    'absolute rounded-full bg-[var(--color-track)]',
    isHorizontal
      ? 'start-0 end-0 top-1/2 h-1 -translate-y-1/2'
      : 'top-0 bottom-0 w-1',
  );
}

/** The clip that rounds the fill's start and hides the mover's overhang. */
export function sliderFillClipClassName({
  isHorizontal,
}: {
  isHorizontal: boolean;
}): string {
  return tw(
    'absolute overflow-hidden rounded-full pointer-events-none',
    isHorizontal
      ? 'start-0 end-0 top-1/2 h-1 -translate-y-1/2'
      : 'top-0 bottom-0 w-1',
  );
}

/**
 * The fill's mover, at the range's start (a single slider's start is the
 * track's). A range's start is round, like the track's ends; it shows through
 * a disabled thumb's translucent fill.
 */
export function sliderFillMoverClassName({
  isHorizontal,
  isRange,
}: {
  isHorizontal: boolean;
  isRange: boolean;
}): string {
  return tw(
    'absolute inset-0 overflow-hidden',
    isRange &&
      (isHorizontal
        ? 'rounded-ss-full rounded-es-full [translate:calc(10px_+_var(--_slider-fill-start)*(100cqi_-_20px))_0] rtl:[translate:calc(-10px_-_var(--_slider-fill-start)*(100cqi_-_20px))_0]'
        : 'rounded-es-full rounded-ee-full [translate:0_calc(-10px_-_var(--_slider-fill-start)*(100cqb_-_20px))]'),
  );
}

/**
 * The filled bar, moved into place inside the clip so it travels by translate
 * alone. Its end sits at the range's end; both ends hide under their thumbs.
 */
export function sliderFilledTrackClassName({
  isHorizontal,
  isRange,
}: {
  isHorizontal: boolean;
  isRange: boolean;
}): string {
  return tw(
    'absolute inset-0 bg-[var(--color-accent)]',
    isHorizontal
      ? 'rounded-se-full rounded-ee-full'
      : 'rounded-ss-full rounded-se-full',
    isHorizontal
      ? isRange
        ? '[translate:calc((var(--_slider-fill-end)_-_var(--_slider-fill-start))*(100cqi_-_20px)_-_100cqi)_0] rtl:[translate:calc(100cqi_-_(var(--_slider-fill-end)_-_var(--_slider-fill-start))*(100cqi_-_20px))_0]'
        : '[translate:calc(10px_+_var(--_slider-fill-end)*(100cqi_-_20px)_-_100cqi)_0] rtl:[translate:calc(100cqi_-_10px_-_var(--_slider-fill-end)*(100cqi_-_20px))_0]'
      : isRange
        ? '[translate:0_calc(100cqb_-_(var(--_slider-fill-end)_-_var(--_slider-fill-start))*(100cqb_-_20px))]'
        : '[translate:0_calc(100cqb_-_10px_-_var(--_slider-fill-end)*(100cqb_-_20px))]',
  );
}

/** The marks' layer. */
export function sliderMarksContainerClassName({
  isHorizontal,
}: {
  isHorizontal: boolean;
}): string {
  return tw(
    'absolute',
    isHorizontal ? 'start-0 end-0 top-1/2' : 'top-0 bottom-0 start-1/2',
  );
}

/**
 * A mark. One in the filled region takes the fill colour, so it reads as part
 * of the filled track rather than the unfilled rail.
 */
export function sliderMarkClassName({
  isHorizontal,
  isFilled,
}: {
  isHorizontal: boolean;
  isFilled: boolean;
}): string {
  return tw(
    'absolute rounded-full',
    isFilled ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-track)]',
    isHorizontal
      ? 'h-2 w-0.5 [transform:translate(-50%,-50%)] rtl:[transform:translate(50%,-50%)]'
      : 'h-0.5 w-2 [transform:translate(-50%,50%)]',
  );
}

/** A mark's label, hanging below or beside its mark. */
export function sliderMarkLabelClassName({
  isHorizontal,
}: {
  isHorizontal: boolean;
}): string {
  return tw(
    'absolute whitespace-nowrap',
    '[font-family:var(--font-family-body)]',
    'text-[length:var(--text-supporting-size)]',
    '[line-height:var(--text-supporting-leading)]',
    'text-[color:var(--color-text-secondary)]',
    isHorizontal
      ? 'top-3.5 [transform:translateX(-50%)] rtl:[transform:translateX(50%)]'
      : 'start-3.5 [transform:translateY(50%)]',
  );
}

/**
 * A thumb. It centers by its offset and never by a transform, because the
 * touch lift scales it and CSS applies `transform` inside `scale`. It travels
 * by its progress along the track minus its own size, so its center lands
 * where the fill and the marks do; `translate` is physical, so it flips sign
 * under RTL. Under a finger its `::before` is the touch target, grown by the
 * insets the controller writes.
 */
export function sliderThumbClassName({
  isHorizontal,
  isDisabled,
  isPressed,
  hasTouchTarget,
}: {
  isHorizontal: boolean;
  isDisabled: boolean;
  isPressed: boolean;
  hasTouchTarget: boolean;
}): string {
  return tw(
    'absolute size-5 rounded-full z-[1] outline-none',
    'transition-[background-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-standard)] motion-reduce:[transition-duration:0s]',
    isDisabled
      ? 'bg-[var(--color-background-muted)] cursor-default'
      : tw(
          'bg-[var(--color-accent)] cursor-grab',
          '[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:bg-[color-mix(in_srgb,var(--color-accent),var(--color-tint-hover)_15%)]',
        ),
    // A slider is a drag, not a tap: the finger lands anywhere on the track
    // and the thumb follows it. So the pressed paint follows the drag state
    // the pointer handlers keep, not `:active` on the thumb.
    isPressed &&
      '[background-image:linear-gradient(var(--color-overlay-pressed),var(--color-overlay-pressed))]',
    isHorizontal
      ? '[top:calc(50%_-_10px)] start-0 [translate:calc(var(--_slider-progress)*(100cqi_-_20px))_0] rtl:[translate:calc(var(--_slider-progress)*(20px_-_100cqi))_0]'
      : 'bottom-0 [inset-inline-start:calc(50%_-_10px)] [translate:0_calc(var(--_slider-progress)*(20px_-_100cqb))]',
    hasTouchTarget &&
      'before:content-[""] before:absolute before:top-[var(--_slider-hit-top)] before:bottom-[var(--_slider-hit-bottom)] before:start-[var(--_slider-hit-start)] before:end-[var(--_slider-hit-end)]',
  );
}

/** The value shown beside the control in `valueDisplay="text"`. */
export const sliderTextValueClassName =
  'shrink-0 whitespace-nowrap [font-family:var(--font-family-body)] text-[length:var(--text-label-size)] text-[color:var(--color-text-primary)]';
