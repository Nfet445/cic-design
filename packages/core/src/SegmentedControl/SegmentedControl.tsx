// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SegmentedControl.tsx
 * @input Uses React, StyleX, SegmentedControlContext, useListFocus,
 *   useKeyboardHint, useTouchPresentation, useSegmentedSelectionMotion,
 *   segmentedControlClassName
 * @output Exports SegmentedControl component and SegmentedControlProps type
 * @position Container wrapper; provides context to SegmentedControlItem children
 *
 * SYNC: When modified, update:
 * - /packages/core/src/SegmentedControl/SegmentedControl.doc.mjs
 * - /packages/core/src/SegmentedControl/index.ts
 * - /packages/core/src/SegmentedControl/SegmentedControl.test.tsx
 * - /packages/core/src/SegmentedControl/useSegmentedSelectionMotion.ts
 * - /packages/cli/assets/templates/blocks/components/SegmentedControl/ (showcase blocks)
 */

import React, {useMemo, useCallback, useRef, type ReactNode} from 'react';
import {SegmentedControlContext} from './SegmentedControlContext';
import {segmentedControlClassName} from './segmentedControlClasses';
import {useInternalListFocus} from '../hooks/useListFocus';
import {isSegmentDisabledOnItsOwn} from '../privateAttributes/segmentDisabled.stylex';
import {useKeyboardHint} from '../hooks/useKeyboardHint';
import {useTooltip} from '../Tooltip';
import type {
  SegmentedControlSize,
  SegmentedControlLayout,
} from './SegmentedControlContext';
import {mergeProps, composeEventHandlers} from '../utils';
import {xstyleProps} from '../utils/xstyle';
import {joinAriaIDs} from '../utils/inputAria';
import {useSize} from '../SizeContext/SizeContext';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';

import {useMergedRefs} from '../hooks/useMergedRefs';
import {tw} from '../utils/tw';
import {useTouchPresentation} from '../utils/touchPresentation';
import {useSegmentedSelectionMotion} from './useSegmentedSelectionMotion';

export interface SegmentedControlProps extends Omit<
  BaseProps<HTMLDivElement>,
  'onChange'
> {
  ref?: React.Ref<HTMLDivElement>;
  /**
   * The currently selected value (controlled).
   */
  value: string;
  /**
   * Callback fired when a segment is selected.
   */
  onChange: (value: string) => void;
  /**
   * Accessible label for the radio group (used as aria-label, never rendered visually).
   */
  label: string;
  /**
   * Size variant for the control.
   * @default 'md'
   */
  size?: SegmentedControlSize;
  /**
   * Layout mode for segment sizing.
   * - `'hug'` (default): the control and each segment hug their content width,
   *   capped at the container (segment labels truncate when it is too narrow).
   * - `'fill'`: segments stretch equally to fill the container width.
   * @default 'hug'
   */
  layout?: SegmentedControlLayout;
  /**
   * Whether the entire control is disabled. The selected segment keeps the
   * control's Tab stop, announced as disabled (`aria-disabled`), and nothing
   * can be selected.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Explains why the control is disabled. Applies to the whole-group disabled
   * state (`isDisabled`), not individual segments. When set together with
   * `isDisabled`, the control shows a tooltip with this text on hover and
   * keyboard focus, and the reason describes each segment for assistive
   * technology. Selection stays blocked.
   *
   * Use this instead of wrapping a disabled control in `Tooltip`, so the
   * reason is attached to the control itself.
   */
  disabledMessage?: string;
  /**
   * SegmentedControlItem children.
   */
  children: ReactNode;
}

/**
 * Segmented button group for single selection (radio group semantics).
 * Visually resembles a tab bar but controls a value, not a view.
 *
 * @example
 * ```
 * <SegmentedControl value={view} onChange={setView} label="View mode">
 *   <SegmentedControlItem value="grid" label="Grid" />
 *   <SegmentedControlItem value="list" label="List" />
 *   <SegmentedControlItem value="table" label="Table" />
 * </SegmentedControl>
 * ```
 */
