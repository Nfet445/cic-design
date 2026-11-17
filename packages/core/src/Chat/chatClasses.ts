// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file chatClasses.ts
 * @input Nothing; every chat element states one appearance here
 * @output Tailwind utility class names for the tokenized text, the system
 *   message and the composer's buttons
 * @position Internal to Chat.
 */

import {tw} from '../utils/tw';

/** The send button: circular, and it keeps its width in a tight composer. */
export const chatSendButtonClassName =
  'shrink-0 rounded-[var(--_button-radius,var(--radius-full))]';

/** The tokenized text root: inline, so a token flows with the words. */
export const chatTokenizedTextClassName = 'inline';

/** One token in running text: an inline box one line tall, top-aligned. */
export const chatTokenizedTextTokenClassName = tw(
  'inline-flex items-center h-[1lh] align-top',
);

/** The pasted-text preview card: a column, capped so long text scrolls. */
export const chatPastedTextPreviewClassName = tw(
  'flex flex-col gap-2 max-w-[480px]',
);

/** The preview's text: monospaced, so the pasted indentation shows. */
export const chatPastedTextPreviewTextClassName = tw(
  '[font-family:var(--font-family-code)]',
  'text-[length:var(--text-supporting-size)] leading-[var(--text-supporting-leading)]',
  'text-[color:var(--color-text-primary)]',
  'whitespace-pre-wrap break-words max-h-[240px] overflow-y-auto',
);

/** The preview's footer: the count on one side, the Expand button on the other. */
export const chatPastedTextFooterClassName = tw(
  'flex items-center justify-between gap-2',
);

/** The pasted-text count, quieter than the preview it labels. */
export const chatPastedTextMetaClassName = tw(
  'text-[length:var(--text-supporting-size)] text-[color:var(--color-text-secondary)]',
);
