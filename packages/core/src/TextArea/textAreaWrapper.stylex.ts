// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file textAreaWrapper.stylex.ts
 * @input Uses the spacing token for the textarea's inline padding
 * @output wrapperStyles.root — the bare positioning context the icons, status
 *   and counter anchor to
 * @position StyleX survivor beside TextArea
 *
 * The shared input wrapper sets `paddingBlock` and `paddingInline` in an
 * unlayered rule, and TextArea zeroes them with matching longhands. A class
 * lives in `astryx-base`, so it would lose to that unlayered declaration; the
 * zeroing has to outrank it and stay StyleX. A theme's `text-area` overrides
 * still win from the higher `astryx-theme` layer.
 */

import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';

export const wrapperStyles = stylex.create({
  // The <textarea> spans the full container and carries its own internal
  // padding, so icons, status, spinner and the character counter can anchor to
  // the container's corners: the native resize grip stays in the true
  // bottom-right corner and the scrollbar represents the full input area.
  root: {
    zIndex: 1,
    display: 'block',
    paddingBlock: 0,
    paddingInline: 0,
    // Internal inline padding for the textarea's text. Defined on the wrapper
    // so the counter (a sibling overlay) inherits the same value and stays
    // aligned with the text edge.
    '--_textarea-inline-padding': spacingVars['--spacing-2'],
  },
});
