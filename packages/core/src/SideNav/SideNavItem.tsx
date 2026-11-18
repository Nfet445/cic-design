// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SideNavItem.tsx
 * @input Uses React, ReactNode, StyleX, Icon, IconType, useMenuHover
 * @output Exports SideNavItem component and SideNavItemProps
 * @position Core implementation; used inside SideNav children
 *
 * Navigation item with icon, selected state, row-level actions, and nesting.
 * Collapsed icon-only controls use a meaningful consumer `aria-label` when
 * provided and fall back to `label` when it is missing or blank. Their label
 * tooltip binds to the interactive control through a callback ref, so hover,
 * keyboard focus, and `aria-describedby` follow the control from the first
 * collapsed render. A disabled control takes no pointer, so its row listens
 * for the tooltip instead, while the control keeps focus and the description.
 *
 * Collapsed items with children open their submenu flyout through
 * `useMenuHover`, the shared hover-intent hook (same one `SideNavHeading` and
 * `TopNavMenu` use). Hover is a progressive enhancement over the popover's
 * click behavior and is inert on coarse pointers.
 *
 * Nested rows span the full width of the nav list, like top-level rows, so
 * their hover and selected fill lines up with the rows above them. The
 * nesting indent sits inside the row as extra inline-start padding, one step
 * per level, tracked through a private depth context.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/SideNav/SideNav.doc.mjs
 * - /packages/core/src/SideNav/SideNav.test.tsx
 * - /packages/core/src/SideNav/index.ts
 * - /apps/storybook/stories/SideNav.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/SideNav/ (showcase blocks)
 */

import {
  use,
  useCallback,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Icon, renderIconSlot, type IconType} from '../Icon';
import {useLinkComponent} from '../Link/useLinkComponent';
import type {LinkComponentType} from '../Link/types';
import {usePopover} from '../Popover/usePopover';
import {useMenuHover} from '../hooks/useMenuHover';
import {mergeProps} from '../utils';
import {xstyleProps} from '../utils/xstyle';
import type {BaseProps} from '../BaseProps';
import {useTooltip} from '../Tooltip';
import {
  navItemClassName,
  navItemDisabledClassName,
  navItemSelectedClassName,
  navItemSizeClassName,
  type NavItemSize,
} from '../NavItem/navItemClasses';
import {SizeProvider} from '../SizeContext/SizeContext';
import {
  focusOutlineFocusVisibleClassName,
  focusOutlineSuppressedClassName,
  focusOutlineWithinFirstChildClassName,
} from '../utils/focusOutlineClasses';
import {interactionOverlayStyles} from '../utils/interactionOverlay.stylex';
import {interactionOverlayBackgroundColorClassName} from '../utils/interactionOverlayClasses';
import {usePressFeedback} from '../hooks/usePressFeedback';
import {
  useSideNavCollapse,
  SideNavCollapseContext,
} from './SideNavCollapseContext';
import {useSideNavRenderMode} from './SideNavRenderContext';
import {useCloseMobileDrawerOnActivate} from '../AppShell/useCloseMobileDrawerOnActivate';
import {themeProps} from '../utils/themeProps';
import {
  disabledInteractionProps,
  withholdCallerHandlers,
} from '../utils/disabledInteraction';

import {useMergedRefs} from '../hooks/useMergedRefs';
import {SideNavFocusTargetsContext} from './SideNavFocusTargetsContext';
import {
  registerEnglishFallback,
  useComponentTranslator,
} from '../i18n/useComponentTranslator';
import english from '../i18n/generated-english/SideNav/SideNavItem.generated';
import {isRenderable} from '../utils/isRenderable';
import {createSharedContext} from '../utils/sharedContext';
import {tw} from '../utils/tw';
import {
  SIDE_NAV_INDENT_VAR,
  sideNavItemClassName,
  sideNavItemCollapsedSquareClassName,
  sideNavItemIndentClassName,
  sideNavItemPrimaryIndentClassName,
} from './sideNavItemClasses';

registerEnglishFallback(english);
// =============================================================================
// Styles
// =============================================================================

