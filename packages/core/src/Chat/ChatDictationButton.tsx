// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatDictationButton.tsx
 * @input Uses React, Tailwind classes from chatClasses, Button, Icon, the
 *   useChatDictation return
 * @output Exports ChatDictationButton for voice input in chat composer
 * @position UI component — renders in sendActions slot of ChatComposer
 *
 * A toggle button that connects to useChatDictation. Shows a microphone
 * icon when idle. When listening, replaces the icon with volume-reactive
 * frequency bars (equalizer style) that respond to real mic input.
 * Bars use the accent color and blend toward the semantic error color when
 * volume clips past 20%.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Chat/index.ts (exports)
 * - /packages/cli/assets/templates/blocks/components/ChatDictationButton/ (block examples)
 */

import React from 'react';
import type {UseSpeechRecognitionReturn} from './useSpeechRecognition';
import {Button} from '../Button';
import {Icon} from '../Icon';
import {mergeProps} from '../utils';
import {xstyleProps} from '../utils/xstyle';
import {tw} from '../utils/tw';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';
import {
  registerEnglishFallback,
  useComponentTranslator,
} from '../i18n/useComponentTranslator';
import english from '../i18n/generated-english/Chat/ChatDictationButton.generated';
import {
  chatDictationBarClassName,
  chatDictationBarsClassName,
  chatDictationBarVars,
  chatDictationWrapperClassName,
} from './chatClasses';

registerEnglishFallback(english);

// =============================================================================
// Types
// =============================================================================

export interface ChatDictationButtonProps extends BaseProps<HTMLSpanElement> {
  ref?: React.Ref<HTMLSpanElement>;
  /** The return value from useChatDictation or useSpeechRecognition. */
  dictation: UseSpeechRecognitionReturn;
  /** Button size. @default "md" */
  size?: 'sm' | 'md';
  /** Hide the button when SpeechRecognition is unsupported. When false, the unsupported button remains visible but disabled. @default true */
  isHiddenWhenUnsupported?: boolean;
  /** Accessible label override. */
  label?: string;
}

// =============================================================================
// Types
// =============================================================================

/** The inline custom properties the bar classes read. */
type ChatDictationBarStyle = React.CSSProperties &
  Partial<
    Record<
      (typeof chatDictationBarVars)[keyof typeof chatDictationBarVars],
      string
    >
  >;

// =============================================================================
// Constants
// =============================================================================

const BAR_COUNT = 5;
const BAR_MIN_SCALE = 0.08;

const SIZE_CONFIG = {
  sm: {barWidth: 2, barGap: 1.5, barMaxHeight: 14},
  md: {barWidth: 2.5, barGap: 2, barMaxHeight: 18},
};

// =============================================================================
// Component
// =============================================================================

/**
 * Microphone button for voice input in a chat composer.
 * Requires the return value of useChatDictation.
 *
 * @example
 * ```
 * <ChatDictationButton dictation={dictation} />
 * ```
 */
export function ChatDictationButton({
  ref,
  dictation,
  size = 'md',
  isHiddenWhenUnsupported = true,
  label,
  xstyle,
  className,
  style,
  ...rest
}: ChatDictationButtonProps) {
  const t = useComponentTranslator();

  if (isHiddenWhenUnsupported && !dictation.isSupported) {
    return null;
  }

  const {isListening, bands, volume: rawVolume} = dictation;
  const accessibleLabel =
    label ??
    (isListening
      ? t('@astryx.chatDictationButton.stopDictation')
      : t('@astryx.chatDictationButton.startDictation'));

  // Boost each band for visibility — quiet speech (0-10%) maps to full visual range
  const boostedBands = bands.map(b => Math.min(Math.pow(b / 0.2, 0.5), 1));

  // Blend toward the theme's semantic error color as clipping increases.
  const isClipping = rawVolume >= 0.2;
  const clippingStrength = Math.min((rawVolume - 0.2) / 0.1, 1) * 100;

  const barColor = isClipping
    ? `color-mix(in srgb, var(--color-accent), var(--color-error) ${clippingStrength}%)`
    : 'var(--color-accent)';

  const {barGap, barMaxHeight} = SIZE_CONFIG[size];
  const barsStyle: ChatDictationBarStyle = {
    [chatDictationBarVars.gap]: `${barGap}px`,
    [chatDictationBarVars.height]: `${barMaxHeight}px`,
  };

  return (
    <span
      ref={ref}
      {...mergeProps(
        themeProps('chat-dictation-button'),
        xstyleProps(xstyle),
        tw(chatDictationWrapperClassName, className),
        style,
      )}
      {...rest}>
      {isListening && (
        <span
          aria-hidden
          className={chatDictationBarsClassName}
          style={barsStyle}>
          {boostedBands.slice(0, BAR_COUNT).map((level, i) => {
            const scale = BAR_MIN_SCALE + level * (1 - BAR_MIN_SCALE);
            const barStyle: ChatDictationBarStyle = {
              [chatDictationBarVars.color]: barColor,
              [chatDictationBarVars.scale]: `${scale}`,
            };
            return (
              <span
                // eslint-disable-next-line @eslint-react/no-array-index-key -- equalizer bars are fixed positional slots
                key={i}
                className={chatDictationBarClassName(size)}
                style={barStyle}
              />
            );
          })}
        </span>
      )}
      <Button
        label={accessibleLabel}
        aria-label={accessibleLabel}
        variant="ghost"
        size={size}
        icon={isListening ? undefined : <Icon icon="microphone" size={size} />}
        isIconOnly
        isDisabled={!dictation.isSupported}
        onClick={dictation.toggle}
      />
    </span>
  );
}

ChatDictationButton.displayName = 'ChatDictationButton';
