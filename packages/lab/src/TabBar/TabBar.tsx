// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TabBar.tsx
 * @input React, StyleX (the item marker only), Core's hooks, the class map in
 *   tabBarClasses.ts, TabBar's touch layer
 *   (TabBarTouch.ts), its geometry (tabBarModel.ts), its UIKit values
 *   (uikitTabBar.ts) and its panel scroll (panelScroll.ts)
 * @output TabBar (iOS 26's floating tab bar), TabBarItem, and the tab reading
 *   TabBarMoreList shares (overflowItems, badgedName)
 * @position Lab component: the phone presentation of an app's top-level
 *   sections, UITabBarController's counterpart
 *
 * SYNC: When modified, update TabBar.doc.mjs, TabBar.test.tsx and
 * __tests__/TabBar.interaction.browser.spec.ts.
 */

import {
  Children,
  isValidElement,
  useCallback,
  useId,
  useRef,
  type ReactElement,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '@astryxdesign/core';
import {useListFocus, useMergedRefs} from '@astryxdesign/core/hooks';
import {useTouchPresentation} from '@astryxdesign/core/internal/touch';
import {useTranslator} from '@astryxdesign/core/i18n';
import {Icon} from '@astryxdesign/core/Icon';
import {mergeProps, themeProps, xstyleProps} from '@astryxdesign/core/utils';
import {tw} from '../tw';
import {tabBarItemMarker, tabBarMarkerStyles} from './tabBar.stylex';
import {
  tabBarBadgeClassName,
  tabBarBadgeGeometryClassName,
  tabBarBadgesClassName,
  tabBarBoxClassName,
  tabBarCapsuleClassName,
  tabBarCapsuleSizeClassName,
  tabBarColumnClassName,
  tabBarCopyInnerClassName,
  tabBarCopyItemClassName,
  tabBarCopyOuterClassName,
  tabBarCopyOuterGeometryClassName,
  tabBarCopyRestClassName,
  tabBarIconClassName,
  tabBarItemBoxClassName,
  tabBarItemClassName,
  tabBarItemDisabledClassName,
  tabBarItemSelectedLookClassName,
  tabBarLabelClassName,
  tabBarLabelGeometryClassName,
  tabBarLabelSelectedClassName,
  tabBarLensBodyClassName,
  tabBarLensClassName,
  tabBarLensClipClassName,
  tabBarLensRestClassName,
  tabBarLensUnderClassName,
  tabBarRootClassName,
  tabBarRootInsetClassName,
} from './tabBarClasses';
import {tabBar} from './uikitTabBar';
import {useTabBarLens} from './TabBarTouch';
import {itemWidthCss, naturalWidth} from './tabBarModel';
import {scrollPanelToTop} from './panelScroll';

// =============================================================================
// Types
// =============================================================================

export interface TabBarItemProps {
  /** Identifies the tab in `value`, `onChange` and `onReselect`. */
  value: string;
  /** The tab's name, shown under its icon. */
  label: string;
  /** The tab's icon, drawn in the current text colour (an `<Icon />`). */
  icon: ReactNode;
  /** The icon while the tab is selected (a filled variant). Defaults to `icon`. */
  selectedIcon?: ReactNode;
  /**
   * A badge over the icon's top-trailing corner: a count or a short string.
   * Omit it, or pass an empty string, for no badge.
   */
  badge?: string | number;
  /**
   * What assistive technology reads for the badge, after the label
   * ("3 unread"). Defaults to the badge itself.
   */
  badgeLabel?: string;
  /**
   * Id of the panel this tab controls, wired up as `aria-controls`. Put the
   * same id on the panel element. Choosing the selected tab again scrolls
   * that panel to its top: the panel itself when it scrolls, or else the
   * first scroll area inside it.
   */
  panelId?: string;
  /**
   * Disables the tab, as on Core's Tab: it stays focusable, dimmed, and is
   * never chosen. A tap, a click or a key on it, or a lift over it, selects
   * nothing, and the arrow keys skip it.
   */
  'aria-disabled'?: boolean | 'true' | 'false';
}

export interface TabBarProps extends Omit<
  BaseProps<HTMLDivElement>,
  'onChange'
> {
  /** Ref forwarded to the root element. */
  ref?: React.Ref<HTMLDivElement>;
  /** The selected tab's `value`. */
  value: string;
  /** Called with a tab's `value` when a different tab is chosen. */
  onChange: (value: string) => void;
  /**
   * Called with the selected tab's `value` when it is chosen again: pop its
   * navigation stack to the root, as iOS does. Its panel (`panelId`) also
   * scrolls to its top.
   */
  onReselect?: (value: string) => void;
  /**
   * Names the tab bar for assistive technology. Without it, or `aria-label`
   * or `aria-labelledby`, the tab list is named "Tabs" in the reader's
   * language, as TabList's is.
   */
  label?: string;
  /** Names the tab list, as `label` does; it wins over `label`. */
  'aria-label'?: string;
  /** Names the tab list after another element; it wins over both. */
  'aria-labelledby'?: string;
  /**
   * The More tab's value, when there are more than five tabs. The bar shows the
   * first four and a More tab, which `value` selects as this or as any tab past
   * the fourth (UIKit's `moreNavigationController`).
   * @default 'more'
   */
  moreValue?: string;
  /** The tabs: `TabBarItem` elements, in order. */
  children: ReactNode;
}

/**
 * One tab of a TabBar. It renders nothing on its own: TabBar reads its props
 * and draws the tab (it must be a direct child of TabBar).
 */
export function TabBarItem(_props: TabBarItemProps): null {
  return null;
}

function readItems(children: ReactNode): TabBarItemProps[] {
  return Children.toArray(children).flatMap(child =>
    isValidElement(child) && child.type === TabBarItem
      ? [(child as ReactElement<TabBarItemProps>).props]
      : [],
  );
}

/** Whether a tab is disabled, read as Core's Tab reads `aria-disabled`. */
export function isDisabledItem(item: TabBarItemProps | undefined): boolean {
  const disabled = item?.['aria-disabled'];
  return disabled === true || disabled === 'true';
}

/** More than this many tabs and the bar shows the first four and More. */
const MAX_TABS = 5;

/**
 * The tabs past the fourth when there are more than five: the ones a More
 * tab holds.
 */
export function overflowItems(children: ReactNode): TabBarItemProps[] {
  const items = readItems(children);
  return items.length > MAX_TABS ? items.slice(MAX_TABS - 1) : [];
}

export function hasBadge(badge: string | number | undefined): boolean {
  return badge != null && badge !== '';
}

/**
 * A badged item's accessible name: one message with its label and badge, so
 * a tab and its More row read the same. Undefined without a badge.
 */
export function badgedName(
  item: TabBarItemProps,
  t: ReturnType<typeof useTranslator>,
): string | undefined {
  return hasBadge(item.badge)
    ? t('@astryx.tabBar.badgedItem', {
        label: item.label,
        badge: item.badgeLabel ?? String(item.badge),
      })
    : undefined;
}

// =============================================================================
// Geometry, as CSS on the capsule (a size container: 100cqw is its width)
// =============================================================================

const px = (value: number) => `${value}px`;
const INSET = px(tabBar.itemInset);

/** The distance between neighbouring items' centres. */
function pitch(count: number): string {
  return count > 1
    ? `((100cqw - ${px(2 * tabBar.itemInset)} - ${itemWidthCss(count)}) / ${count - 1})`
    : '0px';
}

/** An item's centre from the capsule's inline start, inside a calc(). */
function center(index: number, count: number): string {
  return count > 1
    ? `${INSET} + ${itemWidthCss(count)} / 2 + ${pitch(count)} * ${index}`
    : '50cqw';
}

/**
 * An item button's column, and where the item starts inside it. The column runs
 * from halfway to the previous item to halfway to the next. The first and last
 * columns end at the capsule's edges.
 */
function column(
  index: number,
  count: number,
): {start: string; width: string; itemStart: string} {
  if (count <= 1) {
    return {
      start: '0px',
      width: '100cqw',
      itemStart: `calc(50cqw - ${itemWidthCss(count)} / 2)`,
    };
  }
  const half = `${pitch(count)} / 2`;
  const edgeWidth = `calc(${INSET} + ${itemWidthCss(count)} / 2 + ${half})`;
  if (index === 0) {
    return {start: '0px', width: edgeWidth, itemStart: INSET};
  }
  return {
    start: `calc(${center(index, count)} - ${half})`,
    width: index === count - 1 ? edgeWidth : `calc(${pitch(count)})`,
    itemStart: `calc(${half} - ${itemWidthCss(count)} / 2)`,
  };
}

/** How far the lens's resting place is from the first item. */
function lensOffset(index: number, count: number): string {
  return count > 1 ? `calc(${pitch(count)} * ${index})` : '0px';
}

// =============================================================================
// Per-instance geometry
// =============================================================================

/** The bar's geometry arrives as private variables its classes read. */
type TabBarVars = React.CSSProperties &
  Record<`--astryx-tab-bar-${string}`, string>;

/** The capsule holds the geometry every descendant reads by inheritance. */
function capsuleVars(count: number): TabBarVars {
  return {
    '--astryx-tab-bar-capsule-height': px(tabBar.barHeight),
    '--astryx-tab-bar-capsule-max-width': px(naturalWidth(count)),
    '--astryx-tab-bar-inset': px(tabBar.itemInset),
    '--astryx-tab-bar-label-top': px(tabBar.labelTop),
    '--astryx-tab-bar-label-height': px(tabBar.labelSize * 1.2),
    '--astryx-tab-bar-label-size': px(tabBar.labelSize),
    '--astryx-tab-bar-badge-top': px(tabBar.itemInset + tabBar.badge.offsetY),
    '--astryx-tab-bar-badge-height': px(tabBar.badge.height),
    '--astryx-tab-bar-badge-padding-inline': px(tabBar.badge.paddingInline),
    '--astryx-tab-bar-badge-font-size': px(tabBar.badge.fontSize),
  };
}

/** One box: an item, the lens, an item's icon, a copy. */
function rootVars(style: React.CSSProperties | undefined): TabBarVars {
  return {
    ...style,
    '--astryx-tab-bar-root-inset': px(tabBar.barInset),
  };
}

function badgeVars(start: string): TabBarVars {
  return {'--astryx-tab-bar-badge-start': start};
}

function boxVars(
  start: string,
  top: string,
  width: string,
  height: string,
): TabBarVars {
  return {
    '--astryx-tab-bar-box-start': start,
    '--astryx-tab-bar-box-top': top,
    '--astryx-tab-bar-box-width': width,
    '--astryx-tab-bar-box-height': height,
  };
}

// =============================================================================
// Pieces
// =============================================================================

const ITEM_TOP = px(tabBar.itemInset);
const ITEM_HEIGHT = px(tabBar.itemHeight);
const ICON_START = `calc(50% - ${px(tabBar.iconSize / 2)})`;
const ICON_TOP = px(tabBar.iconCenterY - tabBar.iconSize / 2);
const ICON_SIZE = px(tabBar.iconSize);

/**
 * An item's icon and label, in the plain or the selected look; the lens's
 * copy keeps them out of the accessibility tree.
 */
function ItemFace({
  item,
  isSelectedLook,
  isCopy = false,
}: {
  item: TabBarItemProps;
  isSelectedLook: boolean;
  isCopy?: boolean;
}) {
  return (
    <>
      <span
        aria-hidden
        className={tw(tabBarIconClassName, tabBarBoxClassName)}
        style={boxVars(ICON_START, ICON_TOP, ICON_SIZE, ICON_SIZE)}>
        {isSelectedLook ? (item.selectedIcon ?? item.icon) : item.icon}
      </span>
      <span
        aria-hidden={isCopy || undefined}
        className={tw(
          tabBarLabelClassName,
          tabBarLabelGeometryClassName,
          isSelectedLook && tabBarLabelSelectedClassName,
        )}>
        {item.label}
      </span>
    </>
  );
}

// =============================================================================
// TabBar
// =============================================================================

/*
 * Layout is CSS, so the bar is right before hydration and through a resize.
 * Each button spans to halfway to its neighbours, so a press goes to the
 * nearest item. While the lens moves under a finger, a copy of the items rides
 * in it, so an item half under the lens is half tinted.
 *
 * Past five tabs, More takes the fifth slot at the five-tab layout, as
 * UITabBarController does.
 */
/**
 * The iOS 26 tab bar: the app's top-level sections as a floating capsule at
 * the bottom of the screen. A selection lens slides between them.
 *
 * @example
 * ```
 * <TabBar value={tab} onChange={setTab} onReselect={popToRoot} label="Sections">
 *   <TabBarItem value="home" label="Home" icon={<Icon icon={HomeIcon} />} />
 *   <TabBarItem value="inbox" label="Inbox" icon={<Icon icon={InboxIcon} />} badge={3} />
 * </TabBar>
 * ```
 */
export function TabBar({
  value,
  onChange,
  onReselect,
  label,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  moreValue = 'more',
  children,
  xstyle,
  className,
  style,
  ref,
  ...props
}: TabBarProps) {
  const t = useTranslator();
  // The tab list always has a name, and the aria naming props reach it rather
  // than the root, as TabList's do.
  const tabListLabel =
    ariaLabelledBy != null
      ? undefined
      : (ariaLabel ?? label ?? t('@astryx.tabList.label'));
  const allItems = readItems(children);
  const overflow = overflowItems(children);
  const hasMore = overflow.length > 0;
  // UITabBarController shows four tabs and More past five.
  const items: TabBarItemProps[] = hasMore
    ? [
        ...allItems.slice(0, MAX_TABS - 1),
        {
          value: moreValue,
          label: t('@astryx.tabBar.more'),
          icon: <Icon icon="moreHorizontal" size="lg" />,
        },
      ]
    : allItems;
  const count = items.length;
  // iOS keeps More selected while it shows a tab it holds.
  const isMoreSelected =
    hasMore &&
    (value === moreValue || overflow.some(item => item.value === value));
  const selectedIndex = isMoreSelected
    ? MAX_TABS - 1
    : items.findIndex(item => item.value === value);
  const baseId = useId();

  // UIKit's motion belongs to a finger (a coarse primary pointer, iOS and
  // Android alike). Under a fine pointer a press is a plain button press, and
  // the lens keeps the theme's motion.
  const isTouch = useTouchPresentation().isTouch;

  const capsuleRef = useRef<HTMLDivElement | null>(null);
  const {listRef, handleKeyDown, handleFocus} = useListFocus<HTMLDivElement>({
    itemSelector: '[role="tab"]',
    orientation: 'horizontal',
    hasRovingTabIndex: true,
  });
  const choose = useCallback(
    (item: TabBarItemProps) => {
      if (isDisabledItem(item)) {
        return;
      }
      // More again while it holds a tab returns its list, as iOS pops More's
      // navigation stack: a reselect. Only the selected tab scrolls its panel.
      if (
        item.value === value ||
        (item.value === moreValue && isMoreSelected)
      ) {
        const document = capsuleRef.current?.ownerDocument;
        if (item.value === value && document != null) {
          scrollPanelToTop(document, item.panelId);
        }
        onReselect?.(item.value);
      } else {
        onChange(item.value);
      }
    },
    [value, onChange, onReselect, moreValue, isMoreSelected],
  );
  const lens = useTabBarLens({
    capsuleRef,
    count,
    selectedIndex,
    isTouch,
    onLift: index => choose(items[index]),
    isDisabled: index => isDisabledItem(items[index]),
  });
  const mergedCapsuleRef = useMergedRefs(capsuleRef, listRef, lens.capsule);

  const restIndex = Math.max(selectedIndex, 0);
  const capsuleInset = px(tabBar.itemInset);
  const itemSize = `calc(${itemWidthCss(count)})`;

  return (
    <div
      ref={ref}
      {...mergeProps(
        themeProps('tab-bar'),
        xstyleProps(xstyle),
        tw(tabBarRootClassName, tabBarRootInsetClassName, className),
        rootVars(style),
      )}
      {...props}>
      <div
        ref={mergedCapsuleRef}
        role="tablist"
        aria-label={tabListLabel}
        aria-labelledby={ariaLabelledBy}
        aria-orientation="horizontal"
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        className={tw(tabBarCapsuleClassName, tabBarCapsuleSizeClassName)}
        style={capsuleVars(count)}>
        {items.map((item, index) => {
          const isSelected = index === selectedIndex;
          const isDisabled = isDisabledItem(item);
          const {start, width, itemStart} = column(index, count);
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              id={`${baseId}-tab-${index}`}
              aria-selected={isSelected}
              aria-disabled={isDisabled || undefined}
              aria-controls={item.panelId}
              tabIndex={
                isSelected || (selectedIndex < 0 && index === 0) ? 0 : -1
              }
              // A badge is part of the name: one message with both.
              aria-label={badgedName(item, t)}
              data-tab-bar-value={item.value}
              onClick={() => choose(item)}
              {...mergeProps(
                themeProps('tab-bar-item', {
                  selected: isSelected ? 'selected' : null,
                }),
                stylex.props(tabBarItemMarker),
                tw(tabBarItemClassName, tabBarColumnClassName),
                {
                  '--astryx-tab-bar-column-start': start,
                  '--astryx-tab-bar-column-width': width,
                },
              )}>
              <span
                {...stylex.props(
                  tabBarMarkerStyles.itemBox,
                  tabBarMarkerStyles.pressLayer,
                )}
                className={tw(
                  tabBarItemBoxClassName,
                  // At rest the tab draws its selected look; while the lens
                  // slides, the copy inside it does. A disabled tab is dimmed
                  // whether or not it is selected, so its class comes last.
                  isDisabled
                    ? tabBarItemDisabledClassName
                    : isSelected &&
                        !lens.isCopyShown &&
                        tabBarItemSelectedLookClassName,
                )}
                style={boxVars(itemStart, ITEM_TOP, itemSize, ITEM_HEIGHT)}>
                <ItemFace
                  item={item}
                  isSelectedLook={
                    isSelected && !isDisabled && !lens.isCopyShown
                  }
                />
              </span>
            </button>
          );
        })}
        {selectedIndex >= 0 ? (
          <div
            aria-hidden
            data-tab-bar-lens=""
            className={tw(
              tabBarLensClassName,
              !lens.isCopyShown && tabBarLensUnderClassName,
              tabBarLensRestClassName,
            )}
            style={{
              ...boxVars(capsuleInset, capsuleInset, itemSize, ITEM_HEIGHT),
              '--astryx-tab-bar-lens-offset': lensOffset(restIndex, count),
            }}>
            <div
              ref={lens.body}
              data-tab-bar-lens-body=""
              className={tabBarLensBodyClassName}>
              <div
                ref={lens.clip}
                data-tab-bar-lens-clip=""
                className={tabBarLensClipClassName}>
                {lens.isCopyShown ? (
                  <div
                    ref={lens.copy}
                    data-tab-bar-copy=""
                    className={tabBarCopyInnerClassName}>
                    <div
                      className={tw(
                        tabBarCopyOuterClassName,
                        tabBarCopyOuterGeometryClassName,
                        tabBarCopyRestClassName,
                      )}>
                      {items.map((item, index) => (
                        <span
                          key={item.value}
                          ref={lens.copyItem(index)}
                          data-tab-bar-copy-item={item.value}
                          className={tw(
                            tabBarCopyItemClassName,
                            isDisabledItem(item) && tabBarItemDisabledClassName,
                          )}
                          style={boxVars(
                            `calc(${center(index, count)} - ${itemWidthCss(count)} / 2)`,
                            ITEM_TOP,
                            itemSize,
                            ITEM_HEIGHT,
                          )}>
                          <ItemFace
                            item={item}
                            isSelectedLook={!isDisabledItem(item)}
                            isCopy
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
        <div aria-hidden className={tabBarBadgesClassName}>
          {items.map((item, index) =>
            hasBadge(item.badge) ? (
              <span
                key={item.value}
                data-tab-bar-badge={item.value}
                className={tw(
                  tabBarBadgeClassName,
                  tabBarBadgeGeometryClassName,
                )}
                style={badgeVars(
                  `calc(${center(index, count)} + ${px(tabBar.badge.offsetX)})`,
                )}>
                {item.badge}
              </span>
            ) : null,
          )}
        </div>
      </div>
    </div>
  );
}
