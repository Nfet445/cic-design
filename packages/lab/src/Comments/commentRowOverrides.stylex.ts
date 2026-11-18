// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file commentRowOverrides.stylex.ts
 * @input Accepts nothing: the rule is fixed
 * @output The outline a selected thread keeps in forced colors
 * @position Style exception; the component passes it through `xstyle`
 *
 * Forced colors drops the selected fill, so the thread keeps a visible outline
 * there. It must beat `commentRowFocusRingClassName` on the same surface: that
 * class sits in `astryx-base`, and this unlayered rule outranks the layer, so
 * under forced colors the system outline replaces the theme ring whatever the
 * class set says.
 */

import * as stylex from '@stylexjs/stylex';

export const commentRowSurfaceStyles = stylex.create({
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
