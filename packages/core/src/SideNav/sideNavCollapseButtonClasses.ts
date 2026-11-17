// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file sideNavCollapseButtonClasses.ts
 * @input The theme's duration and easing variables
 * @output The utility class strings the collapse button's glyph wrapper and
 *   its chevron carry
 * @position Style primitives; the Tailwind build scans it for class names
 *
 * The rotation and the RTL mirror stay on separate elements: both write
 * `transform`, so on one element one would overwrite the other.
 */

export const sideNavCollapseButtonClassName = {
  chevronMirror: 'flex items-center justify-center',
  chevron:
    'inline-flex items-center transition-[transform] duration-[var(--duration-fast)] ease-[var(--ease-standard)] motion-reduce:[transition-duration:0s]',
  chevronCollapsed: 'rotate-180',
};
