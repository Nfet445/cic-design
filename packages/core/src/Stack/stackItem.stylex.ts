// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file stackItem.stylex.ts
 * @input The option unions and the `stackItem()` builder in
 *   `stackItemClasses.ts`
 * @output The same option names and `stackItem()` builder this public subpath
 *   always published, now as a class name
 * @position Public subpath `@astryxdesign/core/Stack/stackItem.stylex`, kept so
 *   existing imports resolve.
 *
 * It carries no StyleX rule: `stackItem()` returns a class string, so pass it
 * to `className` and not to `stylex.props`.
 *
 * SYNC: When modified, update /packages/core/src/Stack/Stack.doc.mjs
 */

export {
  stackItem,
  stackItemClassName,
  type StackItemClassNameOptions,
  type StackItemCrossAlignSelf,
  type StackItemOptions,
  type StackItemSize,
} from './stackItemClasses';
