// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file containerCornersClasses.ts
 * @input Reads `--_container-corner-block-start` and `--_container-corner-block-end`,
 *   which a rounded host sets to its radius at each block edge
 * @output Tailwind utility class names that publish `--container-corner-*`
 * @position Layout utility beside `container()`; Card and Dialog publish the
 *   corners their first and last children may take
 *
 * A corner goes only to the host's first or last child when that child reads
 * corners (it carries `data-container-corner`). A reader deeper inside could
 * take a corner it does not reach, so then no corner goes out.
 *
 * The `--container-corner-*` variables are in the shipped CSS, but no API
 * documents them; only Table and List read them.
 *
 * SYNC: packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 * checks the rules these classes print.
 */

import {tw} from '../utils/tw';

/** Corner publication for a rounded padding publisher (Card, Dialog). */
export const containerCornerClassName = tw(
  '[--container-corner-start-start:0px]',
  '[--container-corner-start-end:0px]',
  '[--container-corner-end-start:0px]',
  '[--container-corner-end-end:0px]',
  '[&:has(>_[data-container-corner]:first-child)]:[--container-corner-start-start:var(--_container-corner-block-start,0px)]',
  '[&:has(>_[data-container-corner]:first-child)]:[--container-corner-start-end:var(--_container-corner-block-start,0px)]',
  '[&:has(>_[data-container-corner]:last-child)]:[--container-corner-end-start:var(--_container-corner-block-end,0px)]',
  '[&:has(>_[data-container-corner]:last-child)]:[--container-corner-end-end:var(--_container-corner-block-end,0px)]',
  '[&:has(>_[data-container-corner]:first-child):has(>_*_[data-container-corner])]:[--container-corner-start-start:0px]',
  '[&:has(>_[data-container-corner]:first-child):has(>_*_[data-container-corner])]:[--container-corner-start-end:0px]',
  '[&:has(>_[data-container-corner]:last-child):has(>_*_[data-container-corner])]:[--container-corner-end-start:0px]',
  '[&:has(>_[data-container-corner]:last-child):has(>_*_[data-container-corner])]:[--container-corner-end-end:0px]',
);
