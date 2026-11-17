// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file spinnerRotor.ts
 * @input The rotor's Tailwind class and the slow-min duration token it reads
 * @output The one turning arc: SPINNER_ARC_FRACTION,
 *   spinnerRotorTurnClassName and syncRotationPhase
 * @position Spinner's rotor, shared by Spinner and Lab's indeterminate
 *   CircularProgress (through `@astryxdesign/core/internal/spinner-rotor`), so
 *   both rings turn the same way on the compositor.
 */

import {sharedState} from '../utils/sharedRealm';
import {spinnerRotorTurnClassName} from './spinnerClasses';

export {spinnerRotorTurnClassName};

/** The fraction of the ring the arc covers: 135°. */
export const SPINNER_ARC_FRACTION = 0.375;

/**
 * Full turns in one iteration of the rotation.
 *
 * Chromium wakes the main thread at each iteration boundary while the
 * document listens for `animationiteration`. React listens for it on every
 * root. One iteration holds 100 turns, so the wake comes once in 100 turns.
 * Each turn is 360 degrees, so the ring looks the same.
 *
 * The class that names the animation, and the keyframes it names, live in
 * `spinnerClasses.ts` and `tailwind/astryx.input.css`: the build scans class
 * maps, so a keyframe in a `.ts` file would emit nothing.
 */

/**
 * Pin every ring's rotation to the document timeline's origin instead of its
 * own start time, so spinners mounted seconds apart stay in phase.
 *
 * Setting `startTime` is exact where arithmetic on a clock read is not. A
 * negative `animation-delay` computed at mount is only as good as the gap
 * between the clock read and the frame the animation starts in. At 10x CPU
 * throttling that gap measured 116 degrees of drift.
 *
 * Rotors are collected and pinned in one frame. `getAnimations()` resolves
 * style, and `startTime` dirties it again. So pinning them one at a time makes
 * each mount re-force what the previous one invalidated: 53 style recalcs for
 * 38 spinners, against 19 batched.
 */
const rotors = sharedState('spinner/spinner-rotor/state', 1, () => ({
  pendingRotors: new Set<Element>(),
  flushScheduled: false,
}));

function pinRotorsToTimelineOrigin(): void {
  rotors.flushScheduled = false;
  const animations: Animation[] = [];
  for (const rotor of rotors.pendingRotors) {
    animations.push(...rotor.getAnimations());
  }
  rotors.pendingRotors.clear();
  for (const animation of animations) {
    animation.startTime = 0;
  }
}

/**
 * Ref callback for a rotor: the one place a mounted ring touches the DOM.
 *
 * It reads nothing back — the geometry is resolved by the cascade, not in JS.
 */
export function syncRotationPhase(
  rotor: Element | null,
): (() => void) | undefined {
  if (rotor == null) {
    return undefined;
  }
  // jsdom implements no Web Animations, and this runs in every consumer's
  // component tests.
  if (typeof rotor.getAnimations !== 'function') {
    return undefined;
  }
  rotors.pendingRotors.add(rotor);
  if (!rotors.flushScheduled) {
    rotors.flushScheduled = true;
    requestAnimationFrame(pinRotorsToTimelineOrigin);
  }
  return () => {
    rotors.pendingRotors.delete(rotor);
  };
}
