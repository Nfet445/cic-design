// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file commandPaletteGroupClasses.ts
 * @input The group's heading and items
 * @output Utility class names for the group column and its heading
 * @position Style primitives; scanned by the Tailwind build
 *
 * The heading style matches DropdownMenu section headings: supporting size,
 * secondary colour, no uppercase and no letter spacing.
 */

/** The group column: heading above its items. */
export const commandPaletteGroupClassName = 'flex flex-col gap-2 py-1';

/** The heading label. */
export const commandPaletteGroupHeadingClassName =
  'px-3 py-1 [font-family:var(--font-family-body)] text-[length:var(--text-supporting-size)] leading-[var(--text-supporting-leading)] text-[color:var(--color-text-secondary)] select-none';