// Nesting indent, drawn inside the row: one `--spacing-6` step per nesting
// level. The row itself stays full width, so its hover and selected fill
// matches a top-level row's. The depth is unbounded, so it reaches the element
// as an inline count and the class computes the padding from it.
// - the row class — the ordinary row, where the row element is the link or
//   button: its own inline-start padding plus the steps.
// - the primary class — the row-wrapper path: the wrapper keeps its base
//   padding and the steps go on the primary link or button, so the whole
//   indent is part of the click target rather than dead space that still shows
//   feedback.
type IndentStyle = React.CSSProperties &
  Partial<Record<typeof SIDE_NAV_INDENT_VAR, string>>;

/** The indent's depth as the inline value its class reads. */
function indentStyle(depth: number): IndentStyle {
  return {[SIDE_NAV_INDENT_VAR]: String(depth)};
}

/**
 * How many SideNavItems deep the current item sits: 0 at the top level,
 * 1 inside one parent, and so on. A collapsed rail's flyout resets it to 0,
 * since the flyout lists a parent's children as its own top level.
 */
const SideNavItemDepthContext = createSharedContext(
  'SideNavItemDepthContext',
  1,
  0,
);
SideNavItemDepthContext.displayName = 'SideNavItemDepthContext';

/**
 * Cascaded to the `actions` slot through `SizeContext` so a consumer's row
 * controls come out the same height as the built-in expand/collapse toggle,
 * the way `SideNav` already cascades one size to its footer icons. An
 * explicit `size` on a supplied control still wins.
 *
 * SYNC: `sideNavItemClassName.toggle` carries the matching box.
 */
const ROW_CONTROL_SIZE = 'sm';

// Non-collapsed state for popover children — ensures nested items render expanded
const EXPANDED_COLLAPSE_STATE = {
  isCollapsed: false,
  toggle: () => {},
  isCollapsible: false,
};

// =============================================================================
// NavItemElement — resolves link vs button based on props
// =============================================================================

interface NavItemElementProps {
  href?: string;
  as?: LinkComponentType;
  isDisabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  ref?: React.Ref<HTMLElement>;
  children: ReactNode;
  [key: string]: unknown;
}

/**
 * Renders `<a>` (via LinkComponent) when `href` is set, otherwise `<button>`.
 * Centralizes the link-vs-button decision used across all SideNavItem paths.
 * A disabled item is a `<button>` that keeps its tab stop and exposes
 * `aria-disabled`, but is inert (spec:AST-085 FR1, FR2).
 */
function NavItemElement({
  href,
  as,
  isDisabled,
  onClick,
  ref,
  children,
  ...rest
}: NavItemElementProps) {
  const LinkComponent = useLinkComponent(as);
  if (href && !isDisabled) {
    return (
      <LinkComponent
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        onClick={onClick}
        {...rest}>
        {children}
      </LinkComponent>
    );
  }
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      onClick={onClick}
      // A disabled item keeps its tab stop, so the browser still sends it events.
      // It runs no caller handler except `onFocus` and `onBlur`.
      {...withholdCallerHandlers(rest, !!isDisabled)}
      {...(isDisabled
        ? {
            'aria-disabled': true,
            ...disabledInteractionProps<HTMLButtonElement>(),
          }
        : null)}>
      {children}
    </button>
  );
}

/** Joins the non-empty ids into one `aria-describedby` value. */
function joinIds(...ids: (string | null | undefined)[]): string | undefined {
  const joined = ids.filter(Boolean).join(' ');
  return joined === '' ? undefined : joined;
}

// =============================================================================
// Types
// =============================================================================

