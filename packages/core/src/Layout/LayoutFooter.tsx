// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file LayoutFooter.tsx
 * @input Uses React, StyleX padding styles, layout class map
 * @output Exports LayoutFooter component and LayoutFooterProps
 * @position Bottom bar / footer area for Layout. Use for action bars,
 *   pagination, status bars, or any fixed-height content at the bottom of a layout.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Layout/Layout.doc.mjs
 * - /apps/storybook/stories/Layout.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/Layout/ (showcase blocks)
 */

import type {AriaRole, ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import {use} from 'react';
import * as stylex from '@stylexjs/stylex';
import {LayoutDividerContext} from './LayoutDividerContext';
import {
  layoutFooterDividerClassName,
  layoutFooterInnerClassName,
  layoutRegionHeightClassName,
} from './layoutClasses';
import type {LayoutInstanceStyle} from './layoutClasses';
import {mergeProps} from '../utils/mergeProps';
import {tw} from '../utils/tw';
import type {SizeValue, SpacingStep} from '../utils/types';
import {themeProps} from '../utils/themeProps';
import {containerPaddingByEdgeClassName} from './paddingClasses';

export interface LayoutFooterProps extends BaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Content to render inside the footer.
   */
  children?: ReactNode;

  /**
   * Adds a themed border at the top edge.
   * When false, spacing collapse is applied automatically for seamless visual flow.
   * When not set, falls back to the parent Layout's `defaultHasDividers`, then `false`.
   * @default false
   */
  hasDivider?: boolean;

  /**
   * Height of the footer.
   * Numbers are treated as pixels, strings are used as-is.
   */
  height?: SizeValue;

  /**
   * Internal padding of the footer using the spacing scale.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   * Overrides the default padding from the layout container.
   */
  padding?: SpacingStep;

  /**
   * Accessible label for the landmark.
   * Required when role is set and multiple landmarks of the same type exist.
   */
  label?: string;

  /**
   * ARIA landmark role for accessibility.
   * Use 'contentinfo' only for site-wide footers (not in nested layouts).
   */
  role?: AriaRole;
}

/**
 * Bottom bar / footer for Layout. Use for action bars, pagination, or status bars.
 * Renders in the footer slot with optional divider and padding control.
 *
 * Already provides its own padding — don't add padding to children.
 * Use `padding={0}` if your content manages its own padding.
 *
 * @example
 * ```
 * <Card>
 *   <Layout
 *     content={<LayoutContent>...</LayoutContent>}
 *     footer={<LayoutFooter hasDivider>Actions</LayoutFooter>}
 *   />
 * </Card>
 * ```
 */
export function LayoutFooter({
  children,
  hasDivider,
  height,
  label,
  padding,
  role,
  xstyle,
  className,
  style,
  ref,
  ...props
}: LayoutFooterProps) {
  const dividerCtx = use(LayoutDividerContext);
  const resolvedHasDivider =
    hasDivider ?? dividerCtx?.defaultHasDividers ?? false;
  // A region's own height is a value, not a variant: the class reads it from a
  // variable this element writes, so a consumer `xstyle` still overrides it.
  const sizingStyle: LayoutInstanceStyle | undefined =
    height != null
      ? {
          '--astryx-layout-region-height':
            typeof height === 'number' ? `${height}px` : height,
        }
      : undefined;

  return (
    <div
      ref={ref}
      role={role}
      aria-label={label}
      {...mergeProps(
        mergeProps(themeProps('layout-footer'), {
          className: tw(
            'shrink-0',
            height != null && layoutRegionHeightClassName,
            resolvedHasDivider && layoutFooterDividerClassName,
          ),
        }),
        stylex.props(xstyle),
        className,
        {...style, ...sizingStyle},
      )}
      {...props}
      data-divider={resolvedHasDivider || undefined}>
      <div
        className={tw(
          layoutFooterInnerClassName,
          padding != null &&
            containerPaddingByEdgeClassName({
              paddingBlockEnd: padding,
              paddingBlockStart: padding,
              paddingInlineEnd: padding,
              paddingInlineStart: padding,
            }),
        )}>
        {children}
      </div>
    </div>
  );
}

LayoutFooter.displayName = 'LayoutFooter';
