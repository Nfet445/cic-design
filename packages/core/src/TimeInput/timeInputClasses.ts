// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file timeInputClasses.ts
 * @input Uses the theme's typography, type-scale, color and element-size
 *   variables, plus the input size
 * @output The utility class strings TimeInput's clock slot and its typed
 *   control carry
 * @position Internal to TimeInput; the Tailwind build scans it for class names
 *
 * The arms that must beat the control's own class key off an attribute the
 * component already sets (`aria-disabled`, `aria-invalid`) instead of relying
 * on class order inside `astryx-base`: two plain utilities have equal
 * specificity, so the sheet order, not the class attribute, would pick the
 * winner.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from '../utils/tw';

export type TimeInputSize = 'sm' | 'md' | 'lg';

const SIZE_CLASS: Record<TimeInputSize, string> = {
  sm: tw('[height:var(--size-element-sm)]', 'min-w-[120px]'),
  md: tw('[height:var(--size-element-md)]', 'min-w-[120px]'),
  lg: tw('[height:var(--size-element-lg)]', 'min-w-[120px]'),
};

/** The wrapper's height for a size. */
export function timeInputSizeClassName({
  size,
}: {
  size: TimeInputSize;
}): string {
  return SIZE_CLASS[size];
}

/** The clock beside the typed time; it never shrinks with the value. */
export const timeInputIconClassName = tw(
  'flex',
  'items-center',
  'justify-center',
  'shrink-0',
);

/**
 * The typed control fills the wrapper's content box and draws nothing of its
 * own: the wrapper owns the border, padding and ring.
 *
 * The 16px floor is iOS-only: iOS Safari zooms the page when a focused control
 * sits under 16px, and only iOS WebKit implements `-webkit-touch-callout` to
 * key the coarse-pointer floor to it.
 *
 * A rejected draft keeps the secondary colour, so the typed text reads as a
 * value the control did not accept.
 */
export function timeInputClassName({
  isDisabled,
  isRejected,
}: {
  isDisabled: boolean;
  isRejected: boolean;
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
    isRejected && '[&[aria-invalid=true]]:text-[color:var(--color-text-secondary)]',
    isDisabled && '[&[aria-disabled=true]]:cursor-default',
  );
}
