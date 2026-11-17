// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file topNavItemClasses.ts
 * @input Whether the horizontal item is selected or icon-only
 * @output Tailwind utility class names for the horizontal top-nav item, its
 *   selected fill and its icon-only padding
 * @position Style primitives; scanned by the Tailwind build
 *
 * The selected fill keys off `aria-current="page"`, which the item already sets
 * when it is selected, so the state needs no second attribute.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 * - /packages/core/src/TopNav/TopNav.test.tsx
 */

import {tw} from '../utils/tw';

const ITEM_CLASSES = tw(
  'inline-flex items-center gap-2 py-1.5 px-3',
  'rounded-[var(--radius-element)] no-underline',
  '[font-size:var(--text-label-size)] [line-height:var(--text-label-leading)]',
  '[font-weight:var(--font-weight-medium)]',
  'text-[color:var(--color-text-secondary)]',
  'cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default',
  'transition-[background-color,color]',
  'duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
);

/* eslint-disable @astryx/no-raw-private-attribute -- Tailwind scans class text,
   so the press attribute has to appear literally in a class name; the owner
   module cannot supply it through interpolation. */
/**
 * The selected fill. The touch press model writes `data-astryx-press` instead
 * of `:active`, so the selected item repeats the fill on both attributes and
 * paints no overlay at any phase of the press.
 */
const SELECTED_CLASSES = tw(
  '[&[aria-current=page]]:text-[color:var(--color-text-primary)]',
  '[&[aria-current=page]]:[font-weight:var(--font-weight-semibold)]',
  '[&[aria-current=page]]:bg-[color:var(--color-neutral)]',
  '[@media(hover:hover)]:[&[aria-current=page]:hover:where(:not(:disabled,[aria-disabled=true]))]:bg-[color:var(--color-neutral)]',
  '[&[aria-current=page]:active]:bg-[color:var(--color-neutral)]',
  '[&[aria-current=page][data-astryx-press=on]]:bg-[color:var(--color-neutral)]',
  '[&[aria-current=page][data-astryx-press=fading]]:bg-[color:var(--color-neutral)]',
  '[&[aria-current=page][data-astryx-press=on]]:[background-image:none]',
  '[&[aria-current=page][data-astryx-press=fading]]:[background-image:none]',
);
/* eslint-enable @astryx/no-raw-private-attribute */

const ICON_ONLY_CLASSES = 'px-2';

/** The horizontal item: one row, with the label's own type step. */
export function topNavItemClassName(): string {
  return ITEM_CLASSES;
}

/** The fill and weight the item shows while it is the current page. */
export function topNavItemSelectedClassName(): string {
  return SELECTED_CLASSES;
}

/** An icon-only item squares off its block padding with a smaller inline one. */
export function topNavItemIconOnlyClassName(): string {
  return ICON_ONLY_CLASSES;
}
