// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file indicatorClasses.ts
 * @input Indicator size and state
 * @output Utility class strings for the checkbox box, the radio circle, their
 *   marks, and the check slot
 * @position Style primitives; scanned by the Tailwind build
 *
 * Each state picks one class per property, so two classes here never paint the
 * same declaration and the sheet order never decides between them. The one
 * paint a class cannot carry is the ancestor hover tint: it reads the StyleX
 * marker class, so it stays in `indicatorHover.stylex.ts` and overrides the
 * border and fill these maps set at rest.
 *
 * No per-instance value reaches an indicator — size and state are a fixed set —
 * so no class here reads an `--astryx-*` variable.
 */

import {tw} from '../utils/tw';
import type {IndicatorSize} from './types';

/**
 * The box a checkbox and a radio share: a bordered square that centers its
 * mark. `border-solid` is explicit because the package ships utilities only,
 * with no preflight to give a border its style.
 */
const boxClassName = tw(
  'box-border flex items-center justify-center shrink-0',
  'border-[length:var(--border-width)] border-solid',
  'transition-[background-color,border-color]',
  'duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
  // Under reduced motion the state change lands at once.
  'motion-reduce:duration-0',
);

/** The 20 px / 24 px square the box and the circle are drawn on. */
const boxSizeClasses: Record<IndicatorSize, string> = {
  sm: 'size-5',
  md: 'size-6',
};

/**
 * The border of the two enabling states. A disabled box keeps the plain border
 * colour whatever its fill is, so it overrides both.
 */
const ENABLED_BORDER_CLASSES = {
  unchecked: 'border-[color:var(--color-border-emphasized)]',
  checked: 'border-[color:var(--color-accent)]',
} as const;

const DISABLED_BORDER_CLASSES = 'border-[color:var(--color-border)]';

/** The fill. Only the unchecked disabled box takes the muted surface. */
const FILL_CLASSES = {
  unchecked: 'bg-[var(--color-background-surface)]',
  checked: 'bg-[var(--color-accent)]',
  disabledUnchecked: 'bg-[var(--color-background-muted)]',
} as const;

/** The currentColor a checkbox box hands the mark and a pending spinner. */
const CHECKBOX_TEXT_CLASSES = {
  unchecked: 'text-[var(--color-accent)]',
  checked: 'text-[var(--color-on-accent)]',
} as const;

/** The check glyph: 12 px at `sm`, 14 px at `md`. */
const checkmarkSizeClasses: Record<IndicatorSize, string> = {
  sm: 'size-3',
  md: 'size-3.5',
};

/** The partial-state bar: 10 px or 12 px wide, one border width tall. */
const indeterminateSizeClasses: Record<IndicatorSize, string> = {
  sm: 'w-2.5 h-0.5',
  md: 'w-3 h-0.5',
};

export interface CheckboxBoxClassNameOptions {
  /** Checked and partial both paint as selected. */
  isChecked: boolean;
  isDisabled: boolean;
  size: IndicatorSize;
}

/** The checkbox box, its state colors, and the size it is drawn on. */
export function checkboxBoxClassName({
  isChecked,
  isDisabled,
  size,
}: CheckboxBoxClassNameOptions): string {
  return tw(
    boxClassName,
    boxSizeClasses[size],
    'rounded-[var(--radius-inner)]',
    CHECKBOX_TEXT_CLASSES[isChecked ? 'checked' : 'unchecked'],
    isDisabled
      ? DISABLED_BORDER_CLASSES
      : ENABLED_BORDER_CLASSES[isChecked ? 'checked' : 'unchecked'],
    isChecked
      ? FILL_CLASSES.checked
      : isDisabled
        ? FILL_CLASSES.disabledUnchecked
        : FILL_CLASSES.unchecked,
    isDisabled && 'opacity-50',
  );
}

/**
 * The check glyph. Under forced colors the box paints flat and the SVG stroke
 * stays on currentColor, which is the same flat colour, so the stroke moves to
 * CanvasText — a check on a Canvas box (WCAG 1.4.11).
 */
export function checkboxCheckmarkClassName({
  isVisible,
  size,
}: {
  isVisible: boolean;
  size: IndicatorSize;
}): string {
  return tw(
    isVisible ? 'block' : 'hidden',
    checkmarkSizeClasses[size],
    'text-[var(--color-on-accent)]',
    'forced-colors:text-[color:CanvasText]',
  );
}

/** The partial-state bar, keepable on its own under forced colors. */
export function checkboxIndeterminateClassName({
  isVisible,
  size,
}: {
  isVisible: boolean;
  size: IndicatorSize;
}): string {
  return tw(
    isVisible ? 'block' : 'hidden',
    indeterminateSizeClasses[size],
    'rounded-[var(--radius-full)]',
    'bg-[var(--color-on-accent)]',
    'forced-colors:bg-[color:CanvasText]',
  );
}

export interface RadioCircleClassNameOptions {
  isChecked: boolean;
  isDisabled: boolean;
  size: IndicatorSize;
}

/**
 * The radio circle. It has no currentColor use — there is no glyph inside it —
 * so it carries no text class, and it is round by 50% rather than by the pill
 * token, because a circle marks a radio and is no corner.
 */
export function radioCircleClassName({
  isChecked,
  isDisabled,
  size,
}: RadioCircleClassNameOptions): string {
  return tw(
    boxClassName,
    boxSizeClasses[size],
    'rounded-[50%]',
    isDisabled
      ? DISABLED_BORDER_CLASSES
      : ENABLED_BORDER_CLASSES[isChecked ? 'checked' : 'unchecked'],
    isChecked
      ? FILL_CLASSES.checked
      : isDisabled
        ? FILL_CLASSES.disabledUnchecked
        : FILL_CLASSES.unchecked,
    isDisabled && 'opacity-50',
  );
}

/** The dot inside a selected circle: 8 px at `sm`, 10 px at `md`. */
const dotSizeClasses: Record<IndicatorSize, string> = {
  sm: 'size-2',
  md: 'size-2.5',
};

/** The dot inside a selected circle, in the color that reads on the fill. */
export function radioDotClassName({size}: {size: IndicatorSize}): string {
  return tw(
    dotSizeClasses[size],
    'rounded-[50%]',
    'bg-[var(--color-on-accent)]',
    // Forced colors strips the painted fill, which would make a selected
    // radio indistinguishable from an unselected one (WCAG 1.4.11).
    'forced-colors:bg-[color:CanvasText]',
  );
}

/**
 * The slot a check draws its replacement in — a pending Spinner, say. It holds
 * Icon's `sm` box, which is what `iconSizeForIndicator` resolves to at both
 * indicator sizes, so the row keeps its layout.
 */
export function checkSlotClassName({
  isDisabled,
}: {
  isDisabled: boolean;
}): string {
  return tw(
    'inline-flex items-center justify-center shrink-0',
    'size-4',
    // The same token Icon's `color="disabled"` resolves to, so the busy and
    // the glyph paths read identically when the owner is disabled.
    isDisabled
      ? 'text-[var(--color-icon-disabled)]'
      : 'text-[var(--color-accent)]',
  );
}
