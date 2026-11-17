// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file menuBottomSheetClasses.ts
 * @input The menu's sheet presentation: its content box and the action list
 *   inside it
 * @output The class maps for a menu's bottom-sheet content box and for the
 *   action list the sheet renders its rows in
 * @position Style primitives; scanned by the Tailwind build. The sheet's
 *   presenters compose these with `tw`
 */

import {tw} from '../utils/tw';

/**
 * The menu's own content element carries the inset a wrapper used to:
 * `MenuBottomSheet` gives the sheet no content padding, so the sheet keeps only
 * the band under its grab bar above the first row, and this element keeps the
 * side inset. The container variables tell bleeding children the padding
 * actually applied.
 */
export const menuBottomSheetClassName = {
  content: tw(
    'box-border',
    '[padding-block:0]',
    '[padding-inline:var(--spacing-1)]',
    '[--container-padding-inline-start:var(--spacing-1)]',
    '[--container-padding-inline-end:var(--spacing-1)]',
    '[--container-padding-block-start:0px]',
    '[--container-padding-block-end:0px]',
  ),
  // The heading alone, without a back button beside it, keeps the row's gap to
  // the actions.
  headingAlone: '[margin-bottom:var(--spacing-2)]',
} as const;

/** The action list's rows and the groups inside it. */
export const menuBottomSheetActionListClassName = {
  // The row under a held finger is the highlight; the browser's held-press
  // callout and text selection must not compete with it.
  list: tw('[-webkit-touch-callout:none]', 'select-none'),
  destructiveAction: tw(
    'text-[color:var(--color-text-error)]',
    '[--_item-label-color:var(--color-text-error)]',
    '[--_item-description-color:var(--color-text-error)]',
  ),
  structuralItem: '[list-style-type:none]',
  section: 'flex flex-col gap-[var(--spacing-1)]',
  sectionHeading: '[padding-inline:var(--spacing-3)]',
} as const;
