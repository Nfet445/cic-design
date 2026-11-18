// Copyright (c) Meta Platforms, Inc. and affiliates.

/* eslint-disable @astryx/no-raw-private-attribute -- Tailwind scans class text, so the attribute has to be spelled here */

/**
 * @file ownRingClasses.ts
 * @input Reads the `--focus-outline-*` tokens
 * @output ownRingProps, which marks a control that rings itself, and
 *   ownRingRowClassName: a reorderable List row's focus-within ring, which
 *   leaves such a control alone
 * @position Owner module of the private own-ring attribute: the only file that
 *   writes its name. ListReorderHandle marks the handle and composes the row's
 *   ring, and only createReorderable's engine imports it, so a List without
 *   `reorderable` carries none of it. No package entry exports it.
 *
 * The row's shared ring is the class `focusOutlineWithinClassName`
 * (utils/focusOutlineClasses.ts), whose focus arm is `:has(:focus-visible)`,
 * `(0,2,0)`. Both arms here put one more compound inside the `:has()` — a
 * `:not()` carrying the attribute, or the attribute itself beside the pseudo
 * class — so they are `(0,3,0)` and win without repeating the selector. That is
 * why the reset arm wins as well: a plain `[outline-width:0]` would stay at
 * `(0,1,0)` and lose to the shared ring.
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from '../utils/tw';

/** Spread on a control that rings itself. */
export const ownRingProps: Readonly<Record<string, string>> = {
  'data-astryx-own-ring': '',
};

/**
 * A container that rings itself on focus within. A focused descendant marked
 * `data-astryx-own-ring` is left alone: a control that rings itself, such as
 * a List row's reorder handle. Without it the two rings stack for one tab
 * stop. An ancestor that clips its inline overflow (List) also cuts the
 * container's ring to two lines. It is its own object, so only the reorder
 * that uses it carries it.
 */
export const ownRingRowClassName = tw(
  '[&:has(:focus-visible:not([data-astryx-own-ring]))]:[outline-width:var(--focus-outline-width)]',
  '[&:has(:focus-visible:not([data-astryx-own-ring]))]:[outline-style:var(--focus-outline-style)]',
  '[&:has(:focus-visible:not([data-astryx-own-ring]))]:[outline-color:var(--focus-outline-color)]',
  '[&:has(:focus-visible:not([data-astryx-own-ring]))]:[outline-offset:var(--focus-outline-offset)]',
  '[&:has([data-astryx-own-ring]:focus-visible)]:[outline-width:0]',
  '[&:has([data-astryx-own-ring]:focus-visible)]:[outline-style:none]',
  '[&:has([data-astryx-own-ring]:focus-visible)]:[outline-offset:0]',
);

/* eslint-enable @astryx/no-raw-private-attribute */
