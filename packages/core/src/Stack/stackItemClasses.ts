// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file stackItemClasses.ts
 * @input Accepts the item options StackItem resolves from its own props
 * @output Tailwind utility class names for one flex item
 * @position Internal to StackItem. The public `stackItem()` StyleX utility
 *   stays in stackItem.stylex.ts.
 *
 * SYNC: keep the option unions here aligned with stackItem.stylex.ts.
 */

import {tw} from '../utils/tw';
import type {StackItemCrossAlignSelf, StackItemSize} from './stackItem.stylex';

const sizeClasses: Record<StackItemSize, string> = {
  fill: 'grow',
  static: 'grow-0 shrink-0',
};

const crossAlignSelfClasses: Record<StackItemCrossAlignSelf, string> = {
  start: 'self-start',
  center: 'self-center',
  end: 'self-end',
  stretch: 'self-stretch',
};

export interface StackItemClassNameOptions {
  crossAlignSelf?: StackItemCrossAlignSelf;
  scrollable?: boolean;
  size?: StackItemSize;
}

export function stackItemClassName({
  crossAlignSelf,
  scrollable,
  size,
}: StackItemClassNameOptions = {}): string {
  return tw(
    'min-h-0 min-w-0',
    sizeClasses[size ?? 'static'],
    crossAlignSelf != null && crossAlignSelfClasses[crossAlignSelf],
    scrollable === true && 'overflow-auto',
  );
}
