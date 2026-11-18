// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file switchHoverPress.stylex.ts
 * @input The switch's marker scopes, its state and the press the row holds
 * @output The input's hit-area box, the track's hover tint, the focus ring,
 *   the mouse press's overlay and the two touch press layers
 * @position StyleX survivor beside Switch; the markers stay in
 *   switch.markers.stylex.ts
 *
 * Each of these paints reads the `switchScope` or `switchFocusInput` marker,
 * and only the marker's generated class name reaches the selector, so no
 * utility can restate it. The same selector also outranks a utility in any
 * sheet order, so the hover tint and the mouse press land over the fills
 * `switchClasses.ts` sets at rest.
 *
 * The input's box is here for another reason: the centering class
 * (`utils/rtlClasses.ts`) puts the box at the inline center, and this
 * `transform` adds the vertical half and the hit insets. Unlayered StyleX
 * outranks every layer, so the class's own transform yields to it.
 *
 * The two releases are frames in tailwind/astryx.input.css. Only the marker's
 * arms can name them, so the clock and its Reduce Motion cap stay here.
 *
 * SYNC: When modified, update Switch.tsx and switchClasses.ts.
 */

import * as stylex from '@stylexjs/stylex';
import {reducedMotionFadeConsts} from '../motion/reducedMotion.stylex';
import {switchFocusInput, switchScope} from './switch.markers.stylex';

const TOUCH = '@media (pointer: coarse)';
// The press controller's two states on the row it writes.
const PRESS_ON_SELECTOR = '[data-astryx-press="on"]';
const PRESS_FADING_SELECTOR = '[data-astryx-press="fading"]';

/**
 * The shared press release, for the press layers the switch fades on the
 * compositor: the theme's exit motion tokens, no longer than the Reduce
 * Motion fade under Reduce Motion. Switch.test.tsx compares them with
 * the overlay's.
 * SYNC: utils/interactionOverlay.stylex.ts PRESS_RELEASE_DURATION,
 * PRESS_RELEASE_DURATION_REDUCED and RELEASE_EASE.
 */
const PRESS_RELEASE_DURATION = 'var(--duration-exit)';
const PRESS_RELEASE_DURATION_REDUCED = `min(var(--duration-exit), ${reducedMotionFadeConsts.duration})`;
const PRESS_RELEASE_EASE = 'var(--ease-exit)';

// The measured hit insets (utils/hitArea), 0 until measured.
const HIT_TOP = 'var(--astryx-hit-inset-top, 0px)';
const HIT_RIGHT = 'var(--astryx-hit-inset-right, 0px)';
const HIT_BOTTOM = 'var(--astryx-hit-inset-bottom, 0px)';
const HIT_LEFT = 'var(--astryx-hit-inset-left, 0px)';

const pressedImage = `linear-gradient(var(--color-overlay-pressed), var(--color-overlay-pressed))`;

