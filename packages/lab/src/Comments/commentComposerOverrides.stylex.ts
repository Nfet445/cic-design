// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file commentComposerOverrides.stylex.ts
 * @input Accepts nothing: the rule is fixed
 * @output A StyleX radius the composer's quoted-passage Card takes through
 *   `xstyle`
 * @position Style exception; the component passes it through `xstyle`
 *
 * `Card` already sets `rounded-[var(--radius-container)]`, so this radius must
 * outrank it. Both stylesheets sit in `astryx-base`, where a plain utility of
 * ours would be decided by the later sheet; StyleX's `:not(#\#)` selector
 * wins at either order.
 */

import * as stylex from '@stylexjs/stylex';
import {radiusVarNames} from '@astryxdesign/core/theme';

/**
 * Concentric with the composer: its container radius less its compact padding
 * is the inner radius.
 */
export const commentComposerQuoteCardStyles = stylex.create({
  base: {borderRadius: 'var(--radius-inner)'},
});
