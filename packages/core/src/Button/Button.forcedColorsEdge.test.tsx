// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Button.forcedColorsEdge.test.tsx
 * @input Button inside a ButtonGroup, and the classes the button renders
 * @output Proof that a grouped `destructive` Button's forced-colors edge is
 *   `CanvasText` on every side it draws, never `ButtonText`
 * @position Unit evidence for Button AR7. The stylesheet orders longhands
 *   after shorthands, so a `ButtonText` longhand would win over the variant's
 *   `CanvasText` shorthand there; the class map emits one color per side.
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Button} from './Button';
import {ButtonGroup} from '../ButtonGroup';
import {classesOf} from '../__tests__/classNameAssertions';

function colorClasses(el: Element): string[] {
  return classesOf(el).filter(c => /forced-colors:border-.*\[color:/.test(c));
}

describe.each(['horizontal', 'vertical'] as const)(
  'a destructive Button in a %s ButtonGroup, in forced colors',
  orientation => {
    const sides = orientation === 'horizontal' ? ['t', 'b'] : ['s', 'e'];

    it('draws its edge in CanvasText, never ButtonText', () => {
      render(
        <ButtonGroup orientation={orientation} label="Actions">
          <Button label="Keep" />
          <Button label="Delete" variant="destructive" />
        </ButtonGroup>,
      );
      const colors = colorClasses(screen.getByRole('button', {name: 'Delete'}));
      expect(colors.length).toBeGreaterThan(0);
      expect(colors.filter(c => c.includes('ButtonText'))).toEqual([]);
      expect(colors.some(c => c.includes('CanvasText'))).toBe(true);
    });

    it('draws that edge only on the sides that run along the group', () => {
      render(
        <ButtonGroup orientation={orientation} label="Actions">
          <Button label="Keep" />
          <Button label="Delete" variant="destructive" />
        </ButtonGroup>,
      );
      const colors = colorClasses(screen.getByRole('button', {name: 'Delete'}));
      for (const side of sides) {
        expect(
          colors.includes(`forced-colors:border-${side}-[color:CanvasText]`),
        ).toBe(true);
      }
      const others = ['t', 'b', 's', 'e'].filter(side => !sides.includes(side));
      for (const side of others) {
        expect(
          colors.some(c => c.startsWith(`forced-colors:border-${side}-`)),
        ).toBe(false);
      }
    });
  },
);

it('keeps ButtonText on a grouped primary Button', () => {
  render(
    <ButtonGroup label="Actions">
      <Button label="Save" variant="primary" />
      <Button label="Publish" variant="primary" />
    </ButtonGroup>,
  );
  const colors = colorClasses(screen.getByRole('button', {name: 'Publish'}));
  expect(colors.some(c => c.includes('ButtonText'))).toBe(true);
  expect(colors.filter(c => c.includes('CanvasText'))).toEqual([]);
});
