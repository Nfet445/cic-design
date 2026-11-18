// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatMessageList.tsx
 * @input Uses React, StyleX, Tailwind classes from chatClasses, ChatListContext,
 *   and isRenderable to preserve accepted empty-state content
 * @output Exports ChatMessageList component and ChatMessageListProps
 * @position Presentational message container — holds ChatMessage children
 *
 * Renders a container with role="log" for chat message histories.
 * Handles density context, configurable gap, empty state,
 * a configurable spacer (align) that pushes messages to the bottom,
 * and an infinite scroll sentinel.
 *
 * Auto-scroll and the scroll-to-bottom button are owned by
 * ChatLayout. When used standalone (without a layout), the list
 * is purely presentational — compose useChatStreamScroll yourself if needed.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Chat/index.ts (exports)
 * - /apps/storybook/stories/Chat.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/ChatMessageList/ (block examples)
 */

import {type ReactNode, useEffect, useMemo, useRef, useTransition} from 'react';
import {focusOutlineFocusVisibleClassName} from '../utils/focusOutlineClasses';
import {tw} from '../utils/tw';
import {
  chatFocusRingInsetClassName,
  chatMessageListColumnClassName,
  chatMessageListEmptyStateClassName,
  chatMessageListInnerClassName,
  chatMessageListLoadingClassName,
  chatMessageListSpacerClassName,
} from './chatClasses';
import {
  ChatListContext,
  type ChatDensity,
  useChatLayoutContext,
} from './ChatContext';
import {isRenderable, mergeProps} from '../utils';
import {xstyleProps} from '../utils/xstyle';
import {Spinner} from '../Spinner';
import type {BaseProps} from '../BaseProps';
import type {SpacingStep} from '../utils/types';
import {themeProps} from '../utils/themeProps';
import {useBusyAnnouncement} from '../hooks/useBusyAnnouncement';
import {
  registerEnglishFallback,
  useComponentTranslator,
} from '../i18n/useComponentTranslator';
import english from '../i18n/generated-english/Chat/ChatMessageList.generated';

registerEnglishFallback(english);

export interface ChatMessageListProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;

  /**
   * Message elements — typically ChatMessage components.
   * Also accepts Divider (date separators) or any ReactNode.
   */
  children: ReactNode;

  /**
   * Custom content when the list has no messages.
   */
  emptyState?: ReactNode;

  /**
   * Async action when the user scrolls to the top.
   * Use for loading older messages. Wrapped in useTransition —
   * shows a spinner at the top while pending.
   */
  scrollToTopAction?: () => Promise<void>;

  /**
   * Visual density — flows to child messages via context.
   * Individual messages can override.
   * @default 'balanced'
   */
  density?: ChatDensity;

  /**
   * Gap between top-level message rows, using the spacing scale.
   * Defaults to the selected density's gap. Override this when each
   * row is independent (for example, LLM event streams where messages cannot
   * be grouped) and row spacing should be tuned separately from density.
   */
  gap?: SpacingStep;

  /**
   * Vertical alignment of messages when the list is shorter than its
   * container.
   *
   * - `'bottom'` (default): a spacer fills the free space and pushes
   *   messages to the bottom, so a short conversation sits just above the
   *   composer — the familiar messaging-app layout.
   * - `'top'`: the spacer is omitted, so messages start at the top and grow
   *   downward — better for document-style or log-style lists.
   *
   * This only changes the resting position of a non-full list. Once messages
   * overflow the container the spacer collapses to zero in both modes, so
   * ChatLayout auto-scroll-to-bottom behavior is identical either way.
   *
   * @default 'bottom'
   */
  align?: 'top' | 'bottom';

  /**
   * Whether an assistant message is actively streaming into the list.
   *
   * The list is a `role="log"` / `aria-live="polite"` region, so while a
   * message streams in token-by-token, screen readers would otherwise
   * re-announce the accumulating partial text on every mutation. Set
   * `isStreaming` to `true` for the duration of a stream: it marks the log
   * `aria-busy="true"` so assistive tech waits and announces the completed
   * message once, when `isStreaming` returns to `false`.
   *
   * @default false
   */
  isStreaming?: boolean;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Presentational container for chat messages.
 *
 * Renders messages in a flex column with density-based spacing.
 * Override gap to tune row spacing separately from density.
 * By default a spacer pushes content to the bottom when the list isn't full;
 * set `align='top'` to start messages at the top instead.
 * Supports loading older messages via `scrollToTopAction`.
 *
 * Auto-scroll and the scroll-to-bottom button are owned by
 * ChatLayout. Use useChatStreamScroll for standalone scroll control.
 *
 * @example
 * ```
 * <ChatMessageList>
 *   <ChatMessage sender="assistant" name="Navi" avatar={<Avatar name="Navi" size="md" />}>
 *     <ChatMessageBubble>Hello!</ChatMessageBubble>
 *   </ChatMessage>
 * </ChatMessageList>
 * ```
 */