export interface SideNavItemProps extends BaseProps<HTMLElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLElement>;
  /**
   * Custom component to render instead of `<a>` for link items.
   * Overrides the provider-level default set by LinkProvider.
   * Only applies when `href` is provided. Must accept href, className, style, and children props.
   */
  as?: LinkComponentType;
  /**
   * Item label.
   */
  label: string;
  /**
   * Icon (outline variant).
   */
  icon?: ReactNode | IconType;
  /**
   * Icon when selected (filled variant).
   */
  selectedIcon?: ReactNode | IconType;
  /**
   * Current page indicator.
   * @default false
   */
  isSelected?: boolean;
  /**
   * Whether the item is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Navigation URL.
   */
  href?: string;
  /**
   * Click handler.
   */
  onClick?: (e: React.MouseEvent) => void;
  /**
   * Passive right-side content only (badges, counts). Interactive
   * controls (icon buttons, menus) go in `actions`. `endContent`
   * renders inside the primary link or button.
   */
  endContent?: ReactNode;
  /**
   * Row-level secondary controls (icon buttons, menus) rendered as siblings
   * of the primary element at the trailing edge of the row — after the
   * expand/collapse toggle, and before any nested children in DOM and focus
   * order. Content is passthrough: each control owns its accessible name,
   * keyboard behavior, and disabled state. Hidden while the SideNav rail is
   * collapsed.
   *
   * Controls inherit the row's control size through `SizeContext`, so an
   * unsized icon button comes out the same box as the built-in
   * expand/collapse toggle. An explicit `size` still wins.
   */
  actions?: ReactNode;
  /**
   * Sub-items for nesting. Nested items span the full width of the nav
   * list, like top-level items; their content is indented one step per
   * nesting level.
   */
  children?: ReactNode;
  /**
   * Enables collapse behavior for items with children.
   * When true, clicking the item toggles visibility of sub-items.
   *
   * - `true` — collapsible with defaults (starts expanded)
   * - Object — controlled/configured:
   *   - `defaultIsCollapsed` — start collapsed (default: false)
   *   - `isCollapsed` + `onCollapsedChange` — controlled mode
   *
   * @default false
   */
  collapsible?:
    | boolean
    | {
        defaultIsCollapsed?: boolean;
        isCollapsed?: boolean;
        onCollapsedChange?: (isCollapsed: boolean) => void;
      };
  /**
   * Size variant for the nav item.
   * @default 'md'
   */
  size?: NavItemSize;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Navigation item for SideNav.
 *
 * Supports icons, selected state, nesting, and end content like badges or
 * counts. Interactive row-level controls (menus, icon buttons) go in
 * `actions`, which renders them as siblings of the primary element — never
 * nested inside it — before any nested children in DOM and focus order.
 *
 * @example
 * ```
 * <SideNavItem
 *   label="Dashboard"
 *   icon={HomeIcon}
 *   selectedIcon={HomeIconSolid}
 *   isSelected
 *   href="/dashboard"
 * />
 * <SideNavItem label="Settings" icon={CogIcon}>
 *   <SideNavItem label="General" href="/settings/general" />
 *   <SideNavItem label="Security" href="/settings/security" />
 * </SideNavItem>
 * <SideNavItem
 *   label="Projects"
 *   href="/projects"
 *   collapsible
 *   actions={<MoreMenu label="Project actions" items={items} />}>
 *   <SideNavItem label="Alpha" href="/projects/alpha" />
 * </SideNavItem>
 * ```
 */
