// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file focusOutlineClasses.ts
 * @input The theme's `--focus-outline-*` variables
 * @output The class arm of the shared focus ring, beside
 *   `focusOutlineStyles.focusVisible`
 * @position Published from `@astryxdesign/core/utils` for a composer that
 *   draws the ring without StyleX; the Tailwind build scans it for class names
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 *
 * The four outline longhands are deliberate, as they are in the StyleX arm: an
 * `outline` shorthand resets the caller's own `outline-color` and
 * `outline-offset`, and the ring then decides all four.
 *
 * The ring is declared on `:focus-visible` only. A caller that wants
 * `:focus-within` (a wrapper around the control) writes that variant itself,
 * because a wrapper's `:focus-visible` never matches.
 */

import {tw} from './tw';

/**
 * The shared focus ring: no outline at rest, the theme's width, style, colour
 * and offset on `:focus-visible`.
 */
export const focusOutlineFocusVisibleClassName = tw(
  '[outline-width:0]',
  '[outline-style:none]',
  '[outline-offset:0]',
  'focus-visible:[outline-width:var(--focus-outline-width)]',
  'focus-visible:[outline-style:var(--focus-outline-style)]',
  'focus-visible:[outline-color:var(--focus-outline-color)]',
  'focus-visible:[outline-offset:var(--focus-outline-offset)]',
);
