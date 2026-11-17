// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file privateAttributes/pressClasses.ts
 * @input The indicator scope and press attributes the owning row carries
 * @output The pressed paint over a selection control's indicator
 * @position Tailwind counterpart of the press paint `press.stylex.ts` hands
 *   down; read by CheckboxInput's wrapper and RadioListItem's circle layer
 *
 * The row that carries `data-astryx-indicator-scope` drives both arms, and the
 * press controller writes `data-astryx-press` on that same row, so one
 * ancestor selector reaches both. StyleX cannot express this arm: its raw
 * selector keys place the element's own class first, and `when.ancestor` reads
 * its last key segment as a class.
 */

import {tw} from '../utils/tw';

/**
 * The `:active` fill of a press the controller does not paint. Under a coarse
 * pointer the controller paints every press, so a finger gets no fill.
 */
export const indicatorPressFillClassName = tw(
  'pointer-fine:[[data-astryx-indicator-scope]:active:not([data-astryx-press=on],[data-astryx-press=fading])_&]:after:bg-[var(--color-overlay-pressed)]',
);

/**
 * The controller's press, as an image over the fill. An image change is
 * discrete, so no transition can delay its onset; only the strength moves.
 */
export const indicatorPressImageClassName = tw(
  '[[data-astryx-indicator-scope][data-astryx-press=on]_&]:after:[background-image:var(--_press-paint-image)]',
  '[[data-astryx-indicator-scope][data-astryx-press=fading]_&]:after:[background-image:var(--_press-paint-image)]',
);
