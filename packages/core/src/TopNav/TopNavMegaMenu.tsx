// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TopNavMegaMenu.tsx
 * @input Uses React, usePopover (Popover API + CSS anchor positioning), and
 *   the Tailwind classes in topNavMegaMenuClasses.ts
 * @output Exports TopNavMegaMenu component and related types
 * @position Navigation item with hover-triggered full-width mega menu for TopNav
 *
 * Uses usePopover to promote the panel to the top layer via the Popover API,
 * eliminating z-index stacking. CSS anchor positioning places the panel below
 * the nav wrapper.
 *
 * The default (desktop) trigger opens on hover and click. Hover opens are
 * transient; click/keyboard opens are pinned. A click shortly after hover-open
 * confirms and pins the panel instead of closing it. The panel remains an auto
 * popover for native dismissal and sibling exclusivity; `popoverTarget`
 * registers the trigger as its native invoker so the guard runs before any
 * dismiss.
 *
 * Supports three render modes via TopNavRenderContext:
 * - 'default': desktop popover mega menu (hover/click triggered)
 * - 'mobile-bar': returns null (hidden in compact mobile bar)
 * - 'drawer': drill-down navigation with back button
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TopNav/TopNav.doc.mjs
 * - /packages/core/src/TopNav/index.ts
 * - /packages/core/src/TopNav/TopNavMegaMenu.test.tsx
 * - /packages/core/src/TopNav/topNavMegaMenuClasses.ts
 * - /packages/cli/assets/templates/blocks/components/TopNav/ (showcase blocks)
 */

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {isRenderable} from '../utils/isRenderable';
import {usePopover} from '../Popover/usePopover';
import {useMenuHover} from '../hooks/useMenuHover';
import {Grid} from '../Grid/Grid';
import {Icon} from '../Icon';
import {mergeProps, composeEventHandlers} from '../utils';
import {xstyleProps} from '../utils/xstyle';
import type {BaseProps} from '../BaseProps';
import {navItemClassName} from '../NavItem/navItemClasses';
import {useTopNavSlot} from './TopNavContext';
import {useTopNavRenderMode} from './TopNavRenderContext';
import {themeProps} from '../utils/themeProps';
import {focusOutlineFocusVisibleClassName} from '../utils/focusOutlineClasses';
import {interactionOverlayStyles} from '../utils/interactionOverlay.stylex';
import {interactionOverlayBackgroundColorClassName} from '../utils/interactionOverlayClasses';
import {usePressFeedback} from '../hooks/usePressFeedback';

import {useMergedRefs} from '../hooks/useMergedRefs';
import {tw} from '../utils/tw';
import {
  topNavMegaMenuChevronClassName,
  topNavMegaMenuChevronOpenClassName,
  topNavMegaMenuDrawerChevronClassName,
  topNavMegaMenuDrawerChevronExpandedClassName,
  topNavMegaMenuDrawerFeaturedClassName,
  topNavMegaMenuDrawerHeaderClassName,
  topNavMegaMenuDrawerItemsClassName,
  topNavMegaMenuDrawerItemsInnerClassName,
  topNavMegaMenuDrawerSectionClassName,
  topNavMegaMenuFeaturedClassName,
  topNavMegaMenuItemsClassName,
  topNavMegaMenuPanelAnimationClassName,
  topNavMegaMenuPanelClassName,
  topNavMegaMenuPanelContentClassName,
  topNavMegaMenuPanelViewportFitClassName,
  topNavMegaMenuTriggerClassName,
  topNavMegaMenuTriggerOpenClassName,
} from './topNavMegaMenuClasses';
// =============================================================================
// Types
// =============================================================================

export interface TopNavMegaMenuProps extends BaseProps<HTMLButtonElement> {
  ref?: React.Ref<HTMLButtonElement>;
  /** The visible label for the nav item trigger. */
  label: string;
  /**
   * Menu items slot — typically one or more TopNavMegaMenuItem components,
   * but accepts any ReactNode for custom layouts.
   */
  items?: ReactNode;
  /**
   * Featured content slot — rendered in the right panel on desktop,
   * and below the items in the mobile drawer.
   */
  featured?: ReactNode;
  /** Delay before showing the menu on hover (ms). @default 150 */
  delay?: number;
  /** Delay before hiding the menu after mouse leaves (ms). @default 250 */
  hideDelay?: number;
  /**
   * Callback fired when the mega menu opens or closes.
   * Useful for coordinating wrapper styles (e.g. hiding other shadows).
   */
  onOpenChange?: (isOpen: boolean) => void;
}

// =============================================================================
// TopNavMegaMenu
// =============================================================================

