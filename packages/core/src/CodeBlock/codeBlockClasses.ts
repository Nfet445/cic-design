// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file codeBlockClasses.ts
 * @input Accepts the container, size, width and the line, diff and highlight
 *   state a row resolves from its data
 * @output Tailwind utility class names for the block frame, the header, the
 *   chevron, the code element, its rows, tints and diff markers
 * @position Internal to CodeBlock.
 *
 * Four property groups paint one declaration per state — the code's
 * `min-width`/`white-space` pair, the row's grid template, the row's tint and
 * the marker's colour — so each of those is a function that returns the whole
 * class string for its state instead of two classes that could both apply.
 *
 * The viewport's inset focus ring stays in `codeBlockViewportFocusRing.stylex.ts`.
 */

import {tw} from '../utils/tw';
import type {DiffLineKind} from './tokenizer';

/** The card frame owns the radius and the border; a section inherits both. */
export const codeBlockContainerClassName: Record<'card' | 'section', string> = {
  card: tw(
    'rounded-[var(--radius-element)]',
    'border-[length:var(--border-width)] border-solid border-[color:var(--color-border)]',
  ),
  // Transparent so the block blends into the surface it sits in instead of
  // compounding a muted parent into a darker grey. The syntax-background var
  // is overridden on the root so the sticky header inherits it too.
  section: tw(
    'rounded-none border-0',
    '[--color-syntax-background:transparent]',
  ),
};

export const codeBlockRootClassName = tw(
  'relative isolate flex flex-col m-0',
  'bg-[color:var(--color-syntax-background)] overflow-hidden',
);

/** With no header, the controls take their own inline-end column. */
export const codeBlockRootCornerClassName =
  'grid [grid-template-columns:minmax(0,1fr)_auto] [grid-template-rows:minmax(0,1fr)]';

/** The width is the prop's value, so the class reads it as a variable. */
export const codeBlockRootWidthClassName = '[width:var(--_codeblock-width)]';

/** A `fit-content` width keeps a floor and never outgrows its parent. */
export const codeBlockRootFitWidthClassName =
  'min-w-[min(100%,400px)] max-w-full';

/**
 * The viewport is a flex item of the column root. Its implied min-height would
 * be its content while it fits, so a root sized from outside could never make
 * it shrink and scroll; zero lets the root's bound reach it.
 */
export const codeBlockViewportClassName = 'min-h-0';

export const codeBlockHeaderRowClassName = (hasDivider: boolean): string =>
  tw(
    'flex items-center justify-between',
    'px-[var(--spacing-4)] py-[var(--spacing-2)]',
    'bg-[color:var(--color-syntax-background)] sticky top-0 z-[1]',
    hasDivider &&
      'border-b-[length:var(--border-width)] border-solid border-b-[color:var(--color-border)]',
  );

/** The collapsible title control: a reset of the default button appearance. */
export const codeBlockHeaderClassName = tw(
  'flex items-center flex-1 min-w-0',
  'p-0 border-0 bg-transparent text-[color:inherit] [font:inherit] text-start',
);

export const codeBlockHeaderCollapsibleClassName =
  'cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default select-none';

export const codeBlockHeaderTitleClassName = tw(
  'flex items-center m-0',
  'text-[length:var(--text-supporting-size)] leading-[var(--text-supporting-leading)]',
  '[font-family:var(--font-family-code)] [font-weight:var(--font-weight-medium)]',
  'text-[color:var(--color-syntax-comment)]',
);

export const codeBlockHeaderControlsClassName =
  'flex items-center gap-[var(--spacing-1)] shrink-0';

/**
 * The headerless block's controls. The cluster is exactly as tall as the first
 * line's row and centres its controls in it, so any control height sits on the
 * first line.
 */
export const codeBlockCornerClusterClassName = tw(
  'flex items-center gap-[var(--spacing-1)]',
  'self-start mx-[var(--spacing-2)]',
);

export const codeBlockCornerClusterHeightClassName = (
  size: 'sm' | 'md',
): string =>
  size === 'sm'
    ? '[block-size:calc(2*var(--spacing-3)+var(--text-supporting-size)*var(--text-code-leading))]'
    : '[block-size:calc(2*var(--spacing-3)+var(--text-code-size)*var(--text-code-leading))]';

