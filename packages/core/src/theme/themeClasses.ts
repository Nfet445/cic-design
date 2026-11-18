// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file themeClasses.ts
 * @input The color mode Theme resolved and whether the theme reduces motion
 * @output Utility class strings for the Theme wrapper
 * @position Internal to Theme; the class map the Tailwind build scans
 *
 * The wrapper adds no box to the layout, so the inherited text colour and font
 * are what a theme contributes to its subtree before any component rule.
 */

import {tw} from '../utils/tw';
import type {ThemeMode} from './types';

/** The inherited text treatment every theme wrapper carries. */
const WRAPPER_TEXT_CLASS = tw(
  'contents',
  '[color:var(--color-text-primary)]',
  '[font-family:var(--font-family-body)]',
);

const COLOR_SCHEME_CLASSES: Record<ThemeMode, string> = {
  dark: '[color-scheme:dark]',
  light: '[color-scheme:light]',
  // `system` hands the decision to the reader's preference.
  system: '[color-scheme:light_dark]',
};

/** What every element under the mark inherits while the theme reduces motion. */
const REDUCED_MOTION_CLASS = '[--_astryx-reduced-motion:1]';

export interface ThemeWrapperClassNameOptions {
  mode: ThemeMode;
  /** The theme reduces motion for everyone. */
  reducesMotion: boolean;
}

export function themeWrapperClassName({
  mode,
  reducesMotion,
}: ThemeWrapperClassNameOptions): string {
  return tw(
    WRAPPER_TEXT_CLASS,
    COLOR_SCHEME_CLASSES[mode],
    reducesMotion && REDUCED_MOTION_CLASS,
  );
}
