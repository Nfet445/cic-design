// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Layout.tsx
 * @input Uses React, layout class map, isRenderable, LayoutAreaContext, LayoutSlotsContext
 * @output Exports Layout component and LayoutProps, LayoutHeight types
 * @position General five-slot layout primitive for arranging header, start, content, end, and footer regions.
 *   Building a page area with a side panel? Use Layout with start/end slots.
 *   Need a header + scrollable content? Use Layout with header + content slots.
 *   AppShell owns the page shell and app-wide navigation behavior.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Layout/Layout.doc.mjs
 * - /apps/storybook/stories/Layout.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/Layout/ (showcase blocks)
 */

import {type ReactNode, useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {LayoutAreaContext, type LayoutArea} from './LayoutAreaContext';
import {LayoutSlotsContext, type LayoutSlots} from './LayoutSlotsContext';
import {LayoutDividerContext} from './LayoutDividerContext';
import {
  layoutAutoClassName,
  layoutFillClassName,
  layoutInnerClassName,
  layoutOwnOuterResetClassName,
  layoutMiddleClassName,
  layoutMiddleContentWidthClassName,
  layoutMiddleQueryClassName,
  layoutOuterClassName,
  layoutSingleColumnContentClassName,
  layoutSingleEndPanelClassName,
  layoutSinglePanelMiddleClassName,
  layoutSingleStartPanelClassName,
} from './layoutClasses';
import type {LayoutInstanceStyle} from './layoutClasses';
import {mergeProps} from '../utils/mergeProps';
import {tw} from '../utils/tw';
import {isRenderable} from '../utils/isRenderable';
import type {BaseProps} from '../BaseProps';
import type {SizeValue, SpacingStep} from '../utils/types';
import {themeProps} from '../utils/themeProps';
import {layoutPaddingClassName} from './paddingClasses';

/**
 * Height behavior for the layout.
 * - `fill`: Layout fills container height, content scrolls internally (default)
 * - `auto`: Layout grows with content, container/page scrolls
 */
export type LayoutHeight = 'fill' | 'auto';

/**
 * Internal alignment subtracts contentWidth in CSS. Intrinsic values and bare
 * variables cannot participate in that arithmetic, so they keep the released
 * constrained-composition path.
 */
function supportsInternalContentWidthAlignment(
  width: SizeValue | undefined,
): boolean {
  if (width == null || typeof width === 'number') {
    return true;
  }

  const value = width.trim().toLowerCase();
  if (value.includes('%')) {
    return false;
  }
  return (
    value === '0' ||
    /^-?(?:\d+(?:\.\d+)?|\.\d+)[a-z]+$/.test(value) ||
    /^(?:calc|min|max|clamp)\(/.test(value)
  );
}

export interface LayoutProps extends Omit<BaseProps, 'content'> {
  /**
   * Ref forwarded to the root DOM element.
   */
  ref?: React.Ref<HTMLDivElement>;

  /**
   * Main content area (center).
   */
  content?: ReactNode;

  /**
   * Maximum width of the aligned content within each slot (header, content,
   * footer, panels). Dividers remain full-bleed. Content is centered with
   * `margin-inline: auto` when narrower than the available space.
   *
   * In a layout without start or end panels, LayoutContent spans the available
   * width so its scrollbar stays at the outer edge, while its children align
   * internally to `contentWidth`. With exactly one panel, that panel remains
   * aligned to the `contentWidth` frame while LayoutContent extends to the
   * opposite open edge. With both panels, `contentWidth` includes the complete
   * start + content + end composition. Intrinsic widths such as `fit-content`
   * retain the constrained composition because they cannot participate in the
   * internal alignment arithmetic. Percentage widths, including
   * percentage-bearing `calc()`, `min()`, `max()`, and `clamp()` values, use the
   * constrained fallback because they cannot share one arithmetic basis. Bare
   * `var(...)` values also use that fallback because their resolved value may be
   * intrinsic; wrap a variable guaranteed to resolve to a length in `calc(...)`
   * to opt into edge scrolling.
   *
   * Numbers are treated as pixels, strings are used as-is (e.g., '60ch').
   * Common page widths:
   * - `640` — forms, settings, text-focused pages
   * - `960` — content pages, component demos, wider layouts
   */
  contentWidth?: SizeValue;

  /**
   * End panel slot (right in LTR, left in RTL).
   */
  end?: ReactNode;

  /**
   * Footer slot.
   */
  footer?: ReactNode;

  /**
   * Header slot.
   */
  header?: ReactNode;

  /**
   * Controls the height behavior:
   * - `fill`: Layout fills container height, content scrolls internally (default)
   * - `auto`: Layout grows with content, container/page scrolls
   * @default 'fill'
   */
  height?: LayoutHeight;

  /**
   * Padding at the layout's outer edges using the spacing scale.
   * Applies to this Layout's own header, footer, panels, and content; a nested
   * Layout does not inherit it. Without `padding`, regions use the enclosing
   * Card, Section, or Dialog padding, or the default inset.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   */
  padding?: SpacingStep;

  /**
   * Start panel slot (left in LTR, right in RTL).
   */
  start?: ReactNode;
  /**
   * Default divider visibility for LayoutHeader and LayoutFooter children.
   * When set, headers/footers that don't explicitly pass `hasDivider` will use this value.
   * When not set, nested layouts inherit from their parent context.
   */
  defaultHasDividers?: boolean;

  /**
   * Children are a shorthand for the `content` slot:
   * `<Layout>{main}</Layout>` is equivalent to `<Layout content={main} />`.
   * The surrounding zones (`header`/`start`/`end`/`footer`) stay explicit
   * props. If both `content` and `children` are provided, `content` wins.
   * Accepting children keeps the natural `<Layout>…</Layout>` form from
   * rendering a blank shell.
   */
  children?: ReactNode;
}

/**
 * Helper component to wrap content in layout area context.
 */
function AreaProvider({
  area,
  children,
}: {
  area: LayoutArea;
  children: ReactNode;
}) {
  if (children == null) {
    return null;
  }
  return <LayoutAreaContext value={area}>{children}</LayoutAreaContext>;
}

/**
 * General layout primitive with header, start, content, end, and footer slots.
 * Use it to arrange regions within a page or bounded container. AppShell owns
 * the page shell, app-wide navigation, responsive shell behavior, skip link,
 * and main landmark.
 *
 * Handles padding collapse between adjacent slots, scroll containment in the
 * content area, and automatic RTL support via CSS logical properties.
 *
 * Structure:
 * ```
 * ┌─────────────────────────────────────────┐
 * │                 header                  │
 * ├──────┬─────────────────────────┬────────┤
 * │      │                         │        │
 * │start │        content          │  end   │
 * │      │                         │        │
 * ├──────┴─────────────────────────┴────────┤
 * │                 footer                  │
 * └─────────────────────────────────────────┘
 * ```
 *
 * When to use Layout vs raw flexbox:
 * - Page with a sidebar → Layout with `start` slot
 * - Dashboard with header + scrollable body → Layout with `header` + `content`
 * - Settings page with nav panel → Layout with `start` + `content`
 * - Simple vertical stack of items → use VStack instead
 *
 * @example
 * ```
 * <Layout
 *   header={<LayoutHeader hasDivider>App Name</LayoutHeader>}
 *   start={
 *     <LayoutPanel hasDivider width={240} role="navigation">
 *       <Navigation />
 *     </LayoutPanel>
 *   }
 *   content={
 *     <LayoutContent role="main">
 *       <MainContent />
 *     </LayoutContent>
 *   }
 * />
 * ```
 */
export function Layout({
  children,
  content,
  contentWidth,
  defaultHasDividers,
  end,
  footer,
  header,
  height = 'fill',
  padding,
  ref,
  start,
  xstyle,
  className,
  style,
  ...restProps
}: LayoutProps) {
  const isFill = height === 'fill';
  // Children are a shorthand for the content slot; an explicit `content` prop
  // wins when both are provided.
  const resolvedContent = content ?? children;

  const dividerCtxValue = useMemo(
    () => (defaultHasDividers != null ? {defaultHasDividers} : null),
    [defaultHasDividers],
  );

  // A slot that renders nothing, such as `false` from `isOpen && <LayoutHeader />`,
  // is absent, so its neighbours take the outer inset on that side.
  const hasHeader = isRenderable(header);
  const hasFooter = isRenderable(footer);
  const hasStart = isRenderable(start);
  const hasEnd = isRenderable(end);
  const hasBothPanels = hasStart && hasEnd;
  const hasSinglePanel = hasStart !== hasEnd;
  const usesInternalContentWidth =
    contentWidth != null && supportsInternalContentWidthAlignment(contentWidth);
  const slotsValue = useMemo<LayoutSlots>(
    () => ({hasHeader, hasFooter, hasStart, hasEnd}),
    [hasHeader, hasFooter, hasStart, hasEnd],
  );

  // A Layout without contentWidth caps no region: the inner class maps
  // `initial` to `none`. The values ride variables written here, so a consumer
  // `xstyle` still overrides the frame and a number is one class, not one rule.
  const sizingStyle: LayoutInstanceStyle | undefined =
    contentWidth != null
      ? {
          '--astryx-layout-content-width':
            typeof contentWidth === 'number'
              ? `${contentWidth}px`
              : contentWidth,
          ...(usesInternalContentWidth && {
            '--astryx-layout-alignment-width':
              typeof contentWidth === 'number'
                ? `${contentWidth}px`
                : contentWidth,
          }),
        }
      : undefined;

  const tree = (
    <LayoutSlotsContext value={slotsValue}>
      <div
        {...restProps}
        ref={ref}
        {...mergeProps(
          mergeProps(themeProps('layout', {height}), {
            className: tw(
              layoutOuterClassName,
              isFill ? layoutFillClassName : layoutAutoClassName,
            ),
          }),
          stylex.props(xstyle),
          className,
          style,
        )}>
        <div
          {...mergeProps(
            {
              className: tw(
                layoutInnerClassName,
                isFill ? layoutFillClassName : layoutAutoClassName,
                padding == null && layoutOwnOuterResetClassName,
                padding != null &&
                  layoutPaddingClassName({
                    paddingOuterX: padding,
                    paddingOuterY: padding,
                  }),
              ),
            },
            {style: sizingStyle},
          )}>
          <AreaProvider area="header">{header}</AreaProvider>
          <div
            {...mergeProps({
              className: tw(
                layoutMiddleClassName,
                contentWidth != null &&
                  (!usesInternalContentWidth || hasBothPanels) &&
                  layoutMiddleContentWidthClassName,
                usesInternalContentWidth &&
                  !hasBothPanels &&
                  layoutMiddleQueryClassName,
                usesInternalContentWidth &&
                  hasSinglePanel &&
                  layoutSinglePanelMiddleClassName,
                usesInternalContentWidth &&
                  hasStart &&
                  !hasEnd &&
                  layoutSingleStartPanelClassName,
                usesInternalContentWidth &&
                  !hasStart &&
                  hasEnd &&
                  layoutSingleEndPanelClassName,
              ),
            })}>
            <AreaProvider area="start">{start}</AreaProvider>
            <div
              className={tw(
                'grow min-h-0 min-w-0',
                usesInternalContentWidth &&
                  !hasStart &&
                  !hasEnd &&
                  layoutSingleColumnContentClassName,
              )}>
              <AreaProvider area="content">{resolvedContent}</AreaProvider>
            </div>
            <AreaProvider area="end">{end}</AreaProvider>
          </div>
          <AreaProvider area="footer">{footer}</AreaProvider>
        </div>
      </div>
    </LayoutSlotsContext>
  );

  if (dividerCtxValue != null) {
    return (
      <LayoutDividerContext value={dividerCtxValue}>
        {tree}
      </LayoutDividerContext>
    );
  }

  return tree;
}

Layout.displayName = 'Layout';
