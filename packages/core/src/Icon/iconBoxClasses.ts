// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file iconBoxClasses.ts
 * @input The size step a component gives an icon it renders itself
 * @output Tailwind utility class names for a component-owned icon box
 * @position Style primitives; scanned by the Tailwind build
 *
 * The box pins the step's own rem values, so a themed glyph size cannot open a
 * hole in a row whose height the box sets. `font-size` keeps 1em-based artwork
 * in step with the box.
 */

import type {IconSize} from './IconSize';

export const iconBoxClassName: Record<IconSize, string> = {
  xsm: '[width:0.75rem] [height:0.75rem] [font-size:0.75rem]',
  sm: '[width:1rem] [height:1rem] [font-size:1rem]',
  md: '[width:1.25rem] [height:1.25rem] [font-size:1.25rem]',
  lg: '[width:1.5rem] [height:1.5rem] [font-size:1.5rem]',
};
