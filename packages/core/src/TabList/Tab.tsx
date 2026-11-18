// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Tab.tsx
 * @input Uses React, StyleX, TabListContext
 * @output Exports Tab component and TabProps type
 * @position Core tab item; renders as button or anchor in navigation with a
 *   divider-overlay selected indicator. Where the TabList speaks the tabs
 *   pattern it is a button with role="tab".
 *
 * SYNC: When modified, update:
 * - /packages/core/src/TabList/TabList.doc.mjs
 * - /packages/core/src/TabList/index.ts
 * - /packages/core/src/TabList/TabList.test.tsx
 * - /packages/cli/assets/templates/blocks/components/TabList/ (showcase blocks)
 */

import React, {useCallback, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import {useTabListContext} from './TabListContext';
import type {TabListSize} from './TabListContext';
import {
  TAB_END_CONTENT_CLASS,
  TAB_ICON_CLASS,
  TAB_LABEL_CONTAINER_CLASS,
  TAB_LABEL_SIZER_CLASS,
  TAB_LABEL_TEXT_CLASS,
  tabClassName,
  tabHoverLayerClassName,
  tabIconSizeClassName,
  tabIndicatorClassName,
} from './tabListClasses';
import {interactionOverlayStyles} from '../utils/interactionOverlay.stylex';
import {usePressFeedback} from '../hooks/usePressFeedback';
import {useLinkComponent} from '../Link/useLinkComponent';
import type {LinkComponentType} from '../Link/types';
import {mergeProps} from '../utils';
import {tw} from '../utils/tw';
import {useDevWarning} from '../hooks/useDevWarning';
import {withholdCallerHandlers} from '../utils/disabledInteraction';
import {EDGE_COMP_ATTR} from '../Layout/edgeCompensation.stylex';
import {themeProps} from '../utils/themeProps';
import {focusOutlineFocusVisibleClassName} from '../utils/focusOutlineClasses';
import {isRenderable} from '../utils/isRenderable';

export interface TabProps extends BaseProps<HTMLButtonElement> {
  /**
   * Custom component to render instead of `<a>` for link tabs.
   * Overrides the provider-level default set by LinkProvider.
   * Only applies when `href` is provided. Must accept href, className, style, and children props.
   */
  as?: LinkComponentType;
  ref?: React.Ref<HTMLButtonElement>;
  /**
   * Unique value for this tab. Matched against TabListContext.value.
   */
  value: string;
  /**
   * Accessible label for this tab. Used as visible text by default, or
   * as aria-label when isLabelHidden is true.
   */
  label: string;
  /**
   * Whether the label is visually hidden. When true, only the icon and
   * endContent are displayed, and label is used as aria-label for accessibility.
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * URL to navigate to. When provided, renders as an anchor element.
   *
   * Ignored in a TabList given an explicit `role="tablist"`: activating a tab
   * there swaps a panel in place, so a tab that navigates would be a false
   * statement.
   */
  href?: string;
  /**
   * Id of the panel this tab controls, wired up as `aria-controls` where the
   * TabList speaks the tabs pattern. Put the same id on the panel element.
   *
   * Has no effect under the navigation pattern, where there is no panel to
   * associate — a development warning says so.
   */
  panelId?: string;
  /**
   * Icon element shown when tab is not selected.
   */
  icon?: ReactNode;
  /**
   * Icon element shown when tab is selected. Falls back to `icon` if not provided.
   */
  selectedIcon?: ReactNode;
  /**
   * Content rendered after the label (e.g. a badge or status dot).
   */
  endContent?: ReactNode;
}

/**
 * Tab item component. Renders as an anchor when `href` is provided,
 * otherwise as a button.
 *
 * @example
 * ```
 * <TabList value={tab} onChange={setTab}>
 *   <Tab value="general" label="General" />
 *   <Tab value="advanced" label="Advanced" />
 * </TabList>
 * ```
 */
export function Tab({
  as,
  ref,
  value,
  label,
  isLabelHidden = false,
  href,
  panelId,
  icon,
  selectedIcon,
  endContent,
  xstyle,
  className,
  style,
  onClick,
  ...restProps
}: TabProps) {
  const pressable = usePressFeedback();
  const tabListCtx = useTabListContext();
  const LinkComponent = useLinkComponent(as);

  const isSelected = tabListCtx.value === value;
  const size: TabListSize = tabListCtx.size;
  const isFill = tabListCtx.layout === 'fill';
  const isTabsPattern = tabListCtx.pattern === 'tabs';
  const isLink = href != null && !isTabsPattern;
  const isTabRole = isTabsPattern && !isLink;
  const displayIcon =
    isSelected && isRenderable(selectedIcon) ? selectedIcon : icon;
  const hasVisibleLabel = !isLabelHidden && label !== '';

  const isDisabled =
    restProps['aria-disabled'] === true ||
    restProps['aria-disabled'] === 'true';

  const handleSelect = useCallback(
    (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
      if (isDisabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event as React.MouseEvent<HTMLButtonElement>);
      if (!event.defaultPrevented) {
        tabListCtx.onChange(value);
      }
    },
    [isDisabled, onClick, tabListCtx, value],
  );

  useDevWarning(
    'Tab',
    'href is ignored in a role="tablist" TabList — a tab swaps a panel in ' +
      'place rather than navigating. Drop the href, or drop the role for the ' +
      'navigation pattern.',
    isTabRole && href != null,
  );

  // A consumer who wired aria-controls by hand already said which panel this
  // is, so panelId is the sugar, not the only way in.
  const controls = panelId ?? restProps['aria-controls'];

  useDevWarning(
    'Tab',
    'a tab in a role="tablist" TabList controls nothing: pass panelId with ' +
      'the id of the panel it opens, so assistive technology can associate ' +
      'the two.',
    isTabRole && controls == null,
  );

  useDevWarning(
    'Tab',
    'panelId does nothing outside a role="tablist" TabList — the navigation ' +
      'pattern has no panel to associate. Give the TabList role="tablist", ' +
      'or drop the panelId.',
    !isTabsPattern && panelId != null,
  );

  const iconElement = isRenderable(displayIcon) ? (
    <span className={tw(TAB_ICON_CLASS, tabIconSizeClassName(size))}>
      {displayIcon}
    </span>
  ) : null;

  const sharedProps = {
    // A disabled tab keeps its tab stop, so the browser still sends it events.
    // It runs no caller handler other than `onFocus` and `onBlur`, as a natively
    // disabled control runs none. `onClick` is guarded in `handleSelect`.
    ...withholdCallerHandlers(restProps, isDisabled),
    ...pressable,
    ...(isLabelHidden ? {'aria-label': label} : {}),
    [EDGE_COMP_ATTR]: '',
    'data-tab-value': value,
    ...(isTabRole
      ? {
          role: 'tab' as const,
          'aria-selected': isSelected,
          // Only when there is a panel to point at: an aria-controls whose
          // target does not exist is an invalid attribute value, which is a
          // worse state than saying nothing. The dev warning above asks for
          // the id instead.
          'aria-controls': controls,
        }
      : {
          // Generic `true` ("the current item within a set"), not `page`: the
          // strip switches views in place at least as often as it navigates,
          // and claiming "current page" when no page changed is a false
          // statement to a screen reader. Stays truthful for the `href` case
          // too, just less specific. A tab role states this with
          // aria-selected instead.
          'aria-current': isSelected ? ('true' as const) : undefined,
        }),
    // Roving tabindex: the tab strip is a single Tab stop. The selected tab is
    // the tabbable one; the rest are reachable via arrow keys (handled by
    // TabList's onKeyDown). When no tab is selected, TabList's repair effect
    // makes the first stop tabbable.
    tabIndex: isSelected ? 0 : -1,
    ...mergeProps(
      themeProps('tab', {
        selected: isSelected ? 'selected' : null,
      }),
      stylex.props(
        // The touch press's strength and release live on the tab the
        // controller writes to; the hover layer inherits and paints it.
        !isDisabled && interactionOverlayStyles.pressedAlpha,
        xstyle,
      ),
      tw(
        tabClassName({size, isSelected, isFill}),
        className,
        focusOutlineFocusVisibleClassName,
      ),
      style,
    ),
  };

  const hoverBgElement = (
    <span aria-hidden="true" className={tabHoverLayerClassName(size)} />
  );

  const indicatorElement = (
    <span
      {...mergeProps(
        themeProps('tab-indicator', {
          selected: isSelected ? 'selected' : null,
        }),
        tabIndicatorClassName({isSelected}),
      )}
    />
  );

  const labelElement = hasVisibleLabel ? (
    <span className={TAB_LABEL_CONTAINER_CLASS}>
      <span className={TAB_LABEL_TEXT_CLASS}>{label}</span>
      <span aria-hidden="true" className={TAB_LABEL_SIZER_CLASS}>
        {label}
      </span>
    </span>
  ) : null;

  const endContentElement = isRenderable(endContent) ? (
    <span className={TAB_END_CONTENT_CLASS}>{endContent}</span>
  ) : null;

  if (isLink) {
    // A disabled link tab must not reach a router component: some routers reject
    // a missing destination, while others treat it as the current route. A
    // plain anchor without href preserves the element shape but cannot navigate.
    const LinkRoot = isDisabled ? 'a' : LinkComponent;
    return (
      <LinkRoot
        ref={ref}
        href={isDisabled ? undefined : href}
        onClick={handleSelect}
        {...sharedProps}>
        {hoverBgElement}
        {iconElement}
        {labelElement}
        {endContentElement}
        {indicatorElement}
      </LinkRoot>
    );
  }

  return (
    <button ref={ref} type="button" onClick={handleSelect} {...sharedProps}>
      {hoverBgElement}
      {iconElement}
      {labelElement}
      {endContentElement}
      {indicatorElement}
    </button>
  );
}

Tab.displayName = 'Tab';
