// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file stepperClasses.ts
 * @input The stepper's orientation, whether the indicators sit on the track,
 *   and — on the root — which of the two roots a consumer styles
 * @output The ordered list, the horizontal frame, the summary row and its body
 *   as Tailwind class strings
 * @position Internal to Stepper; the Tailwind build scans it for class names
 *
 * `--step-connector-gap` is the public variable Step reads: the root declares
 * it as `inherit` so a theme can set it on the `stepper` target without hiding
 * a value the frame wrote, and the frame resets it to `0px` for its own track.
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from '../utils/tw';

/** The ordered list, which is a root on its own form and the frame's child. */
export function stepperRootClassName({
  orientation,
  isOnTrack,
}: {
  orientation: 'horizontal' | 'vertical';
  isOnTrack: boolean;
}): string {
  return tw(
    'flex w-full list-none m-0 p-0 [--step-connector-gap:inherit]',
    orientation === 'horizontal' ? 'flex-row items-start' : 'flex-col',
    // The gap between steps is the break between connector segments, so it
    // matches the connector's own thickness; on-track steps abut so their
    // segments form one continuous line.
    isOnTrack ? 'gap-0' : 'gap-1',
  );
}

/** The horizontal component's public layout box, holding track and summary. */
export const stepperFrameClassName = tw(
  'flex w-full flex-col gap-0 [--step-connector-gap:0px]',
);

/** The compact row: a control at each edge the flow moves between, name between. */
export const stepperSummaryClassName = tw(
  'flex items-center justify-between gap-2 min-w-0',
);

/** Centred, so the name sits under the middle of the track. */
export const stepperSummaryBodyClassName = tw(
  'flex grow flex-col min-w-0 text-center',
);
