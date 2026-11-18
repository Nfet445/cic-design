// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file chartClasses.ts
 * @input The theme's spacing variable
 * @output The utility class strings a chart's frame, title and plot area carry
 * @position Style primitives; the Tailwind build scans it for class names
 */

import {tw} from './tw';

export const chartContainerClassName = 'w-full';

/** The title sits one step off the plot area it names. */
export const chartTitleClassName = '[margin-block-end:var(--spacing-4)]';

/** The plot area fills the frame and clips a mark that overflows it. */
export const chartAreaClassName = tw('flex-1', 'min-w-0', 'overflow-clip');
