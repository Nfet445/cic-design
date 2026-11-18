// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file chatEmojiPickerClasses.ts
 * @input Nothing: every class is fixed
 * @output The utility class strings the emoji picker's panel, its grid, its
 *   cells and its no-match line carry
 * @position Style primitives; the Tailwind build scans it for class names
 *
 * The cell paints no base background: it only names the hover paint inside a
 * `hover: hover` guard, so one class carries the hover arm alone.
 */

import {tw} from '../tw';

/** Eight 34px cells plus 8px of slack. */
export const chatEmojiPickerPanelClassName = tw(
  'flex flex-col gap-2 box-border',
  'w-[280px]',
);

export const chatEmojiPickerGridClassName = tw('grid grid-cols-8 gap-1');

export const chatEmojiPickerCellClassName = tw(
  'inline-flex items-center justify-center',
  'size-8 rounded-[var(--radius-inner)] border-0 p-0',
  'text-[length:18px] leading-[var(--text-body-leading)]',
  'cursor-pointer',
  '[&:is(:disabled,[aria-disabled=true])]:cursor-default',
  '[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:bg-[color:var(--color-overlay-hover)]',
  'transition-[background-color]',
  'duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
  'motion-reduce:duration-0',
  // Inset, not the shared offset: the cells sit in a tight 8-across grid, so
  // an outset ring would overlap its neighbors.
  'outline-offset-0 focus-visible:outline-offset-[-2px]',
);

export const chatEmojiPickerEmptyClassName = tw(
  'py-2 px-1',
  'font-sans text-[length:var(--text-supporting-size)]',
  'text-[color:var(--color-text-secondary)]',
);
