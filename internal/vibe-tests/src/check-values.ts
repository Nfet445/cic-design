// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file A family check page's recorded values and where each one comes from.
 * @input A check (CSS property, recorded value, originating class or inline
 *   custom property) and the built stylesheets that carry it.
 * @output Each check's declaration and resolved value, read from the built
 *   sheets, so the test and the page print the same answer.
 * @position internal/vibe-tests/src/check-values.ts; render-pages.ts renders
 *   the pages, and render-pages.test.ts asserts their checks.
 *
 * No browser measures these values. A class check reads the declaration the
 * built Tailwind sheet gives that class; a variable check reads the inline
 * custom property the component writes. Token references resolve through the
 * built StyleX sheet, which carries the token defaults. Lengths report in px
 * at the default 16px root size the environment's pages run at.
 */

/** The root font size the pages run at; no page sets `html { font-size }`. */
export const DEFAULT_ROOT_FONT_SIZE_PX = 16;

/** Where a check's value comes from. */
export type CheckSource =
  | {
      kind: 'class';
      /** The utility class the component emits, verbatim. */
      className: string;
      /**
       * A custom property the declaration floors the value at, for a value
       * that is not one length (for example `max(..., 1lh)`).
       */
      floor?: string;
    }
  | {
      kind: 'variable';
      /** The inline custom property the component writes on the element. */
      name: string;
    };

/** One value a family page shows and asserts. */
export interface Check {
  /** Names the check's row on the page. */
  id: string;
  /**
   * The rendered element that carries the value: its `data-astryx-value`
   * attribute. Defaults to `id`.
   */
  element?: string;
  /** The CSS property or custom property the value lands on. */
  property: string;
  /** The recorded value, in the units a reviewer reads. */
  expected: string;
  source: CheckSource;
  /** Why the value matters, shown on the page beside it. */
  note?: string;
}

/** A check read against the built sheets. */
export interface ResolvedCheck {
  check: Check;
  /** The declaration as the built sheet or the element writes it. */
  declared: string;
  /** The declaration after token substitution, in px where it is a length. */
  resolved: string;
  ok: boolean;
  /** Why the check failed; empty when it passed. */
  reason: string;
}

/** State of one rendered element that carries checked values. */
export interface ElementState {
  classNames: string[];
  /** Inline style declarations, custom properties included. */
  style: Record<string, string>;
}

/** Token defaults and class declarations read from the built stylesheets. */
export interface BuiltValues {
  /** Custom properties the built StyleX sheet declares on `:root`. */
  tokens: Record<string, string>;
  /** Class name to its declarations, from the built Tailwind sheet. */
  declarations: Map<string, Record<string, string>>;
}

/**
 * Read the token defaults and the class declarations out of the built sheets.
 * @param tokenCss - The built StyleX sheet, which declares the token defaults.
 * @param utilityCss - The built Tailwind sheet, which declares the classes.
 * @returns The values the checks resolve against.
 */
export function readBuiltValues(
  tokenCss: string,
  utilityCss: string,
): BuiltValues {
  return {
    tokens: readTokenValues(tokenCss),
    declarations: readClassDeclarations(utilityCss),
  };
}

/** Read the custom properties the built sheet declares on `:root`. */
export function readTokenValues(css: string): Record<string, string> {
  const tokens: Record<string, string> = {};
  for (const body of readTokenBodies(css)) {
    Object.assign(tokens, readDeclarations(body));
  }
  return tokens;
}

/**
 * Read the token declarations as one `:root` rule, verbatim, so a token that
 * refers to another token keeps its reference.
 */
export function readTokenCss(css: string): string {
  return `:root{${readTokenBodies(css).join(';\n')}}`;
}

function readTokenBodies(css: string): string[] {
  return [...css.matchAll(/:root[^{}]*\{([^{}]*)\}/g)].map(([, body]) => body);
}

