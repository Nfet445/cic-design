// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file markdownClasses.ts
 * @input The block kind and density, a heading level, and the caller's
 *   content width and alignment
 * @output Class names for Markdown's own elements, the density spacing of each
 *   block kind, and the two per-instance geometry styles
 * @position Static styling for Markdown.tsx and plugins/HeadingLinksRenderer.tsx;
 *   scanned by `tailwind/astryx.input.css` to build `astryx-tailwind.css`
 *
 * A prose block's width is a per-instance value, so it rides an
 * `--astryx-markdown-*` variable the element writes inline and a class reads. A
 * variable, not an inline declaration: the classes stay the one place a
 * property is authored.
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 * - /packages/core/src/theme/derivedVarRegistry.test.ts
 */

import type {CSSProperties} from 'react';

import {tw} from '../utils/tw';

export type MarkdownDensity = 'default' | 'compact';

export const markdownRootClassName = tw(
  'w-full max-w-full min-w-0',
  '[overflow-wrap:break-word]',
  '[font-family:var(--font-family-body)]',
  '[font-size:var(--text-body-size)]',
  '[line-height:var(--text-body-leading)]',
  'text-[color:var(--color-text-primary)]',
);

export const markdownInlineRootClassName = tw(
  'inline w-auto max-w-none',
  '[font-family:inherit] [font-size:inherit] [line-height:inherit]',
  'text-[color:inherit]',
);

// Headings
export const markdownHeadingClassName = tw(
  '[font-family:var(--font-family-heading)]',
  'text-[color:var(--color-text-primary)]',
);

export const markdownHeadingLevelClassName: Record<
  1 | 2 | 3 | 4 | 5 | 6,
  string
> = {
  1: '[font-size:var(--text-heading-1-size)] [font-weight:var(--text-heading-1-weight)] [line-height:var(--text-heading-1-leading)]',
  2: '[font-size:var(--text-heading-2-size)] [font-weight:var(--text-heading-2-weight)] [line-height:var(--text-heading-2-leading)]',
  3: '[font-size:var(--text-heading-3-size)] [font-weight:var(--text-heading-3-weight)] [line-height:var(--text-heading-3-leading)]',
  4: '[font-size:var(--text-heading-4-size)] [font-weight:var(--text-heading-4-weight)] [line-height:var(--text-heading-4-leading)]',
  5: '[font-size:var(--text-heading-5-size)] [font-weight:var(--text-heading-5-weight)] [line-height:var(--text-heading-5-leading)]',
  6: '[font-size:var(--text-heading-6-size)] [font-weight:var(--text-heading-6-weight)] [line-height:var(--text-heading-6-leading)]',
};

/**
 * Block spacing, per element kind and density. A heading's depth picks major
 * or minor; every other kind has one row.
 */
export type MarkdownBlockKind =
  | 'headingMajor'
  | 'headingMinor'
  | 'paragraph'
  | 'codeblock'
  | 'blockquote'
  | 'list'
  | 'table'
  | 'hr'
  | 'image';

const BLOCK_SPACING_CLASS: Record<
  MarkdownDensity,
  Record<MarkdownBlockKind, {start: string; end: string}>
