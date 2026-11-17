// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file switchClasses.ts
 * @input The switch's size, whether its label is hidden, the label spacing and
 *   the field's width
 * @output The field root, the row, the track's box, the thumb's circle and
 *   travel, the label column, the status gap and the sizing custom property
 * @position Internal to Switch; the Tailwind build scans it for class names
 *
 * The track's and thumb's paints read the `switchScope` marker and the
 * `switchFocusInput` marker (hover tint, press layers, focus ring) or carry
 * keyframes, so they stay StyleX. Everything without a marker is a class here.
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import type {CSSProperties} from 'react';
import type {SizeValue} from '../utils/types';
import {tw} from '../utils/tw';

/** The track box of each size, in Tailwind's spacing scale (w × h). */
const WRAPPER_SIZE: Record<'sm' | 'md', string> = {
  sm: 'h-5 w-8',
  md: 'h-6 w-10',
};

/**
 * The track's box and inset, per size. Its padding is the thumb's resting
 * inset under a finger.
 */
const TRACK_BOX: Record<'sm' | 'md', string> = {
  sm: 'h-5 w-8 p-0.5',
  md: 'h-6 w-10 p-1',
};

/**
 * The thumb, per size and state: its circle, its resting inset under a finger
 * and its travel under a mouse. A finger moves the thumb by its insets, so the
 * travel's coarse arm clears it; the animator writes the drag's `translate`
 * inline (`useSwitchTouch`). The travel flips sign under RTL, where the
 * reading-end edge is the left one.
 */
const THUMB_BOX: Record<'sm' | 'md', {off: string; on: string}> = {
  sm: {
    off: 'h-3.5 w-3.5 pointer-coarse:start-[3px]',
    on: tw(
      'h-4 w-4 pointer-coarse:end-0.5',
      '[transform:translateX(12px)] rtl:[transform:translateX(-12px)] pointer-coarse:[transform:none]',
    ),
  },
  md: {
    off: 'h-4 w-4 pointer-coarse:start-[4px]',
    on: tw(
      'h-5 w-5 pointer-coarse:end-0.5',
      '[transform:translateX(14px)] rtl:[transform:translateX(-14px)] pointer-coarse:[transform:none]',
    ),
  },
};

/** The label column's floor: the track's height. */
const LABEL_SIZE: Record<'sm' | 'md', string> = {
  sm: 'min-h-5',
  md: 'min-h-6',
};

/**
 * The custom property a consumer's `width` reaches the field root through. The
 * width is a per-instance value no class can name, so the component sets the
 * property inline and the class reads it.
 */
export const switchSizeVars = {
  width: '--astryx-switch-width',
} as const;

type SwitchSizingStyle = CSSProperties &
  Partial<Record<(typeof switchSizeVars)[keyof typeof switchSizeVars], string>>;

/** A width prop as the inline value its class reads; a number is pixels. */
export function switchSizeStyle(
  width: SizeValue | null | undefined,
): SwitchSizingStyle {
  const style: SwitchSizingStyle = {};
  if (width != null) {
    style[switchSizeVars.width] =
      typeof width === 'number' ? `${width}px` : width;
  }
  return style;
}

/**
 * The field root: it sizes the label, the control and the status together.
 * A label on the start side is the row's own flex order, so only the spread
 * and the hidden label change it.
 */
export function switchClassName({
  width,
}: {
  width: SizeValue | null | undefined;
}) {
  return tw(width != null && 'w-[var(--astryx-switch-width)]');
}

/**
 * The label and switch row. A hidden label is sr-only, so its wrapper is a
 * zero-width flex item and the row gap would still paint beside the track.
 */
export function switchContainerClassName({
  isLabelHidden,
  isSpread,
}: {
  isLabelHidden: boolean;
  isSpread: boolean;
}): string {
  return tw(
    'flex items-center gap-2',
    isLabelHidden && 'gap-0',
    isSpread && 'w-full justify-between',
  );
}

/**
 * The track and its input. Under a coarse pointer the wrapper contains the
 * measured hit area, and horizontal touch moves are the switch's drag while
 * vertical ones stay the page's scroll.
 */
export function switchWrapperClassName({
  size,
  isInteractive,
}: {
  size: 'sm' | 'md';
  isInteractive: boolean;
}): string {
  return tw(
    'relative isolate flex shrink-0 items-center',
    WRAPPER_SIZE[size],
    isInteractive && '[touch-action:pan-y_pinch-zoom]',
  );
}

/** The track's box and inset, per size. */
export function switchTrackBoxClassName({size}: {size: 'sm' | 'md'}): string {
  return TRACK_BOX[size];
}

/** The thumb's circle, resting inset and mouse travel, per size and state. */
export function switchThumbBoxClassName({
  size,
  isOn,
}: {
  size: 'sm' | 'md';
  isOn: boolean;
}): string {
  return THUMB_BOX[size][isOn ? 'on' : 'off'];
}

/** The label and description column, as tall as the track. */
export function switchLabelWrapperClassName({
  size,
}: {
  size: 'sm' | 'md';
}): string {
  return tw('flex flex-col justify-center', LABEL_SIZE[size]);
}

/** The status message under the field. */
export const switchStatusClassName = 'mt-2';
