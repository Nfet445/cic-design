// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ListItem.tsx
 * @input Uses React, ReactNode, StyleXStyles, the List row edge treatment
 *   and the class maps in List/listItemClasses.ts. It also uses the touch hit area (utils/touchHitArea.ts and
 *   its layer), the travelling marker of an update's slide
 *   (List/listLayoutUpdates.ts) and CheckboxInput. It reads the marker or task
 *   checkbox a ListMarkerScope sets, for Markdown's nested lists and the task
 *   items of mixed lists. It also reads Item's private exact-marker formatting
 *   scope for numbered
 *   rows. Number markers stay on one line in the List's shared column,
 *   keeping every sibling's text and nested list on the same start line.
 *   They end on one line too, right-aligned with tabular figures, and hang
 *   into the row's inline inset before they widen that column. Markdown's
 *   outside counters keep the themed column and may paint beyond it, matching
 *   RichText's native outside markers without a finite width threshold.
 * @output Exports ListItem component, ListItemProps type
 * @position Core implementation. Consumed by List, index.ts, tested by List.test.tsx
 *
 * In a reorderable List (`List reorderable`), each row with an `itemKey`
 * that the reorderable object lets move ends with its handle. The handle
 * comes through ListContext's `reorder` with the rest of the reorder
 * machinery (List/listReorderContext.ts). A row without one keeps its place.
 *
 * Composes Item for the shared start content + label + description + end content layout
 * and the invisible button/anchor interactive pattern.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/List/List.doc.mjs
 * - /packages/core/src/List/List.test.tsx
 * - /packages/core/src/List/index.ts
 * - /apps/storybook/stories/List.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/List/ (showcase blocks)
 */

import {use, useMemo, useRef, type ReactNode} from 'react';
import type {StyleXStyles} from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import {ListContext, type ListMarker} from './ListContext';
import {CheckboxInput} from '../CheckboxInput/CheckboxInput';
import {mergeProps} from '../utils/mergeProps';
import {rowPressLayerStyles} from '../privateAttributes/press.stylex';
import {Item, servesSwipeActions} from '../Item/Item';
import {ItemListRowContext} from '../Item/ItemListRowContext';
import {ItemMarkerColumnsContext} from '../Item/ItemMarkerColumnsContext';
import {ItemLabelNeededContext} from '../Item/ItemLabelContext';
import {ItemTrailingContext} from '../Item/ItemTrailingContext';
import type {ItemAlign, ItemSwipeActions, ItemSwipeBehavior} from '../Item';
import {swipeWithItemKey, type Swipe} from '../Swipe/swipeHost';
import {themeProps} from '../utils/themeProps';
import {useMergedRefs} from '../hooks/useMergedRefs';
import {isReportedRow, keepPresentation} from './listLayoutUpdates';
import {itemKeyProps} from '../privateAttributes/itemKey.stylex';
import {listRowProps} from '../privateAttributes/listRow.stylex';
import {
  travellingRaisedSwipeRowClassName,
  travellingRowClassName,
} from '../privateAttributes/travelling.stylex';
import {useTouchHitArea} from '../utils/touchHitArea';
import {touchHitAreaStyles} from '../internal/touchHitArea.stylex';
import {tw} from '../utils/tw';
import {
  listItemMarkerCircleClassName,
  listItemMarkerContainerClassName,
  listItemMarkerCounterClassName,
  listItemMarkerDotClassName,
  listItemMarkerGutterHangClassName,
  listItemMarkerNumberClassName,
  listItemMarkerSquareClassName,
  listItemRowClassName,
  listItemTaskMarkerContainerClassName,
} from './listItemClasses';

// =============================================================================
// Types
// =============================================================================

