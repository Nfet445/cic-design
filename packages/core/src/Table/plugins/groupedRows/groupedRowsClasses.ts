// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file groupedRowsClasses.ts
 * @input Tailwind utilities
 * @output Exports the group header row, cell, inner row, chevron, glyph,
 *   label and count classes
 * @position Table grouped-rows plugin; read by useTableGroupedRows
 */

import {tw} from '../../../utils/tw';

/** The clickable header row: muted fill and a divider beneath the group. */
export const GROUPED_ROWS_HEADER_ROW_CLASS = tw(
  'cursor-pointer select-none',
  '[&:is(:disabled,[aria-disabled=true])]:cursor-default',
  'bg-[var(--color-background-muted)]',
  'border-b border-solid border-[color:var(--color-border)]',
);

/**
 * The spanning cell. The start gutter lives on the inner row instead, so the
 * heading travels with its chevron when it pins.
 */
export const GROUPED_ROWS_HEADER_CELL_CLASS = 'py-2 pe-3 ps-0';

/** Shared row layout, so a custom renderer keeps the full spanning cell. */
export const GROUPED_ROWS_HEADER_INNER_CLASS = 'flex items-center gap-1 ps-1';

/** The built-in heading moves with its chevron and shrink-wraps. */
export const GROUPED_ROWS_HEADER_INNER_PINNED_CLASS = 'sticky start-0 w-fit';

/** A custom heading keeps its containing block; only the chevron pins. */
export const GROUPED_ROWS_CHEVRON_PINNED_CLASS = 'sticky start-1 z-[1]';

/** A standalone disclosure button, flush with the table's start edge. */
export const GROUPED_ROWS_CHEVRON_CLASS = tw(
  'inline-flex items-center justify-center shrink-0',
  'p-0 m-0 bg-transparent border-0 border-none',
  'cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default',
  'text-[color:var(--color-icon-secondary)]',
  'hover:text-[color:var(--color-icon-primary)]',
);

const GROUPED_ROWS_CHEVRON_ICON_CLASS =
  '[transition-property:transform] [transition-duration:150ms]';

/**
 * The RTL mirror is folded into each state's transform: both are `transform`,
 * so one element carrying the later value would drop the other.
 */
export const GROUPED_ROWS_CHEVRON_GLYPH_CLASS = {
  base: GROUPED_ROWS_CHEVRON_ICON_CLASS,
  collapsed: tw(
    '[transform:rotate(0deg)]',
    'rtl:[transform:scaleX(-1)_rotate(0deg)]',
  ),
  expanded: tw(
    '[transform:rotate(90deg)]',
    'rtl:[transform:scaleX(-1)_rotate(90deg)]',
  ),
};

/** Body-sized text, heavier than the body — the heading. */
export const GROUPED_ROWS_LABEL_CLASS = tw(
  '[font-weight:var(--font-weight-semibold)]',
  'text-[color:var(--color-text-primary)]',
);

export const GROUPED_ROWS_COUNT_CLASS = tw(
  '[font-weight:var(--font-weight-normal)]',
  'text-[color:var(--color-text-secondary)]',
);
