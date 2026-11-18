// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file topNavMenuClasses.ts
 * @input Nothing: every class name is literal
 * @output Tailwind utility class names for the overflow menu's trigger, its
 *   chevron, its rows and its drawer section
 * @position Style primitives; scanned by the Tailwind build
 *
 * The open trigger and the drawer's chevron read the `aria-expanded` the
 * trigger already publishes, so no state needs a second attribute.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 * - /packages/core/src/TopNav/TopNavMenu.test.tsx
 */

import {tw} from '../utils/tw';
import {topNavItemClassName} from './topNavItemClasses';

const HOVER_FILL_CLASSES =
  '[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:bg-[color:var(--color-overlay-hover)]';

/** The menu trigger is a nav item that also paints the open fill. */
const TRIGGER_CLASSES = tw(
  topNavItemClassName(),
  'bg-transparent border-0 border-none [font-family:inherit]',
  HOVER_FILL_CLASSES,
);

const TRIGGER_OPEN_CLASSES = tw(
  '[&[aria-expanded=true]]:text-[color:var(--color-text-primary)]',
  '[&[aria-expanded=true]]:bg-[color:var(--color-overlay-hover)]',
);

/** The registry chevron is a 1em SVG on the trigger's inherited font size. */
const CHEVRON_CLASSES = tw(
  'inline-flex items-center w-[1em] h-[1em] [font-size:inherit]',
  'transition-[transform] duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
);

// The turn is the only thing that touches `transform`, so the open class needs
// no variant: it adds a property the resting chevron never sets.
const CHEVRON_OPEN_CLASSES = '[transform:rotate(180deg)]';

const CONTAINER_CLASSES = 'select-none flex flex-col gap-1 min-w-[280px] p-1';

const ITEM_CLASSES = tw(
  'flex items-center gap-3 py-3 px-3',
  'rounded-[var(--radius-element)] no-underline',
  'cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default',
  'transition-[background-color] duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
  'bg-transparent border-0 border-none',
  HOVER_FILL_CLASSES,
);

const ITEM_ICON_CLASSES = tw(
  'flex items-center justify-center w-10 h-10 shrink-0',
  'rounded-[var(--radius-element)] bg-[color:var(--color-neutral)]',
);

const ITEM_CONTENT_CLASSES = 'flex flex-col gap-1 min-w-0';

const ITEM_TITLE_CLASSES = tw(
  '[font-size:var(--text-label-size)] [line-height:var(--text-label-leading)]',
  '[font-weight:var(--font-weight-semibold)]',
  'text-[color:var(--color-text-primary)]',
);

const ITEM_DESCRIPTION_CLASSES = tw(
  '[font-size:var(--text-supporting-size)]',
  '[line-height:var(--text-supporting-leading)]',
  '[font-weight:var(--font-weight-normal)]',
  'text-[color:var(--color-text-secondary)]',
);

const DRAWER_SECTION_CLASSES = 'flex flex-col';

const DRAWER_HEADER_CLASSES =
  'flex justify-between border-0 border-none bg-transparent';

/**
 * The section clips its items only for the 0fr collapse animation: a permanent
 * clip cuts off the focus ring, which paints outside the item. `overflow` is
 * discrete, so it rides the transition with `allow-discrete` and switches to
 * `visible` only after the open has finished. Collapsing clips again at once.
 */
const DRAWER_ITEMS_CLASSES = tw(
  'grid [grid-template-rows:0fr] overflow-hidden',
  '[transition-property:grid-template-rows,overflow]',
  '[transition-behavior:allow-discrete]',
  '[transition-duration:var(--duration-medium),0s]',
  '[transition-timing-function:var(--ease-standard)]',
  '[&[aria-hidden=false]]:[grid-template-rows:1fr]',
  '[&[aria-hidden=false]]:overflow-visible',
  '[&[aria-hidden=false]]:[transition-delay:0s,var(--duration-medium)]',
);

const DRAWER_ITEMS_INNER_CLASSES = 'min-h-0';

const DRAWER_ITEM_CLASSES = 'ps-6 no-underline';

const DRAWER_ITEM_ICON_CLASSES = 'shrink-0 w-5 h-5';

const DRAWER_ITEM_TEXT_CLASSES = 'flex flex-col gap-0.5';

const DRAWER_ITEM_DESCRIPTION_CLASSES = tw(
  '[font-size:var(--text-supporting-size)]',
  '[font-weight:var(--font-weight-normal)]',
  'text-[color:var(--color-text-secondary)]',
);

/** The trigger row: the nav item look plus the fill it gains while open. */
export function topNavMenuTriggerClassName(): string {
  return TRIGGER_CLASSES;
}

/** The trigger's open fill, keyed off the `aria-expanded` it publishes. */
export function topNavMenuTriggerOpenClassName(): string {
  return TRIGGER_OPEN_CLASSES;
}

/** The chevron turned to point back at its trigger. */
export function topNavMenuChevronOpenClassName(): string {
  return CHEVRON_OPEN_CLASSES;
}

/** The chevron box holds the glyph on the inherited em. */
export function topNavMenuChevronClassName(): string {
  return CHEVRON_CLASSES;
}

/** The float menu surface around the rows. */
export function topNavMenuContainerClassName(): string {
  return CONTAINER_CLASSES;
}

/** A menu row: icon, title and description on one line. */
export function topNavMenuItemClassName(): string {
  return ITEM_CLASSES;
}

/** The square tile that holds a row's icon. */
export function topNavMenuItemIconClassName(): string {
  return ITEM_ICON_CLASSES;
}

/** The row's text column. */
export function topNavMenuItemContentClassName(): string {
  return ITEM_CONTENT_CLASSES;
}

/** The row's title line. */
export function topNavMenuItemTitleClassName(): string {
  return ITEM_TITLE_CLASSES;
}

/** The row's description line. */
export function topNavMenuItemDescriptionClassName(): string {
  return ITEM_DESCRIPTION_CLASSES;
}

/** The drawer section that holds one collapsible menu. */
export function topNavMenuDrawerSectionClassName(): string {
  return DRAWER_SECTION_CLASSES;
}

/** The drawer header: the nav item row that toggles the section. */
export function topNavMenuDrawerHeaderClassName(): string {
  return DRAWER_HEADER_CLASSES;
}

/** The drawer's item list, which animates its own collapse. */
export function topNavMenuDrawerItemsClassName(): string {
  return DRAWER_ITEMS_CLASSES;
}

/** The clip box the collapsing rows sit in. */
export function topNavMenuDrawerItemsInnerClassName(): string {
  return DRAWER_ITEMS_INNER_CLASSES;
}

/** A drawer row, indented under its header. */
export function topNavMenuDrawerItemClassName(): string {
  return DRAWER_ITEM_CLASSES;
}

/** A drawer row's 20px icon. */
export function topNavMenuDrawerItemIconClassName(): string {
  return DRAWER_ITEM_ICON_CLASSES;
}

/** A drawer row's text column. */
export function topNavMenuDrawerItemTextClassName(): string {
  return DRAWER_ITEM_TEXT_CLASSES;
}

/** A drawer row's description line. */
export function topNavMenuDrawerItemDescriptionClassName(): string {
  return DRAWER_ITEM_DESCRIPTION_CLASSES;
}
