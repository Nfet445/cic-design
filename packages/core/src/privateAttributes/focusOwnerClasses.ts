// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file privateAttributes/focusOwnerClasses.ts
 * @input The focus ring tokens
 * @output focusOwnerRingClassName, the ring a wrapper draws only while its
 *   marked primary control has keyboard focus, and
 *   focusOwnerOverlayRingClassName, the same ring drawn above the wrapper's
 *   content
 * @position Style primitives; scanned by the Tailwind build
 */

import {tw} from '../utils/tw';

/**
 * Compose on the wrapper of a control marked with `focusOwnerProps`.
 *
 * The ring is for the wrapper's own marked control: a direct child, or a
 * child of a cell marked with `focusOwnerGroupProps`. Every other control
 * rings itself, and a nested component's owner never rings this wrapper.
 * Written as longhands, like `focusOutlineStyles`, so a base style cannot
 * erase them through `outline`. The rest state keeps the browser's own ring
 * off, because the wrapper is not the control that has focus.
 */
export const focusOwnerRingClassName = tw(
  /* eslint-disable @astryx/no-raw-private-attribute -- Tailwind scans class text, so the attribute has to be spelled here */
  '[outline-width:0]',
  '[outline-style:none]',
  '[outline-offset:0]',
  'has-[>_[data-astryx-focus-owner]:focus-visible]:[outline-width:var(--focus-outline-width)]',
  'has-[>_[data-astryx-focus-owner]:focus-visible]:[outline-style:var(--focus-outline-style)]',
  'has-[>_[data-astryx-focus-owner]:focus-visible]:[outline-color:var(--focus-outline-color)]',
  'has-[>_[data-astryx-focus-owner]:focus-visible]:[outline-offset:var(--focus-outline-offset)]',
  '[&:has(>_[data-astryx-focus-owner=group]_>_[data-astryx-focus-owner]:focus-visible)]:[outline-width:var(--focus-outline-width)]',
  '[&:has(>_[data-astryx-focus-owner=group]_>_[data-astryx-focus-owner]:focus-visible)]:[outline-style:var(--focus-outline-style)]',
  '[&:has(>_[data-astryx-focus-owner=group]_>_[data-astryx-focus-owner]:focus-visible)]:[outline-color:var(--focus-outline-color)]',
  '[&:has(>_[data-astryx-focus-owner=group]_>_[data-astryx-focus-owner]:focus-visible)]:[outline-offset:var(--focus-outline-offset)]',
  /* eslint-enable @astryx/no-raw-private-attribute */
);

/**
 * Compose on a wrapper whose marked control paints over a ring drawn on the
 * wrapper itself: a scroller with an edge-fade mask is its own stacking
 * context. The wrapper must be positioned and must not use `::after`.
 *
 * The overlay is inset by the ring's width, so the ring lands inside the
 * wrapper's box. Its rest state draws nothing.
 */
export const focusOwnerOverlayRingClassName = tw(
  /* eslint-disable @astryx/no-raw-private-attribute -- Tailwind scans class text, so the attribute has to be spelled here */
  'after:absolute after:inset-0 after:pointer-events-none after:rounded-[inherit] after:[outline-style:none]',
  'has-[>_[data-astryx-focus-owner]:focus-visible]:after:[outline-width:var(--focus-outline-width)]',
  'has-[>_[data-astryx-focus-owner]:focus-visible]:after:[outline-style:var(--focus-outline-style)]',
  'has-[>_[data-astryx-focus-owner]:focus-visible]:after:[outline-color:var(--focus-outline-color)]',
  'has-[>_[data-astryx-focus-owner]:focus-visible]:after:[outline-offset:calc(-1*var(--focus-outline-width))]',
  /* eslint-enable @astryx/no-raw-private-attribute */
);
