// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SideNavHeading.tsx
 * @input Uses React, useRef, useCallback, ReactNode, StyleX, Tailwind classes,
 *        usePopover, useMenuHover
 * @output Exports SideNavHeading component and SideNavHeadingProps
 * @position Core implementation; used inside SideNav header slot
 *
 * Product/suite/account heading with smart interaction boundary logic.
 * Composes usePopover internally when menu prop is provided.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/SideNav/SideNav.doc.mjs
 * - /packages/core/src/SideNav/SideNav.test.tsx
 * - /packages/core/src/SideNav/index.ts
 * - /apps/storybook/stories/SideNav.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/SideNav/ (showcase blocks)
 */

import {useMemo, useRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
// TODO(#264): Lazy-load usePopover so the popover/layer bundle is not
// eagerly imported when `menu` is not provided. See Text for an example
// of lazy loading layer resources.
import {usePopoverInternal} from '../Popover/usePopover';
import {Link} from '../Link';
import {Icon} from '../Icon';
import {Tooltip} from '../Tooltip';
import {navItemClassName} from '../NavItem/navItemClasses';
import {focusOutlineFocusVisibleClassName} from '../utils/focusOutlineClasses';
import {interactionOverlayStyles} from '../utils/interactionOverlay.stylex';
import {interactionOverlayBackgroundColorClassName} from '../utils/interactionOverlayClasses';
import {usePressFeedback} from '../hooks/usePressFeedback';
import {useSideNavCollapse} from './SideNavCollapseContext';
import {useLinkComponent} from '../Link/useLinkComponent';
import type {LinkComponentType} from '../Link/types';
import {mergeProps} from '../utils';
import {xstyleProps} from '../utils/xstyle';
import {useMergedRefs} from '../hooks/useMergedRefs';
import type {BaseProps} from '../BaseProps';
import {useMenuHover} from '../hooks/useMenuHover';
import {useMenuPress} from '../hooks/useMenuPress';
import {pressOnItemsOnly} from '../hooks/menuPressOnItems';
import {useMenuOverflow} from '../DropdownMenu/useMenuOverflow';
import {
  dropdownMenuSubMenuTouchClassName,
  dropdownMenuSubMenuTouchPinchClassName,
} from '../DropdownMenu/dropdownMenuSubMenuClasses';
import {
  NavHeadingCloseContext,
  NavHeadingDismissContext,
} from '../NavMenu/NavMenuContext';
import {themeProps} from '../utils/themeProps';
import {
  registerEnglishFallback,
  useComponentTranslator,
} from '../i18n/useComponentTranslator';
import english from '../i18n/generated-english/SideNav/SideNavHeading.generated';
import {isRenderable} from '../utils/isRenderable';
import {tw} from '../utils/tw';
import {sideNavHeadingClassName} from './sideNavHeadingClasses';

registerEnglishFallback(english);

// =============================================================================
// Constants
// =============================================================================

/** The rows a press can act on in the heading's menu. */
const HEADING_MENU_ITEM_SELECTOR =
  '[role="menuitem"]:not([aria-disabled="true"])';

// =============================================================================
// Types
// =============================================================================

export interface SideNavHeadingProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Product/app icon.
   */
  icon?: ReactNode;
  /**
   * Custom component to render instead of `<a>`.
   * Overrides the provider-level default set by LinkProvider.
   * Must accept href, className, style, and children props.
   */
  as?: LinkComponentType;
  /**
   * Product/app name.
   */
  heading: string;
  /**
   * Link for the heading (e.g., product home).
   */
  headingHref?: string;
  /**
   * Text above the heading (e.g., suite name).
   */
  superheading?: string;
  /**
   * Link for the superheading (e.g., suite home).
   */
  superheadingHref?: string;
  /**
   * Text below the heading (e.g., account context).
   */
  subheading?: string;
  /**
   * Link for the subheading.
   */
  subheadingHref?: string;
  /**
   * Content rendered at the trailing edge of the heading row.
   * Hidden in collapsed mode.
   */
  headerEndContent?: ReactNode;
  /**
   * Menu content shown in a popover. When provided, the header composes
   * usePopover internally and shows a dropdown chevron. The trigger
   * boundary is determined automatically:
   * - No hrefs → whole header is the trigger
   * - With hrefs → links are independent, chevron/remaining area is the trigger
   */
  menu?: ReactNode;
}

