// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file fieldClasses.ts
 * @input Uses the theme's spacing, border and element-size variables, and the
 *   input status type
 * @output The utility class strings Field's root, its horizontal label cell and
 *   its input/status wrapper carry, the custom property Field's width class
 *   reads, and the input box every input component paints, with its disabled
 *   state
 * @position Internal to Field, except `fieldInputWrapperClassName` and
 *   `fieldStatusBorderClassName`, which `@astryxdesign/core/Field` publishes
 *   for a consumer that draws an input box of its own; the Tailwind build scans
 *   this module for class names
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import type {CSSProperties} from 'react';
import type {SizeValue} from '../utils/types';
import type {InputStatusType} from './types';
import {tw} from '../utils/tw';

/**
 * The custom property a consumer's `width` reaches the root through. The width
 * is a per-instance value no class can name, so Field sets the property inline
 * and the class reads it.
 */
export const fieldSizeVars = {
  width: '--astryx-field-width',
} as const;

/** The inline sizing custom property the root's width class reads. */
export type FieldSizingStyle = CSSProperties &
  Partial<Record<(typeof fieldSizeVars)[keyof typeof fieldSizeVars], string>>;

/** A width prop as the inline value its class reads; a number is pixels. */
export function fieldSizeStyle(
  width: SizeValue | null | undefined,
): FieldSizingStyle {
  const style: FieldSizingStyle = {};
  if (width != null) {
    style[fieldSizeVars.width] =
      typeof width === 'number' ? `${width}px` : width;
  }
  return style;
}

/**
 * The Field root. It owns the local stacking boundary: the input
 * wrapper's z-index (1, above the attached status box) and the attached status
 * layer (-1) order parts inside this surface only.
 *
 * `min-w-0` drops the automatic minimum, so a row can shrink the whole field
 * instead of overflowing at the controls' intrinsic widths.
 */
export function fieldClassName({
  isLabelHidden,
  width,
}: {
  isLabelHidden: boolean;
  width: SizeValue | null | undefined;
}): string {
  return tw(
    'flex',
    'flex-col',
    'isolate',
    'min-w-0',
    !isLabelHidden && 'gap-1',
    width != null && 'w-[var(--astryx-field-width)]',
  );
}

/** Horizontal labels take no slot of their own; the parent grid places them. */
export const fieldHorizontalLabelsClassName = 'contents';

/**
 * Aligns label text with input text by matching the input wrapper's top border
 * plus top padding. Labels stay top-aligned in a textarea.
 */
export const fieldHorizontalLabelAlignClassName =
  '[padding-block-start:calc(var(--border-width)_+_var(--spacing-1))]';

/**
 * Holds the control and, for an attached status, the box behind it. Each
 * `:has` arm sets a variable on its own, so the arm wins on specificity, not on
 * the sheet order of two classes in `astryx-base`.
 *
 * The overlap is half the control height: half-height is the largest effective
 * corner radius CSS renders, even when a theme uses a pill value such as
 * `--radius-full` (9999px).
 */
export const fieldInputStatusWrapperClassName = tw(
  'flex',
  'flex-col',
  'isolate',
  '[--_field-status-overlap:calc(var(--size-element-md)_/_2)]',
  '[&:has(>_[data-size=sm])]:[--_field-status-overlap:calc(var(--size-element-sm)_/_2)]',
  '[&:has(>_[data-size=lg])]:[--_field-status-overlap:calc(var(--size-element-lg)_/_2)]',
);

/**
 * Keeps the overlapping status background below both Astryx inputs and custom
 * controls. The isolated wrapper contains this negative stacking layer.
 */
export const fieldAttachedStatusLayerClassName = tw('relative', '[z-index:-1]');

/**
 * The status border colours, published for a consumer that paints its own box.
 * Apply one of these instead of the wrapper's own `border-color`, never beside
 * it: two classes setting one property are decided by the sheet order.
 */
export const fieldStatusBorderClassName: Record<InputStatusType, string> = {
  warning: 'border-[color:var(--color-border-warning)]',
  error: 'border-[color:var(--color-border-error)]',
  success: 'border-[color:var(--color-border-success)]',
};

const FIELD_INPUT_BOX_CLASS = tw(
  'box-border',
  'relative',
  'z-1',
  'flex',
  'items-center',
  'gap-[var(--spacing-2)]',
  'py-[var(--spacing-1)]',
  'px-[var(--spacing-2)]',
  'border-[length:var(--border-width)]',
  'border-solid',
  'focus-within:border-[color:var(--color-accent)]',
  'forced-colors:focus-within:border-[color:Highlight]',
  '[--_field-radius:var(--radius-element)]',
  'rounded-[var(--_field-radius)]',
  'bg-[var(--color-background-surface)]',
  // A text field applies the coarse-pointer timing too: a tap on one raises the
  // keyboard, and a fade repaints the field on each frame of that rise.
  'transition-[border-color,box-shadow]',
  'duration-[var(--duration-fast)]',
  'ease-[var(--ease-standard)]',
  'motion-reduce:duration-0',
  'pointer-coarse:duration-0',
  'shadow-none',
  'pointer-fine:not-disabled:not-focus-within:hover:shadow-[inset_0_0_0_2px_color-mix(in_srgb,var(--color-border-emphasized)_30%,transparent)]',
  'focus-within:shadow-[inset_0_0_0_2px_var(--color-accent-muted)]',
  'outline-none',
);

/**
 * The box an input sits in: the border, the surface, the hover ring and the
 * focus ring.
 *
 * `status` replaces the resting border colour; it is the only class that
 * changes it, so a status border and the resting one never compete. Padding,
 * alignment and growth stay the caller's, as they are for every input
 * component that composes the box.
 */
export function fieldInputWrapperClassName({
  status,
}: {status?: InputStatusType} = {}): string {
  return tw(
    FIELD_INPUT_BOX_CLASS,
    status
      ? fieldStatusBorderClassName[status]
      : 'border-[color:var(--color-border-emphasized)]',
  );
}

/**
 * The box in its disabled state. The base hover ring still wins on specificity,
 * as its unlayered rule did wherever a wrapper marks itself `aria-disabled`, so
 * a disabled control reacts to a pointer exactly as it did before.
 */
export const fieldInputWrapperDisabledClassName =
  'cursor-default opacity-50 shadow-none';
