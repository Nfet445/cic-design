// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Skeleton.test.tsx
 * @input Uses vitest, @testing-library/react, the built Astryx Tailwind sheet
 * @output Pins the skeleton pulse: ten-step keyframes, compositor-safe timing,
 *   and the forced-colors overrides
 * @position Testing; validates Skeleton.tsx and skeletonClasses.ts
 */

import {beforeAll, describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Skeleton} from './Skeleton';
import {
  classesOf,
  stylesheetOf,
  type Stylesheet,
} from '../__tests__/classNameAssertions';
import {buildAstryxTailwindCss} from '../../scripts/build-css-tailwind.mjs';

/**
 * The pulse's keyframes and utilities live in the package stylesheet the build
 * produces, not in an injected StyleX sheet, so every assertion reads the
 * built sheet.
 */
let sheet: Stylesheet;

beforeAll(async () => {
  sheet = stylesheetOf(await buildAstryxTailwindCss());
});

/** The whole `@keyframes <name> { … }` rule, braces matched. */
function keyframesRule(css: string, name: string): string {
  const start = css.search(new RegExp(`@keyframes ${name}\\b`, 'i'));
  expect(start).toBeGreaterThanOrEqual(0);
  let depth = 0;
  for (let i = css.indexOf('{', start); i < css.length; i += 1) {
    if (css[i] === '{') {
      depth += 1;
    }
    if (css[i] === '}' && --depth === 0) {
      return css.slice(start, i + 1);
    }
  }
  throw new Error(`unterminated @keyframes ${name}`);
}

/** The named animation's opacity keyframes as [offset 0..1, opacity], in order. */
function opacityKeyframes(css: string, name: string): [number, number][] {
  return Array.from(
    keyframesRule(css, name).matchAll(/([\d.]+)%\s*\{\s*opacity:\s*([\d.]+)/g),
    m => [Number(m[1]) / 100, Number(m[2])] as [number, number],
  );
}

/** Opacity at iteration progress x, linear between keyframes. */
function opacityAt(frames: [number, number][], x: number): number {
  for (let i = 1; i < frames.length; i += 1) {
    const [x0, y0] = frames[i - 1];
    const [x1, y1] = frames[i];
    if (x <= x1) {
      return x1 === x0 ? y1 : y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
  }
  return frames[frames.length - 1][1];
}

describe('Skeleton', () => {
  it('renders a placeholder element', () => {
    render(<Skeleton width={200} height={20} data-testid="sk" />);
    expect(screen.getByTestId('sk')).toBeInTheDocument();
  });

  it('is hidden from assistive tech by default (complex-20)', () => {
    render(<Skeleton width={200} height={20} data-testid="sk" />);
    expect(screen.getByTestId('sk')).toHaveAttribute('aria-hidden', 'true');
  });

  it('allows the aria-hidden default to be overridden', () => {
    render(
      <Skeleton width={200} height={20} data-testid="sk" aria-hidden={false} />,
    );
    // Consumer opt-out: not hidden when explicitly set false.
    expect(screen.getByTestId('sk')).toHaveAttribute('aria-hidden', 'false');
  });
});

describe('pulse', () => {
  function pulse() {
    render(<Skeleton width={200} height={20} data-testid="sk" />);
    const animation = classesOf(screen.getByTestId('sk')).find(className =>
      className.startsWith('animate-['),
    );
    return {animation};
  }

  // WebKit runs no animation with a steps() timing function on the
  // compositor, so a stepped pulse would freeze in Safari while a script runs.
  it('keeps steps() out of the timing function so every engine can composite it', () => {
    const {animation} = pulse();
    expect(animation).toBeTruthy();
    // One class spells the whole shorthand: name, duration, and the three
    // longhands the old StyleX styles declared.
    expect(animation).toContain('astryxSkeletonFade_');
    expect(animation).toContain('_linear_');
    expect(animation).toContain('_infinite_');
    expect(animation).toContain('_alternate]');
    expect(animation).not.toContain('steps');
    const rule = keyframesRule(sheet.css, 'astryxSkeletonFade');
    expect(rule).toMatch(/opacity/);
    expect(rule).not.toMatch(/steps\(|animation-timing-function/);
  });

  it('climbs and falls through the same ten opacity steps at the same times', () => {
    render(<Skeleton width={200} height={20} data-testid="sk" />);
    const frames = opacityKeyframes(sheet.css, 'astryxSkeletonFade');
    expect(frames[0]).toEqual([0, 0.25]);
    // The previous pulse: 0.25 → 1 through steps(10, end), played back down
    // by `alternate`. Sample each tenth away from its edges.
    for (let step = 0; step < 10; step += 1) {
      for (const within of [0.02, 0.5, 0.98]) {
        const x = (step + within) / 10;
        const expected = 0.25 + 0.75 * (step / 10);
        expect(opacityAt(frames, x)).toBeCloseTo(expected, 6);
      }
    }
    // Each change between steps takes 0.01% of an iteration.
    for (let i = 1; i < frames.length; i += 1) {
      const [x0, y0] = frames[i - 1];
      const [x1, y1] = frames[i];
      if (y1 !== y0) {
        expect(x1 - x0).toBeCloseTo(0.0001, 6);
      }
    }
  });
});

// jsdom cannot emulate forced-colors rendering, so these assert that the
// compiled output includes the forced-colors rules; visual behavior needs
// manual verification under Windows High Contrast.
describe('forced colors (WCAG 1.4.11)', () => {
  // jsdom cannot emulate forced-colors rendering, so these assert that the
  // built stylesheet carries the forced-colors overrides; visual behavior
  // needs manual verification under Windows High Contrast.
  it('compiles forced-colors overrides so the placeholder stays visible under Windows High Contrast', () => {
    // The painted fill is stripped to Canvas (invisible); GrayText is a
    // system color, so it survives forcing.
    expect(sheet.blockOf('forced-colors:bg-[GrayText]')).toContain(
      'background-color:GrayText;',
    );
    // The resting 0.25 opacity is lifted so the static placeholder reads.
    expect(sheet.blockOf('forced-colors:opacity-[1]')).toContain('opacity:1;');
  });
});
