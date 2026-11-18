// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file iconBoxClasses.ts
 * @input The size step a component gives an icon it renders itself
 * @output Tailwind utility class names for a component-owned icon box
 * @position Style primitives; scanned by the Tailwind build
 *
 * A theme writes `width` and `height` on the `icon` target's size selector,
 * and the derived-var registry emits them as `--_icon-width` /
 * `--_icon-height`, so the box reads both vars and keeps a themed box in step
 * with the glyph it holds. The step's own rem values are the fallbacks, so an
 * unthemed box keeps the dimensions its row was measured with. `font-size`
 * follows the box's smaller side and keeps 1em-based artwork in step.
 */

import type {IconSize} from './IconSize';

export const iconBoxClassName: Record<IconSize, string> = {
  xsm: '[width:var(--_icon-width,0.75rem)] [height:var(--_icon-height,0.75rem)] [font-size:min(var(--_icon-width,0.75rem),var(--_icon-height,0.75rem))]',
  sm: '[width:var(--_icon-width,1rem)] [height:var(--_icon-height,1rem)] [font-size:min(var(--_icon-width,1rem),var(--_icon-height,1rem))]',
  md: '[width:var(--_icon-width,1.25rem)] [height:var(--_icon-height,1.25rem)] [font-size:min(var(--_icon-width,1.25rem),var(--_icon-height,1.25rem))]',
  lg: '[width:var(--_icon-width,1.5rem)] [height:var(--_icon-height,1.5rem)] [font-size:min(var(--_icon-width,1.5rem),var(--_icon-height,1.5rem))]',
};