> = {
  default: {
    headingMajor: {
      start: '[margin-block-start:var(--spacing-6)]',
      end: '[margin-block-end:var(--spacing-3)]',
    },
    headingMinor: {
      start: '[margin-block-start:var(--spacing-4)]',
      end: '[margin-block-end:var(--spacing-2)]',
    },
    paragraph: {
      start: '[margin-block-start:var(--spacing-3)]',
      end: '[margin-block-end:var(--spacing-3)]',
    },
    codeblock: {
      start: '[margin-block-start:var(--spacing-4)]',
      end: '[margin-block-end:var(--spacing-4)]',
    },
    blockquote: {
      start: '[margin-block-start:var(--spacing-4)]',
      end: '[margin-block-end:var(--spacing-4)]',
    },
    list: {
      start: '[margin-block-start:var(--spacing-3)]',
      end: '[margin-block-end:var(--spacing-3)]',
    },
    table: {
      start: '[margin-block-start:var(--spacing-4)]',
      end: '[margin-block-end:var(--spacing-4)]',
    },
    hr: {
      start: '[margin-block-start:var(--spacing-6)]',
      end: '[margin-block-end:var(--spacing-6)]',
    },
    image: {
      start: '[margin-block-start:var(--spacing-3)]',
      end: '[margin-block-end:var(--spacing-3)]',
    },
  },
  compact: {
    headingMajor: {
      start: '[margin-block-start:var(--spacing-4)]',
      end: '[margin-block-end:var(--spacing-2)]',
    },
    headingMinor: {
      start: '[margin-block-start:var(--spacing-3)]',
      end: '[margin-block-end:var(--spacing-1)]',
    },
    paragraph: {
      start: '[margin-block-start:var(--spacing-1)]',
      end: '[margin-block-end:var(--spacing-1)]',
    },
    codeblock: {
      start: '[margin-block-start:var(--spacing-2)]',
      end: '[margin-block-end:var(--spacing-2)]',
    },
    blockquote: {
      start: '[margin-block-start:var(--spacing-2)]',
      end: '[margin-block-end:var(--spacing-2)]',
    },
    list: {
      start: '[margin-block-start:var(--spacing-1)]',
      end: '[margin-block-end:var(--spacing-1)]',
    },
    table: {
      start: '[margin-block-start:var(--spacing-2)]',
      end: '[margin-block-end:var(--spacing-2)]',
    },
    hr: {
      start: '[margin-block-start:var(--spacing-3)]',
      end: '[margin-block-end:var(--spacing-3)]',
    },
    image: {
      start: '[margin-block-start:var(--spacing-2)]',
      end: '[margin-block-end:var(--spacing-2)]',
    },
  },
};

const FIRST_BLOCK_START_CLASS = '[margin-block-start:0]';
const LAST_BLOCK_END_CLASS = '[margin-block-end:0]';

/**
 * The vertical rhythm around one block. A container's first and last block drop
 * the margin that faces its edge, and the position is folded in here because
 * two classes for one property would leave the sheet to order them.
 */
export function markdownBlockSpacingClassName(
  kind: MarkdownBlockKind,
  density: MarkdownDensity,
  position: {isFirst: boolean; isLast: boolean},
): string {
  const {start, end} = BLOCK_SPACING_CLASS[density][kind];
  return tw(
    position.isFirst ? FIRST_BLOCK_START_CLASS : start,
    position.isLast ? LAST_BLOCK_END_CLASS : end,
  );
}

// Heading links
/** The heading row: the heading text and the copy control share one baseline. */
export const markdownHeadingRowClassName = tw(
  'flex items-baseline-last min-w-0 max-w-full overflow-visible isolate',
);

/** The heading text in the row: it gives up width, the control does not. */
export const markdownHeadingLinksTextClassName =
  '[flex:0_1_auto] min-w-0 [margin-block:0]';

export const markdownHeadingLinksControlSlotClassName = tw(
  'relative inline-block shrink-0 z-[1]',
  '[inline-size:var(--size-element-sm)] pointer-coarse:[inline-size:24px]',
  'ms-[var(--spacing-1-5)]',
  'text-[color:var(--color-text-secondary)]',
  '[font-family:inherit] [font-size:inherit] [font-weight:inherit] [line-height:inherit]',
);

export const markdownHeadingLinksProbeClassName = 'invisible';

export const markdownHeadingLinksGlyphClassName = tw(
  'inline-flex items-center justify-center',
  '[inline-size:1em] [block-size:1em]',
);

// Code and table wrappers
export const markdownCodeBlockWrapperClassName = 'max-w-full';

/**
 * No `overflow-x` here: Table's own Scroll region (`table-scroll-wrapper`) is
 * the table's scroller, and this block is exactly as wide as it, so a second
 * scroll container would only add a dead focus stop.
 */
export const markdownTableWrapperClassName = tw(
  'max-w-full',
  '[--container-padding-inline-start:0px]',
  '[--container-padding-inline-end:0px]',
  '[--container-padding-block-start:0px]',
  '[--container-padding-block-end:0px]',
);

