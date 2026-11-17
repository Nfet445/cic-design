// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file bottomSheetPanelMotion.stylex.ts
 * @input The panel's motion state, whether its entry is settled, and the
 *   reduced-motion queries
 * @output The sheet's entrance, exit and cross-fade rules
 * @position Exception inside BottomSheetPanel: the rules a Tailwind class
 *   cannot carry
 *
 * The panel times the end of every motion itself: `waitForTransition` and
 * `hasRunningTransition` read its own computed `transition-property`,
 * `-duration` and `-delay` to decide when a rise or an exit is over, so those
 * declarations must be rules the runtime can read back. They also hold two
 * arms of one property (`transform`, `transition-duration`) whose order
 * decides the outcome, and a `@starting-style` arm nested inside a media
 * query. The Tailwind sheet of this component keeps its visual styling; this
 * is the motion it reads.
 */

import * as stylex from '@stylexjs/stylex';
import {durationVars, easeVars} from '../theme/tokens.stylex';

/**
 * The reduced-motion query. With a coarse primary pointer the sheet
 * cross-fades, else it changes at once. The cross-fade lasts at most 200 ms.
 */
const REDUCED_MOTION_COARSE =
  '@media (prefers-reduced-motion: reduce) and (pointer: coarse)';
const CROSS_FADE_MS = 200;

export const bottomSheetSheetMotionStyles = stylex.create({
  sheet: {
    // Under reduced motion no transform runs. On a coarse primary pointer the
    // entrance is an opacity cross-fade of at most 200 ms. A fine pointer gets
    // the change at once (the 0.01s collapse).
    transform: {
      default: 'translateY(0)',
      '@starting-style': {
        default: 'translateY(100%)',
        '@media (prefers-reduced-motion: reduce)': 'translateY(0)',
      },
    },
    opacity: {
      default: 1,
      '@starting-style': {
        default: 1,
        [REDUCED_MOTION_COARSE]: 0,
      },
    },
    transitionProperty: 'transform, opacity',
    transitionDuration: {
      default: durationVars['--duration-medium'],
      '@media (prefers-reduced-motion: reduce)': {
        default: '0.01s',
        '@media (pointer: coarse)': `0.01s, ${CROSS_FADE_MS}ms`,
      },
    },
    transitionTimingFunction: easeVars['--ease-standard'],
    // The dialog writes its scrim's opacity on itself for each move of a drag,
    // and only its backdrop reads it. A custom property inherits, so each
    // write would restyle every element in the sheet. The panel ends the
    // inheritance, so the restyle stops here.
    '--_sheet-scrim-opacity': 'initial',
    '--_sheet-scrim-duration': 'initial',
    '--_sheet-scrim-easing': 'initial',
  },
  // A sheet present on page load opens where it rests: the collapse reduced
  // motion uses, so the transition still ends.
  sheetSettled: {
    transitionDuration: '0.01s',
  },
  /**
   * The exit is its own motion, not the entrance played backwards. The
   * decelerate `--ease-standard` put the sheet half off-screen in 59ms of a
   * 410ms close, so the travel ended before the eye followed it. An exit
   * accelerates instead (`--ease-exit`). The curve is gentle, so the sheet
   * moves within ~50ms and the close reads as one departure. The duration is
   * the entrance's band, because a shorter band leaves too little travel when
   * a theme scales motion down.
   */
  sheetClosing: {
    // Under reduced motion the exit does not travel. On a coarse pointer it
    // fades out where it is, and on a fine one it ends at once.
    transform: {
      default: 'translateY(100%)',
      '@media (prefers-reduced-motion: reduce)': 'translateY(0)',
    },
    opacity: {
      default: null,
      [REDUCED_MOTION_COARSE]: 0,
    },
    // A pointer presentation closes on the theme's exit curve. A touch
    // presentation keeps its own curve, which the exit tokens do not change.
    transitionTimingFunction: {
      default: easeVars['--ease-exit'],
      '@media (pointer: coarse)': 'cubic-bezier(0.3, 0, 0.6, 0.6)',
    },
  },
  /**
   * An exit that cross-fades on a pointer that the media query does not
   * cover: a touch swipe dismissal under reduced motion fades out in place on
   * every pointer. It uses the opacity and ceiling of the coarse-pointer rule.
   */
  sheetClosingCrossFade: {
    transform: 'translateY(0)',
    opacity: 0,
    transitionDuration: `0.01s, ${CROSS_FADE_MS}ms`,
  },
  sheetFading: {
    opacity: 0,
  },
});
