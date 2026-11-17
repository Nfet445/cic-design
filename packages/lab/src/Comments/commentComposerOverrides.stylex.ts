// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file commentComposerOverrides.stylex.ts
 * @input Accepts nothing: the rule is fixed
 * @output A StyleX radius the composer's quoted-passage Card takes through
 *   `xstyle`
 * @position Style exception; the component passes it through `xstyle`
 *
 * A plain utility here would be ordered by the built sheet, not by the class
 * attribute, and `Card` already sets its own container radius: the two
 * stylesheets share one layer, so neither class is guaranteed to win.
 */

import * as stylex from '@stylexjs/stylex';
import {radiusVars} from '@astryxdesign/core/theme/tokens.stylex';

/**
 * Concentric with the composer: its container radius less its compact padding
 * is the inner radius.
 */
export const commentComposerQuoteCardStyles = stylex.create({
  base: {borderRadius: radiusVars['--radius-inner']},
});
