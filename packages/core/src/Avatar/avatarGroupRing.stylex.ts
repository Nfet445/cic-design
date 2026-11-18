// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file avatarGroupRing.stylex.ts
 * @input The group's overlap offset in pixels
 * @output StyleX styles for a grouped face's ring and step
 * @position Avatar internals; consumed by Avatar.tsx
 *
 * These two stay StyleX rather than joining `avatarClasses.ts`. A member
 * receives its caller's `className` after our own, so a `border-0`, `border-*`
 * or `ms-*` utility there would win a sheet-order tie against a class-based
 * ring or step; an unlayered StyleX rule answers the same utility. The step is
 * also a declaration AvatarGroup reads back per member, and that family pads
 * its start edge by exactly this offset.
 */

import * as stylex from '@stylexjs/stylex';

const BORDER_WIDTH = 2;

export const avatarGroupStyles = stylex.create({
  ring: {
    borderWidth: BORDER_WIDTH,
    borderStyle: 'solid',
    borderColor: 'var(--color-background-surface)',
    backgroundColor: 'var(--color-background-surface)',
    // The ring sits outside the box, so a grouped face reads as one shape
    // whether or not its own picture shows a border.
    boxSizing: 'content-box',
  },
  // Every avatar takes the overlap, not just `:not(:first-child)`: a
  // HoverCard or Tooltip wraps its trigger in its own element, which makes
  // every wrapped avatar a first child.
  overlap: {
    marginInlineStart: 'var(--_avatar-group-overlap)',
  },
});

export const avatarGroupDynamicStyles = stylex.create({
  overlap: (offset: number) => ({
    '--_avatar-group-overlap': `${offset}px`,
  }),
});
