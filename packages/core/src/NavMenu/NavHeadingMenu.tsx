// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file NavHeadingMenu.tsx
 * @input Uses React, StyleX, useListFocus, NavMenuContext, and capture-phase cancellation tracking
 * @output Exports NavHeadingMenu component and NavHeadingMenuProps type
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update:
 * - /packages/core/src/NavMenu/index.ts
 */

import React, {use, useCallback, useMemo, useRef, type ReactNode} from 'react';
import {mergeProps} from '../utils';
import {xstyleProps} from '../utils/xstyle';
import type {BaseProps} from '../BaseProps';
import {useInternalListFocus} from '../hooks/useListFocus';
import {useMenuPress} from '../hooks/useMenuPress';
import {pressOnItemsOnly} from '../hooks/menuPressOnItems';
import {useMenuOverflow} from '../DropdownMenu/useMenuOverflow';
import {
  dropdownMenuSubMenuTouchClassName,
  dropdownMenuSubMenuTouchPinchClassName,
} from '../DropdownMenu/dropdownMenuSubMenuClasses';
import {composeEventHandlers} from '../utils/composeEventHandlers';
import {useTypeahead} from '../hooks/useTypeahead';
import {themeProps} from '../utils/themeProps';
import {
  NavHeadingDismissContext,
  NavHeadingMenuContext,
  useNavHeadingCloseContext,
  type NavHeadingMenuSize,
} from './NavMenuContext';

import {useMergedRefs} from '../hooks/useMergedRefs';
import {tw} from '../utils/tw';
import {
  navHeadingMenuClassName,
  navHeadingMenuMinWidthClassName,
  navHeadingMenuMinWidthVar,
} from './navHeadingMenuClasses';

/** The minimum width the caller states, read by the size class. */
type NavHeadingMenuStyle = React.CSSProperties &
  Partial<Record<typeof navHeadingMenuMinWidthVar, string>>;

/** The rows a press can act on. */
const ENABLED_ITEM_SELECTOR = '[role="menuitem"]:not([aria-disabled="true"])';

/** The rows a key or typeahead visits: a disabled row too, which stays inert. */
const ROW_SELECTOR = '[role="menuitem"]';

export interface NavHeadingMenuProps extends BaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  /** Menu items (NavHeadingMenuItem, dividers, custom content). */
  children: ReactNode;

  /**
   * Size — controls min-width and flows to items for padding.
   * @default 'md'
   */
  size?: NavHeadingMenuSize;

  /**
   * Minimum width override. Takes precedence over size-based defaults.
   */
  minWidth?: number | string;
}

/**
 * Accessible menu container for nav heading popovers.
 *
 * Provides `role="menu"` with arrow-key navigation (Home/End/Escape)
 * and a size context that flows to child items for consistent padding.
 * Pass as the `menu` prop of SideNavHeading or TopNavHeading.
 *
 * The parent heading component injects the close callback via context,
 * so items automatically dismiss the popover on selection.
 *
 * @example
 * ```
 * <SideNavHeading
 *   heading="Products"
 *   menu={
 *     <NavHeadingMenu size="lg">
 *       <NavHeadingMenuItem label="Dashboard" href="/dashboard" />
 *       <NavHeadingMenuItem label="Analytics" href="/analytics" />
 *     </NavHeadingMenu>
 *   }
 * />
 * ```
 */
export function NavHeadingMenu({
  ref,
  children,
  size = 'md',
  minWidth,
  xstyle,
  className,
  style: styleProp,
  'data-testid': testId,
  onKeyDown: onKeyDownProp,
  onKeyDownCapture: onKeyDownCaptureProp,
  onPointerDown: onPointerDownProp,
  ...rest
}: NavHeadingMenuProps) {
  const closeCtx = useNavHeadingCloseContext();
  const closeMenu = closeCtx?.closeMenu;
  // A heading whose menu items do not close it on selection (an expanded
  // SideNavHeading) still lets a mouse released outside dismiss it.
  const dismissMenu = use(NavHeadingDismissContext)?.dismiss;

  const {listRef, handleKeyDown, focusItem} = useInternalListFocus({
    itemSelector: ROW_SELECTOR,
    reachesDisabledItems: true,
    onEscape: closeMenu,
  });

  // A press that slides across the rows acts on the row it lifts on, the
  // highlight following the pointer, as every menu does
  // (`family:action-groups` FR1-FR3); a mouse released outside closes it.
  const menuPress = useMenuPress({
    menuRef: listRef,
    itemSelector: ENABLED_ITEM_SELECTOR,
    onDismiss: closeMenu ?? dismissMenu,
  });
  const hasOverflow = useMenuOverflow(listRef, children, true);

  // First-character typeahead over the menu items, disabled ones included.
  const getMenuItems = useCallback(
    (): HTMLElement[] =>
      listRef.current
        ? Array.from(
            listRef.current.querySelectorAll<HTMLElement>(ROW_SELECTOR),
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
  const listKeyDown = useCallback(
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

  const ctx = useMemo(
    () => ({
      closeMenu: closeMenu ?? (() => {}),
      size,
    }),
    [closeMenu, size],
  );

  const overrideStyle: NavHeadingMenuStyle | undefined =
    minWidth == null
      ? styleProp
      : {
          ...styleProp,
          [navHeadingMenuMinWidthVar]:
            typeof minWidth === 'number' ? `${minWidth}px` : minWidth,
        };

  const preventedBeforeDescendantsRef = useRef(new WeakSet<Event>());
  const handleMenuKeyDownCapture = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    onKeyDownCaptureProp?.(event);
    if (event.defaultPrevented) {
      preventedBeforeDescendantsRef.current.add(event.nativeEvent);
    }
  };
  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const wasPreventedByDescendant =
      event.defaultPrevented &&
      !preventedBeforeDescendantsRef.current.has(event.nativeEvent);
    onKeyDownProp?.(event);
    if (wasPreventedByDescendant || !event.defaultPrevented) {
      listKeyDown(event);
    }
  };

  return (
    <NavHeadingMenuContext value={ctx}>
      <div
        ref={useMergedRefs(ref, listRef)}
        data-testid={testId}
        {...mergeProps(
          themeProps('nav-heading-menu', {size}),
          xstyleProps(xstyle),
          tw(
            navHeadingMenuClassName,
            navHeadingMenuMinWidthClassName[size],
            hasOverflow
              ? dropdownMenuSubMenuTouchClassName
              : dropdownMenuSubMenuTouchPinchClassName,
            className,
          ),
          overrideStyle,
        )}
        {...rest}
        {...menuPress.menuProps}
        onPointerDown={composeEventHandlers(
          onPointerDownProp,
          pressOnItemsOnly(
            menuPress.menuProps.onPointerDown,
            ENABLED_ITEM_SELECTOR,
          ),
        )}
        role="menu"
        onKeyDownCapture={handleMenuKeyDownCapture}
        onKeyDown={handleMenuKeyDown}>
        {children}
      </div>
    </NavHeadingMenuContext>
  );
}

NavHeadingMenu.displayName = 'NavHeadingMenu';
