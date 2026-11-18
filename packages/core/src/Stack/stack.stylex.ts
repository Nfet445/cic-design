// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file stack.stylex.ts
 * @input The option unions and the `stack()` builder in `stackClasses.ts`
 * @output The same option names and `stack()` builder this public subpath
 *   always published, now as a class name
 * @position Public subpath `@astryxdesign/core/Stack/stack.stylex`, kept so
 *   existing imports resolve.
 *
 * It carries no StyleX rule: `stack()` returns a class string, so pass it to
 * `className` and not to `stylex.props`.
 *
 * SYNC: When modified, update /packages/core/src/Stack/Stack.doc.mjs
 */

export {
  stack,
  stackClassName,
  type StackClassNameOptions,
  type StackCrossAlignment,
  type StackDirection,
  type StackMainAlignment,
  type StackOptions,
  type StackWrap,
} from './stackClasses';
export {type SpacingStep} from '../utils/types';
