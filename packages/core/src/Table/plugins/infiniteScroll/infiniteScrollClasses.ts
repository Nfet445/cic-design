// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file infiniteScrollClasses.ts
 * @input Tailwind utilities
 * @output Exports the viewport, command, surface and sentinel classes
 * @position Table infinite-scroll plugin; read by useTableInfiniteScroll
 */

import {tw} from '../../../utils/tw';

/**
 * Grid gives the existing content box the table's intrinsic inline extent,
 * without size containment suppressing its contribution to shrink-to-fit
 * hosts.
 */
export const INFINITE_SCROLL_VIEWPORT_CLASS = 'grid';

/** The load command spans the viewport at its start block edge. */
export const INFINITE_SCROLL_COMMAND_CLASS = 'sticky start-0 end-0';

export const INFINITE_SCROLL_SURFACE_CLASS = tw(
  'flex flex-col items-center py-2 gap-2',
);

export const INFINITE_SCROLL_SENTINEL_CLASS = 'h-px w-full shrink-0';
