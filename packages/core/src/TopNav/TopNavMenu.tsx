// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TopNavMenu.tsx
 * @input Uses React, usePopover, useMenuHover, useListFocus, useTypeahead,
 *   TopNavItem tokens, and the shared navigation policy
 * @output Exports TopNavMenu component and related types
 * @position Navigation item with hover-triggered overflow menu for TopNav
 *
 * The menu's own surfaces are Tailwind utilities in topNavMenuClasses.ts.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TopNav/TopNav.doc.mjs
 * - /packages/core/src/TopNav/TopNavMenu.test.tsx
 * - /packages/core/src/TopNav/topNavMenuClasses.ts
 * - /packages/core/src/TopNav/index.ts
 * - /packages/cli/assets/templates/blocks/components/TopNav/ (showcase blocks)
 */

import React, {
  useCallback,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {usePopoverInternal} from '../Popover/usePopover';
import {useMenuHover} from '../hooks/useMenuHover';
import {useMenuPress} from '../hooks/useMenuPress';
import {pressOnItemsOnly} from '../hooks/menuPressOnItems';
import {useMenuOverflow} from '../DropdownMenu/useMenuOverflow';
import {
  dropdownMenuSubMenuTouchClassName,
  dropdownMenuSubMenuTouchPinchClassName,
} from '../DropdownMenu/dropdownMenuSubMenuClasses';
import {useListFocus} from '../hooks/useListFocus';
import {useTypeahead} from '../hooks/useTypeahead';
import {Icon} from '../Icon';
import {mergeProps, composeEventHandlers} from '../utils';
import {useMergedRefs} from '../hooks/useMergedRefs';
import type {BaseProps} from '../BaseProps';
import {navItemStyles} from '../NavItem/navItemStyles.stylex';
import {useTopNavSlot} from './TopNavContext';
import {useTopNavRenderMode} from './TopNavRenderContext';
import {useCloseMobileDrawerOnActivate} from '../AppShell/useCloseMobileDrawerOnActivate';
import {useLinkComponent} from '../Link/useLinkComponent';
import {isSafeUrl} from '../utils/safeUrl';
import {themeProps} from '../utils/themeProps';
import {focusOutlineProps} from '../utils/focusOutline.stylex';
import {focusOutlineFocusVisibleClassName} from '../utils/focusOutlineClasses';
import {interactionOverlayStyles} from '../utils/interactionOverlay.stylex';
import {usePressFeedback} from '../hooks/usePressFeedback';
import {spacingVars} from '../theme/tokens.stylex';
import {isRenderable} from '../utils/isRenderable';
import {tw} from '../utils/tw';
import {
  topNavMenuChevronClassName,
  topNavMenuChevronOpenClassName,
  topNavMenuContainerClassName,
  topNavMenuDrawerHeaderClassName,
  topNavMenuDrawerItemClassName,
  topNavMenuDrawerItemDescriptionClassName,
  topNavMenuDrawerItemIconClassName,
  topNavMenuDrawerItemTextClassName,
  topNavMenuDrawerItemsClassName,
  topNavMenuDrawerItemsInnerClassName,
  topNavMenuDrawerSectionClassName,
  topNavMenuItemClassName,
  topNavMenuItemContentClassName,
  topNavMenuItemDescriptionClassName,
  topNavMenuItemIconClassName,
  topNavMenuItemTitleClassName,
  topNavMenuTriggerClassName,
  topNavMenuTriggerOpenClassName,
} from './topNavMenuClasses';

// =============================================================================
// Types
// =============================================================================

/**
 * An item in the TopNav overflow menu.
 */
export interface TopNavMenuItemData {
  /**
   * Display title for the menu item.
   */
  title: string;

  /**
   * Optional description text displayed below the title.
   */
  description?: string;

  /**
   * Optional icon element displayed to the left.
   */
  icon?: ReactNode;

  /**
   * URL to navigate to when clicked.
   */
  href?: string;

  /**
   * Callback when item is clicked.
   */
  onClick?: () => void;
}

function getMenuItemKey(item: TopNavMenuItemData): string {
  return item.title;
}

export interface TopNavMenuProps extends BaseProps<HTMLButtonElement> {
  ref?: React.Ref<HTMLButtonElement>;
  /**
   * The visible label for the nav item trigger.
   */
  label: string;

  /**
   * Menu items to display in the hover popover.
   */
  items: TopNavMenuItemData[];

  /**
   * Delay before showing the menu on hover (ms).
   * @default 150
   */
  delay?: number;

  /**
   * Delay before hiding the menu after mouse leaves (ms).
   * @default 200
   */
  hideDelay?: number;
}

// =============================================================================
// TopNavMenu
// =============================================================================

/**
 * A navigation item that displays a hover-triggered overflow menu.
 *
 * Renders as a nav item in TopNav's startContent slot. On hover,
 * shows a popover with rich menu items containing an icon, title,
 * and optional description.
 *
 * @example
 * ```
 * <TopNav
 *   startContent={
 *     <>
 *       <TopNavItem label="Home" href="/" isSelected />
 *       <TopNavMenu
 *         label="Products"
 *         items={[
 *           {
 *             title: 'Analytics',
 *             description: 'Track and analyze user behavior',
 *             icon: <ChartBarIcon />,
 *             href: '/products/analytics',
 *           },
 *           {
 *             title: 'Messaging',
 *             description: 'Real-time communication tools',
 *             icon: <ChatBubbleIcon />,
 *             href: '/products/messaging',
 *           },
 *         ]}
 *       />
 *     </>
 *   }
 * />
 * ```
 */

export function TopNavMenu({
  ref,
  label,
  items,
  delay = 150,
  hideDelay = 200,
  xstyle,
  className,
  style,
  onClick: onClickProp,
  onMouseEnter: onMouseEnterProp,
  onMouseLeave: onMouseLeaveProp,
  ...rest
}: TopNavMenuProps) {
  const pressable = usePressFeedback();
  const renderMode = useTopNavRenderMode();
  const closeDrawerAfter = useCloseMobileDrawerOnActivate(
    renderMode === 'drawer',
  );
  const LinkComponent = useLinkComponent();
  const [drawerExpanded, setDrawerExpanded] = useState(false);
  const menuId = useId();

  const slot = useTopNavSlot();
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);

  const popover = usePopoverInternal({
    // The menu, not the layer, owns what a touch outside that pans does.
    ownsOutsidePan: true,
    // The popup's own role="menu" is the exposed semantics; a modal dialog
    // wrapper would announce an unnamed dialog around the menu and make the
    // trigger claim aria-haspopup="dialog" for menu content (see TabMenu).
    role: 'none',
  });

  const {triggerProps, contentProps, menuRef, setTriggerEl, close} =
    useMenuHover<HTMLDivElement>({
      show: popover.show,
      hide: popover.hide,
      isOpen: popover.isOpen,
      isEnabled: true,
      showDelay: delay,
      hideDelay,
      // Trigger sits outside an auto popover; the invoker relationship exempts
      // it from light dismiss.
      popoverId: popover.id,
    });

  const setTriggerRef = useMergedRefs<HTMLButtonElement>(
    triggerButtonRef,
    popover.triggerRef,
    setTriggerEl,
    ref,
  );

  // The desktop popup is a composite menu widget per the APG menu pattern:
  // a single roving tab stop with ArrowUp/ArrowDown traversal (wrapping),
  // Home/End, and first-character typeahead. The hook owns item tabindex —
  // items render tabIndex={-1} and exactly one is promoted to 0. The
  // composition mirrors NavHeadingMenu.
  const {listRef, handleKeyDown, handleFocus, focusItem} =
    useListFocus<HTMLDivElement>({
      itemSelector: '[role="menuitem"]',
      hasRovingTabIndex: true,
      // Not popover.hide: Escape must also restore focus to the trigger.
      onEscape: close,
    });

  // First-character typeahead over the menu items (menus-11).
  const getMenuItems = useCallback(
    (): HTMLElement[] =>
      listRef.current
        ? Array.from(
            listRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]'),
          )
        : [],
    [listRef],
  );
  const typeahead = useTypeahead({
    getItemLabels: () => getMenuItems().map(el => el.textContent),
    onMatch: focusItem,
    getCurrentIndex: () =>
      getMenuItems().findIndex(
        el =>
          el === document.activeElement || el.contains(document.activeElement),
      ),
  });

  // Extend useListFocus with Enter/Space activation. Items rendered without an
  // `href` are `<div role="menuitem">` elements, which have no native keyboard
  // activation — without this, Enter/Space on a focused onClick-only item does
  // nothing. Anchor items (with `href`) already activate on Enter natively.
  const menuKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const focused = document.activeElement as HTMLElement | null;
        if (focused?.getAttribute('role') === 'menuitem') {
          e.preventDefault();
          focused.click();
          return;
        }
      }
      if (typeahead.onKeyDown(e)) {
        e.preventDefault();
        return;
      }
      handleKeyDown(e);
    },
    [handleKeyDown, typeahead],
  );

  // Menu container carries both the hover hook's ref (for its open/close
  // focus management) and the list-focus ref (for roving tabindex/typeahead).
  const setMenuRef = useMergedRefs<HTMLDivElement>(menuRef, listRef);

  // A press that slides across the items acts on the item it lifts on, the
  // highlight following the pointer, as every menu does
  // (`family:action-groups` FR1-FR3); a mouse released outside closes it.
  const menuPress = useMenuPress({
    menuRef: listRef,
    itemSelector: '[role="menuitem"]',
    onDismiss: close,
  });
  const hasOverflow = useMenuOverflow(listRef, items.length, popover.isOpen);

  // Mobile bar: hide menus entirely
  if (renderMode === 'mobile-bar') {
    return null;
  }

  // Drawer mode: collapsible section
  if (renderMode === 'drawer') {
    return (
      <div className={topNavMenuDrawerSectionClassName()}>
        <button
          ref={ref}
          type="button"
          {...rest}
          onMouseEnter={onMouseEnterProp}
          onMouseLeave={onMouseLeaveProp}
          onClick={composeEventHandlers(onClickProp, () =>
            setDrawerExpanded(v => !v),
          )}
          aria-expanded={drawerExpanded}
          aria-controls={`${menuId}-items`}
          {...pressable}
          {...mergeProps(
            focusOutlineProps.focusVisible(
              navItemStyles.item,
              interactionOverlayStyles.backgroundColor,
              xstyle,
            ),
            tw(topNavMenuDrawerHeaderClassName(), className),
            style,
          )}>
          {label}
          <Icon
            icon="chevronDown"
            size="sm"
            color="inherit"
            className={tw(
              topNavMenuChevronClassName(),
              drawerExpanded && topNavMenuChevronOpenClassName(),
            )}
          />
        </button>
        <div
          id={`${menuId}-items`}
          aria-hidden={!drawerExpanded}
          inert={!drawerExpanded ? true : undefined}
          className={topNavMenuDrawerItemsClassName()}>
          <div className={topNavMenuDrawerItemsInnerClassName()}>
            {items.map(item => {
              const Element =
                item.href == null && item.onClick ? 'button' : LinkComponent;
              return (
                <Element
                  key={getMenuItemKey(item)}
                  type={Element === 'button' ? 'button' : undefined}
                  href={item.href}
                  {...pressable}
                  onClick={closeDrawerAfter((_e: React.MouseEvent) => {
                    item.onClick?.();
                  })}
                  {...mergeProps(
                    focusOutlineProps.focusVisible(
                      navItemStyles.item,
                      interactionOverlayStyles.backgroundColor,
                    ),
                    {className: topNavMenuDrawerItemClassName()},
                  )}>
                  {isRenderable(item.icon) && (
                    <span className={topNavMenuDrawerItemIconClassName()}>
                      {item.icon}
                    </span>
                  )}
                  <span className={topNavMenuDrawerItemTextClassName()}>
                    {item.title}
                    {item.description && (
                      <span
                        className={topNavMenuDrawerItemDescriptionClassName()}>
                        {item.description}
                      </span>
                    )}
                  </span>
                </Element>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Default: desktop popover
  return (
    <>
      <button
        ref={setTriggerRef}
        type="button"
        {...rest}
        {...popover.triggerProps}
        {...triggerProps}
        onClick={composeEventHandlers(onClickProp, triggerProps.onClick)}
        onMouseEnter={composeEventHandlers(
          onMouseEnterProp,
          triggerProps.onMouseEnter,
        )}
        onMouseLeave={composeEventHandlers(
          onMouseLeaveProp,
          triggerProps.onMouseLeave,
        )}
        {...mergeProps(
          themeProps('top-nav-menu'),
          focusOutlineProps.focusVisible(xstyle),
          tw(
            topNavMenuTriggerClassName(),
            topNavMenuTriggerOpenClassName(),
            className,
          ),
          style,
        )}>
        {label}
        <Icon
          icon="chevronDown"
          size="sm"
          color="inherit"
          className={tw(
            topNavMenuChevronClassName(),
            popover.isOpen && topNavMenuChevronOpenClassName(),
          )}
        />
      </button>
      {popover.render(
        <div
          ref={setMenuRef}
          role="menu"
          aria-label={label}
          {...contentProps}
          {...menuPress.menuProps}
          onPointerDown={pressOnItemsOnly(
            menuPress.menuProps.onPointerDown,
            '[role="menuitem"]',
          )}
          // After the contentProps spread so the full APG composition (roving
          // tabindex + typeahead + Enter/Space activation) replaces the hover
          // hook's basic arrow-key handler.
          onKeyDown={menuKeyDown}
          onFocus={handleFocus}
          {...mergeProps(
            tw(
              topNavMenuContainerClassName(),
              hasOverflow
                ? dropdownMenuSubMenuTouchClassName
                : dropdownMenuSubMenuTouchPinchClassName,
            ),
          )}>
          {items.map(item => {
            const Element = item.href ? 'a' : 'div';
            return (
              <Element
                key={getMenuItemKey(item)}
                role="menuitem"
                // Single tab stop: useListFocus owns the roving tabindex and
                // promotes exactly one item to 0.
                tabIndex={-1}
                href={
                  item.href != null && isSafeUrl(item.href)
                    ? item.href
                    : undefined
                }
                // A menu row is never a draggable link: a mouse press that
                // slides to another item would start a drag instead.
                draggable={item.href != null ? false : undefined}
                onClick={item.onClick}
                className={tw(
                  topNavMenuItemClassName(),
                  focusOutlineFocusVisibleClassName,
                )}>
                <div className={topNavMenuItemIconClassName()}>{item.icon}</div>
                <div className={topNavMenuItemContentClassName()}>
                  <span className={topNavMenuItemTitleClassName()}>
                    {item.title}
                  </span>
                  {item.description && (
                    <span className={topNavMenuItemDescriptionClassName()}>
                      {item.description}
                    </span>
                  )}
                </div>
              </Element>
            );
          })}
        </div>,
        {
          placement: 'below',
          alignment: slot,
          offset: spacingVars['--spacing-1'],
        },
      )}
    </>
  );
}

TopNavMenu.displayName = 'TopNavMenu';
