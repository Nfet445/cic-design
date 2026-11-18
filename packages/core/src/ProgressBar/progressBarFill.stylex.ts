// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file progressBarFill.stylex.ts
 * @input Reads the radius, duration and ease tokens, and the fill's inline
 *   `--_progress-bar-*` variables
 * @output The determinate fill's rule and its empty arm
 * @position Exception inside ProgressBar: the one rule a Tailwind class cannot
 *   carry.
 *
 * The fill paints one declaration group under four conditions at once —
 * `:dir(rtl)`, `pointer: coarse`, `forced-colors: active` and
 * `prefers-reduced-motion: reduce`. A forced-colors utility and a coarse one
 * have the same specificity and the same class, so only the sheet order decides
 * between them, and Tailwind fixes that order per variant: the forced-colors
 * arm cannot be made to beat the coarse arm. StyleX raises a conditional rule's
 * specificity and negates every later key against the earlier ones, which is
 * what keeps the forced-colors `width`/`transform`/`transition-property` trio
 * above the touch arms (and the two reduced-motion keys above the touch one).
 *
 * Everything else on the bar is a Tailwind class in `progressBarClasses.ts`.
 * The filled share itself is still a value, published inline as
 * `--_progress-bar-fill`; only this rule reads it.
 */

import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  // The fill spans the whole track and slides with a transform, so a value
  // change animates on the compositor and keeps moving while a script runs;
  // animating `width` would lay out and repaint every frame on the main
  // thread. `--_progress-bar-fill` is the filled share, set inline; the
  // leading edge sits exactly there, mirrored for a bar whose own direction is
  // RTL (`:dir(rtl)`, the nearest `dir`, not any RTL ancestor).
  //
  // Under forced colors the fill is sized by `width` instead: the track's clip
  // would cut the CanvasText outline's start cap off a slid fill, and that
  // outline is what keeps the fill's shape visible.
  //
  // Under a finger the fill moves as UIProgressView does: from where it is
  // drawn, linearly, for `progress.fillTrackMs` times the share moved
  // (`--_progress-bar-move`, `--_progress-bar-curve`, written by the touch
  // layer). Above zero it never draws shorter than `--_progress-bar-min`; at
  // zero it paints nothing. Under reduced motion it lands at once.
  fill: {
    width: {
      default: '100%',
      '@media (forced-colors: active)': {
        default: 'var(--_progress-bar-fill, 0%)',
        '@media (pointer: coarse)':
          'calc(max(var(--_progress-bar-fill, 0%), var(--_progress-bar-min, 0px)) + var(--_progress-bar-flip, 0) * 0.01px)',
      },
    },
    height: '100%',
    // Forced colors replace status fills with Canvas; this boundary keeps the
    // fill's shape visible.
    outlineWidth: {default: null, '@media (forced-colors: active)': '1px'},
    outlineStyle: {default: null, '@media (forced-colors: active)': 'solid'},
    outlineColor: {
      default: null,
      '@media (forced-colors: active)': 'CanvasText',
    },
    outlineOffset: {default: null, '@media (forced-colors: active)': '-1px'},
    borderRadius: 'var(--radius-full)',
    transform: {
      default: 'translateX(calc(var(--_progress-bar-fill, 0%) - 100%))',
      ':dir(rtl)': {
        default: 'translateX(calc(100% - var(--_progress-bar-fill, 0%)))',
        '@media (forced-colors: active)': 'none',
      },
      '@media (pointer: coarse)': {
        // `--_progress-bar-flip` steps 0, 1, 2, 0… on every change. It moves
        // the fill by that many hundredths of a pixel. So a change back to the
        // value it just left is never the running transition's own start
        // value. CSS shortens a transition that reverses to its start, which
        // would halve a return mid-flight (10 → 90 → 10). It takes three
        // values because two would repeat on that return.
        default:
          'translateX(calc(max(var(--_progress-bar-fill, 0%), var(--_progress-bar-min, 0px)) - 100% + var(--_progress-bar-flip, 0) * 0.01px))',
        ':dir(rtl)':
          'translateX(calc(min(calc(100% - var(--_progress-bar-fill, 0%)), calc(100% - var(--_progress-bar-min, 0px))) - var(--_progress-bar-flip, 0) * 0.01px))',
      },
      // After the touch key, so StyleX negates that key under forced colors.
      '@media (forced-colors: active)': 'none',
    },
    willChange: {
      default: 'transform',
      '@media (forced-colors: active)': 'auto',
    },
    transitionProperty: {
      default: 'transform',
      '@media (forced-colors: active)': 'width',
    },
    // Under reduced motion a new value lands at once, with a mouse as with a
    // finger: the fill never travels. The keys are the shared reduced-motion
    // queries, as the other transitions spell them. The coarse key comes after
    // the touch key, so it wins there.
    transitionDuration: {
      default: 'var(--duration-medium)',
      // The touch layer's move (the `progress.fillTrackMs` role times the
      // share moved), scaled by the theme's tempo.
      '@media (pointer: coarse)': {
        default:
          'calc(var(--_progress-bar-move, 0ms) * var(--_astryx-motion-tempo, 1))',
        // Under forced colors the fill is sized by `width` instead. Touch
        // motion never animates a layout property, so with a finger the new
        // size lands at once there.
        '@media (forced-colors: active)': '0s',
      },
      '@media (prefers-reduced-motion: reduce) and (not (pointer: coarse))':
        '0s',
      '@media (prefers-reduced-motion: reduce) and (pointer: coarse)': '0s',
    },
    transitionTimingFunction: {
      default: 'var(--ease-standard)',
      '@media (pointer: coarse)': 'var(--_progress-bar-curve, linear)',
    },
  },
  fillEmpty: {
    opacity: {
      default: null,
      '@media (pointer: coarse)': 0,
    },
  },
});

export const progressBarFillStyles = styles;
