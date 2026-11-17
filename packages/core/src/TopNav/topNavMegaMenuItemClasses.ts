// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file topNavMegaMenuItemClasses.ts
 * @input Nothing: every class name is literal
 * @output Tailwind utility class names for a mega menu item, in the panel and
 *   in the drawer
 * @position Style primitives; scanned by the Tailwind build
 *
 * The drawer item sits on the shared nav row (`navItemStyles.item`), so its
 * classes carry only the padding and alignment that row does not.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from '../utils/tw';

const DESKTOP_CLASSES = tw(
  'flex items-start gap-3 p-3 rounded-[var(--radius-element)] no-underline',
  'cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default',
  'transition-[background-color] duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
  // A `button` paint differs from a `div` in each of these ways.
  'border-0 border-none w-full box-border text-start',
  'text-[color:inherit] [font-family:inherit]',
);

const DESKTOP_ICON_CLASSES = tw(
  'flex items-center justify-center w-10 h-10 shrink-0',
  'rounded-[var(--radius-element)]',
  'bg-[color:var(--color-neutral)] text-[color:var(--color-icon-secondary)]',
);

const DESKTOP_CONTENT_CLASSES = 'flex flex-col gap-1 min-w-0';

const DESKTOP_TITLE_CLASSES =
  'font-semibold [font-size:var(--font-size-label)] [line-height:var(--line-height-label)] text-[color:var(--color-text-primary)]';

const DESKTOP_DESCRIPTION_CLASSES =
  'font-normal [font-size:var(--font-size-supporting)] [line-height:var(--line-height-supporting)] text-[color:var(--color-text-secondary)]';

const DRAWER_ITEM_CLASSES = 'ps-6 items-start no-underline';

const DRAWER_ITEM_ICON_CLASSES = tw(
  'flex items-center justify-center w-8 h-8 shrink-0 mt-0.5',
  'rounded-[var(--radius-element)]',
  'bg-[color:var(--color-neutral)] text-[color:var(--color-icon-secondary)]',
);

const DRAWER_ITEM_CONTENT_CLASSES = 'flex flex-col gap-0.5 min-w-0';

const DRAWER_ITEM_DESCRIPTION_CLASSES =
  'font-normal [font-size:var(--font-size-supporting)] [line-height:var(--line-height-supporting)] text-[color:var(--color-text-secondary)]';

/** The item row in the desktop panel. */
export function topNavMegaMenuItemClassName(): string {
  return DESKTOP_CLASSES;
}

/** The square that holds the item's icon in the panel. */
export function topNavMegaMenuItemIconClassName(): string {
  return DESKTOP_ICON_CLASSES;
}

/** The title and description column of a panel item. */
export function topNavMegaMenuItemContentClassName(): string {
  return DESKTOP_CONTENT_CLASSES;
}

/** The panel item's title. */
export function topNavMegaMenuItemTitleClassName(): string {
  return DESKTOP_TITLE_CLASSES;
}

/** The panel item's description. */
export function topNavMegaMenuItemDescriptionClassName(): string {
  return DESKTOP_DESCRIPTION_CLASSES;
}

/** The item row in the drawer's expanded section. */
export function topNavMegaMenuItemDrawerClassName(): string {
  return DRAWER_ITEM_CLASSES;
}

/** The square that holds the item's icon in the drawer, sized to its row. */
export function topNavMegaMenuItemDrawerIconClassName(): string {
  return DRAWER_ITEM_ICON_CLASSES;
}

/** The title and description column of a drawer item. */
export function topNavMegaMenuItemDrawerContentClassName(): string {
  return DRAWER_ITEM_CONTENT_CLASSES;
}

/** The drawer item's description. */
export function topNavMegaMenuItemDrawerDescriptionClassName(): string {
  return DRAWER_ITEM_DESCRIPTION_CLASSES;
}
