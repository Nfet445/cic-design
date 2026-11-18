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
import type {BaseProps} from '../BaseProps';
import {
  containerBaseClassName,
  containerThemeDefaultPaddingClassName,
} from '../Layout/containerClasses';
import {
  containerPaddingByEdgeClassName,
  containerVariableClassName,
  sectionPaddingClassName,
} from '../Layout/paddingClasses';
import type {ContainerVariable} from '../Layout/paddingClasses';
import type {SizeValue, SpacingStep} from '../utils/types';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';
import {tw} from '../utils/tw';
import {xstyleProps} from '../utils/xstyle';
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
  // One value per edge: an axis prop covers its two edges, a per-edge prop
  // wins over it, and `padding` covers what none of them set.
  const paddingEdges = {
    paddingBlockEnd:
      paddingBlockEnd ??
      paddingBlock ??
      (useThemeDefault ? undefined : effectivePadding),
    paddingBlockStart:
      paddingBlockStart ??
      paddingBlock ??
      (useThemeDefault ? undefined : effectivePadding),
    paddingInlineEnd:
      paddingInlineEnd ??
      paddingInline ??
      (useThemeDefault ? undefined : effectivePadding),
    paddingInlineStart:
      paddingInlineStart ??
      paddingInline ??
      (useThemeDefault ? undefined : effectivePadding),
  };
  // One class decides each variable: an edge a prop names takes that step, and
  // an edge none names keeps the theme's chain. `paddingEdges` has already
  // resolved which edges the props cover.
  const themeDefaultPadding = containerThemeDefaultPaddingClassName.section;
  const edgePaddingClassName = (
    variable: ContainerVariable,
    step: SpacingStep | undefined,
  ) =>
    step == null
      ? themeDefaultPadding[variable]
      : containerVariableClassName(variable, step);
  const containerPadding = useThemeDefault
    ? tw(
        edgePaddingClassName(
          'containerPaddingInlineStart',
          paddingEdges.paddingInlineStart,
        ),
        edgePaddingClassName(
          'containerPaddingInlineEnd',
          paddingEdges.paddingInlineEnd,
        ),
        edgePaddingClassName(
          'containerPaddingBlockStart',
          paddingEdges.paddingBlockStart,
        ),
        edgePaddingClassName(
          'containerPaddingBlockEnd',
          paddingEdges.paddingBlockEnd,
        ),
        themeDefaultPadding.layoutPaddingOuterX,
        themeDefaultPadding.layoutPaddingOuterY,
        themeDefaultPadding.layoutPaddingInnerX,
        themeDefaultPadding.layoutPaddingInnerY,
      )
    : tw(
        containerPaddingByEdgeClassName(paddingEdges),
        containerVariableClassName('layoutPaddingOuterX', effectivePadding),
        containerVariableClassName('layoutPaddingOuterY', effectivePadding),
        containerVariableClassName('layoutPaddingInnerX', effectivePadding),
        containerVariableClassName('layoutPaddingInnerY', effectivePadding),
      );

  const xStyle = xstyleProps(xstyle);
  const outerInlineStyle: React.CSSProperties = {
    ...xStyle.style,
    ...sectionSizeStyle({height, maxWidth, minHeight, width}),
  };

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      className={
        tw(
          sectionOuterClassName({height, maxWidth, minHeight, width}),
          xStyle.className,
          className,
        ) || undefined
      }
      style={style ? {...outerInlineStyle, ...style} : outerInlineStyle}
      {...props}>
      <div
        {...mergeProps(themeProps('section', {variant}), {
          className: tw(
            sectionInnerClassName({dividers, variant}),
            containerBaseClassName,
            !useThemeDefault && sectionPaddingClassName(effectivePadding),
            containerPadding,
          ),
        })}>
        {children}
      </div>
    </div>
  );
}

Section.displayName = 'Section';
