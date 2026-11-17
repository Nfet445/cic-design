// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file indicatorPress.ts
 * @input None
 * @output indicatorPressProps, the private attribute of an indicator that
 *   paints its own press
 * @position Owner module of the private indicator-press attribute: the only
 *   file that names it. Astryx's circle mark marks itself, and
 *   `checkboxInputClasses.ts` reads it. No package entry exports it.
 */

/**
 * Marks a first-party replacement indicator that paints its own press, for a
 * shape that CheckboxInput's rounded-square press layer would tint past, such
 * as a circle. CheckboxInput leaves that layer off over an indicator with this
 * attribute.
 *
 * @internal Not public API: the touch press reaches the indicator through a
 * private property.
 */
export const indicatorPressProps: Readonly<Record<string, string>> = {
  'data-astryx-indicator-press': '',
};
