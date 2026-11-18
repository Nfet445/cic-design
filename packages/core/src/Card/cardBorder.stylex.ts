// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file cardBorder.stylex.ts
 * @input Reads the `--container-padding-*` variables `container()` publishes
 * @output One StyleX rule that insets the card padding by the border width
 * @position Exception inside Card: the one rule a Tailwind class cannot carry.
 *
 * `container()` applies the padding from a class in `astryx-base`. A StyleX
 * rule is unlayered and wins over every utility in that layer, so the
 * border-inset `calc()` stays here: a class would only tie with the plain
 * padding container already set and let the sheet order decide. Only the
 * subtracted padding lives here; the border itself is a class in
 * `cardClasses.ts`.
 */

import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  // The border is drawn inside the padding — its width is subtracted from each
  // side — so the total inset (border + padding) equals the padding token.
  padding: {
    paddingInlineStart: `calc(var(--container-padding-inline-start) - var(--border-width))`,
    paddingInlineEnd: `calc(var(--container-padding-inline-end) - var(--border-width))`,
    paddingBlockStart: `calc(var(--container-padding-block-start) - var(--border-width))`,
    paddingBlockEnd: `calc(var(--container-padding-block-end) - var(--border-width))`,
  },
});

export const cardBorderStyles = styles;
