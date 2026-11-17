// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TopNavMegaMenu.reduced-motion.source-build.test.mjs
 * @input Uses the Tailwind build, the shared stylesheet harness and the
 *   mega-menu panel class map
 * @output Verifies the shipped panel follows design:reduced-motion: the travel
 *   is declared for `no-preference` alone, so a reduced-motion user never sees
 *   it rise (DR1); a touch screen cross-fades in 200 ms (DR2) and a mouse opens
 *   and closes at once (DR3)
 * @position Regression test for the shipped CSS of the mega-menu panel; jsdom
 *   evaluates no media queries or transitions
 */

import {describe, expect, it} from 'vitest';
import {buildAstryxTailwindCss} from '../../scripts/build-css-tailwind.mjs';
import {stylesheetOf} from '../__tests__/classNameAssertions';
import {topNavMegaMenuPanelAnimationClassName} from './topNavMegaMenuClasses';

const stylesheet = stylesheetOf(await buildAstryxTailwindCss());

const ANIMATION_CLASSES = topNavMegaMenuPanelAnimationClassName().split(' ');

/** The declarations one animation class prints, whitespace removed. */
function blockOf(className) {
  const block = stylesheet.blockOf(className);
  expect(block, `no rule for ${className}`).toBeDefined();
  return block;
}

describe('the mega-menu panel under reduced motion', () => {
  it('never rises: every transform is declared for no-preference only (DR1)', () => {
    const moving = ANIMATION_CLASSES.filter(className =>
      className.includes('transform'),
    );
    expect(moving.length).toBeGreaterThan(0);
    for (const className of moving) {
      expect(className.startsWith('motion-safe:')).toBe(true);
      expect(blockOf(className)).toContain(
        '@media(prefers-reduced-motion:no-preference)',
      );
    }
  });

  it('drops transform from the transition property list (DR1)', () => {
    expect(
      blockOf('motion-reduce:[transition-property:opacity,overlay,display]'),
    ).toBe(
      '@media(prefers-reduced-motion:reduce){transition-property:opacity,overlay,display;}',
    );
  });

  it('cross-fades in 200 ms on easeInOut under a coarse pointer (DR2)', () => {
    expect(
      blockOf('motion-reduce:pointer-coarse:[transition-duration:200ms]'),
    ).toBe(
      '@media(prefers-reduced-motion:reduce){@media(pointer:coarse){transition-duration:200ms;}}',
    );
    expect(
      blockOf(
        'motion-reduce:pointer-coarse:[transition-timing-function:cubic-bezier(0.42,0,0.58,1)]',
      ),
    ).toContain('cubic-bezier(0.42,0,0.58,1)');
  });

  it('opens and closes at once under a fine pointer (DR3)', () => {
    expect(blockOf('motion-reduce:pointer-fine:[transition-duration:0s]')).toBe(
      '@media(prefers-reduced-motion:reduce){@media(pointer:fine){transition-duration:0s;}}',
    );
  });

  it('gives the fade its first frame after the open rule (DR1)', () => {
    // `[@starting-style]:[&:popover-open]` and `[&:popover-open]:opacity-100`
    // have the same specificity, so only source order lets the first frame win.
    const flat = stylesheet.css.replace(/\\/g, '').replace(/\s+/g, '');
    const first = flat.indexOf('.[@starting-style]:[&:popover-open]:opacity-0');
    const open = flat.indexOf('.[&:popover-open]:opacity-100');
    expect(first).toBeGreaterThan(-1);
    expect(first).toBeGreaterThan(open);
  });
});
