// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file listItemClasses.ts
 * @input The List row's edge treatment and dividers, its marker kind, and the
 *   flags a row and its markers answer to
 * @output The class maps for a List row and its custom-rendered markers
 * @position Style primitives; scanned by the Tailwind build. ListItem composes
 *   these on the Item it renders and on the marker it builds
 */

import {tw} from '../utils/tw';
import type {ListEdge} from './ListContext';

/**
 * A numbered row contributes two cells to the List's shared counter grid, so
 * its marker's width and its text line up down the list. Browsers without
 * subgrid lay the row out as a flex row instead.
 */
export const LIST_ITEM_NUMBER_COLUMNS = tw(
  'flex',
  'supports-[grid-template-columns:subgrid]:grid',
  'grid-cols-subgrid',
  'col-span-full',
);

/** A numbered row outside the shared columns still spans the List's grid. */
export const LIST_ITEM_SPAN_COLUMNS = 'col-span-full';

/** The row counts itself into the list's counter. */
export const LIST_ITEM_COUNTER = '[counter-increment:astryx-list]';

// List's edge treatments. Each reads --_item-inset-inline, the variable Item
// derives its paddingInline from, on the row itself (custom properties only
// cascade downward, so the <ul> cannot read it); density and theme
// paddingInline overrides on `item` move it. Each edge resolves against ITS
// OWN container padding var, so asymmetric padding never over-reaches an
// edge, and logical properties keep RTL correct.
//
// The row and Item's frame both style the same box, and the sheet decides a
// tie between two plain utilities, not the order the row asked for them. So
// every declaration that has to beat the frame is keyed on the edge the row
// carries: an attribute variant outranks the frame's own class.
/* eslint-disable @astryx/no-raw-private-attribute -- Tailwind scans class text, so the attribute has to be spelled here */

/** 'flush': no inset, so content meets the row's edges. */
export const LIST_ITEM_FLUSH_INSET =
  '[&[data-astryx-list-edge=flush]]:[--_item-inset-inline:0px]';

/**
 * 'outset': the list reaches the container's padding edge (List.tsx); the row
 * steps back in by whatever padding its inset does not fill, so the row
 * reaches min(inset, container padding) past the content line and its text
 * lands on that line when the padding is at least the inset.
 */
export const LIST_ITEM_OUTSET_START =
  'ms-[max(var(--container-padding-inline-start,0px)_-_var(--_item-inset-inline),0px)]';

export const LIST_ITEM_OUTSET_END =
  'me-[max(var(--container-padding-inline-end,0px)_-_var(--_item-inset-inline),0px)]';

const EDGE_OUTSET = tw(LIST_ITEM_OUTSET_START, LIST_ITEM_OUTSET_END);

/**
 * 'bleed': the row fills the list, which reaches the container's padding edge
 * (List.tsx); its text sits on the container's padding line, never closer to
 * the row's edge than its own inset. Square corners where the row meets the
 * container's straight sides; the first and last rows take the corners the
 * list publishes for a rounded container's corner.
 */
export const LIST_ITEM_BLEED = tw(
  '[&[data-astryx-list-edge=bleed]]:ps-[max(var(--container-padding-inline-start,0px),var(--_item-inset-inline))]',
  '[&[data-astryx-list-edge=bleed]]:pe-[max(var(--container-padding-inline-end,0px),var(--_item-inset-inline))]',
  '[&[data-astryx-list-edge=bleed]]:[border-radius:0px]',
  '[&[data-astryx-list-edge=bleed]:first-child]:[border-start-start-radius:var(--_list-corner-start-start,0px)]',
  '[&[data-astryx-list-edge=bleed]:first-child]:[border-start-end-radius:var(--_list-corner-start-end,0px)]',
  '[&[data-astryx-list-edge=bleed]:last-child]:[border-end-start-radius:var(--_list-corner-end-start,0px)]',
  '[&[data-astryx-list-edge=bleed]:last-child]:[border-end-end-radius:var(--_list-corner-end-end,0px)]',
);

/** The row's classes, per edge treatment. */
const listItemEdgeClassName: Record<ListEdge, string> = {
  padded: '',
  flush: LIST_ITEM_FLUSH_INSET,
  outset: EDGE_OUTSET,
  bleed: LIST_ITEM_BLEED,
};

/**
 * A divided row keeps square corners, whatever corner the frame would give
 * it, so consecutive rows read as one band.
 */
export const LIST_ITEM_DIVIDED_RADIUS =
  '[&[data-astryx-list-divided]]:[border-radius:0px]';

/**
 * Under a finger, the row's touch band rises above the rows after it. A later
 * row is positioned with no z-index, so it would paint and hit-test over the
 * band. Only inside a List.
 */
export const LIST_ITEM_BAND_RAISED = 'pointer-coarse:[&::after]:[z-index:1]';

/**
 * The divider between rows. Longhands, not the `border-block-end` shorthand:
 * a shorthand resets the two sides it covers, and the block-end width is the
 * one the last row has to clear.
 */
export const LIST_ITEM_DIVIDER_END_WIDTH =
  '[border-block-end-width:var(--border-width)]';

/** The last row clears the divider, so the list ends on its own edge. */
export const LIST_ITEM_DIVIDER_LAST_RESET =
  '[&:last-child]:[border-block-end-width:0px]';

