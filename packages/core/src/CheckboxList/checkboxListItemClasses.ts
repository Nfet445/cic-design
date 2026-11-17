// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file checkboxListItemClasses.ts
 * @input Whether the row's checkbox is checked and the row is interactive
 * @output The fill class a checked row carries
 * @position Internal to CheckboxListItem; the Tailwind build scans it for
 *   class names
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {itemSelectedClassName} from '../Item/itemClasses';
import {tw} from '../utils/tw';

/**
 * A checked row takes the same fill Item gives a selected row, so a theme that
 * restyles one restyles the other: a checked row is selected here too, and the
 * fill follows the row's `data-selected`.
 */
export const checkboxListItemSelectedClassName = itemSelectedClassName;

/**
 * The row's fill. The class lands after the row's own classes and before the
 * caller's `className`, so a consumer class still wins.
 */
export function checkboxListItemClassName({
  isSelected,
  className,
}: {
  isSelected: boolean;
  className: string | undefined;
}): string {
  return tw(isSelected && checkboxListItemSelectedClassName, className);
}
