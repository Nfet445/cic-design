// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file dialogFullscreenSafeArea.stylex.ts
 * @input Reads `--astryx-dialog-padding*` and the safe-area insets
 * @output One StyleX rule that pads a fullscreen dialog, and the padding
 *   strings its test compares against
 * @position Exception inside Dialog: the one rule a Tailwind class cannot carry
 *
 * `container()` applies the theme's padding to this same element from an
 * unlayered rule. An unlayered declaration wins over every utility in
 * `astryx-base`, so this padding stays here: a class would lose to the plain
 * padding the container already set. The rest of the dialog is a class in
 * `dialogClasses.ts`.
 */

import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';

const dialogFullscreenSafeAreaBlockStartPadding = `var(--astryx-dialog-padding-block-start, var(--astryx-dialog-padding, max(${spacingVars['--spacing-4']}, env(safe-area-inset-top, 0px))))`;
const dialogFullscreenSafeAreaBlockEndPadding = `var(--astryx-dialog-padding-block-end, var(--astryx-dialog-padding, max(${spacingVars['--spacing-4']}, env(safe-area-inset-bottom, 0px))))`;
const dialogFullscreenSafeAreaInlineStartPaddingLtr = `var(--astryx-dialog-padding-inline-start, var(--astryx-dialog-padding-inline, var(--astryx-dialog-padding, max(${spacingVars['--spacing-4']}, env(safe-area-inset-left, 0px)))))`;
const dialogFullscreenSafeAreaInlineStartPaddingRtl = `var(--astryx-dialog-padding-inline-start, var(--astryx-dialog-padding-inline, var(--astryx-dialog-padding, max(${spacingVars['--spacing-4']}, env(safe-area-inset-right, 0px)))))`;
const dialogFullscreenSafeAreaInlineEndPaddingLtr = `var(--astryx-dialog-padding-inline-end, var(--astryx-dialog-padding-inline, var(--astryx-dialog-padding, max(${spacingVars['--spacing-4']}, env(safe-area-inset-right, 0px)))))`;
const dialogFullscreenSafeAreaInlineEndPaddingRtl = `var(--astryx-dialog-padding-inline-end, var(--astryx-dialog-padding-inline, var(--astryx-dialog-padding, max(${spacingVars['--spacing-4']}, env(safe-area-inset-left, 0px)))))`;

/** @internal Verified by Dialog.test.tsx; not re-exported from the package entry point. */
export const dialogFullscreenSafeAreaPaddingContract = {
  blockStart: dialogFullscreenSafeAreaBlockStartPadding,
  blockEnd: dialogFullscreenSafeAreaBlockEndPadding,
  inlineStart: {
    ltr: dialogFullscreenSafeAreaInlineStartPaddingLtr,
    rtl: dialogFullscreenSafeAreaInlineStartPaddingRtl,
  },
  inlineEnd: {
    ltr: dialogFullscreenSafeAreaInlineEndPaddingLtr,
    rtl: dialogFullscreenSafeAreaInlineEndPaddingRtl,
  },
} as const;

const styles = stylex.create({
  fullscreenSafeArea: {
    paddingBlockStart: dialogFullscreenSafeAreaBlockStartPadding,
    paddingBlockEnd: dialogFullscreenSafeAreaBlockEndPadding,
    paddingInlineStart: {
      default: dialogFullscreenSafeAreaInlineStartPaddingLtr,
      ':is([dir="rtl"] *)': dialogFullscreenSafeAreaInlineStartPaddingRtl,
    },
    paddingInlineEnd: {
      default: dialogFullscreenSafeAreaInlineEndPaddingLtr,
      ':is([dir="rtl"] *)': dialogFullscreenSafeAreaInlineEndPaddingRtl,
    },
  },
});

export const dialogFullscreenSafeAreaStyles = styles;
