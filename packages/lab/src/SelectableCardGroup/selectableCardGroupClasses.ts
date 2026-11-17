// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file selectableCardGroupClasses.ts
 * @input Accepts nothing: every class is fixed
 * @output The utility class strings the card row and its vertical spelling
 *   carry
 * @position Style primitives; the Tailwind build scans it for class names
 */

export const selectableCardGroupClassName = 'flex flex-wrap gap-3';

/**
 * A column never splits into two, so the wrap is off as well as the direction.
 */
export const selectableCardGroupVerticalClassName = 'flex-col flex-nowrap';
