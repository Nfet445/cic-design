// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file circleCheck.test.tsx
 * @input vitest, Testing Library, CircleCheckIndicator, its build-time mirror
 *   (circleCheckClasses.ts) and its measured table (circleCheck.table.ts)
 * @output Holds the class text to the table: the multiselect circle's geometry
 *   with the two derived xSmall values, its ring, its press, and its motion.
 * @position Unit test beside circleCheckClasses.ts. It reads the class map, not
 *   a stylesheet: the sheet is a build artifact and jsdom injects none.
 */

import {describe, expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {circleCheckTable} from './circleCheck.table';
import {CircleCheckIndicator} from './CircleCheckIndicator';
import {
  circleBarClassName,
  circleCheckConsts,
  circleCheckmarkClassName,
  circleClassName,
} from './circleCheckClasses';

const {large, xSmall} = circleCheckTable;

/** A CSS length as a number of px. */
function toNumber(value: string | undefined): number {
  return value == null ? Number.NaN : parseFloat(value);
}

const round2 = (n: number) => Math.round(n * 100) / 100;

describe('circleCheckConsts mirror the constants table', () => {
  it('takes the circle at the Large text size for md', () => {
    expect(toNumber(circleCheckConsts.mdDiameter)).toBe(large.diameter);
    expect(toNumber(circleCheckConsts.mdStroke)).toBe(large.stroke);
    expect(toNumber(circleCheckConsts.mdCheckSize)).toBe(large.checkSize);
    expect(toNumber(circleCheckConsts.mdCheckStroke)).toBe(large.checkStroke);
    expect(toNumber(circleCheckConsts.mdCheckOffsetY)).toBe(large.checkOffsetY);
  });

  it('takes the circle at the xSmall text size for sm, deriving what was not measured there', () => {
    expect(toNumber(circleCheckConsts.smDiameter)).toBe(xSmall.diameter);
    expect(toNumber(circleCheckConsts.smStroke)).toBe(xSmall.stroke);
    expect(toNumber(circleCheckConsts.smCheckSize)).toBe(xSmall.checkSize);
    expect(toNumber(circleCheckConsts.smCheckStroke)).toBe(
      round2((large.checkStroke * xSmall.checkSize) / large.checkSize),
    );
    expect(toNumber(circleCheckConsts.smCheckOffsetY)).toBe(
      round2((large.checkOffsetY * xSmall.diameter) / large.diameter),
    );
  });

  it.each(['md', 'sm'] as const)(
    'writes the %s circle at the table’s diameter and stroke',
    size => {
      const classes = circleClassName({
        size,
        isFilled: false,
        isDisabled: false,
      });
      // The class text is written out, because Tailwind reads literals only,
      // so this assertion is what keeps it equal to the table.
      expect(classes).toContain(`w-[${circleCheckConsts[`${size}Diameter`]}]`);
      expect(classes).toContain(`h-[${circleCheckConsts[`${size}Diameter`]}]`);
      expect(classes).toContain(
        `[--_circle-stroke:${circleCheckConsts[`${size}Stroke`]}]`,
      );
    },
  );
});

describe('CircleCheckIndicator class map', () => {
  function circle(
    state: 'checked' | 'unchecked' | 'indeterminate',
    size: 'sm' | 'md' = 'md',
  ) {
    render(<CircleCheckIndicator state={state} size={size} />);
    const el = document.querySelector(
      `.astryx-circle-check-indicator[data-size="${size}"]`,
    );
    if (el == null) {
      throw new Error('no circle');
    }
    return el;
  }

  it('marks the circle as painting its own press, so the host leaves its layer off', () => {
    expect(circle('unchecked')).toHaveAttribute(
      'data-astryx-indicator-press',
      '',
    );
    // The host's rounded-square layer would tint past the circle.
    expect(
      circleClassName({size: 'md', isFilled: false, isDisabled: false}),
    ).toContain(
      'pointer-fine:[[data-astryx-indicator-scope]:active_&]:after:bg-[color:var(--_indicator-active-press,var(--color-overlay-pressed))]',
    );
    // A disabled circle paints no press at all.
    expect(
      circleClassName({size: 'md', isFilled: false, isDisabled: true}),
    ).not.toContain('after:absolute');
  });

  it('reads only the touch press image a CheckboxInput row hands down', () => {
    const classes = circleClassName({
      size: 'md',
      isFilled: true,
      isDisabled: false,
    });
    expect(classes).toContain(
      'after:[background-image:var(--_indicator-press-image,none)]',
    );
    expect(classes).not.toContain('--_press-paint-image');
  });

  it('fades over the theme’s duration on every pointer and changes at once under Reduce Motion', () => {
    const classes = circleClassName({
      size: 'md',
      isFilled: true,
      isDisabled: false,
    });
    expect(classes).toContain('duration-[var(--duration-fast)]');
    expect(classes).toContain('motion-reduce:duration-0');
    // No pointer gets a timing of its own.
    expect(classes).not.toMatch(/pointer-(coarse|fine):duration/);
  });

  it('draws the empty ring as an inset shadow of the stroke, and the filled circle without one', () => {
    expect(
      circleClassName({size: 'md', isFilled: false, isDisabled: false}),
    ).toContain(
      '[box-shadow:inset_0_0_0_var(--_circle-stroke)_var(--color-border-emphasized)]',
    );
    expect(
      circleClassName({size: 'md', isFilled: true, isDisabled: false}),
    ).toContain('[box-shadow:none]');
  });

  it('shows the check and the bar in exactly one of the three states', () => {
    const check = (isVisible: boolean) =>
      circleCheckmarkClassName({size: 'md', isVisible}).split(' ')[0];
    const bar = (isVisible: boolean) =>
      circleBarClassName({size: 'md', isVisible}).split(' ')[0];
    expect([check(false), bar(false)]).toEqual(['hidden', 'hidden']);
    expect([check(true), bar(false)]).toEqual(['block', 'hidden']);
    expect([check(false), bar(true)]).toEqual(['hidden', 'block']);
  });
});
