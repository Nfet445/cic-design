// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ResizeHandle.tsx
 * @input direction, isReversed, hasDivider, isAlwaysVisible, pillPlacement, ResizableProps
 * @output Styled drag handle with WAI-ARIA separator role and keyboard support
 * @position Between resizable panels; consumed directly by builders
 *
 * A drag takes pointer capture on the element it starts on, so moves over an
 * embedded frame still arrive.
 */

import {useCallback, useEffect, useReducer, useRef, useState} from 'react';
import type {CSSProperties, HTMLAttributes, ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import {focusOutlineFocusVisibleClassName} from '../utils/focusOutlineClasses';
import {
  RESIZE_HANDLE_PANE_LENGTH_VAR,
  resizeHandleClassName,
  resizeHandleHitAreaClassName,
  resizeHandlePillClassName,
} from './resizeHandleClasses';
import {mergeProps} from '../utils';
import {tw} from '../utils/tw';
import {
  rtlCenterInlineBlockOffsetClassName,
  rtlCenterInlineClassName,
} from '../utils/rtlClasses';
import {
  endResizeAt,
  getCollapseControls,
  getEffectiveMaxPx,
  resizablePropsOf,
  type ResizableProps,
  type ResizableRegion,
} from './useResizable';
import {
  createResizeGesture,
  type ResizeGesture,
  type ResizeGestureModel,
} from './resizeGesture';
import {
  handOverPane,
  regionOfProps,
  registerResizeHandle,
  resizablePaneFor,
  watchResizablePanes,
  type ResizablePane,
} from './resizablePane';
import {separatorAttributes} from './separatorAttributes';
import {themeProps} from '../utils/themeProps';

import {useDevWarning} from '../hooks/useDevWarning';
import {useCommittedRef} from '../hooks/useCommittedRef';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {useMergedRefs} from '../hooks/useMergedRefs';
import {useInteractionModalityTracking} from '../utils/interactionModality';
import {
  registerEnglishFallback,
  useComponentTranslator,
} from '../i18n/useComponentTranslator';
import english from '../i18n/generated-english/Resizable/ResizeHandle.generated';

registerEnglishFallback(english);

type PillPlacement = 'start' | 'end' | 'center' | 'auto';

function resolveEffectiveSide(
  pillPlacement: PillPlacement,
  isReversed: boolean,
  isCollapsed: boolean,
): 'start' | 'end' | 'center' {
  if (pillPlacement !== 'auto') {
    return pillPlacement;
  }
  const panelSide: 'start' | 'end' = isReversed ? 'end' : 'start';
  if (isCollapsed) {
    return panelSide === 'start' ? 'end' : 'start';
  }
  return panelSide;
}

export interface ResizeHandleProps extends Omit<
  BaseProps<HTMLDivElement>,
  'style'
> {
  ref?: React.Ref<HTMLDivElement>;

  /**
   * Layout direction — determines cursor and indicator orientation.
   * @default 'horizontal'
   */
  direction?: 'horizontal' | 'vertical';

  /**
   * Positioning mode. `'inline'` (default) puts the handle in normal
   * flex flow between siblings. `'overlay'` uses absolute positioning
   * so the handle sits inside a parent panel's bounds — useful when
   * the parent has `overflow: clip`.
   * @default 'inline'
   */
  position?: 'inline' | 'overlay';

  /**
  /**
   * Reverse the drag direction. Use when the handle controls a panel
   * on the end/right/bottom side.
   * @default false
   */
  isReversed?: boolean;

  /**
   * Whether the handle is disabled (not interactive).
   * @default false
   */
  isDisabled?: boolean;

  /**
   * Show a 1px divider line. The line IS the handle — it takes only
   * 1px in the layout with a wider invisible hit area for interaction.
   * Ignored in overlay mode.
   * @default false
   */
  hasDivider?: boolean;

  /**
   * Show the pill grip indicator at rest. Set to `false` to only
   * reveal the pill on hover/focus.
   * @default true
   */
  isAlwaysVisible?: boolean;

  /**
   * Which side of the divider line the pill sits on. It moves only the pill:
   * the grab zone stays centred on the divider.
   * - `'auto'` — panel side by default, flips when panel is collapsed to 0px
   * - `'start'` — left (horizontal) or top (vertical)
   * - `'end'` — right (horizontal) or bottom (vertical)
   * - `'center'` — centered on the divider line (original behavior)
   * @default 'auto'
   */
  pillPlacement?: PillPlacement;

  /**
   * Accessible label for the separator.
   * @default 'Resize handle'
   */
  label?: string;

  /** The output of `useResizable()`, or its `props`. */
  resizable?: ResizableRegion | ResizableProps;

  /** Custom handle content. Overrides the default pill. */
  children?: ReactNode;
}

/**
 * Draggable resize handle placed between resizable panels. Renders as a thin
 * divider line with a wider invisible hit area and optional pill grip indicator.
 * Supports keyboard resizing via arrow keys and WAI-ARIA separator role.
 *
 * The pill element uses class `astryx-resize-handle-pill` for theme targeting.
 *
 * @example
 * ```
 * <ResizeHandle
 *   resizable={resizable}
 *   direction="horizontal"
 *   hasDivider />
 * ```
 */

export function ResizeHandle({
  direction = 'horizontal',
  position: positionMode = 'inline',
  isReversed = false,
  isDisabled = false,
  hasDivider = false,
  isAlwaysVisible = true,
  pillPlacement = 'auto',
  label: labelFromProps,
  resizable: resizableValue,
  children,
  xstyle,
  className,
  ref,
  ...props
}: ResizeHandleProps) {
  const resizable =
    resizableValue == null ? undefined : resizablePropsOf(resizableValue);
  const t = useComponentTranslator();
  const label = labelFromProps ?? t('@astryx.resizable.handle.label');
  const handleRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isHorizontal = direction === 'horizontal';
  const isOverlay = positionMode === 'overlay';

  // --- The region a `resizable` prop describes ---

  // The gesture reads the committed props at each input. A drag sees the
  // region as it is now, not as it was at the press.
  const resizableRef = useCommittedRef(resizable);
  // The region a drag in flight started on: told the gesture is over even
  // after the prop has gone.
  const dragRegionRef = useRef<ResizableProps | undefined>(undefined);
  const configRef = useCommittedRef({direction, isReversed, isDisabled});
  const [isDragging, setIsDragging] = useState(false);
  const [regionGesture] = useState<ResizeGesture>(() => {
    const model: ResizeGestureModel = {
      state() {
        const region = resizableRef.current;
        return {
          size: region?._size ?? 0,
          isCollapsed: region?._isCollapsed ?? false,
          minPx: region?._minSizePx ?? 0,
          maxPx: region?._maxSizePx ?? Infinity,
          snaps: region?._snaps ?? [],
          collapsedSize: region?._collapsedSize ?? 0,
          collapsible: region?._collapsible ?? false,
        };
      },
      start: () => {
        dragRegionRef.current = resizableRef.current;
        resizableRef.current?._onResizeStart();
      },
      move: delta => resizableRef.current?._onResizeMove(delta),
      end: velocity => {
        const region = resizableRef.current ?? dragRegionRef.current;
        dragRegionRef.current = undefined;
        if (region != null) {
          endResizeAt(region, velocity ?? 0);
        }
      },
      // Not a resize end, but the gesture is over. The region froze its state
      // for the drag, so it must hear that the drag ended.
      cancel: () => {
        const region = resizableRef.current ?? dragRegionRef.current;
        dragRegionRef.current = undefined;
        region?._onResizeCancel?.();
      },
      // The hook's own collapse and expand restore the size before the
      // collapse; a hand-built `ResizableProps` has none.
      get collapse() {
        const region = resizableRef.current;
        return region ? getCollapseControls(region)?.collapse : undefined;
      },
      get expand() {
        const region = resizableRef.current;
        return region ? getCollapseControls(region)?.expand : undefined;
      },
    };
    return createResizeGesture(
      () => handleRef.current,
      model,
      () => ({
        ...configRef.current,
        isDisabled:
          configRef.current.isDisabled || resizableRef.current == null,
      }),
      dragging => {
        setIsDragging(dragging);
        // The hook's region lets a pointer drag reopen its pane without a
        // slide; a hand-built object has none.
        const region = resizableRef.current;
        if (region != null) {
          regionOfProps(region)?.setPointerDragging(dragging);
        }
      },
    );
  });

  const gesture = resizable != null ? regionGesture : null;
  const isCollapsed = resizable?._isCollapsed ?? false;
  const effectiveSide = resolveEffectiveSide(
    pillPlacement,
    isReversed,
    isCollapsed,
  );
  // An inline zone reaches at most half of the pane the Handle resizes. An
  // overlay Handle takes at most half of it. A collapsed pane, or one at 0px,
  // has nothing to protect and keeps the whole zone.
  const paneSize = resizable?._size;
  const paneLength =
    isCollapsed || paneSize == null || paneSize <= 0 ? undefined : paneSize;
  const isInteracting = isHovered || isFocused;

  // A handle whose axis disagrees with its region drags along one axis while
  // the region measures percentage bounds on the other. `ResizableProps` is
  // exported, so `_direction` is optional for old hand-built objects. Without
  // it there is no axis to compare.
  const regionDirection = resizable?._direction;
  useDevWarning(
    'ResizeHandle',
    `direction="${direction}" but its useResizable region is ` +
      `"${regionDirection}". They must match: the hook measures one axis ` +
      'and the handle drags the other.',
    regionDirection != null && regionDirection !== direction,
  );

  // --- Cleanup on unmount, or when the `resizable` prop goes ---

  // Removing the grab zone releases its captured pointer and its listeners.
  // A `resizable` prop that goes away takes the grab zone's handlers too. The
  // body's cursor and user-select overrides are not on the element, so they
  // are released here. The region outlives this handle and still has to hear
  // that its gesture is over.
  const hasRegion = resizable != null;
  // Interrupts the region's gesture when the handle loses its region or
  // unmounts.
  useEffect(() => {
    if (!hasRegion) {
      return;
    }
    return () => {
      regionGesture.interrupt();
    };
  }, [hasRegion, regionGesture]);

  // --- The LayoutPanel beside a handle given `resizable` props ---

  // A collapsing panel moves focus here, and the ring follows the last input.
  const {ref: modalityRef} = useInteractionModalityTracking();
  // A LayoutPanel at the region's size, with no `resizable` prop, has no
  // controller to find it. This handle holds it collapsed with the region, so
  // focus inside it moves here and it goes inert. A panel lent later is found
  // at once.
  const [, rerender] = useReducer((count: number) => count + 1, 0);
  const heldPaneRef = useRef<ResizablePane | null>(null);
  // The element goes in the handle registry, for a collapsing panel beside it
  // to hand focus to. When the element goes, a held panel opens.
  const registryRef = useCallback((element: HTMLDivElement | null) => {
    if (element == null) {
      return;
    }
    const unregister = registerResizeHandle(element);
    return () => {
      unregister();
      heldPaneRef.current = handOverPane(
        heldPaneRef.current,
        null,
        null,
        false,
        null,
      );
    };
  }, []);
  const isRegionCollapsed = resizable?._isCollapsed ?? false;
  // Syncs with the lent-panel registry. A panel lent or taken back re-renders
  // this handle, so it looks for its pane again.
  useEffect(
    () => (hasRegion ? watchResizablePanes(rerender) : undefined),
    [hasRegion],
  );
  // Syncs the held panel with the region's collapse state after each commit.
  useIsomorphicLayoutEffect(() => {
    const element = handleRef.current;
    const pane =
      hasRegion && element != null
        ? resizablePaneFor(element, isReversed)
        : null;
    heldPaneRef.current = handOverPane(
      heldPaneRef.current,
      pane,
      null,
      isRegionCollapsed,
      element,
    );
  });

  // --- ARIA ---
  const sizeNow = resizable?._size;
  const minNow = resizable?._minSizePx;
  // A separator with a value needs a maximum (WAI-ARIA, APG window splitter).
  // Unbounded regions report the basis they can fill; a hand-built props
  // object without it reports only a configured maximum.
  const effectiveMax = resizable
    ? (getEffectiveMaxPx(resizable) ??
      (resizable._maxSizePx !== Infinity ? resizable._maxSizePx : undefined))
    : undefined;
  // The attributes createResizable writes on a plain element, from the same
  // derivation.
  const aria = separatorAttributes({
    direction,
    isDisabled,
    value:
      sizeNow == null || minNow == null
        ? undefined
        : {
            size: sizeNow,
            minPx: minNow,
            maxPx: effectiveMax,
            isCollapsed,
            collapsedText: t('@astryx.resizable.collapsed'),
          },
  });

  // The Grip pill takes the pointer as the Grab zone does, so a pill drawn
  // outside the zone still resizes.
  const grabHandlers: Pick<
    HTMLAttributes<HTMLDivElement>,
    | 'onPointerDown'
    | 'onPointerMove'
    | 'onPointerUp'
    | 'onPointerCancel'
    | 'onLostPointerCapture'
    | 'onPointerEnter'
    | 'onPointerLeave'
  > = {
    onPointerDown: e => {
      if (!isDisabled) {
        gesture?.pointerDown(e);
      }
    },
    onPointerMove: e => gesture?.pointerMove(e),
    onPointerUp: e => gesture?.pointerUp(e),
    onPointerCancel: e => gesture?.pointerCancel(e),
    onLostPointerCapture: e => gesture?.pointerCancel(e),
    onPointerEnter: () => setIsHovered(true),
    onPointerLeave: () => {
      if (!isDragging) {
        setIsHovered(false);
      }
    },
  };

  return (
    <div
      ref={useMergedRefs(ref, handleRef, registryRef, modalityRef)}
      role="separator"
      {...aria}
      aria-label={label}
      onDoubleClick={() => {
        if (!isDisabled) {
          gesture?.doubleClick();
        }
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      data-resizing={isDragging || undefined}
      {...mergeProps(
        themeProps('resize-handle'),
        stylex.props(xstyle),
        tw(
          resizeHandleClassName({
            isHorizontal,
            isOverlay,
            isShortPane: paneLength != null,
            hasDivider,
            isDragging,
            isDisabled,
          }),
          className,
          focusOutlineFocusVisibleClassName,
        ),
      )}
      {...props}
      // Keyboard resizing must fire from the focusable separator, not a child:
      // keydown fires on the focused element and bubbles up, so a handler on a
      // descendant never runs (per the WAI-ARIA window-splitter pattern).
      // Placed after {...props} and composed with any consumer onKeyDown so
      // this accessibility-critical handler can't be clobbered by a passed prop.
      onKeyDown={e => {
        props.onKeyDown?.(e);
        if (!isDisabled) {
          gesture?.keyDown(e);
        }
      }}>
      {/* Wider invisible hit area for pointer interaction */}
      <div
        className={tw(
          resizeHandleHitAreaClassName({
            isHorizontal,
            isOverlay,
            hasPaneLength: paneLength != null,
            isDisabled,
          }),
          // The zone is centred on the inline axis in both directions; only a
          // horizontal one needs the physical spelling.
          isHorizontal ? rtlCenterInlineClassName : undefined,
        )}
        // An inline zone stops at half the pane it protects: the measurement
        // reaches CSS as a custom property, never as state or a style rule.
        style={
          !isOverlay && paneLength != null
            ? ({
                [RESIZE_HANDLE_PANE_LENGTH_VAR]: `${paneLength}px`,
              } as CSSProperties)
            : undefined
        }
        {...grabHandlers}
      />
      {/* Pill grip indicator — themed via .astryx-resize-handle-pill */}
      {children ?? (
        <div
          {...mergeProps(
            themeProps('resize-handle-pill'),
            tw(
              resizeHandlePillClassName({
                isHorizontal,
                side: effectiveSide,
                isAlwaysVisible,
                isInteracting,
                isDragging,
                isDisabled,
              }),
              // Centred, the pill needs the inline centering and half its own
              // height above the line, in both directions.
              effectiveSide === 'center'
                ? tw(
                    rtlCenterInlineClassName,
                    rtlCenterInlineBlockOffsetClassName.half,
                  )
                : undefined,
            ),
          )}
          {...grabHandlers}
        />
      )}
    </div>
  );
}

ResizeHandle.displayName = 'ResizeHandle';
