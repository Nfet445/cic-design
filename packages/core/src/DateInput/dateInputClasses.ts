// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file dateInputClasses.ts
 * @input Uses the theme's spacing variable plus the touch wheel geometry
 * @output The utility class strings the date picker's wheel and calendar
 *   surfaces carry, and the inline property that carries a box size no class
 *   can name
 * @position Internal to DateInput; the Tailwind build scans it for class names
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import type {CSSProperties} from 'react';
import {dateInputTouchGeometry, dateInputTouchSizes} from './tokens.stylex';
import {tw} from '../utils/tw';

/**
 * One month pane is the wheels' and the scroller's block size, derived from
 * the day size and the weeks per pane. The classes that need it read a
 * variable, and the element writes the derived value inline, so the geometry
 * keeps one source.
 */
export type DateInputPaneStyle = CSSProperties &
  Partial<Record<'--astryx-date-pane-block-size', string>>;

export const dateInputPaneInlineStyle: DateInputPaneStyle = {
  '--astryx-date-pane-block-size': dateInputTouchGeometry.paneBlockSize,
};

/** The class that reads the pane size the element writes. */
export const dateInputPaneBlockSizeClassName =
  '[block-size:var(--astryx-date-pane-block-size)]';

/** The month wheel and the year wheel side by side, one pane tall. */
export const monthYearWheelsClassName = tw(
  'flex',
  'gap-2',
  dateInputPaneBlockSizeClassName,
);

/**
 * A wheel's row height and the vertical offset of one row. The height is a
 * geometry constant; the offset belongs to the row, so it rides the same
 * inline property object.
 */
export type DateInputWheelStyle = DateInputPaneStyle &
  Partial<
    Record<
      | '--astryx-date-wheel-item-size'
      | '--astryx-date-wheel-row-offset'
      | '--astryx-date-wheel-row-color'
      | '--astryx-date-wheel-row-weight',
      string
    >
  >;

export const dateInputWheelInlineStyle: DateInputWheelStyle = {
  '--astryx-date-pane-block-size': dateInputTouchGeometry.paneBlockSize,
  '--astryx-date-wheel-item-size': dateInputTouchSizes.wheelItemSize,
};

/**
 * The inline properties one row carries: its place along the strip and its
 * mark. The mark rides variables because the gesture painter moves it from row
 * to row while the strip travels, and a row's class cannot change mid-flight.
 */
export function dateInputWheelRowInlineStyle({
  isActive,
  isDisabled,
  offsetPx,
}: {
  isActive: boolean;
  isDisabled?: boolean;
  offsetPx: number;
}): DateInputWheelStyle {
  return {
    '--astryx-date-wheel-row-offset': `${offsetPx}px`,
    '--astryx-date-wheel-row-color': isDisabled
      ? 'var(--color-text-disabled)'
      : isActive
        ? 'var(--color-text-accent)'
        : 'var(--color-text-primary)',
    '--astryx-date-wheel-row-weight': isActive
      ? 'var(--font-weight-semibold)'
      : 'var(--font-weight-normal)',
  };
}

/** The inline properties the gesture painter writes on one row. */
export function dateInputWheelRowMarkStyle({
  isActive,
  isDisabled,
}: {
  isActive: boolean;
  isDisabled?: boolean;
}): DateInputWheelStyle {
  return {
    '--astryx-date-wheel-row-color': isDisabled
      ? 'var(--color-text-disabled)'
      : isActive
        ? 'var(--color-text-accent)'
        : 'var(--color-text-primary)',
    '--astryx-date-wheel-row-weight': isActive
      ? 'var(--font-weight-semibold)'
      : 'var(--font-weight-normal)',
  };
}

/**
 * A wheel column moved by the gesture system and the compositor instead of a
 * native scroller.
 */
export const pickerWheelColumnClassName = tw(
  'relative',
  'flex-auto',
  '[min-inline-size:0]',
  dateInputPaneBlockSizeClassName,
  'overflow-hidden',
  'outline-none',
  '[-webkit-tap-highlight-color:transparent]',
);

