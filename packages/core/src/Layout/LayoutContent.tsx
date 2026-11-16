// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file LayoutContent.tsx
 * @input Uses React, StyleX padding styles, layout class map, LayoutSlotsContext, useScrollRegionProps
 * @output Exports LayoutContent component and LayoutContentProps
 * @position Scrollable main content area for Layout. Wraps the primary body content
 *   with automatic scroll containment and context-aware padding.
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
import {layoutContentClassName} from './layoutClasses';
import {LayoutSlotsContext} from './LayoutSlotsContext';
import {useMergedRefs} from '../hooks/useMergedRefs';
import {useScrollRegionProps} from '../hooks/useScrollRegionProps';
import {mergeProps} from '../utils/mergeProps';
import type {SpacingStep} from '../utils/types';
import {themeProps} from '../utils/themeProps';
import {
  paddingStyles,
  containerPaddingInlineVarStyles,
  containerPaddingBlockStartVarStyles,
  containerPaddingBlockEndVarStyles,
} from './padding.stylex';

export interface LayoutContentProps extends BaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Content to render inside the content area.
   */
  children?: ReactNode;

  /**
   * Internal padding of the content area using the spacing scale.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   * Overrides the default padding from the layout container.
   */
  padding?: SpacingStep;

  /**
   * Enables scrollable overflow for the content area.
   * Set to false for auto-height layouts where sticky positioning
   * needs to work with parent containers.
   * @default true
   */
  isScrollable?: boolean;

  /**
   * Accessible label for the landmark.
   * Required when role is set and multiple landmarks of the same type exist.
   * While the content scrolls, it also names the scrolling region, which
   * otherwise takes a translated "Content".
   */
  label?: string;

  /**
   * ARIA landmark role for accessibility.
   * Use 'main' only for the primary content area of the page (not in nested layouts).
   */
  role?: AriaRole;
}

/**
 * Scrollable main content area for Layout. Wraps the primary body content
 * with automatic scroll containment and context-aware padding.
 *
 * Already provides its own padding and scroll — don't add padding or overflow
 * to children. Use `padding={0}` if you need edge-to-edge content.
 *
 * @example
 * ```
 * <Card>
 *   <Layout
 *     header={<LayoutHeader>Title</LayoutHeader>}
 *     content={<LayoutContent>Main body content</LayoutContent>}
 *   />
 * </Card>
 * <Card>
 *   <Layout
 *     content={
 *       <LayoutContent padding={0}>
 *         <Table />
 *       </LayoutContent>
 *     }
 *   />
 * </Card>
 * <Card>
 *   <Layout
 *     content={
 *       <LayoutContent isScrollable={false}>
 *         <StickyElement />
 *       </LayoutContent>
 *     }
 *   />
 * </Card>
 * ```
 */
export function LayoutContent({
  children,
  isScrollable = true,
  padding,
  label,
  role,
  xstyle,
  className,
  style,
  ref,
  ...props
}: LayoutContentProps) {
  const {hasHeader, hasFooter, hasStart, hasEnd} = use(LayoutSlotsContext);

  const isZeroPadding = padding === 0;
  const region = useScrollRegionProps({isScrollable, role, label});
  const mergedRef = useMergedRefs(ref, region.ref);

  return (
    <div
      ref={mergedRef}
      role={region.role}
      aria-label={region['aria-label']}
      {...mergeProps(
        mergeProps(themeProps('layout-content'), {
          className: layoutContentClassName({
            hasFooter,
            hasHeader,
            hasStart,
            hasEnd,
            isScrollable,
            isZeroPadding,
          }),
        }),
        stylex.props(
          padding != null && paddingStyles[padding],
          padding != null && containerPaddingInlineVarStyles[padding],
          padding != null && containerPaddingBlockStartVarStyles[padding],
          padding != null && containerPaddingBlockEndVarStyles[padding],
          xstyle,
        ),
        className,
        style,
      )}
      {...props}>
      {children}
    </div>
  );
}

LayoutContent.displayName = 'LayoutContent';
