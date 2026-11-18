// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file interactionOverlayClasses.test.ts
 * @input The colour arms of the shared overlay class map
 * @output Asserts each colour arm keeps the hover and press arms its StyleX
 *   twin (interactionOverlay.stylex.ts) declares: the pointer guards, the
 *   coarse-pointer drop, and the two press arms that yield to the image
 * @position Beside utils/interactionOverlayClasses.ts; the stylesheet test
 *   (Layout/tailwindStylesheet.source-build.test.mjs) asserts the built rules
 */

import {describe, expect, it} from 'vitest';
import {
  interactionOverlayBackgroundColorClassName,
  interactionOverlayPressedBackgroundColorClassName,
} from './interactionOverlayClasses';

const HOVER_ARM = '[background-color:var(--color-overlay-hover)]';
const PRESSED_ARM = '[background-color:var(--color-overlay-pressed)]';

describe('the overlay colour arms', () => {
  it('paints the hover tone under a fine pointer and the press on any', () => {
    const overlay = interactionOverlayBackgroundColorClassName;
    expect(overlay).toContain(
      `[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:${HOVER_ARM}`,
    );
    expect(overlay).toContain(
      `[&:active:where(:not(:disabled,[aria-disabled=true]))]:${PRESSED_ARM}`,
    );
  });

  it('drops the :active paint under a coarse pointer', () => {
    for (const overlay of [
      interactionOverlayBackgroundColorClassName,
      interactionOverlayPressedBackgroundColorClassName,
    ]) {
      expect(overlay).toContain(
        `[&:active:where(:not(:disabled,[aria-disabled=true]))]:pointer-coarse:[background-color:transparent]`,
      );
    }
  });

  it('drops the colour while the controller paints the press', () => {
    for (const overlay of [
      interactionOverlayBackgroundColorClassName,
      interactionOverlayPressedBackgroundColorClassName,
    ]) {
      expect(overlay).toContain(
        '[&[data-astryx-press=on][data-astryx-press=on]]:[background-color:transparent]',
      );
      expect(overlay).toContain(
        '[&[data-astryx-press=fading][data-astryx-press=fading]]:[background-color:transparent]',
      );
    }
  });

  it('adds no hover arm to the pressed-only arm', () => {
    expect(interactionOverlayPressedBackgroundColorClassName).not.toContain(
      HOVER_ARM,
    );
  });
});
