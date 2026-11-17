// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file loadingMessageClasses.ts
 * @input Nothing: every class is fixed
 * @output The utility class string the ring and its words share
 * @position Style primitives; the Tailwind build scans it for class names
 */

import {tw} from './tw';

/** The column Spinner's own labelled wrapper uses. */
export const loadingMessageClassName = tw(
  'inline-flex flex-col items-center',
  'gap-2',
);
