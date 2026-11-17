// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatLayoutScrollButton.tsx
 * @input Uses React, Tailwind classes from chatClasses, Button, Icon
 * @output Exports ChatLayoutScrollButton component
 * @position Composable scroll-to-bottom button for use inside ChatLayout
 *
 * Renders inside the layout's dock container. Fades in when visible,
 * expands to show a label when provided (e.g. "New messages").
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Chat/index.ts (exports)
 * - /packages/cli/assets/templates/blocks/components/ChatLayoutScrollButton/ (block examples)
 */

import React from 'react';
import * as stylex from '@stylexjs/stylex';
import {Icon} from '../Icon';
import {Button} from '../Button';
import type {BaseProps} from '../BaseProps';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';
import {
  chatLayoutScrollButtonButtonClassName,
  chatLayoutScrollButtonPillClassName,
  chatLayoutScrollButtonWrapperClassName,
} from './chatClasses';
import {
  registerEnglishFallback,
  useComponentTranslator,
} from '../i18n/useComponentTranslator';
import english from '../i18n/generated-english/Chat/ChatLayoutScrollButton.generated';

registerEnglishFallback(english);

// =============================================================================
// Types
// =============================================================================

export interface ChatLayoutScrollButtonProps extends Omit<
  BaseProps<HTMLDivElement>,
  'onClick'
> {
  ref?: React.Ref<HTMLDivElement>;
  /** Whether the button is visible. */
  isVisible: boolean;
  /** Optional label — expands the button (e.g. "New messages"). */
  label?: string;
  /** Click handler. */
  onClick: () => void;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Floating scroll-to-bottom button for use inside ChatLayout.
 *
 * @example
 * ```
 * <ChatLayoutScrollButton isVisible={!isAtBottom} onClick={scrollToBottom} />
 * ```
 */
export function ChatLayoutScrollButton({
  ref,
  isVisible,
  label,
  onClick,
  xstyle,
  className,
  style,
  ...rest
}: ChatLayoutScrollButtonProps) {
  const t = useComponentTranslator();
  return (
    // Two elements, two responsibilities. The outer one centres the pill and
    // holds the gap above the composer — spacing outside the pill's border
    // box, which the pill cannot own itself. The inner one is the pill: it is
    // what a reader sees, so it carries the painted surface AND the public
    // theming target. Keeping the target on the outer element would satisfy
    // every automated check while leaving a theme styling an invisible
    // full-width row (architecture:component-theming-surface INV4).
    <div
      ref={ref}
      {...mergeProps(
        chatLayoutScrollButtonWrapperClassName,
        xstyle == null ? undefined : stylex.props(xstyle),
        className,
        style,
      )}
      {...rest}>
      <div
        inert={!isVisible}
        {...mergeProps(
          themeProps('chat-layout-scroll-button'),
          chatLayoutScrollButtonPillClassName({
            isVisible,
            isExpanded: label != null,
          }),
        )}>
        <Button
          label={label ?? t('@astryx.chatLayoutScrollButton.scrollToBottom')}
          aria-label={
            label ?? t('@astryx.chatLayoutScrollButton.scrollToBottom')
          }
          icon={<Icon icon="chevronDown" size="md" />}
          variant="ghost"
          size="md"
          isIconOnly={!label}
          onClick={onClick}
          className={chatLayoutScrollButtonButtonClassName(label != null)}>
          {label ?? undefined}
        </Button>
      </div>
    </div>
  );
}

ChatLayoutScrollButton.displayName = 'ChatLayoutScrollButton';