export const codeBlockCollapseGridClassName = tw(
  'grid [grid-template-rows:1fr]',
  'transition-[grid-template-rows] duration-[var(--duration-medium)] ease-[var(--ease-standard)]',
);

export const codeBlockCollapseGridCollapsedClassName =
  '[grid-template-rows:0fr]';

export const codeBlockCollapseInnerClassName = 'overflow-hidden min-h-0';

/**
 * The chevron grows its own footprint (width plus inline margin) from zero so
 * the title slides into place instead of snapping over; the clipping keeps the
 * glyph from spilling mid-reveal. The frames live in
 * `tailwind/astryx.input.css` as `astryxChevronReveal`.
 */
export const codeBlockChevronClassName = tw(
  'inline-flex items-center justify-center shrink-0',
  'w-[14px] h-[14px] me-[var(--spacing-1)] overflow-hidden',
  'text-[color:var(--color-syntax-comment)]',
  'animate-[astryxChevronReveal_var(--duration-medium)_var(--ease-standard)]',
  'motion-reduce:animate-none',
);

/** Applied to the chevron glyph itself, which is the element that rotates. */
export const codeBlockChevronIconClassName =
  'transition-[transform] duration-[var(--duration-fast)] ease-[var(--ease-standard)]';

/** Leading disclosure convention: right when collapsed, down when expanded. */
export const codeBlockChevronExpandedClassName = 'rotate-90';

export const codeBlockCodeWrapperClassName = 'flex min-w-fit';

export const codeBlockCodeWrapperCompactClassName =
  'mt-[calc(-1*var(--spacing-2))]';

/**
 * The block grows to its longest line, so a row's paint spans the full scroll
 * width instead of stopping at the viewport edge. Wrapped lines never
 * overflow, and `max-content` would stop them wrapping.
 */
export const codeBlockCodeClassName = (isWrapped: boolean): string =>
  tw(
    'block flex-1 py-[var(--spacing-3)] px-[var(--spacing-4)] m-0',
    '[font-family:var(--font-family-code)] text-[color:var(--color-syntax-variable)]',
    '[tab-size:2]',
    isWrapped
      ? 'min-w-[auto] [white-space:pre-wrap] [word-break:break-all] [overflow-wrap:break-word]'
      : 'min-w-[max-content] [white-space:pre] [word-break:normal] [overflow-wrap:normal]',
  );

/**
 * With line numbers on, the code element hosts the full-height divider between
 * the number gutter and the code. It spans the block padding too, so the rule
 * reaches the top and bottom edges.
 */
export const codeBlockCodeNumberedClassName = tw(
  'relative',
  "[&::after]:[content:''] [&::after]:absolute [&::after]:inset-y-0 [&::after]:w-0",
  '[&::after]:[inset-inline-start:calc(var(--spacing-4)+var(--_codeblock-gutter-width)+var(--spacing-3))]',
  '[&::after]:border-s-[length:var(--border-width)] [&::after]:border-solid [&::after]:border-s-[color:var(--color-border)]',
  '[&::after]:pointer-events-none',
);

/**
 * A chunk holds its own block size while it is off screen. The size is the
 * chunk's line count, so the class reads it as a variable.
 */
export const codeBlockLineChunkClassName =
  '[content-visibility:auto] [contain-intrinsic-block-size:auto_var(--_codeblock-chunk-height)]';

export const codeBlockLineContentClassName = 'min-w-0';

/**
 * The number is a `::before` generated from the data attribute, and the row is
 * a grid so the row grows to fit wrapped code while the number stays pinned to
 * the first visual line. With line numbers the gutter's gap (which the
 * full-height divider sits in) has to stay between the number and the marker,
 * so the diff row carries both gaps as the marker's margins instead.
 */
const LINE_NUMBER_BEFORE = tw(
  '[&::before]:[content:attr(data-line)] [&::before]:[grid-column:1]',
  '[&::before]:[align-self:start] [&::before]:[text-align:end]',
  '[&::before]:[font-family:var(--font-family-code)]',
  '[&::before]:text-[color:var(--color-syntax-punctuation)] [&::before]:select-none',
);