/**
 * Read every class rule's declarations, keyed by the unescaped class name.
 * A class that appears in more than one media or state context keeps the
 * unconditional declaration, which is the one a static page shows.
 */
export function readClassDeclarations(
  css: string,
): Map<string, Record<string, string>> {
  const declarations = new Map<string, Record<string, string>>();
  for (const [, selector, body] of css.matchAll(
    /\.((?:\\(?:[0-9a-fA-F]{1,6}\s?|.)|[^\\{},\s])+)\s*\{([^{}]*)\}/g,
  )) {
    const className = selector.replace(
      /\\(?:([0-9a-fA-F]{1,6})\s?|(.))/g,
      (_, hex, char) =>
        hex ? String.fromCodePoint(Number.parseInt(hex, 16)) : char,
    );
    const existing = declarations.get(className);
    declarations.set(className, {...readDeclarations(body), ...existing});
  }
  return declarations;
}

/** Read the elements that carry checked values, keyed by `data-astryx-value`. */
export function readElements(markup: string): Map<string, ElementState> {
  const elements = new Map<string, ElementState>();
  for (const [tag] of markup.matchAll(/<[a-zA-Z][^>]*>/g)) {
    const attributes = readAttributes(tag);
    const id = attributes['data-astryx-value'];
    if (id === undefined) {
      continue;
    }
    elements.set(id, {
      classNames: (attributes.class ?? '').split(/\s+/).filter(Boolean),
      style: readDeclarations(attributes.style ?? ''),
    });
  }
  return elements;
}

/**
 * Read the custom properties an element carries: the ones its classes declare,
 * then the ones its inline style writes over them.
 */
export function elementVariables(
  element: ElementState,
  values: BuiltValues,
): ElementState {
  const variables: Record<string, string> = {};
  for (const className of element.classNames) {
    const declarations = values.declarations.get(className);
    if (declarations === undefined) {
      continue;
    }
    for (const [property, value] of Object.entries(declarations)) {
      if (property.startsWith('--')) {
        variables[property] = value;
      }
    }
  }
  return {...element, style: {...variables, ...element.style}};
}

/**
 * Resolve one check against the built sheets and the element's inline style.
 * @param check - The recorded value and its source.
 * @param values - The built sheet values.
 * @param element - The rendered element that carries the value, if any.
 * @returns The declaration, its resolved value, and whether they agree.
 */
export function resolveCheck(
  check: Check,
  values: BuiltValues,
  element?: ElementState,
): ResolvedCheck {
  const fail = (declared: string, resolved: string, reason: string) => ({
    check,
    declared,
    resolved,
    ok: false,
    reason,
  });

  if (check.source.kind === 'variable') {
    const name = check.source.name;
    const written = element?.style[name];
    if (written === undefined) {
      return fail('', '', `the element writes no ${name}`);
    }
    const resolved = written.trim();
    return resolved === check.expected
      ? {check, declared: `${name}: ${written}`, resolved, ok: true, reason: ''}
      : fail(
          `${name}: ${written}`,
          resolved,
          `${name} is ${resolved}, not ${check.expected}`,
        );
  }

  const {className, floor} = check.source;
  const declarations = values.declarations.get(className);
  if (declarations === undefined) {
    return fail('', '', `the built stylesheet has no .${className}`);
  }
  if (element !== undefined && !element.classNames.includes(className)) {
    return fail('', '', `the element does not carry .${className}`);
  }
  const declaration = declarations[check.property];
  if (declaration === undefined) {
    return fail('', '', `.${className} declares no ${check.property}`);
  }
  const substituted = substitute(declaration, values.tokens, element?.style);
  const resolved = evaluateLength(substituted) ?? substituted.trim();

  if (floor !== undefined) {
    const floorValue = values.tokens[floor];
    if (floorValue === undefined) {
      return fail(declaration, substituted, `the built sheet has no ${floor}`);
    }
    if (!declaration.includes(`var(${floor})`)) {
      return fail(
        declaration,
        substituted,
        `.${className} does not floor ${check.property} at ${floor}`,
      );
    }
    const floorPx = evaluateLength(substitute(floorValue, values.tokens)) ?? '';
    return floorPx === check.expected
      ? {
          check,
          declared: declaration,
          resolved: substituted,
          ok: true,
          reason: '',
        }
      : fail(
          declaration,
          substituted,
          `${floor} is ${floorPx}, not ${check.expected}`,
        );
  }

  return resolved === check.expected
    ? {check, declared: declaration, resolved, ok: true, reason: ''}
    : fail(
        declaration,
        resolved,
        `.${className} resolves to ${resolved}, not ${check.expected}`,
      );
}

