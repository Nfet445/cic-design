// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Divider.tsx
 * @input Uses React, the divider class map, and stylex for the consumer's
 *   `xstyle`
 * @output Exports Divider component and DividerProps
 * @position Divider component; provides visual separation with optional label
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Divider/Divider.doc.mjs
 * - /packages/core/src/Divider/Divider.test.tsx
 * - /apps/storybook/stories/Divider.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/Divider/ (showcase blocks)
 */

import {useId, type ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import * as stylex from '@stylexjs/stylex';

import {
  dividerClassName,
  dividerFullBleedClassName,
  dividerLabelClassName,
  dividerLineClassName,
  dividerLineVariantClassName,
  dividerVerticalLabelClassName,
} from './dividerClasses';
import {isRenderable} from '../utils/isRenderable';
import {mergeProps} from '../utils/mergeProps';
import {themeProps} from '../utils/themeProps';
import {tw} from '../utils/tw';
import type {DividerVariantMap} from './index';

/**
 * Divider variant type. Extensible via module augmentation of DividerVariantMap.
 */
export type DividerVariant = keyof DividerVariantMap;

export interface DividerProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Orientation of the divider.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Optional label to display centered on the divider.
   * Numeric zero is preserved; null, booleans, and empty strings render no label.
   * Rendered with small, secondary text styling.
   */
  label?: ReactNode;

  /**
   * Visual weight of the divider line.
   * - 'subtle': Uses --color-border (default)
   * - 'strong': Uses --color-border-emphasized
   * @default 'subtle'
   */
  variant?: DividerVariant;

  /**
   * Makes the divider escape its parent's container padding.
   * Uses negative margins to extend to the container edges.
   * @default false
   */
  isFullBleed?: boolean;
}

/**
 * Divider component for visual separation of content.
 *
 * Provides horizontal and vertical dividers with optional labels.
 * Uses Astryx design tokens for colors and spacing.
 *
 * @example
 * ```
 * <Divider label="or" />
 * ```
 */
export function Divider({
  orientation = 'horizontal',
  label,
  variant = 'subtle',
  isFullBleed = false,
  xstyle,
  className,
  style,
  ref,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: DividerProps) {
  const isHorizontal = orientation === 'horizontal';
  const hasLabel = isRenderable(label);
  const labelId = useId();
  const lineClassName = tw(
    dividerLineClassName[orientation],
    dividerLineVariantClassName[variant],
  );

  // A separator does not derive its accessible name from its content, so the
  // rendered label must be referenced explicitly via aria-labelledby to be
  // exposed as the separator's name (WCAG 1.3.1). An explicit aria-label or
  // aria-labelledby from the consumer takes precedence.
  const resolvedLabelledBy =
    ariaLabelledBy ?? (hasLabel && ariaLabel == null ? labelId : undefined);

  return (
    <div
      ref={ref}
      {...props}
      role="separator"
      aria-orientation={orientation}
      aria-label={ariaLabel}
      aria-labelledby={resolvedLabelledBy}
      {...mergeProps(
        mergeProps(themeProps('divider', {variant, orientation}), {
          className: tw(
            dividerClassName[orientation],
            isFullBleed && dividerFullBleedClassName[orientation],
            xstyle && stylex.props(xstyle).className,
          ),
        }),
        className,
        style,
      )}>
      <div className={lineClassName} />
      {hasLabel && (
        <div
          id={labelId}
          className={tw(
            dividerLabelClassName,
            !isHorizontal && dividerVerticalLabelClassName,
          )}>
          {label}
        </div>
      )}
      {hasLabel && <div className={lineClassName} />}
    </div>
  );
}

Divider.displayName = 'Divider';