/**
 * The rows fade toward the column's edges. A static mask: nothing paints it
 * again as the strip moves. It sits inside the column, so it never clips the
 * column's focus ring.
 */
// The fade is a mask, not paint: its stops are alpha-only black, which no
// theme colour names, so the values are literal.
export const pickerWheelFadeClassName = tw(
  'absolute',
  'inset-0',
  'pointer-events-none',
  '[mask-image:linear-gradient(to_bottom,rgb(0_0_0_/_0.7),rgb(0_0_0)_50%,rgb(0_0_0_/_0.7))]',
);

/**
 * The selection band and the strip both centre a row on the scrollport, so
 * both read the same inset. Decorative: the committed value is announced by
 * `aria-selected`.
 */
export const pickerWheelBandClassName = tw(
  'absolute',
  'inset-x-0',
  '[inset-block-start:calc(50%__-_var(--astryx-date-wheel-item-size)_/_2)]',
  '[block-size:var(--astryx-date-wheel-item-size)]',
  'rounded-[var(--radius-element)]',
  'bg-[color:var(--color-neutral)]',
  'pointer-events-none',
);

/** The strip that holds the rows at their places along the wheel. */
export const pickerWheelStripClassName = tw(
  'absolute',
  'inset-x-0',
  '[inset-block-start:calc(50%__-_var(--astryx-date-wheel-item-size)_/_2)]',
  'pointer-events-none',
);

/**
 * One row at its place along the strip. It has no transition, unlike the
 * scrolling column's: a colour or weight that animates lays out and paints
 * every frame on the main thread, and a mark set as a drag lets go would do so
 * through the coast.
 */
export const pickerWheelRowClassName = tw(
  'absolute',
  'inset-x-0',
  '[inset-block-start:var(--astryx-date-wheel-row-offset)]',
  '[block-size:var(--astryx-date-wheel-item-size)]',
  'flex',
  'items-center',
  'justify-center',
  'px-2',
  'box-border',
  'text-[length:var(--text-large-size)]',
  'text-[color:var(--astryx-date-wheel-row-color,var(--color-text-primary))]',
  'font-[var(--astryx-date-wheel-row-weight,var(--font-weight-normal))]',
  'whitespace-nowrap',
  'overflow-hidden',
  'text-ellipsis',
  'select-none',
);

/** The calendar toggle beside the typed date: a glyph, no box of its own. */
// The toggle keeps its focus ring in StyleX (`focusOutlineStyles`), a shared
// rule the class map does not own; the ring is not a property this map sets.
export function dateInputToggleClassName({
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
    'rounded-[var(--radius-element)]',
    // A disabled toggle still takes the tab stop that carries its reason, so
    // the default cursor keys off the attribute rather than `disabled`.
    isDisabled && '[&[aria-disabled=true]]:cursor-default',
  );
}

export type DateInputSize = 'sm' | 'md' | 'lg';

/** The wrapper's block size for a size, and the narrowest it may render. */
export function dateInputSizeClassName({size}: {size: DateInputSize}): string {
  return tw(SIZE_CLASS[size], 'min-w-[180px]');
}

const SIZE_CLASS: Record<DateInputSize, string> = {
  sm: '[height:var(--size-element-sm)]',
  md: '[height:var(--size-element-md)]',
  lg: '[height:var(--size-element-lg)]',
};

/**
 * The typed control fills the wrapper's content box and draws nothing of its
 * own: the wrapper owns the border, the padding and the ring.
 *
 * The 16px floor is iOS-only: iOS Safari zooms the page when a focused control
 * sits under 16px, and only iOS WebKit implements `-webkit-touch-callout` to
 * key the coarse-pointer floor to it.
 *
 * A rejected draft keeps the secondary colour, so the typed text reads as a
 * value the control did not accept.
 */
export function dateInputControlClassName({
  isDisabled,
  isInvalid,
}: {
  isDisabled: boolean;
  isInvalid: boolean;
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
    'placeholder:text-[color:var(--color-text-secondary)]',
    isInvalid &&
      '[&[aria-invalid=true]]:text-[color:var(--color-text-secondary)]',
    isDisabled && '[&[aria-disabled=true]]:cursor-default',
  );
}