/** Replace `var(...)` references from the element's own values, then tokens. */
function substitute(
  text: string,
  tokens: Record<string, string>,
  variables: Record<string, string> = {},
): string {
  let result = text;
  // A fallback may itself hold a reference, so resolve innermost references
  // first and stop once a pass changes nothing.
  for (let pass = 0; pass < 10; pass++) {
    const next = result.replace(
      /var\(\s*(--[a-zA-Z0-9_-]+)\s*(?:,\s*([^()]*))?\)/g,
      (match, name: string, fallback?: string) => {
        const value = variables[name] ?? tokens[name];
        if (value !== undefined) {
          return value;
        }
        if (fallback !== undefined && fallback.trim() !== '') {
          return fallback.trim();
        }
        return match;
      },
    );
    if (next === result) {
      break;
    }
    result = next;
  }
  return result;
}

/** Evaluate a length or a `calc`/`max` of lengths, reporting px. */
function evaluateLength(text: string): string | null {
  const trimmed = text.trim();
  const direct = toPx(trimmed);
  if (direct !== null) {
    return formatPx(direct);
  }

  const calc = /^calc\((.+)\)$/.exec(trimmed);
  if (calc !== null) {
    const value = evaluateMath(calc[1]);
    return value === null ? null : formatPx(value);
  }

  const max = /^max\((.+)\)$/.exec(trimmed);
  if (max !== null) {
    const values = max[1].split(',').map(part => toPx(part.trim()));
    if (values.some(value => value === null)) {
      return null;
    }
    return formatPx(Math.max(...(values as number[])));
  }

  return null;
}

/** Evaluate left-to-right multiplication, addition and subtraction. */
function evaluateMath(expression: string): number | null {
  const parts = expression.split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return null;
  }
  const first = toPx(parts[0]);
  if (first === null) {
    return null;
  }
  let total = first;
  for (let index = 1; index + 1 < parts.length; index += 2) {
    const operator = parts[index];
    const operand = parts[index + 1];
    if (operator === '*') {
      const factor = Number(operand);
      if (!Number.isFinite(factor)) {
        return null;
      }
      total *= factor;
    } else {
      const value = toPx(operand);
      if (value === null) {
        return null;
      }
      total = operator === '+' ? total + value : total - value;
    }
  }
  return total;
}

function toPx(term: string): number | null {
  const match = /^(-?\d*\.?\d+)(px|rem)$/.exec(term.trim());
  if (match === null) {
    return null;
  }
  const value = Number(match[1]);
  return match[2] === 'rem' ? value * DEFAULT_ROOT_FONT_SIZE_PX : value;
}

function formatPx(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return `${rounded}px`;
}

function readDeclarations(body: string): Record<string, string> {
  const declarations: Record<string, string> = {};
  for (const part of body.split(';')) {
    const colon = part.indexOf(':');
    if (colon === -1) {
      continue;
    }
    const property = part.slice(0, colon).trim();
    const value = part.slice(colon + 1).trim();
    if (property !== '') {
      declarations[property] = value;
    }
  }
  return declarations;
}

function readAttributes(tag: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  for (const [, name, value] of tag.matchAll(
    /([a-zA-Z_:][-a-zA-Z0-9_:.]*)="([^"]*)"/g,
  )) {
    attributes[name] = value;
  }
  return attributes;
}
