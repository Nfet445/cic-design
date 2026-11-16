// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Section.tsx
 * @input Uses container utility, StyleX
 * @output Exports Section component and SectionProps
 * @position Core section container component
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Section/Section.doc.mjs (props table, features)
 * - /packages/core/src/Section/index.ts (exports if types change)
 * - /apps/storybook/stories/Section.stories.tsx (storybook stories)
 * - /packages/cli/assets/templates/blocks/components/Section/ (showcase blocks)
 */

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import {container} from '../Layout/container.stylex';
import type {SpacingToken} from '../Layout/container.stylex';
import {
  paddingStyles,
  paddingInlineStyles,
  paddingInlineStartStyles,
  paddingInlineEndStyles,
  paddingBlockStyles,
  paddingBlockStartStyles,
  paddingBlockEndStyles,
  containerPaddingInlineVarStyles,
  containerPaddingInlineStartVarStyles,
  containerPaddingInlineEndVarStyles,
  containerPaddingBlockStartVarStyles,
  containerPaddingBlockEndVarStyles,
  sectionPaddingPropagationStyles,
  spacingStepToToken,
} from '../Layout/padding.stylex';
import type {SizeValue, SpacingStep} from '../utils/types';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';
import {tw} from '../utils/tw';
import {
  sectionInnerClassName,
  sectionOuterClassName,
  sectionSizeVars,
} from './sectionClasses';
import type {SectionVariantMap} from './index';

/**
 * Visual variant for the section.
 * Extensible via module augmentation of SectionVariantMap.
 */
export type SectionVariant = keyof SectionVariantMap;

/** The inline sizing custom properties the sizing classes read. */
type SectionSizingStyle = React.CSSProperties &
  Partial<
    Record<(typeof sectionSizeVars)[keyof typeof sectionSizeVars], string>
  >;

/** A size prop as the inline value its class reads; a number is pixels. */
function sectionSizeStyle({
  height,
  maxWidth,
  minHeight,
  width,
}: {
  height?: SizeValue;
  maxWidth?: SizeValue;
  minHeight?: SizeValue;
  width?: SizeValue;
}): SectionSizingStyle {
  const style: SectionSizingStyle = {};
  if (width != null) {
    style[sectionSizeVars.width] =
      typeof width === 'number' ? `${width}px` : width;
  }
  if (height != null) {
    style[sectionSizeVars.height] =
      typeof height === 'number' ? `${height}px` : height;
  }
  if (maxWidth != null) {
    style[sectionSizeVars.maxWidth] =
      typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth;
  }
  if (minHeight != null) {
    style[sectionSizeVars.minHeight] =
      typeof minHeight === 'number' ? `${minHeight}px` : minHeight;
  }
  return style;
}

export interface SectionProps extends BaseProps<HTMLElement> {
  ref?: React.Ref<HTMLElement>;
  /**
   * Visual variant of the section.
   * - 'section': Surface background color
   * - 'transparent': Fully transparent background
   * - 'muted': Muted background color
   * @default 'section'
   */
  variant?: SectionVariant;

  /**
   * Width of the section.
   * Numbers are treated as pixels, strings are used as-is.
   */
  width?: SizeValue;

  /**
   * Height of the section.
   * Numbers are treated as pixels, strings are used as-is.
   */
  height?: SizeValue;

  /**
   * Maximum width of the section.
   * Numbers are treated as pixels, strings are used as-is.
   */
  maxWidth?: SizeValue;

  /**
   * Minimum height of the section.
   * Numbers are treated as pixels, strings are used as-is.
   */
  minHeight?: SizeValue;

  /**
   * Content to render inside the section.
   * Should typically be Layout child components.
   */
  children?: ReactNode;

  /**
   * Which sides should have divider borders.
   * Use 'start'/'end' for horizontal (respects RTL).
   * @example
   * ```
   * dividers={['top', 'bottom']}
   * ```
   */
  dividers?: ('top' | 'bottom' | 'start' | 'end')[];

  /**
   * Internal padding of the section using the spacing scale.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   * @default 4 (16px)
   */
  padding?: SpacingStep;
  /**
   * Inline (horizontal) padding override. When set, overrides only the inline
   * axis padding while preserving block padding from `padding` or the
   * container theme default.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   */
  paddingInline?: SpacingStep;
  /**
   * Inline-start padding override. Logical: the left edge in LTR, the right
   * edge in RTL. Takes precedence over `paddingInline` and `padding` on that
   * edge only; every other edge is left alone.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   */
  paddingInlineStart?: SpacingStep;
  /**
   * Inline-end padding override. Logical: the right edge in LTR, the left
   * edge in RTL. Takes precedence over `paddingInline` and `padding` on that
   * edge only; every other edge is left alone.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   */
  paddingInlineEnd?: SpacingStep;
  /**
   * Block (vertical) padding override. When set, overrides only the block
   * axis padding while preserving inline padding from `padding` or the
   * container theme default.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   */
  paddingBlock?: SpacingStep;
  /**
   * Block-start (top) padding override. Takes precedence over `paddingBlock`
   * and `padding` on that edge only; the block-end edge and both inline edges
   * are left alone.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   */
  paddingBlockStart?: SpacingStep;
  /**
   * Block-end (bottom) padding override. Takes precedence over `paddingBlock`
   * and `padding` on that edge only; the block-start edge and both inline
   * edges are left alone.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   */
  paddingBlockEnd?: SpacingStep;
}

