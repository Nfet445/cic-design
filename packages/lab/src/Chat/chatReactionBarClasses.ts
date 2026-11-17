// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file chatReactionBarClasses.ts
 * @input Nothing: every class is fixed
 * @output The utility class strings the reaction row, its pills, the pill
 *   count and the add-reaction button carry
 * @position Style primitives; the Tailwind build scans it for class names
 *
 * A selected pill swaps its colour classes for the other set rather than
 * keeping both: the sheet, not the attribute, orders two rules that set one
 * property.
 */

import {tw} from '../tw';

export const chatReactionBarRootClassName = tw(
  'flex flex-wrap items-center',
  'gap-1',
);

/** Neither pill colour set is here: selection picks one of the two below. */
const pillBaseClassName = tw(
  'inline-flex items-center',
  'gap-1',
  'h-6 px-2',
  'rounded-[var(--radius-full)]',
  'border border-solid',
  'cursor-pointer',
  '[&:is(:disabled,[aria-disabled=true])]:cursor-default',
  'font-sans',
  'box-border',
  'transition-[border-color,background-color]',
  'duration-[var(--duration-fast)]',
  'ease-[var(--ease-standard)]',
  'motion-reduce:duration-0',
);

export const chatReactionBarPillClassName = tw(
  pillBaseClassName,
  'border-transparent',
  'bg-[color:var(--color-background-muted)]',
  '[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:border-[color:var(--color-border-emphasized)]',
);

/** Selected keeps the accent border on hover, so it needs no hover arm. */
export const chatReactionBarPillSelectedClassName = tw(
  pillBaseClassName,
  'border-[color:var(--color-accent)]',
  'bg-[color:var(--color-accent-muted)]',
);

export const chatReactionBarEmojiClassName = tw(
  'text-[length:var(--text-body-size)]',
  'leading-[var(--text-body-leading)]',
);

const countBaseClassName = tw(
  'text-[length:var(--text-supporting-size)]',
  'leading-[var(--text-supporting-leading)]',
  'tabular-nums',
);

export const chatReactionBarCountClassName = tw(
  countBaseClassName,
  'font-medium',
  'text-[color:var(--color-text-secondary)]',
);

export const chatReactionBarCountSelectedClassName = tw(
  countBaseClassName,
  'font-semibold',
  'text-[color:var(--color-text-accent)]',
);

export const chatReactionBarAddButtonClassName = tw(
  'inline-flex items-center justify-center',
  'w-8 h-6 p-0',
  'rounded-[var(--radius-full)]',
  'border border-solid border-transparent',
  'box-border',
  'bg-[color:var(--color-background-muted)]',
  'text-[color:var(--color-icon-secondary)]',
  'text-[15px]',
  'leading-[var(--text-supporting-leading)]',
  'cursor-pointer',
  '[&:is(:disabled,[aria-disabled=true])]:cursor-default',
  '[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:border-[color:var(--color-border-emphasized)]',
);
