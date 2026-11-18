// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tableGlideClasses.ts
 * @input Table row glides, the attributes `glidingDivider.ts` marks while a
 *   row moves, the glide divider variables it writes
 * @output Literal class names for a gliding row, its cells and the line one
 *   cell draws in `::after`
 * @position Table internals. The text lives here, in a `*Classes.ts` module,
 *   because the Tailwind build only scans those; `glidingDivider.ts` holds the
 *   logic and re-exports these names.
 *
 * SYNC: When modified, update glidingDivider.ts, TableCell.tsx,
 *   plugins/rowExpansion and plugins/stickyColumns.
 */

/**
 * On every cell with a row divider — the divider colour itself comes from
 * `tableCellRowDividerClassName`, so a table without row dividers shows none:
 * while its row glides the border goes
 * transparent (the width stays, so nothing reflows) and the row's line cell
 * draws the same divider across the row in a `::after` that moves with it.
 * The `::after` declarations sit only on the line cell, so a pinned cell's own
 * `::after` (its scroll shadow) stays untouched.
 */
export const glidingDividerCellClassName =
  "[[data-astryx-cell-gliding]]:[border-bottom-color:transparent] [[data-astryx-cell-gliding=line]]:after:content-[''] [[data-astryx-cell-gliding=line]]:after:absolute [[data-astryx-cell-gliding=line]]:after:[inset-inline:0] [[data-astryx-cell-gliding=line]]:after:[bottom:var(--_table-row-glide-bottom,0px)] [[data-astryx-cell-gliding=line]]:after:h-0 [[data-astryx-cell-gliding=line]]:after:[border-bottom-width:var(--_table-row-glide-width,0px)] [[data-astryx-cell-gliding=line]]:after:[border-bottom-style:var(--_table-row-glide-style,solid)] [[data-astryx-cell-gliding=line]]:after:[border-bottom-color:var(--_table-row-glide-color,var(--color-border))] [[data-astryx-cell-gliding=line]]:after:pointer-events-none";

/**
 * After the cell class on a detail panel's cell: its divider color is the one
 * its row hands down (`plugins/rowExpansion`).
 */
export const glidingDividerPanelCellClassName =
  '[border-bottom-color:var(--_table-panel-divider-color,var(--color-border))] [[data-astryx-cell-gliding]]:[border-bottom-color:transparent]';

/**
 * On every row: while it moves it is the line's containing block. Its motion
 * (a `translate`) makes it one; `position: relative` keeps it so for a panel
 * playing in, which does not move.
 */
export const glidingDividerRowClassName =
  '[[data-astryx-row-gliding]]:relative';
