// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DropdownMenuRadioGroup.tsx
 * @output DropdownMenuRadioGroup — a single-select group of menu items.
 * @position Sub-component; wraps DropdownMenuRadioItem inside a DropdownMenu.
 *
 * Owns single-selection state (value/onChange) for its child
 * DropdownMenuRadioItems and exposes it via context. Renders role="group" with
 * an accessible name so the radios are announced as a set. Keyboard navigation
 * comes from the parent DropdownMenu's useListFocus, which matches
 * menuitemradio rows.
 */

import {useMemo, type ReactNode, type Ref} from 'react';
import * as stylex from '@stylexjs/stylex';
import {mergeProps} from '../utils';
import {tw} from '../utils/tw';
import {dropdownMenuRadioGroupClassName} from './dropdownMenuClasses';
import type {BaseProps} from '../BaseProps';
import {
  DropdownMenuRadioGroupContext,
  type DropdownMenuRadioGroupContextValue,
} from './DropdownMenuContext';

export interface DropdownMenuRadioGroupProps extends Omit<
  BaseProps,
  'onChange'
> {
  /**
   * The currently selected value in the group. Pass `undefined` when nothing
   * is selected yet.
   */
  value: string | undefined;
  /**
   * Callback fired when the selected value changes.
   */
  onChange: (value: string) => void;
  /**
   * Accessible name for the group, announced by screen readers so the radios
   * read as a named set (e.g. "Sort by"). Applied as the group's `aria-label`.
   * Required even when `aria-labelledby` (via base props) points to visible
   * text; that visible reference becomes the computed name while `label`
   * remains the fallback.
   */
  label: string;
  /**
   * Whether selecting a value closes the menu. Radio items default to closing
   * on selection (a single-choice commit), unlike checkbox items which stay
   * open.
   * @default true
   */
  hasCloseOnSelect?: boolean;
  /**
   * Ref forwarded to the role="group" root.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * The `DropdownMenuRadioItem`s that make up the group.
   */
  children: ReactNode;
}

/**
 * A single-select group of radio menu items (role="group" of menuitemradio).
 *
 * @example
 * ```
 * import {
 *   DropdownMenuRadioGroup,
 *   DropdownMenuRadioItem,
 * } from '@astryxdesign/core/DropdownMenu';
 * <DropdownMenu button={{label: 'Sort'}}>
 *   <DropdownMenuRadioGroup value={sort} onChange={setSort} label="Sort by">
 *     <DropdownMenuRadioItem value="newest" label="Newest" />
 *     <DropdownMenuRadioItem value="oldest" label="Oldest" />
 *   </DropdownMenuRadioGroup>
 * </DropdownMenu>
 * ```
 */
export function DropdownMenuRadioGroup({
  value,
  onChange,
  label,
  hasCloseOnSelect = true,
  children,
  ref,
  xstyle,
  className,
  style,
  ...rest
}: DropdownMenuRadioGroupProps) {
  const contextValue = useMemo<DropdownMenuRadioGroupContextValue>(
    () => ({value, onChange, hasCloseOnSelect}),
    [value, onChange, hasCloseOnSelect],
  );

  return (
    <div
      {...rest}
      ref={ref}
      role="group"
      aria-label={label}
      {...mergeProps(stylex.props(xstyle), {
        className: tw(dropdownMenuRadioGroupClassName, className),
        style,
      })}>
      <DropdownMenuRadioGroupContext value={contextValue}>
        {children}
      </DropdownMenuRadioGroupContext>
    </div>
  );
}

DropdownMenuRadioGroup.displayName = 'DropdownMenuRadioGroup';