// Child-component overrides
//
// Table, CodeBlock, Button and Code paint these properties with `astryx-base`
// utilities of their own, and two utilities on one property leave the sheet to
// decide the winner. Each override therefore names the Markdown block it stands
// in, which outranks the child's plain utility whatever order the sheet prints.
//
// Table sizes wrap-mode cells with `max-width: 0` + `word-break: break-word`,
// and its header cell adds nowrap and ellipsis. Those defaults zero a column's
// min-content, so automatic layout divides the container equally: a six-column
// Markdown table squashes to a few characters per cell, identifiers split
// mid-word, header labels ellipsize, and nothing overflows into the Scroll
// region that exists to take the width. Here the cell reports an honest
// min-content, the header wraps instead of truncating, and `box-sizing:
// content-box` keeps the per-column `ch` floor a floor on the text box rather
// than on the padded border box, so the floor means the same number of
// characters at every density. Data-driven `Table` keeps its released wrap
// mode; only Markdown's part is restyled.
export const markdownTablePartClassName = {
  cell: tw(
    '[.astryx-markdown-table_&]:[box-sizing:content-box]',
    '[.astryx-markdown-table_&]:[max-width:none]',
    '[.astryx-markdown-table_&]:[overflow:visible]',
    '[.astryx-markdown-table_&]:[overflow-wrap:break-word]',
    '[.astryx-markdown-table_&]:[padding-block:var(--spacing-2)]',
    '[.astryx-markdown-table_&]:[padding-inline:var(--spacing-2)]',
    '[.astryx-markdown-table_&]:[word-break:normal]',
  ),
  headerCell: tw(
    '[.astryx-markdown-table_&]:[box-sizing:content-box]',
    '[.astryx-markdown-table_&]:[max-width:none]',
    '[.astryx-markdown-table_&]:[overflow:visible]',
    '[.astryx-markdown-table_&]:[overflow-wrap:break-word]',
    '[.astryx-markdown-table_&]:[padding-block:var(--spacing-2)]',
    '[.astryx-markdown-table_&]:[padding-inline:var(--spacing-2)]',
    '[.astryx-markdown-table_&]:[text-overflow:clip]',
    '[.astryx-markdown-table_&]:[white-space:normal]',
    '[.astryx-markdown-table_&]:[word-break:normal]',
  ),
  // Inline Code sets `word-break: break-word` so a long token cannot widen a
  // paragraph. Inside a table cell that same rule zeroes the token's
  // min-content and splits an identifier across lines; the cell keeps it whole
  // and lets the column carry the width instead.
  code: '[.astryx-markdown-table_&]:[word-break:normal]',
  // A cell that reads against its table draws the column rule on the table's
  // inline-end side, which is the cell's own inline-start.
  ruleOnTableEnd: tw(
    '[.astryx-markdown-table_&]:[border-inline-end-width:0]',
    '[.astryx-markdown-table_&]:[border-inline-start-width:var(--border-width)]',
    '[.astryx-markdown-table_&:last-child]:[border-inline-start-width:0]',
    '[.astryx-markdown-table_&]:[border-inline-start-style:solid]',
    '[.astryx-markdown-table_&]:[border-inline-start-color:var(--color-border)]',
  ),
  // The grid's outer edge. `dividers="grid"` draws the lines *between* cells
  // and stops at the table's rim, so without this the top, bottom, and sides
  // stay open and the grid reads as unfinished. On the table element, not the
  // wrapper, so `border-collapse: collapse` merges it with the cell lines into
  // one 1px rule rather than doubling up at the edge.
  tableOuterEdge: tw(
    '[.astryx-markdown-table_&]:[border-width:var(--border-width)]',
    '[.astryx-markdown-table_&]:[border-style:solid]',
    '[.astryx-markdown-table_&]:[border-color:var(--color-border)]',
  ),
  alignStart: '[.astryx-markdown-table_&]:[text-align:start]',
  alignCenter: '[.astryx-markdown-table_&]:[text-align:center]',
  alignEnd: '[.astryx-markdown-table_&]:[text-align:end]',
  /** Reads the per-column floor the cell carries in its own inline style. */
  cellMinWidth:
    '[.astryx-markdown-table_&]:[min-width:var(--astryx-markdown-cell-min-width)]',
} as const;

/**
 * A code block's prose floor. CodeBlock's fit-content box carries a `min-width`
 * utility of its own, and the prose measure has to widen past it, so this one
 * property cannot be a second utility. The width arrives as a variable, like
 * the block's own, because a caller picks it at render time.
 */
export const markdownCodeBlockWidthClassName =
  '[.astryx-markdown-codeblock_&]:[min-width:min(var(--astryx-markdown-block-width),100%)]';

