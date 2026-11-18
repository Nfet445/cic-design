// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file alertDialogClasses.ts
 * @input Whether the alert stacks its actions on a small screen and whether the
 *   touch tracker owns the row or drives the dialog
 * @output Utility class strings for the alert's action row, its buttons, and
 *   the touch motion
 * @position AlertDialog style primitives; scanned by the Tailwind build
 *
 * Button already keeps an action at `min-w-0 max-w-full`, so only the stacked
 * width and the row's gesture policy need a class here.
 */

import {tw} from '../utils/tw';

/**
 * Turns the theme's entrance animation off while the touch motion drives the
 * dialog, and promotes the backdrop's dimming to its own layer.
 *
 * The dialog carries the entrance as `open:[animation-name:…]`, which is one
 * class plus the `open` attribute. Repeating the attribute doubles that
 * compound, so this class wins whatever order the two rules print in.
 * Mobile Safari keeps a backdrop animation on the main thread at its first
 * commit without the promotion.
 */
export const alertDialogTouchMotionClassName = tw(
  '[&[open][open]]:[animation-name:none]',
  'backdrop:[will-change:var(--astryx-motion-will-change-backdrop,auto)]',
);

/** The touch tracker's gesture host keeps an author's narrower touch action. */
export const alertDialogActionsRowClassName = '[touch-action:pinch-zoom]';

/** A stacked action fills the column the small screen lays out. */
export const alertDialogStackedActionClassName = 'w-full';
