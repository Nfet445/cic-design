// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file focusOutlineClasses.ts
 * @input The theme's `--focus-outline-*` variables
 * @output The class arms of every shared focus ring, beside
 *   `focusOutlineStyles`
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

/**
 * The ring on a wrapper whose descendant took focus. A variant beats a rest
 * state on specificity — `:has()` puts the arm at (0,3,0) — so a component's
 * own `[outline-style:none]` cannot eat it, whatever order the rules print
 * in.
 */
export const focusOutlineWithinClassName = tw(
  '[outline-width:0]',
  '[outline-style:none]',
  '[outline-offset:0]',
  '[&:has(:focus-visible)]:[outline-width:var(--focus-outline-width)]',
  '[&:has(:focus-visible)]:[outline-style:var(--focus-outline-style)]',
  '[&:has(:focus-visible)]:[outline-color:var(--focus-outline-color)]',
  '[&:has(:focus-visible)]:[outline-offset:var(--focus-outline-offset)]',
);

/**
 * The ring on a wrapper whose FIRST child took focus, for a primary control
 * that rings itself while its siblings do too: plain `:has(:focus-visible)`
 * would light the whole row on top of the focused control's own ring.
 */
export const focusOutlineWithinFirstChildClassName = tw(
  '[outline-width:0]',
  '[outline-style:none]',
  '[outline-offset:0]',
  '[&:has(>_:first-child:focus-visible)]:[outline-width:var(--focus-outline-width)]',
  '[&:has(>_:first-child:focus-visible)]:[outline-style:var(--focus-outline-style)]',
  '[&:has(>_:first-child:focus-visible)]:[outline-color:var(--focus-outline-color)]',
  '[&:has(>_:first-child:focus-visible)]:[outline-offset:var(--focus-outline-offset)]',
);

/**
 * The ring on a control box that draws the ring for its combobox trigger
 * while the other controls inside it ring themselves.
 */
export const focusOutlineWithinComboboxClassName = tw(
  '[outline-width:0]',
  '[outline-style:none]',
  '[outline-offset:0]',
  '[&:has(>_[role=combobox]:focus-visible)]:[outline-width:var(--focus-outline-width)]',
  '[&:has(>_[role=combobox]:focus-visible)]:[outline-style:var(--focus-outline-style)]',
  '[&:has(>_[role=combobox]:focus-visible)]:[outline-color:var(--focus-outline-color)]',
  '[&:has(>_[role=combobox]:focus-visible)]:[outline-offset:var(--focus-outline-offset)]',
);

/**
 * Draws no ring and keeps the UA's own off, for an element whose ring an
 * ancestor draws. The reset is not optional: dropping the ring from a control
 * also drops the suppression every ring arm states, and a bare `<button>`
 * would draw the UA ring inside the ancestor's.
 */
export const focusOutlineSuppressedClassName = tw(
  '[outline-width:0]',
  '[outline-style:none]',
  '[outline-offset:0]',
);

/**
 * Publishes the ring for a descendant that draws it with
 * {@link focusOutlineWithinOrPublishedClassName}: a wrapper hands its own
 * focus state to a child drawn elsewhere in the tree.
 */
export const focusOutlinePublishVarsClassName = tw(
  '[--_focus-outline:none]',
  '[--_focus-outline-offset:0]',
  'focus-visible:[--_focus-outline:var(--focus-outline-width)_var(--focus-outline-style)_var(--focus-outline-color)]',
  'focus-visible:[--_focus-outline-offset:var(--focus-outline-offset)]',
);

/**
 * Draws the ring published by {@link focusOutlinePublishVarsClassName} while
 * the element itself has focus, and its own ring while a descendant does.
 */
export const focusOutlineWithinOrPublishedClassName = tw(
  '[outline:var(--_focus-outline,none)]',
  '[outline-offset:var(--_focus-outline-offset,0)]',
  '[&:has(:focus-visible)]:[outline:var(--focus-outline-width)_var(--focus-outline-style)_var(--focus-outline-color)]',
  '[&:has(:focus-visible)]:[outline-offset:var(--focus-outline-offset)]',
);
