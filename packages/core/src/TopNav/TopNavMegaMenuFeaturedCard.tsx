// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TopNavMegaMenuFeaturedCard.tsx
 * @input Uses React, StyleX, theme tokens
 * @output Exports TopNavMegaMenuFeaturedCard component
 * @position Standard featured card for the TopNavMegaMenu featured slot.
 *
 * Provides a consistent appearance for promotional/featured content in mega menus.
 * The `featured` slot on TopNavMegaMenu is still open ReactNode — this component
 * is the standard card, but consumers can pass anything.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TopNav/TopNav.doc.mjs
 * - /packages/core/src/TopNav/index.ts
 * - /packages/cli/assets/templates/blocks/components/TopNav/ (showcase blocks)
 */

import React, {type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {mergeProps} from '../utils/mergeProps';
import {tw} from '../utils/tw';
import {RTL_MIRROR_CLASS} from '../utils/rtlClasses';
import {
  topNavFeaturedCardBodyClassName,
  topNavFeaturedCardClassName,
  topNavFeaturedCardDescriptionClassName,
  topNavFeaturedCardImageClassName,
  topNavFeaturedCardLinkArrowClassName,
  topNavFeaturedCardLinkClassName,
  topNavFeaturedCardTitleClassName,
} from './topNavMegaMenuFeaturedCardClasses';
import type {BaseProps} from '../BaseProps';
import {useLinkComponent} from '../Link/useLinkComponent';
import {themeProps} from '../utils/themeProps';

// =============================================================================
// Types
// =============================================================================

export interface TopNavMegaMenuFeaturedCardProps extends BaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  /** Card title. */
  title: string;
  /** Description text below the title. */
  description?: string;
  /** Optional image URL displayed above the body. */
  image?: string;
  /**
   * Alt text for the image.
   *
   * When omitted, the image is explicitly decorative (`alt=""` +
   * `role="presentation"` + `aria-hidden`, matching Avatar) and hidden from
   * assistive technology. Since the card already has a visible `title`, a
   * decorative image is usually correct; pass `imageAlt` only when the image
   * conveys information beyond the title and description.
   */
  imageAlt?: string;
  /** CTA link text. */
  linkLabel?: string;
  /** CTA link URL. */
  linkHref?: string;
  /** Custom content rendered below the standard body. */
  children?: ReactNode;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Standard featured card for the TopNavMegaMenu `featured` slot.
 *
 * Provides a consistent card with optional image, title, description,
 * and CTA link. For fully custom content, pass any ReactNode directly
 * to the `featured` slot instead.
 *
 * @example
 * ```
 * <TopNavMegaMenu
 *   label="Products"
 *   items={...}
 *   featured={
 *     <TopNavMegaMenuFeaturedCard
 *       title="What's new in v4.0"
 *       description="AI-powered analytics and real-time collaboration."
 *       image="https://example.com/promo.jpg"
 *       imageAlt="Team collaboration"
 *       linkLabel="Read the announcement"
 *       linkHref="/blog/v4"
 *     />
 *   }
 * />
 * ```
 */
export function TopNavMegaMenuFeaturedCard({
  ref,
  title,
  description,
  image,
  imageAlt,
  linkLabel,
  linkHref,
  children,
  xstyle,
  className,
  style,
  ...rest
}: TopNavMegaMenuFeaturedCardProps) {
  const LinkComponent = useLinkComponent();
  return (
    <div
      ref={ref}
      {...mergeProps(
        themeProps('top-nav-mega-menu-featured-card'),
        stylex.props(xstyle),
        tw(topNavFeaturedCardClassName(), className),
        style,
      )}
      {...rest}>
      {image && (
        // Without `imageAlt`, the image is explicitly decorative rather than
        // silently empty-alt, matching Avatar's handling of unnamed images.
        // Usually correct here: the card already has a visible title.
        <img
          src={image}
          alt={imageAlt ?? ''}
          role={imageAlt ? undefined : 'presentation'}
          aria-hidden={imageAlt ? undefined : true}
          className={topNavFeaturedCardImageClassName()}
        />
      )}
      <div className={topNavFeaturedCardBodyClassName()}>
        <span className={topNavFeaturedCardTitleClassName()}>{title}</span>
        {description && (
          <span className={topNavFeaturedCardDescriptionClassName()}>
            {description}
          </span>
        )}
        {linkLabel && linkHref && (
          <LinkComponent
            href={linkHref}
            className={topNavFeaturedCardLinkClassName()}>
            {linkLabel}{' '}
            {/* The arrow points toward the inline end, so it mirrors in RTL
                (design:bidirectionality DR4); U+2192 is not bidi-mirrored. */}
            <span
              className={tw(
                RTL_MIRROR_CLASS,
                topNavFeaturedCardLinkArrowClassName(),
              )}>
              →
            </span>
          </LinkComponent>
        )}
        {children}
      </div>
    </div>
  );
}

TopNavMegaMenuFeaturedCard.displayName = 'TopNavMegaMenuFeaturedCard';
