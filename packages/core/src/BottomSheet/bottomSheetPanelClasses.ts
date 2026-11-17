// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file bottomSheetPanelClasses.ts
 * @input The panel's height state, its keyboard inset, and the sheet's custom
 *   properties
 * @output Utility class strings for the sheet, the grab bar, the scrolling
 *   body and the content box
 * @position BottomSheet style primitives; scanned by the Tailwind build
 *
 * `pointer-events` has two arms in one class set and both may apply in a
 * render, so the function prints one arm at a time. Travel, the exit curve and
 * the transition band are not here: the panel reads its own computed
 * transition to time the end of a motion, so they stay in
 * `bottomSheetPanelMotion.stylex.ts`.
 *
 * The block-start padding of the content box is not here either: the layout
 * container rules that publish it are unlayered and outrank this layer (see
 * `bottomSheetPanelPadding.stylex.ts`).
 */

import type {CSSProperties} from 'react';

import {tw} from '../utils/tw';

/**
 * The keyboard inset is a value, not a variant: the content box's `::after`
 * reads it from a variable this element writes inline, so a consumer `xstyle`
 * still overrides the reservation.
 */
export type BottomSheetPanelInstanceStyle = CSSProperties &
  Partial<Record<'--astryx-bottom-sheet-keyboard-inset', string>>;

const SHEET = tw(
  'box-border',
  'relative',
  'flex',
  'flex-col',
  'min-h-0',
  'w-full',
  'max-w-[640px]',
  'bg-[var(--color-background-surface)]',
  // A hairline on the three edges that face the scrim, so the sheet's side
  // edges stay visible in dark mode. The block-end edge sits below the
  // viewport and carries none.
  '[border-block-start-width:var(--border-width)]',
  '[border-block-start-style:solid]',
  '[border-block-start-color:var(--color-border)]',
  '[border-inline-start-width:var(--border-width)]',
  '[border-inline-start-style:solid]',
  '[border-inline-start-color:var(--color-border)]',
  '[border-inline-end-width:var(--border-width)]',
  '[border-inline-end-style:solid]',
  '[border-inline-end-color:var(--color-border)]',
  'rounded-t-[var(--radius-container)]',
  'shadow-[var(--shadow-high)]',
  'outline-none',
  'overflow-hidden',
  'pb-[calc(env(safe-area-inset-bottom,0px)+var(--_sheet-reserve,48px))]',
  'mb-[calc(-1*var(--_sheet-reserve,48px))]',
  'will-change-[transform,opacity]',
);

export interface BottomSheetPanelClassState {
  /** The sheet occupies 'hug' rather than its height budget. */
  isHug: boolean;
  /** A retained sheet that took no pointer input. */
  isInactive: boolean;
}

/** The class set of the sheet panel. */
export function bottomSheetPanelClassName({
  isHug,
  isInactive,
}: BottomSheetPanelClassState): string {
  return tw(
    SHEET,
    isHug
      ? tw('h-fit', 'max-h-[calc(92dvh+var(--_sheet-reserve,48px))]')
      : '[height:calc(var(--_sheet-budget)+var(--_sheet-reserve,48px))]',
    isInactive ? 'pointer-events-none' : 'pointer-events-auto',
  );
}

// The bar floats over the body rather than taking a row in the flex column, so
// scrolled content rides up under the pill.
const HANDLE_BAR = tw(
  'absolute',
  'inset-block-start-0',
  'inset-inline-start-0',
  'inset-inline-end-0',
  'z-1',
  'flex',
  'items-center',
  'justify-center',
  'h-[var(--spacing-6)]',
  // Opaque surface behind the pill itself, fading out across the lower half
  // so content emerging below has no visible cut line.
  'bg-[linear-gradient(to_bottom,var(--color-background-surface)_60%,transparent)]',
  // WebKit can draw this bar under the scrolling body's own layer while the
  // sheet's transform animates; a layer of its own keeps it above the body.
  'will-change-transform',
  'touch-pinch-zoom',
  'cursor-grab',
  '[&:is(:disabled,[aria-disabled="true"])]:cursor-default',
  // The pill is decoration on the grab bar itself, with no role.
  "before:content-['']",
  'before:w-[var(--size-element-lg)]',
  'before:h-[var(--spacing-1)]',
  'before:rounded-[var(--radius-full)]',
  'before:bg-[var(--color-border)]',
);

/** The class set of the floating grab bar. */
export const bottomSheetHandleBarClassName = HANDLE_BAR;

const BODY = tw(
  'grow',
  'min-h-0',
  'box-border',
  'touch-pan-y',
  '[outline-offset:0]',
  'focus-visible:[outline-offset:calc(-1*var(--focus-outline-width))]',
  // The scrolling area paints the surface across the sheet's whole inner box,
  // so a theme's inset --shadow-high ring shows evenly instead of only in the
  // gap where opaque content ends.
  'bg-[var(--color-background-surface)]',
  'pb-0',
);

/** The keyboard's scroll padding at the end of a Tall sheet's content. */
const TALL_KEYBOARD_BODY = '[scroll-padding-block-end:48px]';

/** The class set of the scrolling body. */
export function bottomSheetBodyClassName(isTall: boolean): string {
  return tw(BODY, isTall && TALL_KEYBOARD_BODY);
}

const CONTENT = tw('flow-root', 'box-border', 'h-full', 'min-h-fit');

// In flow after the content's own children, so its height stays inside the
// content box Firefox resolves as `auto` in the block axis.
const TALL_KEYBOARD_CONTENT = tw(
  "after:content-['']",
  'after:block',
  'after:h-0',
  'after:pointer-events-none',
);

/** The content box's class set, with the keyboard inset its `::after` reserves. */
export function bottomSheetContentClassName({
  isTall,
  hasKeyboardInset,
}: {
  isTall: boolean;
  hasKeyboardInset: boolean;
}): string {
  return tw(
    CONTENT,
    isTall && TALL_KEYBOARD_CONTENT,
    hasKeyboardInset && 'after:h-[var(--astryx-bottom-sheet-keyboard-inset)]',
  );
}