export const switchHoverPressStyles = stylex.create({
  // The invisible input covers the track. Under a coarse pointer it is the
  // hit area a finger needs. It grows toward 44 × 44 px by the insets
  // utils/hitArea measures, each side stopping at half the gap to a
  // neighbouring target. Its center moves with any uneven side, and nothing
  // visible grows. The insets are 0 until measured. Physical left and
  // translate, as rtlCenterInlineClassName: the insets are physical sides.
  inputBox: {
    width: {
      default: '100%',
      '@media (pointer: coarse)': `calc(100% + ${HIT_LEFT} + ${HIT_RIGHT})`,
    },
    height: {
      default: '100%',
      '@media (pointer: coarse)': `calc(100% + ${HIT_TOP} + ${HIT_BOTTOM})`,
    },
    transform: {
      default: 'translate(-50%, -50%)',
      '@media (pointer: coarse)': `translate(calc(-50% + (${HIT_RIGHT} - ${HIT_LEFT}) / 2), calc(-50% + (${HIT_BOTTOM} - ${HIT_TOP}) / 2))`,
    },
  },
  // The one ring in the system not drawn by focusOutlineStyles. The focusable
  // input is the track's preceding sibling, so the condition reads that input
  // through its own marker: a sibling relation, never a `:has()` scan of the
  // row, which would restyle everything under it on any change. A marker
  // cannot be shared across components without leaking focus state from an
  // outer one, so it cannot live in the utility. StyleX also cannot inline a
  // constant imported from another module, so the values are read from the
  // tokens the utility reads.
  focusRing: {
    outline: {
      default: 'none',
      [stylex.when.siblingBefore(':focus-visible', switchFocusInput)]:
        `var(--focus-outline-width) var(--focus-outline-style) var(--focus-outline-color)`,
    },
    outlineOffset: {
      default: null,
      [stylex.when.siblingBefore(':focus-visible', switchFocusInput)]:
        'var(--focus-outline-offset)',
    },
  },
  // The ancestor-hover tint is a non-system color-mix, and its rule outranks
  // the plain forced-colors fill. Left ungated it would reassert on hover
  // under forced colors, where the UA flattens the color-mix back to Canvas —
  // so the HighlightText thumb would sit on a white track (white-on-white).
  // Gating on `forced-colors: none` keeps the tint out of forced colors and
  // lets the system-color track stand.
  trackOffHover: {
    backgroundColor: {
      default: null,
      [stylex.when.ancestor(':hover', switchScope)]: {
        '@media (hover: hover) and (forced-colors: none)': `color-mix(in srgb, var(--color-background-gray), var(--color-tint-hover) 5%)`,
      },
    },
  },
  trackOnHover: {
    backgroundColor: {
      default: null,
      [stylex.when.ancestor(':hover', switchScope)]: {
        '@media (hover: hover) and (forced-colors: none)': `color-mix(in srgb, var(--color-accent), var(--color-tint-hover) 15%)`,
      },
    },
  },
  // Pressed: the overlay rides on top of the on/off fill, so the whole
  // control darkens rather than the thumb standing out against a darker
  // track. Gated like the hover tint so forced colors keeps its system-color
  // track.
  //
  // The press, under a finger: a layer over the track's fill and colour fade
  // and under the thumb. It exists only while the row is pressed or
  // releasing. Its opacity is the press: on at once, then the shared release's
  // clock and curve. The release runs on the compositor, so the press never
  // sticks while the main thread is busy.
  trackPress: {
    backgroundImage: {
      default: null,
      [stylex.when.ancestor(':active', switchScope)]: {
        default: null,
        '@media (forced-colors: none)': {
          default: pressedImage,
          // Under a coarse pointer the touch press controller's attribute
          // on the row takes over, and the press layer (::before) paints it.
          '@media (pointer: coarse)': 'none',
        },
      },
    },
    '::before': {
      content: {
        default: null,
        [stylex.when.ancestor(PRESS_ON_SELECTOR, switchScope)]: {
          default: null,
          [TOUCH]: '""',
        },
        [stylex.when.ancestor(PRESS_FADING_SELECTOR, switchScope)]: {
          default: null,
          [TOUCH]: '""',
        },
      },
      position: 'absolute',
      inset: 0,
      zIndex: 1,
      borderRadius: 'inherit',
      pointerEvents: 'none',
      backgroundColor: {
        default: null,
        '@media (forced-colors: none)': 'var(--color-overlay-pressed)',
      },
      opacity: {
        default: null,
        [stylex.when.ancestor(PRESS_ON_SELECTOR, switchScope)]: {
          default: null,
          [TOUCH]: 1,
        },
        [stylex.when.ancestor(PRESS_FADING_SELECTOR, switchScope)]: {
          default: null,
          [TOUCH]: 0,
        },
      },
      animationName: {
        default: null,
        [stylex.when.ancestor(PRESS_FADING_SELECTOR, switchScope)]: {
          default: null,
          [TOUCH]: 'astryxSwitchPressRelease',
        },
      },
      animationDuration: {
        default: null,
        [stylex.when.ancestor(PRESS_FADING_SELECTOR, switchScope)]: {
          default: null,
          [TOUCH]: {
            default: PRESS_RELEASE_DURATION,
            '@media (prefers-reduced-motion: reduce) and (pointer: coarse)':
              PRESS_RELEASE_DURATION_REDUCED,
          },
        },
      },
      animationTimingFunction: {
        default: null,
        [stylex.when.ancestor(PRESS_FADING_SELECTOR, switchScope)]: {
          default: null,
          [TOUCH]: PRESS_RELEASE_EASE,
        },
      },
      animationFillMode: {
        default: null,
        [stylex.when.ancestor(PRESS_FADING_SELECTOR, switchScope)]: {
          default: null,
          [TOUCH]: 'both',
        },
      },
    },
  },
  // Pressed with a mouse: the same overlay as the track. Under a finger the
  // track's press layer paints under the thumb, which lifts.
  thumbPress: {
    backgroundImage: {
      default: null,
      [stylex.when.ancestor(':active', switchScope)]: {
        default: null,
        '@media (forced-colors: none)': {
          default: pressedImage,
          '@media (pointer: coarse)': 'none',
        },
      },
    },
    '::before': {
      content: {
        default: null,
        [stylex.when.ancestor(PRESS_ON_SELECTOR, switchScope)]: {
          default: null,
          [TOUCH]: '""',
        },
        [stylex.when.ancestor(PRESS_FADING_SELECTOR, switchScope)]: {
          default: null,
          [TOUCH]: '""',
        },
      },
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      pointerEvents: 'none',
      backgroundColor: {
        default: null,
        '@media (forced-colors: none)': 'var(--color-overlay-pressed)',
      },
      opacity: {
        default: null,
        [stylex.when.ancestor(PRESS_ON_SELECTOR, switchScope)]: {
          default: null,
          [TOUCH]: 1,
        },
        [stylex.when.ancestor(PRESS_FADING_SELECTOR, switchScope)]: {
          default: null,
          [TOUCH]: 0,
        },
      },
      animationName: {
        default: null,
        [stylex.when.ancestor(PRESS_FADING_SELECTOR, switchScope)]: {
          default: null,
          [TOUCH]: 'astryxSwitchPressRelease',
        },
      },
      animationDuration: {
        default: null,
        [stylex.when.ancestor(PRESS_FADING_SELECTOR, switchScope)]: {
          default: null,
          [TOUCH]: {
            default: PRESS_RELEASE_DURATION,
            '@media (prefers-reduced-motion: reduce) and (pointer: coarse)':
              PRESS_RELEASE_DURATION_REDUCED,
          },
        },
      },
      animationTimingFunction: {
        default: null,
        [stylex.when.ancestor(PRESS_FADING_SELECTOR, switchScope)]: {
          default: null,
          [TOUCH]: PRESS_RELEASE_EASE,
        },
      },
      animationFillMode: {
        default: null,
        [stylex.when.ancestor(PRESS_FADING_SELECTOR, switchScope)]: {
          default: null,
          [TOUCH]: 'both',
        },
      },
    },
  },
  /**
   * Composed after `interactionOverlayStyles.pressedAlpha` on the row. Under
   * a coarse primary pointer the track's and thumb's layers fade the press.
   * So the strength holds through the release, not animated on the main
   * thread. With any other pointer the row keeps `pressedAlpha`'s release.
   */
  pressStrength: {
    animationName: {
      default: null,
      [PRESS_FADING_SELECTOR]: {
        default: 'astryxSwitchPressStrength',
        '@media (prefers-reduced-motion: reduce) and (not (pointer: coarse))':
          'none',
        '@media (pointer: coarse)': 'none',
      },
    },
  },
});
