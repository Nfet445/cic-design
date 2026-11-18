// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file rowExpansionOverride.stylex.ts
 * @input StyleX values composed by table plugins
 * @output Expansion column insets and divider suppression
 * @position Row-expansion plugin; composed after preceding plugin styles
 */

import * as stylex from '@stylexjs/stylex';

// The preceding plugin's unlayered StyleX value must lose in the same composition.
export const rowExpansionOverride = stylex.create({
  chevronHeaderCell: {
    paddingInlineStart: 0,
    paddingInlineEnd: 0,
  },
  chevronCell: {
    paddingInlineStart: 0,
  },
  expandedCell: {
    '--_table-row-divider-width': '0px',
    borderBottomWidth: 0,
  },
});