export const LIST_ITEM_DIVIDER = tw(
  LIST_ITEM_DIVIDER_END_WIDTH,
  '[border-block-end-style:solid]',
  '[border-block-end-color:var(--color-border)]',
  LIST_ITEM_DIVIDER_LAST_RESET,
  // The touch hit band starts past the divider, the edge of the box its
  // insets are measured from (internal/touchHitAreaClasses.ts). The width
  // sits on the band itself, so content inside the row never inherits it.
  '[&::after]:[--_hit-border-bottom:var(--border-width)]',
  '[&:last-child::after]:[--_hit-border-bottom:0px]',
);

/* eslint-enable @astryx/no-raw-private-attribute */

export interface ListItemRowClassOptions {
  /** Where the row sits: inside its padding, or at the list's edge. */
  edge: ListEdge;
  /** The list draws a divider between its rows. */
  hasDividers: boolean;
  /** The list renders a marker, so the row counts itself in. */
  hasMarkers: boolean;
  /** The row is a touch target inside a List, so its band may rise. */
  isTouchTargetInList: boolean;
  /** The row takes a cell in the List's shared counter grid. */
  usesNumberColumns: boolean;
  /** The row is numbered but outside the shared counter grid. */
  spansNumberColumns: boolean;
}

/** The classes a List row adds to the Item it renders. */
export function listItemRowClassName({
  edge,
  hasDividers,
  hasMarkers,
  isTouchTargetInList,
  usesNumberColumns,
  spansNumberColumns,
}: ListItemRowClassOptions): string {
  return tw(
    usesNumberColumns && LIST_ITEM_NUMBER_COLUMNS,
    spansNumberColumns && LIST_ITEM_SPAN_COLUMNS,
    hasMarkers && LIST_ITEM_COUNTER,
    listItemEdgeClassName[edge],
    hasDividers && LIST_ITEM_DIVIDER,
    hasDividers && LIST_ITEM_DIVIDED_RADIUS,
    isTouchTargetInList && LIST_ITEM_BAND_RAISED,
  );
}

// =============================================================================
// Markers — custom-rendered instead of native list-style-type. CSS counters
// carry the numbers.
// =============================================================================

/**
 * A marker's box in the row: the width of the list's marker column. Its
 * margin centres the 6px dot — the dot's side — on the first line's text.
 * The numbers stay literal: Tailwind reads class text from the source, so a
 * value it has to interpolate at runtime is a value it never emits.
 */
export const listItemMarkerContainerClassName = tw(
  'self-baseline box-border flex items-center justify-center shrink-0 w-4',
  '[margin-top:calc((1em_*_var(--text-body-leading)_-_6px)_/_2)]',
);

export const listItemMarkerDotClassName =
  'size-[6px] rounded-full bg-[var(--color-text-primary)]';

export const listItemMarkerCircleClassName = tw(
  'size-[6px] rounded-full border border-solid',
  'border-[var(--color-text-primary)] bg-transparent',
);

export const listItemMarkerSquareClassName =
  'size-[6px] bg-[var(--color-text-primary)]';

/**
 * The counter ends where the marker ends, so every period in a list lines up,
 * as a native outside marker's does. Tabular figures give each digit the same
 * width down the list.
 *
 * Short counters retain their inset. A longer counter first reaches into the
 * row's inline inset and only then sizes the List's shared grid column, so no
 * single number moves its item's text.
 */
export const listItemMarkerNumberClassName = tw(
  'self-baseline flex justify-end shrink-0 w-auto min-w-4 whitespace-nowrap',
  'text-[color:var(--color-text-primary)]',
  '[font-size:var(--text-body-size)]',
  '[line-height:var(--text-body-leading)]',
  'tabular-nums',
);

/**
 * How far a counter wider than its marker reaches toward the row's edge: the
 * row's whole inline inset, the way a native outside marker hangs into its
 * list's padding. Up to that width the item's text keeps its usual start; a
 * wider counter widens the List's shared column instead. It is never clipped:
 * the inset is inside the row, and the row inside the List's inline clip.
 */
// Tailwind rewrites `calc(-1*var(...))` and turns the private variable's
// underscore into a space there, so the factor multiplies from the right.
const COUNTER_HANG = '[&::before]:ms-[calc(var(--_item-inset-inline)*-1)]';

/**
 * The number, per counter style. A number outside a counter style's range
 * (zero or below, or past 3999 in roman) is written in decimal, as CSS
 * counter styles fall back.
 */
export const listItemMarkerCounterClassName: Record<
  'decimal' | 'lower-alpha' | 'lower-roman',
  string
> = {
  decimal: tw('[&::before]:[content:counter(astryx-list)_"."]', COUNTER_HANG),
  'lower-alpha': tw(
    '[&::before]:[content:counter(astryx-list,lower-alpha)_"."]',
    COUNTER_HANG,
  ),
  'lower-roman': tw(
    '[&::before]:[content:counter(astryx-list,lower-roman)_"."]',
    COUNTER_HANG,
  ),
};

/**
 * Markdown's non-swipe lists allow outside marker paint. Keep their marker
 * column at the ordinary themed width, as RichText's native outside markers
 * do. The counter itself stays intrinsic and unbroken; flex-end aligns its
 * end even when it overflows toward inline-start. A larger finite negative
 * margin would only move the parity failure threshold.
 */
export const listItemMarkerGutterHangClassName =
  'w-4 [&::before]:ms-0 [&::before]:shrink-0';

/**
 * A task item's checkbox stands where the marker would, centred on the item's
 * first line, as a task list's checkboxes are. 20px is the box of
 * CheckboxInput's small control.
 */
export const listItemTaskMarkerContainerClassName = tw(
  'self-start flex shrink-0',
  '[margin-top:calc((1em_*_var(--text-body-leading)_-_20px)_/_2)]',
);
