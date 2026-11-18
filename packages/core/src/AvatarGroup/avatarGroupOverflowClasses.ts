// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file avatarGroupOverflowClasses.ts
 * @input None
 * @output Tailwind utility class names for AvatarGroupOverflow's chip
 * @position Style primitives; scanned by the Tailwind build
 */

import {tw} from '../utils/tw';

/**
 * The opaque chip. `inline-flex`, not flex: outside an AvatarGroup this span is
 * not a flex item, and a block-level flex container stretches to its parent's
 * width instead of staying a circle. The border is part of the box so a short
 * count stays a circle at exactly the avatar size while longer content grows
 * into a pill.
 */
const BASE_CLASS = tw(
  'relative inline-flex items-center justify-center',
  // Reads the shape variant's `--_avatar-radius`, shared with Avatar, so the
  // indicator matches the group's shape instead of always staying a circle.
  'rounded-[var(--_avatar-radius)]',
  'bg-[var(--color-background-surface)] text-[color:var(--color-text-secondary)]',
  'font-[family-name:var(--font-family-body)] font-medium select-none',
  'border-2 border-[color:var(--color-background-surface)] box-border',
  // Breathing room so multi-digit counts do not crowd the pill's edges.
  'px-[var(--spacing-2)]',
  // Neutral tint layer, painted over the opaque base from `base`.
  'bg-[linear-gradient(var(--color-neutral),var(--color-neutral))]',
);

export const avatarGroupOverflowClassName = {
  base: BASE_CLASS,
  /**
   * The interactive chip resets only the UA button's block padding; the inline
   * padding above provides the pill's breathing room.
   */
  button: tw(
    'cursor-pointer py-0',
    'disabled:cursor-default',
    'aria-disabled:cursor-default',
  ),
  /**
   * Matches Avatar's own overlap rule. AvatarGroup pads its start edge by the
   * same amount, so the indicator stays inside the group's box even when it is
   * the first child.
   */
  overlap: 'ms-[var(--_avatar-group-overlap)]',
} as const;
