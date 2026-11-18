// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file anchoredHintClasses.ts
 * @input Nothing; the hint and its two rows have one look
 * @output The classes for the hint's surface, its key row and its label
 * @position Internal to hooks/anchoredHint.tsx; the Tailwind build scans it
 *   for class names
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from '../utils/tw';

/**
 * The hint's surface in the top layer. `opacity` fades it in as the popover
 * opens; `display` and `overlay` are in the transition list so the fade out
 * survives the element leaving the top layer.
 */
export const anchoredHintClassName = tw(
  'fixed inset-auto m-0 border-0 border-none',
  'bg-[var(--color-background-popover)]',
  'rounded-[var(--radius-element)] shadow-[var(--shadow-low)]',
  'py-[var(--spacing-1)] px-[var(--spacing-2)]',
  'text-[length:var(--text-supporting-size)]',
  'leading-[var(--text-supporting-leading)]',
  'text-[color:var(--color-text-secondary)]',
  'whitespace-nowrap',
  'opacity-0 [&:popover-open]:opacity-100',
  '[transition-property:opacity,display,overlay]',
  '[transition-duration:150ms]',
  '[transition-behavior:allow-discrete]',
);

/** A hint that only teaches floats above the content without taking its
 * pointer events. */
export const anchoredHintPassiveClassName = 'pointer-events-none';

/** The row of key glyphs: they sit in a line, one gap apart. */
export const anchoredHintKeysClassName =
  'inline-flex items-center gap-[var(--spacing-1)]';

/** The label after the key row. */
export const anchoredHintLabelClassName = 'ms-[var(--spacing-1)]';
