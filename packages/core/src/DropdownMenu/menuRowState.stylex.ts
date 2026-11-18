// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file menuRowState.stylex.ts
 * @input Reads the row paint variables a held pointer sets on the row
 * @output The focused and held fills of a menu row, and the ring's inset
 * @position Exception inside DropdownMenu: the rule a Tailwind class cannot
 *   carry, shared by every menu row.
 *
 * A menu row paints its own unlayered fill, and `Item`'s hover and press
 * overlays and the shared focus ring are unlayered too: a utility in
 * `astryx-base` loses to them whatever the class order says. The row's box,
 * its open paint and its disabled look are the class maps'.
 */

import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  row: {
    backgroundColor: {
      default: 'transparent',
      // menuPressLitRowClassName sets the variable on the row a held finger or pen
      // lights.
      ':focus': `var(--_menu-row-focus-paint, var(--color-overlay-hover))`,
    },
    // Rows show focus with a translucent overlay, which forced colors replace
    // with the page color. The standard focus ring (focusOutlineStyles), drawn
    // inside the row by its own width, marks the focused row in every mode.
    // The ring and its offset share one tier, so the row's offset outranks the
    // shared one only beside it, unlayered.
    outlineOffset: `calc(-1 * var(--focus-outline-width))`,
  },
  // The item row and the sub-menu trigger repaint the held look as well: their
  // own fill is unlayered, so `Item`'s press overlay loses to it.
  paintedRow: {
    backgroundColor: {
      default: 'transparent',
      // menuPressLitRowClassName sets the variable on the row a held finger or pen
      // lights.
      ':focus': `var(--_menu-row-focus-paint, var(--color-overlay-hover))`,
      // The pressed look only where hover exists. Under a finger the row a
      // press BEGAN on would otherwise stay painted while the highlight (focus)
      // moves to the row under the finger — two rows lit. A held finger or pen
      // sets the variable on the menu. Then only the lit row keeps the look.
      '@media (hover: hover)': {
        default: null,
        ':active:where(:not(:disabled,[aria-disabled="true"]))': `var(--_menu-row-active-paint, var(--color-overlay-pressed))`,
      },
    },
    outlineOffset: `calc(-1 * var(--focus-outline-width))`,
  },
});

export const menuRowStateStyles = styles;
