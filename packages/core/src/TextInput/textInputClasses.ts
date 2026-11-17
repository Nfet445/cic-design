// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file textInputClasses.ts
 * @input Uses the theme's typography, type-scale and element-size variables
 * @output The utility class strings TextInput's control element and its height
 *   carry
 * @position Internal to TextInput; the Tailwind build scans it for class names
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from '../utils/tw';

export type TextInputSize = 'sm' | 'md' | 'lg';

const HEIGHT_CLASS: Record<TextInputSize, string> = {
  sm: '[height:var(--size-element-sm)]',
  md: '[height:var(--size-element-md)]',
  lg: '[height:var(--size-element-lg)]',
};

/** The wrapper's height for a size. */
export function textInputHeightClassName({
  size,
}: {
  size: TextInputSize;
}): string {
  return HEIGHT_CLASS[size];
}

/**
 * The control fills the wrapper's content box and draws nothing of its own: the
 * wrapper owns the border, padding and ring, so the control must not add a
 * second one.
 *
 * The 16px floor is iOS-only: iOS Safari zooms the page when a focused control
 * sits under 16px, and only iOS WebKit implements `-webkit-touch-callout` to
 * key the coarse-pointer floor to it.
 */
export function textInputClassName({
  isDisabled,
}: {
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
    'placeholder:text-[color:var(--color-text-secondary)]',
    isDisabled && 'cursor-default',
  );
}
