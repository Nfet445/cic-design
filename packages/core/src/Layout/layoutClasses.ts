// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layoutClasses.ts
 * @input Accepts the slot state each Layout region resolves from its own props
 * @output Tailwind utility class names for the Layout root, its middle row, the
 *   header, content, footer and panel regions, and the padding boundary an
 *   overlay root draws, plus the type of the inline variables those classes read
 * @position Internal to Layout, except `layoutInnerClassName` and
 *   `layoutPaddingResetClassName`, which `@astryxdesign/core/Layout` publishes
 *   for a consumer that builds its own container or overlay root; the Tailwind
 *   build scans this module for the class names the regions can carry
 *
 * Every edge of a region publishes the padding it applies as a
 * `--container-padding-*` variable, and reads its own padding back from that
 * variable. One class per edge decides the value, so two classes never set the
 * same property and stylesheet order never decides an inset. A full-bleed child
 * (Table, Divider) reads the same variable to compensate against the padding
 * that is actually applied.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 * - /packages/core/src/Layout/Layout.doc.mjs
 */

import type {CSSProperties} from 'react';

import {tw} from '../utils/tw';
import {
  containerPaddingByEdgeClassName,
  containerPaddingReadClassName,
} from './paddingClasses';
import type {SpacingStep} from '../utils/types';

/**
 * A region's own size and the layout's frame are values, not variants: the
 * class reads a variable, and the element writes it inline, so a consumer
 * `xstyle` still overrides the result.
 */
export type LayoutInstanceStyle = CSSProperties &
  Partial<
    Record<
      | '--astryx-layout-alignment-width'
      | '--astryx-layout-content-width'
      | '--astryx-layout-panel-width'
      | '--astryx-layout-region-height',
      string
    >
  >;

/**
 * The layout root escapes the enclosing container's padding with a negative
 * margin on each edge, so its regions reach the container's border box.
 */
export const layoutOuterClassName = tw(
  'ms-[calc(-1*var(--container-padding-inline-start,0px))]',
  'me-[calc(-1*var(--container-padding-inline-end,0px))]',
  '[margin-block-start:calc(-1*var(--container-padding-block-start,0px))]',
  '[margin-block-end:calc(-1*var(--container-padding-block-end,0px))]',
);

/**
 * The inner wrapper clears the container padding for its descendants, publishes
 * the alignment width (100cqi is the middle row's own width inside the row's
 * query container), and resets the variables an enclosing Layout set so a
 * nested Layout takes the nearest padding container instead of inheriting.
 */
export const layoutInnerClassName = tw(
  'flex flex-col',
  '[--container-padding-inline-start:0px]',
  '[--container-padding-inline-end:0px]',
  '[--container-padding-block-start:0px]',
  '[--container-padding-block-end:0px]',
  // The instance values ride variables a Layout writes on this element. A
  // nested Layout resets them, so it takes the nearest frame instead of
  // inheriting an enclosing Layout's content width.
  '[--astryx-layout-alignment-width:initial]',
  '[--astryx-layout-content-width:initial]',
  '[--layout-alignment-width:var(--astryx-layout-alignment-width,100cqi)]',
  '[--layout-content-width:var(--astryx-layout-content-width,none)]',
  '[--_layout-flush-block-start:initial]',
  '[--_layout-flush-block-end:initial]',
);

/**
 * The padding boundary at an overlay's root, published so an overlay built
 * outside this package draws the same boundary: it writes what
 * `overlayPaddingReset.reset` writes. A fixed or top-layer element is a DOM
 * descendant of the padded page while sitting nowhere near it, so the
 * container padding and corner values it inherits describe padding that is not
 * there. Descendants subtract `--container-padding-*`, so those go to `0px`;
 * they add `--layout-padding-*`, so those go to `initial` and each reader falls
 * through to its own default.
 *
 * `--astryx-section-padding` is deliberately not here: it is public theme
 * surface, and making it invalid would blank the theme's section padding.
 */
