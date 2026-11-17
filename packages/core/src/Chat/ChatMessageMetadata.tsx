// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatMessageMetadata.tsx
 * @input Uses React, StyleX for the caller's xstyle, ChatContext, Icon, the
 *   class map, and isRenderable
 * @output Exports ChatMessageMetadata component
 * @position Shared metadata row used by composing inside ChatMessage
 *
 * Renders timestamp, footer, and status values with separators determined by
 * scalar presence. Direction reverses for user sender.
 */

import React, {type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {useChatMessageContext} from './ChatContext';
import {Icon} from '../Icon';
import type {IconName} from '../Icon/globalIconRegistry';
import {isRenderable, mergeProps} from '../utils';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';
import {tw} from '../utils/tw';
import {
  chatMessageMetadataAssistantClassName,
  chatMessageMetadataClassName,
  chatMessageMetadataStatusErrorClassName,
  chatMessageMetadataStatusPulseClassName,
  chatMessageMetadataStatusRowClassName,
  chatMessageMetadataUserClassName,
} from './chatClasses';
import {
  registerEnglishFallback,
  useComponentTranslator,
} from '../i18n/useComponentTranslator';
import english from '../i18n/generated-english/Chat/ChatMessageMetadata.generated';

registerEnglishFallback(english);

export type ChatMessageStatus =
  'sending' | 'sent' | 'delivered' | 'read' | 'error';

const STATUS_CONFIG: Record<
  ChatMessageStatus,
  {icon: IconName; i18nKey: string}
> = {
  sending: {icon: 'clock', i18nKey: '@astryx.chat.status.sending'},
  sent: {icon: 'check', i18nKey: '@astryx.chat.status.sent'},
  delivered: {icon: 'checkDouble', i18nKey: '@astryx.chat.status.delivered'},
  read: {icon: 'checkDouble', i18nKey: '@astryx.chat.status.read'},
  error: {icon: 'error', i18nKey: '@astryx.chat.status.failed'},
};

export interface ChatMessageMetadataProps extends BaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  /** Timestamp content — ReactNode (e.g. Timestamp) or string. */
  timestamp?: ReactNode;
  /** Footer content — model info, ratings, reactions. */
  footer?: ReactNode;
  /** Message delivery status. */
  status?: ChatMessageStatus;
}

/**
 * Composable metadata row for chat messages.
 *
 * Renders: timestamp · footer · status
 * Renders nothing when neither slot passes the scalar-presence check and no
 * status is set. Composite React nodes remain caller-owned.
 *
 * @example
 * ```
 * <ChatMessage sender="user">
 *   <ChatMessageBubble>Hello!</ChatMessageBubble>
 *   <ChatMessageMetadata timestamp={<Timestamp value="..." format="time" />} status="read" />
 * </ChatMessage>
 * ```
 */
export function ChatMessageMetadata({
  ref,
  timestamp,
  footer,
  status,
  xstyle,
  className,
  style,
  ...rest
}: ChatMessageMetadataProps) {
  const t = useComponentTranslator();
  const msgContext = useChatMessageContext();
  const sender = msgContext?.sender ?? 'assistant';

  const statusConfig = status != null ? STATUS_CONFIG[status] : null;
  const statusLabel = statusConfig != null ? t(statusConfig.i18nKey) : '';

  const hasTimestamp = isRenderable(timestamp);
  const hasFooter = isRenderable(footer);
  const hasContent = hasTimestamp || hasFooter || statusConfig != null;
  if (!hasContent) {
    return null;
  }

  return (
    <div
      ref={ref}
      {...mergeProps(
        themeProps('chat-message-metadata'),
        tw(
          chatMessageMetadataClassName,
          sender === 'user'
            ? chatMessageMetadataUserClassName
            : chatMessageMetadataAssistantClassName,
          xstyle && stylex.props(xstyle).className,
        ),
        className,
        style,
      )}
      {...rest}>
      {hasTimestamp && <span>{timestamp}</span>}
      {hasTimestamp && (hasFooter || statusConfig != null) && <span>·</span>}
      {hasFooter && footer}
      {hasFooter && statusConfig != null && <span>·</span>}
      {statusConfig != null && (
        <span
          title={statusLabel}
          aria-label={t('@astryx.chat.messageAriaLabel', {
            status: statusLabel.toLowerCase(),
          })}
          className={tw(
            chatMessageMetadataStatusRowClassName,
            status === 'error' && chatMessageMetadataStatusErrorClassName,
            status === 'sending' && chatMessageMetadataStatusPulseClassName,
          )}>
          <Icon icon={statusConfig.icon} size="xsm" color="inherit" />
          <span>{statusLabel}</span>
        </span>
      )}
    </div>
  );
}

ChatMessageMetadata.displayName = 'ChatMessageMetadata';
