// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file sortClasses.ts
 * @input Tailwind utilities, the `tw()` joiner, a column's `align`
 * @output Exports `sortButtonClassName`, `SORT_INDICATOR_CLASS`,
 *   `SORT_INDICATOR_UNSORTED_CLASS`, and `SORT_RANK_CLASS`
 * @position Table sortable plugin; read by useTableSortable
 */

import {tw} from '../../../utils/tw';
import type {TableColumnAlign} from '../../types';

/**
 * The header button: a full-size flex row so the whole header cell sorts, and
 * the column's `align` mirrored onto its main axis. A `textAlign` on the `<th>`
 * cannot position a flex container's contents, so without this an `align: 'end'`
 * numeric column would show a left-hugging header over right-aligned figures.
 */
export function sortButtonClassName(
  align: TableColumnAlign | undefined,
): string {
  return tw(
    'flex items-center gap-1 w-full h-full',
    'bg-transparent border-0 p-0 m-0',
    'cursor-pointer disabled:cursor-default aria-disabled:cursor-default',
    '[font:inherit] [color:inherit] [text-align:inherit]',
    'rounded-[var(--radius-inner)]',
    align === 'center' && 'justify-center',
    align === 'end' && 'justify-end',
  );
}

/**
 * The indicator slot takes no block size, so a theme's larger glyph overflows
 * it instead of growing the Sort control or the header row; when the slot hides
 * the glyph the empty slot collapses, so the button's gap does not offset an
 * end-aligned label.
 */
export const SORT_INDICATOR_CLASS =
  'inline-flex items-center [height:0px] [&:empty]:hidden';

/** An unsorted column's glyph is quiet until the header is hovered or focused. */
export const SORT_INDICATOR_UNSORTED_CLASS =
  'opacity-[0.35] [&:is(th:hover_*)]:opacity-100 focus-visible:opacity-100';

/** The multi-sort priority badge beside the glyph. */
export const SORT_RANK_CLASS =
  'text-[length:10px] leading-none [color:var(--color-text-accent)]';
