// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file selectionClasses.ts
 * @input Tailwind utilities
 * @output Exports `SELECTION_CELL_CLASS`
 * @position Table selection plugin; read by useTableSelection
 */

/**
 * Centers the checkbox in the selection column. The column has a fixed width
 * and no horizontal cell padding, so the control sits on the column's centre.
 */
export const SELECTION_CELL_CLASS = 'flex items-center justify-center';
