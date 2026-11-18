// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DiffViewer.tsx
 * @input Uses React, StyleX, theme tokens, the shared CodeBlock tokenizer and
 *   syntax-theme slots (incl. the diff row slots), useScrollableArea,
 *   Token, Icon, Button, VisuallyHidden, and the i18n translator
 * @output Exports DiffViewer component, DiffViewerProps, DiffViewerViewMode,
 *   DiffViewerChangeIndicator, DiffViewerInlineHighlight
 * @position Lab implementation; read-only, syntax-highlighted file diff for
 *   code review surfaces
 *
 * Renders one DiffViewerFile: a file header (path, status, +/- counts, a
 * caller slot, optional disclosure) over its hunks in unified or split view.
 * A hunk marked `isReplacedBlock`, and a file with more than
 * MAX_UNFOLDED_CHANGED_LINES other changed lines, show a labeled fold until
 * the reader opens it.
 * Unified view is one table. Split view is two side-by-side panes (each an
 * ARIA table) whose rows share one grid's row tracks through `subgrid`, so a
 * row is as tall as its taller side while each pane scrolls sideways on its
 * own. Rows take their tint, gutter, and header paint from the same
 * syntax-theme slots CodeBlock's diff layer uses, so a syntax theme styles
 * both. Changed lines can show +/- glyphs or bars, and paired removed/added
 * lines highlight the words (or characters) that changed. Callers can render
 * annotation rows under any line (review comments) and make the line numbers
 * actionable.
 *
 * Known limit: rows are plain DOM — there is NO virtualization. Very large
 * files should be windowed or collapsed by the caller.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/DiffViewer/DiffViewer.doc.mjs (props table, notes)
 * - /packages/lab/src/DiffViewer/DiffViewer.test.tsx (behavior tests)
 * - /packages/lab/src/DiffViewer/index.ts (exports if types change)
 * - /packages/lab/src/DiffViewer/inlineDiff.ts (inline highlight ranges)
 * - /apps/storybook/stories/DiffViewer.stories.tsx (examples and visual coverage)
 */

'use client';

import {
  Fragment,
  useId,
  useInsertionEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  type Ref,
  type UIEvent,
} from 'react';
import * as stylex from '@stylexjs/stylex';

import type {BaseProps} from '@astryxdesign/core';
import {
  ensureHighlightStyles,
  tokenize,
  type CodeLanguage,
  type SyntaxToken,
  type TokenLine,
} from '@astryxdesign/core/CodeBlock';
import {
  useScrollableArea,
  type ScrollableElementProps,
} from '@astryxdesign/core/hooks';
import {Button} from '@astryxdesign/core/Button';
import {useTranslator} from '@astryxdesign/core/i18n';
import {Icon} from '@astryxdesign/core/Icon';
import {
  SyntaxTheme,
  type SyntaxThemeDefinition,
} from '@astryxdesign/core/theme/syntax';
import {spacingVarNames} from '@astryxdesign/core/theme';
import {
  focusOutlineFocusVisibleClassName,
  isRenderable,
  mergeProps,
  themeProps,
} from '@astryxdesign/core/utils';
import {Token, type TokenColor} from '@astryxdesign/core/Token';
import {VisuallyHidden} from '@astryxdesign/core/VisuallyHidden';

import {tw} from '../tw';

import type {
  DiffViewerFile,
  DiffViewerFileStatus,
  DiffViewerLine,
  DiffViewerLineRef,
  DiffViewerSide,
} from './diffTypes';
import {
  DIFF_VIEWER_COLUMN_WIDTH_VAR,
  DIFF_VIEWER_PANE_COLUMNS_VAR,
  DIFF_VIEWER_PIN_OFFSET_VAR,
  DIFF_VIEWER_SPLIT_ROWS_VAR,
  diffViewerAddedRowClassName,
  diffViewerAnnotationClassName,
  diffViewerAnnotationContentClassName,
  diffViewerBarAddedClassName,
  diffViewerBarClassName,
  diffViewerBarRemovedClassName,
  diffViewerChangeAddedClassName,
  diffViewerChangeRemovedClassName,
  diffViewerChevronClassName,
  diffViewerChevronExpandedClassName,
  diffViewerCodeClassName,
  diffViewerCodeWrappedClassName,
  diffViewerColumnHeaderClassName,
  diffViewerColumnWidthClassName,
  diffViewerFillerClassName,
  diffViewerFoldClassName,
  diffViewerFoldContentClassName,
  diffViewerFoldWrappedClassName,
  diffViewerGutterAddedClassName,
  diffViewerGutterButtonClassName,
  diffViewerGutterClassName,
  diffViewerGutterRemovedClassName,
  diffViewerHeaderDividerClassName,
  diffViewerHeaderEndClassName,
  diffViewerHeaderClassName,
  diffViewerHunkClassName,
  diffViewerHunkTextStickyClassName,
  diffViewerHunkWrappedClassName,
  diffViewerInvisibleClassName,
  diffViewerLtrClassName,
  diffViewerMarkerAddedClassName,
  diffViewerMarkerClassName,
  diffViewerMarkerRemovedClassName,
  diffViewerMarkerSlimClassName,
  diffViewerMessageClassName,
  diffViewerMirrorClassName,
  diffViewerPaneClassName,
  diffViewerPaneColumnsClassName,
  diffViewerPaneNewClassName,
  diffViewerPaneOldClassName,
  diffViewerPaneRowClassName,
  diffViewerPaneSpanClassName,
  diffViewerPaneTableClassName,
  diffViewerPaneTableScrollClassName,
  diffViewerPaneTableWrappedClassName,
  diffViewerPathClassName,
  diffViewerRemovedRowClassName,
  diffViewerRootClassName,
  diffViewerSizerClassName,
  diffViewerSplitClassName,
  diffViewerStatAddedClassName,
  diffViewerStatRemovedClassName,
  diffViewerStatsClassName,
  diffViewerStickyClassName,
  diffViewerTableClassName,
  diffViewerTableScrollClassName,
  diffViewerTableWrappedClassName,
  diffViewerToggleClassName,
  diffViewerViewportClassName,
} from './diffViewerClasses';
import {diffInlineRanges, type InlineRange} from './inlineDiff';

/** How hunks are laid out: one column, or old and new side by side. */
export type DiffViewerViewMode = 'unified' | 'split';

/**
 * How a changed line is marked beside its code: `classic` `+`/`-` glyphs,
 * `bars` (a solid bar for added lines and a dashed one for removed lines), or
 * `none`. Screen readers hear "Added"/"Removed" in every mode.
 */
export type DiffViewerChangeIndicator = 'classic' | 'bars' | 'none';

/**
 * How finely to highlight what changed inside a removed line and the added
 * line that replaced it: by `word`, by `char`acter, or `none`.
 */
export type DiffViewerInlineHighlight = 'word' | 'char' | 'none';

