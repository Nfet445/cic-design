// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatReasoning.tsx
 * @input Uses React, StyleX for the `xstyle` passthrough, class maps from
 *   `chatReasoningClasses.ts`
 * @output Exports ChatReasoning component
 * @position Chat component — compact collapsible reasoning/thinking display
 *
 * Renders model reasoning/thinking content as a compact single-line
 * collapsed element. Expanding reveals the full reasoning text.
 *
 * Design: extremely compact by default. One line with ellipsis overflow.
 * Expandable on click.
 */

import {useCallback, useId, useState, type ReactNode} from 'react';
import type {BaseProps} from '@astryxdesign/core';
import {mergeProps, xstyleProps} from '@astryxdesign/core/utils';
import {themeProps} from '@astryxdesign/core/utils';
import {tw} from '../tw';
import {
  chatReasoningChevronClassName,
  chatReasoningChevronExpandedClassName,
  chatReasoningContentClassName,
  chatReasoningContentCollapsedClassName,
  chatReasoningContentExpandedClassName,
  chatReasoningContentInnerClassName,
  chatReasoningContentPaddingClassName,
  chatReasoningDurationClassName,
  chatReasoningHeaderClassName,
  chatReasoningIconClassName,
  chatReasoningLabelClassName,
  chatReasoningLabelRowClassName,
  chatReasoningPreviewClassName,
  chatReasoningRootClassName,
  chatReasoningSeparatorClassName,
  chatReasoningStreamingLabelClassName,
} from './chatReasoningClasses';

// =============================================================================
// Types
// =============================================================================

export interface ChatReasoningProps extends BaseProps<HTMLDivElement> {
  /** Reasoning content. String renders as plain text; ReactNode for Markdown etc. */
  children: ReactNode;
  /** Header label. @default 'Thinking' */
  label?: string;
  /** Duration string shown after label (e.g. "12s"). */
  duration?: string;
  /** Whether reasoning is still streaming. Shows shimmer on label. */
  isStreaming?: boolean;
  /** Controlled expanded state. */
  isExpanded?: boolean;
  /** Default expanded state (uncontrolled). @default false */
  defaultIsExpanded?: boolean;
  /** Callback when expanded state changes. */
  onExpandedChange?: (isExpanded: boolean) => void;
}

// =============================================================================
// Icons
// =============================================================================

function ThinkingIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle
        cx="7"
        cy="7"
        r="5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="3 2"
      />
      <circle cx="5.5" cy="7" r="0.75" fill="currentColor" />
      <circle cx="8.5" cy="7" r="0.75" fill="currentColor" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// =============================================================================
// Component
// =============================================================================

/**
 * Compact collapsible display for model reasoning/thinking content.
 *
 * Renders as a single line: icon + label + duration + ellipsized preview.
 * Expands to show full reasoning on click.
 *
 * @example
 * ```
 * <ChatMessage sender="assistant">
 *   <ChatReasoning duration="12s">
 *     Let me work through the constraints on adjacent fields...
 *   </ChatReasoning>
 *   <Markdown>{response}</Markdown>
 * </ChatMessage>
 * ```
 */
export function ChatReasoning(props: ChatReasoningProps) {
  const {
    children,
    label = 'Thinking',
    duration,
    isStreaming = false,
    isExpanded: controlledExpanded,
    defaultIsExpanded = false,
    onExpandedChange,
    xstyle,
    className,
    style,
    ...rest
  } = props;

  const [internalExpanded, setInternalExpanded] = useState(defaultIsExpanded);
  const isControlled = controlledExpanded !== undefined;
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;
  const contentId = useId();

  const toggle = useCallback(() => {
    const next = !isExpanded;
    if (!isControlled) {
      setInternalExpanded(next);
    }
    onExpandedChange?.(next);
  }, [isExpanded, isControlled, onExpandedChange]);

  const previewText = typeof children === 'string' ? children : null;

  return (
    <div
      {...mergeProps(
        themeProps('chat-reasoning', {
          expanded: isExpanded ? 'expanded' : null,
          streaming: isStreaming ? 'streaming' : null,
        }),
        xstyleProps(xstyle),
        tw(chatReasoningRootClassName, className),
        style,
      )}
      {...rest}>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        onClick={toggle}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
        className={chatReasoningHeaderClassName}>
        <span className={chatReasoningIconClassName}>
          <ThinkingIcon />
        </span>
        <div className={chatReasoningLabelRowClassName}>
          <span
            className={
              isStreaming
                ? chatReasoningStreamingLabelClassName
                : chatReasoningLabelClassName
            }>
            {label}
          </span>
          {duration != null && !isStreaming && (
            <>
              <span className={chatReasoningSeparatorClassName}>·</span>
              <span className={chatReasoningDurationClassName}>{duration}</span>
            </>
          )}
          {!isExpanded && previewText && !isStreaming && (
            <>
              <span className={chatReasoningSeparatorClassName}>—</span>
              <span className={chatReasoningPreviewClassName}>
                {previewText}
              </span>
            </>
          )}
        </div>
        <span
          className={tw(
            chatReasoningChevronClassName,
            isExpanded && chatReasoningChevronExpandedClassName,
          )}>
          <ChevronDownIcon />
        </span>
      </div>

      <div
        id={contentId}
        // Collapsed content is only clipped visually (0fr grid row + overflow
        // hidden), which leaves it in the accessibility tree. `inert` removes
        // it from AT and the tab order while keeping the element rendered, so
        // the grid-template-rows expand/collapse transition still runs.
        inert={!isExpanded}
        className={tw(
          chatReasoningContentClassName,
          isExpanded
            ? chatReasoningContentExpandedClassName
            : chatReasoningContentCollapsedClassName,
        )}>
        <div className={chatReasoningContentInnerClassName}>
          <div className={chatReasoningContentPaddingClassName}>{children}</div>
        </div>
      </div>
    </div>
  );
}

ChatReasoning.displayName = 'ChatReasoning';
