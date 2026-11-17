// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file mobileNavClasses.ts
 * @input Which edge the drawer is anchored to, whether the dialog is held
 *   presented, and whether it is open; the runtime writes the width
 * @output Utility class strings for the nav's `<dialog>`, its scrim, the
 *   drawer, the header row and the scrolling content
 * @position MobileNav style primitives; scanned by the Tailwind build
 *
 * `display` is one class, never a state pair: two classes in one layer cannot
 * outrank each other. The dialog also transitions `display` with
 * `allow-discrete`, so it stays rendered until the slide-out ends.
 *
 * A width arrives as a custom property the runtime writes on the drawer
 * (`--astryx-mobile-nav-width`), so a class reads it and no declaration lands
 * inline.
 */

import {tw} from '../utils/tw';

/** The width the drawer takes, never more than 85% of the viewport. */
export const mobileNavWidthVar = '--astryx-mobile-nav-width';

/** Which inline edge the drawer is anchored to. */
export type MobileNavSide = 'start' | 'end';

// `clip`, not `hidden`: `hidden` makes the dialog a scroll container, and a
// scroll container in the top layer whose subtree holds another scroller does
// not paint the drawer's entry transition in Chromium.
const DIALOG = tw(
  'fixed',
  'm-0',
  'p-0',
  'border-0',
  'border-none',
  'max-w-none',
  'max-h-none',
  'inset-0',
  'w-[100vw]',
  'h-[100dvh]',
  'bg-transparent',
  'overflow-clip',
  'overscroll-contain',
  'outline-none',
  // Panning stops at the nav (no pull-to-refresh, no background scroll);
  // pinch stays with the browser, which is how phone readers resize text.
  '[touch-action:pinch-zoom]',
  // `display` is discrete: its long-duration transition animates nothing, it
  // only holds the window the close has to land inside.
  '[transition-property:display]',
  '[transition-duration:var(--duration-medium)]',
  '[transition-behavior:allow-discrete]',
);

// No backdrop-filter: a full-viewport blur is costly to repaint.
const BACKDROP = tw(
  'backdrop:bg-[var(--color-overlay)]',
  'backdrop:opacity-0',
  'backdrop:[transition-property:opacity]',
  'backdrop:[transition-duration:var(--duration-medium)]',
  'backdrop:[transition-timing-function:var(--ease-standard)]',
  'motion-reduce:backdrop:[transition-duration:0.01s]',
);

// `::backdrop` exists only once showModal() has put the dialog in the top
// layer, so its first rendered frame already carries the open opacity;
// `@starting-style` supplies the value to transition from.
const BACKDROP_OPEN = tw(
  'backdrop:opacity-100',
  '[@starting-style]:backdrop:opacity-0',
);

const DRAWER = tw(
  'absolute',
  'top-0',
  'bottom-0',
  'flex',
  'flex-col',
  'box-border',
  'overflow-hidden',
  'outline-none',
  'bg-[var(--color-background-surface)]',
  '[transition-property:transform]',
  '[transition-duration:var(--duration-medium)]',
  '[transition-timing-function:var(--ease-standard)]',
  'motion-reduce:[transition-duration:0.01s]',
  'w-[var(--astryx-mobile-nav-width)]',
  'max-w-[85vw]',
);

const START = tw(
  'start-0',
  '[border-inline-end-width:var(--border-width)]',
  '[border-inline-end-style:solid]',
  '[border-inline-end-color:var(--color-border)]',
);

const END = tw(
  'end-0',
  '[border-inline-start-width:var(--border-width)]',
  '[border-inline-start-style:solid]',
  '[border-inline-start-color:var(--color-border)]',
);

// Directionality comes from the element's own resolved direction, so a nearer
// `dir` override wins over an ancestor's.
const START_CLOSED = tw(
  '[transform:translateX(-100%)]',
  '[&:dir(rtl)]:[transform:translateX(100%)]',
);

// The dialog is `display: none` while closed, so the drawer never had an
// earlier transform to transition from. `@starting-style` gives the first
// rendered frame the off-screen value, so the slide-in plays.
const START_OPEN = tw(
  '[transform:translateX(0)]',
  '[@starting-style]:[transform:translateX(-100%)]',
  '[@starting-style]:[&:dir(rtl)]:[transform:translateX(100%)]',
);

const END_CLOSED = tw(
  '[transform:translateX(100%)]',
  '[&:dir(rtl)]:[transform:translateX(-100%)]',
);

const END_OPEN = tw(
  '[transform:translateX(0)]',
  '[@starting-style]:[transform:translateX(100%)]',
  '[@starting-style]:[&:dir(rtl)]:[transform:translateX(-100%)]',
);

// One bar high at least, and taller for header content that needs it, so it
// never runs into the first item below.
const HEADER = tw(
  'flex',
  'items-center',
  'justify-between',
  'shrink-0',
  'min-h-[var(--spacing-12)]',
  'px-[var(--spacing-2)]',
  '[border-block-end-width:var(--border-width)]',
  '[border-block-end-style:solid]',
  '[border-block-end-color:var(--color-border)]',
);

const CONTENT = tw(
  'flex-1',
  'overflow-y-auto',
  'overflow-x-hidden',
  'overscroll-contain',
  'px-[var(--spacing-2)]',
  'py-[var(--spacing-2)]',
  // The drawer content scrolls vertically; the dialog root keeps panning off.
  '[touch-action:pan-y_pinch-zoom]',
);

/** The class set of the nav's `<dialog>` host. */
export function mobileNavDialogClassName({
  isPresentationHeld,
  isOpen,
}: {
  isPresentationHeld: boolean;
  isOpen: boolean;
}): string {
  return tw(
    DIALOG,
    BACKDROP,
    isOpen && BACKDROP_OPEN,
    isPresentationHeld ? 'flex' : 'hidden',
  );
}

/** The class set of the drawer panel. */
export function mobileNavDrawerClassName({
  side,
  isOpen,
}: {
  side: MobileNavSide;
  isOpen: boolean;
}): string {
  const isStart = side === 'start';
  return tw(
    DRAWER,
    isStart ? START : END,
    isStart
      ? isOpen
        ? START_OPEN
        : START_CLOSED
      : isOpen
        ? END_OPEN
        : END_CLOSED,
  );
}

/** The class set of the header row. */
export function mobileNavHeaderClassName({
  hasTitle,
}: {
  hasTitle: boolean;
}): string {
  return tw(HEADER, !hasTitle && 'justify-end');
}

/** The class set that offsets the header text from the close button. */
export const mobileNavHeaderTextClassName = 'ms-[var(--spacing-2)]';

/** The class set of the scrolling content area. */
export const mobileNavContentClassName = CONTENT;
