// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DropdownMenuCheckboxItem.tsx
 * @input React, stylex, Item + Indicator registry + DropdownMenu context + tokens from core
 * @output DropdownMenuCheckboxItem — a standalone checkable menu item.
 * @position Sub-component; used inside DropdownMenu.
 *
 * A menu item that toggles an independent boolean (role="menuitemcheckbox").
 * Unlike CheckboxInput, there is no nested native <input> that participates in
 * accessibility: the row itself owns the role and aria-checked, per the
 * WAI-ARIA menuitemcheckbox pattern. Keyboard navigation (arrows/typeahead) and
 * Enter/Space activation come from the parent DropdownMenu's useListFocus +
 * activation path, which matches menuitemcheckbox alongside plain menuitem rows.
 *
 * The checkbox visual is the shared checkbox indicator, decorative
 * (aria-hidden) — the row owns the role, checked state, and accessible name, so
 * there is no nested native <input> to shim out of the accessibility tree. It
 * picks up the same `checkbox` theming (and any theme replacement) as
 * CheckboxInput. The control size is derived from the menu's item size (a `sm`
 * menu gets the compact control; `md`/`lg` get the standard one) and the marker
 * box swaps to the inline-end of the row on coarse-pointer (touch) devices via
 * CSS `order`, so it lands where selection toggles are conventionally placed on
 * mobile.
 */

