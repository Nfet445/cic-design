// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TopNav.tsx
 * @input Uses React, ReactNode
 * @output Exports TopNav component and TopNavProps
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TopNav/TopNav.doc.mjs
 * - /packages/core/src/TopNav/TopNav.test.tsx
 * - /packages/core/src/TopNav/index.ts
 * - /apps/storybook/stories/TopNav.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/TopNav/ (showcase blocks)
 */

import type {ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import {mergeProps} from '../utils';
import {xstyleProps} from '../utils/xstyle';
import {tw} from '../utils/tw';
import {
  topNavCenterRegionClassName,
  topNavClassName,
  topNavDrawerDividerClassName,
  topNavDrawerItemsClassName,
  topNavEndContentClassName,
  topNavEndRegionClassName,
  topNavHeadingSlotClassName,
  topNavMobileBarClassName,
  topNavMobileEndClassName,
  topNavMobileHeadingClassName,
  topNavMobileHeadingTextClassName,
  topNavStartContentClassName,
  topNavStartRegionClassName,
} from './topNavClasses';
import {TopNavSlotContext} from './TopNavContext';
import {useTopNavRenderMode} from './TopNavRenderContext';
import {useTopNavMobileContent} from './TopNavMobileContentContext';
import {Divider} from '../Divider/Divider';
import {MobileNav} from '../MobileNav/MobileNav';
import {MobileNavToggle} from '../MobileNav/MobileNavToggle';
import {useAppShellMobile} from '../AppShell/AppShellMobileContext';
import {themeProps} from '../utils/themeProps';
import {
  registerEnglishFallback,
  useComponentTranslator,
} from '../i18n/useComponentTranslator';
import english from '../i18n/generated-english/TopNav/TopNav.generated';
import {isRenderable} from '../utils/isRenderable';

registerEnglishFallback(english);

export interface TopNavProps extends BaseProps<HTMLElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLElement>;
  /**
   * Heading slot content — typically TopNavHeading with logo and text.
   * Positioned at the left edge of the nav bar.
   */
  heading?: ReactNode;
  /**
   * Start content slot - typically navigation items or breadcrumbs.
   * Positioned after the title, left-aligned.
   */
  startContent?: ReactNode;
  /**
   * Alias for startContent. Prefer startContent when composing with other slots.
   *
   * This keeps the common React children pattern from silently dropping
   * navigation items. If both children and startContent are provided,
   * startContent takes precedence and children are ignored.
   */
  children?: ReactNode;
  /**
   * Center content slot - typically tabs, search bar, or primary navigation.
   * Positioned at the horizontal center of the nav bar.
   * When provided, the layout switches to three regions that keep the center
   * at the bar's middle while they fit one row; the bar wraps when they do not.
   */
  centerContent?: ReactNode;
  /**
   * End content slot - typically search, icons, user profile, utility menus.
   * Positioned at the right edge of the nav bar.
   */
  endContent?: ReactNode;
  /**
   * Accessible label for the navigation landmark.
   * Helps screen readers identify the navigation area.
   * @default 'Top navigation'
   */
  label?: string;
}

/**
 * Top navigation bar for application headers.
 *
 * Slot-based layout with `heading`, `startContent`, `centerContent`, and
 * `endContent`. `children` are accepted as an alias for `startContent`
 * so navigation items do not silently disappear when using the common
 * React children pattern. When `centerContent` is provided, the layout switches
 * to three regions that keep center content horizontally centered.
 *
 * @example
 * ```
 * <TopNav
 *   label="Main navigation"
 *   heading={<TopNavHeading heading="My App" />}
 *   startContent={<TopNavItem label="Home" href="/" isSelected />}
 *   endContent={<Button label="Search" variant="ghost" />}
 * />
 * ```
 */
