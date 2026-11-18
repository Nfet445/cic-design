// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file stackClasses.ts
 * @input Accepts the stack options a caller resolves from its own props
 * @output Tailwind utility class names for the stack's flex layout, and the
 *   `stack()` builder that `@astryxdesign/core/Stack/stack.stylex` publishes
 * @position Layout utility; used by Stack, HStack, VStack, and by consumers
 *   that compose stack styles themselves
 *
 * SYNC: When modified, update /packages/core/src/Stack/Stack.doc.mjs
 */

import {tw} from '../utils/tw';
import type {SpacingStep} from '../utils/types';

const directionClasses: Record<'horizontal' | 'vertical', string> = {
  horizontal: 'flex-row',
  vertical: 'flex-col',
};

/**
 * Stack direction.
 * - `horizontal`: Items flow along the inline axis, right to left in RTL (HStack)
 * - `vertical`: Items flow top-to-bottom (VStack)
 */
export type StackDirection = keyof typeof directionClasses;

const mainAlignClasses: Record<
  'start' | 'center' | 'end' | 'between' | 'around' | 'evenly',
  string
> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

/**
 * Main-axis alignment options for stack items.
 * - For HStack: horizontal alignment
 * - For VStack: vertical alignment
 */
export type StackMainAlignment = keyof typeof mainAlignClasses;

const crossAlignClasses: Record<
  'start' | 'center' | 'end' | 'stretch',
  string
> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

/**
 * Cross-axis alignment options for stack items.
 * - For HStack: vertical alignment
 * - For VStack: horizontal alignment
 */
export type StackCrossAlignment = keyof typeof crossAlignClasses;

const wrapClasses: Record<'nowrap' | 'wrap' | 'wrap-reverse', string> = {
  nowrap: 'flex-nowrap',
  wrap: 'flex-wrap',
  'wrap-reverse': 'flex-wrap-reverse',
};

/**
 * Flex wrap behavior.
 * - `nowrap`: Items stay on one line (default)
 * - `wrap`: Items wrap to next line
 * - `wrap-reverse`: Items wrap to previous line
 */
export type StackWrap = keyof typeof wrapClasses;

const gapClasses: Record<SpacingStep, string> = {
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

export {type SpacingStep};

export interface StackOptions {
  /**
   * Position of items along the cross-axis.
   * - For HStack: vertical alignment
   * - For VStack: horizontal alignment
   */
  crossAlign?: StackCrossAlignment;

  /**
   * Direction of the stack.
   */
  direction: StackDirection;

  /**
   * Spacing between items.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   */
  gap?: SpacingStep;

  /**
   * Position of items along the main-axis.
   * - For HStack: horizontal alignment
   * - For VStack: vertical alignment
   */
  mainAlign?: StackMainAlignment;

  /**
   * Whether items should wrap to the next line.
   * - `nowrap`: Items stay on one line (default)
   * - `wrap`: Items wrap to next line
   * - `wrap-reverse`: Items wrap to previous line
   * @default 'nowrap'
   */
  wrap?: StackWrap;
}

export interface StackClassNameOptions extends StackOptions {
  /** Scroll the stack itself instead of its content. */
  scrollable?: boolean;
}

export function stackClassName({
  crossAlign,
  direction,
  gap,
  mainAlign,
  scrollable,
  wrap,
}: StackClassNameOptions): string {
  return tw(
    'flex',
    directionClasses[direction],
    gap != null && gapClasses[gap],
    crossAlign != null && crossAlignClasses[crossAlign],
    mainAlign != null && mainAlignClasses[mainAlign],
    wrap != null && wrapClasses[wrap],
    scrollable === true && 'overflow-auto',
  );
}

/**
 * The class that makes an element a stack (flex container).
 *
 * @example
 * ```
 * import {stack} from '@astryxdesign/core/Layout';
 *
 * // Horizontal stack with numeric gap
 * <div className={stack({direction: 'horizontal', gap: 2})}>
 *   <Child />
 *   <Child />
 * </div>
 *
 * // Vertical stack with centered items
 * <div className={stack({direction: 'vertical', crossAlign: 'center'})}>
 *   <Child />
 * </div>
 * ```
 */
export function stack(options: StackOptions): string {
  return stackClassName(options);
}
