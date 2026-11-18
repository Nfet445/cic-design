// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file truncationTooltip.stylex.ts
 * @input StyleX; the same two declarations are the
 *   `truncationTooltipContentClassName` class in `textClasses.ts`
 * @output The one StyleX rule `Text/text.stylex` still publishes
 * @position Beside Text; `packages/lab` LineClamp reads it through
 *   `stylex.props`
 *
 * It stays StyleX because LineClamp hands it to `stylex.props`, which turns a
 * class string into an inline style and drops both declarations.
 */

import * as stylex from '@stylexjs/stylex';

/** The width and word break of a truncation tooltip's content. */
export const truncationTooltipStyles = stylex.create({
  content: {
    maxWidth: 300,
    wordBreak: 'break-word',
  },
});
