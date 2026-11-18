// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file mediaThemeClasses.ts
 * @input Whether a MediaTheme surface resolved to a mode
 * @output Utility class strings for the MediaTheme wrapper
 * @position Internal to MediaTheme; the class map the Tailwind build scans
 */

import {tw} from '../utils/tw';

/** The wrapper adds no box to the layout at any mode, `off` included. */
const ROOT_CLASS = 'contents';

/**
 * An active surface re-reads the theme's text colour: its tokens come from the
 * generated media block, which the wrapper's own inherited value must follow.
 */
const ACTIVE_CLASS = '[color:var(--color-text-primary)]';

export interface MediaThemeClassNameOptions {
  /** The surface resolved to a mode; `off` keeps the ambient theme. */
  isActive: boolean;
}

export function mediaThemeClassName({
  isActive,
}: MediaThemeClassNameOptions): string {
  return tw(ROOT_CLASS, isActive && ACTIVE_CLASS);
}
