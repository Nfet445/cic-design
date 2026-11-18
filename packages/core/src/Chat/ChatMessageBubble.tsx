// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatMessageBubble.tsx
 * @input Uses React, StyleX for the caller's xstyle, ChatMessageContext, the
 *   class map and an inline sizing variable
 * @output Exports ChatMessageBubble component and ChatMessageBubbleProps
 * @position Styled content container — the actual "chat bubble" with sender-aware styling
 *
 * Reads sender from parent ChatMessage context to auto-style background.
 * Optional — not all message content needs bubble treatment.
 *
 * Usage guidance:
 * - If you use bubbles on one side (e.g. assistant), use them consistently
 *   for all messages on that side. Use `ghost` variant for content that
 *   needs alignment without a visual boundary.
 * - For custom content (cards, attachments, citations) that should span
 *   the full message column instead of the default width cap, combine
 *   `ghost` with `width="100%"` (#2574).
 * - Put `name` on the first bubble in a message, `metadata` on the last.
 * - For unbubbled messages, use ChatMessage's `name` and `metadata`
 *   props instead.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Chat/index.ts (exports)
 * - /apps/storybook/stories/Chat.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/ChatMessageBubble/ (block examples)
 */

import type {ReactNode} from 'react';
import {useChatMessageContext} from './ChatContext';
import {isRenderable, mergeProps} from '../utils';
import {xstyleProps} from '../utils/xstyle';
import type {SizeValue} from '../utils/types';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';
import {tw} from '../utils/tw';
import {
  chatMessageBubbleAlignEndClassName,
  chatMessageBubbleClassName,
  chatMessageBubbleGroupClassName,
  chatMessageBubbleMetadataRowClassName,
  chatMessageBubbleNameRowClassName,
  chatMessageBubblePaddingClassName,
  chatMessageBubbleSizeVars,
  chatMessageBubbleSlotPaddingClassName,
  chatMessageBubbleSurfaceClassName,
  chatMessageBubbleTextClassName,
} from './chatClasses';

export type ChatMessageBubbleVariant = 'filled' | 'ghost';

/** The inline custom properties the bubble's sizing class reads. */
type ChatMessageBubbleStyle = React.CSSProperties &
  Partial<
    Record<
      (typeof chatMessageBubbleSizeVars)[keyof typeof chatMessageBubbleSizeVars],
      string
    >
  >;

export interface ChatMessageBubbleProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;

  /**
   * Bubble content — text, Markdown, or any ReactNode.
   */
  children: ReactNode;

  /**
   * Visual variant.
   * - 'filled': background color based on sender (default)
   * - 'ghost': no background, but keeps padding for consistent alignment
   * @default 'filled'
   */
  variant?: ChatMessageBubbleVariant;

  /**
   * Sender name rendered above the bubble, aligned with bubble text padding.
   * Non-rendering scalar values omit the aligned wrapper; numeric zero remains.
   * Use when the first content in a message is a bubble.
   * If the first content is raw (no bubble), use ChatMessage's `name`
   * prop instead.
   */
  name?: ReactNode;

  /**
   * Metadata content rendered below the bubble, aligned with bubble text padding.
   * Non-rendering scalar values omit the aligned wrapper; numeric zero remains.
   * Use when the last content in a message is a bubble.
   * If the last content is raw (no bubble), use ChatMessage's `metadata`
   * prop instead.
   */
  metadata?: ReactNode;

  /**
   * Position within a multi-bubble group.
   * Controls corner radius reduction on the sender side.
   * - 'first': bottom sender-side corner tightened
   * - 'middle': both sender-side corners tightened
   * - 'last': top sender-side corner tightened
   * Leave unset for standalone bubbles (full radius).
   */
  group?: 'first' | 'middle' | 'last';

  /**
   * Width of the bubble.
   * Numbers are treated as pixels, strings are used as-is (e.g. "100%").
   * When set, replaces the default `max(80%, 280px)` width cap; leave unset
   * to keep the cap. Combine with `variant="ghost"` to let custom content
   * (an artifact card, attachments) span the full message column.
   */
  width?: SizeValue;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Styled content container — the chat "bubble."
 *
 * Reads sender from parent ChatMessage context to auto-style background.
 * Use `group` prop for multi-bubble corner grouping.
 *
 * @example
 * ```
 * <ChatMessage sender="user">
 *   <ChatMessageBubble
 *     name="Cindy"
 *     metadata={<ChatMessageMetadata timestamp="2:30 PM" status="read" />}>
 *     Hey, how's it going?
 *   </ChatMessageBubble>
 * </ChatMessage>
 * ```
 */
export function ChatMessageBubble({
  children,
  variant = 'filled',
  name,
  metadata,
  group,
  width,
  xstyle,
  className,
  style: styleProp,
  'data-testid': testId,
  ref,
  ...rest
}: ChatMessageBubbleProps) {
  const msgContext = useChatMessageContext();
  const sender = msgContext?.sender ?? 'assistant';
  const density = msgContext?.density ?? 'balanced';

  const isUser = sender === 'user';
  const isGhost = variant === 'ghost';
  const isCompact = density === 'compact';
  const hasWidth = width != null;

  const sizingStyle: ChatMessageBubbleStyle = hasWidth
    ? {
        [chatMessageBubbleSizeVars.width]:
          typeof width === 'number' ? `${width}px` : width,
      }
    : {};

  const hasName = isRenderable(name);
  const hasMetadata = isRenderable(metadata);
  const slotClassName = tw(
    chatMessageBubbleSlotPaddingClassName(density),
    isUser && chatMessageBubbleAlignEndClassName,
  );

  return (
    <>
      {hasName && (
        <div
          data-chat-name
          className={tw(slotClassName, chatMessageBubbleNameRowClassName)}>
          {name}
        </div>
      )}
      <div
        {...rest}
        ref={ref}
        data-testid={testId}
        {...mergeProps(
          themeProps('chat-message-bubble', {sender, variant, density}),
          tw(
            chatMessageBubbleClassName({hasWidth, isCompact}),
            chatMessageBubbleTextClassName,
            chatMessageBubbleSurfaceClassName({isGhost}),
            chatMessageBubblePaddingClassName({density, isGhost}),
            group != null &&
              chatMessageBubbleGroupClassName[isUser ? 'user' : 'assistant'][
                group
              ],
            xstyleProps(xstyle).className,
          ),
          className,
          {...sizingStyle, ...styleProp},
        )}>
        {children}
      </div>
      {hasMetadata && (
        <div
          className={tw(slotClassName, chatMessageBubbleMetadataRowClassName)}>
          {metadata}
        </div>
      )}
    </>
  );
}

ChatMessageBubble.displayName = 'ChatMessageBubble';
