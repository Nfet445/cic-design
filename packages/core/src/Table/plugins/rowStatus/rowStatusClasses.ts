// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file rowStatusClasses.ts
 * @input Tailwind utilities
 * @output Exports `TABLE_ROW_STATUS_WRAP_CLASS`, `TABLE_ROW_STATUS_DOT_CLASS`,
 *   `TABLE_ROW_STATUS_ICON_CLASS`, and `TABLE_ROW_STATUS_COLOR_VARIABLE`
 * @position Table row-status plugin; read by useTableRowStatus
 */

import {tw} from '../../../utils/tw';

/**
 * The marking colour is per instance (a named token or a raw CSS colour), so it
 * rides one inline custom property that the dot and the custom icon read.
 */
export const TABLE_ROW_STATUS_COLOR_VARIABLE = '--_table-row-status-color';

/** Centers the status marker in its fixed-width column. */
export const TABLE_ROW_STATUS_WRAP_CLASS = 'flex items-center justify-center';

/** The dot for a custom colour with no icon: `size-2` is 8px. */
export const TABLE_ROW_STATUS_DOT_CLASS = tw(
  'size-2 shrink-0 rounded-full',
  'bg-[var(--_table-row-status-color)]',
);

/** A caller's own icon, painted in the status colour. */
export const TABLE_ROW_STATUS_ICON_CLASS =
  '[color:var(--_table-row-status-color)]';
