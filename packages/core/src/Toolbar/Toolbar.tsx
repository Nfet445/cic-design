// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Toolbar.tsx
 * @input Uses Section, SizeContext, useListFocus, useKeyboardHint, StyleX,
 *   spacingVarNames
 * @output Exports Toolbar component and ToolbarProps
 * @position Core implementation; consumed by index.ts. Owns toolbar focus and
 *   keyboard navigation, excluding nested toolbars and popover contents.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Toolbar/Toolbar.doc.mjs
 * - /packages/core/src/Toolbar/Toolbar.test.tsx
 * - /packages/core/src/Toolbar/index.ts
 * - /apps/storybook/stories/Toolbar.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/Toolbar/ (showcase blocks)
 */

import {useCallback, useState, type ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import type {SectionVariant} from '../Section/Section';
import type {SpacingStep} from '../utils/types';
import type {ElementSize} from '../SizeContext/SizeContext';
import {spacingVarNames} from '../theme/tokenVars';
import {mergeProps} from '../utils';
import {Section} from '../Section/Section';
import {oneTabStopAmong, useInternalListFocus} from '../hooks/useListFocus';
import {useKeyboardHint} from '../hooks/useKeyboardHint';
import {SizeProvider} from '../SizeContext/SizeContext';
import {themeProps} from '../utils/themeProps';
import {observeResize} from '../utils/sharedResizeObserver';
import {useAttachment} from '../hooks/useAttachment';
import {tw} from '../utils/tw';
import {
  toolbarCenterSlotClassName,
  toolbarEndSlotClassName,
  toolbarGapClassName,
  toolbarLaneCompensationClassName,
  toolbarLaneInsetVar,
  toolbarLoneEndSlotClassName,
  toolbarLoneStartSlotClassName,
  toolbarRowClassName,
  toolbarSideLaneClassName,
  toolbarStartSlotClassName,
  toolbarTabIndicatorClassName,
} from './toolbarClasses';

/** The inline lane inset the compensated basis classes read. */
type ToolbarInsetStyle = React.CSSProperties &
  Partial<Record<typeof toolbarLaneInsetVar, string>>;

/**
 * Default block padding per toolbar size. Inline padding comes from the
 * parent container (Card, Section, LayoutHeader) via the Section's
 * theme default — the toolbar only controls its vertical tightness.
 */
const defaultBlockPaddingForSize: Record<ElementSize, SpacingStep> = {
  sm: 2,
  md: 2,
  lg: 2,
};

/**
 * Whether a three-lane row has wrapped: its lanes no longer share one
 * vertical band.
 */
function lanesHaveWrapped(row: Element): boolean {
  // An empty lane is a box with no height, so it shares every line.
  const boxes = [...row.children]
    .slice(0, 3)
    .map(lane => lane.getBoundingClientRect())
    .filter(box => box.height > 0);
  return (
    boxes.length > 1 &&
    Math.max(...boxes.map(box => box.top)) >=
      Math.min(...boxes.map(box => box.bottom))
  );
}

/**
 * Edge compensation inset amount per toolbar size.
 * Equals container-inline-padding minus the toolbar's block padding,
 * creating even spacing around edge-compensated items (ghost buttons, tabs).
 */
const edgeCompInsetForSize: Record<ElementSize, string> = {
  sm: `calc(var(--container-padding-inline-start, ${spacingVarNames['--spacing-4']}) - ${spacingVarNames['--spacing-2']})`,
  md: `calc(var(--container-padding-inline-start, ${spacingVarNames['--spacing-4']}) - ${spacingVarNames['--spacing-2']})`,
  lg: `calc(var(--container-padding-inline-start, ${spacingVarNames['--spacing-4']}) - ${spacingVarNames['--spacing-2']})`,
};

export type ToolbarSize = ElementSize;

export interface ToolbarProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root Section element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Content aligned to the start (left in LTR).
   */
  startContent?: ReactNode;
  /**
   * Content centered between start and end.
   * When provided, switches to the three-lane layout: the center sits at the
   * toolbar's middle while each side lane fits in half of the width it leaves,
   * and the row wraps when the lanes do not fit.
   */
  centerContent?: ReactNode;
  /**
   * Content aligned to the end (right in LTR).
   */
  endContent?: ReactNode;
  /**
   * Accessible label for the toolbar.
   * Applied as aria-label on the inner toolbar element.
   */
  label: string;
  /**
   * Size of the toolbar. Coordinates with Button, TextInput, TabList, and Selector —
   * children inherit this size as their default via SizeContext.
   *
   * - `'sm'`: Compact — fits sm buttons/inputs (28px elements)
   * - `'md'`: Standard — fits md buttons/inputs (32px elements)
   * - `'lg'`: Spacious — fits lg buttons/inputs (36px elements)
   * @default 'md'
   */
  size?: ToolbarSize;
  /**
   * Gap between items within each slot, using the spacing scale.
   * @default 1
   */
  gap?: SpacingStep;
  /**
   * Orientation of the toolbar for keyboard navigation.
   * Controls which arrow keys navigate between items.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Visual variant passed through to Section.
   * @default 'transparent'
   */
  variant?: SectionVariant;

  /**
   * Which sides should have divider borders.
   * Passed through to Section.
   * @example
   * ```
   * dividers={['bottom']}
   * ```
   */
  dividers?: ('top' | 'bottom' | 'start' | 'end')[];
}

