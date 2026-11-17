// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file bottomSheetEdgeTintClasses.ts
 * @input Nothing at runtime; the strip has one fixed shape
 * @output The utility class string for the iOS toolbar edge tint
 * @position BottomSheet style primitive; scanned by the Tailwind build
 *
 * WebKit samples the computed style of this box, so every utility here is read
 * by a browser heuristic, not by a person. The `12px` height clears WebKit's
 * 10px floor below which it ignores the declared colour. The mask, not
 * `visibility` or `opacity`, hides the strip: WebKit disqualifies a box it
 * cannot see those ways, and a mask does not.
 */

import {tw} from '../utils/tw';

const TINT = tw(
  'fixed',
  'inset-x-0',
  'bottom-0',
  'h-[12px]',
  'z-[2]',
  'pointer-events-none',
  'bg-[var(--color-background-surface)]',
  '[mask-image:linear-gradient(transparent,transparent)]',
  '[-webkit-mask-image:linear-gradient(transparent,transparent)]',
);

/** The class set of the edge tint strip. */
export const bottomSheetEdgeTintClassName = TINT;
