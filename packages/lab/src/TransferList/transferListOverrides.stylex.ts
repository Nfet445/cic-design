// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file transferListOverrides.stylex.ts
 * @input Accepts nothing: every rule is fixed
 * @output StyleX values that reverse a utility Button or Item already sets
 * @position Style exception; the component passes them through `xstyle`
 *
 * A plain utility here would be ordered by the built sheet, not by the class
 * attribute, so it cannot be trusted to win: `Item`'s disabled row sets
 * `pointer-events-none` and dims to `opacity-50`, and `Button` sets its own
 * label type scale and background image.
 */

import * as stylex from '@stylexjs/stylex';
import {
  colorVarNames,
  sizeVarNames,
  typeScaleVarNames,
} from '@astryxdesign/core/theme';

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

/** A disabled row still takes the pointer, so its disabled controls show their tooltips on hover. */
export const transferListDisabledRowPointerStyles = stylex.create({
  base: {pointerEvents: 'auto'},
});

/**
 * A disabled row already dims its end content, Remove included. Remove's own
 * disabled dim would make it fainter than the list's other controls.
 */
export const transferListRemoveOnDisabledRowStyles = stylex.create({
  base: {opacity: 1},
});
