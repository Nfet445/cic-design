// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file classNameAssertions.test.ts
 * @input Takes hand-built elements and stylesheet text
 * @output Proves the shared assertions read the class set a component asked
 *   for, the inline variable it sets, and the rules a built sheet carries
 * @position Self-test for the test harness (ticket 02); the assertions
 *   themselves are exercised by the component tests
 */

import {describe, expect, it} from 'vitest';
import {
  classesOf,
  expectClassSet,
  expectVariable,
  GZIP_BUDGET_FACTOR,
  gzipBytes,
  layerProblems,
  missingClassRules,
  sheetGzipBudget,
  STYLEX_GZIP_BUDGETS,
  stylesheetOf,
  stylexGzipLimit,
} from './classNameAssertions';

function element(...classNames: ReadonlyArray<string>): HTMLElement {
  const el = document.createElement('button');
  el.className = classNames.join(' ');
  return el;
}

describe('classesOf', () => {
  it('keeps the classes the component asked for', () => {
    expect(
      classesOf(
        element(
          'astryx-button',
          'py-[var(--spacing-2)]',
          'focusOutline__focusOutlineStyles.focusVisible',
        ),
      ),
    ).toEqual(['astryx-button', 'py-[var(--spacing-2)]']);
  });

  it('reads an SVG element whose className is not a string', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'size-4 icon__iconStyles.root');

    expect(classesOf(svg)).toEqual(['size-4']);
  });
});

describe('expectClassSet', () => {
  const button = element('astryx-button', 'shrink-0');

  it('accepts the classes an element carries', () => {
    expectClassSet(button, {
      excludes: ['w-[var(--astryx-button-width)]'],
      includes: ['astryx-button', 'shrink-0'],
    });
  });

  it('names a missing class', () => {
    expect(() =>
      expectClassSet(button, {includes: ['w-[var(--astryx-button-width)]']}),
    ).toThrow(/w-\[var\(--astryx-button-width\)\]/);
  });

  it('names a class that must be absent', () => {
    expect(() => expectClassSet(button, {excludes: ['shrink-0']})).toThrow(
      /shrink-0/,
    );
  });
});

describe('expectVariable', () => {
  it('reads the inline custom property the class consumes', () => {
    const button = element('astryx-button');
    button.style.setProperty('--astryx-button-width', '100%');

    expectVariable(button, '--astryx-button-width', '100%');
  });

  it('fails on a different value', () => {
    const button = element('astryx-button');
    button.style.setProperty('--astryx-button-width', '240px');

    expect(() =>
      expectVariable(button, '--astryx-button-width', '100%'),
    ).toThrow(/240px/);
  });
});

describe('stylesheetOf', () => {
  const sheet = stylesheetOf(
    '.gap-2{gap:calc(var(--spacing-1)*2);}' +
      '.aria-pressed\\:bg-\\[var\\(--color-overlay-pressed\\)\\]{' +
      '&[aria-pressed="true"]{background-color:var(--color-overlay-pressed);}}',
  );

  it('finds a flat rule by its class', () => {
    expect(sheet.ruleFor('gap-2')).toBe('gap:calc(var(--spacing-1)*2);');
    expect(sheet.hasRule('gap-2')).toBe(true);
  });

  it('finds a nested variant block by its class', () => {
    const className = 'aria-pressed:bg-[var(--color-overlay-pressed)]';

    expect(sheet.blockOf(className)).toContain('&[aria-pressed="true"]');
    expect(sheet.hasRule(className)).toBe(true);
  });

  it('reports a class no rule carries', () => {
    expect(sheet.hasRule('opacity-50')).toBe(false);
  });
});

describe('missingClassRules', () => {
  it('lists every class the sheet has no rule for', () => {
    const sheet = stylesheetOf('.gap-2{gap:2px;}');

    expect(missingClassRules(sheet, ['gap-2', 'p-2'])).toEqual(['p-2']);
  });
});

describe('stylexGzipLimit', () => {
  it('allows 1.15× the measured baseline', () => {
    expect(stylexGzipLimit(42_331)).toBe(48_680);
  });

  it('measures gzip at the level the baseline used', () => {
    expect(
      gzipBytes('@layer astryx-base { .p-2 { padding: 2px; } }'),
    ).toBeGreaterThan(0);
  });
});

describe('layerProblems', () => {
  const valid = [
    '/* banner */',
    '/* Auto-generated. Do not edit manually. */',
    '@layer reset, astryx-base, astryx-theme;',
    '@layer theme, base, components, utilities;',
    '@layer astryx-base {',
    '.gap-2 { gap: calc(var(--spacing-1) * 2); }',
    '}',
  ].join('\n');

  it('accepts a sheet that registers the order before its first rule', () => {
    expect(layerProblems(valid)).toEqual([]);
  });

  it('rejects a sheet whose first statement is not the order', () => {
    expect(
      layerProblems(
        valid.replace('@layer reset, astryx-base, astryx-theme;', ''),
      ),
    ).not.toEqual([]);
  });

  it('rejects the leftover properties layer', () => {
    expect(layerProblems(`@layer properties;\n${valid}`)).not.toEqual([]);
  });

  it('rejects a layer printed inside a media query', () => {
    expect(
      layerProblems(
        valid.replace('@layer astryx-base {', '@media layer(astryx-base) {'),
      ),
    ).not.toEqual([]);
  });
});

describe('STYLEX_GZIP_BUDGETS', () => {
  it('measures every baseline on a named commit', () => {
    for (const [name, budget] of Object.entries(STYLEX_GZIP_BUDGETS)) {
      expect(budget.commit, name).toMatch(/^[0-9a-f]{7,40}$/);
      expect(budget.stylexGzipBaseline, name).toBeGreaterThan(0);
    }
  });

  it('states why a package needs its own allowance', () => {
    for (const [name, budget] of Object.entries(STYLEX_GZIP_BUDGETS)) {
      if (budget.gzipBudget == null) {
        continue;
      }
      expect(budget.reason, name).toBeTruthy();
      expect(budget.gzipBudget, name).toBeGreaterThan(
        stylexGzipLimit(budget.stylexGzipBaseline),
      );
    }
  });

  it('applies the shared factor when a package has no allowance', () => {
    expect(GZIP_BUDGET_FACTOR).toBe(1.15);
    expect(sheetGzipBudget('core')).toBe(
      stylexGzipLimit(STYLEX_GZIP_BUDGETS.core.stylexGzipBaseline),
    );
    expect(sheetGzipBudget('charts')).toBe(
      STYLEX_GZIP_BUDGETS.charts.gzipBudget,
    );
  });
});
