// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file touchTimeFieldClasses.ts
 * @input Uses the theme's spacing and element-size variables and the touch
 *   wheel geometry
 * @output The utility class strings the touch time field's closed row, its
 *   sheet body and its footer carry, plus the inline property the wheel row's
 *   block size reads
 * @position Internal to TimeInput; the Tailwind build scans it for class names
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import type {CSSProperties} from 'react';
import {dateInputTouchGeometry} from '../DateInput/dateInputGeometry';
import {tw} from '../utils/tw';

export type TouchTimeFieldSize = 'sm' | 'md' | 'lg';

const SIZE_CLASS: Record<TouchTimeFieldSize, string> = {
  sm: tw('[height:var(--size-element-sm)]', 'min-w-[120px]'),
  md: tw('[height:var(--size-element-md)]', 'min-w-[120px]'),
  lg: tw('[height:var(--size-element-lg)]', 'min-w-[120px]'),
};

/** The closed field's height for a size. */
export function touchTimeFieldSizeClassName({
  size,
}: {
  size: TouchTimeFieldSize;
}): string {
  return SIZE_CLASS[size];
}

/** The clock button that opens the sheet. */
export function touchTimeFieldIconButtonClassName({
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
    'shrink-0',
    'cursor-pointer',
    isDisabled && '[&[aria-disabled=true]]:cursor-default',
  );
}

/** The read-only field that opens the sheet. */
export function touchTimeFieldInputClassName({
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
    'bg-transparent',
    'outline-none',
    'cursor-pointer',
    isDisabled && '[&[aria-disabled=true]]:cursor-default',
  );
}

/**
 * The sheet body. The BottomSheet handle floats over the panel, so the wrapper
 * supplies the top clearance and the side and bottom insets.
 */
export const touchTimeFieldSheetBodyClassName = tw(
  'box-border',
  'flex',
  'flex-col',
  '[inline-size:100%]',
  '[min-inline-size:0]',
  'gap-2',
  'px-4',
  '[padding-block-start:0]',
  '[padding-block-end:var(--spacing-4)]',
);

/**
 * The wheel row's block size is one month pane, which the date and time touch
 * surfaces share. It is a geometry constant, so the class reads it as a
 * variable and the element writes the value inline.
 */
export type TouchTimeFieldWheelsStyle = CSSProperties &
  Partial<Record<'--astryx-time-wheels-block-size', string>>;

export const touchTimeFieldWheelsInlineStyle: TouchTimeFieldWheelsStyle = {
  '--astryx-time-wheels-block-size': dateInputTouchGeometry.paneBlockSize,
};

/** The wheels' row: one pane tall, one gutter apart. */
export const touchTimeFieldWheelsClassName = tw(
  'flex',
  '[inline-size:100%]',
  '[min-inline-size:0]',
  '[block-size:var(--astryx-time-wheels-block-size)]',
  'gap-2',
);

/** The footer keeps to the bottom of the sheet whatever the wheels hold. */
export const touchTimeFieldFooterClassName = tw(
  'flex',
  '[margin-block-start:auto]',
  '[padding-block-start:var(--spacing-1)]',
);