/**
 * A navigation item that displays a full-width mega menu on hover.
 *
 * Uses a composed children API with sub-components:
 * - `items` — ReactNode slot, typically TopNavMegaMenuItem components
 * - `featured` — ReactNode slot for the right-panel / drawer featured card
 *
 * Supports three render modes via TopNavRenderContext:
 * - `'default'`: desktop popover with hover/click trigger
 * - `'mobile-bar'`: hidden (returns null)
 * - `'drawer'`: inline collapsible matching TopNavMenu pattern
 *
 * @example
 * ```
 * <TopNav
 *   startContent={
 *     <TopNavMegaMenu
 *       label="Products"
 *       items={
 *         <>
 *           <TopNavMegaMenuItem
 *             title="Analytics"
 *             description="Track behavior"
 *             icon={<ChartIcon />}
 *             href="/analytics"
 *           />
 *           <TopNavMegaMenuItem
 *             title="Messaging"
 *             description="Real-time comms"
 *             icon={<ChatIcon />}
 *             href="/messaging"
 *           />
 *         </>
 *       }
 *       featured={
 *         <>
 *           <strong>New: AI Features</strong>
 *           <p>Explore our latest AI-powered tools.</p>
 *         </>
 *       }
 *     />
 *   }
 * />
 * ```
 */
export function TopNavMegaMenu({
  ref,
  label,
  items,
  featured,
  delay = 150,
  hideDelay = 250,
  onOpenChange,
  ...rest
}: TopNavMegaMenuProps) {
  const renderMode = useTopNavRenderMode();

  // =========================================================================
  // Mobile-bar mode — hidden
  // =========================================================================
  if (renderMode === 'mobile-bar') {
    return null;
  }

  // =========================================================================
  // Drawer mode — inline collapsible
  // =========================================================================
  if (renderMode === 'drawer') {
    return (
      <DrawerMegaMenu
        ref={ref}
        label={label}
        items={items}
        featured={featured}
        {...rest}
      />
    );
  }

  // =========================================================================
  // Default mode — desktop popover
  // =========================================================================
  return (
    <DefaultMegaMenu
      ref={ref}
      label={label}
      items={items}
      featured={featured}
      delay={delay}
      hideDelay={hideDelay}
      onOpenChange={onOpenChange}
      {...rest}
    />
  );
}

TopNavMegaMenu.displayName = 'TopNavMegaMenu';

// =============================================================================
// DefaultMegaMenu — desktop popover mode
// =============================================================================

