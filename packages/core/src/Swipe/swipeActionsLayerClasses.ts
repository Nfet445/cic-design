// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file swipeActionsLayerClasses.ts
 * @input The side's geometry the gesture writes on the DOM, and an entry's
 *   variant
 * @output Utility class strings for a swipe panel, its track, its entries and
 *   the track's cover fill
 * @position Style primitives; SwipeActionsLayer.tsx joins these with `tw()` and
 *   the package stylesheet builds the rules
 *
 * Every geometry value here is read from a variable the gesture writes on the
 * DOM (useSwipeAction.ts), so the classes stay literal and the values move.
 */

/* eslint-disable no-useless-escape -- A class escapes the underscore that
   starts a private variable's name, so the stylesheet build reads it as
   literal; JavaScript reads the same string as a plain underscore. */

import {tw} from '../utils/tw';
import type {ItemSwipeActionVariant} from '../Item/Item';

/**
 * The values are written out in full, never interpolated: the build finds a
 * class only as a complete literal. Translations add, so the entries' travel is
 * split into one `translate3d` per term: a `calc()` subtraction would need a
 * space, and an underscore in an arbitrary value is a space, which would eat
 * the leading underscore of a variable name.
 *
 * The terms, in order: the side's pin, minus the travel the track moves (so an
 * entry stays pinned at the row's outer edge until the row has uncovered it),
 * and on the outer entry the full swipe's `slide * confirm`.
 */
/**
 * A side's window: the row's resting box, translated back by the travel and
 * clipped to that box and its corners. Transparent and not hit; only the
 * entries take touches.
 */
export const swipePanelClassName = tw(
  'absolute inset-0 overflow-clip rounded-[inherit] pointer-events-none',
  '[transform:translate3d(calc(-1*var(--\_item-swipe-travel,0px)),0,0)]',
);

/**
 * The track: beside the window at rest and moving with the row, so the part
 * inside the window is the space the row vacates. `::before` is the cover fill:
 * the covering entry's colour, shown only while that entry covers the panel.
 */
export const swipeTrackClassName = tw(
  'absolute inset-y-0 w-[200%] overflow-clip rounded-[inherit]',
  'flex isolate bg-[var(--color-background-surface)]',
  '[transform:translate3d(var(--\_item-swipe-travel,0px),0,0)]',
  "before:content-[''] before:absolute before:inset-0 before:z-[-1] before:opacity-0 before:pointer-events-none",
);

export const swipeTrackCoveredClassName = 'before:opacity-100';

/**
 * On the leading side the entries run in reverse from the track's inline end,
 * so the outermost entry sits at the row's outer edge.
 */
export const swipeTrackLeadingClassName = 'end-full flex-row-reverse';

export const swipeTrackTrailingClassName = 'start-full';

/** An entry: its box, its type, its cursor and the pin the gesture writes. */
export const swipeEntryClassName = tw(
  'shrink-0 pointer-events-auto flex flex-col items-center justify-center',
  'gap-1 min-w-[72px] h-full px-3 box-border m-0',
  'border-0 border-none appearance-none whitespace-nowrap',
  'cursor-pointer disabled:cursor-default aria-disabled:cursor-default',
  '[font-family:var(--font-family-body)] [font-size:var(--text-supporting-size)]',
  '[font-weight:var(--font-weight-medium)] [line-height:var(--text-supporting-leading)]',
  '[transform:translate3d(var(--\_item-swipe-pin,0px),0,0)_translate3d(calc(-1*var(--\_item-swipe-sign,1)*min(var(--\_item-swipe-sign,1)*var(--\_item-swipe-travel,0px),var(--\_item-swipe-open,0px))),0,0)]',
);

/**
 * An entry another entry covers. It hides at once, with no fade, so its colour
 * never mixes with the covering entry's.
 */
export const swipeEntryCoveredClassName = 'opacity-0';

/** Half strength as a filter, so the entry's own opacity stays free. */
export const swipeEntryDisabledClassName = '[filter:opacity(0.5)]';

/**
 * The outermost entry: its colour is painted beside it out to the row's outer
 * edge, and on a confirmed full swipe it slides there with the entries' pin.
 */
export const swipeOuterEntryClassName = tw(
  'relative',
  '[transform:translate3d(var(--\_item-swipe-pin,0px),0,0)_translate3d(calc(-1*var(--\_item-swipe-sign,1)*min(var(--\_item-swipe-sign,1)*var(--\_item-swipe-travel,0px),var(--\_item-swipe-open,0px))),0,0)_translate3d(calc(var(--\_item-swipe-slide,0px)*var(--\_item-swipe-confirm,0)),0,0)]',
);

export const swipeOuterEntryLeadingClassName = tw(
  "after:content-[''] after:absolute after:inset-y-0 after:end-full",
  'after:w-screen after:bg-[inherit] after:pointer-events-none',
);

export const swipeOuterEntryTrailingClassName = tw(
  "after:content-[''] after:absolute after:inset-y-0 after:start-full",
  'after:w-screen after:bg-[inherit] after:pointer-events-none',
);

/**
 * A verb's colour. Forced colours replace the fill with Canvas, so the
 * destructive variant keeps a border to preserve its shape; a border, not an
 * outline, leaves the shared focus ring intact.
 */
export const swipeEntryVariantClassName: Record<
  ItemSwipeActionVariant,
  string
> = {
  neutral: 'bg-[var(--color-neutral)] text-[var(--color-text-primary)]',
  accent: 'bg-[var(--color-accent)] text-[var(--color-on-accent)]',
  destructive: tw(
    'bg-[var(--color-error)] text-[var(--color-on-error)]',
    'forced-colors:border forced-colors:border-solid forced-colors:border-[CanvasText]',
  ),
};

/** The track's cover fill: the covering entry's colour. */
export const swipeTrackFillClassName: Record<ItemSwipeActionVariant, string> = {
  neutral: 'before:bg-[var(--color-neutral)]',
  accent: 'before:bg-[var(--color-accent)]',
  destructive: 'before:bg-[var(--color-error)]',
};