export function SideNavItem({
  as,
  label,
  icon,
  selectedIcon,
  isSelected = false,
  isDisabled = false,
  href,
  onClick,
  endContent,
  actions,
  children,
  collapsible: itemCollapsible,
  size = 'md',
  'data-testid': testId,
  ref,
  xstyle,
  ...rest
}: SideNavItemProps) {
  // The row (or, collapsed, the trigger/link/button) is the pressable; the
  // expand toggle inside it is its own.
  const pressable = usePressFeedback();
  const t = useComponentTranslator();
  const {isCollapsed} = useSideNavCollapse();
  const renderMode = useSideNavRenderMode();
  const isInDrawer = renderMode === 'drawer' || renderMode === 'drawer-content';
  const closeDrawerAfter = useCloseMobileDrawerOnActivate(isInDrawer);
  const id = useId();
  const hasChildren = !!children;
  const depth = use(SideNavItemDepthContext);

  // Popover for collapsed items with children
  const popover = usePopover({
    hasLightDismiss: true,
    hasAutoFocus: true,
    hasCloseButton: false,
    dialogLabel: t('@astryx.sideNavItem.submenuLabel', {label}),
  });
  const mergedTriggerRef = useMergedRefs(ref, popover.triggerRef);

  // Label tooltip for a collapsed leaf. It binds through a callback ref and
  // its id renders as an `aria-describedby` prop, so both follow the element
  // they describe across re-renders. The hook outlives the collapsed branch,
  // so it is held shut whenever the item is not a collapsed leaf: a tooltip
  // open when the rail expands must not come back on the next collapse.
  const isRailLeaf = isCollapsed && !hasChildren;
  const railTooltip = useTooltip({
    placement: 'end',
    // A disabled leaf's row is the trigger (see the collapsed path). It is not
    // focusable itself, so `auto` would never hear the focus that bubbles up
    // from its control.
    focusTrigger: 'always',
    isEnabled: isRailLeaf,
    isOpen: isRailLeaf ? undefined : false,
  });
  const railLeafRef = useMergedRefs(ref, railTooltip.ref);

  // The row's root registers with its SideNav, so a collapse that removes the
  // focused row can hand focus to the toggle or the nearest row still in the
  // rail (`component:SideNav` AR3).
  const focusTargets = use(SideNavFocusTargetsContext);
  // The collapsed rail renders a top-level row with an icon (FR2).
  const isKeptInRail = !!icon && depth === 0;
  const rowRef = useCallback(
    (element: HTMLDivElement | null) =>
      element == null || focusTargets == null
        ? undefined
        : focusTargets.registerRow(element, isKeptInRail),
    [focusTargets, isKeptInRail],
  );
  const rowTooltipRef = useMergedRefs(rowRef, railTooltip.ref);

  // Collapse state for items with children
  const itemCollapsibleConfig = useMemo(
    () => (typeof itemCollapsible === 'object' ? itemCollapsible : {}),
    [itemCollapsible],
  );
  const isItemCollapsible = hasChildren && itemCollapsible !== false;
  const itemControlledCollapsed = itemCollapsibleConfig.isCollapsed;
  const isItemControlled = itemControlledCollapsed !== undefined;
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(
    itemCollapsibleConfig.defaultIsCollapsed ?? false,
  );
  const isItemCollapsed = isItemControlled
    ? itemControlledCollapsed
    : uncontrolledCollapsed;

  const toggleItemCollapse = useCallback(() => {
    const next = !isItemCollapsed;
    if (!isItemControlled) {
      setUncontrolledCollapsed(next);
    }
    itemCollapsibleConfig.onCollapsedChange?.(next);
  }, [isItemCollapsed, isItemControlled, itemCollapsibleConfig]);

  const displayIcon = isSelected && selectedIcon ? selectedIcon : icon;

  // When collapsible + a primary action (href or onClick), the action and
  // toggle are independent: clicking the label navigates/fires onClick,
  // clicking the chevron expands/collapses children.
  const hasPrimaryAction = !!href || !!onClick;
  const hasIndependentToggle =
    isItemCollapsible && hasPrimaryAction && !isCollapsed;
  const hasActions = !!actions;

  const handleClick = (e: React.MouseEvent) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    if (isItemCollapsible && !hasIndependentToggle && !isCollapsed) {
      e.preventDefault();
      toggleItemCollapse();
      return;
    }
    closeDrawerAfter(onClick)?.(e);
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItemCollapse();
  };

  // Pointer half only. The hook's `onKeyDown`/`menuRef` drive a `useListFocus`
  // over `[role="menuitem"]`, and this flyout is a focus-trapped dialog of
  // links — wiring them would swallow arrow keys rather than navigate with
  // them. Keyboard stays with `usePopover`'s trap, as in DropdownMenuSubMenu.
  const {triggerProps: hoverTriggerProps, contentProps: hoverContentProps} =
    useMenuHover({
      show: popover.show,
      hide: popover.hide,
      isOpen: popover.isOpen,
      isEnabled: isCollapsed && hasChildren,
      // Standard popover toggling: the flyout opens beside the rail, not over
      // the icon, so the click after a hover-open is a deliberate dismissal
      // rather than the #3121 confirmation the nav menus need.
      clickGuardMs: 0,
      ownsFocus: false,
    });

  // In collapsed mode: hide items without icons
  if (isCollapsed && !icon) {
    return null;
  }

  // =========================================================================
  // Collapsed mode — icon-only items, popover for items with children
  // =========================================================================
  if (isCollapsed) {
    const collapsedIcon =
      displayIcon &&
      renderIconSlot(displayIcon, {
        size: 'sm',
        // `inherit` so a selected row's icon follows the row to HighlightText
        // under forced colors. Identical to `primary` otherwise: both token
        // families are emitted from one expression.
        color: isSelected ? 'inherit' : isDisabled ? 'disabled' : 'secondary',
      });

    // Shared collapsed item styles — used by trigger, link, and button.
    // All three render a focusable element, so each draws the shared ring.
    const collapsedItemStyles = {
      ...mergeProps(
        themeProps('side-nav-item', {
          size,
          selected: isSelected ? 'selected' : null,
          disabled: isDisabled ? 'disabled' : null,
        }),
        stylex.props(
          // The strength and the release; the colour is a class below.
          interactionOverlayStyles.pressedAlpha,
        ),
        // Spread after `rest`, so keep the caller's class beside these.
        tw(
          navItemClassName(),
          sideNavItemCollapsedSquareClassName(size),
          sideNavItemClassName.collapsedItem,
          isSelected && navItemSelectedClassName(),
          isDisabled && navItemDisabledClassName(),
          rest.className,
          interactionOverlayBackgroundColorClassName,
          focusOutlineFocusVisibleClassName,
        ),
      ),
      ...pressable,
    };

    const collapsedAccessibleLabel =
      rest['aria-label'] != null && rest['aria-label'].trim() !== ''
        ? rest['aria-label']
        : label;

    // Items with children: popover trigger + popover
    if (hasChildren) {
      return (
        <div
          ref={rowRef}
          {...mergeProps(xstyleProps(xstyle), sideNavItemClassName.root)}>
          <button
            ref={mergedTriggerRef}
            type="button"
            {...rest}
            {...hoverTriggerProps}
            aria-label={collapsedAccessibleLabel}
            data-testid={testId}
            {...popover.triggerProps}
            {...collapsedItemStyles}>
            {collapsedIcon}
          </button>
          {popover.render(
            <div
              className={sideNavItemClassName.popoverSurface}
              onMouseEnter={hoverContentProps.onMouseEnter}
              onMouseLeave={hoverContentProps.onMouseLeave}
              onClick={() => popover.hide()}>
              <div className={sideNavItemClassName.popoverHeader}>{label}</div>
              <SideNavCollapseContext value={EXPANDED_COLLAPSE_STATE}>
                <SideNavItemDepthContext value={0}>
                  {children}
                </SideNavItemDepthContext>
              </SideNavCollapseContext>
            </div>,
            {
              placement: 'end',
              alignment: 'start',
              className: sideNavItemClassName.popoverGap,
            },
          )}
        </div>
      );
    }

    // Items without children: icon-only link or button, its label in a
    // tooltip. The control is the trigger, so the element that takes focus is
    // the one described. A disabled control takes no pointer
    // (`navItemDisabledClassName`), so its row listens for the tooltip instead;
    // the control still takes focus (focusin reaches the row) and stays the
    // element described (spec:AST-085 FR5).
    const isRowTrigger = isDisabled;
    const collapsedAriaProps = {
      'aria-current': isSelected ? ('page' as const) : undefined,
      'aria-describedby': joinIds(
        rest['aria-describedby'],
        railTooltip.describedBy,
      ),
      'aria-disabled': isDisabled || undefined,
      'aria-label': collapsedAccessibleLabel,
      'data-testid': testId,
    };

    const collapsedElement = (
      <NavItemElement
        ref={isRowTrigger ? ref : railLeafRef}
        href={href}
        as={as}
        isDisabled={isDisabled}
        onClick={handleClick}
        {...rest}
        {...collapsedAriaProps}
        {...collapsedItemStyles}>
        {collapsedIcon}
      </NavItemElement>
    );

    return (
      <div
        ref={isRowTrigger ? rowTooltipRef : rowRef}
        {...mergeProps(xstyleProps(xstyle), sideNavItemClassName.root)}>
        {collapsedElement}
        {railTooltip.renderTooltip(label)}
      </div>
    );
  }

  const itemContent = (
    <>
      {displayIcon &&
        renderIconSlot(displayIcon, {
          size: 'sm',
          // `inherit` — see the collapsed path above.
          color: isSelected ? 'inherit' : isDisabled ? 'disabled' : 'secondary',
        })}
      {!isCollapsed && (
        <span className={sideNavItemClassName.label}>{label}</span>
      )}
      {!isCollapsed && isRenderable(endContent) && (
        <span className={sideNavItemClassName.endContent}>{endContent}</span>
      )}
      {!isCollapsed && isItemCollapsible && !hasIndependentToggle && (
        <Icon
          icon="chevronDown"
          size="lg"
          color="inherit"
          className={tw(
            sideNavItemClassName.chevron,
            sideNavItemClassName.chevronInRow,
            !isItemCollapsed && sideNavItemClassName.chevronExpanded,
          )}
        />
      )}
    </>
  );

  const itemThemeProps = themeProps('side-nav-item', {
    size,
    selected: isSelected ? 'selected' : null,
    disabled: isDisabled ? 'disabled' : null,
  });

  const itemStyleArgs = [
    // The strength and the release; the colour is a class below.
    interactionOverlayStyles.pressedAlpha,
  ] as const;
  const rowIndent =
    depth > 0 && sideNavItemIndentClassName(size === 'sm' ? 'sm' : 'md');
  const primaryIndent = depth > 0 && sideNavItemPrimaryIndentClassName();

  // The indent is a runtime value, so it reaches the element as an inline
  // custom property. These props are spread after `rest`, so fold the caller's
  // `style` back in (caller wins) rather than letting the indent replace it,
  // and the caller's `className` beside the row's own classes.
  const callerStyle = {className: rest.className, style: rest.style};
  const rowIndentStyle = depth > 0 ? indentStyle(depth) : undefined;
  const indentedStyle = rowIndentStyle
    ? {...rowIndentStyle, ...callerStyle.style}
    : callerStyle.style;

  // Three shapes of the same row appearance:
  // - `rowProps` — split-action path (toggle, no actions): presentational
  //   <div>; the ring belongs on each child tab stop.
  // - `focusableRowProps` — ordinary row: the row element is the control.
  // - `actionsRowProps` — same pill, but the ring is drawn for the primary
  //   only. The wrapper is not a tab stop, so `:focus-visible` on it would
  //   never match, and matching any descendant instead would light the whole
  //   row around the chevron's or an action's own ring.
  const rowProps = {
    ...mergeProps(
      itemThemeProps,
      stylex.props(...itemStyleArgs),
      tw(
        navItemClassName(),
        navItemSizeClassName(size),
        isSelected && navItemSelectedClassName(),
        isDisabled && navItemDisabledClassName(),
        interactionOverlayBackgroundColorClassName,
      ),
    ),
    ...pressable,
  };
  const focusableRowProps = {
    ...mergeProps(
      itemThemeProps,
      stylex.props(...itemStyleArgs),
      tw(
        navItemClassName(),
        navItemSizeClassName(size),
        isSelected && navItemSelectedClassName(),
        isDisabled && navItemDisabledClassName(),
        rowIndent,
        callerStyle.className,
        interactionOverlayBackgroundColorClassName,
        focusOutlineFocusVisibleClassName,
      ),
      indentedStyle,
    ),
    ...pressable,
  };
  const actionsRowProps = {
    ...mergeProps(
      itemThemeProps,
      stylex.props(...itemStyleArgs),
      tw(
        navItemClassName(),
        navItemSizeClassName(size),
        isSelected && navItemSelectedClassName(),
        isDisabled && navItemDisabledClassName(),
        interactionOverlayBackgroundColorClassName,
        focusOutlineWithinFirstChildClassName,
      ),
    ),
    ...pressable,
  };

  // Row-wrapper path: primary element + row controls as siblings.
  //
  // Used when the row carries more than one control: an independent
  // expand/collapse toggle (collapsible + href/onClick), consumer-supplied
  // actions, or both. A <div> is the styled flex row; the primary link or
  // button, the chevron toggle, and the actions slot render as siblings so
  // no interactive element nests inside another, and every row-level
  // control precedes the nested children group in DOM and focus order.
  const hasRowWrapper = hasIndependentToggle || hasActions;

  let itemElement;

  if (hasRowWrapper) {
    // aria-expanded/-controls stay on the primary element only when the
    // whole row is the collapse toggle (no independent chevron button).
    const rowPrimaryAriaProps = hasIndependentToggle
      ? {'aria-current': isSelected ? ('page' as const) : undefined}
      : {
          'aria-current': isSelected ? ('page' as const) : undefined,
          'aria-disabled': isDisabled || undefined,
          'aria-expanded': isItemCollapsible ? !isItemCollapsed : undefined,
          'aria-controls': isItemCollapsible ? `${id}-children` : undefined,
        };

    itemElement = (
      <div data-testid={testId} {...(hasActions ? actionsRowProps : rowProps)}>
        <NavItemElement
          ref={ref}
          href={href}
          as={as}
          isDisabled={isDisabled}
          onClick={handleClick}
          {...rest}
          {...rowPrimaryAriaProps}
          {...mergeProps(
            tw(
              primaryIndent,
              sideNavItemClassName.splitAction,
              callerStyle.className,
              // The wrapper rings for this element; suppressing here is what
              // keeps the UA's own ring from painting inside that one.
              hasActions
                ? focusOutlineSuppressedClassName
                : focusOutlineFocusVisibleClassName,
            ),
            // Second argument is a props object, so the style rides in one.
            indentedStyle ? {style: indentedStyle} : {},
          )}>
          {itemContent}
        </NavItemElement>
        {hasIndependentToggle && (
          <button
            type="button"
            onClick={handleToggleClick}
            aria-label={
              isItemCollapsed
                ? t('@astryx.sideNavItem.expand', {label})
                : t('@astryx.sideNavItem.collapse', {label})
            }
            aria-expanded={!isItemCollapsed}
            aria-controls={`${id}-children`}
            {...mergeProps(
              pressable,
              stylex.props(
                // The strength and the release; the colour is a class below.
                interactionOverlayStyles.pressedAlpha,
              ),
              tw(
                sideNavItemClassName.toggle,
                interactionOverlayBackgroundColorClassName,
                focusOutlineFocusVisibleClassName,
              ),
            )}>
            <Icon
              icon="chevronDown"
              size="lg"
              color="inherit"
              className={tw(
                sideNavItemClassName.chevron,
                !isItemCollapsed && sideNavItemClassName.chevronExpanded,
              )}
            />
          </button>
        )}
        {hasActions && (
          /* eslint-disable-next-line @astryx/no-style-only-wrapper -- SizeProvider renders no element, so the slot box lives on this span; the rule reads StyleX objects, not class text. */
          <span className={sideNavItemClassName.actions}>
            <SizeProvider value={ROW_CONTROL_SIZE}>{actions}</SizeProvider>
          </span>
        )}
      </div>
    );
  } else {
    const ariaProps = {
      'aria-current': isSelected ? ('page' as const) : undefined,
      'aria-disabled': isDisabled || undefined,
      'aria-expanded': isItemCollapsible ? !isItemCollapsed : undefined,
      'aria-controls': isItemCollapsible ? `${id}-children` : undefined,
      'data-testid': testId,
    };

    itemElement = (
      <NavItemElement
        ref={ref}
        href={href}
        as={as}
        isDisabled={isDisabled}
        onClick={handleClick}
        {...rest}
        {...ariaProps}
        {...focusableRowProps}>
        {itemContent}
      </NavItemElement>
    );
  }

  const item = (
    <div
      ref={rowRef}
      {...mergeProps(xstyleProps(xstyle), sideNavItemClassName.root)}>
      {itemElement}
      {hasChildren && !isCollapsed && (
        <div
          id={`${id}-children`}
          role="group"
          aria-labelledby={`${id}-label`}
          aria-hidden={isItemCollapsed}
          inert={isItemCollapsed ? true : undefined}
          className={tw(
            sideNavItemClassName.childrenGroup,
            isItemCollapsed
              ? sideNavItemClassName.childrenGroupCollapsed
              : sideNavItemClassName.childrenGroupExpanded,
          )}>
          <div className={sideNavItemClassName.childrenInner}>
            <span id={`${id}-label`} hidden>
              {label}
            </span>
            <SideNavItemDepthContext value={depth + 1}>
              {children}
            </SideNavItemDepthContext>
          </div>
        </div>
      )}
    </div>
  );

  return item;
}

SideNavItem.displayName = 'SideNavItem';
