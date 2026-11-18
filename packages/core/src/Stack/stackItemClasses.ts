// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file stackItemClasses.ts
 * @input Accepts the item options a caller resolves from its own props
 * @output Tailwind utility class names for one flex item, and the `stackItem()`
 *   builder that `@astryxdesign/core/Stack/stackItem.stylex` publishes
 * @position Layout utility; used by StackItem, and by components that size
 *   themselves inside a stack
 *
 * SYNC: When modified, update /packages/core/src/Stack/Stack.doc.mjs
 */

import {tw} from '../utils/tw';

const sizeClasses: Record<'fill' | 'static', string> = {
  /**
   * Fill the remaining space inside of the stack.
   * Will split the space evenly among other items with "fill".
   */
  fill: 'grow',
  /**
   * Do not grow or shrink within the stack.
   * Use the intrinsic size of the item.
   */
  static: 'grow-0 shrink-0',
};

/**
 * Size options for stack items.
 * - `static`: Item uses its intrinsic size, won't grow or shrink
 * - `fill`: Item grows to fill remaining space
 */
export type StackItemSize = keyof typeof sizeClasses;

const crossAlignSelfClasses: Record<
  'start' | 'center' | 'end' | 'stretch',
  string
> = {
  start: 'self-start',
  center: 'self-center',
  end: 'self-end',
  stretch: 'self-stretch',
};

/**
 * Cross-alignment options for stack items.
 * Overrides the default cross-alignment set on the parent stack.
 */
export type StackItemCrossAlignSelf = keyof typeof crossAlignSelfClasses;

export interface StackItemOptions {
  /**
   * Overrides the default cross-alignment for this item.
   * (hAlign for VStack, vAlign for HStack)
   *
   * Set cross-alignment on the stack itself and override individual
   * children as needed with this option.
   */
  crossAlignSelf?: StackItemCrossAlignSelf;

  /**
   * Size behavior of the item within the stack.
   * - `static`: Uses intrinsic size, won't grow or shrink (default)
   * - `fill`: Grows to fill remaining space
   *
   * @default "static"
   */
  size?: StackItemSize;
}

export interface StackItemClassNameOptions extends StackItemOptions {
  /** Scroll the item itself instead of its content. */
  scrollable?: boolean;
}

export function stackItemClassName({
  crossAlignSelf,
  scrollable,
  size,
}: StackItemClassNameOptions = {}): string {
  return tw(
    // Flex items have an implicit minimum size of auto, so they would never
    // shrink below their content; the reset lets the parent constrain them.
    'min-h-0 min-w-0',
    sizeClasses[size ?? 'static'],
    crossAlignSelf != null && crossAlignSelfClasses[crossAlignSelf],
    scrollable === true && 'overflow-auto',
  );
}

/**
 * The class that sizes one item inside a stack.
 *
 * @example
 * ```
 * import {stackItem} from '@astryxdesign/core/Layout';
 *
 * <div className={stackItem({size: 'fill'})}>Content that fills the rest</div>
 * ```
 */
export function stackItem(options: StackItemOptions = {}): string {
  return stackItemClassName(options);
}
