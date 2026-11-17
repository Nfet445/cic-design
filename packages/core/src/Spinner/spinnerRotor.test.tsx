// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file spinnerRotor.test.tsx
 * @input Uses vitest, @testing-library/react, the rotor's class map and the
 *   built package stylesheet
 * @output Pins the shared rotor's timing: turns per iteration and both
 *   durations, the reduced-motion one included
 * @position Testing; validates spinnerRotor.ts, which Spinner and Lab's
 *   indeterminate CircularProgress share
 *
 * SYNC: When spinnerRotor.ts or spinnerClasses.ts changes, update tests to
 * match new behavior
 */

import {beforeAll, describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/react';
import {spinnerRotorTurnClassName} from './spinnerRotor';
import {classesOf} from '../__tests__/classNameAssertions';
import {type Stylesheet, stylesheetOf} from '../__tests__/classNameAssertions';
import {buildAstryxTailwindCss} from '../../scripts/build-css-tailwind.mjs';

let sheet: Stylesheet;

beforeAll(async () => {
  sheet = stylesheetOf(await buildAstryxTailwindCss());
});

/** The `animation` shorthand the rotor's class declaring `needle` carries. */
function animationShorthand(needle: string): string {
  for (const className of spinnerRotorTurnClassName.split(' ')) {
    const block = sheet.blockOf(className);
    if (block != null && /\banimation:/.test(block) && block.includes(needle)) {
      return block;
    }
  }
  expect.fail(`the rotor declares no animation with ${needle}`);
}

/** Seconds in a `calc(3s*100)` product, as the shorthand prints it. */
function seconds(value: string): number {
  const product = /calc\(([\d.]+)s\s*\*\s*([\d.]+)\)/.exec(value);
  if (product != null) {
    return Number(product[1]) * Number(product[2]);
  }
  const plain = /^([\d.]+)s$/.exec(value);
  return plain == null ? Number.NaN : Number(plain[1]);
}

describe('spinnerRotor', () => {
  // Chromium wakes the main thread at each iteration boundary while React
  // listens for `animationiteration`. So one iteration holds 100 turns. Each
  // duration is 100 periods, so one turn still takes one period.
  it('turns 100 times in one iteration, over 100 periods, with reduced motion too', () => {
    render(<span data-testid="rotor" className={spinnerRotorTurnClassName} />);
    const rotor = screen.getByTestId('rotor');
    expect(classesOf(rotor)).toEqual(
      expect.arrayContaining(spinnerRotorTurnClassName.split(' ')),
    );

    // The frames live in the package sheet, named by the class.
    const keyframes =
      /@keyframes astryxSpinnerRotor\s*\{([\s\S]*?)\}\s*\}/i.exec(
        sheet.css,
      )?.[1] ?? '';
    expect(keyframes).toMatch(/rotate\(0deg\)/);
    expect(keyframes).toMatch(/rotate\(36000deg\)/);
    expect(keyframes).not.toMatch(/stroke|width|height|top|left/);

    // The printed shorthand drops its spaces, so the assertions do too.
    const flat = (value: string) => value.replace(/\s+/g, '');
    const base = flat(
      animationShorthand('--_astryx-pre-tempo-duration-slow-min'),
    );
    expect(base).toContain(
      'calc(var(--_astryx-pre-tempo-duration-slow-min,var(--duration-slow-min))*100)',
    );
    expect(base).toContain('linear');
    expect(base).toContain('infinite');
    // Reduced motion slows the turn; it never stops it.
    expect(
      seconds(flat(animationShorthand('3s')).replace(/3s\*100/, '3s*100')),
    ).toBe(300);
  });
});
