// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TabMenu.tsx
 * @input Uses React, usePopover, TabListContext
 * @output Exports TabMenu component, TabMenuProps type, TabMenuOption type
 * @position Menu trigger button; opens dropdown of overflow menu items and
 *   mirrors selected tab indicator positioning
 *
 * SYNC: When modified, update:
 * - /packages/core/src/TabList/TabList.doc.mjs
 * - /packages/core/src/TabList/index.ts
 * - /packages/core/src/TabList/TabList.test.tsx
 * - /packages/cli/assets/templates/blocks/components/TabList/ (showcase blocks)
 */

import React, {useCallback, useId, useRef, type ReactNode} from 'react';
import {Icon} from '../Icon';
import {renderIconSlot, type IconType} from '../Icon';
import {focusOutlineFocusVisibleClassName} from '../utils/focusOutlineClasses';
import {usePopoverInternal} from '../Popover/usePopover';
import {MENU_ITEM_SELECTOR} from '../DropdownMenu/menuItemRoles';
import {useListFocus} from '../hooks/useListFocus';
import {useMenuPress} from '../hooks/useMenuPress';
import {useMenuOverflow} from '../DropdownMenu/useMenuOverflow';
import {
  dropdownMenuSubMenuTouchClassName,
  dropdownMenuSubMenuTouchPinchClassName,
} from '../DropdownMenu/dropdownMenuSubMenuClasses';
import {useTabListContext} from './TabListContext';
import type {TabListSize} from './TabListContext';
import {
  TAB_LABEL_SIZER_CLASS,
  TAB_LABEL_TEXT_CLASS,
  TAB_MENU_CHEVRON_CLASS,
  TAB_MENU_CHEVRON_ICON_CLASS,
  TAB_MENU_CHEVRON_OPEN_CLASS,
  TAB_MENU_DROPDOWN_CLASS,
  TAB_MENU_HEADING_CLASS,
  TAB_MENU_ITEM_CONTENT_CLASS,
  TAB_MENU_TRIGGER_LABEL_CLASS,
  tabIndicatorClassName,
  tabMenuHoverLayerClassName,
  tabMenuItemClassName,
  tabMenuTriggerClassName,
} from './tabListClasses';
import {composeEventHandlers, mergeProps} from '../utils';
import {xstyleProps} from '../utils/xstyle';
import {tw} from '../utils/tw';
import {useMergedRefs} from '../hooks/useMergedRefs';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';

export interface TabMenuOption {
  value: string;
  label: string;
  /**
   * Icon to display before the label.
   */
  icon?: ReactNode | IconType;
}

export interface TabMenuProps extends Omit<
  BaseProps<HTMLButtonElement>,
  'role' | 'tabIndex' | 'aria-haspopup' | 'aria-expanded' | 'aria-controls'
> {
  ref?: React.Ref<HTMLButtonElement>;
  /**
   * Label for the trigger button and dropdown heading.
   * Displayed as trigger text when no option is selected.
   */
  label: string;
  /**
   * Menu options rendered in the dropdown.
   */
  options: TabMenuOption[];
}

/**
 * Tab menu trigger that opens a dropdown of additional tab options.
 * Shows the selected option's label as trigger text when an option is active.
 * Dropdown includes a heading showing the menu's label prop.
 *
 * @example
 * ```
 * <TabList value={tab} onChange={setTab}>
 *   <Tab value="overview" label="Overview" />
 *   <TabMenu label="More" options={[
 *     { value: "settings", label: "Settings" },
 *     { value: "history", label: "History" },
 *   ]} />
 * </TabList>
 * ```
 */
