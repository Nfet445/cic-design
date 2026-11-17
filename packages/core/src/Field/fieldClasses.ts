// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file fieldClasses.ts
 * @input Uses the theme's spacing, border and element-size variables
 * @output The utility class strings Field's root, its horizontal label cell and
 *   its input/status wrapper carry, plus the custom property Field's width class
 *   reads
 * @position Internal to Field; the Tailwind build scans it for class names
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import type {CSSProperties} from 'react';
import type {SizeValue} from '../utils/types';
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
 * The Field root. It owns the local stacking boundary (AST-027): the input
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
