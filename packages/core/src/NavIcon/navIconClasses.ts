// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file navIconClasses.ts
 * @input None; the disc has one size and one paint
 * @output The circular icon container
 * @position Internal to NavIcon; the Tailwind build scans it for class names
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from '../utils/tw';

/** The accent disc a navigation header shows as its logo. */
export const navIconClassName = tw(
  'flex items-center justify-center',
  'shrink-0 rounded-full',
  'w-[var(--size-element-md)] h-[var(--size-element-md)]',
  'bg-[var(--color-accent)] text-[color:var(--color-on-accent)]',
);
