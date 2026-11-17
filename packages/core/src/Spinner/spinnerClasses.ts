// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file spinnerClasses.ts
 * @input Accepts the spinner size and shade
 * @output Tailwind utility class names for the spinner box, its ring, the
 *   rotor and the per-size and per-shade public variables
 * @position Internal to Spinner, and shared with Lab's CircularProgress
 *   through `@astryxdesign/core/internal/spinner-rotor`.
 *
 * The rotor's keyframes live in `tailwind/astryx.input.css` as
 * `@keyframes astryxSpinnerRotor`, because the build scans class maps only.
 * One class spells the whole animation shorthand literally, and the
 * reduced-motion arm re-states the shorthand: a still ring reads as broken, so
 * that arm slows the turn instead of dropping it.
 */

import {tw} from '../utils/tw';
import type {SpinnerShade, SpinnerSize} from './Spinner';

/** Names of the private variables this component reads. */
export const spinnerVars = {
  diameter: '--_spinner-ring-diameter',
  stroke: '--_spinner-ring-stroke',
  boxSize: '--_spinner-box-size',
} as const;

export const spinnerWrapperClassName =
  'inline-flex flex-col items-center gap-[var(--spacing-2)]';

/**
 * The box and the ring. The public geometry vars are resolved into the private
 * `<length>` pair the `calc()`s below need, and the box they compose is what
 * the element's inline width/height reads.
 */
export const spinnerClassName = tw(
  'inline-grid place-items-center align-middle',
  '[flex-shrink:0]',
  '[--_spinner-ring-diameter:var(--spinner-diameter)]',
  '[--_spinner-ring-stroke:var(--spinner-stroke-width)]',
  '[--_spinner-box-size:calc(var(--_spinner-ring-diameter)_+_var(--_spinner-ring-stroke)*2)]',
);

export const spinnerRingClassName = tw(
  'block [grid-area:1/1] overflow-visible',
  '[backface-visibility:hidden]',
  'w-[var(--_spinner-box-size)] h-[var(--_spinner-box-size)]',
);

export const spinnerRotorBoxClassName =
  'block [grid-area:1/1] w-[var(--_spinner-box-size)] h-[var(--_spinner-box-size)]';

/**
 * The turning arc. Its own compositing layer from the first frame, because
 * mobile Safari keeps a re-timed animation off the main thread only on an
 * element with one. One iteration holds 100 turns, so Chromium wakes the main
 * thread once in 100 turns while React listens for `animationiteration`.
 */
export const spinnerRotorTurnClassName = tw(
  '[will-change:transform]',
  'animate-[astryxSpinnerRotor_calc(var(--_astryx-pre-tempo-duration-slow-min,var(--duration-slow-min))*100)_linear_infinite]',
  'motion-reduce:animate-[astryxSpinnerRotor_calc(3s*100)_linear_infinite]',
);

/**
 * The ring shape. `r` and `stroke-width` are CSS properties on an SVG shape
 * and outrank the presentation attributes of the same name, so the attributes
 * stay as the pre-stylesheet default and these take over once the cascade has
 * a themed value.
 */
export const spinnerCircleClassName = tw(
  'fill-none [transform-box:fill-box] origin-center',
  '[stroke-linecap:round]',
  '[r:calc(var(--_spinner-ring-diameter)/2)]',
  '[stroke-width:var(--_spinner-ring-stroke)]',
);

/** The arc's paint and its dash pattern, both off the resolved geometry. */
export const spinnerArcClassName = tw(
  '[stroke:var(--spinner-color)]',
  '[transform:rotate(-90deg)]',
  '[stroke-dasharray:calc(var(--_spinner-ring-diameter)*3.141592653589793*var(--spinner-arc-fraction))_calc(var(--_spinner-ring-diameter)*3.141592653589793*(1_-_var(--spinner-arc-fraction)))]',
);

export const spinnerTrackClassName = '[stroke:var(--spinner-track-color)]';

/**
 * What each named size resolves to. Both groups declare the four public vars,
 * on the element that carries the `spinner` theme target, and everything
 * downstream reads them.
 */
export const spinnerSizeClassName: Record<SpinnerSize, string> = {
  sm: '[--spinner-diameter:10px] [--spinner-stroke-width:2px] [--spinner-arc-fraction:0.375]',
  md: '[--spinner-diameter:14px] [--spinner-stroke-width:3px] [--spinner-arc-fraction:0.375]',
  lg: '[--spinner-diameter:18px] [--spinner-stroke-width:3px] [--spinner-arc-fraction:0.375]',
  xl: '[--spinner-diameter:28px] [--spinner-stroke-width:4px] [--spinner-arc-fraction:0.375]',
};

export const spinnerShadeClassName: Record<SpinnerShade, string> = {
  default:
    '[--spinner-color:var(--color-accent)] [--spinner-track-color:var(--color-track)]',
  subtle:
    '[--spinner-color:var(--color-text-secondary)] [--spinner-track-color:var(--color-track)]',
  onMedia:
    '[--spinner-color:var(--color-on-dark)] [--spinner-track-color:var(--color-on-dark)]',
  inherit:
    '[--spinner-color:currentColor] [--spinner-track-color:currentColor]',
};

/**
 * The track's alpha is a property, not a color: it composites over whatever
 * color the shade or the theme supplies. `77 / 255` is the `4D` the onMedia
 * token's hex used to carry.
 */
export const spinnerTrackOpacityClassName: Record<SpinnerShade, string> = {
  default: '[stroke-opacity:1]',
  subtle: '[stroke-opacity:1]',
  onMedia: '[stroke-opacity:0.30196078431372547]',
  inherit: '[stroke-opacity:0.3]',
};
