// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file dropdownMenuClasses.ts
 * @input The menu row's size, variant and disabled state, and the group and
 *   divider shapes the menu's leaf components share
 * @output The class maps for the dropdown menu family's leaves and the
 *   bottom-sheet presentation's frame
 * @position Style primitives; scanned by the Tailwind build. The leaf
 *   components compose these with `tw`
 */

import {tw} from '../utils/tw';

/** The rule between groups of rows. */
export const dropdownMenuDividerClassName = tw(
  '[margin-block:var(--spacing-1)]',
);

/**
 * The row's box: full width, borderless, and sized by its padding rather than
 * a fixed height. The radius steps back from the menu's own so a row drawn
 * against the menu's inner padding reads as an inset panel; both parts come
 * from the menu, and the token is the fallback.
 */
const MENU_ITEM_ROW_CLASS = tw(
  'box-border w-full',
  '[border-width:0] [border-style:none]',
  'rounded-[max(0px,calc(var(--_dropdown-menu-radius,var(--spacing-2))_-_var(--_dropdown-menu-padding,--spacing-1)))]',
  '[padding-inline:var(--spacing-2)]',
  '[font-family:var(--font-family-body)]',
  'text-[length:var(--text-label-size)]',
  'text-start',
  'cursor-pointer aria-disabled:cursor-default',
);

/**
 * The row's block padding per menu size. Only the block padding differs, so one
 * per-instance value keeps every row on one property owner; the inline padding
 * stays on the row.
 */
const MENU_ITEM_SIZE_CLASS = {
  sm: '[padding-block:var(--spacing-1)]',
  md: '[padding-block:var(--spacing-1-5)]',
  lg: '[padding-block:var(--spacing-2)]',
} as const;

/**
 * A destructive row recolors its text, icon, label and description. Its fill
 * stays the shared neutral overlay, so it hovers like every other row.
 */
const MENU_ITEM_DESTRUCTIVE_CLASS = tw(
  'text-[color:var(--color-text-error)]',
  '[--_item-label-color:var(--color-text-error)]',
  '[--_item-description-color:var(--color-text-error)]',
);

/** The row's classes, by size, variant and disabled state. */
export function dropdownMenuItemClassName({
  isDestructive,
  isDisabled,
  size,
}: {
  isDestructive: boolean;
  isDisabled: boolean;
  size: 'sm' | 'md' | 'lg';
}): string {
  return tw(
    MENU_ITEM_ROW_CLASS,
    MENU_ITEM_SIZE_CLASS[size],
    isDestructive
      ? MENU_ITEM_DESTRUCTIVE_CLASS
      : 'text-[color:var(--color-text-primary)]',
    isDisabled && 'opacity-50',
  );
}

/**
 * The bottom-sheet presentation's frame: the sheet body, the header row that
 * carries the back button, and the caller's regions inset to the list's
 * content edge. A sub-menu's own heading is the row's sibling, so the root
 * heading takes the list's content edge and the drilled one does not.
 */
export const dropdownMenuSheetClassName = {
  content: 'w-full',
  header: tw(
    'flex flex-row items-center',
    'gap-[var(--spacing-1)] [margin-bottom:var(--spacing-2)]',
  ),
  rootHeading: '[margin-inline-start:var(--spacing-3)]',
  // The heading is the panel's focus target once a sub-menu opens; the ring is
  // the panel's, not the text's.
  viewHeading: 'outline-none',
  region: tw(
    '[padding-inline:var(--spacing-3)]',
    '[padding-block:var(--spacing-2)]',
  ),
} as const;

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
