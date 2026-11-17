// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file checkboxInputClasses.ts
 * @input The control's size, whether its label is hidden, whether a row owns
 *   the press, and the field's width
 * @output The row, the box wrapper, the press layers, the native input, the
 *   label column and the sizing custom property classes
 * @position Internal to CheckboxInput; the Tailwind build scans it for class
 *   names
 *
 * The one paint a class cannot carry is the press overlay's `content`: it reads
 * the press-scope marker class, so it stays in `checkboxInputPress.stylex.ts`.
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import type {CSSProperties} from 'react';
import type {SizeValue} from '../utils/types';
import {tw} from '../utils/tw';

/** The checkbox box, and the native input that covers it, share this edge. */
const SIZE: Record<'sm' | 'md', string> = {
  sm: 'size-5',
  md: 'size-6',
};

/**
 * The custom property a consumer's `width` reaches the root through. The width
 * is a per-instance value no class can name, so the component sets the property
 * inline and the class reads it.
 */
export const checkboxInputSizeVars = {
  width: '--astryx-checkbox-input-width',
} as const;

/** The inline sizing custom property the root's width class reads. */
type CheckboxInputSizingStyle = CSSProperties &
  Partial<
    Record<
      (typeof checkboxInputSizeVars)[keyof typeof checkboxInputSizeVars],
      string
    >
  >;

/** A width prop as the inline value its class reads; a number is pixels. */
export function checkboxInputSizeStyle(
  width: SizeValue | null | undefined,
): CheckboxInputSizingStyle {
  const style: CheckboxInputSizingStyle = {};
  if (width != null) {
    style[checkboxInputSizeVars.width] =
      typeof width === 'number' ? `${width}px` : width;
  }
  return style;
}

/** The field root. It sizes the label, control and status together. */
export function checkboxInputClassName({
  width,
}: {
  width: SizeValue | null | undefined;
}): string {
  return tw(width != null && 'w-[var(--astryx-checkbox-input-width)]');
}

/**
 * The pressable row. Under a coarse pointer it contains its hit band, and it
 * carries the indicator scope, so hover and focus reach the checkbox visual
 * through this ancestor rather than props.
 */
export function checkboxInputRowClassName({
  isLabelHidden,
  hasHitArea,
}: {
  isLabelHidden: boolean;
  hasHitArea: boolean;
}): string {
  return tw(
    'flex items-center gap-2',
    isLabelHidden && 'gap-0',
    hasHitArea && 'pointer-coarse:relative',
  );
}

/**
 * A row around the checkbox that owns the press (CheckboxRowPressContext)
 * hands its press paint down to the built-in box, and the box paints no
 * `:active` fill of its own because the row paints every press.
 *
 * `--_indicator-press-image` and `--_indicator-active-press` are private
 * inherited values the indicator reads, not theme hooks.
 */
export const checkboxInputRowPressImageClassName = tw(
  '[--_indicator-press-image:var(--_checkbox-row-press-paint,none)]',
  '[--_indicator-active-press:transparent]',
);

/**
 * The row's own box, when the row owns the press: it paints only the paint that
 * row declares, so it draws no `:active` fill and no outer row or card reaches
 * it.
 */
export const checkboxInputRowPressOverlayClassName = tw(
  'after:bg-transparent',
  'after:bg-[image:var(--_checkbox-row-press-paint,none)]',
);

/** The box wrapper: the indicator's layout host and the press layer's owner. */
export function checkboxInputWrapperClassName({
  size,
}: {
  size: 'sm' | 'md';
}): string {
  return tw(
    'relative isolate flex shrink-0 items-center justify-center',
    SIZE[size],
  );
}

/**
 * The press layer the owner paints over the resolved indicator, so a plain
 * theme replacement keeps the pressed feedback. Its paint comes from
 * `pressClasses.ts`, which reads the scope and press attributes off the row.
 */
export const checkboxInputPressOverlayClassName = tw(
  'after:pointer-events-none after:absolute after:inset-0',
  'after:rounded-[var(--radius-inner)]',
);

/**
 * The press layer exists only over an indicator that does not paint its own
 * press: the circle mark draws its own.
 */
export const checkboxInputPressContentClassName = tw(
  "after:content-['']",
  'has-[[data-astryx-indicator-press]]:after:content-none',
);

/** Holds only the indicator, so the focus ring has one unambiguous target. */
export const checkboxInputIndicatorSlotClassName = 'contents';

/**
 * The native input over the box. A disabled one answers with a default cursor
 * whether it carries the native attribute or the focusable `aria-disabled`;
 * the variants state that once, so no second utility has to beat the base one.
 */
export function checkboxInputNativeClassName({
  size,
}: {
  size: 'sm' | 'md';
}): string {
  return tw(
    'absolute top-1/2 z-[1] m-0 cursor-pointer p-0 opacity-0',
    'disabled:cursor-default aria-disabled:cursor-default',
    'pointer-coarse:min-h-6 pointer-coarse:min-w-6',
    SIZE[size],
  );
}

/** The label and description column beside the box. */
export const checkboxInputLabelWrapperClassName = 'flex flex-col';
