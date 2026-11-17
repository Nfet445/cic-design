// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file commandPaletteItemClasses.ts
 * @input The item's highlight, selection and disabled state
 * @output Utility class names for the item row and its three state backgrounds
 * @position Style primitives; scanned by the Tailwind build
 *
 * The pressed background stays a StyleX input (`interactionOverlayStyles`), so
 * it is not part of this map.
 */

/** The row itself: one line, full width, no native control chrome. */
export const commandPaletteItemClassName =
  'flex items-center gap-2 w-full px-3 py-2 rounded-[var(--radius-inner)] [font-family:var(--font-family-body)] text-[length:var(--text-label-size)] text-[color:var(--color-text-primary)] bg-transparent border-0 border-none cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default text-start outline-none select-none';

/** The keyboard-highlighted row. */
export const commandPaletteItemHighlightedClassName =
  'bg-[var(--color-overlay-hover)]';

/** The selected row in picker mode. */
export const commandPaletteItemSelectedClassName =
  'bg-[var(--color-accent-muted)]';

/** The disabled row still takes part in the list, but at half strength. */
export const commandPaletteItemDisabledClassName = 'opacity-50 cursor-default';
