// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file stackClasses.ts
 * @input Accepts the stack options Stack resolves from its own props
 * @output Tailwind utility class names for the stack's flex layout
 * @position Internal to Stack. The public `stack()` StyleX utility stays in
 *   stack.stylex.ts for consumers who compose stack styles themselves.
 *
 * SYNC: keep the option unions here aligned with stack.stylex.ts.
 */

import {tw} from '../utils/tw';
import type {SpacingStep} from '../utils/types';
import type {
  StackCrossAlignment,
  StackDirection,
  StackMainAlignment,
  StackWrap,
} from './stack.stylex';

const directionClasses: Record<StackDirection, string> = {
  horizontal: 'flex-row',
  vertical: 'flex-col',
};

const mainAlignClasses: Record<StackMainAlignment, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

const crossAlignClasses: Record<StackCrossAlignment, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const wrapClasses: Record<StackWrap, string> = {
  nowrap: 'flex-nowrap',
  wrap: 'flex-wrap',
  'wrap-reverse': 'flex-wrap-reverse',
};

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

export interface StackClassNameOptions {
  crossAlign?: StackCrossAlignment;
  direction: StackDirection;
  gap?: SpacingStep;
  mainAlign?: StackMainAlignment;
  wrap?: StackWrap;
}

export function stackClassName({
  crossAlign,
  direction,
  gap,
  mainAlign,
  wrap,
}: StackClassNameOptions): string {
  return tw(
    'flex',
    directionClasses[direction],
    gap != null && gapClasses[gap],
    crossAlign != null && crossAlignClasses[crossAlign],
    mainAlign != null && mainAlignClasses[mainAlign],
    wrap != null && wrapClasses[wrap],
  );
}
