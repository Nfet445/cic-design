// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file rtlClasses.ts
 * @input Nothing; the mirror and the centering are the same for every reader
 * @output The class that horizontally mirrors an element under RTL, and the
 *   classes that center it on the inline axis
 * @position Core utility; the mirror is applied to directional icons in
 *   Calendar, Lightbox, Pagination, Carousel, SideNav and the Table
 *   expand/disclosure plugins, the centering to overlays in Slider, Switch,
 *   Resizable, RadioList, Popover, CheckboxInput and Markdown
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from './tw';

/**
 * `scaleX(-1)`, not `scale(-1, -1)`, so the vertical axis stays. Apply it
 * beside a state-driven rotation: `rotate-*` writes the `rotate` property and
 * this writes `transform`, so a disclosure chevron still rotates down under
 * RTL. It matches an element under `[dir="rtl"]`, so `direction: rtl` alone
 * does not trigger it.
 */
export const RTL_MIRROR_CLASS = 'rtl:[transform:scaleX(-1)]';

/**
 * Centers an absolutely positioned box on the inline axis, in both
 * directions: physical `left` and `translateX(-50%)` name the same edge, so
 * the box centers in LTR and RTL. A logical anchor flips in RTL while the
 * translate does not, which leaves the box off by its own width. The lint
 * rules that guard this pairing only read StyleX maps, so the class spelling
 * needs no suppression.
 */
export const rtlCenterInlineClassName = tw(
  '[left:50%]',
  '[transform:translateX(-50%)]',
);

/**
 * The block axis of `rtlCenterInlineClassName`, by where the anchor sits:
 * `half` centers the box on both axes, `full` drops it one height below. The
 * classes write Tailwind's `translate` property, so the inline `transform`
 * above still applies beside them.
 */
export const rtlCenterInlineBlockOffsetClassName = {
  half: '-translate-y-1/2',
  full: 'translate-y-full',
} as const;
