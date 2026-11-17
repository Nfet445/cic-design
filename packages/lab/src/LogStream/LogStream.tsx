// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file LogStream.tsx
 * @input Uses React, the shared `tw` helper and the class map in
 *   logStreamClasses.ts
 * @output Exports LogStream component, LogStreamProps, LogEntry, LogStreamLevel
 * @position Lab implementation; experimental streaming log viewer
 *
 * Mono grid rows (timestamp | level | source? | message) with level color
 * accents, expandable detail panels, a follow-scroll live-tail mode, and an
 * always-dark "terminal" variant.
 *
 * Known limit: rows are plain DOM (content-visibility: auto for offscreen
 * skip) — there is NO virtualization. Streams beyond a few thousand rows
 * should be windowed by the caller.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/LogStream/LogStream.doc.mjs (props table, notes)
 * - /packages/lab/src/LogStream/LogStream.test.tsx (behavior tests)
 * - /packages/lab/src/LogStream/index.ts (exports if types change)
 * - /apps/storybook/stories/LogStream.stories.tsx (examples and visual coverage)
 */

'use client';

import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';

import type {BaseProps} from '@astryxdesign/core';
import {mergeProps, themeProps} from '@astryxdesign/core/utils';
import {tw} from '../tw';
import {
  logStreamClassName,
  logStreamColumnsFullClassName,
  logStreamColumnsMessageOnlyClassName,
  logStreamColumnsWithoutSourceClassName,
  logStreamColumnsWithoutTimestampClassName,
  logStreamDetailClassName,
  logStreamDetailTerminalClassName,
  logStreamJumpToLatestClassName,
  logStreamJumpToLatestTerminalClassName,
  logStreamLevelClassName,
  logStreamLevelDebugClassName,
  logStreamLevelDebugTerminalClassName,
  logStreamLevelErrorClassName,
  logStreamLevelErrorTerminalClassName,
  logStreamLevelInfoClassName,
  logStreamLevelInfoTerminalClassName,
  logStreamLevelWarnClassName,
  logStreamLevelWarnTerminalClassName,
  logStreamMessageClassName,
  logStreamMessageErrorTerminalClassName,
  logStreamMessageTerminalClassName,
  logStreamMessageWarnTerminalClassName,
  logStreamRowButtonClassName,
  logStreamRowButtonHoverClassName,
  logStreamRowButtonHoverTerminalClassName,
  logStreamRowClassName,
  logStreamRowErrorClassName,
  logStreamRowTerminalClassName,
  logStreamRowWarnClassName,
  logStreamScrollerClassName,
  logStreamSourceClassName,
  logStreamSourceTerminalClassName,
  logStreamTerminalClassName,
  logStreamTimestampClassName,
  logStreamTimestampTerminalClassName,
} from './logStreamClasses';

/** Severity of one log entry. */
export type LogStreamLevel = 'info' | 'warn' | 'error' | 'debug';

/** One row in the stream; all strings are pre-formatted by the caller. */
export interface LogEntry {
  /** Stable unique key, e.g. `"req-1042"`. */
  id: string;
  /** Pre-formatted timestamp, e.g. `"14:02:11.482"`. Deterministic. */
  timestamp: string;
  level: LogStreamLevel;
  message: string;
  /** Emitting service/component, e.g. `"api-gateway"`. */
  source?: string;
  /** When set, the row becomes a disclosure button for this panel. */
  detail?: ReactNode;
}

export interface LogStreamProps extends Omit<
  BaseProps<HTMLDivElement>,
  'children'
> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /** Log rows, oldest first (live tails append at the end). */
  entries: LogEntry[];
  /**
   * Visual treatment. `'terminal'` renders dark chrome regardless of the
   * active color scheme (terminal output is a brand surface, like a real
   * shell — light-mode terminals read as broken builds).
   * @default 'default'
   */
  variant?: 'default' | 'terminal';
  /**
   * Pin scroll to the newest entry as entries append. Unpins when the user
   * scrolls up; re-pin via the "Jump to latest" affordance. Controlled when
   * provided; uncontrolled (initially unpinned) otherwise.
   */
  isFollowing?: boolean;
  /** Called when follow-pinning changes (user scroll-up or "Jump to latest"). */
  onFollowChange?: (following: boolean) => void;
  /** Max height of the scroll area before it scrolls. */
  maxHeight?: number | string;
  /** Show the timestamp column. @default true */
  hasTimestamps?: boolean;
  /** Accessible label for the log region. @default 'Log stream' */
  label?: string;
  /** Escape hatch: fully replace the default row for an entry. */
  renderEntry?: (entry: LogEntry) => ReactNode;
}

