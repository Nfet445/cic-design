// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatComposer.tsx
 * @input Uses React, StyleX, BaseProps
 * @output Exports ChatComposer layout shell component
 * @position Core implementation; consumed by index.ts
 *
 * Layout shell for a chat composer. Arranges slots (drawer, header,
 * input, footer actions, send button, status) in a vertical stack with
 * page-radius container, hover/focus shadows, and concentric inner radius.
 *
 * Component CSS vars (themeable via defineTheme):
 * - `--_chat-composer-radius` (default: --radius-chat) — outer border radius
 * - `--_chat-composer-padding` (default: --spacing-3) — body padding
 * - Inner element radius = calc(--_chat-composer-radius - --_chat-composer-padding)
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Chat/Chat.doc.mjs
 * - /apps/storybook/stories/ChatComposer.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/ChatComposer/ (block examples)
 */

import React, {
  use,
  useState,
  useCallback,
  useRef,
  useMemo,
  type ReactNode,
  type MouseEvent,
  type FocusEvent,
} from 'react';
import type {BaseProps} from '../BaseProps';
import {mergeProps} from '../utils';
import {xstyleProps} from '../utils/xstyle';
import {tw} from '../utils/tw';
import {
  chatComposerBodyClassName,
  chatComposerElevationClassName,
  chatComposerFooterClassName,
  chatComposerFooterLeftClassName,
  chatComposerFooterRightClassName,
  chatComposerHeaderClassName,
  chatComposerHeaderLeftClassName,
  chatComposerHeaderRightClassName,
  chatComposerInputAreaClassName,
  chatComposerRootClassName,
  chatComposerStatusClassName,
} from './chatClasses';
import {Icon} from '../Icon';
import {ChatComposerInput} from './ChatComposerInput';
import {ChatComposerContext} from './ChatContext';
import type {ChatComposerInputControl} from './ChatContext';
import {ChatSendButton} from './ChatSendButton';
import {
  KeyboardSurfaceContext,
  focusInKeyboardSurface,
} from './keyboardSurface';
import {themeProps} from '../utils/themeProps';
import {useAnnounceRenderedText} from '../hooks/useAnnounceRenderedText';
import {useMergedRefs} from '../hooks/useMergedRefs';
import {focusOutlineWithinClassName} from '../utils/focusOutlineClasses';
import {useInteractionModalityTracking} from '../utils/interactionModality';
import {
  registerEnglishFallback,
  useComponentTranslator,
} from '../i18n/useComponentTranslator';
import english from '../i18n/generated-english/Chat/ChatComposer.generated';

registerEnglishFallback(english);

// =============================================================================
// Types
// =============================================================================

export type ChatComposerStatus = {
  type: 'error' | 'warning';
  message?: string;
};

export type ChatComposerDensity = 'compact' | 'balanced' | 'spacious';

export interface ChatComposerProps extends Omit<
  BaseProps<HTMLDivElement>,
  'onChange' | 'onSubmit'
> {
  ref?: React.Ref<HTMLDivElement>;
  /** Called when the user submits the message */
  onSubmit: (value: string) => void;
  /** Called when the user clicks the stop button */
  onStop?: () => void;
  /** Whether the stop button is shown instead of the send button. @default false */
  isStopShown?: boolean;
  /** Controlled value of the input */
  value?: string;
  /** Called when the input value changes */
  onChange?: (value: string) => void;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Whether the composer is disabled */
  isDisabled?: boolean;
  /** Density variant */
  density?: ChatComposerDensity;
  /**
   * Resting elevation of the composer body. `low` (the default) keeps today's
   * raised look — low at rest, bumping to med on hover / focus. `none` flattens
   * it and draws a border. Keyboard focus in the editor adds the shared focus
   * ring in either presentation; pointer focus does not add that ring.
   * @default 'low'
   */
  elevation?: 'none' | 'low';

  // --- Slot props ---

  /** Collapsible drawer rendered above the input — attachments, context chips, etc. Use ChatComposerDrawer. */
  drawer?: ReactNode;
  /** Actions rendered on the left side of the header (e.g. attach, mention buttons). Use icon-only `size="sm"` buttons. */
  headerActions?: ReactNode;
  /** Contextual info rendered on the right side of the header (e.g. context window usage, ProgressBar). */
  headerContext?: ReactNode;
  /** Custom input element — replaces the default textarea */
  input?: ReactNode;
  /** Actions rendered on the left side of the footer. Use `size="md"` buttons to match the send button height. */
  footerActions?: ReactNode;
  /** Actions rendered to the left of the send button. Use `size="md"` buttons to match the send button height. */
  sendActions?: ReactNode;
  /** Custom send button — replaces the default */
  sendButton?: ReactNode;
  /** Status message rendered below (or above) the composer body */
  status?: ChatComposerStatus;
  /** Where to render the status. @default 'bottom' */
  statusPosition?: 'top' | 'bottom';
}

