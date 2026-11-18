// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file bottomSheetClasses.ts
 * @input The sheet host's presentation state: open, whether it positions its
 *   own panel, whether it has a scrim, the settled entry, the exit, and the
 *   sheet's depth in a stack
 * @output Utility class strings for the sheet's `<dialog>`, its backdrop, the
 *   switcher's positioner wrapper, and a stacked sheet's recede
 * @position BottomSheet style primitives; scanned by the Tailwind build
 *
 * `display` has two arms and only one may apply, so the function prints one at
 * a time. The scrim's duration and timing function also take one arm each: two
 * classes of one property are ordered by the sheet, not by the map.
 *
 * The scrim reads `--_sheet-scrim-opacity`, `--_sheet-scrim-duration` and
 * `--_sheet-scrim-easing` from the dialog's inline style, so a drag's fade and
 * the stack's handover pin reach the same class.
 */

import {tw} from '../utils/tw';

/** @internal Verified by BottomSheetStacking.test.tsx; not re-exported from the package entry point. */
export const bottomSheetStackRecedeContract = {
  depth1: 'translateY(calc(-1 * var(--spacing-2))) scale(0.96)',
  depth2: 'translateY(calc(-2 * var(--spacing-2))) scale(0.92)',
} as const;

// A covered sheet recedes behind the top one; the return transition stays while
// another sheet is presented so the sheet animates home too.
const STACK_MOTION = tw(
  '[transform-origin:50%_0]',
  '[transition-property:transform]',
  '[transition-duration:var(--duration-medium)]',
  '[transition-timing-function:var(--ease-standard)]',
  'motion-reduce:[transition-duration:0.01s]',
);

// The nearest covered sheet lifts one step and shrinks once about its top edge,
// the next shrinks a second step, and deeper sheets share that second step.
const STACK_RECEDED_ONE_STEP =
  '[transform:translateY(calc(-1_*_var(--spacing-2)))_scale(0.96)]';
const STACK_RECEDED_TWO_STEPS =
  '[transform:translateY(calc(-2_*_var(--spacing-2)))_scale(0.92)]';

/**
 * The class set of a sheet's positioner while it stands in a stack.
 *
 * The dialog is the panel's positioner, so a recede moves the panel and its
 * grabber as one. The panel's own travel is an inline transform on the panel
 * inside, so the two compose instead of competing.
 */
export function bottomSheetStackPositionerClassName({
  isStacked,
  depth,
}: {
  isStacked: boolean;
  depth: number;
}): string {
  return tw(
    isStacked && STACK_MOTION,
    depth === 1 && STACK_RECEDED_ONE_STEP,
    depth >= 2 && STACK_RECEDED_TWO_STEPS,
  );
}

/**
 * The reduced-motion duration of the backdrop transition. It reads the pin the
 * stack writes for the frame a scrim changes hands, so a literal there would
 * paint one frame with no scrim.
 */
export const bottomSheetScrimReducedMotionDurationClassName =
  'motion-reduce:backdrop:[transition-duration:var(--_sheet-scrim-duration,0.01s)]';

const DIALOG = tw(
  'fixed',
  'inset-0',
  'w-[100dvw]',
  'h-[100dvh]',
  'max-w-none',
  'max-h-none',
  'm-0',
  'p-0',
  'border-0',
  'border-none',
  'bg-transparent',
  'overflow-visible',
  'outline-none',
);

// A flex row, not a grid: WebKit lays a grid host out again on each render
// inside the sheet. Not a column: WebKit then drops the content's block-end
// padding from the scroll range. In a row the panel's height is its own cross
// size, so a sheet taller than the viewport runs past the top edge.
const PANEL_HOST = tw('flex', 'justify-center', 'items-end');

// A non-modal sheet is in the top layer as a manual popover, so it has no page
// z-index (AST-027). Below the Popover API floor, `show()` leaves it in page
// stacking order as a reduced fallback.
const NON_MODAL = tw('pointer-events-none', 'w-full', 'h-full');

