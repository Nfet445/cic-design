// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file blockquoteClasses.ts
 * @input Nothing; Blockquote has one appearance
 * @output Tailwind utility class names for the quote and its attribution
 * @position Internal to Blockquote.
 *
 * `border-solid` names the style once; the other three sides keep a zero
 * width, so only the inline-start rule paints.
 */

import {tw} from '../utils/tw';

/** The quote: an inline-start rule in the emphasized border, secondary text. */
export const blockquoteClassName = tw(
  'border-s-[length:var(--spacing-1)] border-solid',
  'border-s-[color:var(--color-border-emphasized)]',
  'ps-[var(--spacing-4)]',
  'text-[color:var(--color-text-secondary)]',
  '[overflow-wrap:break-word]',
  'm-0',
);

/** The attribution: a block under the quote in supporting type. */
export const blockquoteCiteClassName = tw(
  'block mt-[var(--spacing-2)]',
  'text-[length:var(--text-supporting-size)] leading-[var(--text-supporting-leading)]',
  'not-italic',
);