export function ChatMessageList({
  children,
  emptyState,
  scrollToTopAction,
  density = 'balanced',
  gap,
  align = 'bottom',
  isStreaming = false,
  xstyle,
  className,
  style,
  'data-testid': testId,
  ref,
  ...rest
}: ChatMessageListProps) {
  const layoutContext = useChatLayoutContext();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [isLoadingTop, startTransition] = useTransition();
  const t = useComponentTranslator();
  // The top loading Spinner sits inside the log and is silent; the list
  // announces its loading through the channel (spec:AST-086 FR4, FR8).
  useBusyAnnouncement(isLoadingTop, t('@astryx.spinner.loading'), innerRef);

  // Register inner content element with the layout for height observation
  useEffect(() => {
    if (layoutContext?.contentRef && innerRef.current) {
      layoutContext.contentRef(innerRef.current);
      return () => layoutContext.contentRef(null);
    }
  }, [layoutContext]);

  const hasChildren =
    // eslint-disable-next-line @astryx/no-nullish-jsx-guard -- component:ChatMessageList FR4 shows the empty state only for nullish, false or an empty top-level array children
    children != null &&
    children !== false &&
    !(Array.isArray(children) && children.length === 0);

  // Syncs an IntersectionObserver on the top sentinel with `scrollToTopAction`.
  // The action runs when the sentinel comes into view.
  useEffect(() => {
    const scrollContainer = layoutContext?.scrollContainerRef?.current;
    if (!scrollToTopAction || !sentinelRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          startTransition(async () => {
            await scrollToTopAction();
          });
        }
      },
      {root: scrollContainer ?? null, threshold: 0},
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [scrollToTopAction, layoutContext]);

  const contextValue = useMemo(() => ({density}), [density]);

  return (
    <ChatListContext value={contextValue}>
      <div
        {...rest}
        ref={ref}
        role="log"
        aria-live="polite"
        aria-busy={isStreaming || undefined}
        tabIndex={0}
        data-testid={testId}
        {...mergeProps(
          themeProps('chat-message-list', {density}),
          // A tab stop: the shared ring, which a theme restyles through the
          // focus-outline tokens. The log fills the area that scrolls it,
          // which clips at its edges, so the ring sits inside its own box.
          mergeProps(
            tw(
              chatMessageListColumnClassName,
              focusOutlineFocusVisibleClassName,
              chatFocusRingInsetClassName,
              xstyleProps(xstyle).className,
            ),
          ),
          className,
          style,
        )}>
        <div
          ref={innerRef}
          className={chatMessageListInnerClassName({density, gap})}>
          {/* Sentinel for infinite scroll */}
          {scrollToTopAction && <div ref={sentinelRef} aria-hidden />}

          {/* Loading spinner at top */}
          {isLoadingTop && (
            // eslint-disable-next-line @astryx/no-style-only-wrapper -- the row centres the Spinner and holds the gap above it; the rule reads StyleX objects, not class text.
            <div className={chatMessageListLoadingClassName}>
              <Spinner size="md" aria-hidden="true" />
            </div>
          )}

          {/* Spacer pushes messages to bottom when the list isn't full.
              Omitted for top alignment so messages start at the top. */}
          {align === 'bottom' && (
            <div className={chatMessageListSpacerClassName} aria-hidden />
          )}

          {/* Messages or empty state */}
          {hasChildren ? (
            children
          ) : isRenderable(emptyState) ? (
            <div className={chatMessageListEmptyStateClassName}>
              {emptyState}
            </div>
          ) : null}
        </div>
      </div>
    </ChatListContext>
  );
}

ChatMessageList.displayName = 'ChatMessageList';
