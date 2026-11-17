// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file privateAttributes/menuPressLitClasses.ts
 * @input The mark a held finger or pen sets on the row it lights
 * @output The class that paints the marked row
 * @position Style primitives; scanned by the Tailwind build
 */

import {tw} from '../utils/tw';

/**
 * Compose on a menu row whose `:focus` background is
 * `var(--_menu-row-focus-paint, <hover overlay>)`, and whose `:active`
 * background, if any, is `var(--_menu-row-active-paint, <pressed overlay>)`.
 * The row paints the hover overlay on focus, and the pressed overlay while a
 * held finger or pen lights it.
 *
 * Under a finger, the hover overlay is too faint to follow. Each variable has
 * no default: a default would print beside the attribute arm and beat it.
 * The value resolves on the row, so a theme set on any ancestor applies.
 */
export const menuPressLitRowClassName = tw(
  /* eslint-disable @astryx/no-raw-private-attribute -- Tailwind scans class text, so the attribute has to be spelled here */
  '[&[data-astryx-menu-press-lit]]:[--_menu-row-focus-paint:var(--color-overlay-pressed)]',
  '[&[data-astryx-menu-press-lit]]:[--_menu-row-active-paint:var(--color-overlay-pressed)]',
  /* eslint-enable @astryx/no-raw-private-attribute */
);