/** User counts as "scrolled away" beyond this distance from the bottom. */
const FOLLOW_THRESHOLD_PX = 24;

/** The scroller's height cap rides a private variable its class reads. */
type ScrollerStyle = React.CSSProperties &
  Record<'--astryx-log-stream-max-height', string>;

const LEVEL_CLASSNAME: Record<LogStreamLevel, string> = {
  info: logStreamLevelInfoClassName,
  warn: logStreamLevelWarnClassName,
  error: logStreamLevelErrorClassName,
  debug: logStreamLevelDebugClassName,
};

const LEVEL_TERMINAL_CLASSNAME: Record<LogStreamLevel, string> = {
  info: logStreamLevelInfoTerminalClassName,
  warn: logStreamLevelWarnTerminalClassName,
  error: logStreamLevelErrorTerminalClassName,
  debug: logStreamLevelDebugTerminalClassName,
};

/**
 * Experimental streaming log viewer: mono grid rows
 * (timestamp | level | source | message) with token-derived level accents,
 * expandable per-row detail panels, follow-scroll live tailing with a
 * "Jump to latest" affordance, and an always-dark terminal variant.
 *
 * Appended rows fade in via `@starting-style` (instant under
 * prefers-reduced-motion). Follow pinning uses a scroll listener — no
 * polling; rows use `content-visibility: auto` for offscreen skip but are
 * NOT virtualized (window large streams in the caller).
 *
 * Live announcements are tied to follow pinning: the `role="log"` region is
 * `aria-live="polite"` only while following the tail and `aria-live="off"`
 * while unfollowed, so appends never flood assistive tech.
 *
 * @example
 * ```
 * <LogStream
 *   entries={entries}
 *   maxHeight={480}
 *   isFollowing={isFollowing}
 *   onFollowChange={setIsFollowing}
 * />
 * ```
 */
