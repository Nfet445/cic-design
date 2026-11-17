// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SideNavSection.tsx
 * @input Uses React, StyleX (xstyle only)
 * @output Exports SideNavSection component and SideNavSectionProps
 * @position Core implementation; used inside SideNav children
 *
 * Section grouping for navigation items with optional title and end content.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/SideNav/SideNav.doc.mjs
 * - /packages/core/src/SideNav/SideNav.test.tsx
 * - /packages/core/src/SideNav/index.ts
 * - /apps/storybook/stories/SideNav.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/SideNav/ (showcase blocks)
 */

import React, {useId, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {mergeProps} from '../utils';
import {tw} from '../utils/tw';
import {sideNavSectionClassName} from './sideNavSectionClasses';
import type {BaseProps} from '../BaseProps';
import {useSideNavCollapse} from './SideNavCollapseContext';
import {VisuallyHidden} from '../VisuallyHidden';
import {themeProps} from '../utils/themeProps';
import {isRenderable} from '../utils/isRenderable';
// =============================================================================
// Types
// =============================================================================

export interface SideNavSectionProps extends BaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Section title.
   */
  title: string;
  /**
   * Section subtitle.
   */
  subtitle?: string;
  /**
   * Section items.
   */
  children: ReactNode;
  /**
   * Right-side content in the section header.
   */
  endContent?: ReactNode;
  /**
   * Whether the section header is visually hidden.
   * The section title is still accessible to screen readers.
   * @default false
   */
  isHeaderHidden?: boolean;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Section grouping for SideNav items.
 *
 * Renders a labeled group of navigation items.
 * Uses `role="group"` with `aria-labelledby` for accessibility.
 *
 * @example
 * ```
 * <SideNavSection title="Main">
 *   <SideNavItem label="Dashboard" icon={HomeIcon} isSelected />
 *   <SideNavItem label="Projects" icon={FolderIcon} />
 * </SideNavSection>
 * ```
 */
export function SideNavSection({
  ref,
  title,
  subtitle,
  children,
  endContent,
  isHeaderHidden = false,
  xstyle,
  className,
  style,
  'data-testid': testId,
  ...rest
}: SideNavSectionProps) {
  const {isCollapsed} = useSideNavCollapse();
  const id = useId();
  const titleId = `${id}-title`;

  const headerContent = (
    <>
      <span className={sideNavSectionClassName.titleContainer}>
        <span id={titleId} className={sideNavSectionClassName.title}>
          {title}
        </span>
        {subtitle && (
          <span className={sideNavSectionClassName.subtitle}>{subtitle}</span>
        )}
      </span>
      {isRenderable(endContent) && (
        <span className={sideNavSectionClassName.endContent}>{endContent}</span>
      )}
    </>
  );

  const shouldHideHeader = isHeaderHidden || isCollapsed;

  return (
    <div
      ref={ref}
      {...mergeProps(
        themeProps('side-nav-section'),
        stylex.props(xstyle),
        tw(sideNavSectionClassName.root, className),
        style,
      )}
      {...rest}
      role="group"
      aria-labelledby={titleId}
      data-testid={testId}>
      {shouldHideHeader ? (
        <VisuallyHidden as="div">{headerContent}</VisuallyHidden>
      ) : (
        <div className={sideNavSectionClassName.header}>{headerContent}</div>
      )}
      <div className={sideNavSectionClassName.items}>{children}</div>
    </div>
  );
}

SideNavSection.displayName = 'SideNavSection';
