// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file commentComposerClasses.ts
 * @input Nothing: every class is fixed
 * @output The utility class strings the composer's quoted card carries
 * @position Style primitives; the Tailwind build scans it for class names
 */

/**
 * The quoted card keeps the composer's inner radius, not the card default. The
 * repeated attribute doubles the class's specificity, so it beats `Card`'s own
 * `rounded-[var(--radius-container)]` whatever order the two rules print in.
 */
export const commentComposerQuoteCardClassName =
  '[&[data-composer-anchor=quote][data-composer-anchor=quote]]:[border-radius:var(--radius-inner)]';
