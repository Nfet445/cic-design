// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file diffViewerClasses.ts
 * @input Takes nothing; holds the Tailwind class names DiffViewer renders
 * @output diffViewer*ClassName strings and the per-instance CSS variable
 *   names the recipe sets inline
 * @position Internal Tailwind class map for DiffViewer; read by
 *   DiffViewer.tsx and by the lab Tailwind stylesheet test
 *
 * A class that must replace a value another class in the same list sets gets a
 * complete class, not an overriding one: Tailwind orders two classes that set
 * one property by the sheet, not by their order in the list.
 */

import {tw} from '../tw';

/** Horizontal offset of a pinned cell, in the hunk area's scroll space. */
export const DIFF_VIEWER_PIN_OFFSET_VAR = '--astryx-diff-viewer-pin-offset';
/** Width of one unified-view column. */
export const DIFF_VIEWER_COLUMN_WIDTH_VAR = '--astryx-diff-viewer-column-width';
/** Row track list of the split-view grid. */
export const DIFF_VIEWER_SPLIT_ROWS_VAR = '--astryx-diff-viewer-split-rows';
/** Column track list of one split-view pane. */
export const DIFF_VIEWER_PANE_COLUMNS_VAR = '--astryx-diff-viewer-pane-columns';

const BORDER_SOLID = '[border-style:solid] [border-width:var(--border-width)]';
const BORDER_COLOR = 'border-[color:var(--color-border)]';
const BORDER_BLOCK = tw(
  '[border-block-style:solid] [border-block-width:var(--border-width)]',
  BORDER_COLOR,
);

// Break at spaces first, and inside a token only when a word cannot fit.
// `overflow-wrap` only: `word-break` is already `normal`, and `break-normal`
// would set `overflow-wrap` back to `normal` on a sheet order it does not own.
const WRAPPED_TEXT = tw(
  'whitespace-pre-wrap',
  '[overflow-wrap:anywhere] [--_astryx-text-overflow-wrap:anywhere]',
);

// A pressable surface that keeps the surrounding type and paints nothing.
const PLAIN_BUTTON = tw(
  'rounded-[var(--radius-element)] bg-transparent text-inherit [font:inherit]',
  'cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default',
);

export const diffViewerRootClassName = tw(
  'isolate flex min-w-0 flex-col overflow-hidden',
  'rounded-[var(--radius-element)]',
  BORDER_SOLID,
  BORDER_COLOR,
  'bg-[color:var(--color-syntax-background)]',
);

export const diffViewerHeaderClassName = tw(
  'flex min-w-0 items-center gap-2 py-2 px-3',
  'bg-[color:var(--color-background-surface)] text-[color:var(--color-text-primary)]',
  'text-[length:var(--text-supporting-size)] leading-[var(--text-supporting-leading)]',
);

export const diffViewerHeaderDividerClassName =
  '[border-bottom-style:solid] [border-bottom-width:var(--border-width)] border-[color:var(--color-border)]';

export const diffViewerToggleClassName = tw(
  'flex min-w-0 items-center gap-1 p-0 border-0 text-start',
  PLAIN_BUTTON,
);

export const diffViewerChevronClassName = tw(
  'inline-flex shrink-0',
  'text-[color:var(--color-icon-secondary)]',
  'transition-[transform] duration-[var(--duration-fast)] ease-[var(--ease-standard)] motion-reduce:duration-0',
);

export const diffViewerChevronExpandedClassName = 'rotate-90';

export const diffViewerPathClassName = 'min-w-0 truncate font-mono font-medium';

export const diffViewerStatsClassName = 'inline-flex shrink-0 gap-1 font-mono';

export const diffViewerStatAddedClassName =
  'text-[color:var(--color-text-green)]';

export const diffViewerStatRemovedClassName =
  'text-[color:var(--color-text-red)]';

export const diffViewerHeaderEndClassName =
  'flex shrink-0 items-center gap-2 ms-auto';

export const diffViewerViewportClassName = 'min-w-0 [direction:ltr]';

export const diffViewerMessageClassName = tw(
  'py-3 px-4',
  'text-[color:var(--color-text-secondary)] text-[length:var(--text-supporting-size)]',
);

