// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file dialogClasses.ts
 * @input The dialog variant, whether it carries an explicit position, and the
 *   entrance the reduced-motion rules pick; the runtime writes the sizing and
 *   offset values
 * @output Utility class strings for the modal dialog, its inline preview
 *   wrapper, and the scrolling inner surface
 * @position Dialog style primitives; scanned by the Tailwind build
 *
 * The native `<dialog>` element owns the open state through its `open`
 * attribute, so every state class keys off that attribute instead of relying
 * on sheet order inside `@layer astryx-base`: `open:flex` beats `hidden`
 * because `[open]` adds a compound selector.
 *
 * A size or a position arrives as a custom property the runtime writes on the
 * element (`--astryx-dialog-*`). A class reads it, so no declaration lands
 * inline.
 */

import {tw} from '../utils/tw';

/** The preferred width of a standard dialog. */
export const dialogWidthVar = '--astryx-dialog-width';
/** The maximum width of a standard dialog. */
export const dialogMaxWidthVar = '--astryx-dialog-max-width';
/** The maximum height of a standard dialog. */
export const dialogMaxHeightVar = '--astryx-dialog-max-height';
/** A positioned dialog's block-start offset. */
export const dialogInsetBlockStartVar = '--astryx-dialog-inset-block-start';
/** A positioned dialog's block-end offset. */
export const dialogInsetBlockEndVar = '--astryx-dialog-inset-block-end';
/** A positioned dialog's inline-start offset. */
export const dialogInsetInlineStartVar = '--astryx-dialog-inset-inline-start';
/** A positioned dialog's inline-end offset. */
export const dialogInsetInlineEndVar = '--astryx-dialog-inset-inline-end';

/** The entrance the reduced-motion rules leave a dialog. */
export type DialogEntrance = 'slide' | 'fade' | 'none';

// The reduced-motion arms cannot both match, and the coarser one prints later
// in the sheet, so its cross-fade follows the instant arm (the same split the
// layer entrance uses). The fade carries its own curve, so the published
// timing function stays the theme ease's.
const ENTRANCE_CLASSES: Record<DialogEntrance, string> = {
  slide: tw(
    'open:[animation-name:astryxDialogEnter]',
    'motion-reduce:open:[animation-name:none]',
    'motion-reduce:pointer-coarse:open:[animation-name:astryxDialogEnterFullscreen]',
  ),
  fade: tw(
    'open:[animation-name:astryxDialogEnterFullscreen]',
    'motion-reduce:open:[animation-name:none]',
    'motion-reduce:pointer-coarse:open:[animation-name:astryxDialogEnterFullscreen]',
  ),
  none: 'open:[animation-name:none]',
};

// No backdrop-filter: a full-viewport blur is costly to repaint. The backdrop
// colour is the theme's overlay token.
const ROOT_BASE = tw(
  'fixed',
  'p-0',
  'bg-[var(--color-background-surface)]',
  '[--_dialog-radius:var(--radius-container)]',
  'shadow-[var(--shadow-high)]',
  'hidden',
  'open:flex',
  'flex-col',
  'opacity-0',
  'open:opacity-100',
  'backdrop:bg-[var(--color-overlay)]',
  '[overscroll-behavior:contain]',
  '[animation-duration:var(--duration-medium-max)]',
  '[animation-timing-function:var(--ease-standard)]',
  '[animation-fill-mode:backwards]',
  'motion-reduce:pointer-coarse:[animation-duration:200ms]',
  'motion-reduce:pointer-coarse:[animation-timing-function:cubic-bezier(0.42,0,0.58,1)]',
);

// The backdrop does not separate a forced-colors dialog from the page, so a
// 1px border does. It is a border, not an outline: the focus ring owns the
// outline longhands on this element.
const SURFACE_EDGE = tw(
  'rounded-[var(--_dialog-radius)]',
  'border-0',
  'border-none',
  'forced-colors:border',
  'forced-colors:[border-color:CanvasText]',
);

const STANDARD_GEOMETRY = tw('m-auto', 'h-fit', SURFACE_EDGE);

const POSITIONED_GEOMETRY = tw(
  'm-0',
  'h-fit',
  SURFACE_EDGE,
  '[inset-block-start:var(--astryx-dialog-inset-block-start)]',
  '[inset-block-end:var(--astryx-dialog-inset-block-end)]',
  '[inset-inline-start:var(--astryx-dialog-inset-inline-start)]',
  '[inset-inline-end:var(--astryx-dialog-inset-inline-end)]',
);

// Nothing of the page shows around a full-screen dialog, so it has no edge.
const FULLSCREEN_GEOMETRY = tw(
  'inset-0',
  'm-0',
  'h-[100dvh]',
  'w-[100dvw]',
  'max-h-[100dvh]',
  'max-w-[100dvw]',
  '[--_dialog-radius:0px]',
  'rounded-none',
  'border-0',
  'border-none',
);

// Whole literals, never assembled from the exported names: the build scans this
// file's text, so a template expression would emit no rule.
const SIZING = tw(
  '[width:var(--astryx-dialog-width,auto)]',
  '[max-width:var(--astryx-dialog-max-width,none)]',
  '[max-height:var(--astryx-dialog-max-height,none)]',
);

/** The scrolling surface inside the dialog, above its padding. */
const INNER = tw(
  'flex',
  'min-h-0',
  'flex-auto',
  'flex-col',
  'overflow-hidden',
  '[border-radius:inherit]',
  '[--_container-corner-block-start:var(--_dialog-radius)]',
  '[--_container-corner-block-end:var(--_dialog-radius)]',
);

// The inline preview is not a `<dialog>`: it is always visible, so it carries
// the open state's declarations directly.
const INLINE_BASE = tw(
  'p-0',
  'bg-[var(--color-background-surface)]',
  '[--_dialog-radius:var(--radius-container)]',
  'shadow-[var(--shadow-high)]',
  'flex',
  'flex-col',
  '[overscroll-behavior:contain]',
);

/** The class set of the modal `<dialog>` element. */
export function dialogRootClassName({
  isFullscreen,
  isPositioned,
  entrance,
}: {
  isFullscreen: boolean;
  isPositioned: boolean;
  entrance: DialogEntrance;
}): string {
  const geometry = isFullscreen
    ? FULLSCREEN_GEOMETRY
    : isPositioned
      ? POSITIONED_GEOMETRY
      : STANDARD_GEOMETRY;
  return tw(
    ROOT_BASE,
    geometry,
    !isFullscreen && SIZING,
    ENTRANCE_CLASSES[entrance],
  );
}

/** The class set of the scrolling inner surface. */
export const dialogInnerClassName = INNER;

/** The class set of an inline dialog preview wrapper. */
export function dialogInlineClassName({
  isFullscreen,
}: {
  isFullscreen: boolean;
}): string {
  return tw(
    INLINE_BASE,
    isFullscreen ? FULLSCREEN_GEOMETRY : tw('h-fit', SURFACE_EDGE),
    isFullscreen ? undefined : SIZING,
  );
}
