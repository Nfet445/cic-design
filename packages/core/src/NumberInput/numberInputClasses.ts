// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file numberInputClasses.ts
 * @input Uses the theme's typography, type-scale, element-size and public
 *   `number-input` padding variables, plus the control's size and state
 * @output Tailwind utility class names for NumberInput's entry, its unit, the
 *   stepper column and the two stepper buttons
 * @position Internal to NumberInput; the Tailwind build scans it for class names
 *
 * The wrapper is not here: it is the same element as the shared field box
 * class, and its own padding and z-index rules stay StyleX in
 * `NumberInput.tsx`, where an unlayered declaration outranks a class. Its rule
 * and the stepper column's padding cancellation are the only style left in the
 * component file.
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import type {NumberInputSize} from './NumberInput';
import {tw} from '../utils/tw';

const HEIGHT_CLASS: Record<NumberInputSize, string> = {
  sm: '[height:var(--size-element-sm)]',
  md: '[height:var(--size-element-md)]',
  lg: '[height:var(--size-element-lg)]',
};

/** The wrapper's height for a size. */
export function numberInputHeightClassName({
  size,
}: {
  size: NumberInputSize;
}): string {
  return HEIGHT_CLASS[size];
}

/**
 * The entry fills the wrapper's content box and draws nothing of its own: the
 * wrapper owns the border, padding and ring.
 *
 * The 16px floor is iOS-only: iOS Safari zooms the page when a focused control
 * sits under 16px, and only iOS WebKit implements `-webkit-touch-callout` to
 * key the coarse-pointer floor to it. A rejected entry shows its text in the
 * secondary colour, so the message that explains it is the only emphasis.
 */
export function numberInputEntryClassName({
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
    isInvalid
      ? 'text-[color:var(--color-text-secondary)]'
      : 'text-[color:var(--color-text-primary)]',
    'bg-transparent',
    'outline-none',
    'placeholder:text-[color:var(--color-text-secondary)]',
    isDisabled && 'cursor-default',
  );
}

/** The unit beside the entry, in the secondary colour so it reads as a label. */
export const NUMBER_INPUT_UNITS_CLASS = tw(
  '[font-family:var(--font-family-body)]',
  'text-[length:var(--text-body-size)]',
  '[line-height:var(--text-body-leading)]',
  'text-[color:var(--color-text-secondary)]',
  'shrink-0',
);

/**
 * The stepper column. It spans the field's full height by cancelling the
 * wrapper's block padding edge by edge, reading the same public tokens the
 * wrapper applies — including an asymmetric themed padding, where one
 * `margin-block` value would be wrong at one end.
 *
 * These compact buttons are a fine-pointer affordance: touch users enter a
 * value directly, and keyboard stepping stays available, so the column is
 * hidden under a coarse pointer rather than resized.
 */
export const NUMBER_INPUT_STEPPER_COLUMN_CLASS = tw(
  'self-stretch',
  'flex',
  'pointer-coarse:hidden',
  'flex-col',
  'shrink-0',
  'w-[var(--spacing-2)]',
  '[margin-block-start:calc(-1*var(--astryx-number-input-padding-block-start,var(--astryx-number-input-padding,var(--spacing-1))))]',
  '[margin-block-end:calc(-1*var(--astryx-number-input-padding-block-end,var(--astryx-number-input-padding,var(--spacing-1))))]',
  '[border-inline-start-width:var(--border-width)]',
  '[border-inline-start-style:solid]',
  '[border-inline-start-color:var(--color-border-emphasized)]',
  'overflow-hidden',
  'rounded-se-[var(--_field-radius)]',
  'rounded-ee-[var(--_field-radius)]',
);

/**
 * One stepper button. The shared hover and press overlay paints on an enabled
 * control only, so a disabled button has no image to reset — it keeps its
 * surface and swaps only the glyph colour.
 */
export function numberInputStepperButtonClassName({
  isDisabled,
}: {
  isDisabled: boolean;
}): string {
  return tw(
    'box-border',
    'flex',
    'items-center',
    'justify-center',
    'flex-1',
    'min-h-0',
    'p-0',
    'm-0',
    '[border-width:0]',
    '[border-style:none]',
    isDisabled
      ? 'text-[color:var(--color-icon-disabled)]'
      : 'text-[color:var(--color-icon-secondary)]',
    'bg-[var(--color-background-surface)]',
    'cursor-pointer',
    'disabled:cursor-default',
    'aria-disabled:cursor-default',
    'outline-none',
  );
}

/** The decrement button's divider sits on its block start, above its sibling. */
export const NUMBER_INPUT_DECREMENT_CLASS = tw(
  '[border-block-start-width:var(--border-width)]',
  '[border-block-start-style:solid]',
  '[border-block-start-color:var(--color-border-emphasized)]',
);

/** The increment glyph points up; the registry draws the down arrow. */
export const NUMBER_INPUT_INCREMENT_ICON_CLASS = 'rotate-180';
