// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file navHeadingMenuClasses.ts
 * @input The theme's spacing, radius, type-scale and colour variables, and the
 *   row's size and disabled state
 * @output The utility class strings the nav heading popover, its rows and the
 *   row's content box carry
 * @position Style primitives; the Tailwind build scans it for class names
 */

import {tw} from '../utils/tw';

/** A per-instance minimum width; each size class states its own fallback. */
export const navHeadingMenuMinWidthVar =
  '--astryx-nav-heading-menu-min-inline-size';

/**
 * The popover: its rows stack in the menu's column. The minimum width reads
 * the per-instance variable, so the `minWidth` prop keeps one property owner.
 */
export const navHeadingMenuClassName = 'flex flex-col gap-[var(--spacing-0-5)]';

export const navHeadingMenuMinWidthClassName: Record<
  'sm' | 'md' | 'lg',
  string
> = {
  sm: 'min-w-[var(--astryx-nav-heading-menu-min-inline-size,160px)]',
  md: 'min-w-[var(--astryx-nav-heading-menu-min-inline-size,200px)]',
  lg: 'min-w-[var(--astryx-nav-heading-menu-min-inline-size,240px)]',
};

/**
 * A row's block and inline padding per menu size. Every size states both
 * longhands, so no size class shares a property with the row.
 */
const ROW_SIZE_CLASS: Record<'sm' | 'md' | 'lg', string> = {
  sm: tw('[padding-block:var(--spacing-1)]', 'px-2'),
  md: tw('[padding-block:var(--spacing-2)]', 'px-2'),
  lg: tw('[padding-block:var(--spacing-3)]', 'px-3'),
};

const ROW_HOVER_FILL_CLASS =
  '[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:bg-[color:var(--color-overlay-hover)]';

/**
 * A row that takes the menu's width: borderless, on the element radius, with
 * its pointer fill on focus and under a mouse. A held pointer selects no row
 * text: a press slides across the rows.
 */
export function navHeadingMenuItemClassName({
  isDisabled,
  size,
}: {
  isDisabled: boolean;
  size: 'sm' | 'md' | 'lg';
}): string {
  return tw(
    'box-border flex items-center gap-2 w-full',
    'rounded-[var(--radius-element)] bg-transparent',
    '[font-family:var(--font-family-body)]',
    'text-[length:var(--text-label-size)]',
    'text-[color:var(--color-text-primary)]',
    '[border-width:0] [border-style:none] outline-none no-underline text-start',
    'cursor-pointer aria-disabled:cursor-default',
    'select-none',
    'focus:bg-[color:var(--color-overlay-hover)]',
    ROW_HOVER_FILL_CLASS,
    ROW_SIZE_CLASS[size],
    isDisabled && 'opacity-50',
  );
}

/** The row's text track: the label above its description, free to shrink. */
export const navHeadingMenuItemContentClassName =
  'flex flex-col flex-1 min-w-0';