/** The panel is a grid of links, not `role="menuitem"` rows. */
const PANEL_ITEM_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function DefaultMegaMenu({
  ref,
  label,
  items,
  featured,
  delay = 150,
  hideDelay = 250,
  onOpenChange,
  xstyle,
  className,
  style,
  onClick: onClickProp,
  onMouseEnter: onMouseEnterProp,
  onMouseLeave: onMouseLeaveProp,
  ...rest
}: TopNavMegaMenuProps) {
  const slot = useTopNavSlot();
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);

  const handlePopoverShow = useCallback(() => {
    onOpenChange?.(true);
  }, [onOpenChange]);

  const handlePopoverHide = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  const popover = usePopover({
    // role: 'none' — the panel exposes its own role="group" labeled by
    // `label`. Pointer/hover opens keep focus on the trigger; keyboard and
    // assistive-tech opens move focus into the panel (a labeled group you exit
    // with Escape or by tabbing out). Either way role="dialog"
    // aria-modal="true" would be wrong: it announces an unnamed modal dialog
    // around a grid of links (and, when focus stays on the trigger, marks the
    // focused control inert).
    role: 'none',
    // hasSurface: false — mega menu provides its own surface (panelContainer)
    // with border-top and custom overflow. The entrance is applied through
    // the render() call's className, not the hook options.
    hasSurface: false,
    // Keep native outside-click/Escape dismissal and sibling exclusivity.
    // The trigger's popoverTarget association prevents its activation from
    // being treated as an ordinary outside interaction.
    hasLightDismiss: true,
    onShow: handlePopoverShow,
    onHide: handlePopoverHide,
  });

  // Set the CSS anchor to the parent <nav> element (the TopNav).
  useEffect(() => {
    const nav = triggerButtonRef.current?.closest('nav');
    if (nav) {
      popover.triggerRef(nav);
    }
    return () => {
      popover.triggerRef(null);
    };
  }, [popover]);

  const {
    triggerProps: hoverTriggerProps,
    contentProps,
    menuRef,
    setTriggerEl,
  } = useMenuHover<HTMLDivElement>({
    show: popover.show,
    hide: popover.hide,
    isOpen: popover.isOpen,
    isEnabled: true,
    showDelay: delay,
    hideDelay,
    itemSelector: PANEL_ITEM_SELECTOR,
    // Trigger sits outside an auto popover; the invoker relationship exempts it
    // from light dismiss.
    popoverId: popover.id,
  });

  return (
    <>
      <button
        ref={useMergedRefs(triggerButtonRef, setTriggerEl, ref)}
        type="button"
        {...rest}
        {...popover.triggerProps}
        {...hoverTriggerProps}
        onClick={composeEventHandlers(onClickProp, hoverTriggerProps.onClick)}
        onMouseEnter={composeEventHandlers(
          onMouseEnterProp,
          hoverTriggerProps.onMouseEnter,
        )}
        onMouseLeave={composeEventHandlers(
          onMouseLeaveProp,
          hoverTriggerProps.onMouseLeave,
        )}
        {...mergeProps(
          themeProps('top-nav-mega-menu'),
          xstyleProps(xstyle),
          tw(
            topNavMegaMenuTriggerClassName(),
            popover.isOpen && topNavMegaMenuTriggerOpenClassName(),
            className,
            focusOutlineFocusVisibleClassName,
          ),
          style,
        )}>
        {label}
        <Icon
          icon="chevronDown"
          size="sm"
          color="inherit"
          className={tw(
            topNavMegaMenuChevronClassName(),
            popover.isOpen && topNavMegaMenuChevronOpenClassName(),
          )}
        />
      </button>
      {popover.render(
        <div
          // role="group" — a mega menu is a browsing grid of links, not an
          // ARIA menu of menuitems (per the WAI-ARIA APG, the menu role is
          // for action menus; link mega menus are the documented anti-case).
          ref={menuRef}
          role="group"
          aria-label={label}
          {...contentProps}
          className={topNavMegaMenuPanelClassName()}>
          <div className={topNavMegaMenuPanelContentClassName()}>
            {/* Menu items section */}
            {isRenderable(items) && (
              <Grid
                columns={2}
                gap={2}
                className={topNavMegaMenuItemsClassName()}>
                {items}
              </Grid>
            )}

            {/* Featured section */}
            {isRenderable(featured) && (
              <div className={topNavMegaMenuFeaturedClassName()}>
                {featured}
              </div>
            )}
          </div>
        </div>,
        {
          placement: 'below',
          alignment: slot,
          className: tw(
            topNavMegaMenuPanelAnimationClassName(),
            topNavMegaMenuPanelViewportFitClassName(),
          ),
        },
      )}
    </>
  );
}

// =============================================================================
// DrawerMegaMenu — mobile drawer inline collapsible mode
// =============================================================================

function DrawerMegaMenu({
  ref,
  label,
  items,
  featured,
  xstyle,
  className,
  style,
  onClick: onClickProp,
  ...rest
}: Pick<TopNavMegaMenuProps, 'ref' | 'label' | 'items' | 'featured'> &
  BaseProps<HTMLButtonElement>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const pressable = usePressFeedback();
  const menuId = `mega-menu-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={topNavMegaMenuDrawerSectionClassName()}>
      {/* Header toggle — same pattern as TopNavMenu drawer */}
      <button
        ref={ref}
        type="button"
        {...rest}
        onClick={composeEventHandlers(onClickProp, () =>
          setIsExpanded(v => !v),
        )}
        aria-expanded={isExpanded}
        aria-controls={`${menuId}-items`}
        {...pressable}
        {...mergeProps(
          themeProps('top-nav-mega-menu', {mode: 'drawer'}),
          stylex.props(
            // The strength and the release; the colour is a class below.
            interactionOverlayStyles.pressedAlpha,
          ),
          tw(
            navItemClassName(),
            topNavMegaMenuDrawerHeaderClassName(),
            className,
            interactionOverlayBackgroundColorClassName,
            focusOutlineFocusVisibleClassName,
            xstyleProps(xstyle).className,
          ),
          {...xstyleProps(xstyle).style, ...style},
        )}>
        {label}
        <Icon
          icon="chevronDown"
          size="sm"
          color="inherit"
          className={tw(
            topNavMegaMenuDrawerChevronClassName(),
            isExpanded && topNavMegaMenuDrawerChevronExpandedClassName(),
          )}
        />
      </button>

      {/* Animated expand/collapse container */}
      <div
        id={`${menuId}-items`}
        aria-hidden={!isExpanded}
        inert={!isExpanded ? true : undefined}
        className={topNavMegaMenuDrawerItemsClassName()}>
        <div className={topNavMegaMenuDrawerItemsInnerClassName()}>
          {/* Items render themselves in drawer mode via TopNavRenderContext */}
          {items}

          {/* Featured card */}
          {isRenderable(featured) && (
            <div className={topNavMegaMenuDrawerFeaturedClassName()}>
              {featured}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
