// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file table.stylex.ts
 * @input StyleX
 * @output The table row marker both a row and its plugins' ancestor selectors
 *   name
 * @position Utility styles; consumed by TableRow and plugins/rowExpansion
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/TableRow.tsx
 * - /packages/core/src/Table/plugins/rowExpansion/rowExpansionOverrides.stylex.ts
 */

import * as stylex from '@stylexjs/stylex';

/**
 * Scoped marker for table row ancestor selectors.
 *
 * Applied to each `<tr>` via TableRow so that cell-level
 * `stylex.when.ancestor(':last-child', tableRowMarker)` only matches
 * the parent row — not other ancestors like `<tbody>` or `<table>`.
 */
export const tableRowMarker: ReturnType<typeof stylex.defineMarker> =
  stylex.defineMarker();