/**
 * A section container with background variants.
 *
 * Applies section-specific appearance based on the variant prop
 * and sets CSS variables for child layout components.
 *
 * @compositionHint Use inside Card to create visually distinct regions.
 * Sections automatically escape parent container padding for edge-to-edge fills.
 *
 * @example
 * ```
 * <Section variant="muted" width={300} height={250}>
 *   <Layout
 *     content={<LayoutContent>Content in muted section</LayoutContent>}
 *   />
 * </Section>
 * ```
 */
export function Section({
  variant = 'section',
  width,
  height,
  maxWidth,
  minHeight,
  children,
  dividers,
  padding,
  paddingInline,
  paddingInlineStart,
  paddingInlineEnd,
  paddingBlock,
  paddingBlockStart,
  paddingBlockEnd,
  xstyle,
  className,
  style,
  ref,
  ...props
}: SectionProps) {
  // When no explicit padding prop, use theme default (set via container tokens)
  const useThemeDefault = padding == null;
  const effectivePadding = padding ?? 4;
  const paddingToken = spacingStepToToken[effectivePadding] as SpacingToken;
  const xstyleProps = stylex.props(xstyle);
  const outerInlineStyle: React.CSSProperties = {
    ...xstyleProps.style,
    ...sectionSizeStyle({height, maxWidth, minHeight, width}),
  };

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      className={
        tw(
          sectionOuterClassName({height, maxWidth, minHeight, width}),
          xstyleProps.className,
          className,
        ) || undefined
      }
      style={style ? {...outerInlineStyle, ...style} : outerInlineStyle}
      {...props}>
      <div
        {...mergeProps(
          mergeProps(themeProps('section', {variant}), {
            className: sectionInnerClassName({dividers, variant}),
          }),
          stylex.props(
            ...container(
              useThemeDefault
                ? {useThemeDefault: 'section'}
                : {
                    paddingInnerX: paddingToken,
                    paddingInnerY: paddingToken,
                    paddingOuterX: paddingToken,
                    paddingOuterY: paddingToken,
                  },
            ),
            !useThemeDefault &&
              effectivePadding !== 4 &&
              paddingStyles[effectivePadding],
            !useThemeDefault &&
              effectivePadding !== 4 &&
              containerPaddingInlineVarStyles[effectivePadding],
            !useThemeDefault &&
              effectivePadding !== 4 &&
              containerPaddingBlockStartVarStyles[effectivePadding],
            !useThemeDefault &&
              effectivePadding !== 4 &&
              containerPaddingBlockEndVarStyles[effectivePadding],
            !useThemeDefault &&
              sectionPaddingPropagationStyles[effectivePadding],
            paddingInline != null && paddingInlineStyles[paddingInline],
            paddingInline != null &&
              containerPaddingInlineVarStyles[paddingInline],
            paddingBlock != null && paddingBlockStyles[paddingBlock],
            paddingBlock != null &&
              containerPaddingBlockStartVarStyles[paddingBlock],
            paddingBlock != null &&
              containerPaddingBlockEndVarStyles[paddingBlock],
            // Per-edge overrides come last so they win over `paddingBlock`
            // and `padding` on their own edge. The matching container var is
            // updated alongside so bleed children (Table, Divider, nested
            // Section) compensate against the padding actually applied.
            paddingBlockStart != null &&
              paddingBlockStartStyles[paddingBlockStart],
            paddingBlockStart != null &&
              containerPaddingBlockStartVarStyles[paddingBlockStart],
            paddingBlockEnd != null && paddingBlockEndStyles[paddingBlockEnd],
            paddingBlockEnd != null &&
              containerPaddingBlockEndVarStyles[paddingBlockEnd],
            paddingInlineStart != null &&
              paddingInlineStartStyles[paddingInlineStart],
            paddingInlineStart != null &&
              containerPaddingInlineStartVarStyles[paddingInlineStart],
            paddingInlineEnd != null &&
              paddingInlineEndStyles[paddingInlineEnd],
            paddingInlineEnd != null &&
              containerPaddingInlineEndVarStyles[paddingInlineEnd],
          ),
        )}>
        {children}
      </div>
    </div>
  );
}

Section.displayName = 'Section';
