// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';
/**
 * @file useEntryAnimation.ts
 * @input Uses React, useIsHydrating, and the preset's class map
 * @output Exports useEntryAnimation hook for mount-only entry animations
 * @position Hook utility; consumed by FieldStatus and available to consumers
 *
 * It animates only an element that mounts after the first page paint.
 * Server-rendered elements hydrate without the entry style and never play it
 * (spec:AST-013 FR13).
 */

import {useState} from 'react';
import {entryAnimationClassName} from './entryAnimationClasses';
import {useIsHydrating} from './useIsHydrating';

// Track whether the initial page paint has completed, so elements a
// client-only root renders on page load do not animate; only dynamically
// inserted ones should. Server-rendered elements are covered by
// useIsHydrating instead: hydration can run after this flag turns true.
let initialPaintComplete = false;
if (typeof window !== 'undefined') {
  requestAnimationFrame(() => {
    initialPaintComplete = true;
  });
}

export type EntryAnimationPreset =
  'slideDown' | 'slideUp' | 'fadeIn' | 'scaleIn';

/**
 * Returns the animation class for animating an element on mount.
 *
 * Only animates when the element is dynamically inserted after the initial
 * page paint. Elements rendered on page load, including server-rendered
 * elements while they hydrate, are not animated.
 *
 * @example
 * ```
 * const entryClassName = useEntryAnimation('slideDown');
 * <div className={tw(entryClassName)}>Animated content</div>
 * ```
 */
export function useEntryAnimation(
  preset: EntryAnimationPreset = 'slideDown',
): string | null {
  const isHydrating = useIsHydrating();
  // Captured once: a hydrated element must not start animating when React
  // re-renders it with the client snapshot after hydration.
  const [animate] = useState(() => !isHydrating && initialPaintComplete);
  return animate ? entryAnimationClassName(preset) : null;
}
