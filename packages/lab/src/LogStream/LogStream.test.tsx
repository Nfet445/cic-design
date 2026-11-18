// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {LogStream, type LogEntry} from './LogStream';
import {
  logStreamClassName,
  logStreamColumnsFullClassName,
  logStreamLevelClassName,
  logStreamLevelErrorTerminalClassName,
  logStreamLevelInfoClassName,
  logStreamMessageClassName,
  logStreamMessageErrorTerminalClassName,
  logStreamMessageTerminalClassName,
  logStreamRowButtonClassName,
  logStreamRowButtonHoverClassName,
  logStreamRowClassName,
  logStreamRowErrorClassName,
  logStreamRowTerminalClassName,
  logStreamRowWarnClassName,
  logStreamScrollerClassName,
  logStreamTerminalClassName,
} from './logStreamClasses';

const ENTRIES: LogEntry[] = [
  {
    id: 'a',
    timestamp: '14:02:11.482',
    level: 'info',
    source: 'api-gateway',
    message: 'request accepted',
  },
  {
    id: 'b',
    timestamp: '14:02:11.617',
    level: 'warn',
    source: 'billing',
    message: 'retrying upstream call',
  },
  {
    id: 'c',
    timestamp: '14:02:12.044',
    level: 'error',
    source: 'billing',
    message: 'upstream call failed',
    detail: <div>stack: billing.charge failed with 502</div>,
  },
  {
    id: 'd',
    timestamp: '14:02:12.371',
    level: 'debug',
    source: 'api-gateway',
    message: 'connection pool at 40%',
  },
];

/** A map entry is a space-separated list, so every token has to be present. */
function carries(element: Element | null | undefined, mapClassName: string) {
  const classes = new Set(element?.classList);
  return mapClassName.split(' ').every(className => classes.has(className));
}

/** jsdom has no layout: fake the scroll geometry on the log scroller. */
function setScrollMetrics(
  el: HTMLElement,
  {scrollHeight, clientHeight}: {scrollHeight: number; clientHeight: number},
) {
  Object.defineProperty(el, 'scrollHeight', {
    value: scrollHeight,
    configurable: true,
  });
  Object.defineProperty(el, 'clientHeight', {
    value: clientHeight,
    configurable: true,
  });
}

