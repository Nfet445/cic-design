// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file chatTypingIndicatorClasses.ts
 * @input Nothing: every class is fixed
 * @output The utility class strings the hint row, its dots and its label carry
 * @position Style primitives; the Tailwind build scans it for class names
 *
 * The dots read their column width from a private variable the avatar row
 * sets, so the row's own size travels without a second class map.
 */

import {tw} from '../tw';

export const chatTypingIndicatorRootClassName = tw(
  'flex items-center',
  'gap-2',
  'min-h-5',
);

export const chatTypingIndicatorDotsClassName = tw(
  'inline-flex items-center justify-center shrink-0',
  'w-[var(--astryx-chat-typing-indicator-dots-column-width,auto)]',
  'gap-0.5',
);

/** The bounce is an `astryx*` keyframe in `tailwind/lab.input.css`. */
export const chatTypingIndicatorDotClassName = tw(
  'h-[5px] w-[5px] rounded-full',
  'bg-[color:var(--color-icon-secondary)]',
  'animate-[astryxChatTypingIndicatorBounce_var(--duration-slow)_ease-in-out_infinite]',
  'motion-reduce:animate-none',
);

export const chatTypingIndicatorSecondDotClassName = '[animation-delay:160ms]';

export const chatTypingIndicatorThirdDotClassName = '[animation-delay:320ms]';

export const chatTypingIndicatorLabelClassName = tw(
  'font-sans',
  'text-[length:var(--text-supporting-size)]',
  'text-[color:var(--color-text-secondary)]',
);
