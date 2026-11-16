// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tailwindStylesheet.source-build.test.mjs
 * @input Uses the Tailwind build script and the layout class maps
 * @output Verifies the shipped stylesheet declares what the components can
 *   emit: every class the family's maps produce has a rule, the rules sit in
 *   `astryx-base`, and no theme variable is declared
 * @position Cases for the declaration half of the styling contract (FR8); the
 *   components' own tests assert the class set
 */

import {buildAstryxTailwindCss} from '../../scripts/build-css-tailwind.mjs';
import {centerClassName, centerSizingClassName} from '../Center/centerClasses';
import {gridClassName, gridSpanClassName} from '../Grid/gridClasses';
import {paddingEdgeClassName} from '../Layout/paddingClasses';
import {stackClassName} from '../Stack/stackClasses';
import {stackItemClassName} from '../Stack/stackItemClasses';
import {describe, expect, it} from 'vitest';

const sheet = await buildAstryxTailwindCss();

/**
 * The sheet as selector → declaration pairs, with the escapes Tailwind writes
 * removed and the formatting collapsed.
 */
function rulesOf(css) {
  const rules = new Map();
  for (const [, rawSelector, rawBody] of css.matchAll(/([^{}@]+)\{([^{}]*)\}/g)) {
    const selector = rawSelector.trim().replace(/\\/g, '');
    const body = rawBody.replace(/\s+/g, '');
    // A comma inside `minmax(0,1fr)` is part of the class name, not a
    // selector separator, so the selector stays whole.
    rules.set(selector, body);
  }
  return rules;
}

const rules = rulesOf(sheet);
const compact = sheet.replace(/\s+/g, '');

/** The declaration of this utility, whichever way Tailwind writes the selector. */
function ruleFor(className) {
  return rules.get(`.${className}`) ?? rules.get(className);
}

/** True when the sheet carries a rule for this utility class name. */
function hasRule(className) {
  return ruleFor(className) != null;
}

/**
 * Every class string the family can produce, read from the maps the
 * components call, so a class added to a map without a matching rule fails
 * here rather than in a browser.
 */
function familyClassNames() {
  const names = new Set();
  const add = value => {
    for (const className of value.split(/\s+/)) {
      if (className !== '') {
        names.add(className);
      }
    }
  };

  for (const direction of ['horizontal', 'vertical']) {
    for (const wrap of ['nowrap', 'wrap', 'wrap-reverse']) {
      for (const scrollable of [false, true]) {
        add(
          stackClassName({
            crossAlign: 'center',
            direction,
            gap: 2,
            mainAlign: 'between',
            scrollable,
            wrap,
          }),
        );
      }
    }
  }
  for (const size of ['fill', 'static']) {
    add(stackItemClassName({crossAlignSelf: 'stretch', scrollable: true, size}));
  }
  add(
    gridClassName({
      align: 'stretch',
      columnGap: 10,
      gap: 3,
      justify: 'end',
      rowGap: 0.5,
    }),
  );
  add(gridClassName({align: 'start', gap: 0, justify: 'center', rowGap: 8}));
  add(gridSpanClassName);
  add(centerClassName({axis: 'horizontal', isInline: true}));
  add(centerClassName({axis: 'vertical', isInline: false}));
  add(centerSizingClassName({height: 120, maxWidth: '50%', width: 300}));
  add(
    paddingEdgeClassName({
      paddingBlockEnd: 10,
      paddingBlockStart: 0.5,
      paddingInlineEnd: 1.5,
      paddingInlineStart: 4,
    }),
  );

  return [...names].sort();
}

const classNames = familyClassNames();

describe('dist/astryx-tailwind.css', () => {
  it('covers every class the layout maps emit', () => {
    const missing = classNames.filter(className => !hasRule(className));
    expect(missing).toEqual([]);
  });

  it('stays within the budget of a family stylesheet', () => {
    // The maps, and the words in their comments, produce about 120 rules. A
    // scan that reaches component bodies or prose pushes this past 200.
    expect(rules.size).toBeLessThan(140);
    // Colour and typography utilities belong to components this stylesheet
    // does not style: their presence means the scan widened.
    expect(compact).not.toMatch(/\.(bg|text|font)-(?!\[)/);
  });

  it('keeps the rules in the astryx-base layer', () => {
    // `spec:AST-080` FR3 wants this registration first in every package
    // stylesheet; the consumer slots follow it.
    expect(compact.startsWith(
      '/*AstryxCorePre-compiledTailwindCSS—layoutprimitives*//*Auto-generated.Donoteditmanually.*/@layerreset,astryx-base,astryx-theme;',
    )).toBe(true);
    expect(compact).toContain('@layertheme,base,components,utilities;');
    const layerStart = compact.indexOf('@layerastryx-base{');
    expect(layerStart).toBeGreaterThan(-1);
    expect(compact.indexOf('.gap-2{')).toBeGreaterThan(layerStart);
    // A layer printed as `@media layer(...)` reads as no styles at all.
    expect(compact).not.toContain('@medialayer(');
  });

  it('declares token-dependent utilities against the theme variables', () => {
    expect(ruleFor('gap-2')).toBe('gap:calc(var(--spacing-1)*2);');
    expect(ruleFor('[padding-block-start:var(--spacing-2)]')).toBe(
      'padding-block-start:var(--spacing-2);',
    );
    expect(ruleFor('grid-cols-[var(--astryx-grid-template-columns)]')).toBe(
      'grid-template-columns:var(--astryx-grid-template-columns);',
    );
  });

  it('declares no theme variable of its own', () => {
    // `reference` keeps the declarations with the consumer's theme.
    expect(compact).not.toContain(':root{');
    expect(compact).not.toMatch(/--spacing-1:/);
  });
});
