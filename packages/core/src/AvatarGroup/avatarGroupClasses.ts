// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file avatarGroupClasses.ts
 * @input None
 * @output Tailwind utility class names for AvatarGroup's row, and the custom
 *   property the group publishes to its children
 * @position Style primitives; scanned by the Tailwind build
 */

import {tw} from '../utils/tw';

/** The overlap each child reads back as a negative start margin. */
export const AVATAR_GROUP_OVERLAP_VAR = '--_avatar-group-overlap';

/**
 * Every avatar takes the negative overlap, the first one included, so the
 * overlap survives the `display: contents` wrapper a HoverCard or Tooltip adds
 * around its trigger. The start padding gives that first child its space back,
 * and an empty group adds none.
 */
export const avatarGroupClassName = tw(
  'inline-flex items-center',
  'ps-[calc(-1*var(--_avatar-group-overlap))]',
  'empty:ps-0',
);
