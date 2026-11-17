// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file entryAnimationClasses.ts
 * @input The entry-animation preset the hook received
 * @output The mount animation class for each preset
 * @position Internal to hooks/useEntryAnimation.ts; the Tailwind build scans
 *   it for class names
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from '../utils/tw';
import type {EntryAnimationPreset} from './useEntryAnimation';

/**
 * One animation per preset, with the duration, easing and fill mode in the
 * arbitrary value. Frames live in `tailwind/astryx.input.css`: the build scans
 * class maps only.
 */
const ENTRY_ANIMATION_CLASS: Record<EntryAnimationPreset, string> = {
  slideDown:
    'animate-[astryxEntrySlideDown_var(--duration-fast-max)_var(--ease-standard)_backwards]',
  slideUp:
    'animate-[astryxEntrySlideUp_var(--duration-fast-max)_var(--ease-standard)_backwards]',
  fadeIn:
    'animate-[astryxEntryFadeIn_var(--duration-fast-max)_var(--ease-standard)_backwards]',
  scaleIn:
    'animate-[astryxEntryScaleIn_var(--duration-fast-max)_var(--ease-standard)_backwards]',
};

/** The entry animation for `preset`, off under Reduce Motion. */
export function entryAnimationClassName(preset: EntryAnimationPreset): string {
  return tw(ENTRY_ANIMATION_CLASS[preset], 'motion-reduce:animate-none');
}
