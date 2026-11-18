// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file LayoutPanel.tsx
 * @input Uses React StyleX, LayoutAreaContext, LayoutSlotsContext,
 *   useScrollRegionProps, resizablePane.ts
 * @output Exports LayoutPanel component and LayoutPanelProps
 * @position Sidebar panel for Layout start/end slots; its resize controller slides it.
 *   Use for navigation panels, settings sidebars, detail panels, or any fixed-width side content.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Layout/Layout.doc.mjs
 * - /apps/storybook/stories/Layout.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/Layout/ (showcase blocks)
 */

import type {AriaRole, ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import {use, useCallback, useRef, useState, useSyncExternalStore} from 'react';
import {
  layoutPanelClassName,
  layoutPanelCollapseEndClassName,
  layoutPanelCollapseStartClassName,
  layoutPanelDividerEndClassName,
  layoutPanelDividerStartClassName,
  layoutPanelWidthClassName,
} from './layoutClasses';
import type {LayoutInstanceStyle} from './layoutClasses';
import {LayoutAreaContext} from './LayoutAreaContext';
import {LayoutSlotsContext} from './LayoutSlotsContext';
import {useMergedRefs} from '../hooks/useMergedRefs';
import {useScrollRegionProps} from '../hooks/useScrollRegionProps';
import {mergeProps} from '../utils';
import {tw} from '../utils/tw';
import type {SizeValue, SpacingStep} from '../utils/types';
import {
  resizablePropsOf,
  type ResizableProps,
  type ResizableRegion,
} from '../Resizable/useResizable';
import {
  createResizablePaneLink,
  regionOfProps,
  resizeHandleBeside,
} from '../Resizable/resizablePane';
import {LayoutChangeSnapshot} from '../motion/LayoutChangeSnapshot';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {moveFocusLeftBehind, noteFocusWithin} from '../utils/focusReturn';
import {useFocusLeavingChange} from '../utils/useFocusLeavingChange';
import {themeProps} from '../utils/themeProps';
import {xstyleProps} from '../utils/xstyle';

const returnFalse = () => false;

export interface LayoutPanelProps extends BaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Content to render inside the panel.
   */
  children?: ReactNode;

  /**
   * Adds a themed border on the appropriate edge.
   * - Start panel: border on end edge (right in LTR)
   * - End panel: border on start edge (left in LTR)
   * When false and `padding` is unset, the panel and the content share one gap.
   *
   * Note: When using `resizable` with an adjacent `ResizeHandle hasDivider`,
   * set this to `false` to avoid a double-line artifact.
   * @default false
   */
  hasDivider?: boolean;

  /**
   * Internal padding of the panel on every edge, using the spacing scale.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   * Replaces the automatic inset and the gap shared with the content.
   * `0` is full bleed.
   */
  padding?: SpacingStep;

  /**
   * Enables scrollable overflow for the panel.
   * Set to false for auto-height layouts where sticky positioning
   * needs to work with parent containers.
   * @default true
   */
  isScrollable?: boolean;

  /**
   * Accessible label for the landmark.
   * Required when role is set and multiple landmarks of the same type exist.
   * While the panel scrolls, it also names the scrolling region, which
   * otherwise takes a translated "Content".
   */
  label?: string;

  /**
   * ARIA landmark role for accessibility.
   * Use 'navigation' or 'complementary' only for top-level layouts (not nested).
   */
  role?: AriaRole;

  /**
   * Width of the panel.
   * Numbers are treated as pixels, strings are used as-is.
   * When `resizable` is provided, this is ignored — the hook controls width.
   */
  width?: SizeValue;

  /**
   * The output of `useResizable()`, or its `props`. When provided, the panel
   * width is driven by the hook and a resize handle should be placed
   * adjacent to this panel.
   *
   * @example
   * ```
   * const resizable = useResizable({ defaultSize: 250, minSize: 200 });
   * <LayoutPanel resizable={resizable}>
   *   <Navigation />
   * </LayoutPanel>
   * <ResizeHandle resizable={resizable} />
   * ```
   */
  resizable?: ResizableRegion | ResizableProps;
}