// =============================================================================

// =============================================================================
// Component
// =============================================================================

/**
 * Product/suite/account heading for SideNav.
 *
 * Supports smart interaction boundary logic:
 * - No hrefs + menu → whole heading is the popover trigger
 * - headingHref only, no menu → whole heading is one link
 * - headingHref + superheadingHref, no menu → each is an independent link
 * - menu + hrefs → links are independent, chevron/remaining area is the trigger
 *
 * The chevron indicator is automatically shown when `menu` is provided.
 *
 * @example
 * ```
 * <SideNavHeading icon={<AppIcon />} heading="My App" headingHref="/" />
 * <SideNavHeading
 *   icon={<SuiteIcon />}
 *   superheading="Suite Name"
 *   superheadingHref="/suite"
 *   heading="Product Name"
 *   headingHref="/product"
 *   menu={<ProductSwitcher />}
 * />
 * <SideNavHeading
 *   icon={<AppIcon />}
 *   heading="Product Name"
 *   subheading="Business Account"
 *   menu={<AccountSwitcher />}
 * />
 * ```
 */
export function SideNavHeading({
  as,
  icon,
  heading,
  headingHref,
  superheading,
  superheadingHref,
  subheading,
  subheadingHref,
  headerEndContent,
  menu,
  xstyle,
  className,
  style,
  'data-testid': testId,
  ref,
  ...props
}: SideNavHeadingProps) {
  const pressable = usePressFeedback();
  const t = useComponentTranslator();
  const LinkComponent = useLinkComponent(as);
  const {isCollapsed} = useSideNavCollapse();
  const rootRef = useRef<HTMLDivElement>(null);
  const collapsedItemRef = useRef<HTMLElement>(null);

  const popover = usePopoverInternal({
    // The menu, not the layer, owns what a touch outside that pans does.
    ownsOutsidePan: true,
    dialogLabel: t('@astryx.sideNav.heading.dialogLabel'),
    // The popup exposes its own role="menu" semantics; a role="dialog"
    // aria-modal wrapper would announce "dialog, Navigation menu" around a
    // menu (the anti-pattern removed in a478a3dcf).
    role: 'none',
    hasCloseButton: false,
  });

  const {
    triggerProps,
    contentProps,
    menuRef,
    setTriggerEl,
    close: closeMenu,
  } = useMenuHover<HTMLDivElement>({
    show: popover.show,
    hide: popover.hide,
    isOpen: popover.isOpen,
    isEnabled: !!menu,
    showDelay: 0,
    // Collapsed, the flyout opens beside the icon button, so a press on the
    // button lands outside the auto popover and the browser would light-dismiss
    // a hover-open before the click guard can confirm it. Expanded, the panel
    // overlaps the heading, and the trigger is a <div> whose click must not be
    // default-prevented: it holds the heading's own links.
    popoverId: isCollapsed ? popover.id : undefined,
  });

  // A press that slides across the menu's items acts on the item it lifts on,
  // the highlight following the pointer (`family:action-groups` FR1-FR3,
  // FR5); a mouse released outside closes it. Only the role="menu" region is
  // tracked, not the heading button above it.
  const headingMenuRef = useRef<HTMLDivElement>(null);
  const headingMenuPress = useMenuPress({
    menuRef: headingMenuRef,
    itemSelector: HEADING_MENU_ITEM_SELECTOR,
    onDismiss: closeMenu,
    isEnabled: !!menu,
  });
  const headingMenuPointerDown = pressOnItemsOnly(
    headingMenuPress.menuProps.onPointerDown,
    HEADING_MENU_ITEM_SELECTOR,
  );
  const dismissCtx = useMemo(() => ({dismiss: closeMenu}), [closeMenu]);
  const headingMenuTouchClassName = useMenuOverflow(
    headingMenuRef,
    menu,
    popover.isOpen,
  )
    ? dropdownMenuSubMenuTouchClassName
    : dropdownMenuSubMenuTouchPinchClassName;

  const closeMenuCtx = useMemo(() => ({closeMenu}), [closeMenu]);

  // setTriggerEl belongs on the chevron button, not this root: it is the
  // focus-restore target and a <div> cannot take focus. triggerRef stays here
  // because the panel anchors to the whole heading.
  const setRef = useMergedRefs<HTMLDivElement>(
    rootRef,
    ref,
    menu ? popover.triggerRef : undefined,
  );
  const collapsedSetRef = useMergedRefs<HTMLElement>(
    collapsedItemRef,
    ref,
    // Collapsed, this button is the trigger, so it takes both roles.
    menu ? popover.triggerRef : undefined,
    menu ? setTriggerEl : undefined,
  );

  // In collapsed mode: hide if no icon, show icon-only if has icon. Icon
  // presence follows `isRenderable` (`architecture:react-component-runtime`
  // INV16), so `0` is an icon like any other content.
  if (isCollapsed && !isRenderable(icon)) {
    return null;
  }
  if (isCollapsed) {
    const collapsedIcon = (
      <span className={sideNavHeadingClassName.icon}>{icon}</span>
    );

    let collapsedElement: ReactNode;

    if (headingHref) {
      collapsedElement = (
        <LinkComponent
          ref={collapsedSetRef as React.Ref<HTMLAnchorElement>}
          href={headingHref}
          aria-label={heading}
          {...pressable}
          data-testid={testId}
          {...mergeProps(
            themeProps('side-nav-heading'),
            stylex.props(
              // The strength and the release; the colour is a class below.
              interactionOverlayStyles.pressedAlpha,
            ),
            tw(
              navItemClassName(),
              sideNavHeadingClassName.collapsedRoot,
              className,
              interactionOverlayBackgroundColorClassName,
              focusOutlineFocusVisibleClassName,
              xstyleProps(xstyle).className,
            ),
            {...xstyleProps(xstyle).style, ...style},
          )}>
          {collapsedIcon}
        </LinkComponent>
      );
    } else if (menu) {
      collapsedElement = (
        <>
          <button
            ref={collapsedSetRef}
            type="button"
            aria-label={heading}
            {...pressable}
            data-testid={testId}
            {...popover.triggerProps}
            {...triggerProps}
            {...mergeProps(
              themeProps('side-nav-heading'),
              stylex.props(
                // The strength and the release; the colour is a class below.
                interactionOverlayStyles.pressedAlpha,
              ),
              tw(
                navItemClassName(),
                sideNavHeadingClassName.collapsedRoot,
                sideNavHeadingClassName.menuTrigger,
                className,
                interactionOverlayBackgroundColorClassName,
                focusOutlineFocusVisibleClassName,
                xstyleProps(xstyle).className,
              ),
              {...xstyleProps(xstyle).style, ...style},
            )}>
            {collapsedIcon}
          </button>
          {popover.render(
            <div
              ref={menuRef}
              className={sideNavHeadingClassName.popoverContent}
              {...contentProps}>
              <button
                type="button"
                className={tw(
                  sideNavHeadingClassName.popoverHeading,
                  focusOutlineFocusVisibleClassName,
                )}
                // A close affordance, not the trigger: dismiss only.
                onClick={closeMenu}>
                {isRenderable(icon) && (
                  <span className={sideNavHeadingClassName.icon}>{icon}</span>
                )}
                <span className={sideNavHeadingClassName.textContainer}>
                  {superheading && (
                    <span className={sideNavHeadingClassName.supportingLine}>
                      {superheading}
                    </span>
                  )}
                  <span className={sideNavHeadingClassName.headingRow}>
                    <span className={sideNavHeadingClassName.heading}>
                      {heading}
                    </span>
                    <Icon
                      icon="chevronDown"
                      size="sm"
                      color="secondary"
                      className={sideNavHeadingClassName.popoverChevron}
                    />
                  </span>
                  {subheading && (
                    <span className={sideNavHeadingClassName.supportingLine}>
                      {subheading}
                    </span>
                  )}
                </span>
              </button>
              {/* The menu role is scoped to the actual menu items so the
                  heading button above stays a valid sibling, not an invalid
                  child of a role="menu" element. */}
              <div
                ref={headingMenuRef}
                role="menu"
                aria-label={heading}
                {...headingMenuPress.menuProps}
                onPointerDown={headingMenuPointerDown}
                className={headingMenuTouchClassName}>
                <NavHeadingCloseContext value={closeMenuCtx}>
                  {menu}
                </NavHeadingCloseContext>
              </div>
            </div>,
            {
              placement: 'below',
              alignment: 'start',
              className: sideNavHeadingClassName.popover,
            },
          )}
        </>
      );
    } else {
      collapsedElement = (
        <div
          ref={collapsedSetRef}
          data-testid={testId}
          {...mergeProps(
            themeProps('side-nav-heading'),
            xstyleProps(xstyle),
            tw(sideNavHeadingClassName.collapsedRoot, className),
            style,
          )}
          {...props}>
          {collapsedIcon}
        </div>
      );
    }

    return (
      <>
        {collapsedElement}
        <Tooltip
          content={heading}
          placement="end"
          anchorRef={collapsedItemRef}
        />
      </>
    );
  }

  const showChevron = !!menu;
  const hasAnyHref = !!(headingHref || superheadingHref || subheadingHref);

  // Determine interaction mode
  const isWholeHeadingTrigger = !!menu && !hasAnyHref;
  const isWholeHeadingLink =
    !!headingHref && !menu && !superheadingHref && !subheadingHref;

  // Render text content with optional inline chevron
  const renderTextContent = (inlineChevron?: ReactNode) => (
    <span className={sideNavHeadingClassName.textContainer}>
      {superheading &&
        (hasAnyHref && superheadingHref && menu ? (
          <Link href={superheadingHref} color="secondary" size="xsm">
            {superheading}
          </Link>
        ) : (
          <span className={sideNavHeadingClassName.supportingLine}>
            {superheading}
          </span>
        ))}
      <span className={sideNavHeadingClassName.headingRow}>
        {hasAnyHref && headingHref && menu ? (
          <LinkComponent
            href={headingHref}
            className={tw(
              sideNavHeadingClassName.heading,
              sideNavHeadingClassName.headingLink,
              focusOutlineFocusVisibleClassName,
            )}>
            {heading}
          </LinkComponent>
        ) : (
          <span className={sideNavHeadingClassName.heading}>{heading}</span>
        )}
        {inlineChevron}
      </span>
      {subheading &&
        (hasAnyHref && subheadingHref && menu ? (
          <Link href={subheadingHref} color="secondary" size="xsm">
            {subheading}
          </Link>
        ) : (
          <span className={sideNavHeadingClassName.supportingLine}>
            {subheading}
          </span>
        ))}
    </span>
  );

  const chevronElement = showChevron && (
    <Icon
      icon="chevronDown"
      size="sm"
      color="secondary"
      className={sideNavHeadingClassName.chevron}
    />
  );

  const headerEndContentElement = isRenderable(headerEndContent) && (
    <span className={sideNavHeadingClassName.headerEndContent}>
      {headerEndContent}
    </span>
  );

  // Shared popover heading content — uses renderTextContent for consistent
  // sizing, with flipped chevron inline after the title. Always static (no links).
  const popoverHeadingContent = (
    <button
      type="button"
      className={tw(
        sideNavHeadingClassName.popoverHeading,
        focusOutlineFocusVisibleClassName,
      )}
      // A close affordance, not the trigger: dismiss only.
      onClick={closeMenu}>
      {isRenderable(icon) && (
        <span className={sideNavHeadingClassName.icon}>{icon}</span>
      )}
      {renderTextContent(
        <Icon
          icon="chevronDown"
          size="sm"
          color="secondary"
          className={sideNavHeadingClassName.popoverChevron}
        />,
      )}
    </button>
  );

  // Whole heading is a link (no menu, single headingHref). End content may
  // be a control, which must not sit inside the link (no interactive content
  // in an <a>), so with end content the row is a div holding the link and the
  // end content side by side, as the mixed mode does.
  if (isWholeHeadingLink && headingHref && headerEndContentElement) {
    return (
      <div
        ref={ref}
        data-testid={testId}
        {...mergeProps(
          themeProps('side-nav-heading'),
          xstyleProps(xstyle),
          tw(sideNavHeadingClassName.root, className),
          style,
        )}>
        <LinkComponent
          href={headingHref}
          className={tw(
            sideNavHeadingClassName.linkBesideEndContent,
            sideNavHeadingClassName.menuTrigger,
            focusOutlineFocusVisibleClassName,
          )}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
          {isRenderable(icon) && (
            <span className={sideNavHeadingClassName.icon}>{icon}</span>
          )}
          {renderTextContent()}
        </LinkComponent>
        {headerEndContentElement}
      </div>
    );
  }

  // Whole heading is a link (no menu, single headingHref)
  if (isWholeHeadingLink && headingHref) {
    return (
      <LinkComponent
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={headingHref}
        data-testid={testId}
        {...mergeProps(
          themeProps('side-nav-heading'),
          xstyleProps(xstyle),
          tw(
            sideNavHeadingClassName.root,
            sideNavHeadingClassName.menuTrigger,
            className,
            focusOutlineFocusVisibleClassName,
          ),
          style,
        )}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {isRenderable(icon) && (
          <span className={sideNavHeadingClassName.icon}>{icon}</span>
        )}
        {renderTextContent()}
        {headerEndContentElement}
        {chevronElement}
      </LinkComponent>
    );
  }

  // Whole header is the popover trigger (menu, no hrefs)
  if (isWholeHeadingTrigger) {
    return (
      <>
        <div
          ref={setRef}
          data-testid={testId}
          {...triggerProps}
          {...mergeProps(
            themeProps('side-nav-heading'),
            xstyleProps(xstyle),
            tw(
              sideNavHeadingClassName.root,
              sideNavHeadingClassName.menuTrigger,
              className,
            ),
            style,
          )}>
          {isRenderable(icon) && (
            <span className={sideNavHeadingClassName.icon}>{icon}</span>
          )}
          {renderTextContent(
            <button
              ref={setTriggerEl}
              type="button"
              aria-label={t('@astryx.sideNav.heading.openMenu', {heading})}
              onClick={e => {
                e.stopPropagation();
                triggerProps.onClick();
              }}
              {...popover.triggerProps}
              className={tw(
                sideNavHeadingClassName.chevron,
                sideNavHeadingClassName.interactive,
                focusOutlineFocusVisibleClassName,
              )}>
              <Icon
                icon="chevronDown"
                size="sm"
                color="inherit"
                className={sideNavHeadingClassName.chevronGlyph}
              />
            </button>,
          )}
          {headerEndContentElement}
        </div>
        {popover.render(
          <div
            ref={menuRef}
            className={sideNavHeadingClassName.popoverContent}
            {...contentProps}>
            {popoverHeadingContent}
            {/* The menu role is scoped to the actual menu items so the
                heading button above stays a valid sibling, not an invalid
                child of a role="menu" element. */}
            <div
              ref={headingMenuRef}
              role="menu"
              aria-label={heading}
              {...headingMenuPress.menuProps}
              onPointerDown={headingMenuPointerDown}
              className={headingMenuTouchClassName}>
              <NavHeadingDismissContext value={dismissCtx}>
                {menu}
              </NavHeadingDismissContext>
            </div>
          </div>,
          {
            placement: 'below',
            alignment: 'start',
            className: sideNavHeadingClassName.popoverOverlap,
          },
        )}
      </>
    );
  }

  // Mixed mode: independent links + chevron trigger for menu
  // Popover anchors to the full heading div, not the chevron, so it
  // appears in the same position as the no-links case.
  if (menu && hasAnyHref) {
    return (
      <>
        <div
          ref={setRef}
          data-testid={testId}
          {...triggerProps}
          {...mergeProps(
            themeProps('side-nav-heading'),
            xstyleProps(xstyle),
            tw(sideNavHeadingClassName.root, className),
            style,
          )}>
          {isRenderable(icon) &&
            (headingHref ? (
              <LinkComponent
                href={headingHref}
                aria-label={heading}
                className={tw(
                  sideNavHeadingClassName.icon,
                  focusOutlineFocusVisibleClassName,
                )}>
                {icon}
              </LinkComponent>
            ) : (
              <span className={sideNavHeadingClassName.icon}>{icon}</span>
            ))}
          {renderTextContent(
            showChevron ? (
              <button
                ref={setTriggerEl}
                type="button"
                aria-label={t('@astryx.sideNav.heading.openMenu', {heading})}
                onClick={e => {
                  e.stopPropagation();
                  triggerProps.onClick();
                }}
                {...popover.triggerProps}
                className={tw(
                  sideNavHeadingClassName.chevron,
                  sideNavHeadingClassName.interactive,
                  focusOutlineFocusVisibleClassName,
                )}>
                <Icon
                  icon="chevronDown"
                  size="sm"
                  color="inherit"
                  className={sideNavHeadingClassName.chevronGlyph}
                />
              </button>
            ) : undefined,
          )}
          {headerEndContentElement}
        </div>
        {popover.render(
          <div
            ref={menuRef}
            className={sideNavHeadingClassName.popoverContent}
            {...contentProps}>
            {popoverHeadingContent}
            {/* The menu role is scoped to the actual menu items so the
                heading button above stays a valid sibling, not an invalid
                child of a role="menu" element. */}
            <div
              ref={headingMenuRef}
              role="menu"
              aria-label={heading}
              {...headingMenuPress.menuProps}
              onPointerDown={headingMenuPointerDown}
              className={headingMenuTouchClassName}>
              <NavHeadingDismissContext value={dismissCtx}>
                {menu}
              </NavHeadingDismissContext>
            </div>
          </div>,
          {
            placement: 'below',
            alignment: 'start',
            className: sideNavHeadingClassName.popoverOverlap,
          },
        )}
      </>
    );
  }

  // Static heading with independent links (no menu)
  if (hasAnyHref && !isWholeHeadingLink) {
    return (
      <div
        ref={ref}
        data-testid={testId}
        {...mergeProps(
          themeProps('side-nav-heading'),
          xstyleProps(xstyle),
          tw(sideNavHeadingClassName.root, className),
          style,
        )}
        {...props}>
        {isRenderable(icon) &&
          (headingHref ? (
            <LinkComponent
              href={headingHref}
              aria-label={heading}
              className={tw(
                sideNavHeadingClassName.icon,
                focusOutlineFocusVisibleClassName,
              )}>
              {icon}
            </LinkComponent>
          ) : (
            <span className={sideNavHeadingClassName.icon}>{icon}</span>
          ))}
        <span className={sideNavHeadingClassName.textContainer}>
          {superheading &&
            (superheadingHref ? (
              <Link href={superheadingHref} color="secondary" size="xsm">
                {superheading}
              </Link>
            ) : (
              <span className={sideNavHeadingClassName.supportingLine}>
                {superheading}
              </span>
            ))}
          {headingHref ? (
            <Link href={headingHref} color="primary" weight="semibold">
              {heading}
            </Link>
          ) : (
            <span className={sideNavHeadingClassName.heading}>{heading}</span>
          )}
          {subheading &&
            (subheadingHref ? (
              <Link href={subheadingHref} color="secondary" size="xsm">
                {subheading}
              </Link>
            ) : (
              <span className={sideNavHeadingClassName.supportingLine}>
                {subheading}
              </span>
            ))}
        </span>
        {headerEndContentElement}
        {chevronElement}
      </div>
    );
  }

  // Default: static heading, no links, no menu
  return (
    <div
      ref={ref}
      data-testid={testId}
      {...mergeProps(
        themeProps('side-nav-heading'),
        xstyleProps(xstyle),
        tw(sideNavHeadingClassName.root, className),
        style,
      )}
      {...props}>
      {isRenderable(icon) && (
        <span className={sideNavHeadingClassName.icon}>{icon}</span>
      )}
      {renderTextContent()}
      {headerEndContentElement}
      {chevronElement}
    </div>
  );
}

SideNavHeading.displayName = 'SideNavHeading';
