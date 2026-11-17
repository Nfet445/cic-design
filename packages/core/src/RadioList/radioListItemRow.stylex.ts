// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file radioListItemRow.stylex.ts
 * @input None
 * @output rowStyles.root — the zeroed padding, radius and background of the
 *   painting row
 * @position StyleX survivor beside RadioListItem
 *
 * This rule has to beat utilities Item sets in the same layer: Item's frame
 * writes `px-[var(--_item-inset-inline)]` and its density writes `py-*`, and
 * Tailwind prints those after `p-0`, so a class would lose. A theme's
 * `radio-list-item` overrides still win from the higher `astryx-theme` layer.
 */

import * as stylex from '@stylexjs/stylex';

export const rowStyles = stylex.create({
  // The row's default appearance is a bare surface: no density padding, no
  // radius, and no full-row background — only the indicator tints on hover
  // (via `indicatorScope`). `minWidth: 0` preserves label truncation now that
  // the Item is the row's flex child.
  root: {
    paddingBlock: 0,
    paddingInline: 0,
    borderRadius: 0,
    minWidth: 0,
    // Suppress Item's interactive hover/press background so the resting and
    // hovered row look identical by default (a theme can restyle either).
    backgroundColor: 'transparent',
  },
});
