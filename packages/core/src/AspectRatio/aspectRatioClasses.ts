// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file aspectRatioClasses.ts
 * @input Uses the Tailwind class vocabulary
 * @output Exports the AspectRatio class map, its shape, fit and ratio classes
 * @position AspectRatio's one style source; AspectRatio.tsx joins these with
 *   `tw()` and the package stylesheet builds the rules
 *
 * SYNC: When AspectRatio's styles change, update this file and rebuild the
 * stylesheet.
 */

/** The ratio box: relative, full width, clipped, and never collapsing. */
export const aspectRatioClassName =
  'relative w-full shrink-0 overflow-clip min-h-0';

/**
 * `50%` on both axes follows the box dimensions, so the clip respects the
 * ratio: a circle at 1:1 and an oval at non-square ratios. It is not
 * `rounded-full`, which clamps to a pill.
 */
export const aspectRatioEllipseClassName = 'rounded-[50%]';

/** The wrapper that fills the box; the child sits inside it. */
export const aspectRatioChildClassName = 'absolute start-0 top-0 size-full';

/** `fit="center"` centers the child at its natural size. */
export const aspectRatioChildCenterClassName =
  'flex items-center justify-center';

/** `cover`/`contain` size the child itself, so they key on the direct child. */
export const aspectRatioChildFillClassName = '[&>*]:size-full';

export const aspectRatioChildCoverClassName = '[&>:is(img,video)]:object-cover';

export const aspectRatioChildContainClassName =
  '[&>:is(img,video)]:object-contain';

/**
 * The ratio reads a private variable the component sets inline. A class-level
 * declaration, not an inline one, so `xstyle` rules — `@media` and `@container`
 * ones included — and unlayered consumer CSS can override it.
 */
export const aspectRatioRatioClassName = 'aspect-(--_aspect-ratio)';

/** The variable `aspectRatioRatioClassName` reads. */
export const ASPECT_RATIO_VAR = '--_aspect-ratio';