export function SegmentedControl({
  ref,
  value,
  onChange,
  label,
  size: sizeProp,
  layout = 'hug',
  isDisabled = false,
  disabledMessage,
  children,
  xstyle,
  className,
  style,
  onKeyDown: onKeyDownProp,
  onFocus: onFocusProp,
  onBlur: onBlurProp,
  'aria-describedby': ariaDescribedByProp,
  ...rest
}: SegmentedControlProps) {
  const size = useSize(sizeProp, 'md');
  // A touch device (a coarse primary pointer) gets UIKit's motion: the
  // selection slides on a spring. Under a mouse it slides on the theme's
  // duration and easing.
  const isTouchPresentation = useTouchPresentation().isTouch;
  const trackRef = useRef<HTMLDivElement | null>(null);
  // Every pointer's press is tracked. A drag from the selected segment
  // carries the lens, and the lift commits the segment nearest the pointer.
  // A lift outside the control commits nothing.
  const {selection, attachTrack} = useSegmentedSelectionMotion(
    trackRef,
    value,
    isTouchPresentation,
    !isDisabled,
  );

  // Disabled-reason tooltip. Applies to the whole-group disabled state. The
  // tooltip listeners attach to the radiogroup container, which keeps pointer
  // events while disabled; the radios stay perceivable via aria-disabled.
  // Selection is blocked by the isDisabled guards in the click/focus handlers.
  const showsDisabledMessage = isDisabled && !!disabledMessage;
  const disabledMessageTooltip = useTooltip({
    placement: 'above',
    // The radiogroup container is not naturally focusable; focusin bubbles up
    // from the radios, so always attach focus listeners.
    focusTrigger: 'always',
    isEnabled: showsDisabledMessage,
  });

  // Roving tabindex + arrow/Home/End navigation is owned by the shared
  // useListFocus primitive: it stamps a single tab stop (tabIndex 0/-1) across
  // the radios, skips disabled ones, wraps at the ends, handles Home/End, and
  // repairs the tab stop on mount and whenever items mount/disable — replacing
  // the component's former inline keyboard handler and tab-stop repair effect.
  const {listRef, handleKeyDown, handleFocus} =
    useInternalListFocus<HTMLDivElement>({
      itemSelector: '[role="radio"]:not([aria-disabled="true"])',
      hasRovingTabIndex: true,
      // One Tab stop, placed by the control (FR2, FR7): the selected segment,
      // enabled or not and in a disabled control too, else the first segment
      // not disabled by its own isDisabled, else the first.
      tabStopOrder: orderTabStop,
      wrap: true,
      orientation: 'horizontal',
    });

  const hint = useKeyboardHint({
    orientation: 'horizontal',
    isEnabled: !isDisabled,
  });

  const handleContainerKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      selection.keyPressed();
      onKeyDownProp?.(e);
      if (e.defaultPrevented) {
        return;
      }
      hint.onKeyDown(e);
      handleKeyDown(e);
    },
    [selection, onKeyDownProp, hint, handleKeyDown],
  );

  // Selection-follows-focus (APG radiogroup): useListFocus only *moves* focus,
  // so whenever it lands focus on a new radio (arrow/Home/End, or a click) we
  // select that radio's value. Reading the focused element's data-value here
  // keeps selection in lockstep with focus without duplicating the navigation
  // logic. Disabled radios are ignored (they should never become the value),
  // and the already-selected value is skipped so an initial Tab-in (or a click
  // on the current segment) is a no-op, matching click behavior.
  const handleContainerFocus = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      onFocusProp?.(e);
      if (e.defaultPrevented) {
        return;
      }
      hint.onFocus(e);
      handleFocus(e);
      if (isDisabled) {
        return;
      }
      // Only select when focus moved WITHIN the group (arrow/Home/End — APG
      // selection-follows-focus). When focus is entering from outside, Tab
      // must stay a pure focus move: with an unmatched or disabled-selected
      // value the roving tab stop falls back to the first enabled radio, and
      // selecting it here would rewrite the form value on mere traversal.
      // Clicks are unaffected: the item's own handleClick selects.
      if (!e.currentTarget.contains(e.relatedTarget)) {
        return;
      }
      // A mouse or pen press moves focus at pointerdown. A finger moves it
      // after the lift, before the tap's click. The press commits through
      // that click, so this focus move selects nothing.
      if (selection.isPressing()) {
        return;
      }
      const focused = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        '[role="radio"][data-value]',
      );
      if (!focused || focused.getAttribute('aria-disabled') === 'true') {
        return;
      }
      const nextValue = focused.dataset.value;
      if (nextValue != null && nextValue !== value) {
        onChange(nextValue);
      }
    },
    [onFocusProp, hint, handleFocus, isDisabled, onChange, selection, value],
  );

  const contextValue = useMemo(
    () => ({
      value,
      onChange,
      size,
      layout,
      isDisabled,
      disabledReasonID: showsDisabledMessage
        ? disabledMessageTooltip.describedBy
        : undefined,
      isTouchPresentation,
    }),
    [
      value,
      onChange,
      size,
      layout,
      isDisabled,
      showsDisabledMessage,
      disabledMessageTooltip.describedBy,
      isTouchPresentation,
    ],
  );

  return (
    <SegmentedControlContext value={contextValue}>
      <div
        ref={useMergedRefs(
          ref,
          listRef,
          trackRef,
          attachTrack,
          disabledMessageTooltip.ref,
        )}
        {...rest}
        role="radiogroup"
        aria-label={label}
        aria-disabled={isDisabled || undefined}
        // A caller aria-describedby comes before the disabled reason.
        aria-describedby={joinAriaIDs(
          ariaDescribedByProp,
          showsDisabledMessage ? disabledMessageTooltip.describedBy : undefined,
        )}
        onKeyDown={handleContainerKeyDown}
        onFocus={handleContainerFocus}
        onBlur={composeEventHandlers(onBlurProp, hint.onBlur)}
        {...mergeProps(
          themeProps('segmented-control', {size}),
          xstyleProps(xstyle),
          tw(
            segmentedControlClassName({
              isFill: layout === 'fill',
              isDisabled,
              // A disabled control keeps no lens: the segments fade as a whole.
              showsLens: isTouchPresentation || !isDisabled,
            }),
            className,
          ),
          style,
        )}>
        {children}
        {hint.hintElement}
      </div>
      {showsDisabledMessage &&
        disabledMessageTooltip.renderTooltip(disabledMessage)}
    </SegmentedControlContext>
  );
}

SegmentedControl.displayName = 'SegmentedControl';

/**
 * The control's segments, its Tab stop first: the selected segment, enabled
 * or not, else the first segment not disabled by its own isDisabled, else the
 * first (FR2, FR7).
 */
function orderTabStop(list: HTMLElement): ReadonlyArray<HTMLElement> {
  const segments = Array.from(
    list.querySelectorAll<HTMLElement>('[role="radio"]'),
  );
  const stop =
    segments.find(segment => segment.getAttribute('aria-checked') === 'true') ??
    segments.find(segment => !isSegmentDisabledOnItsOwn(segment)) ??
    segments[0];
  return stop == null
    ? []
    : [stop, ...segments.filter(segment => segment !== stop)];
}
