// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file rowIndexClasses.ts
 * @input Tailwind utilities
 * @output Exports `TABLE_ROW_INDEX_CLASS`
 * @position Table row-index plugin; read by useTableRowIndex
 */

import {tw} from '../../../utils/tw';

/**
 * The row number: monospaced and tabular, so digits keep their column as
 * numbers of different widths stack.
 */
export const TABLE_ROW_INDEX_CLASS = tw(
  '[font-family:var(--font-family-code)]',
  'text-[length:var(--text-supporting-size)]',
  '[font-variant-numeric:tabular-nums]',
  'text-[color:var(--color-text-secondary)]',
);
