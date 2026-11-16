// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tableCellClasses.ts
 * @input The table context's density axis and the shared cell axes
 * @output Utility class strings a header cell and a body cell both read
 * @position Style primitives; scanned by the Tailwind build
 *
 * The header cell and the body cell below it answer the shared appearance
 * axes the same way, so both read their vocabulary here instead of repeating
 * it. Density steps are Tailwind spacing utilities, which resolve to the same
 * `--spacing-*` values the theme declares.
 */

import {tw} from '../utils/tw';
import type {TableContextValue} from './TableContext';

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
