// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file rowExpansionOverrides.stylex.ts
 * @input The row marker and the divider tokens
 * @output Exports the expansion column's zero padding and the expanded row's
 *   divider hand-off to its panel
 * @position Table row-expansion plugin; read by useTableRowExpansion
 *
 * These stay StyleX on purpose. Each one has to beat a utility the cell maps
 * write — the density padding, its first/last edge floor, or the row divider
 * width — and a class cannot outrank a `first:` variant utility already in the
 * sheet. The ancestor marker read below could not move at all.
 */

import * as stylex from '@stylexjs/stylex';
import {borderVars, colorVars} from '../../../theme/tokens.stylex';
import {tableRowMarker} from '../../table.stylex';

/**
 * An expanded row and its panel are one unit, so the row divider belongs after
 * the pair rather than between them — left alone, the row's own bottom border
 * draws a line cutting it off from the detail it just opened, and the panel
 * then runs flush into the next row, which is the wrong way round.
 *
 * So the row gives up its border and the panel takes one. On a table with no
 * row dividers the suppression is a no-op (there was no border to remove) and
 * the panel's is never applied, so neither needs to consult the divider mode.
 */
export const rowExpansionOverrideStyles = stylex.create({
  expandedRowCell: {
    '--_table-row-divider-width': '0px',
    borderBottomWidth: 0,
  },
  // The row's divider, carried down: its row's themed or app-set border
  // reaches the panel through `--_table-panel-divider-*` on the panel's cell
  // (set after each commit, see ExpansionPanelCell), the tokens otherwise.
  panelCell: {
    // The width this divider draws, for its stand-in during a glide.
    '--_table-row-divider-width': {
      default: `var(--_table-panel-divider-width, ${borderVars['--border-width']})`,
      [stylex.when.ancestor(':last-child', tableRowMarker)]: '0px',
    },
    borderBottomWidth: {
      default: `var(--_table-panel-divider-width, ${borderVars['--border-width']})`,
      // Same rule TableCell uses: no trailing line under the last row of the
      // table. Scoped to the marker so <tbody>, also a :last-child, does not
      // match and suppress every panel's border.
      [stylex.when.ancestor(':last-child', tableRowMarker)]: '0',
    },
    borderBottomStyle: 'var(--_table-panel-divider-style, solid)',
    borderBottomColor: `var(--_table-panel-divider-color, ${colorVars['--color-border']})`,
  },
  // The header cell holds only a visually hidden label, so it drops both
  // inline insets; the body cell drops the start inset only.
  chevronHeaderCell: {
    paddingInlineStart: 0,
    paddingInlineEnd: 0,
  },
  chevronCell: {
    paddingInlineStart: 0,
  },
});