export interface ListItemProps extends BaseProps<HTMLLIElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLLIElement>;
  /**
   * Vertical alignment of the start and end content against the label,
   * forwarded to Item. Use `first-line` to keep the start and end content level with the
   * first line of a wrapped label.
   * @default 'center'
   */
  align?: ItemAlign;
  /**
   * Primary text label for the item.
   *
   * Accepts a plain string (single-line truncation applied automatically)
   * or a ReactNode for rich content (no truncation constraints —
   * child components control their own text behavior).
   */
  label: ReactNode;

  /**
   * Secondary description below the label.
   *
   * Accepts a plain string (single-line truncation applied automatically)
   * or a ReactNode for rich/multi-line content (no wrapping constraints
   * applied — child components control their own text behavior).
   */
  description?: ReactNode;

  /**
   * Content before the label, inside the row (icon, avatar, checkbox).
   * Uses start/end naming for RTL support.
   */
  startContent?: ReactNode;

  /**
   * Content after the label and description, inside the row (badge, action
   * button, chevron).
   */
  endContent?: ReactNode;

  /**
   * Click handler for interactive items.
   * Automatically enables hover/press styles when provided.
   */
  onClick?: (e: React.MouseEvent) => void;

  /**
   * Ref to a nested control inside the item (e.g. a checkbox in
   * `startContent`) that already provides the item's keyboard access and
   * action. When set, the item becomes an enlarged click/tap target that
   * delegates surface clicks to that control via the `useClickableContainer`
   * pattern: it renders no invisible button/anchor, so the row adds no second
   * tab stop (WCAG 4.1.2 — one focusable control per option). Mutually
   * exclusive with `onClick`/`href` — when set those are ignored.
   */
  interactiveRef?: React.RefObject<HTMLElement | null>;

  /**
   * URL for link items. Renders an invisible anchor element.
   * Automatically enables hover/press styles when provided.
   */
  href?: string;

  /**
   * Link target (e.g., '_blank'). Only used with href.
   */
  target?: string;

  /**
   * Link relationship. Automatically includes noopener noreferrer when
   * target is "_blank".
   */
  rel?: string;

  /**
   * Whether the item is disabled.
   * @default false
   */
  isDisabled?: boolean;

  /**
   * Whether the item is currently selected.
   * @default false
   */
  isSelected?: boolean;

  /**
   * The row's item key, a string or a number from the data, in the shape
   * Table's `idKey` returns. It is the row's identity for the list's
   * `animatedLayout`. In a reorderable List (`List reorderable`), it is the
   * key `onReorder` reports and `isReorderable` is asked about. A row without
   * one changes at once and has no reorder handle. It is separate from
   * React's `key`, which stays React's own.
   */
  itemKey?: string | number;

  /** Swipe actions from `createSwipe`, passed to `Item` with this row's `itemKey` added. */
  swipe?: Swipe;

  /** @deprecated Pass `swipe` instead. */
  swipeActions?: ItemSwipeActions;

  /**
   * @deprecated Set it in `swipe` instead.
   * @default 'reveal'
   */
  swipeBehavior?: ItemSwipeBehavior;
}

// =============================================================================
// Component
// =============================================================================

/**
 * The row's callback ref for the Web Animations on its parts, such as a
 * swipe's travel on the compositor. A detached row loses them. So when React
 * detaches a row in an animating list, the row records what they present. It
 * is still in the document then, so a removal's collapse shows the row as it
 * was on screen. Only a row its list reported for the commit can exit. So
 * when StrictMode replays the detach of a new row, it records nothing.
 */
function keepPresentationOnDetach(row: HTMLLIElement | null) {
  if (row == null) {
    return undefined;
  }
  return () => {
    if (isReportedRow(row)) {
      keepPresentation(row);
    }
  };
}

/**
 * A list item component for use within List.
 *
 * Renders structured content with label, description, start/end content areas.
 * When `onClick` is provided, uses the invisible button pattern for accessibility.
 * When `href` is provided, uses an invisible anchor pattern.
 *
 * @example
 * ```
 * <ListItem label="Settings" description="Manage your preferences" />
 * <ListItem label="Profile" onClick={() => navigate('/profile')} />
 * <ListItem label="Docs" href="/docs" target="_blank" rel="noreferrer" />
 * ```
 */