export const codeBlockLineClassName = (options: {
  hasLineNumbers: boolean;
  hasDiff: boolean;
}): string => {
  const {hasLineNumbers, hasDiff} = options;
  if (hasLineNumbers && hasDiff) {
    return tw(
      'leading-[var(--text-code-leading)]',
      'grid [grid-template-columns:var(--_codeblock-gutter-width)_auto_1fr] gap-x-0',
      LINE_NUMBER_BEFORE,
    );
  }
  if (hasLineNumbers) {
    return tw(
      'leading-[var(--text-code-leading)]',
      'grid [grid-template-columns:var(--_codeblock-gutter-width)_1fr]',
      'gap-x-[calc(var(--spacing-3)+var(--border-width)+var(--spacing-4))]',
      LINE_NUMBER_BEFORE,
    );
  }
  if (hasDiff) {
    return tw(
      'leading-[var(--text-code-leading)]',
      'grid [grid-template-columns:1ch_1fr] gap-x-[var(--spacing-2)]',
    );
  }
  return 'leading-[var(--text-code-leading)]';
};

const LINE_TINT_GEOMETRY =
  'mx-[calc(-1*var(--spacing-4))] px-[var(--spacing-4)]';

/**
 * A row carries one tint: a caller's highlight replaces a diff tint rather than
 * stacking on it, so the tokens keep their single-paint contrast.
 */
export const codeBlockLineTintClassName = (options: {
  diffKind: DiffLineKind | undefined;
  isHighlighted: boolean;
}): string => {
  if (options.isHighlighted) {
    return tw('bg-[color:var(--color-accent-muted)]', LINE_TINT_GEOMETRY);
  }
  switch (options.diffKind) {
    case 'added':
      return tw(
        'bg-[color:var(--color-syntax-added)]',
        LINE_TINT_GEOMETRY,
        '[&::before]:text-[color:var(--color-syntax-added-marker)]',
      );
    case 'removed':
      return tw(
        'bg-[color:var(--color-syntax-removed)]',
        LINE_TINT_GEOMETRY,
        '[&::before]:text-[color:var(--color-syntax-removed-marker)]',
      );
    // Hunk and file headers stay visible but quiet: a muted row with secondary
    // text, never change paint.
    case 'header':
      return tw(
        'bg-[color:var(--color-syntax-diff-header)]',
        'text-[color:var(--color-syntax-punctuation)]',
        LINE_TINT_GEOMETRY,
      );
    // A plain line and a context line carry no tint.
    case undefined:
    case 'context':
      return '';
  }
};

/**
 * The glyph column: the +, − or space sits in its own track before the code, so
 * every line's code starts at the same inline offset. On a tinted row the glyph
 * is the cue a reader without colour depends on, so it takes the row's marker
 * colour.
 */
export const codeBlockDiffMarkerClassName = (options: {
  hasLineNumbers: boolean;
  diffKind: DiffLineKind | undefined;
}): string => {
  const color =
    options.diffKind === 'added'
      ? 'text-[color:var(--color-syntax-added-marker)]'
      : options.diffKind === 'removed'
        ? 'text-[color:var(--color-syntax-removed-marker)]'
        : 'text-[color:var(--color-text-secondary)]';
  return tw(
    color,
    'select-none [white-space:pre]',
    options.hasLineNumbers &&
      'ms-[calc(var(--spacing-3)+var(--border-width)+var(--spacing-4))] me-[var(--spacing-2)]',
  );
};

export const codeBlockSizeClassName = (size: 'sm' | 'md'): string =>
  size === 'sm'
    ? 'text-[length:var(--text-supporting-size)]'
    : 'text-[length:var(--text-code-size)]';

/**
 * The copy control is a ghost IconButton, which owns its padding, radius and
 * hover surface; this only tints the resting glyph so it blends into the
 * header or the corner. A theme reaches it through the
 * `code-block-copy-button` target.
 */
export const codeBlockCopyButtonClassName =
  'text-[color:var(--color-syntax-comment)]';
