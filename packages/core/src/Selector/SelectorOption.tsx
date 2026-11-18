// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SelectorOption.tsx
 * @output Exports SelectorOption component for custom option rendering
 * @position Sub-component; used by Selector and consumers for custom options
 *
 * Composes Item for the shared start content + label + description + end content layout.
 */

import type {ReactNode} from 'react';
import type {AstryxXStyle} from '../utils/xstyle';
import {renderIconSlot, type IconType} from '../Icon';
import {Item} from '../Item';
import {useSelectorRowLayout} from './SelectorRowLayoutContext';
import {mergeProps} from '../utils';
import {tw} from '../utils/tw';
import {SELECTOR_OPTION_EMBEDDED_CLASS} from './selectorOptionClasses';
import {themeProps} from '../utils/themeProps';

export interface SelectorOptionProps {
  /**
   * Icon to display before the label.
   */
  icon?: ReactNode | IconType;

  /**
   * Primary label text.
   */
  label: ReactNode;

  /**
   * Secondary description text displayed below the label.
   */
  description?: ReactNode;

  /**
   * How the label and description sit together. `stacked` puts the
   * description on its own line below the label; `inline` keeps both on one
   * line, with the description ellipsizing first.
   *
   * In a Selector trigger this is the caller's choice and the trigger sizes
   * itself to it — one line at the size token, two lines exactly one text line
   * taller. Inside an `InputGroup` the row height is pinned by the group, so
   * `inline` is forced.
   *
   * @default 'stacked'
   */
  layout?: 'stacked' | 'inline';

  /**
   * Additional content to render after the label/description.
   */
  endContent?: ReactNode;

  /** Consumer styling for the root element. */
  xstyle?: AstryxXStyle;
  /**
   * CSS class name(s) appended to the root element.
   * If you're using StyleX, prefer `xstyle` for optimal style deduplication.
   */
  className?: string;
  /**
   * Inline styles to apply to the root element. Spread after StyleX
   * inline styles, so these values take priority.
   */
  style?: React.CSSProperties;
}

/**
 * A helper component for rendering custom selector options with consistent styling.
 *
 * Use this inside the `renderOption` prop of Selector to create
 * custom option layouts while maintaining design system consistency.
 *
 * @example
 * ```
 * <Selector
 *   label="User"
 *   options={users}
 *   value={value}
 *   onChange={setValue}
 *   renderOption={option => (
 *     <SelectorOption
 *       icon={UserIcon}
 *       label={option.label}
 *       description={option.email}
 *     />
 *   )}
 * />
 * ```
 */
export function SelectorOption({
  icon,
  label,
  description,
  layout,
  endContent,
  xstyle,
  className,
  style,
}: SelectorOptionProps) {
  // A height-pinned host (the trigger inside an InputGroup) overrides the
  // caller's choice: the row physically cannot be two lines there.
  const enforcedLayout = useSelectorRowLayout();

  return (
    <Item
      startContent={
        icon
          ? renderIconSlot(icon, {size: 'sm', color: 'secondary'})
          : undefined
      }
      label={label}
      description={description}
      layout={enforcedLayout === 'inline' ? 'inline' : layout}
      endContent={endContent}
      xstyle={xstyle}
      {...mergeProps(
        themeProps('selector-option'),
        tw(SELECTOR_OPTION_EMBEDDED_CLASS, className),
        style,
      )}
    />
  );
}

SelectorOption.displayName = 'SelectorOption';
