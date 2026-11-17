// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file commandPaletteFooterClasses.ts
 * @input The footer's own appearance
 * @output Utility class names for the footer row and one keyboard hint
 * @position Style primitives; scanned by the Tailwind build
 */

/** The footer row. Custom children inherit this font treatment. */
export const commandPaletteFooterClassName =
  'flex flex-wrap items-center gap-4 px-4 py-2 shrink-0 [font-family:var(--font-family-body)] text-[length:var(--text-supporting-size)] leading-[var(--text-supporting-leading)] text-[color:var(--color-text-secondary)]';

/** One hint: its keys and its label sit on one line. */
export const commandPaletteFooterHintClassName = 'flex items-center gap-1';