export const layoutPaddingResetClassName = tw(
  '[--container-padding-inline-start:0px]',
  '[--container-padding-inline-end:0px]',
  '[--container-padding-block-start:0px]',
  '[--container-padding-block-end:0px]',
  '[--container-corner-start-start:0px]',
  '[--container-corner-start-end:0px]',
  '[--container-corner-end-start:0px]',
  '[--container-corner-end-end:0px]',
  '[--layout-padding-outer-x:initial]',
  '[--layout-padding-outer-y:initial]',
  '[--layout-padding-own-outer-x:initial]',
  '[--layout-padding-own-outer-y:initial]',
  '[--layout-padding-inner-x:initial]',
  '[--layout-padding-inner-y:initial]',
  '[--_section-padding-propagated:initial]',
);

/**
 * Every layout custom property a layout root resets, so what renders inside it
 * lays out as it does at a page root: the overlay boundary plus the Layout
 * widths, the flush values and the height cap.
 */
export const layoutResetClassName = tw(
  layoutPaddingResetClassName,
  '[--layout-content-width:initial]',
  '[--layout-alignment-width:initial]',
  '[--_layout-flush-block-start:initial]',
  '[--_layout-flush-block-end:initial]',
  '[--container-max-height:initial]',
);

/**
 * `fill`: the 2x container block padding the root's negative margins removed
 * comes back as height. `auto`: the layout grows with its content instead.
 */
export const layoutFillClassName = tw(
  'h-[calc(100%_+_var(--container-padding-block-start,0px)_+_var(--container-padding-block-end,0px))]',
  'max-h-[var(--container-max-height,none)]',
);

export const layoutAutoClassName = 'min-h-full';

/**
 * The middle row reads the divider state of the header before it and the footer
 * after it. Both selectors stay on sibling elements of this row: a `:has()` on
 * the layout followed by `*` would restyle everything inside it on any change.
 */
export const layoutMiddleClassName = tw(
  'flex flex-1 min-h-0',
  '[.astryx-layout-header:not([data-divider])~&]:[--_layout-flush-block-start:0px]',
  '[&:has(~_.astryx-layout-footer:not([data-divider]))]:[--_layout-flush-block-end:0px]',
);

/**
 * The middle row becomes the query container while a content width is aligned
 * inside it: 100cqi is then the row's own width, which the gutter arithmetic
 * subtracts the alignment width from.
 */
export const layoutMiddleQueryClassName =
  '[&:has(>_div>_.astryx-layout-content)]:[container-type:inline-size]';

/** A middle row framed by an explicit content width instead of panels. */
export const layoutMiddleContentWidthClassName = tw(
  'w-full mx-auto',
  'max-w-[var(--astryx-layout-content-width)]',
);

/** Without panels, LayoutContent owns the full-width scrollport. */
export const layoutSingleColumnContentClassName = tw(
  'w-full',
  'max-w-[var(--layout-content-width,none)]',
  '[&:has(>_.astryx-layout-content)]:[max-width:none]',
  'mx-auto',
);

/** With one panel, the middle row keeps the content-width frame. */
export const layoutSinglePanelMiddleClassName = tw(
  'box-border w-full',
  'max-w-[var(--layout-content-width,none)]',
  '[&:has(>_div>_.astryx-layout-content)]:[max-width:none]',
  'mx-auto',
  '[&:has(>_div>_.astryx-layout-content)]:[margin-inline:0]',
);

/** The centered gutter a lone start panel adds on the content side. */
export const layoutSingleStartPanelClassName =
  '[&:has(>_div>_.astryx-layout-content)]:[padding-inline-start:max(0px,calc((100%_-_var(--layout-content-width))_/_2))]';

/** The centered gutter a lone end panel adds on the content side. */
export const layoutSingleEndPanelClassName =
  '[&:has(>_div>_.astryx-layout-content)]:[padding-inline-end:max(0px,calc((100%_-_var(--layout-content-width))_/_2))]';

/**
 * A Layout without its own `padding` takes the nearest frame's inset, so the
 * own-outer pair an enclosing Layout wrote must not reach it. One class decides
 * the pair, so it never competes with the class that publishes a value.
 */
export const layoutOwnOuterResetClassName = tw(
  '[--layout-padding-own-outer-x:initial]',
  '[--layout-padding-own-outer-y:initial]',
);

/**
 * Half of the difference between the query box and the alignment width, never
 * less than the inset the edge already has. A one-panel row's query box leaves
 * out the panel-side gutter, so its opposite edge takes the whole difference.
 */
