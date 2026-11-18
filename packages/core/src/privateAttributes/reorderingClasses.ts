// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file privateAttributes/reorderingClasses.ts
 * @input The reordering mark on an ancestor of a reorder handle
 * @output The handle's cursor: a grab that becomes grabbing while its list
 *   reorders, and the default cursor when the handle is disabled
 * @position Style primitives; scanned by the Tailwind build
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from '../utils/tw';

/**
 * Grabbing while its list reorders: a drag holds the pointer. Not `:active`:
 * that is the touch press controller's arm, and the handle paints no press.
 * A disabled handle says default even under the mark, because the disabled
 * selector is the more specific of the two.
 */
export const reorderingHandleCursorClassName = tw(
  'cursor-grab',
  /* eslint-disable @astryx/no-raw-private-attribute -- Tailwind scans class text, so the attribute has to be spelled here */
  '[[data-astryx-reordering]_&]:cursor-grabbing',
  /* eslint-enable @astryx/no-raw-private-attribute */
  '[&:is(:disabled,[aria-disabled="true"])]:cursor-default',
);
