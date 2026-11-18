// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file RadioIndicator.tsx
 * @input Indicator state props
 * @output Exports RadioIndicator — the default radio selection visual
 * @position Decorative radio visual shared by RadioList, decorative menu
 *           markers, and any selection slot themed to use a radio
 */

import {isRenderable} from '../utils/isRenderable';
import {xstyleProps} from '../utils/xstyle';
import {mergeProps} from '../utils/mergeProps';
import {themeProps} from '../utils/themeProps';
import {radioCircleClassName, radioDotClassName} from './indicatorClasses';
import type {IndicatorProps} from './types';

/**
 * The default radio visual: a circle with a filled inner dot when selected.
 *
 * Decorative and non-interactive — it renders `aria-hidden` and owns no input,
 * role, or focus behavior. Themes replace it wholesale through
 * `defineTheme({indicators: {radio: MyRadio}})`, or restyle it through the
 * `radio-indicator` / `radio-indicator-dot` theme targets like any other
 * component.
 *
 * Unlike an icon, a radio draws in *both* states — an empty circle when
 * unchecked. That is what makes it usable as a selection indicator in
 * components whose default is "a checkmark when selected, nothing otherwise".
 *
 * @example
 * ```
 * <RadioIndicator state="checked" size="md" />
 * ```
 */
export function RadioIndicator({
  state,
  size = 'md',
  isDisabled = false,
  children,
  ref,
  className,
  style,
  xstyle,
  ...rest
}: IndicatorProps<'singleSelection'>) {
  // A radio has no partial state; anything other than unchecked reads as
  // selected.
  const isChecked = state !== 'unchecked';

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
          themeProps('radio-indicator', {
            size,
            checked: isChecked ? 'checked' : null,
            disabled: isDisabled ? 'disabled' : null,
          }),
          {
            className: radioCircleClassName({isChecked, isDisabled, size}),
          },
        ),
        xstyleProps(xstyle),
        className,
        style,
      )}>
      {isRenderable(children)
        ? children
        : isChecked && (
            <span
              {...mergeProps(themeProps('radio-indicator-dot', {size}), {
                className: radioDotClassName({size}),
              })}
            />
          )}
    </span>
  );
}

RadioIndicator.displayName = 'RadioIndicator';
