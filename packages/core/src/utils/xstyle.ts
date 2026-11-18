// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file xstyle.ts
 * @input a consumer's `xstyle` value
 * @output the `{className, style}` pair an element needs
 * @position Consumer override slot; every component reads it through
 *   `mergeProps(base, xstyleProps(xstyle), classes, style)`
 *
 * `xstyle` is the consumer's escape hatch: whatever it states must win over the
 * component's own paint. A class is the consumer's own CSS, which is unlayered
 * and therefore outranks every utility and every StyleX rule; a style object is
 * inline, which outranks both. The prop takes either shape, and this module is
 * the one place that decides which.
 *
 * ```tsx
 * <Button xstyle="my-app-button" />
 * <Button xstyle={{'--button-width': '12rem'}} />
 * ```
 */

import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';

/**
 * A consumer's override: a class, a style object, a legacy StyleX value, or a
 * list of those composed left to right.
 */
export type AstryxXStyle =
  | string
  | React.CSSProperties
  | StyleXStyles
  | ReadonlyArray<AstryxXStyle | false | null | undefined>;

export type XStyleProps = {
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Classify an `xstyle` value into the two slots an element accepts.
 *
 * A list is flattened left to right: classes join, style objects shallow-merge
 * so the later one wins, and every StyleX value in the list resolves together
 * in one call, because two resolutions of equal-specificity classes would be
 * decided by the sheet's order rather than by the list's. A component that
 * composes its own paint with the caller's value passes one list, and the
 * caller's entry sits last so it still wins.
 *
 * A StyleX value is still accepted while the package ships StyleX; that branch
 * goes away with the last `*.stylex` export, and the prop's type narrows to
 * `string | React.CSSProperties` in the same change.
 */
export function xstyleProps(xstyle?: AstryxXStyle): XStyleProps {
  if (xstyle == null) {
    return {};
  }
  if (Array.isArray(xstyle)) {
    return mergeXStyleList(xstyle);
  }
  if (typeof xstyle === 'string') {
    return xstyle.length > 0 ? {className: xstyle} : {};
  }
  const legacy = xstyle as StyleXStyles;
  if (isStyleXValue(legacy)) {
    return stylex.props(legacy);
  }
  return {style: xstyle as React.CSSProperties};
}

function mergeXStyleList(values: ReadonlyArray<AstryxXStyle>): XStyleProps {
  // Every StyleX value in the list resolves in ONE `stylex.props` call: two
  // separate calls would hand back two classes of equal specificity, and the
  // sheet's order would then decide which one wins instead of the list's.
  const styleXValues: StyleXStyles[] = [];
  const parts: {className?: string; style?: React.CSSProperties}[] = [];
  let firstStyleXIndex = -1;
  for (const value of values) {
    if (value == null || value === false) {
      continue;
    }
    if (typeof value !== 'string' && isStyleXValue(value)) {
      if (firstStyleXIndex < 0) {
        firstStyleXIndex = parts.length;
      }
      styleXValues.push(value);
      parts.push({});
      continue;
    }
    parts.push(xstyleProps(value));
  }
  if (styleXValues.length > 0) {
    // The resolved classes take the place of the list's first StyleX entry, so
    // a class written after it still comes after it in the output.
    const resolved = stylex.props(...styleXValues);
    parts[firstStyleXIndex] = {
      className: resolved.className,
      style: resolved.style,
    };
  }
  const classes: string[] = [];
  let style: React.CSSProperties | undefined;
  for (const part of parts) {
    if (part.className) {
      classes.push(part.className);
    }
    if (part.style) {
      style = {...style, ...part.style};
    }
  }
  const merged: XStyleProps = {};
  if (classes.length > 0) {
    merged.className = classes.join(' ');
  }
  if (style) {
    merged.style = style;
  }
  return merged;
}

/**
 * A StyleX value is marked by `$$css`; a style object is not. A dynamic
 * `stylex.create` entry arrives as a list whose first member carries `$$css`
 * and whose later members are the variable values it produced, so a list
 * counts as one when any member does.
 */
export function isStyleXValue(value: unknown): value is StyleXStyles {
  if (Array.isArray(value)) {
    // A loop, not `.some`: this runs on every row of every render, and a test
    // in List counts `Array.prototype.some` calls to prove one linear pass.
    for (const member of value) {
      if (isStyleXValue(member)) {
        return true;
      }
    }
    return false;
  }
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as {$$css?: unknown}).$$css === true
  );
}