// `a[href]` catches a Button rendered with `href`.
const TOOLBAR_ITEMS = 'button, input, a[href], [tabindex]';
const TOOLBAR_BOUNDARY = '[role="toolbar"], [popover]';
const toolbarTabStop = oneTabStopAmong(TOOLBAR_ITEMS, TOOLBAR_BOUNDARY);

/**
 * General-purpose toolbar with start, center, and end content slots.
 *
 * Built on Section, provides a flex layout with roving tabindex
 * keyboard navigation via useListFocus. Cascades `size` to child components
 * (Button, TextInput, TabList, Selector) via SizeContext, and applies
 * edge compensation so ghost buttons align flush at container edges.
 *
 * @example
 * ```
 * <Toolbar label="Actions" size="sm"
 *   startContent={<Button label="Cut" variant="ghost" />}
 *   endContent={<Button label="Settings" variant="ghost" />}
 * />
 * ```
 */
export function Toolbar({
  startContent,
  centerContent,
  endContent,
  label,
  size = 'md',
  gap = 1,
  orientation = 'horizontal',
  variant = 'transparent',
  dividers,
  xstyle,
  className,
  style,
  ref,
  onKeyDown: onKeyDownProp,
  onFocus: onFocusProp,
  onBlur: onBlurProp,
  role: _role,
  'aria-label': _ariaLabel,
  'aria-orientation': _ariaOrientation,
  ...props
}: ToolbarProps) {
  const hasCenterContent = centerContent != null;
  const hasStartContent = startContent != null;
  const hasEndContent = endContent != null;
  const hasBottomDivider = dividers?.includes('bottom') ?? false;

  const {listRef, handleKeyDown, handleFocus} =
    useInternalListFocus<HTMLDivElement>({
      itemSelector: TOOLBAR_ITEMS,
      boundarySelector: TOOLBAR_BOUNDARY,
      orientation,
      hasRovingTabIndex: true,
      hasCaretGuard: true,
      // A read-only toolbar of disabled controls stays one Tab stop.
      tabStopOrder: toolbarTabStop,
    });

  // A bottom divider drops a tab's indicator onto its rail through the block
  // padding. That is right only while the lanes share one line, so a wrapped
  // row keeps the indicator on its tab. The row reports a wrap after layout,
  // in a resize observation.
  const watchesWrap = hasCenterContent && hasBottomDivider;
  const [isWrapped, setIsWrapped] = useState(false);
  useAttachment(
    listRef,
    row =>
      watchesWrap
        ? observeResize(row, () => setIsWrapped(lanesHaveWrapped(row)))
        : () => {},
    watchesWrap,
  );
  const dropsIndicatorOnRail = hasBottomDivider && !(watchesWrap && isWrapped);

  const {
    hintElement,
    onKeyDown: onHintKeyDown,
    onFocus: onHintFocus,
    onBlur: onHintBlur,
  } = useKeyboardHint({orientation});

  const handleToolbarKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDownProp?.(e);
      if (e.defaultPrevented) {
        return;
      }
      onHintKeyDown(e);
      handleKeyDown(e);
    },
    [onKeyDownProp, onHintKeyDown, handleKeyDown],
  );

  const handleToolbarFocus = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      onFocusProp?.(e);
      if (e.defaultPrevented) {
        return;
      }
      onHintFocus(e);
      handleFocus(e);
    },
    [onFocusProp, onHintFocus, handleFocus],
  );

  const handleToolbarBlur = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      onBlurProp?.(e);
      if (e.defaultPrevented) {
        return;
      }
      onHintBlur(e);
    },
    [onBlurProp, onHintBlur],
  );

  // Edge compensation pulls a lane out by a negative margin; the lane's flex
  // basis reads the amount from a custom property, so the offset never lands
  // as an inline declaration.
  const laneInset = edgeCompInsetForSize[size];
  const laneInsetStyle: ToolbarInsetStyle = {
    [toolbarLaneInsetVar]: laneInset,
  };
  const laneCompensationProps = {
    className: toolbarLaneCompensationClassName,
    style: laneInsetStyle,
  };

  return (
    <SizeProvider value={size}>
      <Section
        ref={ref}
        variant={variant}
        paddingBlock={defaultBlockPaddingForSize[size]}
        dividers={dividers}
        xstyle={xstyle}
        className={className}
        style={style}>
        <div
          ref={listRef}
          role="toolbar"
          aria-label={label}
          aria-orientation={orientation}
          onKeyDown={handleToolbarKeyDown}
          onFocus={handleToolbarFocus}
          onBlur={handleToolbarBlur}
          {...mergeProps(themeProps('toolbar', {size}), {
            className: tw(
              toolbarRowClassName({
                gap,
                hasCenterContent,
                isVertical: orientation === 'vertical',
              }),
              // Only drop the tab indicator through the toolbar's block padding
              // onto the rail when a bottom divider is actually present.
              // Without a divider, leave `--_tab-indicator-bottom` unset so a
              // nested TabList's indicator keeps its own default (hugging the
              // tab) instead of floating down into the toolbar's padding.
              dropsIndicatorOnRail && toolbarTabIndicatorClassName(),
            ),
          })}
          {...props}>
          {hasCenterContent ? (
            // Three-slot layout
            <>
              <div
                {...mergeProps(laneCompensationProps, {
                  className: toolbarSideLaneClassName({end: false, gap}),
                })}>
                {startContent}
              </div>
              <div
                {...mergeProps({
                  className: tw(
                    toolbarCenterSlotClassName(),
                    toolbarGapClassName(gap),
                  ),
                })}>
                {centerContent}
              </div>
              <div
                {...mergeProps(laneCompensationProps, {
                  className: toolbarSideLaneClassName({end: true, gap}),
                })}>
                {endContent}
              </div>
            </>
          ) : (
            // Two-slot flex layout
            <>
              {hasStartContent && (
                <div
                  {...mergeProps(
                    {
                      className: tw(
                        hasEndContent
                          ? toolbarStartSlotClassName()
                          : toolbarLoneStartSlotClassName(),
                        toolbarGapClassName(gap),
                      ),
                    },
                    laneCompensationProps,
                  )}>
                  {startContent}
                </div>
              )}
              {hasEndContent && (
                <div
                  {...mergeProps(
                    {
                      className: tw(
                        hasStartContent
                          ? toolbarEndSlotClassName()
                          : toolbarLoneEndSlotClassName(),
                        toolbarGapClassName(gap),
                      ),
                    },
                    laneCompensationProps,
                  )}>
                  {endContent}
                </div>
              )}
            </>
          )}
          {hintElement}
        </div>
      </Section>
    </SizeProvider>
  );
}

Toolbar.displayName = 'Toolbar';
