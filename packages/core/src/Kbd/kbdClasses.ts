// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file kbdClasses.ts
 * @input None; the shortcut's layout and its key badge do not vary
 * @output The shortcut wrapper and the key badge
 * @position Internal to Kbd; the Tailwind build scans it for class names
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from '../utils/tw';

/** The shortcut's row. It never shrinks beside the text it sits in. */
export const kbdWrapperClassName = 'inline-flex shrink-0 items-center gap-1';

/**
 * One key badge. The theme height holds while one line of text fits; a taller
 * line grows the badge, so the floor is `1lh`, not a pixel value.
 */
export const kbdKeyClassName = tw(
  'inline-flex items-center justify-center',
  'h-5 min-h-[1lh] min-w-5 px-1',
  'rounded-xs border-b-2 border-b-[color:var(--color-border-emphasized)] bg-neutral',
  'text-[length:var(--text-supporting-size)] text-primary',
  'leading-[var(--text-supporting-leading)]',
  'font-[family-name:var(--font-family-body)] font-medium',
  'select-none',
);