export interface DiffViewerProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element. */
  ref?: Ref<HTMLDivElement>;
  /**
   * The file to render. Build one with `parseUnifiedDiff(patch)` (one per
   * file in the patch) or `createDiffFile({oldValue, newValue})`.
   */
  file: DiffViewerFile;
  /**
   * `unified` shows one column with removed lines above their replacements;
   * `split` shows the old file on the left and the new file on the right,
   * pairing each removed line with the added line that replaced it. The hunk
   * area reads left-to-right in every page direction, like a code editor;
   * the file header and annotation content follow the page, and annotation
   * rows scroll with the code.
   * @default 'unified'
   */
  viewMode?: DiffViewerViewMode;
  /**
   * Syntax-highlighting language: a built-in identifier such as `'rust'`, or
   * a language value — a module imported on its own, such as `graphql` from
   * `@astryxdesign/core/CodeBlock/languages/graphql`, or one made with
   * `createCodeLanguage`. Defaults to one inferred from the file's name or
   * extension among the built-ins and `codeLanguages`; an unmatched file
   * renders as plain text.
   */
  language?: string | CodeLanguage;
  /**
   * Language values the file's name or extension may infer, such as
   * `[graphql, dockerfile]`; a later entry wins. Pass the same list to every
   * DiffViewer on a review page.
   */
  codeLanguages?: ReadonlyArray<CodeLanguage>;
  /**
   * Show the old and new line-number gutters.
   * @default true
   */
  hasLineNumbers?: boolean;
  /**
   * Wrap long lines instead of scrolling them horizontally. Unwrapped, line
   * numbers and change indicators stay pinned while the code scrolls; in
   * split view each side is its own scroller, the split stays fixed at half
   * and half, and the two sides scroll sideways in lockstep. While code
   * overflows sideways, sideways overscroll (elastic bounce, swipe
   * navigation) is off.
   * @default false
   */
  isWrapped?: boolean;
  /**
   * How changed lines are marked beside their code.
   * @default 'classic'
   */
  changeIndicator?: DiffViewerChangeIndicator;
  /**
   * Highlight the changed words (or characters) inside each removed line and
   * the added line that replaced it. Lines that share nothing but whitespace
   * get no inline highlight; the row tint already marks them.
   * @default 'word'
   */
  inlineHighlight?: DiffViewerInlineHighlight;
  /**
   * Tint the rows of added and removed lines. Without it only the change
   * indicator, the line numbers, and the inline highlight mark a change.
   * @default true
   */
  hasChangeBackground?: boolean;
  /**
   * Make the file header a disclosure that hides and shows the hunks. Needs a
   * file path to name the control.
   * @default true
   */
  isCollapsible?: boolean;
  /** Controlled collapsed state. Pair with `onCollapsedChange`. */
  isCollapsed?: boolean;
  /**
   * Initial collapsed state when uncontrolled.
   * @default false
   */
  defaultIsCollapsed?: boolean;
  /** Called with the next collapsed state when the header is toggled. */
  onCollapsedChange?: (isCollapsed: boolean) => void;
  /**
   * Content at the end of the file header, e.g. a "Viewed" checkbox or a menu
   * of file actions.
   */
  headerEnd?: ReactNode;
  /**
   * Render content in a full-width row under a line, e.g. review comments.
   * Return `null` (or `false`) for lines with nothing to show. Called once per line with
   * its {@link DiffViewerLineRef}; in split view the row sits under the
   * line's own side.
   */
  renderLineAnnotation?: (ref: DiffViewerLineRef) => ReactNode;
  /**
   * Makes each line's number a button (e.g. to start a comment on that line).
   * Receives the line's {@link DiffViewerLineRef}. Only the number on the
   * line's anchor side is a button, so an unchanged line's original number
   * stays plain text. Each button is its own Tab stop, like any other set of
   * independent buttons.
   */
  onLineNumberClick?: (
    ref: DiffViewerLineRef,
    event: MouseEvent<HTMLButtonElement>,
  ) => void;
  /** Maximum height of the hunk area before it scrolls. */
  maxHeight?: number | string;
  /**
   * Per-instance syntax theme, as on CodeBlock. Without it the nearest
   * `SyntaxTheme` or the theme's syntax colors apply.
   */
  syntaxTheme?: SyntaxThemeDefinition;
}

// ---------------------------------------------------------------------------
// Language inference
// ---------------------------------------------------------------------------

const EXTENSION_LANGUAGES: Record<string, string> = {
  ts: 'ts',
  mts: 'ts',
  cts: 'ts',
  tsx: 'tsx',
  js: 'js',
  mjs: 'js',
  cjs: 'js',
  jsx: 'jsx',
  json: 'json',
  html: 'html',
  htm: 'html',
  xml: 'xml',
  svg: 'svg',
  css: 'css',
  scss: 'scss',
  less: 'less',
  py: 'python',
  sh: 'bash',
  bash: 'bash',
  zsh: 'zsh',
  php: 'php',
  hack: 'hack',
  yaml: 'yaml',
  yml: 'yaml',
  md: 'markdown',
  markdown: 'markdown',
  c: 'c',
  h: 'c',
  cpp: 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  hpp: 'cpp',
  hh: 'cpp',
  sql: 'sql',
  rs: 'rust',
  kt: 'kotlin',
  kts: 'kotlin',
  swift: 'swift',
  go: 'go',
};

/**
 * The language a file's name or extension infers: a listed value first (a
 * later entry wins), then a built-in, else plain text (CodeBlock FR13).
 */
function inferLanguage(
  path: string | null,
  codeLanguages: ReadonlyArray<CodeLanguage> | undefined,
): string | CodeLanguage {
  if (path == null) {
    return 'plaintext';
  }
  const base = path.slice(path.lastIndexOf('/') + 1);
  const dot = base.lastIndexOf('.');
  const extension = dot > 0 ? base.slice(dot + 1).toLowerCase() : null;
  if (codeLanguages != null) {
    for (let i = codeLanguages.length - 1; i >= 0; i--) {
      const language = codeLanguages[i];
      if (
        language.fileNames.includes(base) ||
        (extension != null && language.fileExtensions.includes(extension))
      ) {
        return language;
      }
    }
  }
  return extension == null
    ? 'plaintext'
    : (EXTENSION_LANGUAGES[extension] ?? 'plaintext');
}

// ---------------------------------------------------------------------------
// Row model
// ---------------------------------------------------------------------------

interface LineCell {
  line: DiffViewerLine;
  ref: DiffViewerLineRef;
  tokens: TokenLine;
  /** Changed character ranges to highlight inside the line. */
  emphasis: readonly InlineRange[];
}

/** The control that folds a replaced block's changed lines. */
interface ReplacedBlockFold {
  hunkIndex: number;
  /** Index of the hunk cell the fold row goes before. */
  at: number;
  /** Removed plus added lines in the block. */
  changedLines: number;
  isExpanded: boolean;
}

interface HunkCells {
  cells: LineCell[];
  fold: ReplacedBlockFold | null;
}

type FoldRow = {type: 'fold'; key: string; fold: ReplacedBlockFold};

type UnifiedRow =
  | {type: 'hunk'; key: string; header: string}
  | {type: 'line'; key: string; cell: LineCell}
  | FoldRow;

type SplitRow =
  | {type: 'hunk'; key: string; header: string}
  | {type: 'pair'; key: string; old: LineCell | null; new: LineCell | null}
  | FoldRow;

