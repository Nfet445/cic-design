// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file chartGridClasses.ts
 * @input The theme's emphasised border colour variable
 * @output The utility class string a grid line carries
 * @position Style primitives; the Tailwind build scans it for class names
 *
 * A grid line is quieter than an axis line: it draws in the emphasised border
 * colour, so a reader still sees the data over it.
 */

import {tw} from './tw';

export const chartGridLineClassName = tw(
  '[stroke:var(--color-border-emphasized)]',
  '[stroke-width:1]',
);
