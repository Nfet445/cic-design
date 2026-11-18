// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file IconSize.ts
 * @input Defines the Icon size scale
 * @output Exports the iconSizeValues scale and the IconSize type
 * @position Internal Icon sizing source; Icon.tsx reads the scale, and
 *   IconSize.stylex.ts keeps the deprecated StyleX view of it
 */

/**
 * Icon sizes are expressed in `rem` so they scale with the root font-size.
 * Values are the px-equivalents at a 16px root: 12, 16, 20, and 24px.
 */
export const iconSizeValues = {
  xsm: '0.75rem',
  sm: '1rem',
  md: '1.25rem',
  lg: '1.5rem',
} as const;

export type IconSize = keyof typeof iconSizeValues;
