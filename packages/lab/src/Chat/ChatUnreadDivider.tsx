// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatUnreadDivider.tsx
 * @input Uses React, the divider class map, theme props
 * @output Exports ChatUnreadDivider component and ChatUnreadDividerProps
 * @position Error-colored rule marking where unread messages begin
 *
 * Thin error-colored rule with a trailing label ("New" by default),
 * rendered as an aria separator between read and unread messages in a
 * chat thread.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/Chat/index.ts (exports)
 * - /packages/lab/src/Chat/ChatUnreadDivider.doc.mjs
 * - /apps/storybook/stories/ChatAdditions.stories.tsx (examples)
 */

import type {BaseProps} from '@astryxdesign/core';
import {mergeProps} from '@astryxdesign/core/utils';
import {themeProps, xstyleProps} from '@astryxdesign/core/utils';
import {
  chatUnreadDividerLabelClassName,
  chatUnreadDividerRootClassName,
  chatUnreadDividerRuleClassName,
} from './chatUnreadDividerClasses';

export interface ChatUnreadDividerProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;

  /**
   * Divider label.
   * @default 'New'
   */
  label?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Error-colored rule marking the first unread message in a chat thread.
 *
 * Renders as a separator with an accessible label describing where
 * unread messages begin.
 *
 * @example
 * ```
 * <ChatUnreadDivider />
 * <ChatUnreadDivider label="Unread" />
 * ```
 */
export function ChatUnreadDivider({
  label = 'New',
  xstyle,
  className,
  style: styleProp,
  'data-testid': testId,
  ref,
}: ChatUnreadDividerProps) {
  return (
    <div
      ref={ref}
      role="separator"
      aria-label={`${label} messages below`}
      data-testid={testId}
      {...mergeProps(
        mergeProps(themeProps('chat-unread-divider'), {
          className: chatUnreadDividerRootClassName,
        }),
        xstyleProps(xstyle),
        className,
        styleProp,
      )}>
      <span className={chatUnreadDividerRuleClassName} />
      <span className={chatUnreadDividerLabelClassName}>{label}</span>
    </div>
  );
}

ChatUnreadDivider.displayName = 'ChatUnreadDivider';