/**
 * The heading's copy control: a sm icon-only Button, centered on the `#` in the
 * hidden baseline probe so the control's own box never widens the row. Button
 * sets `position: relative`, its own box size, padding and text style, so each
 * declaration here names the document root to outrank it.
 */
export const markdownHeadingLinksCopyButtonClassName = tw(
  '[.astryx-markdown_&]:absolute',
  '[.astryx-markdown_&]:[inset-block-start:50%]',
  '[.astryx-markdown_&]:[inline-size:var(--size-element-sm)]',
  '[.astryx-markdown_&]:[block-size:var(--size-element-sm)]',
  '[.astryx-markdown_&]:pointer-coarse:[inline-size:24px]',
  '[.astryx-markdown_&]:pointer-coarse:[block-size:24px]',
  '[.astryx-markdown_&]:[padding-block:0]',
  '[.astryx-markdown_&]:[padding-inline:0]',
  '[.astryx-markdown_&]:[color:inherit]',
  '[.astryx-markdown_&]:[font-family:inherit]',
  '[.astryx-markdown_&]:[font-size:inherit]',
  '[.astryx-markdown_&]:[font-weight:inherit]',
  '[.astryx-markdown_&]:[line-height:inherit]',
);

// HR
export const markdownHrClassName = tw(
  'border-x-0 border-b-0',
  '[border-top-style:solid]',
  '[border-top-width:var(--border-width)]',
  '[border-top-color:var(--color-border)]',
);

// Image
export const markdownImageClassName =
  'max-w-full rounded-[var(--radius-element)]';

// Inline
export const markdownBoldClassName =
  '[font-weight:var(--font-weight-semibold)]';
export const markdownStrikethroughClassName =
  'text-[color:var(--color-text-secondary)]';
export const markdownLinkClassName =
  'text-[color:var(--color-text-accent)] underline';

/**
 * The streaming entry. A chunk fades in; `@starting-style` is its opacity
 * before the first style change, which the transition spends. The reduced
 * motion arm collapses that fade to an instant swap without removing the
 * transition, so the entry still ends and the caller's cleanup still runs.
 */
export const markdownFadeInClassName = tw(
  'opacity-100 transition-[opacity]',
  'duration-[var(--duration-medium)] ease-[var(--ease-standard)]',
  'motion-reduce:duration-[0s]',
  '[@starting-style]:opacity-0',
);

/** The per-instance geometry Markdown writes on a class-carrying element. */
export type MarkdownGeometryStyle = CSSProperties &
  Partial<
    Record<
      | '--astryx-markdown-prose-width'
      | '--astryx-markdown-block-width'
      | '--astryx-markdown-cell-min-width',
      string
    >
  >;

/** The content width a prose block caps itself at. */
export function markdownProseWidthStyle(width: string): MarkdownGeometryStyle {
  return {'--astryx-markdown-prose-width': width};
}

/** The width a block that can overflow the prose column asks for. */
export function markdownBlockWidthStyle(width: string): MarkdownGeometryStyle {
  return {'--astryx-markdown-block-width': width};
}

/** The `ch` floor a Markdown table column asks for on each of its cells. */
export function markdownCellMinWidthStyle(
  width: string,
): MarkdownGeometryStyle {
  return {'--astryx-markdown-cell-min-width': width};
}

export const markdownProseWidthClassName =
  '[max-width:var(--astryx-markdown-prose-width)]';

export const markdownBlockWidthClassName =
  '[min-width:min(var(--astryx-markdown-block-width),100%)]';

/** A centred block or prose column; the default alignment needs no class. */
export const markdownCenterAlignClassName = '[margin-inline:auto]';

/**
 * Static Markdown lists never host swipe actions, so the outside counter ink
 * may paint past the row instead of being clipped at a finite threshold.
 */
export const markdownBlockIndentClassName = tw(
  '[margin-inline:calc(-1*var(--spacing-2))]',
  'overflow-x-visible',
);

/**
 * Numbered document lists keep their ordinary text inset regardless of counter
 * width, matching RichText's native outside markers.
 */
export const markdownMarkerGutterClassName = tw(
  '[margin-inline-start:calc(-1*(var(--spacing-2)+var(--spacing-4)))]',
  'ps-[var(--spacing-4)]',
);
