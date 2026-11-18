// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Card.tsx
 * @input Uses container utility, StyleX, Tailwind utilities for the surface
 * @output Exports Card component, CardProps, CardVariant types
 * @position Core card container component
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Card/Card.doc.mjs (props table, features)
 * - /packages/core/src/Card/index.ts (exports if types change)
 * - /apps/storybook/stories/Card.stories.tsx (storybook stories)
 * - /packages/cli/assets/templates/blocks/components/Card/ (showcase blocks)
 */

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {container} from '../Layout/containerClasses';
import {containerCornerClassName} from '../Layout/containerCornersClasses';
import type {SpacingToken} from '../Layout/containerClasses';
import {spacingStepToToken} from '../Layout/padding.stylex';
import type {Elevation, SizeValue, SpacingStep} from '../utils/types';
import {mergeProps} from '../utils';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';
import type {CardVariantMap} from './index';
import {
  cardBorderClassName,
  cardClassName,
  cardCornersClassName,
  cardElevationClassName,
  cardOverflowClassName,
  cardSizeVars,
  cardSizingClassName,
  cardVariantClassName,
} from './cardClasses';
import {cardBorderStyles} from './cardBorder.stylex';
import {tw} from '../utils/tw';

// =============================================================================
// Variant type
// =============================================================================

/**
 * Background color variant for Card, derived from CardVariantMap.
 * Extensible via module augmentation of CardVariantMap.
 *
 * - `default`: standard card background with visible border
 * - `transparent`: no background, no visible border — for grouping content without visual weight
 * - `muted`: subtle muted background for de-emphasised cards
 * - Non-semantic palette: `blue | cyan | gray | green | orange | pink | purple | red | teal | yellow`
 *   Each uses the corresponding `--color-background-<name>` token (20% opacity tint).
 *
 * Only `default` draws a visible border. Its border width is subtracted from
 * the padding so the total inset (border + padding) equals the padding token —
 * keeping content geometry faithful to the spacing scale and identical to the
 * borderless variants. Themes can override borderWidth/borderColor.
 */
export type CardVariant = keyof CardVariantMap;

/** The inline sizing custom properties the sizing classes read. */
type CardStyle = React.CSSProperties &
  Partial<Record<(typeof cardSizeVars)[keyof typeof cardSizeVars], string>>;

export type {SizeValue} from '../utils/types';

export interface CardProps extends BaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Width of the card.
   * Numbers are treated as pixels, strings are used as-is.
   */
  width?: SizeValue;

  /**
   * Height of the card.
   * Numbers are treated as pixels, strings are used as-is.
   */
  height?: SizeValue;

  /**
   * Maximum width of the card.
   * Numbers are treated as pixels, strings are used as-is.
   */
  maxWidth?: SizeValue;

  /**
   * Minimum height of the card.
   * Numbers are treated as pixels, strings are used as-is.
   */
  minHeight?: SizeValue;

  /**
   * Content to render inside the card.
   * Should typically be Layout child components.
   */
  children?: ReactNode;

  /**
   * Internal padding of the card using the spacing scale.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   *
   * Omit it and the card takes the theme's card padding rather than a step, so
   * passing a step is a decision to override the theme, not a way to restate
   * the default.
   *
   * @default the theme's card padding (spacing step 4 with no theme)
   */
  padding?: SpacingStep;

  /**
   * Background color variant.
   * - `default`: standard card background with visible border
   * - `transparent`: no background, no visible border — for grouping without visual weight
   * - `muted`: subtle muted background for de-emphasised cards
   * - Non-semantic: `blue`, `cyan`, `gray`, `green`, `orange`, `pink`, `purple`, `red`, `teal`, `yellow`
   * @default 'default'
   */
  variant?: CardVariant;

  /**
   * Resting elevation — the shadow depth the card sits at.
   * `none` is flat; `low`/`med`/`high` map to the shadow token scale.
   * @default 'none'
   */
  elevation?: Elevation;
}

/**
 * A card container with border and themed styling.
 *
 * Applies card-specific appearance (background, border, border-radius)
 * and sets CSS variables for child layout components.
 *
 * @compositionHint Use as a top-level container for elevated content.
 * Pair with Layout for structured header/content/footer layouts.
 *
 * @example
 * ```
 * <Card width={400} height={300}>
 *   <Layout
 *     header={<LayoutHeader hasDivider>Title</LayoutHeader>}
 *     content={<LayoutContent>Content</LayoutContent>}
 *     footer={<LayoutFooter hasDivider>Actions</LayoutFooter>}
 *   />
 * </Card>
 * ```
 *
 * @example
 * ```
 * <Card variant="blue" width={300}>
 *   <p>Blue tinted card</p>
 * </Card>
 * ```
 *
 * @example
 * ```
 * <Card variant="muted" width={300}>
 *   <p>Subtle de-emphasised card</p>
 * </Card>
 * ```
 */
export function Card({
  width,
  height,
  maxWidth,
  minHeight,
  children,
  padding,
  variant = 'default',
  elevation = 'none',
  xstyle,
  className,
  style,
  ref,
  ...props
}: CardProps) {
  // Only enable scrolling when card has a fixed height (not null/undefined and not "auto")
  const hasFixedHeight = height != null && height !== 'auto';

  // When no explicit padding prop, use theme default (set via container tokens)
  const useThemeDefault = padding == null;
  const paddingToken = useThemeDefault
    ? undefined
    : (spacingStepToToken[padding] as SpacingToken);

  // Sizing goes through CSS variables so a consumer class can override it: an
  // inline `width` would beat every class, a class-level `width` would not.
  const sizingVars: CardStyle = {
    ...(width != null && {
      [cardSizeVars.width]: typeof width === 'number' ? `${width}px` : width,
    }),
    ...(height != null && {
      [cardSizeVars.height]:
        typeof height === 'number' ? `${height}px` : height,
    }),
    ...(maxWidth != null && {
      [cardSizeVars.maxWidth]:
        typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
    }),
    ...(minHeight != null && {
      [cardSizeVars.minHeight]:
        typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
    }),
  };

  return (
    <div
      ref={ref}
      {...mergeProps(
        mergeProps(themeProps('card', {variant, elevation}), {
          className: tw(
            cardClassName,
            // A theme's own variant is not a key here: the lookup is
            // undefined, the class is dropped, and the theme rule paints over
            // the base surface.
            cardVariantClassName[variant],
            cardElevationClassName[elevation],
            cardOverflowClassName({hasFixedHeight}),
            cardSizingClassName({width, height, maxWidth, minHeight}),
            cardCornersClassName,
            containerCornerClassName,
            container(
              paddingToken == null
                ? {useThemeDefault: 'card'}
                : {
                    paddingInnerX: paddingToken,
                    paddingInnerY: paddingToken,
                    paddingOuterX: paddingToken,
                    paddingOuterY: paddingToken,
                  },
            ),
            variant === 'default' && cardBorderClassName,
          ),
          style: sizingVars,
        }),
        stylex.props(
          // The border-inset padding reads the --container-padding-* vars the
          // container class above publishes. It stays a StyleX rule so it
          // outranks them.
          variant === 'default' && cardBorderStyles.padding,
          xstyle,
        ),
        className,
        style,
      )}
      {...props}>
      {children}
    </div>
  );
}

Card.displayName = 'Card';
