// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tableHeaderCellClasses.ts
 * @input The table context's density and divider axes, and whether the cell
 *   hosts a context menu
 * @output Utility class strings for a header cell
 * @position Style primitives; scanned by the Tailwind build
 *
 * A header cell answers the density and divider axes through the shared cell
 * vocabulary and adds what only a header has: the label's weight, colour and
 * size, and the divider under the header row.
 */

import {tw} from '../utils/tw';
import type {TableContextValue} from './TableContext';
import {
  tableCellColumnDividerClassName,
  tableCellContainerEdgeClassName,
  tableCellDensityPaddingClassName,
  tableCellTruncateClassName,
} from './tableCellClasses';

type TableDensity = TableContextValue['density'];

/** The label treatment, the same at every density. */
const HEADER_TEXT_CLASS = tw(
  'text-start',
  '[font-weight:var(--font-weight-semibold)]',
  '[color:var(--color-text-secondary)]',
  'text-[length:var(--text-label-size)]',
);

/**
 * The separator between the header and the body. A header cell draws it at
 * every divider setting. It also publishes its width, so a pinned header cell
 * can continue the same line over the scrolled area.
 */
const HEADER_DIVIDER_CLASS = tw(
  '[--_table-row-divider-width:var(--border-width)]',
  '[border-bottom-width:var(--border-width)]',
  '[border-bottom-style:solid]',
  '[border-bottom-color:var(--color-border)]',
);

/**
 * The context menu's trigger wrapper, unpositioned so a header plugin's
 * overlay, such as a resize boundary, positions against the cell and sits on
 * its edge.
 */
export const tableHeaderCellTriggerClassName = 'static';

export interface TableHeaderCellClassNameOptions {
  density: TableDensity;
  /** The table divides its columns, so every header cell but the last draws a divider. */
  hasColumnDivider: boolean;
  /** The cell wraps its content in a context menu, which needs a positioned anchor. */
  hasContextMenu: boolean;
}

export function tableHeaderCellClassName({
  density,
  hasColumnDivider,
  hasContextMenu,
}: TableHeaderCellClassNameOptions): string {
  return tw(
    HEADER_TEXT_CLASS,
    // A border must never change the cell's height.
    'box-border',
    tableCellDensityPaddingClassName(density),
    tableCellTruncateClassName,
    tableCellContainerEdgeClassName(density),
    HEADER_DIVIDER_CLASS,
    hasColumnDivider && tableCellColumnDividerClassName,
    hasContextMenu && 'relative',
  );
}
