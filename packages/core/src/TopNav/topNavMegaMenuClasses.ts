// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file topNavMegaMenuClasses.ts
 * @input Nothing: every class name is literal
 * @output Tailwind utility class names for the mega menu's trigger, chevron,
 *   panel, item grid, featured column and drawer section
 * @position Style primitives; scanned by the Tailwind build
 *
 * The panel's entrance and the drawer's collapse are keyed off the
 * `:popover-open` state the platform sets and the `aria-expanded` and
 * `aria-hidden` the menu already publishes, so no state needs a second
 * attribute.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 * - /packages/core/src/TopNav/TopNavMegaMenu.test.tsx
 * - /packages/core/src/TopNav/TopNavMegaMenu.reduced-motion.source-build.test.mjs
 */

import {tw} from '../utils/tw';
import {topNavItemClassName} from './topNavItemClasses';

const HOVER_FILL_CLASSES =
  '[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:bg-[color:var(--color-overlay-hover)]';

/** The mega-menu trigger is a nav item that also paints the open fill. */
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

/*
 * The panel's entrance. A user who asks for reduced motion never sees it rise:
 * on a touch screen it cross-fades in 200 ms whatever the theme's duration,
 * and with a mouse it opens and closes at once. The travel is declared under
 * `motion-safe` alone, so a reduced-motion environment resolves no transform.
 *
 * `display` is discrete, so it rides the transition with `allow-discrete`, and
 * `@starting-style` gives the fade its first frame: the opening element is
 * already `:popover-open`, so the arm repeats that state to outrank the
 * resting rule it has to replace.
 */
const PANEL_ANIMATION_CLASSES = tw(
  'opacity-0 [&:popover-open]:opacity-100',
  'motion-safe:[transform:translateY(-4px)]',
  'motion-safe:[&:popover-open]:[transform:translateY(0)]',
  'motion-safe:[transition-property:opacity,transform,overlay,display]',
  'motion-safe:[transition-duration:var(--duration-medium-min)]',
  'motion-safe:[transition-timing-function:var(--ease-standard)]',
  '[transition-behavior:allow-discrete]',
  'motion-reduce:[transition-property:opacity,overlay,display]',
  'motion-reduce:pointer-coarse:[transition-duration:200ms]',
  'motion-reduce:pointer-coarse:[transition-timing-function:cubic-bezier(0.42,0,0.58,1)]',
  'motion-reduce:pointer-fine:[transition-duration:0s]',
  '[@starting-style]:[&:popover-open]:opacity-0',
  'motion-safe:[@starting-style]:[&:popover-open]:[transform:translateY(-4px)]',
);

/** The layer is a height-clamped column, so the panel can shrink and scroll. */
const PANEL_VIEWPORT_FIT_CLASSES = tw(
  'hidden [&:popover-open]:flex flex-col',
  '[max-height:calc(100%_-_var(--spacing-3))]',
);

const PANEL_CLASSES = tw(
  'bg-[color:var(--color-background-popover)]',
  '[border-top:1px_solid_var(--color-border)]',
  'rounded-[var(--radius-container)] [box-shadow:var(--shadow-low)]',
  'overflow-hidden flex flex-col min-h-0',
);

const PANEL_CONTENT_CLASSES = tw(
  'flex flex-wrap gap-6 p-3',
  '[max-width:min(960px,calc(100dvw_-_var(--spacing-4)))]',
  'box-border overflow-y-auto overscroll-contain',
);

/** The item grid gives way to the featured column as the panel narrows. */
const ITEMS_CLASSES = 'grow-[2] shrink basis-[300px] min-w-0';

const FEATURED_CLASSES = tw(
  'grow shrink basis-[200px]',
  'rounded-[var(--radius-container)] bg-[color:var(--color-background-muted)]',
  'overflow-hidden flex flex-col',
);

const DRAWER_SECTION_CLASSES = 'flex flex-col';

/** Header override over the shared nav row: the chevron sits at the far end. */
const DRAWER_HEADER_CLASSES =
  'justify-between border-0 border-none bg-transparent';

const DRAWER_CHEVRON_CLASSES = CHEVRON_CLASSES;

const DRAWER_CHEVRON_EXPANDED_CLASSES = CHEVRON_OPEN_CLASSES;

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

const DRAWER_FEATURED_CLASSES = tw(
  'mt-2 ms-6 rounded-[var(--radius-container)]',
  'bg-[color:var(--color-background-muted)] overflow-hidden',
);

/** The trigger row: the nav item look plus the fill it gains while open. */
export function topNavMegaMenuTriggerClassName(): string {
  return TRIGGER_CLASSES;
}

/** The trigger's open fill, keyed off the `aria-expanded` it publishes. */
export function topNavMegaMenuTriggerOpenClassName(): string {
  return TRIGGER_OPEN_CLASSES;
}

/** The chevron box holds the glyph on the inherited em. */
export function topNavMegaMenuChevronClassName(): string {
  return CHEVRON_CLASSES;
}

/** The chevron turned to point back at its trigger. */
export function topNavMegaMenuChevronOpenClassName(): string {
  return CHEVRON_OPEN_CLASSES;
}

/** The panel's fade, travel and discrete `display` on the layer's element. */
export function topNavMegaMenuPanelAnimationClassName(): string {
  return PANEL_ANIMATION_CLASSES;
}

/** The clamped column that bounds the panel to the space below the nav. */
export function topNavMegaMenuPanelViewportFitClassName(): string {
  return PANEL_VIEWPORT_FIT_CLASSES;
}

/** The panel surface that carries the border, radius and shadow. */
export function topNavMegaMenuPanelClassName(): string {
  return PANEL_CLASSES;
}

/** The scrolling row of the item grid and the featured column. */
export function topNavMegaMenuPanelContentClassName(): string {
  return PANEL_CONTENT_CLASSES;
}

/** The item grid's share of the panel row. */
export function topNavMegaMenuItemsClassName(): string {
  return ITEMS_CLASSES;
}

/** The featured column's share of the panel row. */
export function topNavMegaMenuFeaturedClassName(): string {
  return FEATURED_CLASSES;
}

/** The drawer section that holds one collapsible mega menu. */
export function topNavMegaMenuDrawerSectionClassName(): string {
  return DRAWER_SECTION_CLASSES;
}

/** The drawer header: the nav row that toggles the section. */
export function topNavMegaMenuDrawerHeaderClassName(): string {
  return DRAWER_HEADER_CLASSES;
}

/** The drawer header's chevron box. */
export function topNavMegaMenuDrawerChevronClassName(): string {
  return DRAWER_CHEVRON_CLASSES;
}

/** The drawer header's chevron turned while the section is open. */
export function topNavMegaMenuDrawerChevronExpandedClassName(): string {
  return DRAWER_CHEVRON_EXPANDED_CLASSES;
}

/** The drawer's item list, which animates its own collapse. */
export function topNavMegaMenuDrawerItemsClassName(): string {
  return DRAWER_ITEMS_CLASSES;
}

/** The clip box the collapsing rows sit in. */
export function topNavMegaMenuDrawerItemsInnerClassName(): string {
  return DRAWER_ITEMS_INNER_CLASSES;
}

/** The featured card below the drawer's items. */
export function topNavMegaMenuDrawerFeaturedClassName(): string {
  return DRAWER_FEATURED_CLASSES;
}
