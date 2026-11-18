// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TableCell.tsx
 * @input React, StyleX, TableContext, tableCellClasses
 * @output Exports TableCell component, TableCellProps
 * @position Sub-component; used inside Table children mode
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Table/Table.doc.mjs
 * - /packages/core/src/Table/index.ts
 * - /packages/cli/assets/templates/blocks/components/Table/ (showcase blocks)
 */

import type {ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '../theme/types';
import type {TableContextActions} from './types';
import {
  hasTableContextActions,
  wrapInTableContextMenu,
} from './tableContextMenu';
import {
  tableCellClassName,
  tableCellTriggerClassName,
} from './tableCellClasses';
import {useTableContext} from './useTableCellStyles';
import {mergeProps} from '../utils';
import {glidingDividerCellClassName} from './glidingDivider';
import {themeProps} from '../utils/themeProps';

/** Props for TableCell — thin `<td>` wrapper */
export interface TableCellProps extends BaseProps<HTMLTableCellElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLTableCellElement>;
  /** Specifies which cells this cell relates to (used on `<td>` acting as a row header). */
  scope?: 'col' | 'row' | 'colgroup' | 'rowgroup';
  /** Space-separated list of header cell IDs this cell is described by. */
  headers?: string;
  /** Number of columns this cell spans. Standard HTML `<td>` attribute. */
  colSpan?: number;
  /** Number of rows this cell spans. Standard HTML `<td>` attribute. */
  rowSpan?: number;
  children?: ReactNode;
  /**
   * StyleX styles for layout customization (margins, positioning, sizing).
   * Must be a `stylex.create()` value — not an inline style object.
   */
  xstyle?: StyleXStyles | StyleXStyles[];
  /**
   * Right-click actions rendered as a context menu around the cell content.
   * The cell owns the wrapper so it controls how the menu interacts with its
   * padding / content. Empty or undefined renders no menu.
   */
  contextMenuActions?: TableContextActions;
}

/**
 * TableCell — a `<td>` wrapper for children/streaming mode.
 *
 * When used inside `<Table>`, inherits styling from the table context
 * (density padding, divider borders). When used standalone, renders a plain `<td>`.
 *
 * @example
 * ```
 * <TableRow>
 *   <TableCell>Alice</TableCell>
 *   <TableCell>30</TableCell>
 * </TableRow>
 * ```
 */
export function TableCell({
  children,
  xstyle,
  ref,
  className: incomingClassName,
  style: incomingStyle,
  contextMenuActions,
  ...props
}: TableCellProps) {
  const ctx = useTableContext();

  const hasContextMenu = hasTableContextActions(contextMenuActions);

  const hasRowDivider = ctx?.dividers === 'rows' || ctx?.dividers === 'grid';
  const hasColumnDivider =
    ctx?.dividers === 'columns' || ctx?.dividers === 'grid';

  // When the cell owns a context menu, its density padding moves onto the
  // right-click trigger wrapper, so the whole cell — padding included — opens
  // the menu. Standalone, with no table context, the cell renders plain.
  const cellClassName = ctx
    ? tableCellClassName({
        density: ctx.density,
        hasColumnDivider,
        hasContextMenu,
        hasRowDivider,
        textOverflow: ctx.textOverflow,
        verticalAlign: ctx.verticalAlign,
      })
    : undefined;

  // The cell owns the context-menu wrapper so it controls how the menu
  // interacts with its padding / content. No-op when no actions.
  const triggerClassName = hasContextMenu
    ? tableCellTriggerClassName(ctx?.density)
    : undefined;
  const content = wrapInTableContextMenu(
    children,
    contextMenuActions,
    triggerClassName,
  );

  return (
    <td
      ref={ref}
      {...props}
      {...mergeProps(
        mergeProps(themeProps('table-cell', {density: ctx?.density}), {
          className: cellClassName,
        }),
        // A glide moves the row's divider with the row; the class follows the
        // attribute the glide sets.
        mergeProps(glidingDividerCellClassName, stylex.props(xstyle)),
        incomingClassName,
        incomingStyle,
      )}>
      {content}
    </td>
  );
}

TableCell.displayName = 'TableCell';
