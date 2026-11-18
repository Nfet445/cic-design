// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file bottomSheetStackMotion.stylex.ts
 * @input Reads `--spacing-2`, `--duration-medium` and `--ease-standard`
 * @output Three StyleX rules that recede a covered sheet, and the transform
 *   strings its test compares against
 * @position Exception inside BottomSheet: the rules a Tailwind class cannot carry
 *
 * The recede shares `transform` with the positioner's own travel, which a
 * class of the same layer may only beat by sheet order. A covered sheet has
 * to recede whatever order the two utilities print in, so the transform stays
 * in this rule of its own.
 */

import * as stylex from '@stylexjs/stylex';

const recedeLift = 'var(--spacing-2)';
const recededOneStep = `translateY(calc(-1 * ${recedeLift})) scale(0.96)`;
const recededTwoSteps = `translateY(calc(-2 * ${recedeLift})) scale(0.92)`;

/** @internal Verified by BottomSheetStacking.test.tsx; not re-exported from the package entry point. */
export const bottomSheetStackRecedeContract = {
  depth1: recededOneStep,
  depth2: recededTwoSteps,
} as const;

const styles = stylex.create({
  // A sheet in a stack recedes and returns with CSS motion only; the style
  // stays on while another sheet is presented so the return animates too.
  motion: {
    transformOrigin: '50% 0',
    transitionProperty: 'transform',
    transitionDuration: 'var(--duration-medium)',
    transitionTimingFunction: 'var(--ease-standard)',
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0.01s',
    },
  },
  // Covered sheets recede behind the top sheet: the nearest shrinks a step
  // about its top edge and lifts, the next shrinks a second step; deeper
  // sheets share that second step. Only sheets count toward the depth.
  receded1: {
    transform: recededOneStep,
  },
  receded2: {
    transform: recededTwoSteps,
  },
});

export const bottomSheetStackMotionStyles = styles;