function isComposerEditor(target: EventTarget | null): target is HTMLElement {
  return (
    target instanceof HTMLElement &&
    target.matches(
      'textarea, [contenteditable="true"], [role="textbox"], [role="combobox"][contenteditable], input:not([type]), input[type="text"], input[type="search"], input[type="email"], input[type="url"], input[type="tel"], input[type="password"]',
    )
  );
}

// =============================================================================
// Component
// =============================================================================

/**
 * Layout shell for a chat composer with slots for drawer, input,
 * actions, and a send button.
 *
 * @example
 * ```
 * <ChatComposer
 *   onSubmit={(value) => console.log(value)}
 *   placeholder="Type a message..."
 * />
 * ```
 */
export function ChatComposer(props: ChatComposerProps) {
  const t = useComponentTranslator();
  const {
    ref,
    onSubmit,
    onStop,
    isStopShown = false,
    value: controlledValue,
    onChange,
    placeholder: placeholderFromProps,
    isDisabled = false,
    density = 'balanced',
    elevation = 'low',
    drawer,
    headerActions,
    headerContext,
    input,
    footerActions,
    sendActions,
    sendButton,
    status,
    statusPosition = 'bottom',
    xstyle,
    className,
    style,
    ...rest
  } = props;
  const placeholder =
    placeholderFromProps ?? t('@astryx.chat.composer.placeholder');

  const [internalValue, setInternalValue] = useState('');
  const [hasKeyboardEditorFocus, setHasKeyboardEditorFocus] = useState(false);

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const updateValue = useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    },
    [isControlled, onChange],
  );

  const handleSubmit = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed || isDisabled) {
        return;
      }
      onSubmit(trimmed);
      updateValue('');
    },
    [isDisabled, onSubmit, updateValue],
  );

  const canSend = currentValue.trim().length > 0 && !isDisabled;

  const bodyRef = useRef<HTMLDivElement>(null);
  const {ref: modalityRef, readModality} = useInteractionModalityTracking();
  const bodyComposedRef = useMergedRefs(bodyRef, modalityRef);

  // Input slot registers its focus (and future) control here so the shell can
  // drive it without knowing its DOM shape. Stable ref — safe in the memoized
  // context value.
  const inputControlRef = useRef<ChatComposerInputControl | null>(null);
  // Inside ChatLayout's keyboard surface, a touch focus skips the browser's
  // reveal. Elsewhere the browser's own focus applies.
  const isKeyboardSurface = use(KeyboardSurfaceContext);

  const handleBodyClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      // Focus the input when clicking empty space in the body.
      // Skip if the click target is a button, link, or interactive element.
      const target = e.target as HTMLElement;
      if (
        target.closest(
          'button, a, [role="button"], [contenteditable="true"], [data-astryx-token]',
        )
      ) {
        return;
      }
      // Prefer the input's registered control (works for any input shape,
      // including editors whose focusable node isn't a bare
      // contenteditable/textarea). Fall back to a DOM query so uninstrumented
      // custom inputs still get click-to-focus.
      if (inputControlRef.current) {
        inputControlRef.current.focus();
        return;
      }
      const editable = bodyRef.current?.querySelector<HTMLElement>(
        '[contenteditable="true"], textarea',
      );
      if (editable) {
        focusInKeyboardSurface(editable, isKeyboardSurface);
      }
    },
    [isKeyboardSurface],
  );

  const handleBodyFocusCapture = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      setHasKeyboardEditorFocus(
        isComposerEditor(event.target) && readModality() === 'keyboard',
      );
    },
    [readModality],
  );

  const handleBodyBlurCapture = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        setHasKeyboardEditorFocus(false);
      }
    },
    [],
  );

  // The status bar mounts together with its message, and a live region born
  // holding its text is not reliably announced, so the shared own-content
  // module announces what the bar renders: errors assertively, warnings
  // politely, once per occasion, silent for a status already shown when the
  // page loads (spec:AST-086 FR2, FR5, FR6, FR11; react-component-runtime
  // INV10). Changing the status type is a new occasion; clearing it re-arms.
  const statusRef = useRef<HTMLDivElement>(null);
  useAnnounceRenderedText(
    statusRef,
    Boolean(status?.message),
    status?.type ?? '',
    {
      skipFirstRender: true,
      politeness: status?.type === 'error' ? 'assertive' : 'polite',
    },
  );

  const statusEl = status ? (
    <div
      ref={statusRef}
      className={chatComposerStatusClassName(statusPosition, status.type)}>
      <Icon
        icon={status.type === 'error' ? 'error' : 'warning'}
        size="md"
        // The glyph sits on the pale status fill, so it takes the bar's
        // on-muted content colour, as Banner and FieldStatus glyphs do.
        color="inherit"
      />
      {status.message}
    </div>
  ) : null;

  const composerContext = useMemo(
    () => ({
      value: currentValue,
      onChange: updateValue,
      onSubmit: handleSubmit,
      placeholder,
      isDisabled,
      isStopShown,
      canSend,
      onStop,
      inputControlRef,
    }),
    [
      currentValue,
      updateValue,
      handleSubmit,
      placeholder,
      isDisabled,
      isStopShown,
      canSend,
      onStop,
    ],
  );

  return (
    <ChatComposerContext value={composerContext}>
      <div
        ref={ref}
        {...mergeProps(
          themeProps('chat-composer', {density}),
          chatComposerRootClassName(isDisabled),
          className,
          style,
        )}
        {...rest}>
        {statusPosition === 'top' && statusEl}
        {drawer}

        <div
          ref={bodyComposedRef}
          onClick={handleBodyClick}
          onPointerDownCapture={() => setHasKeyboardEditorFocus(false)}
          onFocusCapture={handleBodyFocusCapture}
          onBlurCapture={handleBodyBlurCapture}
          className={tw(
            chatComposerBodyClassName(density),
            chatComposerElevationClassName(elevation),
            xstyleProps(xstyle).className,
            hasKeyboardEditorFocus && focusOutlineWithinClassName,
          )}>
          {(headerActions || headerContext) && (
            <div className={chatComposerHeaderClassName}>
              <div className={chatComposerHeaderLeftClassName}>
                {headerActions}
              </div>
              <div className={chatComposerHeaderRightClassName}>
                {headerContext}
              </div>
            </div>
          )}

          <div className={chatComposerInputAreaClassName}>
            {input ?? <ChatComposerInput />}
          </div>

          <div className={chatComposerFooterClassName}>
            <div className={chatComposerFooterLeftClassName}>
              {footerActions}
            </div>
            <div
              className={chatComposerFooterRightClassName(
                isDisabled && isStopShown,
              )}>
              {sendActions}
              {sendButton ?? <ChatSendButton />}
            </div>
          </div>
        </div>

        {statusPosition === 'bottom' && statusEl}
      </div>
    </ChatComposerContext>
  );
}

ChatComposer.displayName = 'ChatComposer';
