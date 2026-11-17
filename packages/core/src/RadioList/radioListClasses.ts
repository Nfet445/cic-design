// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file radioListClasses.ts
 * @input The list's orientation
 * @output The flex row the radiogroup is laid out in
 * @position Internal to RadioList; the Tailwind build scans it for class names
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from '../utils/tw';

/** The group is one flex row or column; each orientation owns both its axis and gap. */
export function radioListClassName({
  orientation,
}: {
  orientation: 'vertical' | 'horizontal';
}): string {
  return tw(
    'flex',
    orientation === 'vertical'
      ? 'flex-col gap-[var(--spacing-2)]'
      : 'flex-row gap-[var(--spacing-5)]',
  );
}
