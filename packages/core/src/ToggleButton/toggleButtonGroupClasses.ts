// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file toggleButtonGroupClasses.ts
 * @input Accepts the orientation and press tracking ToggleButtonGroup
 *   resolves from its own props
 * @output Utility class names for the group's wrapper
 * @position Internal to ToggleButtonGroup; scanned by the Tailwind build
 *
 * A member is a ghost Button, so its surface, focus ring, press affordance and
 * radius stay with Button. These classes only lay the members out.
 */

import {tw} from '../utils/tw';

/**
 * One entry per orientation, so exactly one alignment class reaches the root.
 * Tailwind orders utilities by its own table, not by the class attribute, so a
 * base `items-*` with a conditional override could lose the override.
 */
const ORIENTATION_CLASS: Record<'horizontal' | 'vertical', string> = {
  horizontal: 'flex-row items-center',
  vertical: 'flex-col items-stretch',
};

export interface ToggleButtonGroupClassNameOptions {
  orientation: 'horizontal' | 'vertical';
  /** While a touch presentation tracks presses, the root draws the hit band. */
  tracksPress: boolean;
}

/** The layout of the group wrapper around its toggles. */
export function toggleButtonGroupClassName({
  orientation,
  tracksPress,
}: ToggleButtonGroupClassNameOptions): string {
  return tw(
    'inline-flex gap-1',
    ORIENTATION_CLASS[orientation],
    // The tracked hit band is the root's `::before`, painted below its
    // toggles, so the root has to be the band's containing block.
    tracksPress && 'relative',
  );
}
