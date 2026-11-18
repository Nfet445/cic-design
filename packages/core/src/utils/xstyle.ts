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
import type {CompiledStyles, StyleXStyles} from '@stylexjs/stylex';

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
  return resolveXstyle(xstyle);
}

export function composeXstyle(
  styles: ReadonlyArray<
    CompiledStyles | StyleXStyles | false | null | undefined
  >,
  xstyle?: AstryxXStyle,
): XStyleProps {
  return mergeXStyleList([...styles, xstyle]);
}

function resolveXstyle(xstyle?: AstryxXStyle | CompiledStyles): XStyleProps {
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

function mergeXStyleList(
  values: ReadonlyArray<
    AstryxXStyle | CompiledStyles | false | null | undefined
  >,
): XStyleProps {
  // Every StyleX value in the list resolves in ONE `stylex.props` call: two
  // separate calls would hand back two classes of equal specificity, and the
  // sheet's order would then decide which one wins instead of the list's.
  const styleXValues: StyleXStyles[] = [];
  const parts: {className?: string; style?: React.CSSProperties}[] = [];
  let firstStyleXIndex = -1;
  function collect(
    value: AstryxXStyle | CompiledStyles | false | null | undefined,
  ): void {
    if (value == null || value === false) {
      return;
    }
    // A dynamic StyleX value compiles to `[classSheet, inlineStyles]`, and its
    // second member carries no `$$css`, so it classifies before the list
    // branch or its inline half would read as a consumer style.
    if (typeof value !== 'string' && isCompiledStyleXValue(value)) {
      if (firstStyleXIndex < 0) {
        firstStyleXIndex = parts.length;
      }
      styleXValues.push(value);
      parts.push({});
      return;
    }
    if (Array.isArray(value)) {
      for (const entry of value) {
        collect(entry);
      }
      return;
    }
    parts.push(resolveXstyle(value));
  }
  for (const value of values) {
    collect(value);
  }
  if (styleXValues.length > 0) {
    // The resolved classes take the place of the list's first StyleX entry, so
    // a class written after it still comes after it in the output. The inline
    // halves merge one value at a time, skipping `undefined`: a dynamic StyleX
    // value that resolves to `undefined` states nothing, while resolving the
    // list in one call lets it erase the value an earlier entry set.
    const resolved = stylex.props(...styleXValues);
    // Each value keeps its own place in the list, so an inline object written
    // between two StyleX values still wins over the first and loses to the
    // second. Only the classes resolve together, at the first entry's index.
    let index = firstStyleXIndex;
    for (const value of styleXValues) {
      let style: React.CSSProperties | undefined = resolved.style;
      for (const inline of inlineStylesOf(value)) {
        for (const [key, entry] of Object.entries(inline)) {
          // A dynamic value that resolves to `undefined` states nothing, so it
          // must not erase what an earlier entry set.
          if (entry !== undefined) {
            style = {...style, [key]: entry};
          }
        }
      }
      parts[index] = {
        style,
        className: index === firstStyleXIndex ? resolved.className : undefined,
      };
      index += 1;
    }
  }
  const classes: string[] = [];
  let style: React.CSSProperties | undefined;
  for (const part of parts) {
    if (part.className) {
      classes.push(part.className);
    }
    if (!part.style) {
      continue;
    }
    for (const [key, value] of Object.entries(part.style)) {
      // An explicit `undefined` clears the value an earlier entry set.
      style = {...style, [key]: value};
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
 * The inline style objects a compiled StyleX value carries beside its classes.
 */
function inlineStylesOf(value: unknown): React.CSSProperties[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const found: React.CSSProperties[] = [];
  for (const member of value) {
    if (
      typeof member === 'object' &&
      member !== null &&
      !Array.isArray(member) &&
      (member as {$$css?: unknown}).$$css !== true
    ) {
      found.push(member as React.CSSProperties);
    }
  }
  return found;
}

/**
 * A dynamic StyleX value: a compiled-class tuple with its inline half.
 */
function isCompiledStyleXValue(value: unknown): value is StyleXStyles {
  if (isStyleXValue(value)) {
    return true;
  }
  // A compiled dynamic value is `[classNameObject, atomObject, inlineStyles]`,
  // and the inline half carries no `$$css`, so the first member is the marker.
  return Array.isArray(value) && value.length > 0 && isStyleXValue(value[0]);
}

/**
 * A StyleX value is marked by `$$css`; a style object is not. A list counts
 * as StyleX only when every non-empty entry is a StyleX value. Mixed lists
 * need separate handling so consumer classes and styles are not passed to StyleX.
 */
export function isStyleXValue(value: unknown): value is StyleXStyles {
  if (Array.isArray(value)) {
    let hasStyleX = false;
    for (const member of value) {
      if (member == null || member === false) {
        continue;
      }
      if (!isStyleXValue(member)) {
        return false;
      }
      hasStyleX = true;
    }
    return hasStyleX;
  }
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as {$$css?: unknown}).$$css === true
  );
}
