// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file commandPaletteEmptyClasses.ts
 * @input The empty state's own appearance
 * @output Utility class names for the palette's empty state box
 * @position Style primitives; scanned by the Tailwind build
 *
 * An unbroken token echoed into the message must wrap: `overflow-wrap:
 * anywhere` keeps it from setting the centered line's minimum width, which
 * would push text past both inline edges. Text inside keeps `anywhere` too
 * through `--_astryx-text-overflow-wrap`.
 */

/** The empty state box: centered supporting text with room to wrap. */
export const commandPaletteEmptyClassName =
  'flex items-center justify-center py-8 px-4 [font-family:var(--font-family-body)] text-[length:var(--text-supporting-size)] leading-[var(--text-supporting-leading)] text-[color:var(--color-text-secondary)] text-center [overflow-wrap:anywhere] [--_astryx-text-overflow-wrap:anywhere]';
