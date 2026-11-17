// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TimestampHoverCard.tsx
 * @input Uses React, useHoverCard, a stable time ref, IconButton, the theme's
 *   `timestamp-copy` icon slot, formatted lines
 * @output Default-exports the lazily-loaded copyable hover card for Timestamp
 * @position Split out of Timestamp so the overlay (HoverCard) and the copy
 *   affordance's Icon/IconButton load only when a card is actually shown — the
 *   default, card-less Timestamp never bundles this chunk.
 *
 * Layout: a semantic `<dl>` laid out as a grid. Labelled cards use three
 *   columns — label, value, and a trailing action column for copy buttons —
 *   so the buttons align down a single column no matter how wide each value
 *   is. The action column is only added when at least one row is copyable, so
 *   a fully read-only card carries no dangling gutter. A copy button sits
 *   inside its row's value, which spans the value and action columns through
 *   a subgrid. A row without a label is named by its zone's long name, which
 *   is visually hidden. A card with no labels drops the label column.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Timestamp/Timestamp.tsx (the persistent trigger and lazy attachment)
 * - /packages/core/src/Timestamp/Timestamp.doc.mjs (theming.targets)
 * - /packages/core/src/Timestamp/Timestamp.test.tsx
 */

import type {ReactNode, RefObject} from 'react';
import {useCallback, useRef} from 'react';
import {useHoverCard} from '../HoverCard/useHoverCard';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {IconButton} from '../IconButton/IconButton';
import {ComponentIcon} from '../Icon/ComponentIcon';
import {useClipboardCopy} from '../hooks/useClipboard';
import {themeProps} from '../utils/themeProps';
import {VisuallyHidden} from '../VisuallyHidden/VisuallyHidden';
import {tw} from '../utils/tw';
import {
  timestampHoverCardActionClassName,
  timestampHoverCardGridTemplateClassName,
  timestampHoverCardLabelClassName,
  timestampHoverCardListClassName,
  timestampHoverCardRowClassName,
  timestampHoverCardValueCellsClassName,
  timestampHoverCardValueClassName,
} from './timestampHoverCardClasses';
import type {TimestampTooltipLine} from './tooltipEntries';
import {
  registerEnglishFallback,
  useComponentTranslator,
} from '../i18n/useComponentTranslator';
import english from '../i18n/generated-english/Timestamp/TimestampHoverCard.generated';

registerEnglishFallback(english);

/** How long the copied checkmark stays before reverting to the copy icon. */
const COPY_FEEDBACK_MS = 1500;

/**
 * The per-row copy affordance: a compact ghost `IconButton` that writes the
 * row's value to the clipboard, flips `copy` → `check` for a moment, and
 * announces the copy to a polite live region (a swapped aria-label alone
 * isn't reliably announced). The error detail of a failed write is never
 * shown.
 *
 * Kept as its own component so its state/timer/effect only exist for rows that
 * actually opt into copying — read-only rows render no button and carry none
 * of this machinery.
 */
function CopyButton({value}: {value: string}) {
  const t = useComponentTranslator();
  const copyFailedLabel = t('@astryx.timestamp.copyFailed');
  const {
    copy,
    isCopied: copied,
    isFailed: copyFailed,
  } = useClipboardCopy({
    announce: t('@astryx.timestamp.copied'),
    announceFailure: copyFailedLabel,
    resetAfterMs: COPY_FEEDBACK_MS,
  });

  const handleCopy = useCallback(() => {
    void copy(value);
  }, [copy, value]);

  return (
    <IconButton
      variant="ghost"
      size="sm"
      icon={
        <ComponentIcon
          slot="timestamp-copy"
          state={{copied: copied && !copyFailed}}
          fallback={{
            icon: copyFailed ? 'close' : copied ? 'check' : 'copy',
            size: 'sm',
          }}
          color="inherit"
        />
      }
      // The tooltip stays short. At rest the name carries the full value for
      // assistive technology.
      tooltip={
        copyFailed
          ? copyFailedLabel
          : t(copied ? '@astryx.timestamp.copied' : '@astryx.timestamp.copy')
      }
      label={
        copyFailed
          ? copyFailedLabel
          : copied
            ? t('@astryx.timestamp.copied')
            : t('@astryx.timestamp.copyValue', {value})
      }
      onClick={handleCopy}
      {...themeProps('timestamp-copy-button')}
    />
  );
}

/**
 * One row of the hover card: an optional label, the formatted instant, and —
 * when the card reserves an action column — a trailing action cell holding the
 * copy button (for a copyable row) or nothing (for a read-only row, so the
 * columns stay aligned). Pure presentation: the copy state lives in
 * {@link CopyButton}, which only copyable rows render.
 */
