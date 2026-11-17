// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file logStreamClasses.ts
 * @input Accepts nothing: every class is fixed except the column templates and
 *   the level/terminal variants; the scroller's height cap is a private
 *   variable the markup sets inline
 * @output The utility class strings the frame, the scroller, a row (both
 *   variants, all four column sets, the two level washes), its cells, the
 *   detail panel and the "Jump to latest" affordance carry
 * @position Style primitives; the Tailwind build scans it for class names
 *
 * The terminal variant is always dark, so it sets fixed near-black greys
 * instead of theme tokens. Each terminal spelling is one complete class: a
 * second class setting the same colour would be ordered by the sheet, not by
 * the class attribute.
 */

import {tw} from '../tw';

export const logStreamClassName = tw(
  'relative flex flex-col overflow-hidden',
  'rounded-md bg-[color:var(--color-background-surface)]',
  '[border-width:var(--border-width)] border-solid border-[color:var(--color-border)]',
  'font-mono text-sm',
);

/** The frame plus the terminal chrome; the border and fill both replace it. */
export const logStreamTerminalClassName = tw(
  logStreamClassName,
  'border-[color:#26262a] bg-[color:#0a0a0a]',
);

/** The root's height cap is `--astryx-log-stream-max-height` on the element. */
export const logStreamScrollerClassName = tw(
  'overflow-y-auto [scrollbar-width:thin] [overscroll-behavior:contain]',
  'max-h-[var(--astryx-log-stream-max-height,none)]',
);

/**
 * Everything a row keeps in both variants. The fill, the block padding and
 * the bottom rule belong to the variant classes below, because the terminal
 * row changes all three.
 */
const rowBaseClassName = tw(
  'grid items-baseline gap-x-3 px-3 leading-[1.7]',
  // Offscreen rows skip layout/paint; the intrinsic size keeps the scrollbar
  // stable. No virtualization — see the component header.
  '[content-visibility:auto] [contain-intrinsic-block-size:auto_28px]',
  'opacity-100 transition-opacity ease-out starting:opacity-0',
  'duration-[var(--duration-fast-min)] motion-reduce:duration-[0.01ms]',
);

export const logStreamRowClassName = tw(
  rowBaseClassName,
  'py-1 text-[color:var(--color-text-primary)]',
  '[border-bottom-width:var(--border-width)] [border-bottom-style:solid]',
  'border-b-[color:var(--color-border)] last:border-b-0',
);

export const logStreamRowTerminalClassName = tw(
  rowBaseClassName,
  'py-px [color:#b9b9c0] [border-bottom-width:0]',
);

/** Grid templates per visible column set (timestamp / source optional). */
export const logStreamColumnsFullClassName =
  '[grid-template-columns:96px_52px_128px_minmax(0,1fr)]';

export const logStreamColumnsWithoutSourceClassName =
  '[grid-template-columns:96px_52px_minmax(0,1fr)]';

export const logStreamColumnsWithoutTimestampClassName =
  '[grid-template-columns:52px_128px_minmax(0,1fr)]';

export const logStreamColumnsMessageOnlyClassName =
  '[grid-template-columns:52px_minmax(0,1fr)]';

/** A row that opens a detail panel is the button itself. */
export const logStreamRowButtonClassName = tw(
  'w-full text-left font-mono text-sm cursor-pointer',
  'disabled:cursor-default aria-disabled:cursor-default',
  '[border-top-width:0] [border-inline-width:0]',
);

/**
 * A hover arm carries its own `:hover`, so it outranks the row's fill and its
 * level wash without a second base class.
 */
export const logStreamRowButtonHoverClassName =
  '[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:bg-[color:var(--color-overlay-hover)]';

export const logStreamRowButtonHoverTerminalClassName =
  '[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:bg-[color:#141417]';

/**
 * Level washes are derived from the theme token with `color-mix`, so the tint
 * follows a custom theme instead of a parallel palette.
 */
