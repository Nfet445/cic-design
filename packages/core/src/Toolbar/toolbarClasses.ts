// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file toolbarClasses.ts
 * @input Toolbar orientation, size, gap, lane layout and the edge-compensation
 *   inset Section owns
 * @output Utility class strings for the toolbar row, its three or two lanes,
 *   and the tab-indicator offset a bottom divider hands to a nested TabList
 * @position Style primitives; scanned by the Tailwind build
 *
 * The side lane's flex basis depends on whether its first or last child is
 * edge-compensated, which is a `:has()` state of the lane itself; the amount
 * arrives as `--astryx-toolbar-lane-inset` because it is a `calc()` over the
 * container's padding. The basis classes only read that variable, so no
 * declaration lands inline.
 */

import {tw} from '../utils/tw';
import type {SpacingStep} from '../utils/types';

/** The lane inset an edge-compensated child pulls the lane in by. */
export const toolbarLaneInsetVar = '--astryx-toolbar-lane-inset';

/** The gap between items inside a lane, one class per spacing step. */
const gapClasses: Record<SpacingStep, string> = {
  0: 'gap-0',
  0.5: 'gap-0.5',
  1: 'gap-1',
  1.5: 'gap-1.5',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  8: 'gap-8',
  10: 'gap-10',
};

const ROW_CLASSES = {
  twoSlot: 'flex items-center justify-between',
  // Three-lane layout: the row wraps before the center lane overlaps a side
  // lane, so the lanes never share one line once they stop fitting.
  threeLane: 'flex flex-wrap items-center',
} as const;

const ORIENTATION_CLASSES = {
  // Lanes stay side by side in a vertical toolbar too; only the cross-axis
  // alignment follows the orientation.
  horizontal: '',
  vertical: 'flex-col items-stretch',
  verticalThreeLane: 'items-stretch',
} as const;

const SLOT_CLASSES = {
  start: 'flex items-center',
  center:
    'flex items-center justify-center [flex-grow:1000] [flex-shrink:1] [flex-basis:min-content] min-w-0 max-w-max',
  // A lane keeps its controls on one line, so the row wraps first; only a
  // lane wider than the toolbar wraps its own controls.
  sideLane: '[flex-grow:1] [flex-shrink:1] flex-wrap min-w-fit',
  end: 'flex items-center justify-end',
  startOnly: '[flex:1_1_0%]',
  endOnly: 'ms-auto',
} as const;

/**
 * The lane's basis with and without edge compensation. Flex counts the
 * negative margin the compensation applies toward the lane's share of the
 * row, so the basis gives that width back and the center stays at the middle.
 */
const LANE_BASIS_CLASSES = tw(
  '[flex-basis:0px]',
  '[&:has(>_[data-astryx-edge-comp]:first-child)]:[flex-basis:var(--astryx-toolbar-lane-inset)]',
  '[&:has(>_[data-astryx-edge-comp]:last-child)]:[flex-basis:var(--astryx-toolbar-lane-inset)]',
  '[&:has(>_[data-astryx-edge-comp]:first-child):has(>_[data-astryx-edge-comp]:last-child)]:[flex-basis:calc(2*var(--astryx-toolbar-lane-inset))]',
);

/**
 * The negative margin a lane takes when its first or last child is
 * edge-compensated. It reads the same `--astryx-toolbar-lane-inset` the
 * compensated basis does, so the pull and the basis never disagree.
 */
export const toolbarLaneCompensationClassName = tw(
  '[&:has(>_[data-astryx-edge-comp]:first-child)]:ms-[calc(-1*var(--astryx-toolbar-lane-inset))]',
  '[&:has(>_[data-astryx-edge-comp]:last-child)]:me-[calc(-1*var(--astryx-toolbar-lane-inset))]',
);

/** The row's minimum height, which keeps it on one element line. */
const MIN_HEIGHT_CLASSES = 'min-h-[var(--size-element-sm)]';

/**
 * The offset a bottom divider drops a tab's indicator through the toolbar's
 * block padding onto its rail.
 */
const TAB_INDICATOR_ON_RAIL_CLASSES =
  '[--_tab-indicator-bottom:calc(-1*(var(--spacing-2)+1px))]';

export interface ToolbarRowClassNameOptions {
  gap: SpacingStep;
  hasCenterContent: boolean;
  isVertical: boolean;
}

/** The gap inside a lane, and between the lanes of a row. */
export function toolbarGapClassName(gap: SpacingStep): string {
  return gapClasses[gap];
}

/** The row: its lane layout, orientation, minimum height and gap. */
export function toolbarRowClassName({
  gap,
  hasCenterContent,
  isVertical,
}: ToolbarRowClassNameOptions): string {
  return tw(
    hasCenterContent ? ROW_CLASSES.threeLane : ROW_CLASSES.twoSlot,
    isVertical &&
      (hasCenterContent
        ? ORIENTATION_CLASSES.verticalThreeLane
        : ORIENTATION_CLASSES.vertical),
    MIN_HEIGHT_CLASSES,
    toolbarGapClassName(gap),
  );
}

/** The start lane of a two-slot row. */
export function toolbarStartSlotClassName(): string {
  return SLOT_CLASSES.start;
}

/** The end lane of a two-slot row. */
export function toolbarEndSlotClassName(): string {
  return SLOT_CLASSES.end;
}

/**
 * A three-lane row's side lane: its slot, the lane wrap, the compensated
 * basis, and the gap inside it.
 */
export function toolbarSideLaneClassName({
  end,
  gap,
}: {
  end: boolean;
  gap: SpacingStep;
}): string {
  return tw(
    end ? SLOT_CLASSES.end : SLOT_CLASSES.start,
    SLOT_CLASSES.sideLane,
    LANE_BASIS_CLASSES,
    gapClasses[gap],
  );
}

/** The center lane, which grows to hold the middle of the row. */
export function toolbarCenterSlotClassName(): string {
  return SLOT_CLASSES.center;
}

/** The single lane a two-slot row fills with the content it has. */
export function toolbarLoneStartSlotClassName(): string {
  return tw(SLOT_CLASSES.start, SLOT_CLASSES.startOnly);
}

export function toolbarLoneEndSlotClassName(): string {
  return tw(SLOT_CLASSES.end, SLOT_CLASSES.endOnly);
}

/** Appended when a bottom divider is present and the lanes share one line. */
export function toolbarTabIndicatorClassName(): string {
  return TAB_INDICATOR_ON_RAIL_CLASSES;
}