/**
 * The caller's annotation for a line, or null when it renders nothing. An
 * annotation row is drawn only for a note that renders, so
 * `hasThread && <Thread />` adds no empty row.
 */
function lineAnnotation(
  renderLineAnnotation: (ref: DiffViewerLineRef) => ReactNode,
  ref: DiffViewerLineRef,
): ReactNode {
  const note = renderLineAnnotation(ref);
  return isRenderable(note) ? note : null;
}

function lineRef(
  line: DiffViewerLine,
  hunkIndex: number,
): DiffViewerLineRef | null {
  if (line.kind === 'removed') {
    return line.oldLineNumber == null
      ? null
      : {side: 'old', lineNumber: line.oldLineNumber, line, hunkIndex};
  }
  return line.newLineNumber == null
    ? null
    : {side: 'new', lineNumber: line.newLineNumber, line, hunkIndex};
}

/**
 * Pair each run of removed lines with the run of added lines after it, line
 * by line (the same pairing split view shows), and mark what changed inside
 * each pair.
 */
function addInlineEmphasis(
  cells: LineCell[],
  granularity: 'word' | 'char',
): void {
  let i = 0;
  while (i < cells.length) {
    if (cells[i].line.kind !== 'removed') {
      i++;
      continue;
    }
    const removed: LineCell[] = [];
    const added: LineCell[] = [];
    while (i < cells.length && cells[i].line.kind === 'removed') {
      removed.push(cells[i++]);
    }
    while (i < cells.length && cells[i].line.kind === 'added') {
      added.push(cells[i++]);
    }
    const pairs = Math.min(removed.length, added.length);
    for (let r = 0; r < pairs; r++) {
      const ranges = diffInlineRanges(
        removed[r].line.content,
        added[r].line.content,
        granularity,
      );
      removed[r].emphasis = ranges.old;
      added[r].emphasis = ranges.new;
    }
  }
}

/**
 * Most changed lines a file shows before the reader asks for them. Rows are
 * not virtualized, and each row costs render time. A file with more changed
 * lines starts folded. Lines in replaced blocks do not count, because those
 * blocks fold on their own.
 */
const MAX_UNFOLDED_CHANGED_LINES = 2000;

/**
 * Hunks with an annotation on one of their lines. A fold that would hide such
 * a line starts open, so a review comment is never hidden.
 */
function findAnnotatedHunks(
  file: DiffViewerFile,
  renderLineAnnotation: ((ref: DiffViewerLineRef) => ReactNode) | undefined,
): Set<number> {
  const hunks = new Set<number>();
  if (renderLineAnnotation == null) {
    return hunks;
  }
  file.hunks.forEach((hunk, hunkIndex) => {
    const isAnnotated = hunk.lines.some(line => {
      // A replaced block's fold keeps its context lines in view.
      if (hunk.isReplacedBlock === true && line.kind === 'context') {
        return false;
      }
      const ref = lineRef(line, hunkIndex);
      return ref != null && lineAnnotation(renderLineAnnotation, ref) != null;
    });
    if (isAnnotated) {
      hunks.add(hunkIndex);
    }
  });
  return hunks;
}

/**
 * Tokenize a run of hunk lines with its old and new side each as continuous
 * text, so constructs that span lines (block comments, template strings) keep
 * their paint within the run, and give each line the tokens of the side it
 * renders from.
 */
function tokenizeRun(
  lines: readonly DiffViewerLine[],
  language: string | CodeLanguage,
): TokenLine[] {
  if (language === 'plaintext') {
    return lines.map(() => []);
  }
  const sideText = (kind: 'added' | 'removed') =>
    lines
      .filter(line => line.kind !== kind)
      .map(line => line.content)
      .join('\n');
  const oldTokens = tokenize(sideText('added'), language);
  const newTokens = tokenize(sideText('removed'), language);
  let oldIndex = 0;
  let newIndex = 0;
  return lines.map(line => {
    if (line.kind === 'removed') {
      return oldTokens[oldIndex++] ?? [];
    }
    if (line.kind === 'added') {
      return newTokens[newIndex++] ?? [];
    }
    oldIndex++;
    return newTokens[newIndex++] ?? [];
  });
}

/**
 * Build each hunk's line cells. A folded replaced block keeps only the
 * context around it, and its changed lines are not tokenized.
 */
function buildCells(
  file: DiffViewerFile,
  language: string | CodeLanguage,
  inlineHighlight: DiffViewerInlineHighlight,
  expandedBlocks: ReadonlySet<number>,
): HunkCells[] {
  return file.hunks.map((hunk, hunkIndex) => {
    const cells: LineCell[] = [];
    const addRun = (lines: readonly DiffViewerLine[]) => {
      const tokens = tokenizeRun(lines, language);
      lines.forEach((line, i) => {
        const ref = lineRef(line, hunkIndex);
        if (ref != null) {
          cells.push({line, ref, tokens: tokens[i], emphasis: []});
        }
      });
    };

    const changeStart =
      hunk.isReplacedBlock === true
        ? hunk.lines.findIndex(line => line.kind !== 'context')
        : -1;
    if (changeStart === -1) {
      addRun(hunk.lines);
      if (inlineHighlight !== 'none') {
        addInlineEmphasis(cells, inlineHighlight);
      }
      return {cells, fold: null};
    }

    // A replaced block's removed and added lines are not edits of each
    // other, so they get no inline highlight.
    const isExpanded = expandedBlocks.has(hunkIndex);
    const changedLines = hunk.lines.filter(
      line => line.kind !== 'context',
    ).length;
    if (isExpanded) {
      addRun(hunk.lines);
      const at = cells.findIndex(cell => cell.line.kind !== 'context');
      return {
        cells,
        fold: {hunkIndex, at, changedLines, isExpanded},
      };
    }
    // Leading and trailing context are tokenized apart: the hidden lines
    // between them can open or close a comment or a string.
    addRun(hunk.lines.slice(0, changeStart));
    const at = cells.length;
    addRun(hunk.lines.slice(changeStart + changedLines));
    return {cells, fold: {hunkIndex, at, changedLines, isExpanded}};
  });
}

function buildUnifiedRows(
  file: DiffViewerFile,
  cells: HunkCells[],
): UnifiedRow[] {
  const rows: UnifiedRow[] = [];
  file.hunks.forEach((hunk, h) => {
    rows.push({type: 'hunk', key: `h${h}`, header: hunk.header});
    const {cells: hunkCells, fold} = cells[h];
    hunkCells.forEach((cell, i) => {
      if (fold != null && fold.at === i) {
        rows.push({type: 'fold', key: `h${h}f`, fold});
      }
      rows.push({type: 'line', key: `h${h}l${i}`, cell});
    });
    if (fold != null && fold.at === hunkCells.length) {
      rows.push({type: 'fold', key: `h${h}f`, fold});
    }
  });
  return rows;
}

/**
 * Pair each run of removed lines with the run of added lines that follows it,
 * row by row; context lines appear on both sides of one row.
 */
