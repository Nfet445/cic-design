// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file chatVirtualizerClasses.ts
 * @input Accepts nothing: every class is fixed
 * @output The utility class strings the content block, the own scroller and
 *   the hidden viewport probe carry
 * @position Style primitives; the Tailwind build scans it for class names
 */

import {tw} from '../tw';

/**
 * `flow-root` keeps row margins inside the block, as the scroller did before
 * this block existed. In a column-flex host scroller (attach mode) the block
 * is a flex item, so `shrink-0` and `self-stretch` stop it being compressed to
 * fit, which would corrupt the geometry the spacers describe.
 */
export const chatVirtualizerContentClassName = tw(
  'flow-root shrink-0 self-stretch',
);

/** The own scroller positions nothing itself; `relative` keeps a row's
 * absolutely positioned parts inside it. */
export const chatVirtualizerScrollerClassName = 'relative';

/** A fixed box the viewport's size, behind everything and out of the way. */
export const chatVirtualizerViewportProbeClassName = tw(
  'fixed inset-0 invisible pointer-events-none -z-10',
);
