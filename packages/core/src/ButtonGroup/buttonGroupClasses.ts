// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file buttonGroupClasses.ts
 * @input Accepts the orientation, elevation and press tracking ButtonGroup
 *   resolves from its own props
 * @output Utility class names for the group's wrapper
 * @position Internal to ButtonGroup; scanned by the Tailwind build
 *
 * The connected appearance of the members themselves — the square inner
 * corners and the shared edge — lives in Button/buttonClasses.ts, because each
 * member styles its own edges.
 */

import {tw} from '../utils/tw';
import type {Elevation} from '../utils/types';
import type {ButtonGroupOrientation} from './ButtonGroupContext';

/**
 * Resting elevation for the whole group: the connected buttons share one
 * surface, so the shadow sits on the wrapper and lifts them as a unit. The
 * wrapper takes the element radius too, so the shadow follows the group's
 * rounded outer corners rather than a bare rectangle.
 */
const ELEVATION_CLASS: Record<Elevation, string> = {
  none: 'shadow-none',
  low: tw('shadow-[var(--shadow-low)]', 'rounded-[var(--radius-element)]'),
  med: tw('shadow-[var(--shadow-med)]', 'rounded-[var(--radius-element)]'),
  high: tw('shadow-[var(--shadow-high)]', 'rounded-[var(--radius-element)]'),
};

export interface ButtonGroupClassNameOptions {
  elevation: Elevation;
  orientation: ButtonGroupOrientation;
  /** While a touch presentation tracks presses, the root draws the hit band. */
  tracksPress: boolean;
}

/** The layout of the group wrapper; the elevation class follows the level. */
export function buttonGroupClassName({
  elevation,
  orientation,
  tracksPress,
}: ButtonGroupClassNameOptions): string {
  return tw(
    'inline-flex items-stretch',
    orientation === 'vertical' && 'flex-col',
    // The tracked hit band is the root's `::before`, painted below its
    // buttons, so the root has to be the band's containing block.
    tracksPress && 'relative',
    ELEVATION_CLASS[elevation],
  );
}