const SCRIM = tw(
  'backdrop:bg-[var(--color-overlay)]',
  'backdrop:opacity-[var(--_sheet-scrim-opacity,1)]',
  '[@starting-style]:backdrop:opacity-0',
  'backdrop:[transition-property:opacity,display]',
  'backdrop:[transition-behavior:allow-discrete]',
);

export interface BottomSheetDialogClassState {
  /** The dialog is painted at all: open, or still leaving. */
  isPresented: boolean;
  /** The dialog lays its own panel out, at the block end and centred. */
  isPanelHost: boolean;
  /** The dialog carries the backdrop scrim. */
  hasScrim: boolean;
  /** A non-modal sheet that is the interactive step of its flow. */
  isNonModalTop: boolean;
  /** A sheet present on page load dims at once (AST-013 FR13). */
  isEntrySettled: boolean;
  /** The sheet is leaving, so its dim goes with it. */
  isExiting: boolean;
}

/**
 * The dim leaves with the sheet, on a matching curve. A fade covers no
 * distance, so `--ease-standard` would end it early: 90% faded after 163ms of a
 * 410ms close, under a sheet that is still sliding. `linear` uses the whole
 * duration. A touch drag's close writes its spring's progress as the easing
 * instead, so the dim clears as the sheet slides out.
 */
function scrimTransition({
  isEntrySettled,
  isExiting,
}: Pick<BottomSheetDialogClassState, 'isEntrySettled' | 'isExiting'>): string {
  if (isEntrySettled) {
    return tw(
      'backdrop:[transition-duration:0.01s]',
      'backdrop:[transition-timing-function:var(--ease-standard)]',
    );
  }
  return tw(
    'backdrop:[transition-duration:var(--_sheet-scrim-duration,var(--duration-medium))]',
    bottomSheetScrimReducedMotionDurationClassName,
    isExiting
      ? 'backdrop:[transition-timing-function:var(--_sheet-scrim-easing,linear)]'
      : 'backdrop:[transition-timing-function:var(--ease-standard)]',
  );
}

/** The class set of a sheet's `<dialog>`. */
export function bottomSheetDialogClassName(
  state: BottomSheetDialogClassState,
): string {
  return tw(
    DIALOG,
    state.isPresented ? (state.isPanelHost ? 'flex' : 'block') : 'hidden',
    state.isPanelHost && PANEL_HOST,
    !state.hasScrim && NON_MODAL,
    state.isNonModalTop && 'z-1',
    state.hasScrim && SCRIM,
    state.hasScrim && scrimTransition(state),
  );
}

/** The class set of the wrapper a non-modal switcher flow orders itself in. */
export function bottomSheetSwitcherFlowClassName({
  isNonModal,
}: {
  isNonModal: boolean;
}): string {
  // A scrim flow's dialogs live in the top layer, so the wrapper has no box.
  return tw(
    'contents',
    isNonModal &&
      // show() leaves a no-scrim flow in the normal rendering tree, where DOM
      // order would decide which dialog paints in front. So the wrapper is the
      // flow's isolated surface: the dialogs order themselves inside it, and
      // the wrapper keeps the one overlay value of the old shared shell. It
      // passes pointer input through, and each panel opts back in. Consumers of
      // this mode must avoid transformed or clipping ancestors.
      tw(
        'block',
        'fixed',
        'inset-0',
        'w-full',
        'h-full',
        'pointer-events-none',
        'isolate',
        'z-[1000]',
      ),
  );
}

const POSITIONER = tw(
  'absolute',
  'inset-x-0',
  'bottom-0',
  'flex',
  'justify-center',
  'pointer-events-none',
);

/** The class set of the wrapper a switcher step's panel sits in. */
export function bottomSheetPositionerClassName({
  isPresented,
  isTop,
}: {
  isPresented: boolean;
  isTop: boolean;
}): string {
  return tw(POSITIONER, !isPresented && 'hidden', isTop ? 'z-1' : null);
}
