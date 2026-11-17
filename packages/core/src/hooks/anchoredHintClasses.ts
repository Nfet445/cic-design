// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file anchoredHintClasses.ts
 * @input Nothing; the hint's two rows have one look
 * @output The classes for the hint's key row and its label
 * @position Internal to hooks/anchoredHint.tsx; the Tailwind build scans it
 *   for class names
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

/** The row of key glyphs: they sit in a line, one gap apart. */
export const anchoredHintKeysClassName =
  'inline-flex items-center gap-[var(--spacing-1)]';

/** The label after the key row. */
export const anchoredHintLabelClassName = 'ms-[var(--spacing-1)]';
