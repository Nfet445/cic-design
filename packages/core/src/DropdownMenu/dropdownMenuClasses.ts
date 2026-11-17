// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file dropdownMenuClasses.ts
 * @input The menu row's size, variant and disabled state, and the group and
 *   divider shapes the menu's leaf components share
 * @output The class maps for the dropdown menu family's leaves
 * @position Style primitives; scanned by the Tailwind build. The leaf
 *   components compose these with `tw`
 */

import {tw} from '../utils/tw';

/** The rule between groups of rows. */
export const dropdownMenuDividerClassName = tw(
  '[margin-block:var(--spacing-1)]',
);

/**
 * The group heading. It is not a `menuitem`, so it carries no row affordance;
 * the secondary text color keeps it apart from the rows it names.
 */
export const dropdownMenuGroupHeadingClassName = tw(
  '[padding-block:var(--spacing-1)]',
  '[padding-inline:var(--spacing-2)]',
  '[font-family:var(--font-family-body)]',
  'text-[length:var(--text-supporting-size)]',
  'leading-[var(--text-supporting-leading)]',
  'text-[color:var(--color-text-secondary)]',
  'select-none',
);
