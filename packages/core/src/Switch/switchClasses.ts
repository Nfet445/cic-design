// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file switchClasses.ts
 * @input The switch's size, whether its label is hidden, the label spacing and
 *   the field's width
 * @output The field root, the row, the input, the track's box and fill, the
 *   thumb's circle, travel and fill, the label column, the status gap and the
 *   sizing custom property
 * @position Internal to Switch; the Tailwind build scans it for class names
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
  return tw(TRACK_BOX[size], '[&::before]:z-[1]');
}

/**
 * The native input: it covers the track, so a click anywhere on the track
 * toggles, and it is invisible. The measured hit insets grow its box under a finger.
 */
export function switchInputClassName({isBusy}: {isBusy: boolean}): string {
  return tw(
    'absolute top-1/2 left-1/2 z-[1] m-0 p-0 opacity-0 w-full h-full',
    '[transform:translate(-50%,-50%)]',
    'pointer-coarse:w-[calc(100%+var(--astryx-hit-inset-left,0px)+var(--astryx-hit-inset-right,0px))]',
    'pointer-coarse:h-[calc(100%+var(--astryx-hit-inset-top,0px)+var(--astryx-hit-inset-bottom,0px))]',
    'pointer-coarse:[transform:translate(calc(-50%_+_(var(--astryx-hit-inset-right,0px)-var(--astryx-hit-inset-left,0px))/2),calc(-50%_+_(var(--astryx-hit-inset-bottom,0px)-var(--astryx-hit-inset-top,0px))/2))]',
    // aria-disabled, not disabled: a disabled switch stays focusable.
    'cursor-pointer aria-disabled:cursor-default',
    isBusy && 'pointer-events-none',
  );
}

/**
 * The track's fill, colour fade and bounds. Forced colors keeps a system-colour
 * border, and the on/off fills take their own system colours, so the two states
 * stay distinguishable under Windows High Contrast (WCAG 1.4.11). The hover
 * tint and the mouse press read the `switchScope` marker and stay StyleX.
 *
 * Under a finger the track's fill changes at once and the fade layer (::after)
 * crossfades it on the compositor; reduced motion stops both. The fade layer's
 * colour is what the track is leaving, or mid-drag the one it heads to, read
 * from the track by switchFill.ts. The animator owns its opacity, and at rest
 * it is clear.
 */
export function switchTrackClassName({
  size,
  isOn,
  isDisabled,
}: {
  size: 'sm' | 'md';
  isOn: boolean;
  isDisabled: boolean;
}): string {
  return tw(
    'box-border flex items-center rounded-full border-0',
    TRACK_BOX[size],
    // Under a finger the press layer (::before), the colour fade (::after) and
    // the thumb sit in the track, in a stacking context of its own.
    'pointer-coarse:relative pointer-coarse:isolate',
    'transition-[background-color] duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
    'pointer-coarse:[transition-duration:0s] motion-reduce:[transition-duration:0s]',
    isOn
      ? 'bg-[var(--color-accent)] forced-colors:bg-[color:Highlight]'
      : 'bg-[var(--color-background-gray)] forced-colors:bg-[color:Canvas]',
    'forced-colors:border forced-colors:border-solid',
    // Opacity dimming does not survive forced colors; GrayText is the
    // platform's disabled affordance there.
    isDisabled
      ? 'opacity-50 forced-colors:border-[color:GrayText]'
      : 'forced-colors:border-[color:CanvasText]',
    "after:content-[''] after:hidden after:absolute after:inset-0 after:z-0 after:rounded-[inherit] after:pointer-events-none after:opacity-0 after:bg-[var(--_switch-fade-fill,transparent)]",
    // A compositing layer only while a fade runs. The animator sets the
    // property in the task that starts the fade: iOS Safari needs that to run
    // the fade off the main thread. It clears it after the fade rests.
    'pointer-coarse:after:block pointer-coarse:after:will-change-[var(--astryx-motion-will-change-after,auto)]',
  );
}

/**
 * The thumb's fill, slide and lifted shadow. Under a finger it sits in the
 * track, centered in its height, above the colour fade (::after) and the press
 * layer (::before), and useSwitchTouch moves and lifts it on the compositor:
 * nothing of its own transitions. Its circle, resting inset and mouse travel
 * are switchThumbBoxClassName's. The press on the thumb reads `switchScope`
 * and stays StyleX.
 *
 * Forced colors takes the thumb's fill per state, so it reads against the
 * track's system colour: CanvasText on the empty track, HighlightText on the
 * Highlight one.
 */
export function switchThumbClassName({isOn}: {isOn: boolean}): string {
  return tw(
    'flex items-center justify-center rounded-full',
    'pointer-coarse:absolute pointer-coarse:inset-y-0 pointer-coarse:my-auto pointer-coarse:z-[2] pointer-coarse:pointer-events-none',
    'transition-[transform,width,height] duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
    // Under reduced motion nothing slides: under a finger the thumb
    // cross-fades through the animator, and with a mouse it moves at once.
    'pointer-coarse:transition-none motion-reduce:[transition-duration:0s]',
    isOn
      ? 'bg-[var(--color-background-surface)] forced-colors:bg-[color:HighlightText]'
      : 'bg-[var(--color-background-surface)] forced-colors:bg-[color:CanvasText]',
    // The lifted shadow, under a finger: the theme's elevation on a layer the
    // thumb's size. It fades in with the lift on the compositor, and at rest it
    // is clear.
    "after:content-[''] after:hidden after:absolute after:inset-0 after:rounded-[inherit] after:pointer-events-none after:opacity-0 after:shadow-[var(--shadow-low)]",
    'pointer-coarse:after:block pointer-coarse:after:will-change-[var(--astryx-motion-will-change-after,auto)]',
  );
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

// The row owns the press through a drag; its track and thumb release on the compositor.
/* eslint-disable @astryx/no-raw-private-attribute -- Switch owns its scope here. The utility scanner requires literal selectors. */
export const switchScopeProps = {'data-astryx-switch-scope': ''};

// The shared unlayered strength release yields to the compositor layers under a finger.
export const switchPressOwnerClassName = tw(
  'data-[astryx-press=fading]:motion-reduce:[animation-name:none]!',
  'data-[astryx-press=fading]:pointer-coarse:[animation-name:none]!',
);

export const switchFocusRingClassName = tw(
  '[outline-style:none]',
  '[[role=switch]:focus-visible_+_&]:[outline:var(--focus-outline-width)_var(--focus-outline-style)_var(--focus-outline-color)]',
  '[[role=switch]:focus-visible_+_&]:[outline-offset:var(--focus-outline-offset)]',
);

export const switchTrackHoverClassName = {
  on: '[@media(hover:hover)_and_(forced-colors:none)]:[[data-astryx-switch-scope]:hover_&]:bg-[color:color-mix(in_srgb,var(--color-accent),var(--color-tint-hover)_15%)]',
  off: '[@media(hover:hover)_and_(forced-colors:none)]:[[data-astryx-switch-scope]:hover_&]:bg-[color:color-mix(in_srgb,var(--color-background-gray),var(--color-tint-hover)_5%)]',
};

/* eslint-enable @astryx/no-raw-private-attribute */

export const switchPressLayerClassName = 'astryx-switch-press-layer';
