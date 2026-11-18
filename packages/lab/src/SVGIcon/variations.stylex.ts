// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file variations.stylex.ts
 * @input Icon token vars
 * @output StyleX styles for each icon variation preset
 * @position Consumed by SVGIcon to apply variation-specific token overrides
 *
 * Stays StyleX: the two maps publish values for the `--icon-*` custom
 * properties, not declarations — the rendered `<g>` elements read them with
 * `var()` in an inline style, and `index.ts` exports both maps as style
 * objects a caller passes to `stylex.props`. The paint declarations that did
 * move live in `svgIconClasses.ts`.
 *
 * Each variation sets tokens for both fill-role and stroke-role elements
 * per the path role system. Stroke-role elements (lines, detail strokes)
 * never become fills — they stay as strokes across all variations.
 */

import * as stylex from '@stylexjs/stylex';

export const variations = stylex.create({
  linear: {
    // Fill-role: stroked outlines
    '--icon-layer-primary-fill': 'none',
    '--icon-layer-primary-stroke': 'currentColor',
    '--icon-layer-primary-opacity': '1',
    '--icon-layer-primary-stroke-role-fill': 'none',
    '--icon-layer-primary-stroke-role-stroke': 'currentColor',
    '--icon-layer-primary-stroke-role-opacity': '1',
    // Secondary
    '--icon-layer-secondary-fill': 'none',
    '--icon-layer-secondary-stroke': 'currentColor',
    '--icon-layer-secondary-opacity': '1',
    '--icon-layer-secondary-stroke-role-fill': 'none',
    '--icon-layer-secondary-stroke-role-stroke': 'currentColor',
    '--icon-layer-secondary-stroke-role-opacity': '1',
  },
  bold: {
    // Fill-role: solid filled (mask handles overlaps)
    '--icon-layer-primary-fill': 'currentColor',
    '--icon-layer-primary-stroke': 'none',
    '--icon-layer-primary-opacity': '1',
    // Stroke-role: stays stroked, thicker for visual weight
    '--icon-layer-primary-stroke-role-fill': 'none',
    '--icon-layer-primary-stroke-role-stroke': 'currentColor',
    '--icon-layer-primary-stroke-role-opacity': '1',
    '--icon-layer-primary-stroke-role-width': '2',
    // Secondary
    '--icon-layer-secondary-fill': 'currentColor',
    '--icon-layer-secondary-stroke': 'none',
    '--icon-layer-secondary-opacity': '1',
    '--icon-layer-secondary-stroke-role-fill': 'none',
    '--icon-layer-secondary-stroke-role-stroke': 'currentColor',
    '--icon-layer-secondary-stroke-role-opacity': '1',
    '--icon-layer-secondary-stroke-role-width': '2.5',
  },
  twotone: {
    // Fill-role: stroked, full opacity
    '--icon-layer-primary-fill': 'none',
    '--icon-layer-primary-stroke': 'currentColor',
    '--icon-layer-primary-opacity': '1',
    // Stroke-role: stroked, reduced opacity
    '--icon-layer-primary-stroke-role-fill': 'none',
    '--icon-layer-primary-stroke-role-stroke': 'currentColor',
    '--icon-layer-primary-stroke-role-opacity': '0.4',
    // Secondary: reduced opacity
    '--icon-layer-secondary-fill': 'none',
    '--icon-layer-secondary-stroke': 'currentColor',
    '--icon-layer-secondary-opacity': '0.4',
    '--icon-layer-secondary-stroke-role-fill': 'none',
    '--icon-layer-secondary-stroke-role-stroke': 'currentColor',
    '--icon-layer-secondary-stroke-role-opacity': '0.4',
  },
  bulk: {
    // Fill-role: solid filled
    '--icon-layer-primary-fill': 'currentColor',
    '--icon-layer-primary-stroke': 'none',
    '--icon-layer-primary-opacity': '1',
    // Stroke-role: reduced opacity
    '--icon-layer-primary-stroke-role-fill': 'none',
    '--icon-layer-primary-stroke-role-stroke': 'currentColor',
    '--icon-layer-primary-stroke-role-opacity': '0.4',
    // Secondary: filled at reduced opacity
    '--icon-layer-secondary-fill': 'currentColor',
    '--icon-layer-secondary-stroke': 'none',
    '--icon-layer-secondary-opacity': '0.4',
    '--icon-layer-secondary-stroke-role-fill': 'none',
    '--icon-layer-secondary-stroke-role-stroke': 'currentColor',
    '--icon-layer-secondary-stroke-role-opacity': '0.4',
  },
  broken: {
    '--icon-layer-primary-fill': 'none',
    '--icon-layer-primary-stroke': 'currentColor',
    '--icon-layer-primary-opacity': '1',
    '--icon-layer-primary-stroke-role-fill': 'none',
    '--icon-layer-primary-stroke-role-stroke': 'currentColor',
    '--icon-layer-primary-stroke-role-opacity': '1',
    // Secondary hidden
    '--icon-layer-secondary-fill': 'none',
    '--icon-layer-secondary-stroke': 'currentColor',
    '--icon-layer-secondary-opacity': '0',
    '--icon-layer-secondary-stroke-role-fill': 'none',
    '--icon-layer-secondary-stroke-role-stroke': 'currentColor',
    '--icon-layer-secondary-stroke-role-opacity': '0',
  },
});

/** Optical size compensation — thicker strokes at smaller sizes */
export const opticalSize = stylex.create({
  xsm: {
    '--icon-stroke-width': '2',
    '--icon-size': '12px',
  },
  sm: {
    '--icon-stroke-width': '1.75',
    '--icon-size': '16px',
  },
  md: {
    '--icon-stroke-width': '1.5',
    '--icon-size': '20px',
  },
  lg: {
    '--icon-stroke-width': '1.5',
    '--icon-size': '24px',
  },
});
