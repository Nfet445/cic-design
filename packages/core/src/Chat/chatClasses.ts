// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file chatClasses.ts
 * @input Nothing; every chat element states one appearance here
 * @output Tailwind utility class names for the tokenized text, the system
 *   message and the composer's buttons
 * @position Internal to Chat.
 */

import {tw} from '../utils/tw';

/** The tokenized text root: inline, so a token flows with the words. */
export const chatTokenizedTextClassName = 'inline';

/** One token in running text: an inline box one line tall, top-aligned. */
export const chatTokenizedTextTokenClassName = tw(
  'inline-flex items-center h-[1lh] align-top',
);
