// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file classNameAssertions.ts
 * @input Takes a rendered element, the class text it carries, and a built
 *   package stylesheet
 * @output classesOf, expectClassSet, expectVariable — assertions over the
 *   computed class set and inline custom properties; stylesheetOf,
 *   missingClassRules, gzipBytes, stylexGzipLimit, layerProblems, and
 *   describeTailwindStylesheet — the shared stylesheet contract
 * @position Test harness (FR8, FR10): one place decides which class tokens
 *   count and one factory holds every package's sheet checks
 *
 * `classesOf` drops StyleX debug names, so a test asserts the classes a
 * component asked for and not a source label the development runtime prints
 * beside them. A stylesheet test asserts a declaration once, against the
 * built sheet, and never a computed declaration only a browser resolves.
 */

import {gzipSync} from 'node:zlib';

import {describe, expect, it} from 'vitest';

/**
 * StyleX prints a debug name beside each atomic class in development, e.g.
 * `focusOutline__focusOutlineStyles.focusVisible`. It names the source of a
 * style, not a class the element asked for, so it never counts as styling.
 */
const STYLEX_DEBUG_MARKER = '__';

/** The class tokens the element asked for, in document order. */
export function classesOf(element: Element): string[] {
  // `classList`, not `className`: an SVG element's `className` is not a string.
  return Array.from(element.classList).filter(
    className => !className.includes(STYLEX_DEBUG_MARKER),
  );
}

export interface ClassExpectations {
  /** Every class the element must carry. */
  includes?: ReadonlyArray<string>;
  /** Every class the element must not carry. */
  excludes?: ReadonlyArray<string>;
}

/** Assert the class set the component computed, absence included. */
export function expectClassSet(
  element: Element,
  expected: ClassExpectations,
): void {
  const classes = new Set(classesOf(element));
  for (const className of expected.includes ?? []) {
    expect(classes, `missing class "${className}"`).toContain(className);
  }
  for (const className of expected.excludes ?? []) {
    expect(classes, `unexpected class "${className}"`).not.toContain(className);
  }
}

/** Assert the inline custom property a class consumes. */
export function expectVariable(
  element: HTMLElement,
  property: string,
  value: string,
): void {
  expect(element.style.getPropertyValue(property).trim(), property).toBe(value);
}

export interface Stylesheet {
  /** The sheet exactly as the package ships it. */
  readonly css: string;
  /** The sheet with whitespace removed, for order assertions. */
  readonly compact: string;
  /** Every selector → declaration pair, Tailwind's escapes removed. */
  readonly rules: ReadonlyMap<string, string>;
  /** The declaration of this utility, whichever way Tailwind wrote it. */
  readonly ruleFor: (className: string) => string | undefined;
  /** The whole block of this class, nested variant blocks included. */
  readonly blockOf: (className: string) => string | undefined;
  /** True when the sheet carries a rule for this class name. */
  readonly hasRule: (className: string) => boolean;
}

/** Read a built sheet once and answer the questions a test asks of it. */
export function stylesheetOf(css: string): Stylesheet {
  const rules = new Map<string, string>();
  for (const match of css.matchAll(/([^{}@]+)\{([^{}]*)\}/g)) {
    const selector = match[1].trim().replace(/\\/g, '');
    // A comma inside `minmax(0,1fr)` is part of the class name, not a
    // selector separator, so the selector stays whole.
    rules.set(selector, match[2].replace(/\s+/g, ''));
  }

  const compact = css.replace(/\s+/g, '');
  const flat = css.replace(/\\/g, '').replace(/\s+/g, '');

  const ruleFor = (className: string) =>
    rules.get(`.${className}`) ?? rules.get(className);

  // A variant class prints as `.name { &[attr] { … } }`, which a flat rule
  // map cannot hold, so the block is read by counting braces from the
  // selector.
  const blockOf = (className: string): string | undefined => {
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
  };

  const hasRule = (className: string) =>
    ruleFor(className) != null || blockOf(className) != null;

  return {blockOf, compact, css, hasRule, ruleFor, rules};
}