const constrainedStartNoPanels =
  '[padding-inline-start:max(var(--container-padding-inline-start,0px),calc((100cqi_-_var(--layout-alignment-width))_/_2_+_var(--container-padding-inline-start,0px)))]';

const constrainedEndNoPanels =
  '[padding-inline-end:max(var(--container-padding-inline-end,0px),calc((100cqi_-_var(--layout-alignment-width))_/_2_+_var(--container-padding-inline-end,0px)))]';

const constrainedStartSingleEndPanel =
  '[padding-inline-start:max(var(--container-padding-inline-start,0px),calc(100cqi_-_var(--layout-alignment-width)_+_var(--container-padding-inline-start,0px)))]';

const constrainedEndSingleStartPanel =
  '[padding-inline-end:max(var(--container-padding-inline-end,0px),calc(100cqi_-_var(--layout-alignment-width)_+_var(--container-padding-inline-end,0px)))]';

/**
 * The value each edge publishes. `inner*` is the inset between two regions,
 * `outer*` the inset against the container's edge, `flush*` the inner inset a
 * divider-less header or footer collapses, `zero` the full-bleed choice. Every
 * string is literal: the Tailwind build scans this module for them.
 */
const containerPaddingByEdge = {
  inlineStart: {
    inner:
      '[--container-padding-inline-start:var(--layout-padding-inner-x,var(--spacing-4))]',
    outer:
      '[--container-padding-inline-start:var(--layout-padding-own-outer-x,var(--layout-padding-outer-x,var(--spacing-4)))]',
    zero: '[--container-padding-inline-start:0px]',
  },
  inlineEnd: {
    inner:
      '[--container-padding-inline-end:var(--layout-padding-inner-x,var(--spacing-4))]',
    outer:
      '[--container-padding-inline-end:var(--layout-padding-own-outer-x,var(--layout-padding-outer-x,var(--spacing-4)))]',
    zero: '[--container-padding-inline-end:0px]',
  },
  blockStart: {
    inner:
      '[--container-padding-block-start:var(--layout-padding-inner-y,var(--spacing-4))]',
    outer:
      '[--container-padding-block-start:var(--layout-padding-own-outer-y,var(--layout-padding-outer-y,var(--spacing-4)))]',
    flush:
      '[--container-padding-block-start:var(--_layout-flush-block-start,var(--layout-padding-inner-y,var(--spacing-4)))]',
    zero: '[--container-padding-block-start:0px]',
  },
  blockEnd: {
    inner:
      '[--container-padding-block-end:var(--layout-padding-inner-y,var(--spacing-4))]',
    outer:
      '[--container-padding-block-end:var(--layout-padding-own-outer-y,var(--layout-padding-outer-y,var(--spacing-4)))]',
    flush:
      '[--container-padding-block-end:var(--_layout-flush-block-end,var(--layout-padding-inner-y,var(--spacing-4)))]',
    zero: '[--container-padding-block-end:0px]',
  },
} as const;

/** The header's inner wrapper: the content-width frame, inset on outer edges. */
export const layoutHeaderInnerClassName = tw(
  'box-border mx-auto max-w-[var(--layout-content-width,none)]',
  containerPaddingReadClassName,
  containerPaddingByEdge.inlineStart.outer,
  containerPaddingByEdge.inlineEnd.outer,
  containerPaddingByEdge.blockStart.outer,
  containerPaddingByEdge.blockEnd.inner,
);

export const layoutHeaderDividerClassName =
  '[border-block-end:1px_solid_var(--color-border)]';

/** The footer's inner wrapper: the content-width frame, inset on outer edges. */
export const layoutFooterInnerClassName = tw(
  'box-border mx-auto max-w-[var(--layout-content-width,none)]',
  containerPaddingReadClassName,
  containerPaddingByEdge.inlineStart.outer,
  containerPaddingByEdge.inlineEnd.outer,
  containerPaddingByEdge.blockStart.inner,
  containerPaddingByEdge.blockEnd.outer,
);

export const layoutFooterDividerClassName =
  '[border-block-start:1px_solid_var(--color-border)]';

/** A region's own height; the value rides `--astryx-layout-region-height`. */
export const layoutRegionHeightClassName =
  '[height:var(--astryx-layout-region-height)]';

/** A panel's own width; the value rides `--astryx-layout-panel-width`. */
export const layoutPanelWidthClassName =
  '[width:var(--astryx-layout-panel-width)]';

