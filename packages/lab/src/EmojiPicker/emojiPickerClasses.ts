// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file emojiPickerClasses.ts
 * @input Nothing: every class is fixed
 * @output The utility class strings the emoji panel's group heading, its grid
 *   rows and cells, and its preview line carry
 * @position Style primitives; the Tailwind build scans it for class names
 *
 * The cell paints no base background: it only names the hover paint inside a
 * `hover: hover` guard, so one class carries the hover arm alone.
 */

import {tw} from '../tw';

/** A group heading pinned above its emojis while the list scrolls. */
export const emojiPickerCategoryLabelClassName = tw(
  'sticky top-0 z-[1]',
  'bg-[color:var(--color-background-popover)]',
);

/** `grid-cols-8` mirrors the picker's COLUMNS: a row holds that many cells. */
export const emojiPickerRowClassName = tw(
  'grid grid-cols-8',
  '[column-gap:var(--spacing-0-5)]',
);

export const emojiPickerGridCellClassName = tw('flex min-w-0');

export const emojiPickerCellClassName = tw(
  'inline-flex items-center justify-center',
  'w-full aspect-square p-0 border-0',
  'rounded-[var(--radius-inner)]',
  'text-[length:var(--text-large-size)] leading-none',
  'cursor-pointer',
  '[&:is(:disabled,[aria-disabled=true])]:cursor-default',
  '[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:bg-[color:var(--color-overlay-hover)]',
  'transition-[background-color]',
  'duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
  'motion-reduce:duration-0',
  // Inset, not the shared offset: the cells sit edge to edge, so an outset
  // ring would overlap its neighbors.
  'outline-offset-0 focus-visible:outline-offset-[-2px]',
);

export const emojiPickerPreviewClassName = tw('min-h-[var(--spacing-8)]');

export const emojiPickerPreviewEmojiClassName = tw(
  'text-[length:var(--text-large-size)] leading-none',
);
