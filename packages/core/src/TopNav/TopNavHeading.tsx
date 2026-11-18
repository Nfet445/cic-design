// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TopNavHeading.tsx
 * @input Uses React, useRef, useCallback, ReactNode, StyleX, usePopover
 * @output Exports TopNavHeading component and TopNavHeadingProps
 * @position Companion component for TopNav heading slot
 *
 * Product/suite/account heading with smart interaction boundary logic.
 * Mirrors SideNavHeading features: superheading, subheading, menu popover,
 * chevron indicator, and independent link boundaries.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TopNav/TopNav.doc.mjs
 * - /packages/core/src/TopNav/TopNav.test.tsx
 * - /packages/core/src/TopNav/index.ts
 * - /apps/storybook/stories/TopNav.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/TopNav/ (showcase blocks)
 */

import {useMemo, useRef, type ReactNode} from 'react';
import {usePopoverInternal} from '../Popover/usePopover';
import {Link} from '../Link';
import {Icon} from '../Icon';
import {useLinkComponent} from '../Link/useLinkComponent';
import type {LinkComponentType} from '../Link/types';
import {mergeProps} from '../utils';
import {xstyleProps} from '../utils/xstyle';
import {tw} from '../utils/tw';
import {useMergedRefs} from '../hooks/useMergedRefs';
import type {BaseProps} from '../BaseProps';
import {useMenuHover} from '../hooks/useMenuHover';
import {useMenuPress} from '../hooks/useMenuPress';
import {pressOnItemsOnly} from '../hooks/menuPressOnItems';
import {
  dropdownMenuSubMenuTouchClassName,
  dropdownMenuSubMenuTouchPinchClassName,
} from '../DropdownMenu/dropdownMenuSubMenuClasses';
import {useMenuOverflow} from '../DropdownMenu/useMenuOverflow';
import {NavHeadingCloseContext} from '../NavMenu/NavMenuContext';
import {themeProps} from '../utils/themeProps';
import {
  registerEnglishFallback,
  useComponentTranslator,
} from '../i18n/useComponentTranslator';
import english from '../i18n/generated-english/TopNav/TopNavHeading.generated';
import {isRenderable} from '../utils/isRenderable';
import {
  topNavHeadingChevronClassName,
  topNavHeadingChevronGlyphClassName,
  topNavHeadingChevronWithGlyphClassName,
  topNavHeadingColumnsClassName,
  topNavHeadingEndContentClassName,
  topNavHeadingInteractiveClassName,
  topNavHeadingLinkedLineClassName,
  topNavHeadingLogoClassName,
  topNavHeadingMenuTriggerClassName,
  topNavHeadingPopoverAnchorClassName,
  topNavHeadingPopoverChevronWithGlyphClassName,
  topNavHeadingPopoverContentClassName,
  topNavHeadingPopoverHeadingClassName,
  topNavHeadingSupportingLineClassName,
  topNavHeadingTextContainerClassName,
  topNavHeadingTitleClassName,
  topNavHeadingTitleLinkClassName,
  topNavHeadingTitleRowClassName,
  topNavHeadingClassName,
  type TopNavHeadingColumns,
} from './topNavHeadingClasses';

registerEnglishFallback(english);

// =============================================================================
// Types
// =============================================================================