export function ListItem({
  label,
  description,
  startContent,
  endContent,
  onClick,
  interactiveRef,
  href,
  target,
  rel,
  isDisabled = false,
  isSelected = false,
  itemKey,
  align,
  xstyle,
  className,
  style,
  ref,
  ...restProps
}: ListItemProps) {
  const ctx = use(ListContext);
  // The row's swipe, attached with its key for each action's `onActivate`.
  // Kept per swipe value and key: a render that changes neither hands the row
  // the same value. So an open row stays as it is.
  const {swipe} = restProps;
  const keyedSwipe = useMemo(
    () => (swipe == null ? undefined : swipeWithItemKey(swipe, itemKey)),
    [swipe, itemKey],
  );
  // The row's element, which a row without a handle names for the reorder.
  const rowRef = useRef<HTMLLIElement | null>(null);
  // A List isolates its rows, so what a row raises stays below a page-level
  // sticky header. Outside a List nothing bounds a raise, so a row raises
  // nothing there.
  const isInList = ctx != null;
  // In a reorderable List: a trailing handle, or a row that stays put.
  const reorder = ctx?.reorder;
  const hasHandle =
    reorder != null &&
    itemKey != null &&
    (reorder.options.isReorderable?.(itemKey) ?? true);
  // The handle is the one element reordering adds to a row. With end content
  // it joins the end slot. Without, it is the row's own child
  // (ItemTrailingContext), since an end slot of its own would be a second
  // element.
  const isHandleInRow = hasHandle && endContent == null;
  const rowLabel = restProps['aria-label'];
  const rowLabelledBy = restProps['aria-labelledby'];
  const rowAlign = isHandleInRow ? (align ?? 'center') : undefined;
  const Handle = reorder?.session.Handle;
  const reorderHandle = useMemo(
    () =>
      hasHandle && Handle != null && itemKey != null ? (
        <Handle
          label={label}
          itemKey={itemKey}
          isDisabled={isDisabled}
          rowLabel={rowLabel}
          rowLabelledBy={rowLabelledBy}
          rowAlign={rowAlign}
        />
      ) : null,
    [
      Handle,
      hasHandle,
      isDisabled,
      itemKey,
      label,
      rowAlign,
      rowLabel,
      rowLabelledBy,
    ],
  );
  // Under a finger, the row's hit target grows where its neighbors leave room.
  const isTouchTarget =
    (onClick != null || href != null || interactiveRef != null) && !isDisabled;
  const hitAreaRef = useTouchHitArea(isTouchTarget);
  const mergedRef = useMergedRefs(
    ref,
    rowRef,
    hitAreaRef,
    keepPresentationOnDetach,
  );
  // A row that Item serves swipe actions on is a stacking context at rest. So
  // its band's own z-index orders only inside it, and under a finger the row
  // raises itself. Its root is its `<li>`, never a link.
  const isRaisedSwipeRow =
    isInList &&
    isTouchTarget &&
    servesSwipeActions({
      swipe: restProps.swipe,
      swipeActions: restProps.swipeActions,
      isDisabled,
      isDelegate: interactiveRef != null,
      isLinkRoot: false,
      role: restProps.role,
    });
  const density = ctx?.density ?? 'balanced';
  const hasDividers = ctx?.hasDividers ?? false;
  const edge = ctx?.edge ?? 'padded';
  const listStyle = ctx?.listStyle ?? 'none';
  const hasMarkers = listStyle !== 'none';
  // ListMarkerScope may name another marker for this item.
  const markerKind: ListMarker | null =
    listStyle === 'none' ? null : (ctx?.marker ?? listStyle);

  // A task item in a list with markers shows its checkbox instead.
  const task = markerKind == null ? undefined : ctx?.task;

  const hasMarkerGutter = ctx?.hasMarkerGutter === true;
  const usesNumberColumns =
    listStyle === 'decimal' && ctx?.isOutsideNumberColumns !== true;
  const marker = useMemo(
    () =>
      task != null ? (
        // eslint-disable-next-line @astryx/no-style-only-wrapper -- the marker box holds the control where the marker would stand and centres it on the row's first line; the rule reads StyleX objects, not class text.
        <span className={listItemTaskMarkerContainerClassName}>
          <CheckboxInput
            size="sm"
            value={task.isChecked}
            label={task.label}
            isLabelHidden
            isReadOnly
          />
        </span>
      ) : markerKind === 'disc' ||
        markerKind === 'circle' ||
        markerKind === 'square' ? (
        <span className={listItemMarkerContainerClassName}>
          <span
            className={
              markerKind === 'disc'
                ? listItemMarkerDotClassName
                : markerKind === 'circle'
                  ? listItemMarkerCircleClassName
                  : listItemMarkerSquareClassName
            }
          />
        </span>
      ) : markerKind != null ? (
        <span
          className={tw(
            listItemMarkerNumberClassName,
            listItemMarkerCounterClassName[markerKind],
            hasMarkerGutter && listItemMarkerGutterHangClassName,
          )}
        />
      ) : null,
    [task, markerKind, hasMarkerGutter],
  );

  // A row without a handle in a reorderable List still has a name for the
  // announcements of the moves beside it. It follows the row, so the row's
  // element is set when it records it.
  const reorderName =
    reorder && !reorderHandle ? (
      <reorder.session.RowName row={rowRef} label={label} />
    ) : null;

  const item = (
    <Item
      as="li"
      ref={mergedRef}
      marker={marker}
      startContent={startContent}
      label={label}
      description={description}
      endContent={
        reorderHandle != null && !isHandleInRow ? (
          <>
            {endContent}
            {reorderHandle}
          </>
        ) : (
          endContent
        )
      }
      onClick={onClick}
      interactiveRef={interactiveRef}
      href={href}
      target={target as '_blank' | '_self'}
      rel={rel}
      isDisabled={isDisabled}
      isSelected={isSelected}
      align={align}
      density={density}
      xstyle={
        [
          hasDividers && isTouchTarget && rowPressLayerStyles.overDividers,
          isTouchTarget && touchHitAreaStyles.layer,
          // A focused handle rings itself; the row's focus-within ring stays
          // off for it (two rings, and the list clips the row's sides).
          reorderHandle && reorder?.session.rowStyle,
          xstyle,
        ] as StyleXStyles
      }
      {...mergeProps(themeProps('list-item'), {
        className: tw(
          listItemRowClassName({
            edge,
            hasDividers,
            hasMarkers,
            isTouchTargetInList: isTouchTarget && isInList,
            usesNumberColumns,
            spansNumberColumns: listStyle === 'decimal' && !usesNumberColumns,
          }),
          travellingRowClassName,
          isRaisedSwipeRow && travellingRaisedSwipeRowClassName,
          className,
        ),
        style,
      })}
      {...listRowProps(edge, hasDividers)}
      {...itemKeyProps(itemKey)}
      {...restProps}
      swipe={keyedSwipe}
    />
  );
  const row = <ItemListRowContext value>{item}</ItemListRowContext>;
  // Only numbered rows contribute two cells to List's shared counter grid.
  // Passing the marker identity keeps this request off unrelated Items in slots.
  const marked = usesNumberColumns ? (
    <ItemMarkerColumnsContext value={marker}>{row}</ItemMarkerColumnsContext>
  ) : (
    row
  );
  return (
    <>
      {/* One shape whether or not the handle is the row's own child, so the
          row keeps its element when that changes. */}
      <ItemTrailingContext value={isHandleInRow ? reorderHandle : null}>
        {/* The handle is named after the row's label. */}
        <ItemLabelNeededContext value={reorderHandle != null}>
          {marked}
        </ItemLabelNeededContext>
      </ItemTrailingContext>
      {reorderName}
    </>
  );
}

ListItem.displayName = 'ListItem';
