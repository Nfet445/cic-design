// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file usePopover.forcedColorsEdge.test.tsx
 * @input usePopover's painted surface class list
 * @output Proof that the surface's forced-colors border sets no border width
 *   or style outside forced colors, so a caller's own border keeps showing
 * @position Unit evidence for the Popover forced-colors edge
 */

import {afterAll, beforeAll, expect, it, vi} from 'vitest';
import {fireEvent, render, screen} from '@testing-library/react';
import {usePopover} from './usePopover';

const original = {
  show: HTMLElement.prototype.showPopover,
  hide: HTMLElement.prototype.hidePopover,
};

beforeAll(() => {
  HTMLElement.prototype.showPopover = vi.fn();
  HTMLElement.prototype.hidePopover = vi.fn();
});

afterAll(() => {
  HTMLElement.prototype.showPopover = original.show;
  HTMLElement.prototype.hidePopover = original.hide;
});

function HeadlessPopover() {
  const popover = usePopover({dialogLabel: 'Filters'});
  return (
    <>
      <button
        type="button"
        ref={popover.triggerRef}
        onClick={() => popover.show()}
        {...popover.triggerProps}>
        Open
      </button>
      {popover.render(<span>Content</span>)}
    </>
  );
}

it('sets no border width or style on the surface outside forced colors', () => {
  render(<HeadlessPopover />);
  fireEvent.click(screen.getByRole('button', {name: 'Open'}));
  const surface = screen.getByRole('dialog', {name: 'Filters', hidden: true});
  // Every border utility: the surface must reach for one only under forced
  // colors, where the box-shadow edge disappears.
  const borderClasses = surface.className
    .split(/\s+/)
    .filter(cls => cls.replace(/^forced-colors:/, '').includes('border'));
  expect(borderClasses.length).toBeGreaterThan(0);
  expect(borderClasses.every(cls => cls.startsWith('forced-colors:'))).toBe(
    true,
  );
});