export function TopNav({
  heading,
  startContent,
  children,
  centerContent,
  endContent,
  label: labelFromProps,
  xstyle,
  className,
  style,
  ref,
  ...props
}: TopNavProps) {
  const t = useComponentTranslator();
  const label = labelFromProps ?? t('@astryx.topNav.landmarkLabel');
  const renderMode = useTopNavRenderMode();
  const mobileContent = useTopNavMobileContent();
  const {hasAutoToggle} = useAppShellMobile();
  const resolvedStartContent = startContent ?? children;
  // The layout flags use the same test as the slots they gate.
  const hasCenterContent = isRenderable(centerContent);
  const hasStartContent = isRenderable(resolvedStartContent);
  const hasMobileContent = isRenderable(mobileContent);
  const hasCollapsibleContent = hasStartContent || hasCenterContent;
  // Show mobile toggle when there's ANY drawer content — own items OR SideNav via context
  const hasMobileDrawerContent = hasCollapsibleContent || hasMobileContent;

  // =========================================================================
  // Mobile bar mode — heading + endContent + toggle, hide nav items.
  // Falls through to default when there's no drawer content — no reason
  // to strip down the TopNav if there's nothing to put in the drawer.
  // =========================================================================
  if (renderMode === 'mobile-bar') {
    return (
      <nav
        ref={ref}
        role="navigation"
        aria-label={label}
        {...mergeProps(
          themeProps('top-nav', {mode: 'mobile-bar'}),
          xstyleProps(xstyle),
          tw(topNavMobileBarClassName(), className),
          style,
        )}
        {...props}>
        {isRenderable(heading) && (
          <div className={topNavMobileHeadingClassName()}>
            {typeof heading === 'string' || typeof heading === 'number' ? (
              <span className={topNavMobileHeadingTextClassName()}>
                {heading}
              </span>
            ) : (
              heading
            )}
          </div>
        )}
        <div className={topNavMobileEndClassName()}>
          {endContent}
          {hasMobileDrawerContent && hasAutoToggle && <MobileNavToggle />}
        </div>
      </nav>
    );
  }

  // =========================================================================
  // Drawer mode — render nav items vertically inside a MobileNav,
  // plus any additional content passed via context (e.g. SideNav items)
  // =========================================================================
  if (renderMode === 'drawer') {
    // Only render if there are collapsible items or extra content
    if (!hasCollapsibleContent && !hasMobileContent) {
      return null;
    }

    return (
      <MobileNav header={heading}>
        {hasCollapsibleContent && (
          <div className={topNavDrawerItemsClassName()}>
            {resolvedStartContent}
            {centerContent}
          </div>
        )}
        {hasCollapsibleContent && hasMobileContent && (
          <Divider className={topNavDrawerDividerClassName()} />
        )}
        {hasMobileContent && <div>{mobileContent}</div>}
      </MobileNav>
    );
  }

  // =========================================================================
  // Default mode — full top bar
  // =========================================================================

  return (
    <nav
      ref={ref}
      role="navigation"
      aria-label={label}
      {...mergeProps(
        themeProps('top-nav'),
        xstyleProps(xstyle),
        tw(topNavClassName(), className),
        style,
      )}
      {...props}>
      <div className={topNavStartRegionClassName()}>
        {isRenderable(heading) && (
          <div className={topNavHeadingSlotClassName()}>{heading}</div>
        )}
        {hasStartContent && (
          <TopNavSlotContext value="start">
            <div className={topNavStartContentClassName()}>
              {resolvedStartContent}
            </div>
          </TopNavSlotContext>
        )}
      </div>
      {hasCenterContent && (
        <TopNavSlotContext value="center">
          <div className={topNavCenterRegionClassName()}>{centerContent}</div>
        </TopNavSlotContext>
      )}
      {hasCenterContent ? (
        // eslint-disable-next-line @astryx/no-style-only-wrapper -- the region is a flex box with its own gap, which a context provider cannot carry; the rule reads StyleX objects, not class text.
        <div className={topNavEndRegionClassName()}>
          <TopNavSlotContext value="end">{endContent}</TopNavSlotContext>
        </div>
      ) : (
        isRenderable(endContent) && (
          // eslint-disable-next-line @astryx/no-style-only-wrapper -- the region is a flex box with its own gap, which a context provider cannot carry; the rule reads StyleX objects, not class text.
          <div className={topNavEndContentClassName()}>
            <TopNavSlotContext value="end">{endContent}</TopNavSlotContext>
          </div>
        )
      )}
    </nav>
  );
}

TopNav.displayName = 'TopNav';
