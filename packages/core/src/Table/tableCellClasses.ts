// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tableCellClasses.ts
 * @input The table context's density axis and the shared cell axes
 * @output Utility class strings a header cell and a body cell both read,
 *   and the composer for a body cell
 * @position Style primitives; scanned by the Tailwind build
 *
 * The header cell and the body cell below it answer the shared appearance
 * axes the same way, so both read their vocabulary here instead of repeating
 * it. Density steps are Tailwind spacing utilities, which resolve to the same
 * `--spacing-*` values the theme declares.
 */

import {tw} from '../utils/tw';
import type {TableContextValue} from './TableContext';
import type {TableVerticalAlign} from './types';

type TableDensity = TableContextValue['density'];

/**
 * Block and inline padding at each density step. The table resolves the
 * density once, so a header cell and the body cell under it stay in step.
 */
const DENSITY_PADDING_CLASS: Record<TableDensity, string> = {
  compact: 'py-1 px-2',
  balanced: 'py-2 px-3',
  spacious: 'py-3 px-4',
};

export function tableCellDensityPaddingClassName(
  density: TableDensity,
): string {
  return DENSITY_PADDING_CLASS[density];
}

/**
 * Padding of the first and last cell of a row. A container may inset its own
 * content with `--container-padding-inline-*`; the outer cell keeps that
 * inset, floored at one density step so the label never touches the edge.
 */
const CONTAINER_EDGE_CLASS: Record<TableDensity, string> = {
  compact: tw(
    'first:ps-[max(var(--container-padding-inline-start,var(--spacing-2)),var(--spacing-2))]',
    'last:pe-[max(var(--container-padding-inline-end,var(--spacing-2)),var(--spacing-2))]',
  ),
  balanced: tw(
    'first:ps-[max(var(--container-padding-inline-start,var(--spacing-3)),var(--spacing-2))]',
    'last:pe-[max(var(--container-padding-inline-end,var(--spacing-3)),var(--spacing-2))]',
  ),
  spacious: tw(
    'first:ps-[max(var(--container-padding-inline-start,var(--spacing-4)),var(--spacing-2))]',
    'last:pe-[max(var(--container-padding-inline-end,var(--spacing-4)),var(--spacing-2))]',
  ),
};

export function tableCellContainerEdgeClassName(density: TableDensity): string {
  return CONTAINER_EDGE_CLASS[density];
}

/**
 * The label treatment every body cell shares, whatever its density: the body
 * type size, in the border box a table measures its columns on.
 */
export const tableCellTextClassName = tw(
  'box-border',
  'text-[length:var(--text-body-size)]',
);

/** The body cell's box: its label treatment under the density padding. */
export function tableCellDensityClassName(density: TableDensity): string {
  return tw(tableCellTextClassName, DENSITY_PADDING_CLASS[density]);
}

/**
 * A cell that wraps its content. The zero maximum width is what keeps the
 * break opportunities inside the column instead of widening it.
 */
export const tableCellWrapClassName = tw(
  'max-w-0 overflow-hidden',
  '[overflow-wrap:break-word]',
  '[word-break:break-word]',
);

/**
 * The cell's vertical placement in the row. A one-line cell stays centred; a
 * taller one can start or end at the top.
 */
const VERTICAL_ALIGN_CLASS: Record<TableVerticalAlign, string> = {
  middle: 'align-middle',
  top: 'align-top',
  bottom: 'align-bottom',
};

export function tableCellVerticalAlignClassName(
  verticalAlign: TableVerticalAlign,
): string {
  return VERTICAL_ALIGN_CLASS[verticalAlign];
}

/**
 * A cell that truncates its content. A zero maximum width is what lets a cell
 * shrink below its content inside the table's fixed layout, so the ellipsis
 * appears at all.
 */
export const tableCellTruncateClassName =
  'max-w-0 overflow-hidden text-ellipsis whitespace-nowrap';

/**
 * The divider a cell draws on its logical inline-end edge, so it mirrors under
 * RTL. The last cell of the run draws none, so the row never doubles the
 * container's own edge.
 */
export const tableCellColumnDividerClassName = tw(
  '[border-inline-end-width:var(--border-width)]',
  '[border-inline-end-style:solid]',
  '[border-inline-end-color:var(--color-border)]',
  'last:[border-inline-end-width:0]',
);

/**
 * The divider a cell draws on its block-end edge. The cell also publishes the
 * width it drew, so a pinned cell continues the same line over the scrolled
 * area.
 */
export const tableCellRowDividerClassName = tw(
  '[--_table-row-divider-width:var(--border-width)]',
  '[border-bottom-width:var(--border-width)]',
  '[border-bottom-style:solid]',
  '[border-bottom-color:var(--color-border)]',
);

/**
 * The cell sits in the last row of the table, which draws no divider below
 * itself: the line would double the table's own edge. Two marks end the body —
 * a row that is last of its section, and a row a virtualised body declares
 * final — so the run ends at either.
 */
export const tableCellLastRowClassName = tw(
  '[tr:last-child>&]:[--_table-row-divider-width:0px]',
  '[tr:last-child:not([data-table-final-row=false])>&]:[border-bottom-width:0]',
  '[tr[data-table-final-row=true]>&]:[border-bottom-width:0]',
);

/**
 * The context menu's trigger wrapper. It fills the cell — a `<td>` child at
 * full height stretches to the row height — and carries the density padding
 * moved off the `<td>`, so a right-click anywhere in the cell, its padding
 * ring included, opens the menu.
 */
export function tableCellTriggerClassName(density?: TableDensity): string {
  return tw(
    'block box-border h-full w-full',
    density && DENSITY_PADDING_CLASS[density],
  );
}

export interface TableCellClassNameOptions {
  density: TableDensity;
  /** The table divides its columns, so every cell but the last draws a divider. */
  hasColumnDivider: boolean;
  /**
   * The cell wraps its content in a context menu: the wrapper fills the cell
   * and carries the padding, so the cell keeps only its label treatment.
   */
  hasContextMenu: boolean;
  /** The table divides its rows, so every cell draws the divider below itself. */
  hasRowDivider: boolean;
  textOverflow: TableContextValue['textOverflow'];
  verticalAlign: TableVerticalAlign;
}

export function tableCellClassName({
  density,
  hasColumnDivider,
  hasContextMenu,
  hasRowDivider,
  textOverflow,
  verticalAlign,
}: TableCellClassNameOptions): string {
  return tw(
    hasContextMenu
      ? tableCellTextClassName
      : tableCellDensityClassName(density),
    textOverflow === 'truncate'
      ? tableCellTruncateClassName
      : tableCellWrapClassName,
    tableCellContainerEdgeClassName(density),
    tableCellVerticalAlignClassName(verticalAlign),
    hasRowDivider && tableCellRowDividerClassName,
    hasRowDivider && tableCellLastRowClassName,
    hasColumnDivider && tableCellColumnDividerClassName,
    // `height: 100%` on the `<td>` is what lets the trigger resolve its own
    // `height: 100%` against the row height.
    hasContextMenu && 'h-full',
  );
}
