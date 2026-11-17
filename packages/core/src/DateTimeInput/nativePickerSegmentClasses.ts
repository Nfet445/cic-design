// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file nativePickerSegmentClasses.ts
 * @input Uses the theme's typography, colour and radius variables
 * @output The utility class strings the native segment's icon button, input,
 *   slot and value overlay carry
 * @position Internal to DateTimeInput; the Tailwind build scans it for class
 *   names
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from '../utils/tw';

/** The clear/today affordance beside a native segment. */
export const nativePickerSegmentIconButtonClassName = tw(
  'flex',
  'items-center',
  'justify-center',
  'p-0',
  'm-0',
  'border-0',
  'bg-transparent',
  'cursor-pointer',
  '[&:is(:disabled,[aria-disabled=true])]:cursor-default',
  'rounded-[var(--radius-element)]',
);

/** A native segment the call site disabled keeps a plain cursor. */
export const nativePickerSegmentDisabledClassName = tw('cursor-default');

/**
 * The native date or time control. It carries no border, padding or
 * background of its own: the field wrapper draws those, and the segment only
 * holds the browser's edit fields on one text line.
 *
 * Below 16px iOS zooms the page when the field takes focus. Only iOS WebKit
 * implements `-webkit-touch-callout`, so the coarse-pointer floor is keyed to
 * iOS alone.
 *
 * Native controls size from their internal edit fields, so the box is pinned
 * to one text line and both segments stay aligned. `1lh` tracks the font for
 * free; a browser without it falls back to the same calculation.
 */
export const nativePickerSegmentInputClassName = tw(
  'block',
  'flex-1',
  'min-w-0',
  'border-0',
  'p-0',
  'font-[family-name:var(--font-family-body)]',
  'text-[length:var(--text-body-size)]',
  'pointer-coarse:[@supports(-webkit-touch-callout:none)]:text-[length:max(1rem,var(--text-body-size))]',
  'leading-[var(--text-body-leading)]',
  'text-[color:var(--color-text-primary)]',
  'bg-transparent',
  'outline-none',
  '[height:1lh]',
  '[@supports_not_(height:1lh)]:[height:calc(var(--text-body-size)_*_var(--text-body-leading))]',
  'pointer-coarse:[@supports(-webkit-touch-callout:none)]:[height:calc(max(1rem,var(--text-body-size))_*_var(--text-body-leading))]',
  'appearance-none',
  // DateTimeInput renders its own calendar and clock affordances.
  '[&::-webkit-calendar-picker-indicator]:hidden',
  '[&::-webkit-date-and-time-value]:[text-align:start]',
  '[&::-webkit-date-and-time-value]:m-0',
  '[&::-webkit-date-and-time-value]:p-0',
  '[&::-webkit-date-and-time-value]:leading-[inherit]',
  '[&::-webkit-date-and-time-value]:min-h-0',
  '[&::-webkit-datetime-edit]:p-0',
  '[&::-webkit-datetime-edit]:leading-[inherit]',
);

/** A native segment whose value the overlay draws instead. */
export const nativePickerSegmentInputHiddenClassName = tw(
  'text-transparent',
  '[-webkit-text-fill-color:transparent]',
);

/** A native segment that failed validation reads as secondary text. */
export const nativePickerSegmentInvalidClassName = tw(
  'text-[color:var(--color-text-secondary)]',
);

/** The box the control and its overlay share. */
export const nativePickerSegmentSlotClassName = tw(
  'relative',
  'flex',
  'items-center',
  'flex-1',
  '[min-inline-size:0]',
);

/**
 * The formatted value over the native control. It repeats the control's font
 * so the two baselines match, and takes no pointer events.
 */
export const nativePickerSegmentOverlayClassName = tw(
  'absolute',
  'inset-x-0',
  'inset-y-0',
  'block',
  'text-[length:var(--text-body-size)]',
  'pointer-coarse:[@supports(-webkit-touch-callout:none)]:text-[length:max(1rem,var(--text-body-size))]',
  'leading-[var(--text-body-leading)]',
  'pointer-events-none',
  'overflow-hidden',
  'whitespace-nowrap',
  'text-ellipsis',
);

/** A value the overlay draws. */
export const nativePickerSegmentOverlayValueClassName = tw(
  'text-[color:var(--color-text-primary)]',
);

/** The placeholder the empty overlay draws. */
export const nativePickerSegmentOverlayPlaceholderClassName = tw(
  'text-[color:var(--color-text-secondary)]',
);
