// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file commentActionsClasses.ts
 * @input Nothing: every class is fixed
 * @output The utility class strings the actions list and a reaction toggle
 *   carry
 * @position Style primitives; the Tailwind build scans it for class names
 */

import {tw} from '../tw';

/** The list ends at the header's end edge, so the more menu keeps that corner. */
export const commentActionsListClassName = tw(
  'grow shrink basis-0 min-w-0',
  'justify-end',
);

/** Every reaction-row control carries one spacing step of inline padding. */
export const commentActionsReactionToggleClassName = tw('aspect-auto', 'px-2');
