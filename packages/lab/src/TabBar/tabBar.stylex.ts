// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tabBar.stylex.ts
 * @input StyleX marker system and Core's theme tokens
 * @output tabBarItemMarker — a scoped marker on each TabBar item button — and
 *   the two declarations that read it: the item box's outline style and the
 *   press layer
 * @position Shared StyleX seam consumed by TabBar.tsx
 *
 * Two declarations cannot move to Tailwind classes. Both are conditional on
 * `stylex.when.ancestor(…, tabBarItemMarker)`, and only StyleX can write a
 * condition against a scoped marker.
 *
 * The item buttons span the whole capsule between their neighbours, so a press
 * anywhere goes to the nearest item, as on iOS. The focus ring belongs on the
 * 76 × 54 item inside, and a held finger paints its tab at once
 * (useTabBarLens.ts writes the attribute).
 */

import * as stylex from '@stylexjs/stylex';
import {
  colorVarNames,
  durationVarNames,
  easeVarNames,
  focusVarNames,
} from '@astryxdesign/core/theme';

export const tabBarItemMarker: ReturnType<typeof stylex.defineMarker> =
  stylex.defineMarker();

export const tabBarMarkerStyles = stylex.create({
  /** The ring is on the item inside the button, which is where the eye is. */
  itemBox: {
    outlineStyle: {
      default: 'none',
      [stylex.when.ancestor(':focus-visible', tabBarItemMarker)]:
        'var(--focus-outline-style)',
    },
  },
  /**
   * With no tab selected, a held finger paints its tab at once. The paint is a
   * layer, and only its opacity fades after the lift, so the compositor runs
   * the fade. It plays the theme's exit duration and curve. Under Reduce
   * Motion the fade stays within 200 ms, whatever the theme's tempo.
   */
  pressLayer: {
    '::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      backgroundColor: 'var(--color-overlay-pressed)',
      pointerEvents: 'none',
      opacity: {
        default: 0,
        [stylex.when.ancestor('[data-tab-bar-pressed]', tabBarItemMarker)]: 1,
      },
      transitionProperty: 'opacity',
      transitionDuration: {
        default: 'var(--duration-exit)',
        '@media (prefers-reduced-motion: reduce)': `min(var(--duration-exit), 200ms)`,
        // Repeated inside the Reduce Motion branch, where a media rule
        // outranks the plain one, so the onset stays at once there too.
        [stylex.when.ancestor('[data-tab-bar-pressed]', tabBarItemMarker)]: {
          default: '0s',
          '@media (prefers-reduced-motion: reduce)': '0s',
        },
      },
      transitionTimingFunction: 'var(--ease-exit)',
    },
  },
});
