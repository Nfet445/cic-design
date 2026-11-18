// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file text.stylex.ts
 * @input Uses StyleX; the class builders in `textClasses.ts`
 * @output The class builders Text and Heading read, and the one StyleX rule
 *   the lab LineClamp still reads
 * @position Public subpath `@astryxdesign/core/Text/text.stylex`, kept so
 *   existing imports resolve.
 *
 * The type scale, color, weight, display, truncation, wrap, capsize, justify
 * and decoration styles are class strings now: pass them to `className`, not to
 * `stylex.props`. `truncationTooltipStyles` stays a StyleX rule because
 * `packages/lab` LineClamp reads it through `stylex.props`; it becomes a class
 * with that component.
 *
 * @deprecated Import from `@astryxdesign/core/Text` instead.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Text/Text.doc.mjs
 */

import * as stylex from '@stylexjs/stylex';

export {
  headingClassName,
  textClassName,
  textLineClampVars,
  truncationTooltipContentClassName,
  type HeadingClassNameOptions,
  type TextClassNameOptions,
} from './textClasses';

/** The width and word break of a truncation tooltip's content. */
export const truncationTooltipStyles = stylex.create({
  content: {
    maxWidth: 300,
    wordBreak: 'break-word',
  },
});
