// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TypeaheadItem.tsx
 * @input Uses React, StyleX, SearchableItem
 * @output Exports TypeaheadItem component for rendering dropdown items
 * @position Presentational component; used as default renderItem in BaseTypeahead
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Typeahead/index.ts
 * - /packages/cli/assets/templates/blocks/components/Typeahead/ (showcase blocks)
 */

import React, {type ReactNode} from 'react';
import type {SearchableItem} from './types';
import type {BaseProps} from '../BaseProps';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';
import {tw} from '../utils/tw';
import {xstyleProps} from '../utils/xstyle';
import {
  TYPEAHEAD_ITEM_CONTENT_CLASS,
  TYPEAHEAD_ITEM_DESCRIPTION_CLASS,
  TYPEAHEAD_ITEM_DISABLED_CLASS,
  TYPEAHEAD_ITEM_FRAME_CLASS,
  TYPEAHEAD_ITEM_LABEL_CLASS,
} from './typeaheadClasses';

// =============================================================================
// Types
// =============================================================================

export interface TypeaheadItemProps<
  T extends SearchableItem = SearchableItem,
> extends BaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  /**
   * The search result item.
   */
  item: T;

  /**
   * Icon or avatar to display before the label.
   */
  icon?: ReactNode;

  /**
   * Description text displayed below the label.
   */
  description?: string;

  /**
   * Whether this item is disabled.
   * @default false
   */
  isDisabled?: boolean;

  /**
   * This prop has no effect. Set `item.auxiliaryData.group` on search-source
   * items to group results in Typeahead or BaseTypeahead.
   */
  group?: string;
}

// =============================================================================
// Styles
// =============================================================================

// =============================================================================
// Component
// =============================================================================

/**
 * Default item component for typeahead dropdown results.
 *
 * Renders a label with optional icon and description.
 * Exported for use in custom `renderItem` implementations.
 *
 * @example
 * ```
 * <Typeahead searchSource={source} value={v} onChange={setV} label="Search" />
 * <Typeahead
 *   searchSource={source}
 *   value={v}
 *   onChange={setV}
 *   label="Search"
 *   renderItem={(item) => (
 *     <TypeaheadItem
 *       item={item}
 *       icon={<Avatar src={item.auxiliaryData.avatar} size="sm" />}
 *       description={item.auxiliaryData.role}
 *     />
 *   )}
 * />
 * ```
 */
export function TypeaheadItem<T extends SearchableItem>({
  ref,
  item,
  icon,
  description,
  isDisabled = false,
  group: _group,
  xstyle,
  className,
  style,
  ...rest
}: TypeaheadItemProps<T>) {
  // If item has a pre-rendered element, use it
  if (item.element) {
    return <>{item.element}</>;
  }

  return (
    <div
      ref={ref}
      {...mergeProps(
        themeProps('typeahead-item'),
        xstyleProps(xstyle),
        tw(
          TYPEAHEAD_ITEM_FRAME_CLASS,
          isDisabled && TYPEAHEAD_ITEM_DISABLED_CLASS,
          className,
        ),
        style,
      )}
      {...rest}>
      {icon}
      <div className={TYPEAHEAD_ITEM_CONTENT_CLASS}>
        <span className={TYPEAHEAD_ITEM_LABEL_CLASS}>{item.label}</span>
        {description && (
          <span className={TYPEAHEAD_ITEM_DESCRIPTION_CLASS}>
            {description}
          </span>
        )}
      </div>
    </div>
  );
}

TypeaheadItem.displayName = 'TypeaheadItem';
