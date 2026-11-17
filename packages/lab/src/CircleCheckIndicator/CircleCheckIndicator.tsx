// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CircleCheckIndicator.tsx
 * @input Indicator state props and the circle's class map
 *   (circleCheckClasses.ts)
 * @output Exports CircleCheckIndicator, the iOS multiple-selection mark
 * @position Lab. A multiSelection-family indicator that a theme maps to
 *   `checkbox`
 *
 * SYNC: When modified, update CircleCheckIndicator.doc.mjs,
 *   CircleCheckIndicator.test.tsx, index.ts and the story.
 */

import * as stylex from '@stylexjs/stylex';
import type {IndicatorProps} from '@astryxdesign/core/Indicator';
import {isRenderable, mergeProps, themeProps} from '@astryxdesign/core/utils';
import {
  circleBarClassName,
  circleCheckmarkClassName,
  circleCheckPressProps,
  circleClassName,
} from './circleCheckClasses';

/**
 * The iOS multiple-selection mark. It shows an empty circle when unchecked
 * and a filled circle with a checkmark when checked. The partial state fills
 * the circle with a bar.
 *
 * Decorative and non-interactive, like every indicator: it renders
 * `aria-hidden` and owns no input, role, or focus behavior. Map it to
 * `checkbox` in a theme, and every CheckboxInput and CheckboxList draws it.
 * The owning control keeps its semantics and paints its focus ring on the
 * circle. Its colours fade over the theme duration on every pointer, and
 * change at once under Reduce Motion. It draws the circle everywhere, so
 * map it only in a theme meant for iOS.
 *
 * @example
 * ```
 * const theme = defineTheme({
 *   name: 'circle-checks',
 *   indicators: {checkbox: CircleCheckIndicator},
 * });
 * ```
 */
export function CircleCheckIndicator({
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
  const isFilled = isChecked || isIndeterminate;

  return (
    <span
      // `{...rest}` goes first, so a caller cannot un-hide this decorative
      // element (see IndicatorProps).
      {...rest}
      ref={ref}
      aria-hidden="true"
      {...mergeProps(
        themeProps('circle-check-indicator', {
          size,
          checked: isChecked
            ? 'checked'
            : isIndeterminate
              ? 'indeterminate'
              : null,
          disabled: isDisabled ? 'disabled' : null,
        }),
        // The press attribute goes with the classes: the host reads it to
        // leave its rounded-square press layer off over a circle.
        !isDisabled && circleCheckPressProps,
        stylex.props(xstyle),
        circleClassName({size, isFilled, isDisabled}),
        className,
        style,
      )}>
      {isRenderable(children) ? (
        children
      ) : (
        <>
          {/* The check's ink fills its box: the round caps reach the edges. */}
          <svg
            viewBox="0 0 10 10"
            {...mergeProps(themeProps('circle-check-indicator-check', {size}), {
              className: circleCheckmarkClassName({size, isVisible: isChecked}),
            })}>
            <path
              d="M0.75 5.25L3.75 9.25L9.25 0.75"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            {...mergeProps(themeProps('circle-check-indicator-dash', {size}), {
              className: circleBarClassName({size, isVisible: isIndeterminate}),
            })}
          />
        </>
      )}
    </span>
  );
}

CircleCheckIndicator.displayName = 'CircleCheckIndicator';
