// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file alertDialogTouchMotion.stylex.ts
 * @input Reads `--astryx-motion-will-change-backdrop` while the touch motion
 *   drives the dialog
 * @output One StyleX rule that turns off the theme's entrance animation
 * @position Exception inside AlertDialog: the one rule a Tailwind class cannot
 *   carry
 *
 * The touch motion drives the dialog, so the theme's entrance keyframes must
 * not play. `dialogClasses.ts` sets them from an `open:[animation-name:…]`
 * class, and two utilities in `astryx-base` are decided by sheet order, not by
 * the class attribute, so a second class cannot switch the animation off. An
 * unlayered rule can.
 *
 * The rule also promotes the dimming through
 * `--astryx-motion-will-change-backdrop` on the backdrop, which the animator
 * writes: without it, Mobile Safari keeps an unlayered backdrop's animation on
 * the main thread at its first commit.
 */

import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  touchMotion: {
    animationName: 'none',
    '::backdrop': {
      willChange: 'var(--astryx-motion-will-change-backdrop, auto)',
    },
  },
});

export const alertDialogTouchMotionStyles = styles;
