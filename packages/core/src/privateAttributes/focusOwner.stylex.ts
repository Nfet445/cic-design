// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file privateAttributes/focusOwner.stylex.ts
 * @input The focus ring classes (privateAttributes/focusOwnerClasses.ts)
 * @output focusOwnerProps, which mark the control a wrapper rings for,
 *   focusOwnerGroupProps, which mark a layout cell that holds that control one
 *   level down, and the two ring classes for the wrapper
 * @position Owner module of the private focus-owner attribute: the only file
 *   that writes its name. Core wrappers spread these exports. No package entry
 *   exports it.
 */

/** Spread on the wrapper's primary control: the control the ring is for. */
export const focusOwnerProps = {'data-astryx-focus-owner': ''} as const;

/**
 * Spread on a layout cell that holds the primary control one level down, such
 * as Item's content cell beside a list marker, so the wrapper ring still
 * reaches the control. focusOwnerRingClassName reads it; the overlay ring does
 * not.
 */
export const focusOwnerGroupProps = {
  'data-astryx-focus-owner': 'group',
} as const;

/**
 * The wrapper's focus ring, and the same ring drawn above the wrapper's
 * content. Both conditions are in the class text: a caller that carries one
 * does not set `outline` on the same element.
 */
export {
  focusOwnerRingClassName,
  focusOwnerOverlayRingClassName,
} from './focusOwnerClasses';
