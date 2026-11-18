// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatToolCalls.tsx
 * @input Uses React, StyleX, semantic icon registry, theme tokens
 * @output Exports ChatToolCalls component
 * @position Chat component — displays tool/function call invocations
 *
 * Single component that handles both individual and grouped tool calls.
 * Accepts an array of call data matching the shape LLM APIs already return.
 * Single call renders inline; multiple calls get a collapsible summary.
 *
 * Design rationale: every LLM API (Vercel AI SDK, Anthropic, OpenAI)
 * returns tool calls as an array on the message. One component with a
 * data prop matches that shape directly — no nested compound components
 * for builders to wire up.
 */

import React, {useState, useCallback, useId, type ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import * as stylex from '@stylexjs/stylex';
import {getKey, mergeProps} from '../utils';
import {tw} from '../utils/tw';
import {
  chatFocusRingInsetClassName,
  chatToolCallsChevronClassName,
  chatToolCallsChevronOpenClassName,
  chatToolCallsCountClassName,
  chatToolCallsDetailChevronClassName,
  chatToolCallsDetailContentClassName,
  chatToolCallsDurationClassName,
  chatToolCallsGroupContentClassName,
  chatToolCallsGroupContentInnerClassName,
  chatToolCallsGroupHeaderClassName,
  chatToolCallsGroupIconClassName,
  chatToolCallsGroupLabelClassName,
  chatToolCallsListClassName,
  chatToolCallsNameClassName,
  chatToolCallsNodePillClassName,
  chatToolCallsRootClassName,
  chatToolCallsRowClassName,
  chatToolCallsRowClickableClassName,
  chatToolCallsStatsAdditionsClassName,
  chatToolCallsStatsClassName,
  chatToolCallsStatsDeletionsClassName,
  chatToolCallsStatusClassName,
  chatToolCallsStatusIconClassName,
  chatToolCallsTargetClassName,
} from './chatClasses';
import {Badge} from '../Badge';
import {Icon, type IconName} from '../Icon';
import {Spinner} from '../Spinner';
import {VisuallyHidden} from '../VisuallyHidden';
import {themeProps} from '../utils/themeProps';
import {focusOutlineFocusVisibleClassName} from '../utils/focusOutlineClasses';
import {
  registerEnglishFallback,
  useComponentTranslator,
} from '../i18n/useComponentTranslator';
import english from '../i18n/generated-english/Chat/ChatToolCalls.generated';

registerEnglishFallback(english);

// =============================================================================
// Types
// =============================================================================

export type ChatToolCallStatus = 'pending' | 'running' | 'complete' | 'error';

export interface ChatToolCallItem {
  /** Tool/function name. */
  name: string;
  /** Current execution status. @default 'complete' */
  status?: ChatToolCallStatus;
  /** The target of the action (e.g. "Button.tsx", "yarn test", "CSS anchor positioning"). */
  target?: string;
  /** Duration string (e.g. "1.2s", "340ms"). Shown when complete. */
  duration?: string;
  /** Sandbox/node name (e.g. "navi", "xds"). Shown as a pill badge. */
  node?: string;
  /** Lines/characters added. Rendered in green (e.g. "+12"). */
  additions?: number;
  /** Lines/characters removed. Rendered in red (e.g. "-3"). */
  deletions?: number;
  /** Additional info rendered after the label. Free-form ReactNode. */
  stats?: ReactNode;
  /**
   * Error message when status is 'error'. Exposed as visually hidden text in
   * the row for assistive technology and echoed in a hover tooltip on the
   * status icon.
   */
  errorMessage?: string;
  /** Unique key for React list rendering. Derived from stable metadata if omitted. */
  key?: string;
  /** Arbitrary caller data retained with the call item. */
  data?: unknown;
  /** Inline detail content shown when the row is expanded (e.g. code diff, command output). */
  resultDetail?: ReactNode;
}

export interface ChatToolCallsProps extends BaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  /** Array of tool call data. */
  calls: ChatToolCallItem[];
  /** Custom summary label shown for an expanded group. */
  label?: string;
  /** Whether the group is expanded. Uncontrolled by default. */
  isExpanded?: boolean;
  /** Default expanded state when uncontrolled. @default false */
  defaultIsExpanded?: boolean;
  /** Callback when expanded state changes. */
  onExpandedChange?: (isExpanded: boolean) => void;
}

// =============================================================================
// =============================================================================
// Styles
// =============================================================================

// =============================================================================
// Status Icons
// =============================================================================

const STATUS_ICON_NAMES: Record<ChatToolCallStatus, IconName | null> = {
  pending: 'clock',
  running: null,
  complete: 'success',
  error: 'error',
};

const STATUS_STYLES = chatToolCallsStatusClassName;

function getStatusAnnouncement(
  t: ReturnType<typeof useComponentTranslator>,
  status: ChatToolCallStatus,
  errorMessage?: string,
): string {
  if (status === 'error' && errorMessage != null) {
    return t('@astryx.chatToolCalls.error', {message: errorMessage});
  }
  switch (status) {
    case 'pending':
      return t('@astryx.chatToolCalls.status.pending');
    case 'running':
      return t('@astryx.chatToolCalls.status.running');
    case 'complete':
      return t('@astryx.chatToolCalls.status.complete');
    case 'error':
      return t('@astryx.chatToolCalls.status.error');
  }
}

