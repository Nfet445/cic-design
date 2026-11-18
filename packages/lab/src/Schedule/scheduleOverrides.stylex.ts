// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file scheduleOverrides.stylex.ts
 * @input Nothing: every rule is fixed
 * @output The time grid's keyboard focus ring, the month cell's inward ring
 *   offset, and the event popover's height cap
 * @position Style exception; the views pass them through `xstyle` and
 *   `mergeProps`
 *
 * The ring shows while the viewport beside it holds keyboard focus, so it needs
 * a previous-sibling condition on a style marker (`schedule.stylex.ts`) that no
 * class variant expresses. The month cell's rule must beat the shared ring's
 * `focus-visible:[outline-offset:var(--focus-outline-offset)]` inside
 * `@layer astryx-base`, so it stays unlayered StyleX and only pulls the offset
 * inward. The cap needs `stylex.firstThatWorks` to prefer the dynamic block
 * size. The ring also lives on a scrollable-area prop that only takes StyleX.
 */

import * as stylex from '@stylexjs/stylex';
import {focusVarNames, spacingVarNames} from '@astryxdesign/core/theme';
import {timeGridViewportScope} from './schedule.stylex';

// The keyboard focus ring of the viewport: a pointer-transparent overlay laid
// over the whole viewport (scrollbar included) and painted after the viewport's
// stacking context, so every edge of the ring is visible above the pinned
// parts. It shows while the viewport before it has keyboard focus, drawn just
// inside the edge the frame clips at.
export const scheduleTimeGridFocusRingStyles = stylex.create({
  base: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    outlineWidth: {
      default: 0,
      [stylex.when.siblingBefore(':focus-visible', timeGridViewportScope)]:
        'var(--focus-outline-width)',
    },
    outlineStyle: {
      default: 'none',
      [stylex.when.siblingBefore(':focus-visible', timeGridViewportScope)]:
        'var(--focus-outline-style)',
    },
    outlineColor: {
      default: 'transparent',
      [stylex.when.siblingBefore(':focus-visible', timeGridViewportScope)]:
        'var(--focus-outline-color)',
    },
    outlineOffset: `calc(-1 * var(--focus-outline-width))`,
  },
});

// The popover keeps to the viewport the way the Popover component does: it never
// grows past the visible block size, minus the surface padding.
export const scheduleEventPopoverBodyStyles = stylex.create({
  base: {
    maxBlockSize: stylex.firstThatWorks(
      `calc(100dvb - 2 * var(--spacing-4) - 2 * var(--spacing-3))`,
      `calc(100vh - 2 * var(--spacing-4) - 2 * var(--spacing-3))`,
    ),
  },
});

// A month cell draws its ring inside its own borders, so the grid lines stay
// visible around the focused day. The ring itself is
// `focusOutlineFocusVisibleClassName`; this unlayered rule only pulls the
// offset inward, because a layered utility cannot outrank the ring's own
// `focus-visible` offset.
export const scheduleMonthCellFocusStyles = stylex.create({
  base: {
    outlineOffset: {
      default: null,
      ':focus-visible': `calc(-1 * var(--focus-outline-width))`,
    },
  },
});
