// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file groupStyles.ts
 * @input Nothing; it declares the marker every group member sets
 * @output Exports the marker props a member spreads on its element
 * @position Shared by InputGroup-compatible controls and Button addons
 *
 * The member's row rules, the corner reset and the focused member's rank are
 * class text in `inputGroupClasses.ts`. This module keeps only the marker the
 * group's edge selectors name members by.
 */

/**
 * The internal marker every InputGroup member sets on the element that carries
 * its group styles: compatible inputs, Button addons and InputGroupText. The
 * group's edge rules name members by it instead of a universal selector. Not
 * public API.
 */
export const inputGroupItemProps = {
  'data-astryx-input-group-item': '',
} as const;