describe('LogStream', () => {
  it('renders one row per entry with level and message', () => {
    render(<LogStream entries={ENTRIES} />);
    expect(screen.getByText('request accepted')).toBeInTheDocument();
    expect(screen.getByText('retrying upstream call')).toBeInTheDocument();
    expect(screen.getByText('upstream call failed')).toBeInTheDocument();
    expect(screen.getByText('connection pool at 40%')).toBeInTheDocument();
    expect(screen.getByText('info')).toBeInTheDocument();
    expect(screen.getByText('warn')).toBeInTheDocument();
    expect(screen.getByText('error')).toBeInTheDocument();
    expect(screen.getByText('debug')).toBeInTheDocument();
    // Level lands on the row element for theming hooks.
    expect(
      screen.getByText('upstream call failed').closest('[data-level]'),
    ).toHaveAttribute('data-level', 'error');
  });

  it('exposes the scroller as an accessible log region', () => {
    render(<LogStream entries={ENTRIES} label="Build output" />);
    expect(screen.getByRole('log', {name: 'Build output'})).toBeInTheDocument();
  });

  it('renders timestamps by default and hides them with hasTimestamps={false}', () => {
    const {rerender} = render(<LogStream entries={ENTRIES} />);
    expect(screen.getByText('14:02:11.482')).toBeInTheDocument();
    rerender(<LogStream entries={ENTRIES} hasTimestamps={false} />);
    expect(screen.queryByText('14:02:11.482')).not.toBeInTheDocument();
  });

  it('expands and collapses detail rows via the row button', async () => {
    const user = userEvent.setup();
    render(<LogStream entries={ENTRIES} />);
    // Only the entry with `detail` renders as a disclosure button.
    const row = screen.getByRole('button', {expanded: false});
    expect(row).toHaveTextContent('upstream call failed');
    expect(
      screen.queryByText('stack: billing.charge failed with 502'),
    ).not.toBeInTheDocument();

    await user.click(row);
    expect(row).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByText('stack: billing.charge failed with 502'),
    ).toBeInTheDocument();

    await user.click(row);
    expect(row).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByText('stack: billing.charge failed with 502'),
    ).not.toBeInTheDocument();
  });

  it('pins scroll to the bottom on append while following', () => {
    const {rerender} = render(
      <LogStream entries={ENTRIES} isFollowing maxHeight={200} />,
    );
    const scroller = screen.getByRole('log');
    setScrollMetrics(scroller, {scrollHeight: 1000, clientHeight: 200});

    const appended: LogEntry[] = [
      ...ENTRIES,
      {
        id: 'e',
        timestamp: '14:02:13.005',
        level: 'info',
        source: 'api-gateway',
        message: 'request completed',
      },
    ];
    rerender(<LogStream entries={appended} isFollowing maxHeight={200} />);
    expect(scroller.scrollTop).toBe(1000);
  });

  it('unpins when the user scrolls away from the bottom', () => {
    const onFollowChange = vi.fn();
    render(
      <LogStream
        entries={ENTRIES}
        isFollowing
        onFollowChange={onFollowChange}
        maxHeight={200}
      />,
    );
    const scroller = screen.getByRole('log');
    setScrollMetrics(scroller, {scrollHeight: 1000, clientHeight: 200});

    // User drags the scrollbar far above the tail.
    scroller.scrollTop = 100;
    fireEvent.scroll(scroller);
    expect(onFollowChange).toHaveBeenCalledWith(false);
  });

  it('does not unpin on scroll events that stay at the bottom', () => {
    const onFollowChange = vi.fn();
    render(
      <LogStream
        entries={ENTRIES}
        isFollowing
        onFollowChange={onFollowChange}
        maxHeight={200}
      />,
    );
    const scroller = screen.getByRole('log');
    setScrollMetrics(scroller, {scrollHeight: 1000, clientHeight: 200});

    scroller.scrollTop = 800; // exactly at the bottom
    fireEvent.scroll(scroller);
    expect(onFollowChange).not.toHaveBeenCalled();
  });

  it('re-pins via the "Jump to latest" affordance', () => {
    const onFollowChange = vi.fn();
    render(
      <LogStream
        entries={ENTRIES}
        isFollowing={false}
        onFollowChange={onFollowChange}
        maxHeight={200}
      />,
    );
    const scroller = screen.getByRole('log');
    setScrollMetrics(scroller, {scrollHeight: 1000, clientHeight: 200});

    // No affordance while the viewport is (assumed) at the bottom.
    expect(
      screen.queryByRole('button', {name: /jump to latest/i}),
    ).not.toBeInTheDocument();

    scroller.scrollTop = 0;
    fireEvent.scroll(scroller);
    const jump = screen.getByRole('button', {name: /jump to latest/i});
    fireEvent.click(jump);
    expect(onFollowChange).toHaveBeenCalledWith(true);
    expect(scroller.scrollTop).toBe(1000);
  });

  it('supports uncontrolled follow state', () => {
    const {rerender} = render(<LogStream entries={ENTRIES} maxHeight={200} />);
    const scroller = screen.getByRole('log');
    setScrollMetrics(scroller, {scrollHeight: 1000, clientHeight: 200});

    // Unfollowed by default: appends do not move the viewport.
    scroller.scrollTop = 100;
    fireEvent.scroll(scroller);
    rerender(
      <LogStream
        entries={[
          ...ENTRIES,
          {id: 'e', timestamp: '14:02:13.005', level: 'info', message: 'tick'},
        ]}
        maxHeight={200}
      />,
    );
    expect(scroller.scrollTop).toBe(100);

    // Jump to latest pins; the next append follows.
    fireEvent.click(screen.getByRole('button', {name: /jump to latest/i}));
    expect(scroller.scrollTop).toBe(1000);
    rerender(
      <LogStream
        entries={[
          ...ENTRIES,
          {id: 'e', timestamp: '14:02:13.005', level: 'info', message: 'tick'},
          {id: 'f', timestamp: '14:02:14.005', level: 'info', message: 'tock'},
        ]}
        maxHeight={200}
      />,
    );
    expect(scroller.scrollTop).toBe(1000);
  });

  it('mutes live announcements while unfollowed and restores them while following (controlled)', () => {
    const {rerender} = render(
      <LogStream entries={ENTRIES} isFollowing={false} />,
    );
    const log = screen.getByRole('log');
    expect(log).toHaveAttribute('aria-live', 'off');
    rerender(<LogStream entries={ENTRIES} isFollowing />);
    expect(log).toHaveAttribute('aria-live', 'polite');
  });

  it('unmutes the live region when "Jump to latest" resumes following (uncontrolled)', () => {
    render(<LogStream entries={ENTRIES} maxHeight={200} />);
    const log = screen.getByRole('log');
    // Initially unpinned — the stream must not announce.
    expect(log).toHaveAttribute('aria-live', 'off');
    // Scroll away from the tail so the "Jump to latest" affordance appears.
    setScrollMetrics(log, {scrollHeight: 1000, clientHeight: 200});
    log.scrollTop = 100;
    fireEvent.scroll(log);
    expect(log).toHaveAttribute('aria-live', 'off');
    // Re-pinning restores polite announcements.
    fireEvent.click(screen.getByRole('button', {name: /jump to latest/i}));
    expect(log).toHaveAttribute('aria-live', 'polite');
  });

  it('renderEntry replaces the default row', () => {
    render(
      <LogStream
        entries={ENTRIES}
        renderEntry={entry => <div>CUSTOM {entry.id}</div>}
      />,
    );
    expect(screen.getByText('CUSTOM a')).toBeInTheDocument();
    expect(screen.getByText('CUSTOM c')).toBeInTheDocument();
    expect(screen.queryByText('request accepted')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('holds the class map on the frame, the scroller and the rows', () => {
    const {container} = render(<LogStream entries={ENTRIES} maxHeight={320} />);
    const scroller = screen.getByRole('log');
    expect(carries(scroller.parentElement, logStreamClassName)).toBe(true);
    expect(carries(scroller, logStreamScrollerClassName)).toBe(true);
    expect(
      scroller.style.getPropertyValue('--astryx-log-stream-max-height'),
    ).toBe('320px');

    // Timestamp, level, source and message are all visible, so the row uses
    // the four-column template.
    const rows = container.querySelectorAll('[data-level]');
    expect(rows).toHaveLength(ENTRIES.length);
    for (const row of rows) {
      expect(carries(row, logStreamRowClassName)).toBe(true);
      expect(carries(row, logStreamColumnsFullClassName)).toBe(true);
    }
  });

  it('gives each level wash its own row class', () => {
    const {container} = render(<LogStream entries={ENTRIES} />);
    const warn = container.querySelector('[data-level="warn"]');
    const error = container.querySelector('[data-level="error"]');
    const info = container.querySelector('[data-level="info"]');
    expect(carries(warn, logStreamRowWarnClassName)).toBe(true);
    expect(carries(warn, logStreamRowErrorClassName)).toBe(false);
    expect(carries(error, logStreamRowErrorClassName)).toBe(true);
    expect(carries(info, logStreamRowErrorClassName)).toBe(false);
    expect(carries(info, logStreamRowWarnClassName)).toBe(false);
  });

  it('carries the disclosure affordance on the expandable row only', () => {
    const {container} = render(<LogStream entries={ENTRIES} />);
    const row = screen.getByRole('button', {expanded: false});
    expect(carries(row, logStreamRowButtonClassName)).toBe(true);
    expect(carries(row, logStreamRowButtonHoverClassName)).toBe(true);
    expect(
      carries(
        container.querySelector('[data-level="info"]'),
        logStreamRowButtonClassName,
      ),
    ).toBe(false);
  });

  it('replaces the row and cell colours in the terminal variant', () => {
    render(<LogStream entries={ENTRIES} variant="terminal" />);
    const scroller = screen.getByRole('log');
    expect(carries(scroller.parentElement, logStreamTerminalClassName)).toBe(
      true,
    );
    // The terminal row is one complete class: it never stacks the plain row.
    const row = screen.getByText('request accepted').closest('[data-level]');
    expect(carries(row, logStreamRowTerminalClassName)).toBe(true);
    expect(carries(row, logStreamRowClassName)).toBe(false);
    // One colour class per cell: the level keeps its label class, and the
    // error message takes the error colour instead of the plain one.
    const level = screen.getByText('error');
    expect(carries(level, logStreamLevelClassName)).toBe(true);
    expect(carries(level, logStreamLevelErrorTerminalClassName)).toBe(true);
    const message = screen.getByText('upstream call failed');
    expect(carries(message, logStreamMessageClassName)).toBe(true);
    expect(carries(message, logStreamMessageErrorTerminalClassName)).toBe(true);
    expect(carries(message, logStreamMessageTerminalClassName)).toBe(false);
    expect(carries(screen.getByText('info'), logStreamLevelInfoClassName)).toBe(
      false,
    );
  });
});
