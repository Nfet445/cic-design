// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file chartAxisClasses.ts
 * @input The theme's text colour variable
 * @output The utility class strings an axis edge line and its tick marks carry
 * @position Style primitives; the Tailwind build scans it for class names
 *
 * An axis draws in SVG, so the stroke is a paint attribute expressed as a
 * utility: the same one-pixel line in the text colour serves both the edge and
 * the marks that hang off it.
 */

import {tw} from './tw';

export const chartAxisLineClassName = tw(
  '[stroke:var(--color-text-primary)]',
  '[stroke-width:1]',
);

export const chartAxisTickMarkClassName = chartAxisLineClassName;