export function TabMenu({
  ref,
  label,
  options,
  xstyle,
  className,
  style,
  onClick,
  ...rest
}: TabMenuProps) {
  const tabListCtx = useTabListContext();
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const popover = usePopoverInternal({
    // The menu, not the layer, owns what a touch outside that pans does.
    ownsOutsidePan: true,
    hasLightDismiss: true,
    hasCloseButton: false,
    hasAutoFocus: false,
    // The popup's own role="menu" is the exposed semantics; a modal dialog
    // wrapper would announce an unnamed dialog around the menu.
    role: 'none',
    // Return focus to the trigger when the menu closes (Escape, Tab, select,
    // or light dismiss) so keyboard focus is never dropped to <body>.
    onHide: useCallback(() => {
      buttonRef.current?.focus();
    }, []),
  });

  // The overflow menu is a composite widget: a single roving tab stop with
  // arrow-key navigation between items, per the APG menu pattern. The hook owns
  // item tabindex — items render tabIndex={-1} and exactly one is promoted to 0.
  const {
    listRef,
    handleKeyDown: handleListKeyDown,
    handleFocus,
    focusFirst,
  } = useListFocus<HTMLDivElement>({
    hasRovingTabIndex: true,
    // Options render as menuitemradio (single-select menu), which the
    // default '[role="menuitem"]' selector would not match.
    itemSelector: MENU_ITEM_SELECTOR,
    onEscape: () => popover.hide(),
  });

  // A press that slides across the options picks the one it lifts on, the
  // highlight following the pointer, as DropdownMenu's does
  // (`family:action-groups` FR1-FR3, FR5); a mouse released outside closes it.
  const menuPress = useMenuPress({
    menuRef: listRef,
    itemSelector: MENU_ITEM_SELECTOR,
    onDismiss: popover.hide,
  });
  const hasOverflow = useMenuOverflow(listRef, options.length, popover.isOpen);

  const handleToggle = useCallback(() => {
    if (popover.isOpen) {
      popover.hide();
    } else {
      popover.show();
      // Move focus into the menu on open so arrow navigation works and the
      // roving tab stop lands on a real item (APG menu-button focus-on-open).
      requestAnimationFrame(() => focusFirst());
    }
  }, [popover, focusFirst]);

  const handleMenuKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // APG menu-button: Tab leaves the menu rather than walking its items.
      // Close and let onHide return focus to the trigger, from which the
      // browser's default Tab continues to the next element.
      if (e.key === 'Tab') {
        popover.hide();
        return;
      }
      handleListKeyDown(e);
    },
    [handleListKeyDown, popover],
  );

  const selectedOption = options.find(o => o.value === tabListCtx.value);
  const triggerLabel = selectedOption?.label ?? label;
  const hasSelectedOption = selectedOption != null;

  const size: TabListSize = tabListCtx.size;

  const handleSelect = useCallback(
    (value: string) => {
      tabListCtx.onChange(value);
      popover.hide();
    },
    [tabListCtx, popover],
  );

  const setButtonRef = useMergedRefs<HTMLButtonElement>(
    popover.triggerRef,
    buttonRef,
    ref,
  );

  return (
    <>
      <button
        {...rest}
        ref={setButtonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={popover.isOpen}
        aria-controls={menuId}
        data-tab-menu=""
        tabIndex={hasSelectedOption ? 0 : -1}
        onClick={composeEventHandlers(handleToggle, onClick)}
        {...mergeProps(
          themeProps('tab-menu'),
          xstyleProps(xstyle),
          tw(
            tabMenuTriggerClassName({size, hasSelectedOption}),
            className,
            focusOutlineFocusVisibleClassName,
          ),
          style,
        )}>
        <span aria-hidden="true" className={tabMenuHoverLayerClassName(size)} />
        <span className={TAB_MENU_TRIGGER_LABEL_CLASS}>
          <span className={TAB_LABEL_TEXT_CLASS}>{triggerLabel}</span>
          <span aria-hidden="true" className={TAB_LABEL_SIZER_CLASS}>
            {triggerLabel}
          </span>
        </span>
        <span aria-hidden="true" className={TAB_MENU_CHEVRON_CLASS}>
          <Icon
            icon="chevronDown"
            size="sm"
            color="inherit"
            className={tw(
              TAB_MENU_CHEVRON_ICON_CLASS,
              popover.isOpen && TAB_MENU_CHEVRON_OPEN_CLASS,
            )}
          />
        </span>
        {hasSelectedOption && (
          <span
            {...mergeProps(
              themeProps('tab-indicator', {selected: 'selected'}),
              tabIndicatorClassName({isSelected: true, color: 'icon'}),
            )}
          />
        )}
      </button>
      {popover.render(
        <div
          ref={listRef}
          id={menuId}
          role="menu"
          aria-label={label}
          {...menuPress.menuProps}
          onKeyDown={handleMenuKeyDown}
          onFocus={handleFocus}
          {...mergeProps(
            themeProps('tab-menu-dropdown'),
            tw(
              TAB_MENU_DROPDOWN_CLASS,
              hasOverflow
                ? dropdownMenuSubMenuTouchClassName
                : dropdownMenuSubMenuTouchPinchClassName,
            ),
          )}>
          <span role="presentation" className={TAB_MENU_HEADING_CLASS}>
            {label}
          </span>
          {options.map(option => {
            const isSelected = tabListCtx.value === option.value;
            return (
              <div
                key={option.value}
                // The menu is single-select: exactly one option can be the
                // active tab, so options are radio menu items with
                // aria-checked (APG menu-button), not plain menuitems with
                // aria-current.
                role="menuitemradio"
                tabIndex={-1}
                aria-checked={isSelected}
                onClick={() => handleSelect(option.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(option.value);
                  }
                }}
                {...mergeProps(
                  themeProps('tab-menu-item'),
                  tw(
                    tabMenuItemClassName(isSelected),
                    focusOutlineFocusVisibleClassName,
                  ),
                )}>
                <span className={TAB_MENU_ITEM_CONTENT_CLASS}>
                  {option.icon &&
                    renderIconSlot(option.icon, {
                      size: 'sm',
                      color: 'secondary',
                    })}
                  {option.label}
                </span>
                {isSelected && <Icon icon="check" size="sm" color="accent" />}
              </div>
            );
          })}
        </div>,
        {placement: 'below', alignment: 'start'},
      )}
    </>
  );
}

TabMenu.displayName = 'TabMenu';
