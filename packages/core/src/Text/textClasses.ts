// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file textClasses.ts
 * @input Uses token variables from the theme, the text type scale
 * @output The utility class strings a Text or Heading root element and the
 *   truncation tooltip carry, plus the custom property a multi-line clamp reads
 * @position Internal to Text; the Tailwind build scans it for class names
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Text/Text.doc.mjs
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import type {
  BuiltinTextColor,
  BuiltinTextType,
  TextDisplay,
  TextJustify,
  TextSize,
  TextWeight,
  TextWrap,
  WordBreak,
} from '../theme/types';
import {tw} from '../utils/tw';

// Each axis picks exactly one class. A base class plus an override class would
// both sit in `astryx-base`, where the sheet order decides the winner, not the
// class attribute. So font size splits from line height, and an explicit `size`
// or `weight` replaces the type's own class instead of overriding it.

const COLOR_CLASS: Record<BuiltinTextColor, string> = {
  primary: 'text-[color:var(--color-text-primary)]',
  secondary: 'text-[color:var(--color-text-secondary)]',
  disabled: 'text-[color:var(--color-text-disabled)]',
  placeholder: 'text-[color:var(--color-text-secondary)]',
  accent: 'text-[color:var(--color-text-accent)]',
  inherit: 'text-[color:inherit]',
};

const TYPE_FONT_SIZE_CLASS: Record<BuiltinTextType, string> = {
  body: 'text-[length:var(--text-body-size)]',
  large: 'text-[length:var(--text-large-size)]',
  label: 'text-[length:var(--text-label-size)]',
  code: 'text-[length:var(--text-code-size)]',
  supporting: 'text-[length:var(--text-supporting-size)]',
  'display-1': 'text-[length:var(--text-display-1-size)]',
  'display-2': 'text-[length:var(--text-display-2-size)]',
  'display-3': 'text-[length:var(--text-display-3-size)]',
  inherit: 'text-[length:inherit]',
};

/** Line height per type; `code` also names the code font family. */
const TYPE_LINE_HEIGHT_CLASS: Record<BuiltinTextType, string> = {
  body: '[line-height:var(--text-body-leading)]',
  large: '[line-height:var(--text-large-leading)]',
  label: '[line-height:var(--text-label-leading)]',
  code: tw('[line-height:var(--text-code-leading)]', 'font-mono'),
  supporting: '[line-height:var(--text-supporting-leading)]',
  'display-1': '[line-height:var(--text-display-1-leading)]',
  'display-2': '[line-height:var(--text-display-2-leading)]',
  'display-3': '[line-height:var(--text-display-3-leading)]',
  inherit: '[line-height:inherit]',
};

// A heading without a display type takes its whole type from its level, so the
// level splits into the same three axes as a type: a level weight would
// otherwise fight an explicit `weight` in the sheet order.
type HeadingClassLevel = 1 | 2 | 3 | 4 | 5 | 6;

const LEVEL_FONT_SIZE_CLASS: Record<HeadingClassLevel, string> = {
  1: 'text-[length:var(--text-heading-1-size)]',
  2: 'text-[length:var(--text-heading-2-size)]',
  3: 'text-[length:var(--text-heading-3-size)]',
  4: 'text-[length:var(--text-heading-4-size)]',
  5: 'text-[length:var(--text-heading-5-size)]',
  6: 'text-[length:var(--text-heading-6-size)]',
};

const LEVEL_LINE_HEIGHT_CLASS: Record<HeadingClassLevel, string> = {
  1: '[line-height:var(--text-heading-1-leading)]',
  2: '[line-height:var(--text-heading-2-leading)]',
  3: '[line-height:var(--text-heading-3-leading)]',
  4: '[line-height:var(--text-heading-4-leading)]',
  5: '[line-height:var(--text-heading-5-leading)]',
  6: '[line-height:var(--text-heading-6-leading)]',
};

const LEVEL_WEIGHT_CLASS: Record<HeadingClassLevel, string> = {
  1: '[font-weight:var(--text-heading-1-weight)]',
  2: '[font-weight:var(--text-heading-2-weight)]',
  3: '[font-weight:var(--text-heading-3-weight)]',
  4: '[font-weight:var(--text-heading-4-weight)]',
  5: '[font-weight:var(--text-heading-5-weight)]',
  6: '[font-weight:var(--text-heading-6-weight)]',
};

