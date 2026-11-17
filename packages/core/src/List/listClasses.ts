// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file listClasses.ts
 * @input The List's dividers, its markers, whether it animates its rows,
 *   renders a header, reaches into the container's padding, and the number a
 *   counted list starts at
 * @output Utility class strings for the list frame, its numbered columns, its
 *   container-reaching margins, the corners it publishes to bled rows, and its
 *   header
 * @position Style primitives; scanned by the Tailwind build. List composes
 *   these on the `<ul>`/`<ol>` it renders and on its header wrapper
 */

import {tw} from '../utils/tw';

/**
 * The list frame. `gap-0` replaces the gap rather than overriding it: two
 * classes of the same property are decided by the sheet's order, not by the
 * class attribute, so a divided list states its own gap instead.
 *
 * `overflow-x-clip`, never `hidden`: hidden makes a scroll container, which
 * fights the list's vertical scroller.
 */
const FRAME = tw('flex flex-col m-0 ps-0 list-none overflow-x-clip');

/**
 * Under a finger, the list is the isolation boundary for what rises inside
 * it: a row's touch band and a swipeable row order above the rows after them,
 * and stay below a page-level sticky header at the same z-index. With a mouse
 * nothing rises, so the list keeps its stacking.
 */
export const LIST_COARSE_ISOLATION = 'pointer-coarse:isolate';

/**
 * A list that animates its rows isolates for every pointer: a row that slides
 * across others rides above them with a mouse too, and it must stay below a
 * page-level sticky header.
 */
export const LIST_ANIMATED_ISOLATION = 'isolate';

/**
 * Subgridded numbered rows contribute their marker's intrinsic width to one
 * column, so text and nested lists never move with an individual number.
 * Browsers without subgrid lay the list out as a flex column instead.
 */
export const LIST_NUMBER_COLUMNS = tw(
  'flex supports-[grid-template-columns:subgrid]:grid',
  '[grid-template-columns:max-content_minmax(0,1fr)] gap-x-2',
);

export const LIST_DIVIDED_GAP = 'gap-0';
export const LIST_ROW_GAP = 'gap-0.5';

/**
 * 'outset' and 'bleed' rows reach into the container's padding. The list
 * reaches the container's padding edge on each inline edge first, so its
 * inline clip moves out with the rows instead of cutting them; each row then
 * places itself inside it. Container padding vars are inherited, so the list
 * can read them. Missing or reset container padding resolves to zero.
 */
export const LIST_REACHES_CONTAINER_PADDING = tw(
  'ms-[calc(-1*var(--container-padding-inline-start,0px))]',
  'me-[calc(-1*var(--container-padding-inline-end,0px))]',
  'w-[calc(100%+var(--container-padding-inline-start,0px)+var(--container-padding-inline-end,0px))]',
);

/**
 * 'bleed' rows reach the container's padding edge inline and keep its block
 * padding, so the list passes its first and last rows the corner a rounded
 * container publishes, less that block padding. It is at a corner only as the
 * container's first or last child.
 *
 * Each corner is published twice: once as zero, once inside the `first:` or
 * `last:` variant. The variant outranks the plain class, so a list that is
 * not the container's first child keeps the published zero. The classes are
 * spelled out in full: the build reads class text from this file, so a class
 * assembled from parts never reaches the sheet.
 */
export const LIST_BLEED_CORNERS = tw(
  '[--_list-corner-start-start:0px]',
  'first:[--_list-corner-start-start:max(0px,var(--container-corner-start-start,0px)-var(--container-padding-block-start,0px))]',
  '[--_list-corner-start-end:0px]',
  'first:[--_list-corner-start-end:max(0px,var(--container-corner-start-end,0px)-var(--container-padding-block-start,0px))]',
  '[--_list-corner-end-start:0px]',
  'last:[--_list-corner-end-start:max(0px,var(--container-corner-end-start,0px)-var(--container-padding-block-end,0px))]',
  '[--_list-corner-end-end:0px]',
  'last:[--_list-corner-end-end:max(0px,var(--container-corner-end-end,0px)-var(--container-padding-block-end,0px))]',
);

/**
 * With a header, the list's root is the container's child and the header sits
 * above the first row: only the block-end corners reach the first row.
 */
export const LIST_BLEED_CORNERS_BELOW_HEADER = tw(
  '[--_list-corner-start-start:0px]',
  '[--_list-corner-start-end:0px]',
  '[--_list-corner-end-start:0px]',
  'last:[--_list-corner-end-start:max(0px,var(--container-corner-end-start,0px)-var(--container-padding-block-end,0px))]',
  '[--_list-corner-end-end:0px]',
  'last:[--_list-corner-end-end:max(0px,var(--container-corner-end-end,0px)-var(--container-padding-block-end,0px))]',
);

export const LIST_COUNTER = '[counter-reset:astryx-list]';

/**
 * The number a counted list starts at is a per-instance value no class can
 * name, so the list writes this property inline and the class reads it.
 * The property is spelled out: the build scans literal class strings, and one
 * assembled from the variable name never reaches the sheet.
 */
export const listCounterStartVars = {
  start: '--astryx-list-counter-start',
} as const;

export const listCounterStartClassName =
  '[counter-reset:astryx-list_var(--astryx-list-counter-start)]';

export const listRootClassName = 'flex flex-col';

export const listHeaderClassName = 'mb-2';

export interface ListClassNameOptions {
  /** The list renders a header above its rows. */
  hasHeader: boolean;
  /** The list draws a divider between its rows. */
  hasDividers: boolean;
  /** The list animates its rows. */
  animatesRows: boolean;
  /** Rows are numbered in the list's shared marker column. */
  usesNumberColumns: boolean;
  /** The list starts its counter at a number other than one. */
  startsCounter: boolean;
  /** The list is counted at all. */
  countsRows: boolean;
  /** Rows reach into the container's padding. */
  reachesContainerPadding: boolean;
  /** Bled rows take the corners the list publishes. */
  publishesCorners: boolean;
}

/** The frame of the list element. */
export function listClassName({
  hasHeader,
  hasDividers,
  animatesRows,
  usesNumberColumns,
  startsCounter,
  countsRows,
  reachesContainerPadding,
  publishesCorners,
}: ListClassNameOptions): string {
  return tw(
    FRAME,
    hasDividers ? LIST_DIVIDED_GAP : LIST_ROW_GAP,
    LIST_COARSE_ISOLATION,
    animatesRows && LIST_ANIMATED_ISOLATION,
    usesNumberColumns && LIST_NUMBER_COLUMNS,
    reachesContainerPadding && LIST_REACHES_CONTAINER_PADDING,
    publishesCorners && !hasHeader && LIST_BLEED_CORNERS,
    countsRows && (startsCounter ? listCounterStartClassName : LIST_COUNTER),
  );
}
