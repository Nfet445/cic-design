// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TopNavMegaMenuItem.tsx
 * @input Uses React, navItemStyles, TopNavRenderContext, and the Tailwind
 *   classes in topNavMegaMenuItemClasses.ts
 * @output Exports TopNavMegaMenuItem component and props
 * @position Individual item inside an TopNavMegaMenu — renders itself in both
 *   desktop (popover) and mobile drawer modes.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TopNav/TopNav.doc.mjs
 * - /packages/core/src/TopNav/index.ts
 * - /packages/core/src/TopNav/topNavMegaMenuItemClasses.ts
 * - /packages/cli/assets/templates/blocks/components/TopNav/ (showcase blocks)
 */

import React, {type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {navItemStyles} from '../NavItem/navItemStyles.stylex';
import {useLinkComponent} from '../Link/useLinkComponent';
import type {LinkComponentType} from '../Link/types';
import {useTopNavRenderMode} from './TopNavRenderContext';
import {mergeProps} from '../utils';
import type {BaseProps} from '../BaseProps';
import {useCloseMobileDrawerOnActivate} from '../AppShell/useCloseMobileDrawerOnActivate';
import {themeProps} from '../utils/themeProps';
import {focusOutlineFocusVisibleClassName} from '../utils/focusOutlineClasses';
import {interactionOverlayStyles} from '../utils/interactionOverlay.stylex';
import {usePressFeedback} from '../hooks/usePressFeedback';
import {isRenderable} from '../utils/isRenderable';
import {tw} from '../utils/tw';
import {
  topNavMegaMenuItemClassName,
  topNavMegaMenuItemContentClassName,
  topNavMegaMenuItemDescriptionClassName,
  topNavMegaMenuItemDrawerClassName,
  topNavMegaMenuItemDrawerContentClassName,
  topNavMegaMenuItemDrawerDescriptionClassName,
  topNavMegaMenuItemDrawerIconClassName,
  topNavMegaMenuItemIconClassName,
  topNavMegaMenuItemTitleClassName,
} from './topNavMegaMenuItemClasses';

// =============================================================================
// Types
// =============================================================================

export interface TopNavMegaMenuItemProps extends Omit<
  BaseProps<HTMLElement>,
  'onClick'
> {
  ref?: React.Ref<HTMLElement>;
  /** Display title for the menu item. */
  title: string;
  /** Optional description text displayed below the title. */
  description?: string;
  /** Optional icon element displayed to the left. */
  icon?: ReactNode;
  /** URL to navigate to when clicked. */
  href?: string;
  /** Callback when item is clicked. */
  onClick?: () => void;
  /**
   * Custom component to render instead of `<a>` for link items.
   * Overrides the provider-level default set by LinkProvider.
   */
  as?: LinkComponentType;
}

// =============================================================================
// Component
// =============================================================================

/**
 * An individual item inside an TopNavMegaMenu.
 *
 * Renders itself in both desktop (popover grid) and mobile drawer modes
 * using TopNavRenderContext to switch appearance.
 *
 * @example
 * ```
 * <TopNavMegaMenu
 *   label="Products"
 *   items={
 *     <>
 *       <TopNavMegaMenuItem
 *         title="Analytics"
 *         description="Track and analyze user behavior"
 *         icon={<ChartIcon />}
 *         href="/analytics"
 *       />
 *       <TopNavMegaMenuItem title="Reports" href="/reports" />
 *     </>
 *   }
 * />
 * ```
 */
export function TopNavMegaMenuItem({
  ref,
  title,
  description,
  icon,
  href,
  onClick,
  as,
  tabIndex,
  xstyle,
  className,
  style,
  ...restProps
}: TopNavMegaMenuItemProps) {
  const pressable = usePressFeedback();
  const renderMode = useTopNavRenderMode();
  const LinkComponent = useLinkComponent(as);
  const closeDrawerAfter = useCloseMobileDrawerOnActivate(
    renderMode === 'drawer',
  );

  // =========================================================================
  // Drawer mode — matches SideNavItem / TopNavMenu drawer appearance
  // =========================================================================
  if (renderMode === 'drawer') {
    const Element = href ? LinkComponent : 'button';
    const elementProps = Element === 'button' ? {type: 'button' as const} : {};
    const handleDrawerClick = closeDrawerAfter(() => {
      onClick?.();
    });
    return (
      <Element
        {...restProps}
        ref={ref}
        href={href}
        {...pressable}
        onClick={handleDrawerClick}
        tabIndex={tabIndex}
        {...elementProps}
        {...mergeProps(
          themeProps('top-nav-mega-menu-item', {mode: 'drawer'}),
          stylex.props(
            navItemStyles.item,
            interactionOverlayStyles.backgroundColor,
            xstyle,
          ),
          tw(
            topNavMegaMenuItemDrawerClassName(),
            className,
            focusOutlineFocusVisibleClassName,
          ),
          style,
        )}>
        {isRenderable(icon) && (
          <div className={topNavMegaMenuItemDrawerIconClassName()}>{icon}</div>
        )}
        <div className={topNavMegaMenuItemDrawerContentClassName()}>
          {title}
          {description && (
            <span className={topNavMegaMenuItemDrawerDescriptionClassName()}>
              {description}
            </span>
          )}
        </div>
      </Element>
    );
  }

  // =========================================================================
  // Default mode — desktop popover item with large icon + description
  // =========================================================================
  const Element = href ? LinkComponent : onClick ? 'button' : 'div';
  return (
    <Element
      {...restProps}
      ref={ref}
      type={Element === 'button' ? 'button' : undefined}
      href={href}
      {...pressable}
      onClick={onClick}
      tabIndex={tabIndex}
      {...mergeProps(
        themeProps('top-nav-mega-menu-item'),
        stylex.props(interactionOverlayStyles.backgroundColor, xstyle),
        tw(
          topNavMegaMenuItemClassName(),
          className,
          focusOutlineFocusVisibleClassName,
        ),
        style,
      )}>
      {isRenderable(icon) && (
        <div className={topNavMegaMenuItemIconClassName()}>{icon}</div>
      )}
      <div className={topNavMegaMenuItemContentClassName()}>
        <span className={topNavMegaMenuItemTitleClassName()}>{title}</span>
        {description && (
          <span className={topNavMegaMenuItemDescriptionClassName()}>
            {description}
          </span>
        )}
      </div>
    </Element>
  );
}

TopNavMegaMenuItem.displayName = 'TopNavMegaMenuItem';
