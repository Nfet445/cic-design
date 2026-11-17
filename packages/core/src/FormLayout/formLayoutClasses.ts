// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file formLayoutClasses.ts
 * @input None; each direction is one fixed arrangement
 * @output One class string per layout direction
 * @position Internal to FormLayout; the Tailwind build scans it for class names
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from '../utils/tw';

/**
 * The form's own arrangement. One direction is chosen in JavaScript rather than
 * layered over the stack: `display` cannot carry both a flex and a grid class.
 */
export const formLayoutDirectionClassName = {
  /** Fields stack top to bottom. */
  vertical: 'flex flex-col gap-[var(--spacing-4)]',
  /** One `1fr` track per field, in logical inline order. */
  horizontal: tw(
    'grid grid-flow-col auto-cols-[1fr]',
    'gap-[var(--spacing-4)]',
  ),
  /**
   * Labels sit inline-start of their fields. Below 480px the row becomes the
   * stack, with the row gap in place of the two-axis one.
   */
  'horizontal-labels': tw(
    'grid grid-cols-[auto_1fr] items-start',
    'gap-x-[var(--spacing-4)] gap-y-[var(--spacing-3)]',
    'max-[480px]:flex max-[480px]:flex-col max-[480px]:items-stretch',
    'max-[480px]:gap-x-[var(--spacing-4)] max-[480px]:gap-y-[var(--spacing-4)]',
  ),
} as const;
