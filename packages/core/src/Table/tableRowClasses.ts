// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tableRowClasses.ts
 * @input The table context's striping and hover axes, and whether the row knows
 *   its own position among the body rows
 * @output Utility class strings for a body row's paint
 * @position Style primitives; scanned by the Tailwind build
 *
 * A body row paints one surface: its stripe, the hover tint over it, or
 * nothing. The row also publishes that surface as `--table-row-overlay`, an
 * inheritable variable a pinned cell replays over its own opaque background —
 * its `background-color` is the stripe, so both answers come from one class
 * set and cannot drift apart.
 *
 * The hover tint sits behind a fine-pointer guard, and it skips a row the
 * table marked disabled through either `:disabled` or `aria-disabled`.
 */

import {tw} from '../utils/tw';

/**
 * Zebra striping counts body rows — and a row-expansion panel is not one.
 *
 * The panel is appended as a sibling `<tr>` (see BaseTable's `afterRow`), so a
 * plain `:nth-child(even)` counts it and every row below an open panel takes
 * the opposite stripe: expanding one row repaints half the table. Counting
 * `of :not([data-expansion-panel])` leaves the panel out of the sequence, so
 * the rows keep their parity whatever is open.
 */
const STRIPED_ROW_CLASS = tw(
  '[&:nth-child(even_of_:not([data-expansion-panel]))]:bg-[var(--color-background-muted)]',
  '[&:nth-child(even_of_:not([data-expansion-panel]))]:[--table-row-overlay:var(--color-background-muted)]',
);

/**
 * The stripe of a row that knows its own parity. A body that renders every row
 * in order states the parity as a logical index; asking the selector instead
 * would count rows the body does not render (a virtualised or windowed body
 * keeps only a slice in the DOM).
 */
const LOGICAL_STRIPED_ROW_CLASS = tw(
  'bg-[var(--color-background-muted)]',
  '[--table-row-overlay:var(--color-background-muted)]',
);

/** The tint a fine pointer lays over the row, and the fade it arrives with. */
const HOVER_ROW_CLASS = tw(
  '[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:bg-[var(--color-overlay-hover)]',
  '[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:[--table-row-overlay:var(--color-overlay-hover)]',
  'transition-[background-color]',
  'duration-[var(--duration-fast)]',
  'ease-[var(--ease-standard)]',
);

export interface TableRowClassNameOptions {
  /** The table tints the row under a fine pointer. */
  hasHover: boolean;
  /**
   * The row knows its position among the body rows, so its parity is already
   * decided and the stripe is painted on the row itself.
   */
  hasKnownPosition: boolean;
  /** The table stripes every other body row and this one takes the stripe. */
  isStriped: boolean;
}

/** The surface a body row paints: its stripe, the hover tint, or neither. */
export function tableRowClassName({
  hasHover,
  hasKnownPosition,
  isStriped,
}: TableRowClassNameOptions): string {
  return tw(
    isStriped &&
      (hasKnownPosition ? LOGICAL_STRIPED_ROW_CLASS : STRIPED_ROW_CLASS),
    hasHover && HOVER_ROW_CLASS,
  );
}

/**
 * A row whose height the table fixes (a virtualised body hands each row its
 * own height). The height travels in `--astryx-table-row-height`, because a
 * per-instance value cannot live in a literal class.
 */
export const FIXED_ROW_HEIGHT_CLASS = 'h-[var(--astryx-table-row-height)]';
