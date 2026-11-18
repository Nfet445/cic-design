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

/** A consumer's override: a class, a style object, or a legacy StyleX value. */
export type AstryxXStyle = string | React.CSSProperties | StyleXStyles;

export type XStyleProps = {
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Classify an `xstyle` value into the two slots an element accepts.
 *
 * A StyleX value is still accepted while the package ships StyleX; that branch
 * goes away with the last `*.stylex` export, and the prop's type narrows to
 * `string | React.CSSProperties` in the same change.
 */
export function xstyleProps(xstyle?: AstryxXStyle): XStyleProps {
  if (xstyle == null) {
    return {};
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

/**
 * A StyleX value is marked by `$$css`; a style object is not. A dynamic
 * `stylex.create` entry arrives as a list whose first member carries `$$css`
 * and whose later members are the variable values it produced, so a list
 * counts as one when any member does.
 */
function isStyleXValue(value: unknown): value is StyleXStyles {
  if (Array.isArray(value)) {
    return value.some(isStyleXValue);
  }
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as {$$css?: unknown}).$$css === true
  );
}
