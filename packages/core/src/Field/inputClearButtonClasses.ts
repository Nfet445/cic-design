// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file inputClearButtonClasses.ts
 * @input Uses no theme variable
 * @output The utility class string the clear affordance's button carries
 * @position Internal to Field; the Tailwind build scans it for class names
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from '../utils/tw';

/**
 * A fixed 20px box keeps the glyph on the field's optical centre, and
 * `shrink-0` stops the row from squeezing it when the value is long.
 */
export const inputClearButtonClassName = tw('h-5', 'shrink-0');
