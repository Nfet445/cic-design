// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file edgeCompensation.stylex.ts
 * @input None
 * @output The `data-astryx-edge-comp` attribute name
 * @position Layout primitive; marks a component whose transparent padding a
 *   container may pull its own edge in by. Kept at this public subpath so
 *   existing imports resolve.
 *
 * It carries no StyleX rule: the compensation itself is a class in each
 * container's own class map, so nothing here passes to `stylex.props`.
 *
 * ## Container-Driven Edge Compensation
 *
 * Interactive components with transparent padding (ghost buttons, tabs)
 * create excess visual space at container edges. The container's padding plus
 * the component's own transparent padding doubles up.
 *
 * 1. **Components** mark themselves with `data-astryx-edge-comp` (a passive
 *    data attribute; no styles attach to it).
 * 2. **Containers** use `:has(> [data-astryx-edge-comp]:first-child)` and
 *    `:has(> [data-astryx-edge-comp]:last-child)` in their own class maps to
 *    detect edge-adjacent compensatable items and pull the slot in.
 *
 * The container owns both the detection and the adjustment. Components only
 * declare eligibility.
 *
 * SYNC: When modified, update /packages/core/src/Layout/Layout.doc.mjs
 */

/**
 * The data attribute that edge-compensatable components apply.
 * Ghost buttons, tabs, and other transparent-padding components render this
 * attribute so containers can detect them via `:has()`.
 */
export const EDGE_COMP_ATTR = 'data-astryx-edge-comp';
