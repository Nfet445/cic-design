// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SegmentedControlItem.tsx
 * @input Uses React, StyleX, SegmentedControlContext, segmentedItemClassName
 * @output Exports SegmentedControlItem component and SegmentedControlItemProps type
 * @position Child item; renders as a radio button within the segmented control
 *
 * SYNC: When modified, update:
 * - /packages/core/src/SegmentedControl/useSegmentedSelectionMotion.ts (the title marker)
 * - /packages/core/src/SegmentedControl/SegmentedControl.doc.mjs
 * - /packages/core/src/SegmentedControl/index.ts
 * - /packages/core/src/SegmentedControl/SegmentedControl.test.tsx
 * - /packages/cli/assets/templates/blocks/components/SegmentedControl/ (showcase blocks)
 */

import React, {type ReactNode} from 'react';
import {joinAriaIDs} from '../utils/inputAria';
import {segmentDisabledProps} from '../privateAttributes/segmentDisabled.stylex';
import {segmentTitleProps} from '../privateAttributes/segmentTitle.stylex';
import {
  SEGMENT_ICON_CLASS,
  SEGMENT_LABEL_CLASS,
  segmentedItemClassName,
  segmentedItemIconSizeClassName,
} from './segmentedControlClasses';
import {useSegmentedControlContext} from './SegmentedControlContext';
import type {SegmentedControlSize} from './SegmentedControlContext';
import {mergeProps, composeEventHandlers} from '../utils';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';
import {focusOutlineFocusVisibleClassName} from '../utils/focusOutlineClasses';
import * as stylex from '@stylexjs/stylex';
import {interactionOverlayStyles} from '../utils/interactionOverlay.stylex';
import {usePressFeedback} from '../hooks/usePressFeedback';
import {isRenderable} from '../utils/isRenderable';
import {useMergedRefs} from '../hooks/useMergedRefs';
import {useTouchHitArea} from '../utils/touchHitArea';
import {touchHitAreaStyles} from '../internal/touchHitArea.stylex';
import {tw} from '../utils/tw';

export interface SegmentedControlItemProps extends BaseProps<HTMLButtonElement> {
  ref?: React.Ref<HTMLButtonElement>;
  /**
   * Unique value for this segment. Matched against the parent's value.
   */
  value: string;
  /**
   * Accessible label for this segment (required for accessibility).
   * Used as visible text, or as aria-label when isLabelHidden is true.
   */
  label: string;
  /**
   * Whether the label is visually hidden. When true, only the icon is
   * displayed and the label is used as aria-label for accessibility.
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Icon element displayed before the label.
   */
  icon?: ReactNode;
  /**
   * Whether this individual item is disabled.
   * @default false
   */
  isDisabled?: boolean;
}

/**
 * Individual segment item within an SegmentedControl.
 * Renders as a radio button with visual segment styling.
 *
 * @example
 * ```
 * <SegmentedControlItem value="grid" label="Grid" icon={<GridIcon />} />
 * ```
 */
export function SegmentedControlItem({
  ref,
  value,
  label,
  isLabelHidden = false,
  icon,
  isDisabled = false,
  onClick: onClickProp,
  xstyle,
  className,
  style,
  'aria-describedby': ariaDescribedByProp,
  ...rest
}: SegmentedControlItemProps) {
  const pressable = usePressFeedback();
  const ctx = useSegmentedControlContext();

  const isSelected = ctx.value === value;
  const isItemDisabled = isDisabled || ctx.isDisabled;
  const size: SegmentedControlSize = ctx.size;
  const isFill = ctx.layout === 'fill';

  // Consumer-first: a consumer onClick can call preventDefault() to opt out of
  // selection; otherwise selection proceeds when enabled and not selected.
  // A disabled segment invokes no caller callback (spec:AST-085 FR2), so the
  // consumer onClick is left out while it is disabled, including the selected
  // segment of a group disabled with a reason, which stays focusable.
  const handleClick = composeEventHandlers(
    isItemDisabled ? undefined : onClickProp,
    () => {
      if (!isItemDisabled && !isSelected) {
        ctx.onChange(value);
      }
    },
  );

  // A disabled segment takes no taps, so it gets no band.
  const hasHitArea = !isItemDisabled;
  const segmentRef = useMergedRefs(ref, useTouchHitArea(hasHitArea));

  const iconElement = isRenderable(icon) ? (
    <span
      className={tw(SEGMENT_ICON_CLASS, segmentedItemIconSizeClassName(size))}>
      {icon}
    </span>
  ) : null;

  return (
    <button
      ref={segmentRef}
      {...rest}
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-disabled={isItemDisabled || undefined}
      aria-label={isLabelHidden ? label : undefined}
      // A caller description, then the group's disabled reason, which
      // describes each segment (FR7).
      aria-describedby={joinAriaIDs(ariaDescribedByProp, ctx.disabledReasonID)}
      data-value={value}
      // The group's fallback Tab stop skips segments disabled on their own.
      {...segmentDisabledProps(isDisabled)}
      {...(!isSelected && !isItemDisabled ? pressable : undefined)}
      // The selected segment holds the Tab stop, disabled or not (spec:AST-085
      // FR1); activation stays blocked by the isItemDisabled guard. With no
      // selected segment, the group places the stop (SegmentedControl FR2).
      tabIndex={isSelected ? 0 : -1}
      onClick={handleClick}
      {...mergeProps(
        themeProps('segmented-control-item', {
          size,
          selected: isSelected ? 'selected' : null,
          disabled: isItemDisabled ? 'disabled' : null,
        }),
        stylex.props(
          // The shared hover and pressed overlay, on the segments a press can
          // change: the selected segment keeps its raised surface as it is.
          !isSelected &&
            !isItemDisabled &&
            interactionOverlayStyles.backgroundColor,
          hasHitArea && touchHitAreaStyles.layer,
          xstyle,
        ),
        tw(
          segmentedItemClassName({
            size,
            isSelected,
            isDisabled: isItemDisabled,
            isFill,
            isLabelHidden,
            isTouchPresentation: ctx.isTouchPresentation === true,
          }),
          focusOutlineFocusVisibleClassName,
          className,
        ),
        style,
      )}>
      {iconElement}
      {!isLabelHidden && (
        <span {...segmentTitleProps} className={SEGMENT_LABEL_CLASS}>
          {label}
        </span>
      )}
    </button>
  );
}

SegmentedControlItem.displayName = 'SegmentedControlItem';
