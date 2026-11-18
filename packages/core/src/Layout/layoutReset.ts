// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layoutReset.ts
 * @input The layout custom properties Layout, its regions, Section and the
 *   container styles publish to their descendants.
 * @output `layoutReset`: the class that stops every one of them at an element,
 *   so what renders inside lays out as it does at a page root.
 * @position Layout owns the reset (`component:Layout` FR8). A layout root
 *   applies it, as AppShell does at its root (`component:AppShell` FR18).
 *   Internal: no package entry exports it. `layoutReset.test.tsx` fails when
 *   Layout writes a custom property this reset does not cover.
 *
 * SYNC: the docsite's example root composes `overlayPaddingReset` and
 * mirrors the rest of this list (apps/docsite/src/components/component-detail/
 * ExampleBlock.tsx); apps/docsite/src/__tests__/example-layout-root.test.ts
 * fails when they differ.
 */

import {layoutResetClassName} from './layoutClasses';

/**
 * The full layout reset, for `className`: the overlay boundary (the published
 * container padding to `0px`; Layout insets and Section padding propagation to
 * `initial`) plus the Layout widths, flush values and height cap.
 */
export const layoutReset = layoutResetClassName;