export interface TopNavHeadingProps extends BaseProps<HTMLElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLElement>;
  /**
   * Logo element to display before the heading.
   * Can be an image, NavIcon, or any ReactNode.
   */
  logo?: ReactNode;
  /**
   * Accessible name for the logo when it links somewhere (`headingHref`) and
   * has no adjacent text to name it (for example a logo-only heading). Defaults
   * to `heading` when available. Ignored when the logo is not a link.
   */
  logoLabel?: string;
  /**
   * Product/app name.
   */
  heading?: string;
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
  /**
   * Custom component to render instead of `<a>`.
   * Overrides the provider-level default set by LinkProvider.
   * Must accept href, className, style, and children props.
   */
  as?: LinkComponentType;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Product/suite/account heading for TopNav.
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
 * <TopNavHeading logo={<NavIcon icon={<HomeIcon />} />} heading="My App" headingHref="/" />
 * <TopNavHeading
 *   logo={<NavIcon icon={<SuiteIcon />} />}
 *   superheading="Suite Name"
 *   superheadingHref="/suite"
 *   heading="Product Name"
 *   headingHref="/product"
 *   menu={<ProductSwitcher />}
 * />
 * ```
 */
export function TopNavHeading({
  as,
  logo,
  logoLabel,
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
}: TopNavHeadingProps) {
  const t = useComponentTranslator();
  const LinkComponent = useLinkComponent(as);
  // When the logo is wrapped in a link it needs its own accessible name (the
  // logo image itself is decorative). Prefer an explicit logoLabel, fall back
  // to the heading text. axe: link-name.
  const logoLinkLabel = logoLabel ?? heading;

  const rootRef = useRef<HTMLElement>(null);

  const popover = usePopoverInternal({
    // The menu, not the layer, owns what a touch outside that pans does.
    ownsOutsidePan: true,
    dialogLabel: t('@astryx.topNav.heading.dialogLabel'),
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
  });

  // A press that slides across the product menu's items acts on the item it
  // lifts on, the highlight following the pointer (`family:action-groups`
  // FR1-FR3, FR5); a mouse released outside closes it. Only the role="menu"
  // region is tracked, not the heading above it.
  const productMenuRef = useRef<HTMLDivElement>(null);
  const productMenuPress = useMenuPress({
    menuRef: productMenuRef,
    itemSelector: '[role="menuitem"]:not([aria-disabled="true"])',
    onDismiss: closeMenu,
    isEnabled: !!menu,
  });
  const productMenuPointerDown = pressOnItemsOnly(
    productMenuPress.menuProps.onPointerDown,
    '[role="menuitem"]:not([aria-disabled="true"])',
  );
  const productMenuTouchClassName = useMenuOverflow(
    productMenuRef,
    menu,
    popover.isOpen,
  )
    ? dropdownMenuSubMenuTouchClassName
    : dropdownMenuSubMenuTouchPinchClassName;

  const closeMenuCtx = useMemo(() => ({closeMenu}), [closeMenu]);

  // setTriggerEl belongs on the chevron button, not this root: it is the
  // focus-restore target and a <div> cannot take focus. triggerRef stays here
  // because the panel anchors to the whole heading.
  const setRef = useMergedRefs<HTMLElement>(
    rootRef,
    ref,
    menu ? popover.triggerRef : undefined,
  );

  const showChevron = !!menu;
  const hasAnyHref = !!(headingHref || superheadingHref || subheadingHref);
  // Logo-only has no text column. An empty second track would add the column
  // gap and widen the heading.
  const rootColumns: TopNavHeadingColumns | null =
    !heading && !menu
      ? null
      : isRenderable(logo)
        ? menu
          ? 'withLogoAndMenu'
          : 'withLogo'
        : menu
          ? 'withMenu'
          : 'text';

  // Determine interaction mode
  const isWholeHeadingTrigger = !!menu && !hasAnyHref;
  const isWholeHeadingLink =
    !!headingHref && !menu && !superheadingHref && !subheadingHref;

  // Render text content with optional inline chevron
  const renderTextContent = (inlineChevron?: ReactNode) => (
    <span className={topNavHeadingTextContainerClassName()}>
      {superheading &&
        (hasAnyHref && superheadingHref && menu ? (
          <Link
            href={superheadingHref}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            color="secondary"
            size="xsm"
            className={topNavHeadingLinkedLineClassName()}>
            {superheading}
          </Link>
        ) : (
          <span className={topNavHeadingSupportingLineClassName()}>
            {superheading}
          </span>
        ))}
      <span className={topNavHeadingTitleRowClassName()}>
        {hasAnyHref && headingHref && menu ? (
          <LinkComponent
            href={headingHref}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            className={tw(
              topNavHeadingTitleClassName(),
              topNavHeadingTitleLinkClassName(),
            )}>
            {heading}
          </LinkComponent>
        ) : (
          <span className={topNavHeadingTitleClassName()}>{heading}</span>
        )}
        {inlineChevron}
      </span>
      {subheading &&
        (hasAnyHref && subheadingHref && menu ? (
          <Link
            href={subheadingHref}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            color="secondary"
            size="xsm"
            className={topNavHeadingLinkedLineClassName()}>
            {subheading}
          </Link>
        ) : (
          <span className={topNavHeadingSupportingLineClassName()}>
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
      className={topNavHeadingChevronWithGlyphClassName()}
    />
  );

  const headerEndContentElement = isRenderable(headerEndContent) && (
    <span className={topNavHeadingEndContentClassName()}>
      {headerEndContent}
    </span>
  );

  // Shared popover heading content — uses renderTextContent for consistent
  // sizing, with flipped chevron inline after the title. Always static (no links).
  const popoverHeadingContent = (
    <button
      type="button"
      className={topNavHeadingPopoverHeadingClassName()}
      // A close affordance, not the trigger: dismiss only.
      onClick={closeMenu}>
      {isRenderable(logo) && (
        <span className={topNavHeadingLogoClassName()}>{logo}</span>
      )}
      {renderTextContent(
        <Icon
          icon="chevronDown"
          size="sm"
          color="secondary"
          className={topNavHeadingPopoverChevronWithGlyphClassName()}
        />,
      )}
    </button>
  );

  // Simple: no heading text, just logo (backward compat for logo-only usage)
  if (!heading && !menu) {
    const Element = headingHref ? LinkComponent : 'div';
    return (
      <Element
        ref={ref as React.Ref<HTMLAnchorElement & HTMLDivElement>}
        href={headingHref}
        aria-label={headingHref ? logoLabel : undefined}
        data-testid={testId}
        {...mergeProps(
          themeProps('top-nav-heading'),
          xstyleProps(xstyle),
          tw(
            topNavHeadingClassName(),
            rootColumns && topNavHeadingColumnsClassName(rootColumns),
            !!headingHref && topNavHeadingMenuTriggerClassName(),
            className,
          ),
          style,
        )}
        {...props}>
        {isRenderable(logo) && (
          <span className={topNavHeadingLogoClassName()}>{logo}</span>
        )}
      </Element>
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
          themeProps('top-nav-heading'),
          xstyleProps(xstyle),
          tw(
            topNavHeadingClassName(),
            rootColumns && topNavHeadingColumnsClassName(rootColumns),
            topNavHeadingMenuTriggerClassName(),
            className,
          ),
          style,
        )}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {isRenderable(logo) && (
          <span className={topNavHeadingLogoClassName()}>{logo}</span>
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
            themeProps('top-nav-heading'),
            xstyleProps(xstyle),
            tw(
              topNavHeadingClassName(),
              rootColumns && topNavHeadingColumnsClassName(rootColumns),
              topNavHeadingMenuTriggerClassName(),
              className,
            ),
            style,
          )}>
          {isRenderable(logo) && (
            <span className={topNavHeadingLogoClassName()}>{logo}</span>
          )}
          {renderTextContent(
            // Stays a <button>: this box is the popover trigger, so it carries
            // the accessible name and handlers — only the glyph moves to Icon.
            <button
              ref={setTriggerEl}
              type="button"
              aria-label={t('@astryx.topNav.heading.openMenu', {
                heading: heading ?? '',
                hasHeading: heading ? 'true' : 'false',
              })}
              onClick={e => {
                e.stopPropagation();
                triggerProps.onClick();
              }}
              {...popover.triggerProps}
              className={tw(
                topNavHeadingChevronClassName(),
                topNavHeadingInteractiveClassName(),
              )}>
              <Icon
                icon="chevronDown"
                size="sm"
                color="inherit"
                className={topNavHeadingChevronGlyphClassName()}
              />
            </button>,
          )}
          {headerEndContentElement}
        </div>
        {popover.render(
          <div
            ref={menuRef}
            className={topNavHeadingPopoverContentClassName()}
            {...contentProps}>
            {popoverHeadingContent}
            {/* The menu role is scoped to the actual menu items so the
                heading button above stays a valid sibling, not an invalid
                child of a role="menu" element. */}
            <div
              ref={productMenuRef}
              role="menu"
              aria-label={heading ?? t('@astryx.topNav.heading.dialogLabel')}
              {...productMenuPress.menuProps}
              onPointerDown={productMenuPointerDown}
              className={productMenuTouchClassName}>
              <NavHeadingCloseContext value={closeMenuCtx}>
                {menu}
              </NavHeadingCloseContext>
            </div>
          </div>,
          {
            placement: 'below',
            alignment: 'start',
            className: topNavHeadingPopoverAnchorClassName(),
          },
        )}
      </>
    );
  }

  // Mixed mode: independent links + chevron trigger for menu
  if (menu && hasAnyHref) {
    return (
      <>
        <div
          ref={setRef}
          data-testid={testId}
          {...triggerProps}
          {...mergeProps(
            themeProps('top-nav-heading'),
            xstyleProps(xstyle),
            tw(
              topNavHeadingClassName(),
              rootColumns && topNavHeadingColumnsClassName(rootColumns),
              className,
            ),
            style,
          )}>
          {isRenderable(logo) &&
            (headingHref ? (
              <LinkComponent
                href={headingHref}
                aria-label={logoLinkLabel}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                className={topNavHeadingLogoClassName()}>
                {logo}
              </LinkComponent>
            ) : (
              <span className={topNavHeadingLogoClassName()}>{logo}</span>
            ))}
          {renderTextContent(
            showChevron ? (
              // Stays a <button>: this box is the popover trigger, so it
              // carries the accessible name and handlers — only the glyph
              // moves to Icon.
              <button
                ref={setTriggerEl}
                type="button"
                aria-label={t('@astryx.topNav.heading.openMenu', {
                  heading: heading ?? '',
                  hasHeading: heading ? 'true' : 'false',
                })}
                onClick={e => {
                  e.stopPropagation();
                  triggerProps.onClick();
                }}
                {...popover.triggerProps}
                className={tw(
                  topNavHeadingChevronClassName(),
                  topNavHeadingInteractiveClassName(),
                )}>
                <Icon
                  icon="chevronDown"
                  size="sm"
                  color="inherit"
                  className={topNavHeadingChevronGlyphClassName()}
                />
              </button>
            ) : undefined,
          )}
          {headerEndContentElement}
        </div>
        {popover.render(
          <div
            ref={menuRef}
            className={topNavHeadingPopoverContentClassName()}
            {...contentProps}>
            {popoverHeadingContent}
            {/* The menu role is scoped to the actual menu items so the
                heading button above stays a valid sibling, not an invalid
                child of a role="menu" element. */}
            <div
              ref={productMenuRef}
              role="menu"
              aria-label={heading ?? t('@astryx.topNav.heading.dialogLabel')}
              {...productMenuPress.menuProps}
              onPointerDown={productMenuPointerDown}
              className={productMenuTouchClassName}>
              <NavHeadingCloseContext value={closeMenuCtx}>
                {menu}
              </NavHeadingCloseContext>
            </div>
          </div>,
          {
            placement: 'below',
            alignment: 'start',
            className: topNavHeadingPopoverAnchorClassName(),
          },
        )}
      </>
    );
  }

  // Static heading with independent links (no menu)
  if (hasAnyHref && !isWholeHeadingLink) {
    const linkColumns: TopNavHeadingColumns = isRenderable(logo)
      ? 'withLogoAndLinks'
      : 'withLinks';
    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        data-testid={testId}
        {...mergeProps(
          themeProps('top-nav-heading'),
          xstyleProps(xstyle),
          tw(
            topNavHeadingClassName(),
            topNavHeadingColumnsClassName(linkColumns),
            className,
          ),
          style,
        )}
        {...props}>
        {isRenderable(logo) &&
          (headingHref ? (
            <LinkComponent
              href={headingHref}
              aria-label={logoLinkLabel}
              className={topNavHeadingLogoClassName()}>
              {logo}
            </LinkComponent>
          ) : (
            <span className={topNavHeadingLogoClassName()}>{logo}</span>
          ))}
        <span className={topNavHeadingTextContainerClassName()}>
          {superheading &&
            (superheadingHref ? (
              <Link
                href={superheadingHref}
                color="secondary"
                size="xsm"
                className={topNavHeadingLinkedLineClassName()}>
                {superheading}
              </Link>
            ) : (
              <span className={topNavHeadingSupportingLineClassName()}>
                {superheading}
              </span>
            ))}
          {headingHref ? (
            <Link
              href={headingHref}
              color="primary"
              weight="semibold"
              className={topNavHeadingLinkedLineClassName()}>
              {heading}
            </Link>
          ) : (
            <span className={topNavHeadingTitleClassName()}>{heading}</span>
          )}
          {subheading &&
            (subheadingHref ? (
              <Link
                href={subheadingHref}
                color="secondary"
                size="xsm"
                className={topNavHeadingLinkedLineClassName()}>
                {subheading}
              </Link>
            ) : (
              <span className={topNavHeadingSupportingLineClassName()}>
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
      ref={ref as React.Ref<HTMLDivElement>}
      data-testid={testId}
      {...mergeProps(
        themeProps('top-nav-heading'),
        xstyleProps(xstyle),
        tw(
          topNavHeadingClassName(),
          rootColumns && topNavHeadingColumnsClassName(rootColumns),
          className,
        ),
        style,
      )}
      {...props}>
      {isRenderable(logo) && (
        <span className={topNavHeadingLogoClassName()}>{logo}</span>
      )}
      {renderTextContent()}
      {headerEndContentElement}
      {chevronElement}
    </div>
  );
}

TopNavHeading.displayName = 'TopNavHeading';
