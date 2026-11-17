// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file commandPaletteListClasses.ts
 * @input The list's own appearance
 * @output Utility class names for the scrollable results container
 * @position Style primitives; scanned by the Tailwind build
 */

/** The results container: it scrolls, and takes the palette's free height. */
export const commandPaletteListClassName =
  'overflow-y-auto max-h-full p-1 flex flex-1 flex-col gap-2';
