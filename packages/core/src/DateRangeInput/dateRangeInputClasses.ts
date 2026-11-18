// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file dateRangeInputClasses.ts
 * @input Uses the theme's typography, type-scale, color, spacing, border,
 *   radius and element-size variables, plus the input size
 * @output The utility class strings DateRangeInput's trigger, its calendar
 *   button, its popover body and its preset column carry
 * @position Internal to DateRangeInput; the Tailwind build scans it for class
 *   names
 *
 * The arms that must beat a base class key off an attribute the component
 * already sets (`aria-disabled`, `aria-current`) instead of relying on class
 * order inside `astryx-base`: two plain utilities have equal specificity, so
 * the sheet order, not the class attribute, would pick the winner.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from '../utils/tw';

export type DateRangeInputSize = 'sm' | 'md' | 'lg';

const SIZE_CLASS: Record<DateRangeInputSize, string> = {
  sm: tw('[height:var(--size-element-sm)]', 'min-w-[180px]'),
  md: tw('[height:var(--size-element-md)]', 'min-w-[180px]'),
  lg: tw('[height:var(--size-element-lg)]', 'min-w-[180px]'),
};

/** The trigger's height for a size. */
export function dateRangeInputSizeClassName({
  size,
}: {
  size: DateRangeInputSize;
}): string {
  return SIZE_CLASS[size];
}

/**
 * The closed field's visible text. It is a button, not an input, so the whole
 * hit area opens the calendar and the text cannot be edited in place.
 *
 * The 16px floor is iOS-only: iOS Safari zooms the page when a focused control
 * sits under 16px, and only iOS WebKit implements `-webkit-touch-callout` to
 * key the coarse-pointer floor to it.
 */
export function dateRangeInputTriggerClassName({
  hasValue,
  isDisabled,
}: {
  hasValue: boolean;
  isDisabled: boolean;
}): string {
  return tw(
    'block',
    'flex-1',
    'min-w-0',
    '[border-width:0]',
    '[border-style:none]',
    'p-0',
    '[font-family:var(--font-family-body)]',
    'text-[length:var(--text-body-size)]',
    'pointer-coarse:[@supports(-webkit-touch-callout:none)]:text-[length:max(1rem,var(--text-body-size))]',
    '[line-height:var(--text-body-leading)]',
    'text-[color:var(--color-text-primary)]',
    'bg-transparent',
    'outline-none',
    '[text-align:start]',
    'whitespace-nowrap',
    'overflow-hidden',
    'text-ellipsis',
    'cursor-pointer',
    !hasValue && 'text-[color:var(--color-text-secondary)]',
    isDisabled && '[&[aria-disabled=true]]:cursor-default',
  );
}

/** The calendar button beside the trigger. */
export function dateRangeInputIconButtonClassName({
  isDisabled,
}: {
  isDisabled: boolean;
}): string {
  return tw(
    'flex',
    'items-center',
    'justify-center',
    'p-0',
    'm-0',
    '[border-width:0]',
    '[border-style:none]',
    'bg-transparent',
    'cursor-pointer',
    'rounded-md',
    isDisabled && '[&[aria-disabled=true]]:cursor-default',
  );
}

// The popover body scrolls inside the layer's block cap, so a stacked calendar
// stays reachable on a short screen. `dvb` and `env()` cap the layer against
// the viewport the browser actually shows; an engine that knows neither unit
// falls back to `vh` and no safe-area inset.
const POPOVER_CAP_DVB =
  '[max-block-size:min(calc(100dvb_-_max(var(--spacing-4),env(safe-area-inset-top,0px))_-_var(--astryx-layer-inset-block-start,0px)_-_max(var(--spacing-4),env(safe-area-inset-bottom,0px))_-_var(--astryx-layer-inset-block-end,0px)),var(--_layer-keyboard-max-block-size,100dvb))]';
const POPOVER_CAP_FALLBACK =
  '[@supports_not_(block-size:100dvb)]:[max-block-size:min(calc(100vh_-_var(--spacing-4)_-_var(--astryx-layer-inset-block-start,0px)_-_var(--spacing-4)_-_var(--astryx-layer-inset-block-end,0px)),var(--_layer-keyboard-max-block-size,100vh))]';

/** The scrolling body of the calendar popover. */
export const dateRangeInputPopoverScrollClassName = tw(
  'overflow-y-auto',
  'overscroll-contain',
  POPOVER_CAP_DVB,
  POPOVER_CAP_FALLBACK,
);

/**
 * The presets and the calendar sit in one wrapping row, and the row clips at
 * its edges. The preset column draws a divider on its inline end and its block
 * end, and a negative margin moves each divider one border width past the
 * column's margin box; the clip then shows only the divider between the two
 * parts. The row clips, not the scroller, so the overhang is never scrollable
 * overflow.
 */
export const dateRangeInputPopoverLayoutClassName = tw(
  'flex',
  'flex-wrap',
  'overflow-clip',
);

/** The preset column; alone on its line it fills the row. */
export const dateRangeInputPresetSidebarClassName = tw(
  'flex',
  'flex-col',
  'gap-1',
  'p-3',
  '[border-inline-end:var(--border-width)_solid_var(--color-border-emphasized)]',
  '[border-block-end:var(--border-width)_solid_var(--color-border-emphasized)]',
  '[margin-inline-end:calc(-1_*_var(--border-width))]',
  '[margin-block-end:calc(-1_*_var(--border-width))]',
  'grow',
  'min-w-[140px]',
);

/**
 * The calendar gives back the border width the preset column's margin takes,
 * so the two parts stay side by side. Its `min-content` basis is the one-month
 * width: the row wraps there, and the large grow factor keeps the preset
 * column at its own width once they share a line.
 */
export const dateRangeInputCalendarPaneClassName = tw(
  '[margin-inline-start:var(--border-width)]',
  '[flex-basis:min-content]',
  'grow-[1000000]',
);

const PRESET_HOVER_CLASS =
  'pointer-fine:[&:not([aria-current=true])]:hover:bg-[color:var(--color-overlay-hover)]';

/** One preset row. The applied preset and an unavailable one keep their mark. */
export function dateRangeInputPresetButtonClassName({
  isDisabled,
}: {
  isDisabled: boolean;
}): string {
  return tw(
    'block',
    'w-full',
    '[padding:var(--spacing-1)_var(--spacing-2)]',
    'm-0',
    '[border-width:0]',
    '[border-style:none]',
    'rounded-md',
    'bg-transparent',
    '[font-family:var(--font-family-body)]',
    'text-[length:var(--text-label-size)]',
    '[line-height:var(--text-label-leading)]',
    'text-[color:var(--color-text-primary)]',
    'cursor-pointer',
    '[text-align:start]',
    !isDisabled && PRESET_HOVER_CLASS,
    '[&[aria-current=true]]:bg-[color:var(--color-accent-muted)]',
    '[&[aria-current=true]]:text-[color:var(--color-text-accent)]',
    '[&[aria-disabled=true]]:text-[color:var(--color-text-disabled)]',
    '[&[aria-disabled=true]]:bg-transparent',
    '[&[aria-disabled=true]]:cursor-default',
  );
}