export const diffViewerTableClassName = tw(
  'border-collapse border-spacing-0 font-mono',
  'text-[length:var(--text-code-size)] leading-[var(--text-code-leading)]',
  'text-[color:var(--color-syntax-variable)] [tab-size:2]',
);

export const diffViewerColumnWidthClassName =
  'w-[var(--astryx-diff-viewer-column-width)]';

export const diffViewerTableScrollClassName = 'w-max min-w-full';

export const diffViewerTableWrappedClassName = 'w-full table-fixed';

// The line-number column's colour is part of the class: two classes that set
// one property are ordered by the sheet, not by the element's class list.
const GUTTER_BASE =
  'py-0 px-2 text-end align-top whitespace-nowrap select-none';

export const diffViewerGutterClassName = tw(
  GUTTER_BASE,
  'text-[color:var(--color-syntax-punctuation)]',
);

export const diffViewerGutterAddedClassName = tw(
  GUTTER_BASE,
  'text-[color:var(--color-syntax-added-marker)]',
);

export const diffViewerGutterRemovedClassName = tw(
  GUTTER_BASE,
  'text-[color:var(--color-syntax-removed-marker)]',
);

export const diffViewerGutterButtonClassName = tw(
  'inline p-0 m-0 border-0',
  PLAIN_BUTTON,
  'no-underline [@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:underline',
);

const MARKER_BASE = tw(
  'relative py-0 align-top whitespace-pre select-none',
  'text-[color:var(--color-text-secondary)]',
);

export const diffViewerMarkerClassName = tw(MARKER_BASE, 'ps-1 pe-2');

// Bars and no indicator: the column is only a gap before the code.
export const diffViewerMarkerSlimClassName = tw(MARKER_BASE, 'px-0');

// The bar sits at the start of the indicator column. Added lines get a solid
// bar, removed lines a dashed one, so the two read apart without colour.
export const diffViewerBarClassName =
  'absolute inset-y-0 start-0 w-[calc(3*var(--border-width))]';

export const diffViewerBarAddedClassName =
  'bg-[color:var(--color-syntax-added-marker)]';

export const diffViewerBarRemovedClassName =
  'bg-[repeating-linear-gradient(to_bottom,var(--color-syntax-removed-marker)_0_calc(2*var(--border-width)),transparent_calc(2*var(--border-width))_calc(4*var(--border-width)))]';

// Line numbers and indicators stay put while unwrapped code scrolls sideways.
// They paint the syntax background under their tint so code does not show
// through.
export const diffViewerStickyClassName = tw(
  'sticky z-[1]',
  'bg-[color:var(--color-syntax-background)]',
  'start-[var(--astryx-diff-viewer-pin-offset)]',
);

// The change glyph takes the row's colour, where the column's own colour is a
// class the sheet may place either side of this one.
export const diffViewerMarkerAddedClassName =
  'text-[color:var(--color-syntax-added-marker)]';

export const diffViewerMarkerRemovedClassName =
  'text-[color:var(--color-syntax-removed-marker)]';

export const diffViewerLtrClassName = '[direction:ltr] [unicode-bidi:isolate]';

const CODE_BASE = 'text-start py-0 ps-0 pe-4 align-top';

export const diffViewerCodeClassName = tw(CODE_BASE, 'whitespace-pre');

export const diffViewerCodeWrappedClassName = tw(CODE_BASE, WRAPPED_TEXT);

// Row tints are a background-image layer so a pinned cell can lay them over an
// opaque syntax background.
export const diffViewerAddedRowClassName =
  'bg-[linear-gradient(var(--color-syntax-added),var(--color-syntax-added))]';

export const diffViewerRemovedRowClassName =
  'bg-[linear-gradient(var(--color-syntax-removed),var(--color-syntax-removed))]';

const CHANGE_BASE =
  'rounded-[var(--radius-inner)] [box-decoration-break:clone]';

export const diffViewerChangeAddedClassName = tw(
  CHANGE_BASE,
  'bg-[color:var(--color-syntax-added)]',
  diffViewerAddedRowClassName,
);

