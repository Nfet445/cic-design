// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file powerSearchSheetClasses.ts
 * @input The sheet flow's panel content: header, body, viewport, footer and
 *   the touch targets
 * @output Utility class names for those surfaces
 * @position Style primitives; scanned by the Tailwind build
 *
 * A sheet action drawn smaller than 44px keeps its drawn size and grows only
 * its hit area under a coarse pointer: two custom properties carry the media
 * condition into a single `::after` box, so a fine pointer generates no
 * overlay and the overlay never takes hover from the action's own content.
 */

import {tw} from '../utils/tw';

/** 44px touch targets for every sheet action, without resizing inputs. */
export const powerSearchSheetTouchActionClassName = 'min-h-[44px]';

export const powerSearchSheetTouchHitAreaClassName = tw(
  '[--_power-search-sheet-hit-inset:0px]',
  'pointer-coarse:[--_power-search-sheet-hit-inset:min(0px,calc((100%_-_44px)/2))]',
  '[--_power-search-sheet-hit-content:none]',
  'pointer-coarse:[--_power-search-sheet-hit-content:""]',
  'after:absolute',
  'after:inset-[var(--_power-search-sheet-hit-inset)]',
  'after:content-[var(--_power-search-sheet-hit-content)]',
);

/*
 * The sheet content is isolated: the List rows are positioned and come after
 * the header, so without a layer of its own the header paints under the rows
 * that scroll beneath it, while the panel's grab handle still paints above.
 */
export const powerSearchSheetClassName = 'flex flex-col min-h-full isolate';

/** The Filters and Add filter sheets scroll only their viewport. */
export const powerSearchSheetWithFixedFooterClassName =
  'h-full overflow-hidden';

export const powerSearchSheetHeaderClassName =
  'sticky top-0 z-[1] flex flex-col gap-3 pb-3 px-4 bg-[var(--color-background-surface)]';

/** The value sheet rises into the band the sheet keeps under its grab bar. */
export const powerSearchSheetHeaderScrollsToTopClassName = '-mt-6 pt-6';

export const powerSearchSheetHeaderRowClassName = 'flex items-center gap-2';

export const powerSearchSheetHeaderTextClassName = 'min-w-0 grow flex flex-col';

/** The body pads the content and publishes that padding to its lists. */
export const powerSearchSheetBodyClassName =
  'grow flex flex-col gap-4 px-4 pb-4';

export const powerSearchSheetScrollViewportClassName =
  'grow min-h-0 overflow-y-auto overscroll-y-contain';

export const powerSearchSheetScrollContentClassName =
  'min-h-full flex flex-col gap-4 px-4 pb-4';

export const powerSearchSheetFooterClassName =
  'sticky bottom-0 z-[1] flex items-center justify-between gap-2 py-3 px-4 bg-[var(--color-background-surface)]';

export const powerSearchSheetFixedFooterClassName =
  'relative bottom-auto shrink-0';

export const powerSearchSheetFooterEqualActionClassName =
  'grow basis-0 min-w-0 min-h-[44px]';

export const powerSearchSheetFooterSoleActionClassName = 'grow';

export const powerSearchSheetEmptyClassName = 'py-6 text-center';

export const powerSearchSheetEmptyStateClassName =
  'grow flex items-center justify-center';

/** With more than one section in the value step, each section is muted. */
export const powerSearchSheetControlSectionClassName =
  'p-3 rounded-[var(--radius-container)] bg-[var(--color-background-muted)]';

/*
 * The built-in nested editor wraps its rows under a container query; the sheet
 * renders no popover container, so the editor's tree root is the query
 * container here and rows wrap at phone widths instead of running past the
 * sheet's edge.
 */
export const powerSearchSheetNestedEditorContainerClassName =
  '[container-type:inline-size] overflow-hidden';

export const powerSearchSheetRowValueClassName =
  '[font-weight:var(--font-weight-bold)]';

export const powerSearchSheetEditorInputClassName = 'pt-1';
