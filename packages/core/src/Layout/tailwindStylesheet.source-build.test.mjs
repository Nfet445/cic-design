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
import {
  buttonClassName,
  buttonForcedColorsEdgeClassName,
  buttonPressClassName,
} from '../Button/buttonClasses';
import {buttonGroupClassName} from '../ButtonGroup/buttonGroupClasses';
import {centerClassName, centerSizingClassName} from '../Center/centerClasses';
import {gridClassName, gridSpanClassName} from '../Grid/gridClasses';
import {paddingEdgeClassName} from '../Layout/paddingClasses';
import {stackClassName} from '../Stack/stackClasses';
import {stackItemClassName} from '../Stack/stackItemClasses';
import {toggleButtonClassName} from '../ToggleButton/toggleButtonClasses';
import {toggleButtonGroupClassName} from '../ToggleButton/toggleButtonGroupClasses';
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
const flat = sheet.replace(/\\/g, '').replace(/\s+/g, '');

/** The declaration of this utility, whichever way Tailwind writes the selector. */
function ruleFor(className) {
  return rules.get(`.${className}`) ?? rules.get(className);
}

/**
 * The whole block of this class, nested variant blocks included. A variant
 * class prints as `.name { &[attr] { … } }`, which a flat rule map cannot
 * hold, so the block is read by counting braces from the selector.
 */
function blockOf(className) {
  const needle = `.${className}{`;
  const at = flat.indexOf(needle);
  if (at < 0) {
    return undefined;
  }
  const start = at + needle.length;
  let depth = 1;
  for (let index = start; index < flat.length; index += 1) {
    if (flat[index] === '{') {
      depth += 1;
    } else if (flat[index] === '}') {
      depth -= 1;
      if (depth === 0) {
        return flat.slice(start, index);
      }
    }
  }
  return undefined;
}

/** True when the sheet carries a rule for this utility class name. */
function hasRule(className) {
  return ruleFor(className) != null || blockOf(className) != null;
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

  for (const variant of ['primary', 'secondary', 'ghost', 'destructive']) {
    for (const size of ['sm', 'md', 'lg']) {
      for (const elevation of ['none', 'low', 'med', 'high']) {
        add(
          buttonClassName({
            elevation,
            isGrouped: false,
            isIconOnly: false,
            isInactive: false,
            isTrulyDisabled: false,
            orientation: 'horizontal',
            size,
            variant,
          }),
        );
      }
    }
    add(
      buttonForcedColorsEdgeClassName({
        isError: variant === 'destructive',
        isGrouped: true,
        isSolid: variant === 'primary' || variant === 'destructive',
        orientation: 'vertical',
      }),
    );
  }
  add(buttonPressClassName());
  add(
    buttonClassName({
      elevation: 'none',
      isGrouped: true,
      isIconOnly: true,
      isInactive: true,
      isTrulyDisabled: true,
      orientation: 'vertical',
      size: 'lg',
      variant: 'ghost',
    }),
  );
  add(buttonGroupClassName({elevation: 'med', orientation: 'vertical', tracksPress: true}));
  add(toggleButtonClassName({isPressed: true}));
  add(toggleButtonGroupClassName({orientation: 'vertical', tracksPress: true}));

  return [...names].sort();
}

const classNames = familyClassNames();

describe('dist/astryx-tailwind.css', () => {
  it('covers every class the layout maps emit', () => {
    const missing = classNames.filter(className => !hasRule(className));
    expect(missing).toEqual([]);
  });

  it('stays within the budget of its class maps', () => {
    // The layout maps and the words in their comments produce about 120
    // rules; the Button map adds about 115. A scan that reaches component
    // bodies or prose would add hundreds more.
    expect(rules.size).toBeLessThan(320);
    // A Tailwind palette colour or a default font stack belongs to no map:
    // its presence means the build read text no map produced.
    expect(compact).not.toMatch(
      /\.(bg|text|border|ring|fill|stroke)-(red|blue|green|gray|slate|zinc|neutral|stone|amber|lime|emerald|teal|cyan|sky|indigo|violet|purple|fuchsia|pink|rose|white|black)-/,
    );
    expect(compact).not.toMatch(/font-(sans|serif|mono)\b/);
  });

  it('keeps the rules in the astryx-base layer', () => {
    // `spec:AST-080` FR3 wants this registration first in every package
    // stylesheet; the consumer slots follow it.
    expect(compact.startsWith(
      '/*AstryxCorePre-compiledTailwindCSS—layoutprimitives*//*Auto-generated.Donoteditmanually.*/@layerreset,astryx-base,astryx-theme;',
    )).toBe(true);
    // Tailwind's empty `properties` declaration must not precede it.
    expect(compact).not.toContain('@layerproperties;');
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

  it('keeps a state class later than the base declaration it overrides', () => {
    // `ToggleButton` shifts its label to semibold over Button's medium. Both
    // are arbitrary-property classes in the same layer, so the sheet order,
    // not the class attribute, decides: the shift must come after.
    expect(compact.indexOf('font-weight:var(--font-weight-semibold)'))
      .toBeGreaterThan(compact.indexOf('font-weight:var(--font-weight-medium)'));
  });

  it('lets a pressed toggle outrank the ghost surface it overrides', () => {
    // The ghost Button paints `bg-transparent`; the pressed overlay is a
    // different class in the same layer, so it carries the `aria-pressed`
    // variant to win on specificity. Without the variant the sheet order
    // decides, and the overlay loses in a browser.
    const pressed = blockOf('aria-pressed:bg-[var(--color-overlay-pressed)]');
    expect(pressed).toContain('&[aria-pressed="true"]');
    expect(pressed).toContain('background-color:var(--color-overlay-pressed)');
  });

  it('declares no theme variable of its own', () => {
    // `reference` keeps the declarations with the consumer's theme.
    expect(compact).not.toContain(':root{');
    expect(compact).not.toMatch(/--spacing-1:/);
  });
});