function buildSplitRows(file: DiffViewerFile, cells: HunkCells[]): SplitRow[] {
  const rows: SplitRow[] = [];
  file.hunks.forEach((hunk, h) => {
    rows.push({type: 'hunk', key: `h${h}`, header: hunk.header});
    const {cells: hunkCells, fold} = cells[h];
    let i = 0;
    while (i < hunkCells.length) {
      // The fold sits where a run of changes starts or ends, never inside one.
      if (fold != null && fold.at === i) {
        rows.push({type: 'fold', key: `h${h}f`, fold});
      }
      const cell = hunkCells[i];
      if (cell.line.kind === 'context') {
        rows.push({type: 'pair', key: `h${h}l${i}`, old: cell, new: cell});
        i++;
        continue;
      }
      const removed: LineCell[] = [];
      const added: LineCell[] = [];
      while (i < hunkCells.length && hunkCells[i].line.kind === 'removed') {
        removed.push(hunkCells[i++]);
      }
      while (i < hunkCells.length && hunkCells[i].line.kind === 'added') {
        added.push(hunkCells[i++]);
      }
      const count = Math.max(removed.length, added.length);
      for (let r = 0; r < count; r++) {
        rows.push({
          type: 'pair',
          key: `h${h}l${i}r${r}`,
          old: removed[r] ?? null,
          new: added[r] ?? null,
        });
      }
    }
    if (fold != null && fold.at === hunkCells.length) {
      rows.push({type: 'fold', key: `h${h}f`, fold});
    }
  });
  return rows;
}

interface Piece {
  start: number;
  end: number;
  type: string | null;
  isChanged: boolean;
}

/**
 * Cut a line into pieces at every syntax-token and inline-highlight boundary,
 * so each piece carries one token type and one changed/unchanged state.
 */
function buildPieces(
  text: string,
  tokens: SyntaxToken[],
  emphasis: readonly InlineRange[],
): Piece[] {
  const segments: Array<{start: number; end: number; type: string | null}> = [];
  let cursor = 0;
  for (const token of tokens) {
    const start = Math.max(token.start, cursor);
    const end = Math.min(token.end, text.length);
    if (start > cursor) {
      segments.push({start: cursor, end: start, type: null});
    }
    if (end > start) {
      segments.push({start, end, type: token.type});
    }
    cursor = Math.max(cursor, end);
  }
  if (cursor < text.length) {
    segments.push({start: cursor, end: text.length, type: null});
  }

  const cuts = new Set<number>();
  for (const [start, end] of emphasis) {
    cuts.add(start);
    cuts.add(end);
  }
  const isChanged = (offset: number) =>
    emphasis.some(([start, end]) => offset >= start && offset < end);

  const pieces: Piece[] = [];
  for (const segment of segments) {
    let start = segment.start;
    for (let offset = segment.start + 1; offset < segment.end; offset++) {
      if (cuts.has(offset)) {
        pieces.push({
          start,
          end: offset,
          type: segment.type,
          isChanged: isChanged(start),
        });
        start = offset;
      }
    }
    pieces.push({
      start,
      end: segment.end,
      type: segment.type,
      isChanged: isChanged(start),
    });
  }
  return pieces;
}

function renderPiece(text: string, piece: Piece): ReactNode {
  const slice = text.slice(piece.start, piece.end);
  return piece.type == null ? (
    <Fragment key={piece.start}>{slice}</Fragment>
  ) : (
    <span key={piece.start} className={`astryx-token-${piece.type}`}>
      {slice}
    </span>
  );
}