function EntryRow({
  line,
  hasLabelColumn,
  hasActionColumn,
}: {
  line: TimestampTooltipLine;
  hasLabelColumn: boolean;
  hasActionColumn: boolean;
}) {
  // A description list holds only name-value groups, so the action cell lives
  // inside the value. A row without a label is named by its zone, out of
  // sight, so the card looks the same.
  const hasLabel = line.label != null && line.label !== '';
  const hiddenName = <VisuallyHidden>{line.zoneName}</VisuallyHidden>;
  return (
    <div className={timestampHoverCardRowClassName}>
      {hasLabelColumn ? (
        <dt className={timestampHoverCardLabelClassName}>
          {hasLabel ? line.label : hiddenName}
        </dt>
      ) : (
        <VisuallyHidden as="dt">{line.zoneName}</VisuallyHidden>
      )}
      <dd
        className={tw(
          timestampHoverCardValueClassName,
          hasActionColumn && timestampHoverCardValueCellsClassName,
        )}>
        {hasActionColumn ? <span>{line.value}</span> : line.value}
        {hasActionColumn && (
          <span className={timestampHoverCardActionClassName}>
            {line.isCopyable && <CopyButton value={line.value} />}
          </span>
        )}
      </dd>
    </div>
  );
}

export interface TimestampHoverCardProps {
  /** The rows to render, each a labelled instant, optionally copyable. */
  lines: ReadonlyArray<TimestampTooltipLine>;
  /** Accessible name for the card. */
  label: string;
  /** Persistent anchor, rendered outside the lazy boundary. */
  triggerRef: RefObject<HTMLTimeElement | null>;
  /**
   * Reports the open card's id when it shows, and null when it hides, so the
   * time can name it through `aria-controls`.
   */
  onCardOpenChange: (cardId: string | null) => void;
}

function gridTemplateFor(
  hasLabelColumn: boolean,
  hasActionColumn: boolean,
): string {
  if (hasLabelColumn && hasActionColumn) {
    return timestampHoverCardGridTemplateClassName.labelValueAction;
  }
  if (hasLabelColumn) {
    return timestampHoverCardGridTemplateClassName.labelValue;
  }
  if (hasActionColumn) {
    return timestampHoverCardGridTemplateClassName.valueAction;
  }
  return timestampHoverCardGridTemplateClassName.value;
}

/**
 * The copyable hover card for Timestamp. Renders a semantic `<dl>` as a grid:
 * an optional label column, the value, and — when any row is copyable — a
 * trailing action column carrying that row's copy button, so buttons align
 * down one column. With a single default line this is a one-row card carrying
 * the full absolute time, copyable. Opens on hover and on keyboard focus (the
 * anchor's tab stop), with a dashed-underline affordance signalling it is
 * interactive.
 */
export default function TimestampHoverCard({
  lines,
  label,
  triggerRef,
  onCardOpenChange,
}: TimestampHoverCardProps): ReactNode {
  const cardIdRef = useRef<string | null>(null);
  const handleShow = useCallback(() => {
    onCardOpenChange(cardIdRef.current);
  }, [onCardOpenChange]);
  const handleHide = useCallback(() => {
    onCardOpenChange(null);
  }, [onCardOpenChange]);
  const {positionRef, interactionRef, id, show, renderHoverCard} = useHoverCard(
    {
      placement: 'above',
      focusTrigger: 'always',
      label,
      onShow: handleShow,
      onHide: handleHide,
    },
  );

  const didAttachRef = useRef(false);
  // Syncs the hover card's anchor and listeners with the <time> that
  // Timestamp renders outside this lazy module.
  useIsomorphicLayoutEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }
    cardIdRef.current = id;
    positionRef(trigger);
    interactionRef(trigger);
    // Focus can reach the time before this module loads. Open the card only
    // if the time still has focus.
    if (!didAttachRef.current) {
      didAttachRef.current = true;
      if (trigger.ownerDocument.activeElement === trigger) {
        show();
      }
    }
    return () => {
      positionRef(null);
      interactionRef(null);
    };
  }, [triggerRef, positionRef, interactionRef, show, id]);

  // A label column is only reserved when some row is labelled; otherwise the
  // value sits flush at the card's leading edge. An action column is only
  // reserved when some row is copyable (option B), so a fully read-only card
  // has no trailing gutter.
  const hasLabelColumn = lines.some(
    line => line.label != null && line.label !== '',
  );
  const hasActionColumn = lines.some(line => line.isCopyable);

  const cardContent = (
    <dl
      className={tw(
        timestampHoverCardListClassName,
        gridTemplateFor(hasLabelColumn, hasActionColumn),
      )}>
      {lines.map((line, index) => (
        <EntryRow
          // eslint-disable-next-line @eslint-react/no-array-index-key -- rows are fixed positional slots and two entries may legitimately be identical
          key={index}
          line={line}
          hasLabelColumn={hasLabelColumn}
          hasActionColumn={hasActionColumn}
        />
      ))}
    </dl>
  );

  return renderHoverCard(cardContent);
}

TimestampHoverCard.displayName = 'TimestampHoverCard';
