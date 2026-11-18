// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file publishedClassArms.public.test.ts
 * @input The utils entry (`utils/index.ts`), the package root, and the StyleX
 *   arms the two class arms sit beside
 * @output Asserts a caller reaches the focus ring and the interaction overlay
 *   as classes from `@astryxdesign/core/utils`, and that each class arm carries
 *   the arms its StyleX twin declares
 * @position Beside utils/focusOutlineClasses.ts and
 *   utils/interactionOverlayClasses.ts; the test imports the entries, never the
 *   modules
 */

import {describe, expect, it} from 'vitest';
import * as core from '../index';
import * as utils from './index';

describe('the published class arms', () => {
  it('exports the focus ring from @astryxdesign/core/utils', () => {
    expect(typeof utils.focusOutlineFocusVisibleClassName).toBe('string');
    expect(core.focusOutlineFocusVisibleClassName).toBe(
      utils.focusOutlineFocusVisibleClassName,
    );
  });

  it('exports the interaction overlay from @astryxdesign/core/utils', () => {
    expect(typeof utils.interactionOverlayBackgroundImageClassName).toBe(
      'string',
    );
    expect(core.interactionOverlayBackgroundImageClassName).toBe(
      utils.interactionOverlayBackgroundImageClassName,
    );
  });

  it('draws the ring with the longhands the StyleX arm uses', () => {
    const ring = utils.focusOutlineFocusVisibleClassName;
    expect(ring).toContain('[outline-width:0]');
    expect(ring).toContain('[outline-style:none]');
    for (const part of ['width', 'style', 'color', 'offset']) {
      expect(ring).toContain(
        `focus-visible:[outline-${part}:var(--focus-outline-${part})]`,
      );
    }
  });

  it('paints the hover and the press, and lets the press win', () => {
    const overlay = utils.interactionOverlayBackgroundImageClassName;
    expect(overlay).toContain('linear-gradient(var(--color-overlay-hover)');
    expect(overlay).toContain('linear-gradient(var(--color-overlay-pressed)');
    expect(overlay).toContain(
      '[&[data-astryx-press=on][data-astryx-press=on]]',
    );
    expect(overlay).toContain(
      '[&[data-astryx-press=fading][data-astryx-press=fading]]',
    );
  });

  it('guards every arm against a disabled surface', () => {
    const overlay = utils.interactionOverlayBackgroundImageClassName;
    const arms = overlay.split(' ').filter(arm => !arm.startsWith('[&['));
    expect(arms.length).toBeGreaterThan(0);
    for (const arm of arms) {
      expect(arm).toContain(':where(:not(:disabled,[aria-disabled=true]))');
    }
  });
});
