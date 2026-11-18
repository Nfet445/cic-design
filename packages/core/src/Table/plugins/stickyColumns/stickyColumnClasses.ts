// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file stickyColumnClasses.ts
 * @input The attributes `glidingDivider.ts` marks while a row moves, the row
 *   overlay and divider variables the cell reads, and the scroll-shadow state
 *   variables the plugin sets on the scroll wrapper
 * @output Literal class names for a pinned cell, the divider layer in its
 *   `::before` and the edge shadow in its `::after`
 * @position Table sticky-columns plugin. The text lives here, in a
 *   `*Classes.ts` module, because the Tailwind build scans only those;
 *   `useTableStickyColumns.tsx` holds the logic and attaches these names.
 *
 * SYNC: When modified, update useTableStickyColumns.tsx and
 *   glidingDivider.ts (the divider variables both read).
 */

import {tw} from '../../../utils/tw';

/**
 * The pinned cell. Its opaque base hides the columns scrolling under it, and
 * its `::before` replays the row's overlay and draws the divider, so a pinned
 * column keeps the row's striping, hover and line while it moves.
 *
 * `overflow-visible` follows `overflow-hidden` in the sheet, so the cell's
 * truncation class does not clip the `::after` shadow.
 */
/* eslint-disable @astryx/no-raw-private-attribute -- Tailwind scans class text,
   so the private `data-astryx-cell-gliding` and `data-astryx-table-pinned`
   have to be spelled here; Table/glidingDivider.ts writes both names today and
   owns their meaning. */
export const stickyColumnCellClassName = tw(
  '[background-color:var(--table-sticky-background,var(--color-background-card))]',
  // padding-box keeps the base off the cell's collapsed divider border.
  '[background-clip:padding-box]',
  'overflow-visible',
  // The overlay layer: above the base, below the text.
  "before:content-['']",
  'before:absolute',
  'before:inset-0',
  'before:[z-index:-1]',
  'before:pointer-events-none',
  'before:[background-color:var(--table-row-overlay,transparent)]',
  // The divider: the layer reaches the bottom of the cell's border area,
  // paints the pinned base there (hiding the table's static border and any
  // scrolled cell's border), then the divider over it.
  'before:-mb-[var(--_table-row-divider-app-width,var(--_table-row-divider-width,0px))]',
  'before:[border-bottom-width:var(--_table-row-divider-app-width,var(--_table-row-divider-width,0px))]',
  'before:[border-bottom-style:inherit]',
  'before:[border-bottom-color:inherit]',
  'before:[background-image:linear-gradient(var(--table-sticky-background,var(--color-background-card)),var(--table-sticky-background,var(--color-background-card)))]',
  'before:[background-size:100%_var(--_table-row-divider-app-width,var(--_table-row-divider-width,0px))]',
  'before:[background-position:bottom]',
  'before:[background-repeat:no-repeat]',
  'before:[background-origin:border-box]',
  'before:[background-clip:border-box]',
  // background-COLOR transitions, not background-image, so hover stays smooth
  // at rest and not only when GPU-promoted while scrolled.
  'before:[transition-property:background-color]',
  'before:[transition-duration:var(--duration-fast)]',
  'before:[transition-timing-function:var(--ease-standard)]',
  // While its row glides, the divider is the row's, carried for the glide.
  '[[data-astryx-cell-gliding]]:before:-mb-[var(--_table-row-glide-width,var(--_table-row-divider-app-width,var(--_table-row-divider-width,0px)))]',
  '[[data-astryx-cell-gliding]]:before:[border-bottom-width:var(--_table-row-glide-width,var(--_table-row-divider-app-width,var(--_table-row-divider-width,0px)))]',
  '[[data-astryx-cell-gliding]]:before:[border-bottom-style:var(--_table-row-glide-style,solid)]',
  '[[data-astryx-cell-gliding]]:before:[border-bottom-color:var(--_table-row-glide-color,var(--color-border))]',
  '[[data-astryx-cell-gliding]]:before:[background-size:100%_var(--_table-row-glide-width,var(--_table-row-divider-app-width,var(--_table-row-divider-width,0px)))]',
  // The cell's own border at another width: only the width is carried, so a
  // restyle of its colour or style still reaches the pinned divider.
  '[[data-astryx-table-pinned=carry]]:before:[border-bottom-style:var(--_table-row-divider-app-style,solid)]',
  '[[data-astryx-table-pinned=carry]]:before:[border-bottom-color:var(--_table-row-divider-app-color,var(--color-border))]',
);
/* eslint-enable @astryx/no-raw-private-attribute */

/** Header cells stack above body cells; both stack above non-sticky cells. */
export const stickyColumnHeaderCellClassName = 'z-[3]';

/** Body cells stack above the non-sticky cells they cover. */
export const stickyColumnBodyCellClassName = 'z-[1]';

/**
 * The scroll shadow of a start-pinned column: a gradient strip in `::after`,
 * one full width past the column's inline-end edge so it falls over the
 * scrolled content. Outward is +X under LTR but −X under RTL, and the fade
 * runs from the pinned edge toward content, so both the transform and the
 * gradient flip on direction. Only `opacity` is gated by the scroll state.
 *
 * The `rtl:` arms follow the plain utilities in the sheet and add no
 * specificity, so they win by order; no StyleX map is left to hold the flip.
 */
export const stickyColumnShadowStartClassName = tw(
  "after:content-['']",
  'after:absolute',
  'after:inset-y-0',
  'after:end-0',
  'after:w-[6px]',
  'after:[transform:translateX(100%)]',
  'rtl:after:[transform:translateX(-100%)]',
  'after:pointer-events-none',
  'after:[transition-property:opacity]',
  'after:[transition-duration:150ms]',
  'after:[transition-timing-function:ease]',
  'after:[opacity:var(--table-sticky-shadow-start,0)]',
  'after:[background-image:linear-gradient(to_right,var(--color-shadow),transparent)]',
  'rtl:after:[background-image:linear-gradient(to_left,var(--color-shadow),transparent)]',
);

/**
 * The scroll shadow of an end-pinned column: mirrored from the start shadow.
 * It sits on the column's inline-start edge and falls toward content, which is
 * −X under LTR and +X under RTL.
 */
export const stickyColumnShadowEndClassName = tw(
  "after:content-['']",
  'after:absolute',
  'after:inset-y-0',
  'after:start-0',
  'after:w-[6px]',
  'after:[transform:translateX(-100%)]',
  'rtl:after:[transform:translateX(100%)]',
  'after:pointer-events-none',
  'after:[transition-property:opacity]',
  'after:[transition-duration:150ms]',
  'after:[transition-timing-function:ease]',
  'after:[opacity:var(--table-sticky-shadow-end,0)]',
  'after:[background-image:linear-gradient(to_left,var(--color-shadow),transparent)]',
  'rtl:after:[background-image:linear-gradient(to_right,var(--color-shadow),transparent)]',
);
