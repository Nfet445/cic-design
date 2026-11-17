// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file commentRowOverrides.stylex.ts
 * @input Accepts nothing: every rule is fixed
 * @output StyleX rules that paint a selected thread's fill and focus ring
 * @position Style exception; the component passes it through `xstyle`
 *
 * The thread's surface paints its own fill through a theme rule, so a utility
 * class cannot be trusted to win over it: these rules stay unlayered and take
 * the surface through `xstyle`.
 */

import * as stylex from '@stylexjs/stylex';
import {
  borderVars,
  colorVars,
  focusVars,
} from '@astryxdesign/core/theme/tokens.stylex';

export const commentRowSurfaceStyles = stylex.create({
  /** The hidden toggle that names the thread has focus: the surface takes the system focus ring. */
  focused: {
    outlineStyle: focusVars['--focus-outline-style'],
    outlineWidth: focusVars['--focus-outline-width'],
    outlineColor: focusVars['--focus-outline-color'],
    outlineOffset: focusVars['--focus-outline-offset'],
  },
  /** Only Card's default variant draws a border, so a selected Card keeps that variant and takes the muted fill. */
  selectedFill: {
    backgroundColor: colorVars['--color-background-muted'],
  },
  /** Forced colors replace the muted fill with the system background, so a selected thread keeps a visible outline there. */
  selectedForcedColors: {
    outlineStyle: {default: null, '@media (forced-colors: active)': 'solid'},
    outlineWidth: {
      default: null,
      '@media (forced-colors: active)': `calc(${borderVars['--border-width']} * 2)`,
    },
    outlineColor: {
      default: null,
      '@media (forced-colors: active)': 'Highlight',
    },
    outlineOffset: {
      default: null,
      '@media (forced-colors: active)': `calc(${borderVars['--border-width']} * -2)`,
    },
  },
});
