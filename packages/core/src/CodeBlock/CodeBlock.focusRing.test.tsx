// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CodeBlock.focusRing.test.tsx
 * @input Uses CodeBlock and the shared focus-ring class
 * @output Tests that the code viewport draws the shared focus ring, inset so
 *   the root's clip does not cut it
 * @position Colocated test; the ring's geometry is checked in a real browser
 */

import {describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/react';
import {CodeBlock} from './CodeBlock';
import {focusOutlineFocusVisibleClassName} from '../utils/focusOutlineClasses';

describe('CodeBlock: the code viewport draws the shared focus ring', () => {
  it('inset inside the clipped root', () => {
    render(<CodeBlock code="const a = 1;" language="ts" />);
    const viewport = screen.getByRole('group', {hidden: true});
    for (const className of focusOutlineFocusVisibleClassName.split(' ')) {
      expect(viewport).toHaveClass(className);
    }
    // jsdom does not match `:focus-visible`, so this pins the composition: the
    // ring class takes its offset from the variable the viewport sets.
    expect(viewport.style.getPropertyValue('--focus-outline-offset')).toBe(
      'calc(-1 * var(--focus-outline-width))',
    );
  });
});
