// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file toggleButtonClasses.ts
 * @input Accepts whether the toggle is pressed
 * @output Utility class strings for the ToggleButton surface and its label
 * @position Internal to ToggleButton; scanned by the Tailwind build
 *
 * A toggle renders a ghost Button, so its hover, focus, and press affordances
 * stay Button's. The classes here are only what the toggle adds: the pressed
 * surface and the weight reservation on its label.
 */

import {tw} from '../utils/tw';

/**
 * The pressed surface. `forced-color-adjust` must be `none` here: the toggle
 * renders a <button>, and the UA keeps native form-control colors (a
 * ButtonFace surface) for it under forced colors, ignoring the authored
 * Highlight fill — the label kept its HighlightText color, giving white text
 * on a white surface. Opting out of UA remapping renders both as authored and
 * restores figure-ground.
 */
const pressedSurfaceClassName = tw(
  // The `aria-pressed` variant raises specificity above the ghost surface
  // Button paints (`bg-transparent`): both classes sit in `astryx-base`, where
  // the sheet order, not the class attribute, decides the winner.
  'aria-pressed:bg-[var(--color-overlay-pressed)]',
  // Forced colors strips the painted overlay, which would leave an icon-only
  // toggle with no pressed indication at all. Highlight/HighlightText is the
  // platform convention for a selected control (WCAG 1.4.11).
  '[forced-color-adjust:none]',
  'aria-pressed:forced-colors:bg-[color:Highlight]',
  'aria-pressed:forced-colors:text-[color:HighlightText]',
);

/** The pressed surface when pressed, and the plain ghost surface otherwise. */
export function toggleButtonClassName({
  isPressed,
}: {
  isPressed: boolean;
}): string {
  return isPressed ? pressedSurfaceClassName : '';
}

/** The label box: the visible text and its reserved width stack as one column. */
export const toggleButtonLabelClassName =
  'inline-flex flex-col items-center justify-center';

/** The pressed label shifts to semibold, over the width the reservation holds. */
export const toggleButtonLabelPressedClassName =
  '[font-weight:var(--font-weight-semibold)]';

/**
 * The width reservation: the same text at semibold weight, unrendered, so the
 * label's wider box is already allotted and a press shifts no layout.
 */
export const toggleButtonLabelReservationClassName = tw(
  'block',
  '[font-weight:var(--font-weight-semibold)]',
  'h-0 overflow-hidden invisible pointer-events-none',
);
