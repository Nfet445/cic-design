// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file commentMarkdownClasses.ts
 * @input Nothing: every class is fixed
 * @output The utility class string a comment body's image carries
 * @position Style primitives; the Tailwind build scans it for class names
 */

import {tw} from '../tw';

/** The image's focus ring comes from `focusOutlineProps.focusVisible()`. */
export const commentMarkdownImageClassName = tw(
  'block max-w-full h-auto',
  'my-2',
  'cursor-zoom-in',
  '[&:is(:disabled,[aria-disabled=true])]:cursor-default',
);
