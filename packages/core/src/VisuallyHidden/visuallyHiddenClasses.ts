// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file VisuallyHidden/visuallyHiddenClasses.ts
 * @input None
 * @output visuallyHiddenClassName: the canonical "visually hidden" clip block
 * @position The only style VisuallyHidden applies; read by VisuallyHidden and
 *   the package stylesheet test
 */

import {tw} from '../utils/tw';

/**
 * Hides a node visually while it stays in the accessibility tree. Uses
 * `clip: rect(...)` rather than `clip-path` for the widest assistive-technology
 * support; the 1px box is pinned to the block and inline start so a positioned
 * ancestor cannot reveal it, and pointer and selection are off so the node
 * catches no click and no text selection.
 *
 * Never replace this with `hidden` or `display: none`: both remove the node from
 * the accessibility tree, which is the one thing this component must not do.
 */
export const visuallyHiddenClassName = tw(
  'absolute w-px h-px -m-px p-0 overflow-hidden',
  '[clip:rect(0,0,0,0)] whitespace-nowrap border-none',
  'top-0 start-0 pointer-events-none select-none',
);
