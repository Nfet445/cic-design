// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Carousel.focusRing.test.tsx
 * @input Uses Carousel, the focus-ring class map and the focus-owner module
 * @output Tests that the Carousel root paints its scroller's shared focus ring
 * @position Colocated test; the painted ring is checked in
 *   CarouselFocusRing.a11y.chromium.spec.ts
 *
 * jsdom does not match `:focus-visible` or paint, so this pins the
 * composition the root's overlay ring needs: the scroller is a direct child
 * marked as the focus owner, it paints no ring of its own, because its
 * edge-fade mask would erase it, and the root carries the owner overlay.
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Carousel} from './Carousel';
import {focusOutlineSuppressedClassName} from '../utils/focusOutlineClasses';
import {
  focusOwnerOverlayRingClassName,
  focusOwnerProps,
} from '../privateAttributes/focusOwner.stylex';

const atoms = (className: string | undefined) =>
  (className ?? '').split(' ').filter(Boolean);

describe("Carousel: the root paints the scroller's shared focus ring", () => {
  it('marks the scroller as the focus owner, with no ring of its own, under a root that carries the owner overlay', () => {
    render(
      <Carousel aria-label="Photos">
        <div>One</div>
        <div>Two</div>
      </Carousel>,
    );
    const root = screen.getByRole('region', {name: 'Photos'});
    const scroller = root.querySelector('.astryx-carousel-scroller');
    expect(scroller).not.toBeNull();
    expect(scroller!.parentElement).toBe(root);
    for (const attribute of Object.keys(focusOwnerProps)) {
      expect(scroller!.hasAttribute(attribute)).toBe(true);
    }
    for (const c of atoms(focusOutlineSuppressedClassName)) {
      expect(scroller!.className.split(' ')).toContain(c);
    }
    for (const c of atoms(focusOwnerOverlayRingClassName)) {
      expect(root.className.split(' ')).toContain(c);
    }
  });
});