export const logStreamRowErrorClassName =
  'bg-[color:color-mix(in_srgb,var(--color-error)_6%,transparent)]';

export const logStreamRowWarnClassName =
  'bg-[color:color-mix(in_srgb,var(--color-warning)_5%,transparent)]';

const timestampBaseClassName =
  'whitespace-nowrap [font-variant-numeric:tabular-nums]';

export const logStreamTimestampClassName = tw(
  timestampBaseClassName,
  'text-[color:var(--color-text-secondary)]',
);

export const logStreamTimestampTerminalClassName = tw(
  timestampBaseClassName,
  '[color:#8b8b94]',
);

export const logStreamLevelClassName =
  'text-xs font-semibold tracking-[0.08em] uppercase';

export const logStreamLevelInfoClassName =
  'text-[color:var(--color-text-secondary)]';

export const logStreamLevelDebugClassName =
  'text-[color:var(--color-text-disabled)]';

/** Plain-surface warning/error labels use the dedicated foreground roles. */
export const logStreamLevelWarnClassName =
  'text-[color:var(--color-text-warning)]';

export const logStreamLevelErrorClassName =
  'text-[color:var(--color-text-error)]';

export const logStreamLevelInfoTerminalClassName = '[color:#b9b9c0]';

export const logStreamLevelDebugTerminalClassName = '[color:#8b8b94]';

export const logStreamLevelWarnTerminalClassName = '[color:#f2c00b]';

export const logStreamLevelErrorTerminalClassName = '[color:#ff6166]';

const sourceBaseClassName = 'min-w-0 truncate';

export const logStreamSourceClassName = tw(
  sourceBaseClassName,
  'text-[color:var(--color-text-secondary)]',
);

export const logStreamSourceTerminalClassName = tw(
  sourceBaseClassName,
  '[color:#8b8b94]',
);

export const logStreamMessageClassName = tw(
  'min-w-0 whitespace-pre-wrap [overflow-wrap:anywhere]',
  // Text nested inside keeps `anywhere` too.
  '[--_astryx-text-overflow-wrap:anywhere]',
);

export const logStreamMessageTerminalClassName = '[color:#b9b9c0]';

export const logStreamMessageErrorTerminalClassName = '[color:#ff6166]';

export const logStreamMessageWarnTerminalClassName = '[color:#f2c00b]';

export const logStreamDetailClassName = tw(
  'py-3 px-3 bg-[color:var(--color-background-muted)]',
  '[border-bottom-width:var(--border-width)] [border-bottom-style:solid]',
  'border-b-[color:var(--color-border)]',
);

export const logStreamDetailTerminalClassName = tw(
  logStreamDetailClassName,
  'bg-[color:#0e0e10] border-b-[color:#26262a] [color:#b9b9c0]',
);

const jumpToLatestBaseClassName = tw(
  'absolute bottom-3 end-3 py-1 px-3 rounded-full shadow-md',
  '[border-width:var(--border-width)] border-solid',
  'font-mono text-sm font-medium',
  'cursor-pointer disabled:cursor-default aria-disabled:cursor-default',
  'outline-none focus-visible:[outline-style:var(--focus-outline-style)]',
  '[outline-width:var(--focus-outline-width)]',
  '[outline-color:var(--focus-outline-color)]',
  '[outline-offset:var(--focus-outline-offset)]',
);

export const logStreamJumpToLatestClassName = tw(
  jumpToLatestBaseClassName,
  'border-[color:var(--color-border-emphasized)]',
  'bg-[color:var(--color-background-surface)]',
  'text-[color:var(--color-text-primary)]',
  '[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:bg-[color:var(--color-background-muted)]',
);

export const logStreamJumpToLatestTerminalClassName = tw(
  jumpToLatestBaseClassName,
  'border-[color:#26262a] bg-[color:#141417] [color:#e8e8ea]',
  '[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:bg-[color:#1d1d21]',
);