function getToolCallKey(call: ChatToolCallItem): string {
  return getKey(call.key, () =>
    [
      call.name,
      call.status ?? 'complete',
      call.target ?? '',
      call.node ?? '',
      call.duration ?? '',
      call.additions?.toString() ?? '',
      call.deletions?.toString() ?? '',
      call.errorMessage ?? '',
    ].join('\u001F'),
  );
}

// =============================================================================
// Internal: single call row
// =============================================================================

function CallRow({
  call,
  hasClippedFocusRing = false,
}: {
  call: ChatToolCallItem;
  hasClippedFocusRing?: boolean;
}) {
  const t = useComponentTranslator();
  const status = call.status ?? 'complete';
  const hasDetail = call.resultDetail != null;
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const detailId = useId();
  const statusAnnouncement = getStatusAnnouncement(
    t,
    status,
    call.errorMessage,
  );

  const toggleDetail = hasDetail
    ? () => setIsDetailOpen(prev => !prev)
    : undefined;

  const row = (
    <div
      role={hasDetail ? 'button' : undefined}
      tabIndex={hasDetail ? 0 : undefined}
      aria-expanded={hasDetail ? isDetailOpen : undefined}
      aria-controls={hasDetail && isDetailOpen ? detailId : undefined}
      onClick={toggleDetail}
      onKeyDown={
        hasDetail
          ? (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleDetail?.();
              }
            }
          : undefined
      }
      {...mergeProps(
        tw(
          chatToolCallsRowClassName,
          hasDetail && chatToolCallsRowClickableClassName,
          hasDetail && hasClippedFocusRing && chatFocusRingInsetClassName,
          focusOutlineFocusVisibleClassName,
        ),
      )}>
      <span
        title={status === 'error' ? call.errorMessage : undefined}
        className={tw(chatToolCallsStatusIconClassName, STATUS_STYLES[status])}>
        {status === 'running' ? (
          <Spinner size="sm" shade="subtle" aria-hidden="true" />
        ) : status === 'pending' ? (
          <Spinner size="sm" shade="subtle" aria-hidden="true" />
        ) : (
          <Icon
            icon={STATUS_ICON_NAMES[status] ?? 'success'}
            size="xsm"
            color="inherit"
          />
        )}
        <VisuallyHidden>{statusAnnouncement}</VisuallyHidden>
      </span>
      <span className={chatToolCallsNameClassName}>{call.name}</span>
      {call.node != null && (
        <Badge
          label={call.node}
          variant="neutral"
          className={chatToolCallsNodePillClassName}
        />
      )}
      {/* eslint-disable-next-line @astryx/no-nullish-jsx-guard -- `target` is a string field: an empty string still marks a target */}
      {call.target != null && (
        <span className={chatToolCallsTargetClassName}>{call.target}</span>
      )}
      {(call.additions != null ||
        call.deletions != null ||
        call.stats != null) && (
        <span className={chatToolCallsStatsClassName}>
          {/* eslint-disable-next-line @astryx/no-nullish-jsx-guard -- `additions` is a count: 0 renders "+0" */}
          {call.additions != null && (
            <span className={chatToolCallsStatsAdditionsClassName}>
              +{call.additions}
            </span>
          )}
          {/* eslint-disable-next-line @astryx/no-nullish-jsx-guard -- `deletions` is a count: 0 renders "-0" */}
          {call.deletions != null && (
            <span className={chatToolCallsStatsDeletionsClassName}>
              -{call.deletions}
            </span>
          )}
          {call.stats}
        </span>
      )}
      {/* eslint-disable-next-line @astryx/no-nullish-jsx-guard -- `duration` is a string field, not a slot */}
      {call.duration != null && status === 'complete' && (
        <span className={chatToolCallsDurationClassName}>{call.duration}</span>
      )}
      {hasDetail && (
        // eslint-disable-next-line @astryx/no-style-only-wrapper -- the wrapper is the glyph's box; the rule reads StyleX objects, not class text.
        <span className={chatToolCallsDetailChevronClassName}>
          <Icon
            icon="chevronDown"
            size="xsm"
            color="inherit"
            className={tw(
              chatToolCallsChevronClassName,
              isDetailOpen && chatToolCallsChevronOpenClassName,
            )}
          />
        </span>
      )}
    </div>
  );

  if (!hasDetail) {
    return row;
  }

  return (
    <div>
      {row}
      {isDetailOpen && (
        <div id={detailId} className={chatToolCallsDetailContentClassName}>
          {call.resultDetail}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Component
// =============================================================================

/**
 * Displays tool/function call invocations from an LLM response.
 *
 * Accepts a `calls` array matching the shape LLM APIs return. Single call
 * renders inline without group chrome. Multiple calls get a collapsible
 * summary header.
 *
 * @example
 * ```
 * <ChatToolCalls
 *   calls={message.toolCalls.map(tc => ({
 *     name: tc.toolName,
 *     status: tc.state,
 *     duration: tc.duration,
 *     resultDetail: <CodeBlock code={tc.args} language="json" />,
 *   }))}
 * />
 * ```
 */
export function ChatToolCalls(props: ChatToolCallsProps) {
  const t = useComponentTranslator();
  const {
    calls,
    label: customLabel,
    isExpanded: controlledExpanded,
    defaultIsExpanded,
    onExpandedChange,
    xstyle,
    className,
    style,
    ref,
    ...rest
  } = props;

  const autoDefault = defaultIsExpanded ?? false;
  const [internalExpanded, setInternalExpanded] = useState(autoDefault);
  const contentId = useId();
  const isControlled = controlledExpanded !== undefined;
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;

  const toggle = useCallback(() => {
    const next = !isExpanded;
    if (!isControlled) {
      setInternalExpanded(next);
    }
    onExpandedChange?.(next);
  }, [isExpanded, isControlled, onExpandedChange]);

  if (calls.length === 0) {
    return null;
  }

  // Single call: render inline, no group chrome
  if (calls.length === 1) {
    return (
      <div
        ref={ref}
        {...mergeProps(
          themeProps('chat-tool-calls'),
          tw(
            chatToolCallsRootClassName,
            xstyle && stylex.props(xstyle).className,
          ),
          className,
          style,
        )}
        {...rest}>
        <CallRow call={calls[0]} />
      </div>
    );
  }

  // Multiple calls: latest call at surface with chevron to expand all
  const latestCall = calls[calls.length - 1];
  const latestStatus = latestCall.status ?? 'complete';
  const latestStatusAnnouncement = getStatusAnnouncement(
    t,
    latestStatus,
    latestCall.errorMessage,
  );

  return (
    <div
      ref={ref}
      {...mergeProps(
        themeProps('chat-tool-calls'),
        tw(
          chatToolCallsRootClassName,
          xstyle && stylex.props(xstyle).className,
        ),
        className,
        style,
      )}
      {...rest}>
      {/* Header: collapsed shows latest call + count, expanded shows summary label */}
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
        {...mergeProps(
          tw(
            chatToolCallsGroupHeaderClassName,
            focusOutlineFocusVisibleClassName,
          ),
        )}>
        {isExpanded ? (
          <>
            {/* eslint-disable-next-line @astryx/no-style-only-wrapper -- the wrapper is the glyph's box; the rule reads StyleX objects, not class text. */}
            <span className={chatToolCallsGroupIconClassName}>
              <Icon icon="wrench" size="sm" color="inherit" />
            </span>
            <span className={chatToolCallsGroupLabelClassName}>
              {customLabel ??
                t('@astryx.chatToolCalls.groupLabel', {count: calls.length})}
            </span>
          </>
        ) : (
          <>
            <span
              className={tw(
                chatToolCallsStatusIconClassName,
                STATUS_STYLES[latestStatus],
              )}>
              {latestStatus === 'running' ? (
                <Spinner size="sm" shade="subtle" aria-hidden="true" />
              ) : latestStatus === 'pending' ? (
                <Spinner size="sm" shade="subtle" aria-hidden="true" />
              ) : (
                <Icon
                  icon={STATUS_ICON_NAMES[latestStatus] ?? 'success'}
                  size="xsm"
                  color="inherit"
                />
              )}
              <VisuallyHidden>{latestStatusAnnouncement}</VisuallyHidden>
            </span>
            <span className={chatToolCallsNameClassName}>
              {latestCall.name}
            </span>
            {/* eslint-disable-next-line @astryx/no-nullish-jsx-guard -- `target` is a string field: an empty string still marks a target */}
            {latestCall.target != null && (
              <span className={chatToolCallsTargetClassName}>
                {latestCall.target}
              </span>
            )}
          </>
        )}
        <span className={chatToolCallsCountClassName}>
          {!isExpanded && (
            <>
              <Icon icon="wrench" size="xsm" color="inherit" />
              {calls.length}
            </>
          )}
        </span>
        {/* eslint-disable-next-line @astryx/no-style-only-wrapper -- the wrapper is the glyph's box; the rule reads StyleX objects, not class text. */}
        <span className={chatToolCallsChevronClassName}>
          <Icon
            icon="chevronDown"
            size="xsm"
            color="inherit"
            className={
              isExpanded ? chatToolCallsChevronOpenClassName : undefined
            }
          />
        </span>
      </div>

      {/* Expanded: all calls with full metadata */}
      <div
        id={contentId}
        inert={isExpanded ? undefined : true}
        className={chatToolCallsGroupContentClassName(isExpanded)}>
        <div className={chatToolCallsGroupContentInnerClassName}>
          <div className={chatToolCallsListClassName}>
            {calls.map(call => (
              <CallRow
                key={getToolCallKey(call)}
                call={call}
                hasClippedFocusRing
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

ChatToolCalls.displayName = 'ChatToolCalls';
