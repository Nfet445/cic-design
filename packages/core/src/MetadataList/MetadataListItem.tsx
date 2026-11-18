// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file MetadataListItem.tsx
 * @input Uses React, ReactNode, StyleXStyles, theme tokens, MetadataListContext
 * @output Exports MetadataListItem component, MetadataListItemProps type
 * @position Core implementation; consumed by MetadataList, index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/MetadataList/MetadataList.doc.mjs
 * - /packages/core/src/MetadataList/MetadataListItem.doc.mjs
 * - /packages/core/src/MetadataList/MetadataList.test.tsx
 * - /packages/core/src/MetadataList/MetadataListItem.test.tsx
 * - /packages/core/src/MetadataList/index.ts
 * - /apps/storybook/stories/MetadataList.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/MetadataList/ (showcase blocks)
 */

import {use, type ReactNode} from 'react';
import {MetadataListContext} from './MetadataListContext';
import type {BaseProps} from '../BaseProps';
import {mergeProps} from '../utils';
import {isRenderable} from '../utils/isRenderable';
import {themeProps} from '../utils/themeProps';
import {tw} from '../utils/tw';
import {xstyleProps} from '../utils/xstyle';
import {
  metadataListItemIconClassName,
  metadataListItemLabelClassName,
  metadataListItemStackedClassName,
  metadataListItemStackedLabelClassName,
  metadataListItemStackedValueClassName,
  metadataListItemValueClassName,
} from './metadataListItemClasses';

// =============================================================================
// Types
// =============================================================================

export interface MetadataListItemProps extends BaseProps<HTMLDivElement> {
  /**
   * Ref forwarded to the item element: the label `dt` side by side, or the
   * stacked wrapper.
   */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Content value for this metadata item.
   */
  children: ReactNode;
  /**
   * Icon rendered before the label text.
   */
  icon?: ReactNode;
  /**
   * Label text for this metadata item.
   */
  label: string;
  /**
   * Test ID for testing frameworks.
   */
  'data-testid'?: string;
}

// =============================================================================
// Styles
// =============================================================================

// =============================================================================
// Component
// =============================================================================

/**
 * A single labeled metadata value within a MetadataList.
 *
 * Renders a `<dt>` / `<dd>` pair. Layout (side-by-side or stacked) is
 * determined by the parent MetadataList's label configuration.
 *
 * @example
 * ```
 * <MetadataListItem label="Status">Active</MetadataListItem>
 * <MetadataListItem label="Created" icon={<CalendarIcon />}>
 *   January 1, 2023
 * </MetadataListItem>
 * ```
 */
export function MetadataListItem({
  children,
  icon,
  label,
  xstyle,
  className,
  style,
  'data-testid': testId,
  ref,
  ...rest
}: MetadataListItemProps) {
  const ctx = use(MetadataListContext);
  const labelPosition = ctx?.labelConfig.position ?? 'start';
  const isStacked =
    labelPosition === 'top' || ctx?.orientation === 'horizontal';

  const labelContent = (
    <>
      {isRenderable(icon) && (
        <span className={metadataListItemIconClassName}>{icon}</span>
      )}
      {label}
    </>
  );

  // Stacked layout: label above content, wrapped in a div
  if (isStacked) {
    return (
      <div
        ref={ref}
        data-testid={testId}
        {...mergeProps(
          themeProps('metadata-list-item'),
          {
            className: tw(
              metadataListItemStackedClassName,
              xstyleProps(xstyle).className,
            ),
          },
          className,
          style,
        )}
        {...rest}>
        <dt className={metadataListItemStackedLabelClassName}>
          {labelContent}
        </dt>
        <dd className={metadataListItemStackedValueClassName}>{children}</dd>
      </div>
    );
  }

  // Inline layout: dt and dd are direct grid children
  return (
    <>
      <dt
        ref={ref}
        data-testid={testId ? `${testId}-label` : undefined}
        {...mergeProps(
          themeProps('metadata-list-item'),
          {
            className: tw(
              metadataListItemLabelClassName,
              xstyleProps(xstyle).className,
            ),
          },
          className,
          style,
        )}
        {...rest}>
        {labelContent}
      </dt>
      <dd
        data-testid={testId ? `${testId}-value` : undefined}
        className={metadataListItemValueClassName}>
        {children}
      </dd>
    </>
  );
}

MetadataListItem.displayName = 'MetadataListItem';
