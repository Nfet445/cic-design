// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file overflowListClasses.ts
 * @input The gap step, whether the list wraps, and the measured row height
 * @output Utility class strings for the visible list, its hidden measurement
 *   copy and the overflow indicator
 * @position Style primitives; OverflowList.tsx joins these with `tw()` and the
 *   package stylesheet builds the rules
 */

import {tw} from '../utils/tw';
import type {SpacingStep} from '../utils/types';

const CONTAINER = 'flex items-center overflow-hidden whitespace-nowrap min-w-0';

const MULTI_ROW_CONTAINER =
  'flex flex-wrap content-start overflow-hidden whitespace-normal min-w-0';

/**
 * The hidden copy every item and the indicator are measured in. `invisible` and
 * `h-0` keep it out of the paint and out of the row's flow; `absolute` keeps it
 * out of the overflow list's own width.
 */
export const overflowListMeasureContainerClassName = tw(
  'absolute invisible h-0 overflow-hidden',
  'flex items-center whitespace-nowrap pointer-events-none',
);

export const overflowListMeasureIndicatorClassName = 'inline-flex';

/**
 * `observeParent` sizes the list to its content, so the row grows to the
 * parent's width only once something overflows.
 */
export const overflowListFillParentClassName = 'w-full';

export const overflowListGapClassName: Record<SpacingStep, string> = {
  0: 'gap-0',
  0.5: 'gap-0.5',
  1: 'gap-1',
  1.5: 'gap-1.5',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  8: 'gap-8',
  10: 'gap-10',
};

/**
 * The block cap on a wrapping list. The measured value travels in a private
 * variable, so the class stays a literal and a theme can still override the
 * declaration.
 */
export const OVERFLOW_LIST_MAX_HEIGHT_VAR = '--_overflow-list-max-height';

export const overflowListMaxHeightClassName =
  'max-h-(--_overflow-list-max-height)';

/** The visible list: one line, or bounded rows that wrap. */
export function overflowListContainerClassName(isMultiRow: boolean): string {
  return isMultiRow ? MULTI_ROW_CONTAINER : CONTAINER;
}
