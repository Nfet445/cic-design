// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file alertDialogClasses.ts
 * @input Whether the alert stacks its actions on a small screen and whether the
 *   touch tracker owns the row
 * @output Utility class strings for the alert's action row and its buttons
 * @position AlertDialog style primitives; scanned by the Tailwind build
 *
 * Button already keeps an action at `min-w-0 max-w-full`, so only the stacked
 * width and the row's gesture policy need a class here.
 */

/** The touch tracker's gesture host keeps an author's narrower touch action. */
export const alertDialogActionsRowClassName = '[touch-action:pinch-zoom]';

/** A stacked action fills the column the small screen lays out. */
export const alertDialogStackedActionClassName = 'w-full';
