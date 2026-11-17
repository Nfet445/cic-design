// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file toastViewportClasses.ts
 * @input The viewport position, whether the stack is empty, and a row's
 *   entering, exiting and direction state
 * @output Class names for the viewport, its popover reset and safe-area
 *   gutters, the four edge placements, and each row's opening grid track
 * @position Static styling for ToastViewport.tsx and its rows; scanned by
 *   `tailwind/astryx.input.css` to build `astryx-tailwind.css`
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from '../utils/tw';

/**
 * The viewport's box. `popover` puts it in the top layer, above dialogs, but
 * its UA styles are not wanted: a Canvas background, `margin: auto`, a border
 * and `padding: 0.25em`, and `width: fit-content`. `width` is part of that
 * reset because the box is positioned by spanning the inline axis
 * (`inset-inline-start` and `inset-inline-end` below) and then aligning within
 * itself: a shrink-wrapped box cannot honour both edges, so it resolves
 * against the start edge and an end-aligned toast lands on the left. Measured
 * in Chromium at 1200px wide: a 438px box at x=0, end-positioned toast at
 * x=19. The UA's `inset: 0` needs no reset here: every edge this box cares
 * about is authored below, and an authored declaration outranks the UA
 * shorthand.
 *
 * The gutter clears the safe-area insets. On an iPhone, a downward swipe that
 * starts in the bottom inset can pull the whole screen down, so the bottom
 * gutter keeps clear of that inset; under a coarse pointer it clears 34px
 * anyway, a Face ID iPhone's bottom inset in portrait, because Safari reports
 * the inset only to a page with `viewport-fit=cover`.
 *
 * The four paddings read private variables because a direction flip swaps the
 * two *physical* insets they are built from: `env()` cannot be selected by
 * writing direction, so the RTL arms author the values and one padding
 * declaration each consumes them, leaving every padding property on exactly
 * one class.
 */
const toastViewportResetClassName = tw(
  'fixed z-[500] box-border pointer-events-none',
  'w-auto m-0 border-0 bg-transparent overflow-visible',
  // The app-declared inset from LayerProvider for a bar floating over an
  // edge; unset, each reads 0px. A toast-only `inset` prop writes the same
  // edges inline and wins.
  '[inset-inline-start:var(--astryx-layer-inset-inline-start,0px)]',
  '[inset-inline-end:var(--astryx-layer-inset-inline-end,0px)]',
  '[--_toast-padding-block-start:max(var(--spacing-4),env(safe-area-inset-top,0px))]',
  '[--_toast-padding-block-end:calc(var(--spacing-4)_+_env(safe-area-inset-bottom,0px))]',
  'pointer-coarse:[--_toast-padding-block-end:calc(var(--spacing-4)_+_max(env(safe-area-inset-bottom,0px),34px))]',
  '[--_toast-padding-inline-start:max(var(--spacing-4),env(safe-area-inset-left,0px))]',
  '[--_toast-padding-inline-end:max(var(--spacing-4),env(safe-area-inset-right,0px))]',
  '[&:dir(rtl)]:[--_toast-padding-inline-start:max(var(--spacing-4),env(safe-area-inset-right,0px))]',
  '[&:dir(rtl)]:[--_toast-padding-inline-end:max(var(--spacing-4),env(safe-area-inset-left,0px))]',
  '[padding-block-start:var(--_toast-padding-block-start)]',
  '[padding-block-end:var(--_toast-padding-block-end)]',
  '[padding-inline-start:var(--_toast-padding-inline-start)]',
  '[padding-inline-end:var(--_toast-padding-inline-end)]',
);

/**
 * The four placements. Each one spends the UA `inset: 0` on the edge it does
 * not use, so the box spans that axis rather than stretching across it, and
 * sets the stacking direction: a top stack lays its rows out reversed so the
 * newest sits nearest the top edge.
 */
const toastViewportPlacementClassName = {
  bottomEnd:
    'flex flex-col items-end [bottom:var(--astryx-layer-inset-block-end,0px)] [top:auto]',
  bottomStart:
    'flex flex-col items-start [bottom:var(--astryx-layer-inset-block-end,0px)] [top:auto]',
  topEnd:
    'flex flex-col-reverse items-end [top:var(--astryx-layer-inset-block-start,0px)] [bottom:auto]',
  topStart:
    'flex flex-col-reverse items-start [top:var(--astryx-layer-inset-block-start,0px)] [bottom:auto]',
} as const;

/**
 * iOS Safari colors its toolbar from a fixed element at the bottom edge. A
 * toast that a swipe sends through that edge gives the viewport its color, and
 * Safari keeps that color while the viewport has a box, so an empty viewport
 * has none.
 */
export function toastViewportClassName({
  position,
  isEmpty,
}: {
  position: keyof typeof toastViewportPlacementClassName;
  isEmpty: boolean;
}): string {
  return tw(
    toastViewportResetClassName,
    isEmpty ? 'hidden' : toastViewportPlacementClassName[position],
  );
}

/** The element that renders a portaled viewport in place of itself. */
export const toastViewportOutletClassName = 'contents';

const toastRowBaseClassName = tw(
  'pointer-events-auto grid w-full max-w-[400px] min-w-0',
  'transition-[grid-template-rows,padding]',
  'duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
  'motion-reduce:duration-[0.01ms]',
);

/**
 * A row opens from a closed track only when it first renders. A move to
 * another modal outlet renders it again, and it must not open again. The
 * `@starting-style` pair is the track's value before the first style change,
 * which the transition to the open track spends; it is not competing with
 * that value, which is the one after the change.
 */
const toastRowEnteringClassName =
  '[@starting-style]:[grid-template-rows:0fr] [@starting-style]:[padding-block-end:0]';

// The inter-toast gap is padding on each wrapper so it collapses with the
// grid track. The wrapper nearest the viewport edge drops that padding; the
// child flips because top stacks use column-reverse.
const toastRowGapClassName =
  '[padding-block-end:var(--spacing-2)] [&:last-child]:[padding-block-end:0]';
const toastRowGapReversedClassName =
  '[padding-block-end:var(--spacing-2)] [&:first-child]:[padding-block-end:0]';

const toastRowOpenClassName = '[grid-template-rows:1fr]';
const toastRowClosedClassName =
  '[grid-template-rows:0fr] [padding-block-end:0]';

export interface ToastRowClasses {
  isEntering: boolean;
  isReversed: boolean;
  isExiting: boolean;
}

/** One complete class string for a row in its current state. */
export function toastRowClassName({
  isEntering,
  isReversed,
  isExiting,
}: ToastRowClasses): string {
  return tw(
    toastRowBaseClassName,
    // The card slides in from the edge it belongs to; the viewport's own
    // direction decides the sign.
    isReversed
      ? '[--_toast-slide-y:calc(-1_*_var(--spacing-2))]'
      : '[--_toast-slide-y:var(--spacing-2)]',
    isExiting ? toastRowClosedClassName : toastRowOpenClassName,
    !isExiting &&
      (isReversed ? toastRowGapReversedClassName : toastRowGapClassName),
    isEntering && toastRowEnteringClassName,
  );
}

/**
 * The clip inside the row. The row's track opens and closes so the toast reads
 * as folding into the stack; the clip holds while it moves, and is released
 * once the entry settles so the card's shadow can paint. `hidden` restores the
 * exact exit paint and hit boundary the viewport shipped with before the
 * shadow fix.
 */
export function toastRowInnerClassName(isSettled: boolean): string {
  return tw(
    'w-full max-w-full min-w-0 min-h-0',
    isSettled ? 'overflow-visible' : 'overflow-hidden',
  );
}
