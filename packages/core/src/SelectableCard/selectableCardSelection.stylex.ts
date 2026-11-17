// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file selectableCardSelection.stylex.ts
 * @input The selected variant's border colour
 * @output A StyleX rule for the selected card's border
 * @position Internal to SelectableCard
 */

import * as stylex from '@stylexjs/stylex';

/**
 * The selected border colour stays a StyleX rule because it must outrank the
 * card's own border colour utility: a class would land in the same layer as
 * that utility, where sheet order rather than the selected state would decide
 * the colour.
 */
export const selectableCardSelectionStyles = stylex.create({
  selected: (borderColor: string) => ({borderColor}),
});
