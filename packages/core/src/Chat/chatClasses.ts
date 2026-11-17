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

/** A system notice: centered muted supporting text, one line of padding. */
export const chatSystemMessageClassName = tw(
  'flex items-center justify-center gap-2 py-1',
  '[font-family:var(--font-family-body)]',
  'text-[length:var(--text-supporting-size)] font-normal',
  'text-[color:var(--color-text-secondary)] text-center',
);

/** The divider variant's wrapper: the Divider spans the whole row. */
export const chatSystemMessageDividerClassName = 'w-full';

/** The notice's icon slot: it never shrinks away from the text. */
export const chatSystemMessageIconClassName =
  'inline-flex items-center shrink-0';

/** The notice's text row: the icon and the words sit six pixels apart. */
export const chatSystemMessageContentClassName =
  'inline-flex items-center gap-1.5';

/** The metadata row under a message: supporting text, one step below it. */
export const chatMessageMetadataClassName = tw(
  'flex items-center gap-1 mt-1',
  'text-[length:var(--text-supporting-size)] font-normal',
  'leading-[var(--text-supporting-leading)]',
  'text-[color:var(--color-text-secondary)]',
);

/** A user message reads from the writer's edge, so its row reverses. */
export const chatMessageMetadataUserClassName = 'flex-row-reverse';

/** An assistant message keeps the row in reading order. */
export const chatMessageMetadataAssistantClassName = 'flex-row';

/** The delivery status: an icon and its word, four pixels apart. */
export const chatMessageMetadataStatusRowClassName =
  'inline-flex items-center gap-1';

/** A failed delivery takes the error colour. */
export const chatMessageMetadataStatusErrorClassName =
  'text-[color:var(--color-text-error)]';

/**
 * A message in flight breathes; the motion arm yields to a reader who asked
 * for less movement.
 */
export const chatMessageMetadataStatusPulseClassName = tw(
  'animate-[astryxChatStatusPulse_1.5s_ease-in-out_infinite]',
  'motion-reduce:animate-none',
);
