// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file topNavClasses.ts
 * @input The slot state TopNav resolves from its own props
 * @output Tailwind utility class names for the bar, its three regions, and the
 *   mobile bar and drawer layouts
 * @position Style primitives; scanned by the Tailwind build
 *
 * The bar wraps before a region does: a region keeps its items on one line
 * until it is wider than the bar, and `min-w-fit` caps the region's own row at
 * the bar's width.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 * - /packages/core/src/TopNav/TopNav.test.tsx
 */

import {tw} from '../utils/tw';

/** The bar itself, shared by the full and the mobile layout. */
const BAR_CLASSES = 'flex flex-wrap items-center w-full p-2 box-border';

/** Mobile bar mode shows one row, so it never wraps. */
const MOBILE_BAR_CLASSES = 'flex items-center w-full p-2 box-border';

/**
 * The start region and the region after a center slot share one free-width
 * rule: each takes half of it, which keeps the center at the bar's middle.
 */
const SIDE_REGION_CLASSES =
  'flex flex-wrap items-center gap-4 [flex:1_1_0%] min-w-fit';

/** The end region with no center slot, pushed to the inline end. */
const END_REGION_CLASSES =
  'flex flex-wrap items-center justify-end gap-2 shrink-0 ms-auto min-w-fit max-w-full';

/**
 * The center claims its content's minimum width when the bar decides where to
 * wrap, then grows first, up to its content width.
 */
const CENTER_REGION_CLASSES = tw(
  'flex items-center justify-center gap-2',
  '[flex-grow:1000] shrink [flex-basis:min-content] min-w-0 max-w-max',
);

const DRAWER_ITEMS_CLASSES = 'flex flex-col gap-1';
const DRAWER_DIVIDER_CLASSES = 'my-2';

/** The nav landmark in the full layout: both slot arrangements wrap. */
export function topNavClassName(): string {
  return BAR_CLASSES;
}

/** The nav landmark in mobile bar mode. */
export function topNavMobileBarClassName(): string {
  return MOBILE_BAR_CLASSES;
}

/** The heading sits beside the start region in the full layout. */
export function topNavHeadingSlotClassName(): string {
  return 'flex items-center shrink';
}

/** The start region, which holds the heading and the start content. */
export function topNavStartRegionClassName(): string {
  return SIDE_REGION_CLASSES;
}

/** The start content, one item row beside the heading. */
export function topNavStartContentClassName(): string {
  return 'flex flex-wrap items-center gap-2';
}

/** The center region, which keeps the center content at the bar's middle. */
export function topNavCenterRegionClassName(): string {
  return CENTER_REGION_CLASSES;
}

/** The region that carries the end content when a center slot is present. */
export function topNavEndRegionClassName(): string {
  return 'flex flex-wrap items-center justify-end gap-2 [flex:1_1_0%] min-w-fit';
}

/** The end region with no center slot. */
export function topNavEndContentClassName(): string {
  return END_REGION_CLASSES;
}

/** The heading in mobile bar mode, which gives up space first. */
export function topNavMobileHeadingClassName(): string {
  return 'flex items-center [flex:0_1_auto] min-w-0';
}

/**
 * A plain-text heading has no box that can clip it, so the bar clips it to one
 * line and keeps its height.
 */
export function topNavMobileHeadingTextClassName(): string {
  return 'min-w-0 overflow-hidden text-ellipsis whitespace-nowrap';
}

/** The end content and the drawer toggle in mobile bar mode. */
export function topNavMobileEndClassName(): string {
  return 'flex items-center gap-2 shrink-0 ms-auto';
}

/** The nav items stacked in the drawer. */
export function topNavDrawerItemsClassName(): string {
  return DRAWER_ITEMS_CLASSES;
}

/** The rule between the drawer's items and any extra drawer content. */
export function topNavDrawerDividerClassName(): string {
  return DRAWER_DIVIDER_CLASSES;
}
