// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file chatClasses.ts
 * @input Nothing; every chat element states one appearance here
 * @output Tailwind utility class names for the tokenized text, the system
 *   message, the message bubble and the composer's buttons
 * @position Internal to Chat.
 */

import {tw} from '../utils/tw';
import type {ChatDensity, ChatMessageSender} from './ChatContext';

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

// ---------------------------------------------------------------------------
// ChatMessageBubble
// ---------------------------------------------------------------------------

/** The per-instance custom properties a bubble's sizing classes read. */
export const chatMessageBubbleSizeVars = {
  width: '--astryx-chat-bubble-width',
} as const;

/**
 * The bubble surface. One class per property: a bubble with an explicit width
 * states its own `max-width` here instead of relying on a later class to
 * outrank the default cap, and a compact bubble states its own radius.
 */
export function chatMessageBubbleClassName({
  hasWidth,
  isCompact,
}: {
  hasWidth: boolean;
  isCompact: boolean;
}): string {
  return tw(
    'flex flex-col break-words [word-break:break-word]',
    '[font-family:var(--font-family-body)]',
    'text-[length:var(--text-body-size)] leading-[var(--text-body-leading)]',
    hasWidth ? 'max-w-none' : 'max-w-[max(80%,280px)]',
    hasWidth && 'w-[var(--astryx-chat-bubble-width)]',
    // Bubbles are intentionally rounder than cards in the same view, so they
    // use the dedicated chat radius rather than coupling to --radius-page.
    isCompact
      ? 'rounded-[var(--radius-container)]'
      : 'rounded-[var(--radius-chat)]',
  );
}

/** A ghost bubble keeps its padding for alignment and paints nothing. */
export function chatMessageBubbleSurfaceClassName({
  isGhost,
}: {
  isGhost: boolean;
}): string {
  return isGhost ? 'bg-transparent' : 'bg-[var(--color-neutral)]';
}

/** The bubble's text colour, the same in every variant. */
export const chatMessageBubbleTextClassName =
  'text-[color:var(--color-text-primary)]';

/**
 * The bubble's inset: density sets both edges, and a ghost bubble keeps the
 * inline inset so its text still lines up with a filled bubble's.
 */
export function chatMessageBubblePaddingClassName({
  density,
  isGhost,
}: {
  density: ChatDensity;
  isGhost: boolean;
}): string {
  return tw(
    density === 'spacious' ? 'px-5' : 'px-4',
    isGhost ? 'py-0' : density === 'spacious' ? 'py-4' : 'py-3',
  );
}

/**
 * Grouped bubbles tighten the corner on the sender's own side. Logical radii,
 * so the tail follows reading direction: assistant tucks toward the inline
 * start, user toward the inline end, in both directions.
 */
export const chatMessageBubbleGroupClassName: Record<
  'assistant' | 'user',
  Record<'first' | 'middle' | 'last', string>
> = {
  assistant: {
    first: 'rounded-es-xs',
    middle: 'rounded-ss-xs rounded-es-xs',
    last: 'rounded-ss-xs',
  },
  user: {
    first: 'rounded-ee-xs',
    middle: 'rounded-se-xs rounded-ee-xs',
    last: 'rounded-se-xs',
  },
};

/** The name and metadata slots: they match the bubble's inline inset. */
export function chatMessageBubbleSlotPaddingClassName(
  density: ChatDensity,
): string {
  return density === 'spacious' ? 'px-5' : 'px-4';
}

/** The name slot above a bubble: one line tall, so the avatar can line up. */
export const chatMessageBubbleNameRowClassName = tw(
  'flex items-center h-5',
  // The bubble's own block padding closes the gap under the name.
  '-mb-1.5',
);

/** The metadata slot below a bubble: its own block padding closes that gap. */
export const chatMessageBubbleMetadataRowClassName = '-mt-1.5';

/** A user message reads from the writer's edge, so its slots align there. */
export const chatMessageBubbleAlignEndClassName = 'text-end';

// ---------------------------------------------------------------------------
// ChatMessage
// ---------------------------------------------------------------------------

/**
 * The message article. The avatar's offset lives on the article as a private
 * variable, judged from this element's own `:has()`, so the sheet keeps no
 * sibling-relative selector. A message with a name row shifts the avatar by
 * that row's height.
 */
