// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CheckboxIndicator.tsx
 * @input Indicator state props
 * @output Exports CheckboxIndicator — the default checkbox selection visual
 * @position Decorative checkbox visual shared by CheckboxInput, CheckboxList,
 *           and decorative menu markers
 */

import {isRenderable} from '../utils/isRenderable';
import {xstyleProps} from '../utils/xstyle';
import {mergeProps} from '../utils/mergeProps';
import {themeProps} from '../utils/themeProps';
import {
  checkboxBoxClassName,
  checkboxCheckmarkClassName,
  checkboxIndeterminateClassName,
} from './indicatorClasses';
import type {IndicatorProps} from './types';

/**
 * The default checkbox visual: a square box with a checkmark or an
 * indeterminate bar.
 *
 * Decorative and non-interactive — it renders `aria-hidden` and owns no input,
 * role, or focus behavior. The owning control keeps focus semantics and paints its
 * standard focus ring onto this indicator element (see CheckboxInput), so a
 * replacement's root radius determines the ring shape. Themes replace it
 * wholesale through `defineTheme({indicators: {checkbox: MyCheckbox}})`, or
 * restyle it through the canonical `checkbox-indicator` theme target.
 *
 * @example
 * ```
 * <CheckboxIndicator state="indeterminate" size="sm" />
 * ```
 */
export function CheckboxIndicator({
  state,
  size = 'md',
  isDisabled = false,
  children,
  ref,
  className,
  style,
  xstyle,
  ...rest
}: IndicatorProps<'multiSelection'>) {
  const isChecked = state === 'checked';
  const isIndeterminate = state === 'indeterminate';
  const isCheckedOrIndeterminate = isChecked || isIndeterminate;

  return (
    <span
      // `{...rest}` first, own contract after. TypeScript cannot reject a
      // hyphenated JSX attribute (see IndicatorProps), so attribute order is
      // what actually keeps a caller from un-hiding a decorative element —
      // rubric P3, "owned aria-* set after {...rest}".
      {...rest}
      ref={ref}
      aria-hidden="true"
      {...mergeProps(
        mergeProps(
          themeProps('checkbox-indicator', {
            size,
            checked: isChecked
              ? 'checked'
              : isIndeterminate
                ? 'indeterminate'
                : null,
            disabled: isDisabled ? 'disabled' : null,
          }),
          {
            className: checkboxBoxClassName({
              isChecked: isCheckedOrIndeterminate,
              isDisabled,
              size,
            }),
          },
        ),
        xstyleProps(xstyle),
        className,
        style,
      )}>
      {isRenderable(children) ? (
        children
      ) : (
        <>
          <svg
            viewBox="0 0 10 10"
            {...mergeProps(themeProps('checkbox-indicator-check', {size}), {
              className: checkboxCheckmarkClassName({
                isVisible: isChecked,
                size,
              }),
            })}>
            <path
              d="M8.5 2.5L4 7.5L1.5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            {...mergeProps(themeProps('checkbox-indicator-dash', {size}), {
              className: checkboxIndeterminateClassName({
                isVisible: isIndeterminate,
                size,
              }),
            })}
          />
        </>
      )}
    </span>
  );
}

CheckboxIndicator.displayName = 'CheckboxIndicator';
