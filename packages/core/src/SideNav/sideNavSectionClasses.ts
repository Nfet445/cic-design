// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file sideNavSectionClasses.ts
 * @input The theme's spacing, type-scale, colour and font-weight variables
 * @output The utility class strings a section group, its header, its title
 *   block and its item stack carry
 * @position Style primitives; the Tailwind build scans it for class names
 *
 * The group and its header add no block padding, so the section's rows keep
 * their own inset and a following heading sits flush against the stack.
 */

import {tw} from '../utils/tw';

export const sideNavSectionClassName = {
  root: 'flex flex-col',
  header: tw(
    'flex items-center',
    'gap-[var(--spacing-0-5)]',
    '[padding-inline:var(--spacing-2)]',
    'cursor-default select-none',
  ),
  titleContainer: 'flex flex-col flex-1 min-w-0',
  title: tw(
    '[font-size:var(--text-supporting-size)]',
    '[font-weight:var(--font-weight-semibold)]',
    '[line-height:var(--text-supporting-leading)]',
    '[color:var(--color-text-secondary)]',
    'overflow-hidden text-ellipsis whitespace-nowrap',
  ),
  subtitle: tw(
    '[font-size:var(--text-supporting-size)]',
    '[line-height:var(--text-supporting-leading)]',
    '[color:var(--color-text-secondary)]',
    'overflow-hidden text-ellipsis whitespace-nowrap',
  ),
  endContent: 'shrink-0 flex items-center',
  items: 'flex flex-col gap-[var(--spacing-0-5)]',
};