import {
  useCallback,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {renderIconSlot, type IconType} from '../Icon';
import {useIndicator} from '../Indicator';
import {Item} from '../Item';
import {useDropdownMenuContext} from './DropdownMenuContext';
import {focusOutlineStyles} from '../utils/focusOutline.stylex';
import {menuPressLitRowClassName} from '../privateAttributes/menuPressLit.stylex';
import {tw} from '../utils/tw';
import {
  dropdownMenuCheckableRowClassName,
  dropdownMenuMarkerClassName,
} from './dropdownMenuClasses';
import {focusMenuItemOnHover} from './menuItemHover';
import {colorVars, focusVars} from '../theme/tokens.stylex';
import {composeEventHandlers, mergeProps, themeProps} from '../utils';
import type {BaseProps} from '../BaseProps';
import {keepDisabledRowUnfocused} from './menuItemRoles';

const menuRowStateStyles = stylex.create({
  row: {
    // The row's paint stays unlayered. Item's own hover and press overlays are
    // unlayered too, and a layered utility loses to them whatever the class
    // order says, so the focused fill reads its paint here.
    backgroundColor: {
      default: 'transparent',
      // menuPressLitRowClassName sets the variable on the row a held finger or pen
      // lights.
      ':focus': `var(--_menu-row-focus-paint, ${colorVars['--color-overlay-hover']})`,
    },
    // Rows show focus with a translucent overlay, which forced colors replace
    // with the page color. The standard focus ring (focusOutlineStyles), drawn
    // inside the row by its own width, marks the focused row in every mode.
    // The ring and its offset share one tier, so the row's offset outranks the
    // shared one only beside it, unlayered.
    outlineOffset: `calc(-1 * ${focusVars['--focus-outline-width']})`,
  },
});

// Matches the control sizes CheckboxInput uses, so a checkbox reads the same in
// a menu row as it does in a form.
export interface DropdownMenuCheckboxItemProps extends Omit<
  BaseProps,
  'onChange' | 'role' | 'aria-checked' | 'tabIndex'
> {
  /**
   * Primary label text identifying the item.
   */
  label: ReactNode;
  /**
   * Secondary description text displayed below the label.
   */
  description?: ReactNode;
  /**
   * Icon to display before the label. Accepts a semantic icon name (see
   * `astryx docs icons`) or a rendered node.
   */
  icon?: ReactNode | IconType;
  /**
   * Whether the item is checked. Controlled — pair with `onChange`.
   */
  value: boolean;
  /**
   * Callback fired with the next checked state when the item is toggled.
   */
  onChange?: (checked: boolean) => void;
  /**
   * Whether the item is disabled. A disabled item stays in the accessibility
   * tree as disabled (`aria-disabled`), and the arrow keys and typeahead reach
   * it so keyboard users find it. The pointer highlight skips it, and
   * activation is blocked.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether toggling the item closes the menu. Checkbox items default to
   * staying open so several can be toggled in a single session, unlike radio
   * items which default to closing on selection.
   * @default false
   */
  hasCloseOnSelect?: boolean;
  /** Ref forwarded to the row root — the element carrying `role="menuitemcheckbox"`. */
  ref?: React.Ref<HTMLElement>;
  /**
   * Content to render after the label and description, such as a keyboard
   * shortcut hint or badge.
   */
  endContent?: ReactNode;
}

/**
 * A checkable dropdown menu item (role="menuitemcheckbox").
 *
 * Must be used inside a DropdownMenu. Toggles an independent boolean; for a
 * one-of-N choice use DropdownMenuRadioGroup + DropdownMenuRadioItem instead.
 * Consumer click and pointer-move handlers compose after the row's own
 * activation and hover-focus behavior; disabled activation stops before the
 * consumer click handler.
 *
 * @example
 * ```
 * import {DropdownMenuCheckboxItem} from '@astryxdesign/core/DropdownMenu';
 * <DropdownMenu button={{label: 'View'}}>
 *   <DropdownMenuCheckboxItem
 *     label="Show archived"
 *     value={showArchived}
 *     onChange={setShowArchived}
 *   />
 * </DropdownMenu>
 * ```
 */
export function DropdownMenuCheckboxItem({
  label,
  description,
  icon,
  value,
  onChange,
  isDisabled = false,
  hasCloseOnSelect = false,
  endContent,
  xstyle,
  className,
  style,
  onClick,
  onPointerMove,
  ...rest
}: DropdownMenuCheckboxItemProps) {
  const ctx = useDropdownMenuContext();
  const menuSize = ctx?.menuSize ?? 'md';
  const controlSize = menuSize === 'sm' ? 'sm' : 'md';
  const CheckboxControl = useIndicator('checkbox');

  const handleClick = useCallback(
    (event: MouseEvent) => {
      if (isDisabled) {
        event.preventDefault();
        return;
      }
      onChange?.(!value);
      if (hasCloseOnSelect) {
        ctx?.closeMenu();
      }
      onClick?.(event as MouseEvent<HTMLElement>);
    },
    [isDisabled, onChange, value, hasCloseOnSelect, ctx, onClick],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLElement>) => focusMenuItemOnHover(e, isDisabled),
    [isDisabled],
  );

  return (
    <Item
      {...rest}
      onMouseDown={composeEventHandlers(
        rest.onMouseDown,
        isDisabled ? keepDisabledRowUnfocused : undefined,
      )}
      role="menuitemcheckbox"
      aria-checked={value}
      tabIndex={-1}
      onPointerMove={composeEventHandlers(handlePointerMove, onPointerMove)}
      marker={
        // No wrapper, and no menu-specific theme target: the shared
        // `astryx-checkbox-indicator` target is already on this element (main
        // reached the menu checkbox through it too), so the menu adds only its own
        // placement rules. A wrapper here would have duplicated the
        // indicator's control size and moved nothing themeable.
        <CheckboxControl
          state={value ? 'checked' : 'unchecked'}
          size={controlSize}
          isDisabled={isDisabled}
          className={dropdownMenuMarkerClassName}
        />
      }
      startContent={
        icon
          ? renderIconSlot(icon, {size: 'sm', color: 'secondary'})
          : undefined
      }
      label={label}
      description={description}
      endContent={endContent}
      onClick={handleClick}
      isDisabled={isDisabled}
      xstyle={[focusOutlineStyles.focusVisible, menuRowStateStyles.row, xstyle]}
      {...mergeProps(themeProps('dropdown-menu-item', {size: menuSize}), {
        className: tw(
          dropdownMenuCheckableRowClassName({isDisabled}),
          menuPressLitRowClassName,
          className,
        ),
        style,
      })}
    />
  );
}

DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem';