const DEFAULT_WEIGHT_CLASS: Record<BuiltinTextType, string> = {
  body: '[font-weight:var(--text-body-weight)]',
  large: '[font-weight:var(--text-large-weight)]',
  label: '[font-weight:var(--text-label-weight)]',
  code: '[font-weight:var(--text-code-weight)]',
  supporting: '[font-weight:var(--text-supporting-weight)]',
  'display-1': '[font-weight:var(--text-display-1-weight)]',
  'display-2': '[font-weight:var(--text-display-2-weight)]',
  'display-3': '[font-weight:var(--text-display-3-weight)]',
  inherit: '[font-weight:inherit]',
};

const WEIGHT_CLASS: Record<TextWeight, string> = {
  normal: '[font-weight:var(--font-weight-normal)]',
  medium: '[font-weight:var(--font-weight-medium)]',
  semibold: '[font-weight:var(--font-weight-semibold)]',
  bold: '[font-weight:var(--font-weight-bold)]',
};

/** Explicit size override; `xsm` names the `xs` token, as it always has. */
const SIZE_CLASS: Record<TextSize, string> = {
  '4xs': 'text-[length:var(--font-size-4xs)]',
  '3xs': 'text-[length:var(--font-size-3xs)]',
  '2xs': 'text-[length:var(--font-size-2xs)]',
  xsm: 'text-[length:var(--font-size-xs)]',
  sm: 'text-[length:var(--font-size-sm)]',
  base: 'text-[length:var(--font-size-base)]',
  lg: 'text-[length:var(--font-size-lg)]',
  xl: 'text-[length:var(--font-size-xl)]',
  '2xl': 'text-[length:var(--font-size-2xl)]',
  '3xl': 'text-[length:var(--font-size-3xl)]',
  '4xl': 'text-[length:var(--font-size-4xl)]',
};

// A token longer than its line (a URL, an ID) wraps instead of overflowing, so
// in ordinary flow text does not force horizontal scrolling at 320 CSS px
// (WCAG 2.2 1.4.10). `break-word` keeps min-content, so tables and auto-sized
// columns lay out ordinary words as before; a flex child still needs
// `min-width: 0` from its container. A container that wraps with `anywhere` (an
// empty state, a toast, a banner) sets the private
// `--_astryx-text-overflow-wrap` beside its own `overflow-wrap`, so Text inside
// it keeps `anywhere`.
const NON_TRUNCATED_OVERFLOW_WRAP =
  '[overflow-wrap:var(--_astryx-text-overflow-wrap,break-word)]';

const DISPLAY_CLASS: Record<TextDisplay, string> = {
  inline: tw('inline', NON_TRUNCATED_OVERFLOW_WRAP),
  block: tw('block', NON_TRUNCATED_OVERFLOW_WRAP),
};

/**
 * The custom property a multi-line clamp reads. The line count is a
 * per-instance number no class can name, so Text sets this property inline and
 * the class reads it.
 */
export const textLineClampVars = {
  lineClamp: '--astryx-text-line-clamp',
} as const;

const TRUNCATION_SINGLE_LINE_CLASS =
  'block overflow-hidden text-ellipsis whitespace-nowrap';
// The clamp class spells the property rather than building it from
// `textLineClampVars`: the build scans literal class strings, and a class
// assembled at runtime never reaches the sheet. The box is its own class,
// because a capsize text keeps the clamp but drops the box.
const TRUNCATION_CLAMP_BOX_CLASS = '[display:-webkit-box]';
const TRUNCATION_CLAMP_CLASS = tw(
  'overflow-hidden',
  '[-webkit-box-orient:vertical]',
  '[-webkit-line-clamp:var(--astryx-text-line-clamp)]',
);

const WORD_BREAK_CLASS: Record<WordBreak, string> = {
  'break-word': tw('[word-break:normal]', '[overflow-wrap:break-word]'),
  'break-all': '[word-break:break-all]',
};

const TEXT_WRAP_CLASS: Record<TextWrap, string> = {
  wrap: 'text-wrap',
  nowrap: 'text-nowrap',
  balance: 'text-balance',
  pretty: 'text-pretty',
};

const JUSTIFY_CLASS: Record<TextJustify, string> = {
  start: 'text-start',
  center: 'text-center',
  end: 'text-end',
};

// A capsize text is a block, which `Text` already forces through `display`.
const CAPSIZE_CLASS = tw(
  '[text-box-edge:cap_alphabetic]',
  '[text-box-trim:trim-both]',
);

/**
 * The named utility for this property registers a `--tw-*` variable, so this
 * spells the declaration instead.
 */
const TABULAR_NUMBERS_CLASS = '[font-variant-numeric:tabular-nums]';
const STRIKETHROUGH_CLASS = 'line-through';

export const truncationTooltipContentClassName = tw(
  'max-w-[300px]',
  '[word-break:break-word]',
);

