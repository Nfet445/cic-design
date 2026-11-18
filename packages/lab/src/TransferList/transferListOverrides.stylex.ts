// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file transferListOverrides.stylex.ts
 * @input Accepts nothing: the rule is fixed
 * @output The text-link treatment of a panel header's action Button
 * @position Style exception; the component passes it through `xstyle`
 *
 * The rival is still StyleX: a Button paints its hover and pressed background
 * image from `interactionOverlayStyles` (core `utils/interactionOverlay.stylex.ts`),
 * which is unlayered and carries id specificity, so no class in `astryx-base`
 * can state `background-image: none` over it. Every other declaration here
 * would convert; the image arms hold the rule here until that module moves.
 */

import * as stylex from '@stylexjs/stylex';

/**
 * A text-link treatment, but the hit target still has to clear the WCAG 2.5.8
 * 24px floor. The link keeps `height: auto` so its baseline aligns with the
 * panel heading; `minBlockSize` gives the button a >=24px target (the sm
 * element height) without changing where the text sits, and the width already
 * exceeds 24px.
 */
export const transferListHeaderActionStyles = stylex.create({
  base: {
    height: 'auto',
    minBlockSize: 'var(--size-element-sm)',
    paddingBlock: 0,
    paddingInline: 0,
    borderRadius: 0,
    color: 'var(--color-text-accent)',
    backgroundImage: {
      default: 'none',
      ':hover:where(:not(:disabled,[aria-disabled="true"]))': 'none',
      ':active': 'none',
    },
    textDecoration: {
      default: 'none',
      ':hover:where(:not(:disabled,[aria-disabled="true"]))': 'underline',
    },
    fontSize: 'var(--text-body-size)',
    fontWeight: 'var(--text-body-weight)',
    lineHeight: 'var(--text-body-leading)',
  },
});
