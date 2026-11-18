// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file text.stylex.ts
 * @input The class builders in `textClasses.ts` and the one StyleX rule in
 *   `truncationTooltip.stylex.ts`
 * @output The names this public subpath always published, now re-exported
 * @position Public subpath `@astryxdesign/core/Text/text.stylex`, kept so
 *   existing imports resolve.
 *
 * The type scale, color, weight, display, truncation, wrap, capsize, justify
 * and decoration styles are class strings now: pass them to `className`, not to
 * `stylex.props`. `truncationTooltipStyles` is the one StyleX value left, for
 * `packages/lab` LineClamp, which passes it to `stylex.props`.
 *
 * @deprecated Import from `@astryxdesign/core/Text` instead.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Text/Text.doc.mjs
 */

export {
  headingClassName,
  textClassName,
  textLineClampVars,
  truncationTooltipContentClassName,
  type HeadingClassNameOptions,
  type TextClassNameOptions,
} from './textClasses';
export {truncationTooltipStyles} from './truncationTooltip.stylex';
