// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file navItemClasses.ts
 * @input The nav row's size
 * @output The class strings for a nav row, its selected fill, its disabled
 *   state and its size
 * @position Style primitives shared by SideNavItem, TopNavItem (drawer mode),
 *   TopNavMenu (drawer mode) and any custom nav item that matches; scanned by
 *   the Tailwind build
 *
 * Every state arm states a self-qualifier — the `aria-current="page"` the row
 * already carries, or the press attribute the touch model writes — so it
 * outranks the base row by specificity instead of by sheet order. A caller
 * composites its own box on the same row (SideNavItem's collapsed square and
 * nesting indent), and a self-qualifier does the same for it: the base row and
 * that box are both classes in `astryx-base`.
 *
 * The selected fill keys off `aria-current="page"` on the row itself, which
 * both path arms already set when the item is selected, so the state needs no
 * second attribute.
 *
 * The focus ring is not here. Compose `focusOutlineFocusVisibleClassName` at
 * the call site, on whichever element actually takes focus — in a split-action
 * row that is the link and the toggle, not the row that contains them.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 * - /packages/core/src/SideNav/SideNav.test.tsx
 */

import {tw} from '../utils/tw';

export type NavItemSize = 'sm' | 'md' | 'lg';

const ITEM_CLASSES = tw(
  'flex items-center w-full',
  'gap-[var(--spacing-2)] py-0 px-[var(--spacing-2)]',
  // A minimum, so an item grows with a larger text size and its label never
  // leaves it.
  'min-h-[var(--size-element-md)]',
  'rounded-[var(--radius-element)] border-0 border-none',
  'bg-transparent text-[color:var(--color-text-primary)] no-underline',
  'cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default',
  '[box-sizing:border-box]',
  '[font-family:inherit] [font-size:var(--text-label-size)]',
  '[font-weight:var(--font-weight-normal)]',
  '[line-height:var(--text-label-leading)] text-start',
);

/* eslint-disable @astryx/no-raw-private-attribute -- Tailwind scans class text,
   so the press attribute has to appear literally in a class name; the owner
   module cannot supply it through interpolation. */
/**
 * The selected fill. Forced colors flattens `--color-neutral` away, leaving the
 * current page unmarked; `Highlight`/`HighlightText` is the platform
 * convention, as in ToggleButton and SegmentedControlItem. No
 * `forced-color-adjust: none` here — a nav row is not a native control, so the
 * keywords land without it, and it would inherit into `endContent` and pin a
 * Badge's own fill.
 *
 * The hover arm nests its forced-colors branch: as siblings, the base row's
 * press overlay would tie on specificity and win on source order, erasing the
 * fill. The touch press model writes `data-astryx-press` instead of `:active`,
 * so the selected item repeats the fill on both attributes and paints no
 * overlay at any phase of the press.
 */
const SELECTED_CLASSES = tw(
  '[&[aria-current=page]]:bg-[color:var(--color-neutral)]',
  '[&[aria-current=page]]:forced-colors:bg-[color:Highlight]',
  '[&[aria-current=page]]:forced-colors:text-[color:HighlightText]',
  '[&[aria-current=page]]:[font-weight:var(--font-weight-medium)]',
  '[@media(hover:hover)]:[&[aria-current=page]:hover:where(:not(:disabled,[aria-disabled=true]))]:bg-[color:var(--color-neutral)]',
  '[@media(hover:hover)]:[&[aria-current=page]:hover:where(:not(:disabled,[aria-disabled=true]))]:forced-colors:bg-[color:Highlight]',
  '[&[aria-current=page]:active]:bg-[color:var(--color-neutral)]',
  '[&[aria-current=page]:active]:forced-colors:bg-[color:Highlight]',
  '[&[aria-current=page][data-astryx-press=on]]:bg-[color:var(--color-neutral)]',
  '[&[aria-current=page][data-astryx-press=on]]:forced-colors:bg-[color:Highlight]',
  '[&[aria-current=page][data-astryx-press=on]]:[background-image:none]',
  '[&[aria-current=page][data-astryx-press=fading]]:bg-[color:var(--color-neutral)]',
  '[&[aria-current=page][data-astryx-press=fading]]:forced-colors:bg-[color:Highlight]',
  '[&[aria-current=page][data-astryx-press=fading]]:[background-image:none]',
);
/* eslint-enable @astryx/no-raw-private-attribute */

/** Disabled state — muted color, no interaction. */
const DISABLED_CLASSES = tw(
  'text-[color:var(--color-text-disabled)]',
  'cursor-default pointer-events-none',
);

/* Every row carries a class attribute, so `[class]` repeats the element as the
   second specificity step: without it the sheet's own order decides between a
   size and the base row, and the `lg` row would keep the `md` height. */
const SIZE_CLASS: Record<NavItemSize, string> = {
  sm: '[&[class]]:min-h-[var(--size-element-sm)] [&[class]]:px-[var(--spacing-1)]',
  md: '[&[class]]:min-h-[var(--size-element-md)] [&[class]]:px-[var(--spacing-2)]',
  lg: '[&[class]]:min-h-[var(--size-element-lg)] [&[class]]:px-[var(--spacing-2)]',
};

/** The row: layout, type, and the borders it states rather than inherits. */
export function navItemClassName(): string {
  return ITEM_CLASSES;
}

/** The fill and weight the row shows while it is the current page. */
export function navItemSelectedClassName(): string {
  return SELECTED_CLASSES;
}

/** The muted row a disabled item keeps its tab stop in. */
export function navItemDisabledClassName(): string {
  return DISABLED_CLASSES;
}

/** The row's block height and inline padding for a size. */
export function navItemSizeClassName(size: NavItemSize): string {
  return SIZE_CLASS[size];
}
