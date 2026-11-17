// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatLayout.tsx
 * @input Uses React, Tailwind classes from chatClasses, the shared focus ring,
 *   useChatStreamScroll, useChatNewMessages, useChatKeyboard, the pooled
 *   resize observer
 * @output Exports ChatLayout component and ChatLayoutProps
 * @position Layout shell for full chat interfaces — messages in page flow, composer fixed to bottom
 *
 * Structural layout only — scroll behavior is delegated to hooks.
 * Provides the scroll container ref and content ref, renders the
 * scroll-to-bottom button, frosted glass dock, and message area.
 *
 * Layout contract: the root is a flex column. The message area flexes
 * (grow 1, shrink 0) to fill the space the dock doesn't need; the sticky
 * dock keeps its natural height in flow. Short content therefore fills
 * exactly 100% with no overflow, and long content grows past the root so
 * self-scroll mode scrolls (#2573). In external-scrollRef mode the dock
 * is position: fixed (out of flow) and the message area fills the root.
 * There the message area's end padding also holds the dock's height, which
 * the pooled resize observer reports. So the newest message rests above the
 * dock at the scroll's end, as it does in self-scroll mode.
 *
 * Software keyboard (useChatKeyboard): the dock rests above the keyboard.
 * The message area's end padding lets the newest message scroll above it.
 * Both follow the keyboard height, and the keyboard's own motion rides on
 * top. Every route into the composer's text skips Safari's page scroll.
 *
 * Density (compact/balanced/spacious) is controlled via a prop with
 * 'balanced' as the default. No JS measurement or ResizeObserver needed.
 * The container-type on root enables container queries in child components.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Chat/index.ts (exports)
 * - /apps/storybook/stories/ChatLayout.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/ChatLayout/ (block examples)
 */

import {type ReactNode, useCallback, useMemo, useRef, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {focusOutlineStyles} from '../utils/focusOutline.stylex';
import type {BaseProps} from '../BaseProps';
import {mergeProps} from '../utils';
import {useChatStreamScroll} from './useChatStreamScroll';
import {useChatNewMessages} from './useChatNewMessages';
import {useChatKeyboard} from './useChatKeyboard';
import {ChatLayoutScrollButton} from './ChatLayoutScrollButton';
import {ChatLayoutContext} from './ChatContext';
import {
  chatLayoutBlurLayerClassName,
  chatLayoutDockClassName,
  chatLayoutDockContainerClassName,
  chatFocusRingInsetClassName,
  chatLayoutDockInnerClassName,
  chatLayoutEmptyStateClassName,
  chatLayoutMessageAreaClassName,
  chatLayoutRootClassName,
  chatLayoutSizeVars,
} from './chatClasses';
import {tw} from '../utils/tw';
import {KeyboardSurfaceContext} from './keyboardSurface';
import {themeProps} from '../utils/themeProps';

import {useMergedRefs} from '../hooks/useMergedRefs';
import {observeResize} from '../utils/sharedResizeObserver';
import {
  registerEnglishFallback,
  useComponentTranslator,
} from '../i18n/useComponentTranslator';
import english from '../i18n/generated-english/Chat/ChatLayout.generated';

registerEnglishFallback(english);
// =============================================================================
// Types
// =============================================================================

type Density = 'compact' | 'balanced' | 'spacious';

/** The inline custom properties the layout's geometry classes read. */
type ChatLayoutStyle = React.CSSProperties &
  Partial<
    Record<(typeof chatLayoutSizeVars)[keyof typeof chatLayoutSizeVars], string>
  >;

export interface ChatLayoutProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element. */
  ref?: React.Ref<HTMLDivElement>;

  /**
   * Message content — flows naturally in the page, scrolls with the page.
   * Typically ChatMessageList with ChatMessage children.
   */
  children: ReactNode;

  /**
   * Composer element — fixed to the bottom with a frosted glass dock.
   * Typically ChatComposer.
   */
  composer: ReactNode;

  /**
   * Content shown when children is empty.
   */
  emptyState?: ReactNode;

  /**
   * Scroll-to-bottom button rendered above the composer in the dock.
   * Defaults to ChatLayoutScrollButton with useChatStreamScroll.
   * Pass a custom ReactNode to override, or `null` to hide.
   */
  scrollButton?: ReactNode | null;

  /**
   * External scroll container ref. When provided, auto-scroll and
   * scroll-to-bottom target this element instead of the layout root.
   *
   * @example
   * ```
   * const scrollRef = useRef(document.documentElement);
   * <ChatLayout scrollRef={scrollRef} composer={...}>...</ChatLayout>
   * ```
   *
   * When omitted, the layout root itself is the scroll container.
   */
  scrollRef?: React.RefObject<HTMLElement | null>;

  /**
   * Layout density. Controls spacing, max-width, and blur layer sizing.
   *
   * @default 'balanced'
   */
  density?: Density;
}

// =============================================================================
// Helpers
// =============================================================================

function hasVisibleContent(children: ReactNode): boolean {
  // eslint-disable-next-line @astryx/no-nullish-jsx-guard -- component:ChatLayout FR5 names exactly null, undefined, false and an empty array as empty children; '' and true are not
  if (children == null || children === false) {
    return false;
  }
  if (Array.isArray(children) && children.length === 0) {
    return false;
  }
  return true;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Layout shell for a full chat interface: messages in page flow, composer
 * docked to the bottom behind a frosted glass layer, with auto-scroll and a
 * scroll-to-bottom button wired in.
 *
 * @example
 * ```
 * <ChatLayout
 *   density="spacious"
 *   composer={<ChatComposer onSubmit={send} />}
 *   emptyState={<EmptyState title="No messages yet" />}>
 *   <ChatMessageList>
 *     <ChatMessage sender="assistant">
 *       <ChatMessageBubble>How can I help?</ChatMessageBubble>
 *     </ChatMessage>
 *   </ChatMessageList>
 * </ChatLayout>
 * ```
 */
export function ChatLayout({
  children,
  composer,
  density = 'balanced',
  emptyState,
  scrollButton,
  scrollRef: externalScrollRef,
  xstyle,
  className,
  style,
  'data-testid': testId,
  ref,
  ...rest
}: ChatLayoutProps) {
  const t = useComponentTranslator();
  const rootRef = useRef<HTMLDivElement>(null);

  const scrollContainerRef = externalScrollRef ?? rootRef;
  const isSelfScrolling = !externalScrollRef;

  // --- Default scroll behavior ---
  const scroll = useChatStreamScroll({scrollRef: scrollContainerRef});
  const newMsgs = useChatNewMessages({
    isLocked: scroll.isLocked,
    onResize: scroll.scrollIfLocked,
  });

  // --- Software keyboard ---
  const keyboard = useChatKeyboard({
    rootRef,
    scrollRef: scrollContainerRef,
    isSelfScrolling,
    scrollToBottom: scroll.scrollToBottom,
  });

  // --- Fixed dock's height ---
  // A fixed dock is out of flow, so the message area makes room for it. The
  // room is the dock's border-box height, as the pooled observer reports it.
  // The padding changes only the message area, so it never resizes the dock.
  // React calls the returned unsubscribe when the dock detaches or the
  // scroll mode changes.
  const [dockHeight, setDockHeight] = useState(0);
  const observeDock = useCallback(
    (dock: HTMLDivElement | null) => {
      if (dock == null || isSelfScrolling) {
        return undefined;
      }
      return observeResize(dock, entry => {
        // The pooled observer's first call carries no size. The mount reads
        // the dock once, so the first paint has the room.
        const height =
          entry.borderBoxSize?.[0]?.blockSize ??
          dock.getBoundingClientRect().height;
        setDockHeight(Math.round(height));
      });
    },
    [isSelfScrolling],
  );
  const dockRef = useMergedRefs(keyboard.dockRef, observeDock);
  const endRoom = keyboard.lift + (isSelfScrolling ? 0 : dockHeight);
  const endRoomStyle: ChatLayoutStyle =
    endRoom > 0 ? {[chatLayoutSizeVars.endRoom]: `${endRoom}px`} : {};
  const dockLiftStyle: ChatLayoutStyle =
    keyboard.lift > 0
      ? {[chatLayoutSizeVars.dockLift]: `${keyboard.lift}px`}
      : {};

  const defaultScrollButton = (
    <ChatLayoutScrollButton
      isVisible={scroll.isScrolledUp || newMsgs.hasNewMessages}
      label={
        newMsgs.hasNewMessages ? t('@astryx.chatLayout.newMessages') : undefined
      }
      onClick={() => {
        newMsgs.dismiss();
        scroll.scrollToBottom();
      }}
    />
  );

  // --- Layout context ---
  const layoutContext = useMemo(
    () => ({scrollContainerRef, contentRef: newMsgs.contentRef}),
    [scrollContainerRef, newMsgs.contentRef],
  );

  // --- Derived state ---
  const showEmpty = !hasVisibleContent(children);

  return (
    <ChatLayoutContext value={layoutContext}>
      <div
        {...rest}
        ref={useMergedRefs(ref, rootRef)}
        data-testid={testId}
        {...mergeProps(
          themeProps('chat-layout', {density}),
          tw(
            chatLayoutRootClassName(isSelfScrolling),
            xstyle && stylex.props(xstyle).className,
          ),
          className,
          style,
        )}>
        {/* Message area */}
        <div
          ref={keyboard.messagesRef}
          className={chatLayoutMessageAreaClassName({
            density,
            hasEndRoom: endRoom > 0,
          })}
          style={endRoomStyle}>
          {showEmpty && emptyState ? (
            <div className={chatLayoutEmptyStateClassName}>{emptyState}</div>
          ) : (
            children
          )}
        </div>

        {/* Dock container — sticky/fixed, holds blur + scroll button + composer */}
        <div
          ref={dockRef}
          className={chatLayoutDockContainerClassName({
            isFixed: !isSelfScrolling,
            hasLift: keyboard.lift > 0,
          })}
          style={dockLiftStyle}>
          {/* Scroll-to-bottom button */}
          {scrollButton === undefined ? defaultScrollButton : scrollButton}

          {/* Frosted glass layer */}
          <div className={chatLayoutBlurLayerClassName(density)} />

          {/* The composer's region. Under a finger in a top-level page,
              useChatKeyboard makes it a group with no name, where focus rests
              after the keyboard's Done. Elsewhere it is a plain container. */}
          <KeyboardSurfaceContext value={true}>
            <div
              ref={keyboard.composerRef}
              {...mergeProps(
                tw(
                  chatLayoutDockClassName(density),
                  chatFocusRingInsetClassName,
                ),
                stylex.props(focusOutlineStyles.focusVisible),
              )}>
              <div className={chatLayoutDockInnerClassName(density)}>
                {composer}
              </div>
            </div>
          </KeyboardSurfaceContext>
        </div>
      </div>
    </ChatLayoutContext>
  );
}

ChatLayout.displayName = 'ChatLayout';
