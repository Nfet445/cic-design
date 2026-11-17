// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file focusOwner.source-build.test.mjs
 * @input The focus-owner class module and the attribute its owner module
 *   writes (privateAttributes/focusOwnerClasses.ts and
 *   privateAttributes/focusOwner.stylex.ts)
 * @output Verifies the shared focus-owner ring keys the wrapper's ring to its
 *   marked control's `:focus-visible`, and never to a rule that reaches every
 *   descendant (`:has(...) *`)
 * @position Regression test for the focus-owner wrapper ring
 *   (`architecture:interaction-modality` INV3)
 */

import {describe, expect, it} from 'vitest';
import {
  focusOwnerOverlayRingClassName,
  focusOwnerRingClassName,
} from '../privateAttributes/focusOwnerClasses';
import {focusOwnerProps} from '../privateAttributes/focusOwner.stylex';

/** The attribute the owner module writes, which the class text spells. */
const OWNER = Object.keys(focusOwnerProps)[0];

/** Every class that draws a ring (`outline-width`), from both rings. */
const ringClasses = [
  '',
  focusOwnerRingClassName,
  focusOwnerOverlayRingClassName,
]
  .join(' ')
  .split(' ')
  .filter(name => name.includes('outline-width:var(--focus-outline-width)'));

describe('focus-owner wrapper ring', () => {
  it('rings the wrapper for its own marked control only', () => {
    expect(ringClasses.length).toBeGreaterThan(0);
    const direct = ringClasses.filter(
      name => !name.includes(`[${OWNER}=group]`),
    );
    expect(direct.length).toBeGreaterThan(0);
    for (const name of direct) {
      // On the wrapper, while its marked control shows keyboard focus.
      expect(name).toContain(`has-[>_[${OWNER}]:focus-visible]`);
      // Never every descendant.
      expect(name).not.toContain('*');
    }
  });

  it('reaches the control through one marked cell, and no further', () => {
    const cell = ringClasses.filter(name => name.includes(`[${OWNER}=group]`));
    expect(cell.length).toBeGreaterThan(0);
    for (const name of cell) {
      expect(name).toContain(
        `has(>_[${OWNER}=group]_>_[${OWNER}]:focus-visible)`,
      );
      expect(name).not.toContain('*');
    }
  });
});
