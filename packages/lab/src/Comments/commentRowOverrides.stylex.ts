// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file commentRowOverrides.stylex.ts
 * @input Accepts nothing: every rule is fixed
 * @output StyleX rules that paint a selected thread's fill and focus ring
 * @position Style exception; the component passes it through `xstyle`
 *
 * A selected thread keeps `Card`'s default variant, so this fill must outrank
 * that variant's `bg-[var(--color-background-card)]`. Both stylesheets sit in
 * `astryx-base`, where a class of ours would be decided by the later sheet;
 * StyleX's `:not(#\#)` selector wins at either order, so the rule stays here.
 */

import * as stylex from '@stylexjs/stylex';
import {
  borderVarNames,
  colorVarNames,
  focusVarNames,
} from '@astryxdesign/core/theme';

export const commentRowSurfaceStyles = stylex.create({
  /** The hidden toggle that names the thread has focus: the surface takes the system focus ring. */
  focused: {
    outlineStyle: 'var(--focus-outline-style)',
    outlineWidth: 'var(--focus-outline-width)',
    outlineColor: 'var(--focus-outline-color)',
    outlineOffset: 'var(--focus-outline-offset)',
  },
  /** Only Card's default variant draws a border, so a selected Card keeps that variant and takes the muted fill. */
  selectedFill: {
    backgroundColor: 'var(--color-background-muted)',
  },
  /** Forced colors replace the muted fill with the system background, so a selected thread keeps a visible outline there. */
  selectedForcedColors: {
    outlineStyle: {default: null, '@media (forced-colors: active)': 'solid'},
    outlineWidth: {
      default: null,
      '@media (forced-colors: active)': `calc(var(--border-width) * 2)`,
    },
    outlineColor: {
      default: null,
      '@media (forced-colors: active)': 'Highlight',
    },
    outlineOffset: {
      default: null,
      '@media (forced-colors: active)': `calc(var(--border-width) * -2)`,
    },
  },
});