export const diffViewerChangeRemovedClassName = tw(
  CHANGE_BASE,
  'bg-[color:var(--color-syntax-removed)]',
  diffViewerRemovedRowClassName,
);

export const diffViewerFillerClassName =
  'bg-[color:var(--color-syntax-diff-header)]';

const HUNK_BASE = tw(
  'py-1 px-3 text-start',
  'bg-[color:var(--color-syntax-diff-header)] text-[color:var(--color-syntax-punctuation)]',
  BORDER_BLOCK,
);

export const diffViewerHunkClassName = tw(HUNK_BASE, 'whitespace-pre');

export const diffViewerHunkWrappedClassName = tw(HUNK_BASE, WRAPPED_TEXT);

const FOLD_BASE = tw(
  'py-2 px-3 text-start',
  'bg-[color:var(--color-syntax-diff-header)] text-[color:var(--color-text-secondary)] font-sans',
  'text-[length:var(--text-supporting-size)] leading-[var(--text-supporting-leading)]',
  BORDER_BLOCK,
);

export const diffViewerFoldClassName = FOLD_BASE;

export const diffViewerFoldWrappedClassName = tw(FOLD_BASE, WRAPPED_TEXT);

export const diffViewerFoldContentClassName =
  'inline-flex flex-wrap items-center gap-3';

// Unwrapped, the header text stays at the visible start while code scrolls.
export const diffViewerHunkTextStickyClassName = 'sticky start-3';

// Split view: two panes in one grid. Each pane spans every row track and
// shares them through `subgrid`, so a row is as tall as its taller side.
export const diffViewerSplitClassName =
  'grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] grid-rows-[var(--astryx-diff-viewer-split-rows)]';

export const diffViewerPaneClassName =
  'grid row-span-full grid-rows-subgrid grid-cols-[minmax(0,1fr)] min-w-0';

export const diffViewerPaneOldClassName = tw(
  'col-start-1',
  '[border-inline-end-style:solid] [border-inline-end-width:var(--border-width)]',
  BORDER_COLOR,
);

export const diffViewerPaneNewClassName = 'col-start-2';

export const diffViewerPaneTableClassName =
  'grid row-span-full grid-rows-subgrid';

export const diffViewerPaneColumnsClassName =
  'grid-cols-[var(--astryx-diff-viewer-pane-columns)]';

export const diffViewerPaneTableScrollClassName = 'w-max min-w-full';

export const diffViewerPaneTableWrappedClassName = 'w-full';

export const diffViewerPaneRowClassName =
  'grid col-span-full grid-cols-subgrid';

export const diffViewerPaneSpanClassName = 'col-span-full';

export const diffViewerInvisibleClassName = 'invisible';

// Unwrapped split view: a zero-height, invisible row in both panes holding the
// widest line of either side, so both panes scroll in lockstep.
export const diffViewerSizerClassName =
  'col-[-2/-1] h-0 invisible pointer-events-none';

// Column headers exist for assistive technology only: their text is visually
// hidden, so the header row takes no height.
export const diffViewerColumnHeaderClassName = 'p-0 border-0';

// Annotation cells stay left-to-right like the rest of the hunk area, so they
// start at its visible left edge and the split divider stays put.
export const diffViewerAnnotationClassName = tw(
  'py-2 px-3 align-top whitespace-normal font-sans',
  'text-[length:var(--text-body-size)] leading-[var(--text-body-leading)]',
  'text-[color:var(--color-text-primary)]',
  'bg-[color:var(--color-background-surface)]',
  BORDER_BLOCK,
);

// The caller's content reads in the page's direction. Inline-size containment
// keeps it out of the table's max-content width, so a long comment wraps
// within the width the code sets instead of widening the table.
export const diffViewerAnnotationContentClassName = tw(
  '[&:is([dir="rtl"]_*)]:[direction:rtl]',
  '[overflow-wrap:anywhere] [--_astryx-text-overflow-wrap:anywhere]',
  '[contain:inline-size]',
);

/** The mirrored disclosure chevron of a right-to-left page. */
export const diffViewerMirrorClassName =
  '[&:is([dir="rtl"]_*)]:[transform:scaleX(-1)]';
