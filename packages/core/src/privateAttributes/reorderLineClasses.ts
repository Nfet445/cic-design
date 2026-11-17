// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file privateAttributes/reorderLineClasses.ts
 * @input A reorderable List's root while its insertion line shows
 * @output The class that shows that line while the list is marked
 * @position Style primitives; scanned by the Tailwind build
 */

import {tw} from '../utils/tw';

/**
 * Compose on the list's own `::after`, which carries the insertion line. The
 * line hides until the reorder machinery marks the list.
 *
 * The pair sets `display` alone: the pseudo-element's `content`, size and
 * colour belong to the list's own style, which stays where it is. The arms
 * carry their own `::after` rather than Tailwind's `after:` variant, which
 * would also declare `content`.
 */
export const reorderLineClassName = tw(
  '[&::after]:hidden',
  /* eslint-disable @astryx/no-raw-private-attribute -- Tailwind scans class text, so the attribute has to be spelled here */
  '[&[data-astryx-reorder-line]::after]:block',
  /* eslint-enable @astryx/no-raw-private-attribute */
);
