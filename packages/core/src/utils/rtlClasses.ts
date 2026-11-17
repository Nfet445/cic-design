// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file rtlClasses.ts
 * @input Nothing; the mirror is the same for every directional glyph
 * @output The class that horizontally mirrors an element under RTL
 * @position Core utility; applied to directional icons in Calendar, Lightbox,
 *   Pagination, Carousel, SideNav and the Table expand/disclosure plugins
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

/**
 * `scaleX(-1)`, not `scale(-1, -1)`, so the vertical axis stays. Apply it
 * beside a state-driven rotation: `rotate-*` writes the `rotate` property and
 * this writes `transform`, so a disclosure chevron still rotates down under
 * RTL. It matches an element under `[dir="rtl"]`, so `direction: rtl` alone
 * does not trigger it.
 */
export const RTL_MIRROR_CLASS = 'rtl:[transform:scaleX(-1)]';
