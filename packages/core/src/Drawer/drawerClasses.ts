// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file drawerClasses.ts
 * @input The anchored side, whether the panel paints, whether it is open,
 *   whether a scrim sits behind it, and whether it opens settled; the runtime
 *   writes the width values
 * @output Utility class strings for the drawer panel and its scrolling content
 *   area
 * @position Drawer style primitives; scanned by the Tailwind build
 *
 * `display` is not a state class: a class cannot outrank another class of the
 * same layer, so the panel prints one display utility at a time. React owns
 * which one, because a panel still painting after its top-layer host releases
 * it snaps back into the layout (see the component's `isRendered`).
 *
 * A width arrives as a custom property the runtime writes on the element
 * (`--astryx-drawer-*`). A class reads it, so no declaration lands inline.
 */

import {tw} from '../utils/tw';

/** The desktop width budget of the panel. */
export const drawerWidthVar = '--astryx-drawer-width';
/** The width the panel takes below the mobile breakpoint. */
export const drawerMobileWidthVar = '--astryx-drawer-mobile-width';

/** Which inline edge the panel is anchored to. */
export type DrawerSide = 'start' | 'end';

// The dialog element IS the panel, so its native defaults reset here.
// `clip`, not `hidden`: `hidden` makes the panel a scroll container, and
// Chromium then holds a finger's drag on the page beside an open non-modal
// drawer in that container's overscroll containment.
const PANEL = tw(
  'fixed',
  'm-0',
  'p-0',
  'border-0',
  'border-none',
  'rounded-none',
  'max-w-none',
  'max-h-none',
  'box-border',
  'flex-col',
  'bg-[var(--color-background-surface)]',
  'shadow-[var(--shadow-high)]',
  'overflow-clip',
  'outline-none',
  '[inset-block:0]',
  'h-[100dvh]',
  '[transition-property:transform]',
  '[width:var(--astryx-drawer-width)]',
  '[@media(max-width:640px)]:[width:var(--astryx-drawer-mobile-width)]',
  'max-w-[100dvw]',
);

const END = tw(
  'end-0',
  'start-auto',
  '[border-inline-start-width:var(--border-width)]',
  '[border-inline-start-style:solid]',
  '[border-inline-start-color:var(--color-border)]',
);

const START = tw(
  'start-0',
  'end-auto',
  '[border-inline-end-width:var(--border-width)]',
  '[border-inline-end-style:solid]',
  '[border-inline-end-color:var(--color-border)]',
);

// Directionality comes from the element's own resolved direction, so the exit
// travel follows the edge the panel is anchored to, and a nearer `dir` override
// wins over an ancestor's.
const END_CLOSED = tw(
  '[transform:translateX(100%)]',
  '[&:dir(rtl)]:[transform:translateX(-100%)]',
);

const END_OPEN = tw(
  '[transform:translateX(0)]',
  '[@starting-style]:[transform:translateX(100%)]',
  '[@starting-style]:[&:dir(rtl)]:[transform:translateX(-100%)]',
);

const START_CLOSED = tw(
  '[transform:translateX(-100%)]',
  '[&:dir(rtl)]:[transform:translateX(100%)]',
);

const START_OPEN = tw(
  '[transform:translateX(0)]',
  '[@starting-style]:[transform:translateX(-100%)]',
  '[@starting-style]:[&:dir(rtl)]:[transform:translateX(100%)]',
);

// A drawer present on page load opens where it rests: the collapse reduced
// motion uses, so the transition still ends.
function panelTransition(opensSettled: boolean): string {
  return opensSettled
    ? tw('[transition-duration:0.01s]', 'backdrop:[transition-duration:0.01s]')
    : tw(
        '[transition-duration:var(--duration-medium)]',
        '[transition-timing-function:var(--ease-standard)]',
        'motion-reduce:[transition-duration:0.01s]',
        'backdrop:[transition-duration:var(--duration-medium)]',
        'motion-reduce:backdrop:[transition-duration:0.01s]',
      );
}

// Scrim via the browser's ::backdrop pseudo-element (top layer). No
// backdrop-filter: a full-viewport blur is costly to repaint.
const SCRIM = tw(
  'backdrop:bg-[var(--color-overlay)]',
  'backdrop:opacity-0',
  'backdrop:[transition-property:opacity]',
  'backdrop:[transition-timing-function:var(--ease-standard)]',
);

const SCRIM_OPEN = tw(
  'backdrop:opacity-100',
  '[@starting-style]:backdrop:opacity-0',
);

/** The class set of the drawer's `<dialog>` panel. */
export function drawerRootClassName({
  side,
  isRendered,
  isOpen,
  hasScrim,
  opensSettled,
}: {
  side: DrawerSide;
  isRendered: boolean;
  isOpen: boolean;
  hasScrim: boolean;
  opensSettled: boolean;
}): string {
  const isEnd = side === 'end';
  return tw(
    PANEL,
    isEnd ? END : START,
    isRendered ? 'flex' : 'hidden',
    isOpen && (isEnd ? END_OPEN : START_OPEN),
    !isOpen && (isEnd ? END_CLOSED : START_CLOSED),
    panelTransition(opensSettled),
    hasScrim && SCRIM,
    hasScrim && isOpen && SCRIM_OPEN,
  );
}

// The scrolling area paints the surface itself, covering the panel's whole
// inner box: a theme that packs an inset ring into --shadow-high would
// otherwise show it only in the gap below where opaque content ends. Its
// container padding comes from the layout container rules, which are
// unlayered and therefore outrank this layer.
const CONTENT = tw(
  'grow',
  'min-h-0',
  'w-full',
  'overflow-y-auto',
  'overflow-x-hidden',
  'overscroll-contain',
  'touch-pan-y',
  'outline-none',
  'bg-[var(--color-background-surface)]',
);

/** The class set of the scrolling content area. */
export const drawerContentClassName = CONTENT;