/** Every class the maps can emit that has no rule, so one report lists all. */
export function missingClassRules(
  stylesheet: Stylesheet,
  classNames: ReadonlyArray<string>,
): string[] {
  return classNames.filter(className => !stylesheet.hasRule(className));
}

/** Gzipped size of the sheet, at the level the StyleX baseline was measured. */
export function gzipBytes(css: string): number {
  return gzipSync(Buffer.from(css), {level: 9}).length;
}

/** The size gate: 1.15× the package's StyleX gzip baseline, rounded down. */
export function stylexGzipLimit(stylexGzipBaseline: number): number {
  return Math.floor(stylexGzipBaseline * 1.15);
}

const LAYER_ORDER = '@layerreset,astryx-base,astryx-theme;';
const CONSUMER_SLOTS = '@layertheme,base,components,utilities;';

/** What keeps a sheet from registering the contract's layer order. */
export function layerProblems(css: string): string[] {
  const compact = css.replace(/\s+/g, '');
  // The banners are comments, not statements: the order must open the rules.
  const firstStatement = compact.replace(/^(?:\/\*[\s\S]*?\*\/)+/, '');
  const problems: string[] = [];

  if (!firstStatement.startsWith(LAYER_ORDER)) {
    problems.push(
      'does not register `@layer reset, astryx-base, astryx-theme;` first',
    );
  }
  if (compact.includes('@layerproperties;')) {
    problems.push('keeps the empty `@layer properties;` statement');
  }
  if (!compact.includes(CONSUMER_SLOTS)) {
    problems.push('does not place the consumer slots after the Astryx layers');
  }
  if (!compact.includes('@layerastryx-base{')) {
    problems.push('puts no rule in `@layer astryx-base`');
  }
  if (compact.includes('@medialayer(')) {
    problems.push(
      'prints a layer as `@media layer(...)`, which no browser reads',
    );
  }

  return problems;
}

export interface TailwindStylesheetOptions {
  /** Artifact name, used as the describe title, e.g. `dist/astryx-tailwind.css`. */
  name: string;
  /** The built sheet, exactly as the package ships it. */
  css: string;
  /** Every class the package's class maps can emit. */
  classNames: ReadonlyArray<string>;
  /** Gzip bytes of the package's StyleX sheet at `stylexBaselineCommit`. */
  stylexGzipBaseline: number;
  /** The commit the baseline was measured on; it names the constant's origin. */
  stylexBaselineCommit: string;
}

/**
 * The stylesheet contract every package that ships a Tailwind sheet runs:
 * every class its maps can emit has a rule, the sheet stays within 1.15× its
 * StyleX gzip baseline, and the layer order is registered before any rule.
 *
 * A package supplies only its built sheet, its class list, and its measured
 * baseline; the checks stay here so no package writes a second sheet test.
 *
 * TODO(ticket 29/30): lab, charts, and richtext call this factory once their
 * package build ships a stylesheet. Each passes its own class list and its own
 * StyleX baseline measured at `f35022021`, and no package adds a sheet test
 * beside this call.
 */
export function describeTailwindStylesheet({
  name,
  css,
  classNames,
  stylexGzipBaseline,
  stylexBaselineCommit,
}: TailwindStylesheetOptions): void {
  const stylesheet = stylesheetOf(css);
  const gzip = gzipBytes(css);
  const raw = Buffer.byteLength(css);
  const limit = stylexGzipLimit(stylexGzipBaseline);

  describe(name, () => {
    it('covers every class its class maps emit', () => {
      expect(missingClassRules(stylesheet, classNames)).toEqual([]);
    });

    it(`stays within 1.15× the ${stylexBaselineCommit} StyleX gzip baseline (${raw} B raw, ${gzip} B gzip, gate ${limit} B)`, () => {
      expect(gzip).toBeLessThanOrEqual(limit);
    });

    it('registers the layer order before its first rule', () => {
      expect(layerProblems(css)).toEqual([]);
    });
  });
}