function buildSpans(
  text: string,
  tokens: SyntaxToken[],
  emphasis: readonly InlineRange[],
  changeClassName: string,
): ReactNode {
  if (text === '') {
    return '\u200b';
  }
  if (tokens.length === 0 && emphasis.length === 0) {
    return text;
  }
  const pieces = buildPieces(text, tokens, emphasis);
  const parts: ReactNode[] = [];
  let i = 0;
  while (i < pieces.length) {
    if (!pieces[i].isChanged) {
      parts.push(renderPiece(text, pieces[i]));
      i++;
      continue;
    }
    // One highlight per changed range, holding its syntax-token spans.
    const run: ReactNode[] = [];
    const first = pieces[i].start;
    while (i < pieces.length && pieces[i].isChanged) {
      run.push(renderPiece(text, pieces[i]));
      i++;
    }
    parts.push(
      <span key={`c${first}`} data-diff-change="" className={changeClassName}>
        {run}
      </span>,
    );
  }
  return parts;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const TAB_SIZE = 2;

// Column widths, also used to place pinned cells and size split panes.
const MARKER_WIDTH: Record<DiffViewerChangeIndicator, string> = {
  classic: `calc(1ch + ${spacingVarNames['--spacing-1']} + ${spacingVarNames['--spacing-2']})`,
  bars: spacingVarNames['--spacing-3'],
  none: spacingVarNames['--spacing-2'],
};

/* A per-instance value is a private variable a class reads, never an inline
   declaration. */
function customProperty(name: `--${string}`, value: string): CSSProperties {
  const style: Record<`--${string}`, string> = {[name]: value};
  return style;
}

function gutterWidth(digits: number): string {
  return `calc(${digits}ch + 2 * ${spacingVarNames['--spacing-2']})`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

// File status is a category of change, not an alert, so it is a coloured
// Token rather than a status Badge.
const STATUS_COLORS: Partial<Record<DiffViewerFileStatus, TokenColor>> = {
  added: 'green',
  deleted: 'red',
  renamed: 'blue',
};

type CellTag = 'td' | 'div';

interface DiffViewerPaneProps {
  side: DiffViewerSide;
  label: string;
  /** The pane's `grid-template-columns`. */
  columns: string;
  isWrapped: boolean;
  viewportRef?: Ref<HTMLDivElement>;
  onScroll?: (event: UIEvent<HTMLDivElement>) => void;
  children: ReactNode;
}

/**
 * Sideways overscroll is turned off on a DiffViewer scroller while its code
 * overflows sideways: no elastic bounce past a line's start or end, and no
 * browser back/forward swipe while reading code. A scroller with nothing to
 * scroll sideways (wrapped lines, or split view's block-only viewport) keeps
 * the hook's policy so sideways gestures reach the page. Vertical overscroll
 * always keeps the hook's policy so the page still scrolls on past the diff.
 * Applied over the hook's own (inline) overscroll style, which only knows
 * `auto` and `contain`.
 */
function withoutInlineOverscroll(
  props: ScrollableElementProps<HTMLDivElement>,
): ScrollableElementProps<HTMLDivElement> {
  return props['data-scrollable-inline'] === 'true'
    ? {...props, style: {...props.style, overscrollBehaviorX: 'none'}}
    : props;
}

/**
 * One side of split view: a sideways scroller (keyboard-reachable once it
 * overflows) around that side's ARIA table.
 */
function DiffViewerPane({
  side,
  label,
  columns,
  isWrapped,
  viewportRef,
  onScroll,
  children,
}: DiffViewerPaneProps) {
  const {getViewportProps, getContentProps} = useScrollableArea({
    axis: 'inline',
    keyboardAccess: {owner: 'viewport', role: 'group', label},
  });
  return (
    <div
      data-diff-pane={side}
      {...withoutInlineOverscroll(
        getViewportProps<HTMLDivElement>({
          className: tw(
            diffViewerPaneClassName,
            side === 'old'
              ? diffViewerPaneOldClassName
              : diffViewerPaneNewClassName,
          ),
          ref: viewportRef,
          onScroll,
        }),
      )}>
      <div
        role="table"
        {...getContentProps<HTMLDivElement>({
          className: tw(
            diffViewerTableClassName,
            diffViewerPaneTableClassName,
            diffViewerPaneColumnsClassName,
            isWrapped
              ? diffViewerPaneTableWrappedClassName
              : diffViewerPaneTableScrollClassName,
          ),
          style: customProperty(DIFF_VIEWER_PANE_COLUMNS_VAR, columns),
        })}>
        {children}
      </div>
    </div>
  );
}

/**
 * The line of `lines` likely to render widest, by its length with tabs
 * expanded and wide (East Asian, emoji) characters counted twice.
 */
function widestLine(lines: Iterable<string>): string {
  let widest = '';
  let widestWidth = -1;
  for (const line of lines) {
    let width = 0;
    for (const char of line) {
      const code = char.codePointAt(0) ?? 0;
      width += char === '\t' ? TAB_SIZE : code >= 0x1100 ? 2 : 1;
    }
    if (width > widestWidth) {
      widest = line;
      widestWidth = width;
    }
  }
  return widest;
}

/**
 * Read-only, syntax-highlighted diff of one file, in unified or split view,
 * for code review surfaces. Supports review-comment annotation rows under any
 * line and actionable line numbers.
 *
 * @example
 * ```
 * const [file] = parseUnifiedDiff(patch);
 * <DiffViewer file={file} viewMode="split" />
 * ```
 */
export function DiffViewer({
  ref,
  file,
  viewMode = 'unified',
  language: languageProp,
  codeLanguages,
  hasLineNumbers = true,
  isWrapped = false,
  changeIndicator = 'classic',
  inlineHighlight = 'word',
  hasChangeBackground = true,
  isCollapsible = true,
  isCollapsed: isCollapsedProp,
  defaultIsCollapsed = false,
  onCollapsedChange,
  headerEnd,
  renderLineAnnotation,
  onLineNumberClick,
  maxHeight,
  syntaxTheme,
  xstyle,
  className,
  style,
  ...props
}: DiffViewerProps) {
  const t = useTranslator();
  const bodyId = useId();

  useInsertionEffect(() => {
    ensureHighlightStyles();
  }, []);

  const path = file.newPath ?? file.oldPath;
  const language = languageProp ?? inferLanguage(path, codeLanguages);
  const displayPath =
    file.status === 'renamed' && file.oldPath != null && file.newPath != null
      ? t('@astryx.diffViewer.renamedPath', {
          oldPath: file.oldPath,
          newPath: file.newPath,
        })
      : path;

  const [uncontrolledCollapsed, setUncontrolledCollapsed] =
    useState(defaultIsCollapsed);
  const canCollapse = isCollapsible && displayPath != null;
  const isCollapsed = canCollapse && (isCollapsedProp ?? uncontrolledCollapsed);
  const toggleCollapsed = () => {
    const next = !isCollapsed;
    if (isCollapsedProp === undefined) {
      setUncontrolledCollapsed(next);
    }
    onCollapsedChange?.(next);
  };

  let unfoldedChangedLines = 0;
  let hasReplacedBlock = false;
  for (const hunk of file.hunks) {
    if (hunk.isReplacedBlock === true) {
      hasReplacedBlock = true;
      continue;
    }
    for (const line of hunk.lines) {
      if (line.kind !== 'context') {
        unfoldedChangedLines++;
      }
    }
  }
  const isLargeFile = unfoldedChangedLines > MAX_UNFOLDED_CHANGED_LINES;
  const annotatedHunks =
    isLargeFile || hasReplacedBlock
      ? findAnnotatedHunks(file, renderLineAnnotation)
      : null;

  // A large file and a replaced block start folded unless a line they would
  // hide is annotated. The reader's toggles are kept per file; a new file
  // starts over.
  const [fileToggle, setFileToggle] = useState<{
    file: DiffViewerFile;
    isExpanded: boolean;
  } | null>(null);
  const isFileFolded =
    isLargeFile &&
    !(fileToggle?.file === file
      ? fileToggle.isExpanded
      : (annotatedHunks?.size ?? 0) > 0);
  const toggleFile = () => {
    setFileToggle({file, isExpanded: isFileFolded});
  };

  const [blockToggles, setBlockToggles] = useState<{
    file: DiffViewerFile;
    isExpanded: ReadonlyMap<number, boolean>;
  } | null>(null);
  const toggles = blockToggles?.file === file ? blockToggles.isExpanded : null;
  const isBlockExpanded = (hunkIndex: number) =>
    toggles?.get(hunkIndex) ?? annotatedHunks?.has(hunkIndex) ?? false;
  const toggleBlock = (hunkIndex: number) => {
    const next = new Map(toggles);
    next.set(hunkIndex, !isBlockExpanded(hunkIndex));
    setBlockToggles({file, isExpanded: next});
  };
  // A key of the open blocks keeps the set stable across renders, so the
  // cells are built again only when a block opens or closes.
  const expandedKey = file.hunks
    .flatMap((hunk, hunkIndex) =>
      hunk.isReplacedBlock === true && isBlockExpanded(hunkIndex)
        ? [hunkIndex]
        : [],
    )
    .join(',');
  const expandedBlocks = useMemo(
    () => new Set(expandedKey === '' ? [] : expandedKey.split(',').map(Number)),
    [expandedKey],
  );

  // A folded file builds no cells, so its lines are not tokenized.
  const cells = useMemo(
    () =>
      isFileFolded
        ? []
        : buildCells(file, language, inlineHighlight, expandedBlocks),
    [isFileFolded, file, language, inlineHighlight, expandedBlocks],
  );
  const unifiedRows = useMemo(
    () =>
      viewMode === 'unified' && !isFileFolded
        ? buildUnifiedRows(file, cells)
        : [],
    [viewMode, isFileFolded, file, cells],
  );
  const splitRows = useMemo(
    () =>
      viewMode === 'split' && !isFileFolded ? buildSplitRows(file, cells) : [],
    [viewMode, isFileFolded, file, cells],
  );

  let addedCount = 0;
  let removedCount = 0;
  let maxLineNumber = 1;
  for (const hunk of file.hunks) {
    for (const line of hunk.lines) {
      if (line.kind === 'added') {
        addedCount++;
      } else if (line.kind === 'removed') {
        removedCount++;
      }
      maxLineNumber = Math.max(
        maxLineNumber,
        line.oldLineNumber ?? 0,
        line.newLineNumber ?? 0,
      );
    }
  }
  const digits = String(maxLineNumber).length;

  // Split view's panes scroll sideways on their own, so the shared viewport
  // only scrolls vertically there.
  const {getViewportProps, getContentProps} = useScrollableArea({
    axis: viewMode === 'split' ? 'block' : 'both',
    keyboardAccess: {
      owner: 'viewport',
      role: 'group',
      label: displayPath ?? t('@astryx.diffViewer.label'),
    },
  });
  const scrollStyle: CSSProperties | undefined =
    maxHeight != null
      ? {
          maxHeight:
            typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
        }
      : undefined;

  // --- cells ---------------------------------------------------------------

  // Unwrapped, the line numbers and the change indicator are pinned at the
  // start of their scroller; these are their offsets from its edge.
  const isPinned = !isWrapped;
  const gutter = gutterWidth(digits);
  const markerWidth = MARKER_WIDTH[changeIndicator];
  const isSlimMarker = changeIndicator !== 'classic';
  const pinStyle = (offset: string) =>
    customProperty(DIFF_VIEWER_PIN_OFFSET_VAR, offset);
  const pinClassName = isPinned ? diffViewerStickyClassName : undefined;

  const tint = (kind: DiffViewerLine['kind'] | undefined) =>
    hasChangeBackground &&
    (kind === 'added'
      ? diffViewerAddedRowClassName
      : kind === 'removed' && diffViewerRemovedRowClassName);

  const cellRole = (tag: CellTag) => (tag === 'div' ? {role: 'cell'} : {});

  const renderGutter = (
    tag: CellTag,
    cell: LineCell | null,
    side: DiffViewerSide,
    key: string,
    pinOffset: string,
  ) => {
    if (!hasLineNumbers) {
      return null;
    }
    const Cell = tag;
    const number =
      cell == null
        ? null
        : side === 'old'
          ? cell.line.oldLineNumber
          : cell.line.newLineNumber;
    const kind = cell?.line.kind;
    // Only the gutter of the line's own anchor side is a button: a context
    // line anchors to its new number, so its old number stays plain text
    // rather than a second button whose label names a line it does not report.
    const actionRef =
      number != null && cell != null && cell.ref.side === side
        ? cell.ref
        : null;
    return (
      <Cell
        key={key}
        {...cellRole(tag)}
        className={tw(
          diffViewerGutterClassName,
          pinClassName,
          tint(kind),
          kind === 'added' && diffViewerGutterAddedClassName,
          kind === 'removed' && diffViewerGutterRemovedClassName,
          cell == null && diffViewerFillerClassName,
        )}
        style={isPinned ? pinStyle(pinOffset) : undefined}>
        {actionRef != null && onLineNumberClick != null ? (
          <button
            type="button"
            data-diff-line-button=""
            aria-label={t('@astryx.diffViewer.lineNumberButton', {
              side,
              line: number,
            })}
            onClick={event => onLineNumberClick(actionRef, event)}
            className={tw(
              focusOutlineFocusVisibleClassName,
              diffViewerGutterButtonClassName,
            )}>
            {number}
          </button>
        ) : (
          number
        )}
      </Cell>
    );
  };

  const renderMarker = (
    tag: CellTag,
    cell: LineCell | null,
    key: string,
    pinOffset: string,
  ) => {
    const Cell = tag;
    const kind = cell?.line.kind;
    const isChange = kind === 'added' || kind === 'removed';
    return (
      <Cell
        key={key}
        {...cellRole(tag)}
        className={tw(
          isSlimMarker
            ? diffViewerMarkerSlimClassName
            : diffViewerMarkerClassName,
          pinClassName,
          tint(kind),
          cell == null && diffViewerFillerClassName,
        )}
        style={isPinned ? pinStyle(pinOffset) : undefined}>
        {isChange && changeIndicator === 'classic' && (
          <span
            aria-hidden="true"
            className={
              kind === 'added'
                ? diffViewerMarkerAddedClassName
                : diffViewerMarkerRemovedClassName
            }>
            {kind === 'added' ? '+' : '-'}
          </span>
        )}
        {isChange && changeIndicator === 'bars' && (
          <span
            aria-hidden="true"
            data-diff-bar=""
            className={tw(
              diffViewerBarClassName,
              kind === 'added'
                ? diffViewerBarAddedClassName
                : diffViewerBarRemovedClassName,
            )}
          />
        )}
        {isChange && (
          <VisuallyHidden>
            {kind === 'added'
              ? t('@astryx.diffViewer.added')
              : t('@astryx.diffViewer.removed')}
          </VisuallyHidden>
        )}
      </Cell>
    );
  };

  const renderCode = (tag: CellTag, cell: LineCell | null, key: string) => {
    const Cell = tag;
    const kind = cell?.line.kind;
    return (
      <Cell
        key={key}
        {...cellRole(tag)}
        data-diff={kind != null && kind !== 'context' ? kind : undefined}
        className={tw(
          isWrapped ? diffViewerCodeWrappedClassName : diffViewerCodeClassName,
          diffViewerLtrClassName,
          tint(kind),
          cell == null && diffViewerFillerClassName,
        )}>
        {cell != null &&
          buildSpans(
            cell.line.content,
            cell.tokens,
            cell.emphasis,
            kind === 'added'
              ? diffViewerChangeAddedClassName
              : diffViewerChangeRemovedClassName,
          )}
      </Cell>
    );
  };

  const renderFoldControl = (
    changedLines: number,
    isExpanded: boolean,
    onToggle: () => void,
    isSticky: boolean,
  ) => (
    <span
      className={tw(
        diffViewerFoldContentClassName,
        isSticky && diffViewerHunkTextStickyClassName,
      )}>
      <span>{t('@astryx.diffViewer.largeChange', {count: changedLines})}</span>
      <Button
        size="sm"
        variant="secondary"
        label={
          isExpanded
            ? t('@astryx.diffViewer.hideFullDiff')
            : t('@astryx.diffViewer.showFullDiff')
        }
        aria-expanded={isExpanded}
        onClick={onToggle}
      />
    </span>
  );

  const renderFold = (fold: ReplacedBlockFold) =>
    renderFoldControl(
      fold.changedLines,
      fold.isExpanded,
      () => toggleBlock(fold.hunkIndex),
      isPinned,
    );

  const renderHunkText = (header: string) => (
    <span
      className={tw(
        diffViewerLtrClassName,
        isPinned && diffViewerHunkTextStickyClassName,
      )}>
      {header}
    </span>
  );

  const annotationFor = (cell: LineCell | null): ReactNode =>
    cell == null || renderLineAnnotation == null
      ? null
      : lineAnnotation(renderLineAnnotation, cell.ref);

  // Name every column so a screen reader moving across a row hears which
  // number is which (and, in split view, which side's code it is in).
  const columnHeader = (tag: 'th' | 'div', key: string, label: string) => {
    const Header = tag;
    return (
      <Header
        key={key}
        {...(tag === 'th' ? {scope: 'col'} : {role: 'columnheader'})}
        className={diffViewerColumnHeaderClassName}>
        <VisuallyHidden>{label}</VisuallyHidden>
      </Header>
    );
  };

  // --- unified table -------------------------------------------------------

  const renderUnified = () => {
    const columns = (hasLineNumbers ? 2 : 0) + 2;
    const markerPin = hasLineNumbers ? `calc(2 * ${gutter})` : '0px';
    return (
      <table
        className={tw(
          diffViewerTableClassName,
          isWrapped
            ? diffViewerTableWrappedClassName
            : diffViewerTableScrollClassName,
        )}>
        <colgroup>
          {hasLineNumbers && (
            <col
              className={diffViewerColumnWidthClassName}
              style={customProperty(DIFF_VIEWER_COLUMN_WIDTH_VAR, gutter)}
            />
          )}
          {hasLineNumbers && (
            <col
              className={diffViewerColumnWidthClassName}
              style={customProperty(DIFF_VIEWER_COLUMN_WIDTH_VAR, gutter)}
            />
          )}
          <col
            className={diffViewerColumnWidthClassName}
            style={customProperty(DIFF_VIEWER_COLUMN_WIDTH_VAR, markerWidth)}
          />
          <col />
        </colgroup>
        <thead>
          <tr>
            {hasLineNumbers &&
              columnHeader('th', 'og', t('@astryx.diffViewer.columnOldLine'))}
            {hasLineNumbers &&
              columnHeader('th', 'ng', t('@astryx.diffViewer.columnNewLine'))}
            {columnHeader('th', 'm', t('@astryx.diffViewer.columnChange'))}
            {columnHeader('th', 'c', t('@astryx.diffViewer.columnCode'))}
          </tr>
        </thead>
        <tbody>
          {unifiedRows.map(row => {
            if (row.type === 'hunk') {
              return (
                <tr key={row.key}>
                  <td colSpan={columns} className={diffViewerHunkClassName}>
                    {renderHunkText(row.header)}
                  </td>
                </tr>
              );
            }
            if (row.type === 'fold') {
              return (
                <tr key={row.key}>
                  <td colSpan={columns} className={diffViewerFoldClassName}>
                    {renderFold(row.fold)}
                  </td>
                </tr>
              );
            }
            const note = annotationFor(row.cell);
            return (
              <Fragment key={row.key}>
                <tr>
                  {renderGutter('td', row.cell, 'old', 'og', '0px')}
                  {renderGutter('td', row.cell, 'new', 'ng', gutter)}
                  {renderMarker('td', row.cell, 'm', markerPin)}
                  {renderCode('td', row.cell, 'c')}
                </tr>
                {note != null && (
                  <tr>
                    <td
                      colSpan={columns}
                      className={diffViewerAnnotationClassName}>
                      <div className={diffViewerAnnotationContentClassName}>
                        {note}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    );
  };

  // --- split panes ---------------------------------------------------------

  // Unwrapped, the two panes scroll sideways in lockstep. Setting the other
  // pane's scrollLeft fires a scroll event there too; the expected value it
  // lands on marks that event as our own echo, so it is not mirrored back
  // (which would fight momentum scrolling on the side the reader drives).
  const paneRefs = useRef<Record<DiffViewerSide, HTMLDivElement | null>>({
    old: null,
    new: null,
  });
  // Stable per side: a new callback ref every render would re-attach the
  // pane's scroll measurement each time.
  const paneRefCallbacks = useMemo(
    () => ({
      old: (node: HTMLDivElement | null) => {
        paneRefs.current.old = node;
      },
      new: (node: HTMLDivElement | null) => {
        paneRefs.current.new = node;
      },
    }),
    [],
  );
  const scrollEcho = useRef<{side: DiffViewerSide; left: number} | null>(null);
  const syncPaneScroll = (
    side: DiffViewerSide,
    event: UIEvent<HTMLDivElement>,
  ) => {
    const left = event.currentTarget.scrollLeft;
    const echo = scrollEcho.current;
    if (echo != null && echo.side === side) {
      scrollEcho.current = null;
      if (Math.abs(echo.left - left) < 1) {
        return;
      }
    }
    const otherSide = side === 'old' ? 'new' : 'old';
    const other = paneRefs.current[otherSide];
    if (other == null || Math.abs(other.scrollLeft - left) < 1) {
      return;
    }
    other.scrollLeft = left;
    scrollEcho.current = {side: otherSide, left: other.scrollLeft};
  };

  const renderSplit = () => {
    const items = splitRows.map(row =>
      row.type !== 'pair'
        ? {row, oldNote: null, newNote: null}
        : {
            row,
            // A context line anchors to its new side, so only that side
            // carries its annotation.
            oldNote:
              row.old?.line.kind === 'context' ? null : annotationFor(row.old),
            newNote: annotationFor(row.new),
          },
    );
    const hasSizer = !isWrapped;
    const sizerText = hasSizer
      ? widestLine(
          cells.flatMap(hunk => hunk.cells.map(cell => cell.line.content)),
        )
      : '';
    const rowCount =
      1 +
      (hasSizer ? 1 : 0) +
      items.reduce(
        (count, item) =>
          count + 1 + (item.oldNote != null || item.newNote != null ? 1 : 0),
        0,
      );
    const columns = `${hasLineNumbers ? `${gutter} ` : ''}${markerWidth} ${
      isWrapped ? 'minmax(0, 1fr)' : '1fr'
    }`;
    const markerPin = hasLineNumbers ? gutter : '0px';

    const renderSide = (side: DiffViewerSide) => {
      const isOld = side === 'old';
      const rows: ReactNode[] = [
        <div key="head" role="row" className={diffViewerPaneRowClassName}>
          {hasLineNumbers &&
            columnHeader(
              'div',
              'g',
              t(
                isOld
                  ? '@astryx.diffViewer.columnOldLine'
                  : '@astryx.diffViewer.columnNewLine',
              ),
            )}
          {columnHeader('div', 'm', t('@astryx.diffViewer.columnChange'))}
          {columnHeader(
            'div',
            'c',
            t(
              isOld
                ? '@astryx.diffViewer.columnOldCode'
                : '@astryx.diffViewer.columnNewCode',
            ),
          )}
        </div>,
      ];
      for (const {row, oldNote, newNote} of items) {
        if (row.type === 'hunk') {
          // The new side repeats the header for its own table's readers but
          // shows only the band.
          rows.push(
            <div
              key={row.key}
              role="row"
              className={diffViewerPaneRowClassName}>
              <div
                role="cell"
                className={tw(
                  // A side is half as wide as the unified header's row.
                  isWrapped
                    ? diffViewerHunkWrappedClassName
                    : diffViewerHunkClassName,
                  diffViewerPaneSpanClassName,
                )}>
                {isOld ? (
                  renderHunkText(row.header)
                ) : (
                  <>
                    {/* Takes the same width as the old side's header, so a
                        header wider than the code widens both panes alike
                        and they still scroll in lockstep. */}
                    <span
                      aria-hidden="true"
                      className={tw(
                        diffViewerLtrClassName,
                        diffViewerInvisibleClassName,
                      )}>
                      {row.header}
                    </span>
                    <VisuallyHidden>{row.header}</VisuallyHidden>
                  </>
                )}
              </div>
            </div>,
          );
          continue;
        }
        if (row.type === 'fold') {
          // Only the old side holds the control; the new side keeps its row
          // as tall and gives its own table's readers the label.
          rows.push(
            <div
              key={row.key}
              role="row"
              className={diffViewerPaneRowClassName}>
              <div
                role="cell"
                className={tw(
                  isWrapped
                    ? diffViewerFoldWrappedClassName
                    : diffViewerFoldClassName,
                  diffViewerPaneSpanClassName,
                )}>
                {isOld ? (
                  renderFold(row.fold)
                ) : (
                  <>
                    <span
                      aria-hidden="true"
                      className={diffViewerInvisibleClassName}>
                      {renderFold(row.fold)}
                    </span>
                    <VisuallyHidden>
                      {t('@astryx.diffViewer.largeChange', {
                        count: row.fold.changedLines,
                      })}
                    </VisuallyHidden>
                  </>
                )}
              </div>
            </div>,
          );
          continue;
        }
        const cell = isOld ? row.old : row.new;
        rows.push(
          <div
            key={row.key}
            role="row"
            // The empty half of an unpaired change is spacing, not a line.
            aria-hidden={cell == null ? true : undefined}
            className={diffViewerPaneRowClassName}>
            {renderGutter('div', cell, side, 'g', '0px')}
            {renderMarker('div', cell, 'm', markerPin)}
            {renderCode('div', cell, 'c')}
          </div>,
        );
        if (oldNote != null || newNote != null) {
          const note = isOld ? oldNote : newNote;
          rows.push(
            <div
              key={`${row.key}n`}
              role="row"
              aria-hidden={note == null ? true : undefined}
              className={diffViewerPaneRowClassName}>
              <div
                role="cell"
                className={tw(
                  diffViewerAnnotationClassName,
                  diffViewerPaneSpanClassName,
                )}>
                {note != null && (
                  <div className={diffViewerAnnotationContentClassName}>
                    {note}
                  </div>
                )}
              </div>
            </div>,
          );
        }
      }
      if (hasSizer) {
        rows.push(
          <div
            key="sizer"
            data-diff-sizer=""
            aria-hidden="true"
            className={diffViewerPaneRowClassName}>
            <div
              className={tw(
                diffViewerCodeClassName,
                diffViewerLtrClassName,
                diffViewerSizerClassName,
              )}>
              {sizerText}
            </div>
          </div>,
        );
      }
      return (
        <DiffViewerPane
          key={side}
          side={side}
          label={t(
            isOld
              ? '@astryx.diffViewer.columnOldCode'
              : '@astryx.diffViewer.columnNewCode',
          )}
          columns={columns}
          isWrapped={isWrapped}
          viewportRef={paneRefCallbacks[side]}
          onScroll={
            hasSizer ? event => syncPaneScroll(side, event) : undefined
          }>
          {rows}
        </DiffViewerPane>
      );
    };

    return (
      <div
        data-diff-split=""
        className={diffViewerSplitClassName}
        style={customProperty(
          DIFF_VIEWER_SPLIT_ROWS_VAR,
          `repeat(${rowCount}, auto)`,
        )}>
        {renderSide('old')}
        {renderSide('new')}
      </div>
    );
  };

  let body: ReactNode;
  if (file.isBinary) {
    body = (
      <div className={diffViewerMessageClassName}>
        {t('@astryx.diffViewer.binary')}
      </div>
    );
  } else if (file.hunks.length === 0) {
    body = (
      <div className={diffViewerMessageClassName}>
        {t('@astryx.diffViewer.noChanges')}
      </div>
    );
  } else {
    // The fold row stays first whether the file is folded or not, so its
    // button keeps focus when it toggles.
    body = (
      <>
        {isLargeFile && (
          <div data-diff-fold="" className={diffViewerFoldClassName}>
            {renderFoldControl(
              unfoldedChangedLines,
              !isFileFolded,
              toggleFile,
              false,
            )}
          </div>
        )}
        {!isFileFolded && (
          <div
            {...withoutInlineOverscroll(
              getViewportProps<HTMLDivElement>({
                className: diffViewerViewportClassName,
                style: scrollStyle,
              }),
            )}>
            <div {...getContentProps<HTMLDivElement>({})}>
              {viewMode === 'split' ? renderSplit() : renderUnified()}
            </div>
          </div>
        )}
      </>
    );
  }

  // --- header --------------------------------------------------------------

  const statusColor = STATUS_COLORS[file.status];
  const statusLabel =
    file.status === 'added'
      ? t('@astryx.diffViewer.statusAdded')
      : file.status === 'deleted'
        ? t('@astryx.diffViewer.statusDeleted')
        : file.status === 'renamed'
          ? t('@astryx.diffViewer.statusRenamed')
          : null;

  const pathEl = (
    <span
      {...mergeProps(themeProps('diff-viewer-path'), {
        className: tw(diffViewerPathClassName, diffViewerLtrClassName),
      })}>
      {displayPath}
    </span>
  );

  const header =
    displayPath != null || headerEnd != null ? (
      <div
        {...mergeProps(themeProps('diff-viewer-header'), {
          className: tw(
            diffViewerHeaderClassName,
            !isCollapsed && diffViewerHeaderDividerClassName,
          ),
        })}>
        {canCollapse ? (
          <button
            type="button"
            aria-expanded={!isCollapsed}
            aria-controls={bodyId}
            onClick={toggleCollapsed}
            className={tw(
              focusOutlineFocusVisibleClassName,
              diffViewerToggleClassName,
            )}>
            <span
              className={tw(
                diffViewerChevronClassName,
                !isCollapsed && diffViewerChevronExpandedClassName,
              )}>
              <span
                className={isCollapsed ? diffViewerMirrorClassName : undefined}>
                <Icon icon="chevronRight" size="xsm" color="inherit" />
              </span>
            </span>
            {pathEl}
          </button>
        ) : (
          pathEl
        )}
        {statusColor != null && statusLabel != null && (
          <Token size="sm" color={statusColor} label={statusLabel} />
        )}
        {(addedCount > 0 || removedCount > 0) && (
          <span
            className={tw(diffViewerStatsClassName, diffViewerLtrClassName)}>
            <span aria-hidden="true" className={diffViewerStatAddedClassName}>
              {t('@astryx.diffViewer.addedCount', {count: addedCount})}
            </span>
            <span aria-hidden="true" className={diffViewerStatRemovedClassName}>
              {t('@astryx.diffViewer.removedCount', {count: removedCount})}
            </span>
            <VisuallyHidden>
              {t('@astryx.diffViewer.stats', {
                added: addedCount,
                removed: removedCount,
              })}
            </VisuallyHidden>
          </span>
        )}
        {headerEnd != null && (
          <div className={diffViewerHeaderEndClassName}>{headerEnd}</div>
        )}
      </div>
    ) : null;

  const root = (
    <div
      ref={ref}
      {...mergeProps(
        themeProps('diff-viewer', {viewMode}),
        stylex.props(xstyle),
        tw(diffViewerRootClassName, className),
        style,
      )}
      {...props}>
      {header}
      <div id={bodyId} hidden={isCollapsed}>
        {isCollapsed ? null : body}
      </div>
    </div>
  );

  return syntaxTheme ? (
    <SyntaxTheme theme={syntaxTheme}>{root}</SyntaxTheme>
  ) : (
    root
  );
}

DiffViewer.displayName = 'DiffViewer';