/**
 * Sidebar or side panel for Layout. Use in the `start` slot for left navigation
 * or in the `end` slot for detail/inspector panels.
 * Renders with optional divider and context-aware padding.
 * Divider position is auto-detected based on which slot the panel is in.
 *
 * Already provides its own padding and scroll — don't add padding or
 * overflow to children. Use `padding={0}` if you need edge-to-edge content.
 *
 * @example
 * ```
 * <Card>
 *   <Layout
 *     start={
 *       <LayoutPanel hasDivider role="navigation">
 *         <Navigation />
 *       </LayoutPanel>
 *     }
 *     content={<LayoutContent>Main content</LayoutContent>}
 *     end={
 *       <LayoutPanel hasDivider role="complementary">
 *         <Sidebar />
 *       </LayoutPanel>
 *     }
 *   />
 * </Card>
 * ```
 */
export function LayoutPanel({
  children,
  hasDivider = false,
  isScrollable = true,
  label,
  padding,
  role,
  width,
  resizable: resizableValue,
  xstyle,
  className,
  style,
  ref,
  ...props
}: LayoutPanelProps) {
  const resizable =
    resizableValue == null ? undefined : resizablePropsOf(resizableValue);
  const area = use(LayoutAreaContext);
  const {hasHeader, hasFooter} = use(LayoutSlotsContext);

  // When resizable props are provided, use the hook-driven size
  const effectiveWidth = resizable ? resizable._size : width;
  // A collapsed region sizes its panel to 0.
  const isZeroWidth = effectiveWidth === 0;
  const elementRef = useRef<HTMLDivElement>(null);

  // A panel sized by a resize controller lends it its element. The
  // controller slides it on collapse and open. Given the hook's own `props`,
  // the panel hands itself to that region. With no `resizable`, a
  // ResizeHandle beside it that has the region's props finds it and holds it
  // collapsed. A hand-built `resizable` object has no region: it lends
  // nothing and never slides.
  const [paneLink] = useState(createResizablePaneLink);
  const isHeldCollapsed = useSyncExternalStore(
    paneLink.subscribe,
    paneLink.isCollapsed,
    returnFalse,
  );
  const isFoundBeside = resizable == null;
  const paneRegion = resizable == null ? undefined : regionOfProps(resizable);
  // Syncs the panel's element with its resize controller. It lends here, not
  // in the callback ref. The scroll region's ref changes at width 0, so React
  // runs every merged ref again. A lend taken back mid-collapse would land the
  // slide.
  useIsomorphicLayoutEffect(() => {
    const isLent = isFoundBeside || paneRegion != null;
    const lend = (element: HTMLDivElement | null) => {
      const pane = paneLink.attach(isLent ? element : null, isFoundBeside);
      paneRegion?.attach(pane);
    };
    lend(elementRef.current);
    return () => {
      lend(null);
    };
  }, [paneLink, isFoundBeside, paneRegion]);
  const contentFacingEdge = area === 'end' ? 'inline-start' : 'inline-end';
  // A collapse or open reaches the controller before the DOM changes, in the
  // commit that renders it. That holds for the controller's own change and
  // for a controlled `isCollapsed` it hears of after this commit.
  const tellBeforeChange = useCallback(() => {
    paneLink.beforeChange(isZeroWidth);
  }, [paneLink, isZeroWidth]);
  // Syncs the resize controller's pane link with the width and edge this
  // commit rendered.
  useIsomorphicLayoutEffect(() => {
    paneLink.committed(effectiveWidth, contentFacingEdge);
  });

  // A collapsing panel moves focus inside it to its ResizeHandle, through the
  // focus-leaving sequence that disclosures share. It goes inert and hidden
  // from assistive technology a commit later, so inert never drops that focus
  // to the page. Opening drops both at once. The ResizeHandle beside it holds
  // the region's collapse state, or else the `resizable` props hold it.
  const isRegionCollapsed =
    resizable == null ? isHeldCollapsed : resizable._isCollapsed;
  const noteFocusBeforeCollapse = useFocusLeavingChange(
    isRegionCollapsed,
    (wasCollapsed: boolean) =>
      wasCollapsed ? null : noteFocusWithin(elementRef.current),
    (noted, isCollapsed) => {
      const panel = elementRef.current;
      if (isCollapsed && panel != null) {
        moveFocusLeftBehind(
          noted,
          paneLink.focusTarget() ?? resizeHandleBeside(panel, area),
          panel,
        );
      }
    },
  );
  const [isSettledCollapsed, setIsSettledCollapsed] =
    useState(isRegionCollapsed);
  if (!isRegionCollapsed && isSettledCollapsed) {
    setIsSettledCollapsed(false);
  }
  // Syncs `inert` with the browser's focus: the panel goes inert only after
  // this commit's focus move.
  useIsomorphicLayoutEffect(() => {
    if (isRegionCollapsed && !isSettledCollapsed) {
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- the panel goes inert only after the focus-leaving move above ran in this commit; inert in the collapsing commit would drop that focus to the page first
      setIsSettledCollapsed(true);
    }
  }, [isRegionCollapsed, isSettledCollapsed]);
  const isConcealed = isRegionCollapsed && isSettledCollapsed;

  // Determine panel position
  const isStartPanel = area === 'start';
  const isEndPanel = area === 'end';

  const isZeroPadding = padding === 0;

  // When no divider, collapse spacing for seamless visual flow
  const shouldCollapseSpacing =
    !hasDivider && !isZeroPadding && padding == null && !isZeroWidth;
  // At width 0 the panel clips its content, so it does not scroll.
  const region = useScrollRegionProps({
    isScrollable: isScrollable && !isZeroWidth,
    role,
    label,
  });
  const mergedRef = useMergedRefs(ref, region.ref, elementRef);

  // The divider and the collapse inset sit on the content-facing edge.
  const dividerClassName = isStartPanel
    ? layoutPanelDividerEndClassName
    : isEndPanel
      ? layoutPanelDividerStartClassName
      : null;
  const collapseClassName = isStartPanel
    ? layoutPanelCollapseEndClassName
    : isEndPanel
      ? layoutPanelCollapseStartClassName
      : null;
  // A panel's own width is a value, not a variant: the class reads it from a
  // variable this element writes, so a consumer `xstyle` still overrides it.
  const widthStyle: LayoutInstanceStyle | undefined =
    effectiveWidth != null
      ? {
          '--astryx-layout-panel-width':
            typeof effectiveWidth === 'number'
              ? `${effectiveWidth}px`
              : effectiveWidth,
        }
      : undefined;

  return (
    <div
      ref={mergedRef}
      role={region.role}
      aria-label={region['aria-label']}
      {...mergeProps(
        mergeProps(themeProps('layout-panel'), {
          className: tw(
            layoutPanelClassName({
              hasFooter,
              hasHeader,
              isStart: isStartPanel,
              isEnd: isEndPanel,
              isScrollable: isScrollable && !isZeroWidth,
              isZeroWidth,
              padding,
            }),
            effectiveWidth != null && layoutPanelWidthClassName,
            hasDivider && dividerClassName,
            shouldCollapseSpacing && collapseClassName,
          ),
        }),
        xstyleProps(xstyle),
        className,
        {...style, ...widthStyle},
      )}
      {...props}
      {...(isConcealed ? {inert: true, 'aria-hidden': true} : {})}>
      <LayoutChangeSnapshot
        value={isZeroWidth}
        onBeforeChange={tellBeforeChange}
      />
      <LayoutChangeSnapshot
        value={isRegionCollapsed}
        onBeforeChange={noteFocusBeforeCollapse}
      />
      {children}
    </div>
  );
}

LayoutPanel.displayName = 'LayoutPanel';