export function LogStream({
  entries,
  variant = 'default',
  isFollowing,
  onFollowChange,
  maxHeight,
  hasTimestamps = true,
  label = 'Log stream',
  renderEntry,
  xstyle,
  className,
  style,
  ref,
  ...rest
}: LogStreamProps) {
  const isTerminal = variant === 'terminal';
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  // Follow pinning: controlled when the prop is provided, else internal.
  const [internalFollowing, setInternalFollowing] = useState(
    isFollowing ?? false,
  );
  const following = isFollowing ?? internalFollowing;
  const setFollowing = (next: boolean) => {
    if (next === following) {
      return;
    }
    if (isFollowing == null) {
      setInternalFollowing(next);
    }
    onFollowChange?.(next);
  };

  // Whether the viewport currently sits at the bottom; drives the
  // "Jump to latest" affordance. Updated from scroll events only.
  const [isAtBottom, setIsAtBottom] = useState(true);

  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const hasSource = useMemo(
    () => entries.some(entry => entry.source != null),
    [entries],
  );

  // Pin to the newest row while following. Direct scrollTop assignment (not
  // smooth scrollTo) so rapid appends never queue competing animations.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!following || el == null) {
      return;
    }
    el.scrollTop = el.scrollHeight;
    setIsAtBottom(true);
  }, [following, entries.length]);

  // No programmatic-scroll guard is needed: pinning always lands the
  // viewport at the bottom, and the unpin branch below only fires when the
  // viewport is AWAY from the bottom — a programmatic echo is a no-op.
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distanceFromBottom <= FOLLOW_THRESHOLD_PX;
    setIsAtBottom(atBottom);
    // User scrolled away from the tail: unpin. Re-pinning is explicit via
    // the "Jump to latest" affordance (never implicit on scroll-down).
    if (following && !atBottom) {
      setFollowing(false);
    }
  };

  const handleJumpToLatest = () => {
    setFollowing(true);
    const el = scrollerRef.current;
    if (el != null) {
      el.scrollTop = el.scrollHeight;
      setIsAtBottom(true);
    }
  };

  const columnsClassName = hasTimestamps
    ? hasSource
      ? logStreamColumnsFullClassName
      : logStreamColumnsWithoutSourceClassName
    : hasSource
      ? logStreamColumnsWithoutTimestampClassName
      : logStreamColumnsMessageOnlyClassName;

  const renderDefaultRow = (entry: LogEntry) => {
    const isExpandable = entry.detail != null;
    const isExpanded = isExpandable && expandedIds.has(entry.id);
    const rowClassName = tw(
      isTerminal ? logStreamRowTerminalClassName : logStreamRowClassName,
      columnsClassName,
      !isTerminal && entry.level === 'error' && logStreamRowErrorClassName,
      !isTerminal && entry.level === 'warn' && logStreamRowWarnClassName,
    );
    const cells = (
      <>
        {hasTimestamps && (
          <span
            className={tw(
              isTerminal
                ? logStreamTimestampTerminalClassName
                : logStreamTimestampClassName,
            )}>
            {entry.timestamp}
          </span>
        )}
        <span
          className={tw(
            logStreamLevelClassName,
            (isTerminal ? LEVEL_TERMINAL_CLASSNAME : LEVEL_CLASSNAME)[
              entry.level
            ],
          )}>
          {entry.level}
        </span>
        {hasSource && (
          <span
            className={tw(
              isTerminal
                ? logStreamSourceTerminalClassName
                : logStreamSourceClassName,
            )}
            title={entry.source}>
            {entry.source}
          </span>
        )}
        <span
          className={tw(
            logStreamMessageClassName,
            isTerminal &&
              (entry.level === 'error'
                ? logStreamMessageErrorTerminalClassName
                : entry.level === 'warn'
                  ? logStreamMessageWarnTerminalClassName
                  : logStreamMessageTerminalClassName),
          )}>
          {entry.message}
        </span>
      </>
    );
    const detailClassName = isTerminal
      ? logStreamDetailTerminalClassName
      : logStreamDetailClassName;
    if (!isExpandable) {
      return (
        <div data-level={entry.level} className={rowClassName}>
          {cells}
        </div>
      );
    }
    return (
      <>
        <button
          type="button"
          aria-expanded={isExpanded}
          data-level={entry.level}
          onClick={() => toggleExpanded(entry.id)}
          className={tw(
            rowClassName,
            logStreamRowButtonClassName,
            isTerminal
              ? logStreamRowButtonHoverTerminalClassName
              : logStreamRowButtonHoverClassName,
          )}>
          {cells}
        </button>
        {isExpanded && <div className={detailClassName}>{entry.detail}</div>}
      </>
    );
  };

  const scrollerStyle: ScrollerStyle | undefined =
    maxHeight == null
      ? undefined
      : {
          '--astryx-log-stream-max-height':
            typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
        };

  return (
    <div
      ref={ref}
      {...rest}
      {...mergeProps(
        themeProps('log-stream', {variant}),
        stylex.props(xstyle),
        tw(
          isTerminal ? logStreamTerminalClassName : logStreamClassName,
          className,
        ),
        style,
      )}>
      <div
        ref={scrollerRef}
        role="log"
        aria-label={label}
        // role="log" is implicitly aria-live="polite" — on a busy stream that
        // floods assistive tech with every appended row (WCAG 2.2.2 / 4.1.3).
        // Follow-pinning doubles as the mute switch: while the user is away
        // from the tail (unfollowed), the region is aria-live="off"; resuming
        // follow ("Jump to latest") restores polite announcements.
        aria-live={following ? 'polite' : 'off'}
        onScroll={handleScroll}
        className={logStreamScrollerClassName}
        style={scrollerStyle}>
        {entries.map(entry => (
          <Fragment key={entry.id}>
            {renderEntry != null ? renderEntry(entry) : renderDefaultRow(entry)}
          </Fragment>
        ))}
      </div>
      {!following && !isAtBottom && entries.length > 0 && (
        <button
          type="button"
          onClick={handleJumpToLatest}
          className={tw(
            isTerminal
              ? logStreamJumpToLatestTerminalClassName
              : logStreamJumpToLatestClassName,
          )}>
          Jump to latest ↓
        </button>
      )}
    </div>
  );
}

LogStream.displayName = 'LogStream';
