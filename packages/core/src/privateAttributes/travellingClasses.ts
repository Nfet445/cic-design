// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file privateAttributes/travellingClasses.ts
 * @input The travelling mark a List row carries for the length of its slide
 * @output The classes that raise the marked row and give it the surface
 *   behind it, and that raise a swipeable row under a finger
 * @position Style primitives; scanned by the Tailwind build
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from '../utils/tw';

/**
 * A row that slides across rows moving the other way rides above them, with
 * the surface behind it, for the length of its slide. A UIKit cell passes
 * its neighbors opaque and on top, and these rows have no background of
 * their own. The surface is an inset shadow across the padding box, under
 * the press and the row's content, so the divider and the press stay
 * visible. A selected row keeps its own fill. It takes no pseudo-element,
 * since under a finger the row's `::after` is its hit layer. Its z-index, 2,
 * is above a swipeable row's raise under a finger (1), so it rides above
 * the swipeable rows it crosses.
 *
 * A row of a List with dividers takes its shadow from the press layer's
 * `overDividers`, composed later, which wins over the one here. So the
 * surface is also a custom property, which `overDividers` adds to its own
 * shadows. Every other row resets it, so a row inside a travelling row does
 * not inherit it.
 */
export const travellingRowClassName = tw(
  /* eslint-disable @astryx/no-raw-private-attribute -- Tailwind scans class text, so the attribute has to be spelled here */
  '[&[data-astryx-travelling]]:z-[2]',
  '[&[data-astryx-travelling]:not([aria-selected=true],[aria-current=true])]:[box-shadow:inset_0_0_0_100vmax_var(--color-background-surface)]',
  '[&[data-astryx-travelling]:not([aria-selected=true],[aria-current=true])]:[--_travelling-surface:inset_0_0_0_100vmax_var(--color-background-surface)]',
  '[&:not([data-astryx-travelling]:not([aria-selected=true],[aria-current=true]))]:[--_travelling-surface:initial]',
  /* eslint-enable @astryx/no-raw-private-attribute */
);

/**
 * A swipeable row is a stacking context at rest, since Item translates its
 * swipe root. So its band's own z-index orders only inside it. Under a
 * finger the row itself rises above the rows after it, whose boxes its band
 * reaches into. The list isolates, so the row stays below a sticky header.
 * Compose it after `travellingRowClassName`, which carries the travelling
 * raise.
 */
export const travellingRaisedSwipeRowClassName = tw(
  'pointer-coarse:z-[1]',
  /* eslint-disable @astryx/no-raw-private-attribute -- Tailwind scans class text, so the attribute has to be spelled here */
  'pointer-coarse:[&[data-astryx-travelling]]:z-[2]',
  /* eslint-enable @astryx/no-raw-private-attribute */
);