export interface LayoutContentClassNameOptions {
  hasFooter: boolean;
  hasHeader: boolean;
  hasStart: boolean;
  hasEnd: boolean;
  isScrollable: boolean;
  /** `padding={0}`: the content reaches every container edge. */
  isZeroPadding: boolean;
}

/**
 * The scroll and padding owner of the layout's middle column. An edge next to a
 * region takes the inner inset; an edge on the container takes the outer inset,
 * or the centered gutter when a content width is aligned internally.
 */
export function layoutContentClassName({
  hasFooter,
  hasHeader,
  hasStart,
  hasEnd,
  isScrollable,
  isZeroPadding,
}: LayoutContentClassNameOptions): string {
  const alignsNoPanels = !hasStart && !hasEnd && !isZeroPadding;
  const alignsStartPanel = hasStart && !hasEnd && !isZeroPadding;
  const alignsEndPanel = !hasStart && hasEnd && !isZeroPadding;
  return tw(
    'box-border h-full flex-1 min-h-0',
    isScrollable ? 'overflow-auto' : 'overflow-clip',
    containerPaddingReadClassName,
    containerPaddingByEdge.inlineStart[
      isZeroPadding ? 'zero' : hasStart ? 'inner' : 'outer'
    ],
    containerPaddingByEdge.inlineEnd[
      isZeroPadding ? 'zero' : hasEnd ? 'inner' : 'outer'
    ],
    containerPaddingByEdge.blockStart[
      isZeroPadding ? 'zero' : hasHeader ? 'flush' : 'outer'
    ],
    containerPaddingByEdge.blockEnd[
      isZeroPadding ? 'zero' : hasFooter ? 'flush' : 'outer'
    ],
    alignsNoPanels && constrainedStartNoPanels,
    alignsNoPanels && constrainedEndNoPanels,
    alignsStartPanel && constrainedEndSingleStartPanel,
    alignsEndPanel && constrainedStartSingleEndPanel,
  );
}

export interface LayoutPanelClassNameOptions {
  hasFooter: boolean;
  hasHeader: boolean;
  /** The panel sits on the container's start edge. */
  isStart: boolean;
  /** The panel sits on the container's end edge. */
  isEnd: boolean;
  isScrollable: boolean;
  /** At width 0 the padding box is 0 too, so the clip hides every child. */
  isZeroWidth: boolean;
  /** The panel's own padding, which replaces the frame's inset on every edge. */
  padding?: SpacingStep;
}

/** A side panel: the inner inset, the outer inset against a container edge. */
export function layoutPanelClassName({
  hasFooter,
  hasHeader,
  isStart,
  isEnd,
  isScrollable,
  isZeroWidth,
  padding,
}: LayoutPanelClassNameOptions): string {
  return tw(
    'box-border shrink-0',
    isScrollable ? 'overflow-auto' : 'overflow-clip',
    containerPaddingReadClassName,
    padding != null
      ? containerPaddingByEdgeClassName({
          paddingBlockEnd: padding,
          paddingBlockStart: padding,
          paddingInlineEnd: padding,
          paddingInlineStart: padding,
        })
      : tw(
          containerPaddingByEdge.inlineStart[
            isZeroWidth ? 'zero' : isStart ? 'outer' : 'inner'
          ],
          containerPaddingByEdge.inlineEnd[
            isZeroWidth ? 'zero' : isEnd ? 'outer' : 'inner'
          ],
          containerPaddingByEdge.blockStart[hasHeader ? 'inner' : 'outer'],
          containerPaddingByEdge.blockEnd[hasFooter ? 'inner' : 'outer'],
        ),
  );
}

export const layoutPanelDividerEndClassName =
  '[border-inline-end:1px_solid_var(--color-border)]';

export const layoutPanelDividerStartClassName =
  '[border-inline-start:1px_solid_var(--color-border)]';

/** No divider: the start panel pulls its end edge into the content's inset. */
export const layoutPanelCollapseEndClassName =
  '[margin-inline-end:calc(-1*var(--layout-padding-inner-x,var(--spacing-4)))]';

export const layoutPanelCollapseStartClassName =
  '[margin-inline-start:calc(-1*var(--layout-padding-inner-x,var(--spacing-4)))]';