/** True when the type is one the type scale names, so its classes exist. */
export function isBuiltinTextType(type: string): type is BuiltinTextType {
  return type in TYPE_FONT_SIZE_CLASS;
}

/** True when the color is one Text's own map covers. */
export function isBuiltinTextColor(color: string): color is BuiltinTextColor {
  return color in COLOR_CLASS;
}

/** Display, truncation and word break, the axes Text and Heading share. */
function truncationClassName({
  display,
  maxLines,
  wordBreak,
  hasCapsize,
}: {
  display: TextDisplay;
  maxLines: number;
  wordBreak: WordBreak;
  hasCapsize: boolean;
}): string {
  return tw(
    // Truncation replaces the display classes: a clipped text is never inline,
    // and its overflow wrap comes from word break. A capsize text keeps the
    // clamp but drops the box, as it always has.
    maxLines === 1
      ? TRUNCATION_SINGLE_LINE_CLASS
      : maxLines > 1
        ? tw(
            TRUNCATION_CLAMP_CLASS,
            hasCapsize ? 'block' : TRUNCATION_CLAMP_BOX_CLASS,
          )
        : DISPLAY_CLASS[display],
    maxLines > 0 && WORD_BREAK_CLASS[wordBreak],
  );
}

export interface TextClassNameOptions {
  /** Type with custom (theme-defined) types already resolved to `body`. */
  type: BuiltinTextType;
  /** Color with custom colors already resolved to `primary`. */
  color: BuiltinTextColor;
  display: TextDisplay;
  justify: TextJustify;
  maxLines: number;
  wordBreak: WordBreak;
  size?: TextSize;
  weight?: TextWeight;
  textWrap?: TextWrap;
  hasCapsize?: boolean;
  hasStrikethrough?: boolean;
  hasTabularNumbers?: boolean;
}

/** Builds the class set of one Text element from its resolved props. */
export function textClassName({
  type,
  color,
  display,
  justify,
  maxLines,
  wordBreak,
  size,
  weight,
  textWrap,
  hasCapsize = false,
  hasStrikethrough = false,
  hasTabularNumbers = false,
}: TextClassNameOptions): string {
  return tw(
    COLOR_CLASS[color],
    size ? SIZE_CLASS[size] : TYPE_FONT_SIZE_CLASS[type],
    TYPE_LINE_HEIGHT_CLASS[type],
    weight ? WEIGHT_CLASS[weight] : DEFAULT_WEIGHT_CLASS[type],
    truncationClassName({display, maxLines, wordBreak, hasCapsize}),
    textWrap && TEXT_WRAP_CLASS[textWrap],
    justify !== 'start' && JUSTIFY_CLASS[justify],
    hasCapsize && CAPSIZE_CLASS,
    hasStrikethrough && STRIKETHROUGH_CLASS,
    hasTabularNumbers && TABULAR_NUMBERS_CLASS,
  );
}

export interface HeadingClassNameOptions {
  level: HeadingClassLevel;
  /** Display type; when set it replaces the level's type scale. */
  type?: 'display-1' | 'display-2' | 'display-3';
  /** Color with custom colors already resolved to `primary`. */
  color: BuiltinTextColor;
  display: TextDisplay;
  justify: TextJustify;
  maxLines: number;
  wordBreak: WordBreak;
  weight?: TextWeight;
  textWrap?: TextWrap;
  hasCapsize?: boolean;
  hasStrikethrough?: boolean;
}

/** Builds the class set of one Heading element from its resolved props. */
export function headingClassName({
  level,
  type,
  color,
  display,
  justify,
  maxLines,
  wordBreak,
  weight,
  textWrap,
  hasCapsize = false,
  hasStrikethrough = false,
}: HeadingClassNameOptions): string {
  return tw(
    COLOR_CLASS[color],
    type ? TYPE_FONT_SIZE_CLASS[type] : LEVEL_FONT_SIZE_CLASS[level],
    type ? TYPE_LINE_HEIGHT_CLASS[type] : LEVEL_LINE_HEIGHT_CLASS[level],
    weight
      ? WEIGHT_CLASS[weight]
      : type
        ? DEFAULT_WEIGHT_CLASS[type]
        : LEVEL_WEIGHT_CLASS[level],
    truncationClassName({display, maxLines, wordBreak, hasCapsize}),
    textWrap && TEXT_WRAP_CLASS[textWrap],
    justify !== 'start' && JUSTIFY_CLASS[justify],
    hasCapsize && CAPSIZE_CLASS,
    hasStrikethrough && STRIKETHROUGH_CLASS,
  );
}
