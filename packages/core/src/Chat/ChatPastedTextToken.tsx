// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatPastedTextToken.tsx
 * @input Uses React, Badge, HoverCard, Button, provider-bound translator,
 *   the shared tap stop (`useTapStop`), the class map
 * @output Exports ChatPastedTextToken component
 * @position Inline token for pasted text with hover card preview + expand
 *
 * Hover, or a tap by finger or pen: card with truncated text preview and
 * "Expand" button. Expand replaces the token with the full text in the
 * contentEditable.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Chat/index.ts (exports)
 */

import {Badge} from '../Badge';
import {Button} from '../Button';
import {HoverCard} from '../HoverCard';
import type {TranslatorFn} from '../i18n';
import {useTapStop} from '../Layer/useTouchTrigger';
import {
  registerEnglishFallback,
  useComponentTranslator,
} from '../i18n/useComponentTranslator';
import english from '../i18n/generated-english/Chat/ChatPastedTextToken.generated';
import {
  chatPastedTextFooterClassName,
  chatPastedTextMetaClassName,
  chatPastedTextPreviewClassName,
  chatPastedTextPreviewTextClassName,
} from './chatClasses';

registerEnglishFallback(english);

// =============================================================================
// Types
// =============================================================================

export interface ChatPastedTextTokenProps {
  /** The full pasted text. */
  text: string;
  /** Called when the user clicks Expand — dissolves the token into editable text. */
  onExpand?: () => void;
}

// =============================================================================
// Helpers
// =============================================================================

function formatLabel(text: string, t: TranslatorFn): string {
  return t('@astryx.chat.pastedText.label', {
    lines: text.split('\n').length,
    chars: text.length,
  });
}

// =============================================================================
// Component
// =============================================================================

export function ChatPastedTextToken({
  text,
  onExpand,
}: ChatPastedTextTokenProps) {
  const t = useComponentTranslator();
  const label = formatLabel(text, t);
  // A tap on the token, by finger or pen, asks for its preview, so it stops
  // there: cancelling the mouse press the browser makes of it keeps the
  // composer around the token from taking focus and the caret, which on a
  // touch device raises the keyboard over the preview. The tap's click still
  // reaches the card's trigger. A mouse press still places the caret, and
  // hover opens the preview.
  const tapStop = useTapStop('mousedown');

  const cardContent = (
    <div className={chatPastedTextPreviewClassName}>
      <div className={chatPastedTextPreviewTextClassName}>{text}</div>
      <div className={chatPastedTextFooterClassName}>
        <span className={chatPastedTextMetaClassName}>{label}</span>
        {onExpand && (
          <Button
            label={t('@astryx.chat.pastedText.expand')}
            variant="ghost"
            size="sm"
            onClick={onExpand}
          />
        )}
      </div>
    </div>
  );

  return (
    <HoverCard
      content={cardContent}
      placement="above"
      alignment="start"
      hasHoverIndication={false}>
      <Badge label={label} variant="neutral" {...tapStop} />
    </HoverCard>
  );
}

ChatPastedTextToken.displayName = 'ChatPastedTextToken';
