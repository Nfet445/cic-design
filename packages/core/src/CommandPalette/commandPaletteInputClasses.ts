// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file commandPaletteInputClasses.ts
 * @input The search input's parts
 * @output Utility class names for the wrapper, the icon box, the end slot, the
 *   delayed spinner and the field
 * @position Style primitives; scanned by the Tailwind build
 *
 * The 16px floor on the field is iOS-only: iOS Safari zooms the page when a
 * focused control sits under 16px, and only iOS WebKit implements
 * `-webkit-touch-callout` to key the coarse-pointer floor to it.
 */

/** The wrapper row: icon, field and end slot. */
export const commandPaletteInputWrapperClassName =
  'flex items-center gap-2 px-4 py-3 shrink-0';

/** The icon box. Explicit flex centering avoids the line-height offset. */
export const commandPaletteInputIconClassName =
  'flex items-center shrink-0 text-[color:var(--color-text-secondary)]';

/** The end slot: spinner and end content share one gap. */
export const commandPaletteInputEndClassName =
  'flex items-center gap-1 shrink-0';

/**
 * The spinner fades in only if the search is still pending after 150ms, so a
 * near-instant search shows nothing.
 */
export const commandPaletteInputSpinnerClassName =
  'opacity-100 transition-opacity duration-[1ms] delay-150 starting:opacity-0';

/** The field: no box of its own, and it takes the wrapper's free width. */
export const commandPaletteInputFieldClassName =
  'flex-1 min-w-0 border-0 border-none bg-transparent text-[color:var(--color-text-primary)] [font-family:var(--font-family-body)] text-[length:var(--text-body-size)] leading-[var(--text-body-leading)] p-0 placeholder:text-[color:var(--color-text-secondary)] pointer-coarse:[@supports(-webkit-touch-callout:none)]:text-[length:max(1rem,var(--text-body-size))]';
