// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file infoTipClasses.ts
 * @input None; the info button's shape and its two colour states do not vary
 * @output The info button
 * @position Internal to InfoTip; the Tailwind build scans it for class names
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from '../utils/tw';

/**
 * The info button. The hover tint skips a disabled or aria-disabled button, and
 * `pointer-fine` keeps it off a touch screen's sticky hover.
 */
export const infoTipTriggerClassName = tw(
  'relative inline-flex items-center justify-center align-middle',
  'm-0 border-none bg-transparent p-[var(--spacing-0-5)] rounded-full',
  'cursor-pointer disabled:cursor-default aria-disabled:cursor-default',
  'text-[color:var(--color-icon-secondary)]',
  'pointer-fine:not-disabled:[&:not([aria-disabled=true])]:hover:text-[color:var(--color-icon-primary)]',
  'transition-[color] duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
);