export function chatMessageClassName({
  density,
  hasAvatar,
  sender,
}: {
  density: ChatDensity;
  hasAvatar: boolean;
  sender: ChatMessageSender;
}): string {
  return tw(
    'flex items-start max-w-full',
    sender === 'system'
      ? 'flex-row justify-center'
      : sender === 'user'
        ? 'flex-row-reverse justify-start'
        : 'flex-row justify-start',
    // The gap only ever separates the avatar from the content column.
    hasAvatar &&
      (density === 'compact'
        ? 'gap-1.5'
        : density === 'spacious'
          ? 'gap-3'
          : 'gap-2'),
    '[--_chat-avatar-offset:0px]',
    '[&:has([data-chat-name])]:[--_chat-avatar-offset:var(--spacing-5)]',
  );
}

/** The avatar slot: collapses when the caller's avatar renders nothing. */
export const chatMessageAvatarWrapClassName = tw(
  'shrink-0',
  'mt-[var(--_chat-avatar-offset)]',
  '[&:empty]:hidden',
);

/** The content column: the name row, the children and the metadata slot. */
export function chatMessageContentClassName(sender: ChatMessageSender): string {
  return tw(
    'flex flex-col flex-1 min-w-0',
    sender === 'system'
      ? 'max-w-[90%] items-center'
      : sender === 'user'
        ? 'items-end'
        : 'items-start',
  );
}

/** The sender's name above the content, in supporting type. */
export const chatMessageNameClassName = tw(
  '[&:empty]:hidden',
  'text-[length:var(--text-supporting-size)] leading-[var(--text-supporting-leading)]',
  'font-semibold text-[color:var(--color-text-secondary)]',
  'mb-1',
);

/** The metadata slot collapses when the caller passes no metadata. */
export const chatMessageMetadataSlotClassName = '[&:empty]:hidden';

/** The children stack, aligned to the sender's edge and spaced by density. */
export function chatMessageChildrenClassName({
  density,
  sender,
}: {
  density: ChatDensity;
  sender: ChatMessageSender;
}): string {
  return tw(
    'flex flex-col min-w-0 w-full',
    sender === 'system'
      ? 'items-center'
      : sender === 'user'
        ? 'items-end'
        : 'items-start',
    density === 'compact'
      ? 'gap-0.5'
      : density === 'spacious'
        ? 'gap-1.5'
        : 'gap-1',
  );
}

// ---------------------------------------------------------------------------
// ChatLayout
// ---------------------------------------------------------------------------

/** The per-instance geometry a layout writes, in pixels, for a class to read. */
export const chatLayoutSizeVars = {
  dockLift: '--astryx-chat-dock-lift',
  endRoom: '--astryx-chat-end-room',
} as const;

/**
 * The layout root: a flex column, so the sticky dock's natural height is part
 * of the 100% the message area fills instead of spilling out below it once the
 * keyboard lifts it, and a container so children can query its inline size.
 */
export function chatLayoutRootClassName(isSelfScrolling: boolean): string {
  return tw(
    'relative [container-type:inline-size] min-h-0 flex-1 flex flex-col',
    isSelfScrolling && 'overflow-x-hidden overflow-y-auto',
  );
}

/**
 * The message area grows into the space the dock leaves and never shrinks
 * below its content, so long content overflows the root and scrolls. Its end
 * padding also holds whatever the dock covers: the part of the keyboard over
 * it and, when the dock is fixed, the dock's own height.
 */
export function chatLayoutMessageAreaClassName({
  density,
  hasEndRoom,
}: {
  density: ChatDensity;
  hasEndRoom: boolean;
}): string {
  return tw(
    'flex flex-col mx-auto grow shrink-0 basis-auto w-full',
    density === 'spacious' ? 'max-w-[800px] px-4' : 'max-w-full px-0',
    hasEndRoom
      ? 'pb-[calc(var(--spacing-6)+var(--astryx-chat-end-room))]'
      : 'pb-6',
  );
}

/** The placeholder for a conversation with no messages yet. */
export const chatLayoutEmptyStateClassName =
  'flex items-center justify-center flex-1 min-h-[200px]';

