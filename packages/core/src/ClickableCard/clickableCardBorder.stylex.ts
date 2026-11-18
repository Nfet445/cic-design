// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file clickableCardBorder.stylex.ts
 * @input Reads the `--container-padding-*` variables `container()` publishes
 * @output One StyleX rule that insets the bordered card's padding by the
 *   border width
 * @position Exception inside ClickableCard: the one rule a Tailwind class
 *   cannot carry.
 *
 * `container()` applies the padding from a class in `astryx-base`, and a
 * StyleX rule is unlayered and wins over that layer, so a padding class would
 * only tie with the container's own and let the sheet order decide. The
 * border-inset `calc()` therefore stays here; the rest of the bordered
 * variant — its border colour, its hover colour and its transition — is in
 * `clickableCardClasses.ts`.
 */

import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  // The bordered variant draws the 1px border *within* the padding by
  // subtracting the border width from every side. Total inset (border +
  // padding) then equals the borderless variants' padding, so content
  // geometry and outer dimensions stay identical across all variants.
  padding: {
    paddingInlineStart: `calc(var(--container-padding-inline-start) - var(--border-width))`,
    paddingInlineEnd: `calc(var(--container-padding-inline-end) - var(--border-width))`,
    paddingBlockStart: `calc(var(--container-padding-block-start) - var(--border-width))`,
    paddingBlockEnd: `calc(var(--container-padding-block-end) - var(--border-width))`,
  },
});

export const clickableCardBorderStyles = styles;