/**
 * The dock's box: it leaves the pointer to the dock itself, keeps the sticky
 * (or fixed) position, and lifts by the part of the keyboard that covers it.
 */
export function chatLayoutDockContainerClassName({
  isFixed,
  hasLift,
}: {
  isFixed: boolean;
  hasLift: boolean;
}): string {
  return tw(
    'inset-x-0 z-0 isolate pointer-events-none shrink-0',
    isFixed ? 'fixed' : 'sticky',
    hasLift ? 'bottom-[var(--astryx-chat-dock-lift)]' : 'bottom-0',
  );
}

/** The frosted layer: a blur that fades in over the first third of its height. */
export function chatLayoutBlurLayerClassName(density: ChatDensity): string {
  return tw(
    'absolute bottom-0 inset-x-0 pointer-events-none backdrop-blur-[12px]',
    density === 'compact'
      ? 'h-20 [mask-image:linear-gradient(to_bottom,transparent,black_24px)]'
      : density === 'spacious'
        ? 'h-[120px] [mask-image:linear-gradient(to_bottom,transparent,black_48px)]'
        : 'h-[100px] [mask-image:linear-gradient(to_bottom,transparent,black_36px)]',
  );
}

/** The composer's region: it takes the pointer back from the dock's box. */
export function chatLayoutDockClassName(density: ChatDensity): string {
  return tw(
    'relative z-[1] pointer-events-auto',
    density === 'compact'
      ? 'px-2 pb-2'
      : density === 'spacious'
        ? 'px-4 pb-3'
        : 'px-3 pb-3',
  );
}

/**
 * The dock's edge can meet the viewport's, so its ring is drawn inside it.
 * `focusOutlineStyles` lands in the same layer, and the later rule wins.
 */
export const chatLayoutDockFocusRingClassName =
  'focus-visible:[outline-offset:calc(-1*var(--focus-outline-width))]';

/** The dock's inner column: the composer's own cap, not the viewport's. */
export function chatLayoutDockInnerClassName(density: ChatDensity): string {
  return tw(
    'mx-auto w-full',
    density === 'spacious' ? 'max-w-[800px]' : 'max-w-full',
  );
}

// ---------------------------------------------------------------------------
// ChatLayoutScrollButton
// ---------------------------------------------------------------------------

/** The wrapper centres the pill and holds the gap above the composer. */
export const chatLayoutScrollButtonWrapperClassName =
  'flex justify-center pb-3';

/**
 * The pill. It clips its own content, so its height tracks the md Button it
 * wraps: a literal would clip that Button under a theme that retunes the
 * element scale. `visibility` rides the same transition as the fade, so the
 * fade-out still plays before the pill leaves the tab order.
 */
export function chatLayoutScrollButtonPillClassName({
  isVisible,
  isExpanded,
}: {
  isVisible: boolean;
  isExpanded: boolean;
}): string {
  return tw(
    '[contain:layout_style] overflow-hidden',
    'rounded-[var(--radius-full)] bg-[var(--color-background-popover)] shadow-[var(--shadow-med)]',
    'h-[var(--size-element-md)]',
    'transition-[opacity,transform,max-width,visibility] duration-[var(--duration-fast-max)] ease-[var(--ease-standard)]',
    'motion-reduce:duration-0',
    // A hidden pill paints nothing, so focus landing on it would have no
    // visible indicator (WCAG 2.2 SC 2.4.7). `visibility` also removes it from
    // sequential navigation after the fade; `inert` on the element stops new
    // focus immediately.
    isVisible
      ? 'opacity-100 pointer-events-auto visible'
      : 'opacity-0 pointer-events-none invisible',
    isExpanded ? 'max-w-[200px]' : 'max-w-[var(--size-element-md)]',
  );
}

/**
 * The inner Button: it takes the pill's own radius, and its trailing inset
 * grows when a label sits against the rounded edge.
 */
export function chatLayoutScrollButtonButtonClassName(
  hasLabel: boolean,
): string {
  return tw(
    '[--radius-element:var(--radius-full)] whitespace-nowrap px-2',
    hasLabel && 'pe-3',
  );
}
