// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';
/**
 * @file CodeBlock.tsx
 * @input Uses React, StyleX, the CSS Custom Highlight API, SyntaxTheme
 *   provider, and the theme's `code-block-copy` icon slot
 * @output Exports CodeBlock component and CodeBlockProps
 * @position Core implementation; read-only syntax-highlighted code display
 */

import {
  useInsertionEffect,
  useEffect,
  useId,
  useRef,
  useState,
  useCallback,
  useMemo,
  type CSSProperties,
} from 'react';
import * as React from 'react';
import type {BaseProps} from '../BaseProps';
import * as stylex from '@stylexjs/stylex';
import {isRenderable, mergeProps, RTL_MIRROR_CLASS} from '../utils';
import {tw} from '../utils/tw';
import {
  codeBlockChevronClassName,
  codeBlockChevronExpandedClassName,
  codeBlockChevronIconClassName,
  codeBlockCodeClassName,
  codeBlockCodeNumberedClassName,
  codeBlockCodeWrapperClassName,
  codeBlockCodeWrapperCompactClassName,
  codeBlockCollapseGridClassName,
  codeBlockCollapseGridCollapsedClassName,
  codeBlockCollapseInnerClassName,
  codeBlockContainerClassName,
  codeBlockCopyButtonClassName,
  codeBlockCornerClusterClassName,
  codeBlockCornerClusterHeightClassName,
  codeBlockDiffMarkerClassName,
  codeBlockHeaderClassName,
  codeBlockHeaderCollapsibleClassName,
  codeBlockHeaderControlsClassName,
  codeBlockHeaderRowClassName,
  codeBlockHeaderTitleClassName,
  codeBlockLineChunkClassName,
  codeBlockLineClassName,
  codeBlockLineContentClassName,
  codeBlockLineTintClassName,
  codeBlockRootClassName,
  codeBlockRootCornerClassName,
  codeBlockRootFitWidthClassName,
  codeBlockRootWidthClassName,
  codeBlockSizeClassName,
  codeBlockViewportClassName,
} from './codeBlockClasses';
import {codeBlockViewportFocusRingStyles} from './codeBlockViewportFocusRing.stylex';
import {useClipboardCopy} from '../hooks/useClipboard';
import {useScrollableArea} from '../hooks/useScrollableArea';
import {Icon} from '../Icon';
import {ComponentIcon} from '../Icon/ComponentIcon';
import {IconButton} from '../IconButton';
import type {DiffLineKind} from './tokenizer';
import {
  tokenize,
  tokenizeAsync,
  splitDiffLines,
  flatTokensToLines,
  SYNC_TOKENIZE_THRESHOLD,
} from './tokenizer';
import type {CodeLanguageInput, SyntaxToken, TokenLine} from './tokenizer';
import type {CodeLanguage} from './grammar';
import {
  isCustomCodeLanguage,
  languageKey,
  languageLabel as languageWord,
  sameCodeLanguage,
} from './grammar';
import {ensureHighlightStyles} from './highlightStyles';
import {applyHighlightRangesChunked} from './highlightRanges';
import {themeProps} from '../utils/themeProps';
import {focusOutlineProps} from '../utils/focusOutline.stylex';
import {SyntaxTheme, type SyntaxThemeDefinition} from '../theme/syntax';
import {
  registerEnglishFallback,
  useComponentTranslator,
} from '../i18n/useComponentTranslator';
import english from '../i18n/generated-english/CodeBlock/CodeBlock.generated';

registerEnglishFallback(english);

// ---------------------------------------------------------------------------
// Line rendering
// ---------------------------------------------------------------------------

const LINE_CHUNK_SIZE = 20;
const LINE_CHUNK_THRESHOLD = 100;

/**
 * Memoized chunk component — cheaper than memoizing every individual line.
 */
const CodeChunk = React.memo(function CodeChunk({
  lines,
  startIndex,
  startLineNumber,
  highlightSet,
  diffKinds,
  renderLineContent,
  lineNumbers,
}: {
  lines: string[];
  startIndex: number;
  startLineNumber: number;
  highlightSet: Set<number> | null;
  diffKinds: ReadonlyArray<DiffLineKind> | null;
  renderLineContent: (line: string, lineIndex: number) => React.ReactNode;
  lineNumbers: boolean;
}) {
  return (
    <>
      {lines.map((line, j) => {
        const i = startIndex + j;
        const lineNumber = startLineNumber + i;
        const diffKind = diffKinds?.[i];
        const isHighlighted = highlightSet?.has(lineNumber) ?? false;
        return (
          <div
            key={i}
            data-line={lineNumber}
            data-diff={diffKind === 'context' ? undefined : diffKind}
            className={tw(
              codeBlockLineClassName({
                hasLineNumbers: lineNumbers,
                hasDiff: diffKinds != null,
              }),
              codeBlockLineTintClassName({diffKind, isHighlighted}),
            )}>
            {renderLineContent(line, i)}
          </div>
        );
      })}
    </>
  );
});

function renderLines(
  lines: string[],
  highlightSet: Set<number> | null,
  diffKinds: ReadonlyArray<DiffLineKind> | null,
  renderLineContent: (line: string, lineIndex: number) => React.ReactNode,
  lineNumbers: boolean,
  startLineNumber: number,
  chunkSize: number = LINE_CHUNK_SIZE,
): React.ReactNode {
  chunkSize = Math.max(1, Math.floor(chunkSize));

  if (lines.length < LINE_CHUNK_THRESHOLD) {
    return (
      <CodeChunk
        lines={lines}
        startIndex={0}
        startLineNumber={startLineNumber}
        highlightSet={highlightSet}
        diffKinds={diffKinds}
        renderLineContent={renderLineContent}
        lineNumbers={lineNumbers}
      />
    );
  }

  const chunks: React.ReactNode[] = [];
  for (let start = 0; start < lines.length; start += chunkSize) {
    const end = Math.min(start + chunkSize, lines.length);
    const chunkLines = lines.slice(start, end);
    const estimatedHeight = `${chunkLines.length}lh`;

    chunks.push(
      <div
        key={start}
        className={codeBlockLineChunkClassName}
        style={{['--_codeblock-chunk-height' as string]: estimatedHeight}}>
        <CodeChunk
          lines={chunkLines}
          startIndex={start}
          startLineNumber={startLineNumber}
          highlightSet={highlightSet}
          diffKinds={diffKinds}
          renderLineContent={renderLineContent}
          lineNumbers={lineNumbers}
        />
      </div>,
    );
  }
  return chunks;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CodeBlockProps extends BaseProps<HTMLPreElement> {
  ref?: React.Ref<HTMLPreElement>;
  code: string;
  /**
   * The code's language: a built-in identifier such as `'rust'`, or a
   * language value — a module imported on its own, such as `graphql` from
   * `@astryxdesign/core/CodeBlock/languages/graphql`, or one made with
   * `createCodeLanguage`. A string selects only a built-in grammar; the label
   * shows the string, or the value's `name`.
   * @default 'plaintext'
   */
  language?: string | CodeLanguage;
  title?: string;
  hasLanguageLabel?: boolean;
  hasLineNumbers?: boolean;
  /**
   * First line's number in the source file. The gutter shows file
   * coordinates (`startLineNumber + index`) instead of starting at 1, so a
   * code excerpt reads with its real line numbers. `highlightLines` uses the
   * same file coordinates. Values below 1 clamp to 1.
   * @default 1
   */
  startLineNumber?: number;
  /** 1-indexed line numbers to highlight, in the same file coordinates as the gutter (see `startLineNumber`). Out-of-range entries render no highlight. */
  highlightLines?: number[];
  /**
   * Render the code as a unified diff over `language`: lines starting with
   * `+` are added, `-` removed, `@@` is a hunk header (a `--- `/`+++ ` pair
   * directly before one is a file header), anything else is context; the
   * label reads `diff` or `<language> diff`. The glyph sits in its own column and the rest of every line
   * keeps the language's syntax highlighting. Copy still returns the exact
   * source, glyphs included.
   */
  isDiff?: boolean;
  hasCopyButton?: boolean;
  onCopy?: () => void;
  /**
   * Called once with the rejection when the clipboard write fails. The copy
   * control then shows a cross and is named and announced as the localized
   * "Failed to copy value to clipboard."; the error itself is not shown.
   */
  onCopyError?: (error: unknown) => void;
  /**
   * Your own controls, shown just before Copy: in the header when the block
   * has one, otherwise beside the code in the top inline-end corner, never
   * over it. It never creates a header, and activating it never collapses the
   * block. You own each control's label, state, and action; ghost `sm`
   * IconButtons match Copy's size and variant.
   */
  endContent?: React.ReactNode;
  isWrapped?: boolean;
  maxHeight?: number | string;
  isCollapsible?: boolean;
  collapsibleThreshold?: number;
  size?: 'sm' | 'md';
  /**
   * Width of the code block. Accepts any CSS width value.
   * - `'fit-content'` (default): shrinks to the width of the longest line (with a min-width floor).
   * - `'100%'`: stretches to fill the parent container width.
   * - Any valid CSS width string (e.g. `'600px'`, `'50vw'`).
   * @default 'fit-content'
   */
  width?: string;
  /**
   * Container presentation style.
   * - `'card'` (default): border-radius and border with the muted syntax
   *   background — standalone card look.
   * - `'section'`: no border-radius, no border, and a transparent background
   *   so the block blends into the card or panel it's embedded in. Set an
   *   explicit background via `xstyle` if you need one.
   * @default 'card'
   */
  container?: 'card' | 'section';
  /**
   * @deprecated Pass a custom language as `language` instead:
   * `language={createCodeLanguage({name, identifiers, tokenize})}` takes this
   * same function as `tokenize`. Still works exactly as released and wins
   * over `language`'s grammar; `astryx upgrade` rewrites static uses.
   */
  tokenizer?: (
    code: string,
    language: string,
  ) => {type: string; start: number; end: number}[];
  highlightMode?: 'auto' | 'ranges' | 'spans';
  /**
   * Per-instance syntax theme override. Shorthand for wrapping this block in
   * `<SyntaxTheme theme={...}>` — accepts a preset from
   * `@astryxdesign/core/theme/syntax` or a theme created with
   * `defineSyntaxTheme()`. Without it, the block uses the theme-level syntax
   * colors from the nearest SyntaxTheme ancestor or `defineTheme({ syntax })`.
   */
  syntaxTheme?: SyntaxThemeDefinition;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hasHighlightAPI(): boolean {
  return (
    typeof CSS !== 'undefined' &&
    'highlights' in CSS &&
    typeof Highlight !== 'undefined'
  );
}

/**
 * Safari supports the Highlight API JS objects but has rendering issues
 * with ::highlight() in code blocks. Detect Safari (WebKit without Chrome)
 * so we can fall back to spans.
 */
function isSafari(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  const ua = navigator.userAgent;
  return ua.includes('AppleWebKit') && !ua.includes('Chrome');
}

/**
 * Hook: per-line tokens with sync/async + custom tokenizer compat.
 */
function useTokenLines(
  code: string,
  languageProp: CodeLanguageInput,
  customTokenizer?: CodeBlockProps['tokenizer'],
): TokenLine[] {
  // Keep one language while it paints the same, so an inline
  // `createCodeLanguage({...})` — the form the `tokenizer` codemod writes —
  // tokenizes once, as `tokenizer` did (adjusting state during render).
  const [language, setLanguage] = useState(languageProp);
  if (!sameCodeLanguage(language, languageProp)) {
    setLanguage(languageProp);
  }
  const [asyncTokenResult, setAsyncTokenResult] = useState<{
    code: string;
    language: CodeLanguageInput;
    tokens: TokenLine[];
  } | null>(null);

  const syncTokens = useMemo(() => {
    if (customTokenizer) {
      return flatTokensToLines(
        customTokenizer(code, languageWord(language)),
        code,
      );
    }
    // A custom language paints synchronously at any length, as `tokenizer`
    // does, so the codemod's rewrite keeps the same first paint (FR13).
    if (
      code.length >= SYNC_TOKENIZE_THRESHOLD &&
      !isCustomCodeLanguage(language)
    ) {
      return null;
    }
    return tokenize(code, language);
  }, [code, language, customTokenizer]);

  // Synchronizes long code with a scheduler-yielding tokenize task: it starts
  // when the code, language, or tokenizer changes, and the
  // cleanup aborts the previous one.
  useEffect(() => {
    if (
      code.length < SYNC_TOKENIZE_THRESHOLD ||
      customTokenizer ||
      isCustomCodeLanguage(language)
    ) {
      return;
    }

    const abortController = new AbortController();

    async function tokenizeLargeCode() {
      try {
        const tokens = await tokenizeAsync(
          code,
          language,
          abortController.signal,
        );
        if (!abortController.signal.aborted) {
          setAsyncTokenResult({code, language, tokens});
        }
      } catch {
        if (!abortController.signal.aborted) {
          setAsyncTokenResult({code, language, tokens: []});
        }
      }
    }

    void tokenizeLargeCode();

    return () => {
      abortController.abort();
    };
  }, [code, language, customTokenizer]);

  if (syncTokens != null) {
    return syncTokens;
  }

  if (
    asyncTokenResult?.code === code &&
    asyncTokenResult.language === language
  ) {
    return asyncTokenResult.tokens;
  }

  return [];
}

// ---------------------------------------------------------------------------
// Span-mode code element
// ---------------------------------------------------------------------------

function buildSpanLine(
  lineText: string,
  tokens: SyntaxToken[],
): React.ReactNode {
  if (tokens.length === 0) {
    return lineText || '\u200b';
  }

  const parts: React.ReactNode[] = [];
  let cursor = 0;

  for (const token of tokens) {
    if (token.start > cursor) {
      parts.push(lineText.slice(cursor, token.start));
    }
    const end = Math.min(token.end, lineText.length);
    parts.push(
      <span
        key={`${token.start}-${token.type}`}
        className={`astryx-token-${token.type} xds-token-${token.type}`}>
        {lineText.slice(token.start, end)}
      </span>,
    );
    cursor = end;
  }

  if (cursor < lineText.length) {
    parts.push(lineText.slice(cursor));
  }
  return parts.length > 0 ? parts : '\u200b';
}

function SpanCodeContent({
  lines,
  tokenLines,
  highlightSet,
  diffKinds,
  diff,
  isWrapped,
  sizeClassName,
  hasLineNumbers,
  maxDigits,
  startLineNumber,
}: {
  lines: string[];
  tokenLines: TokenLine[];
  highlightSet: Set<number> | null;
  diffKinds: ReadonlyArray<DiffLineKind> | null;
  diff: ReturnType<typeof splitDiffLines> | null;
  isWrapped: boolean;
  sizeClassName: string;
  hasLineNumbers: boolean;
  maxDigits: number;
  startLineNumber: number;
}) {
  // Syncs the document's ::highlight() stylesheet. The rules go in one time,
  // before layout reads.
  useInsertionEffect(() => {
    ensureHighlightStyles();
  }, []);

  const renderLineContent = useCallback(
    (line: string, lineIndex: number): React.ReactNode => {
      const tokens = tokenLines[lineIndex] ?? [];
      if (diff) {
        // Header rows show their raw text; every other row shows its glyph in
        // the marker column and the base-language tokens of the rest.
        const kind = diff.kinds[lineIndex];
        const content = kind === 'header' ? line : diff.content[lineIndex];
        return (
          <>
            <span
              data-diff-marker=""
              className={codeBlockDiffMarkerClassName({
                hasLineNumbers,
                diffKind: kind,
              })}>
              {diff.glyphs[lineIndex] || ' '}
            </span>
            <span className={codeBlockLineContentClassName}>
              {kind === 'header'
                ? content || '\u200b'
                : buildSpanLine(content, tokens)}
            </span>
          </>
        );
      }
      // Wrap tokens in a single element so they occupy one grid cell when line
      // numbers are on (see `lineNumbered`); an inline span is a no-op when off.
      return (
        <span className={codeBlockLineContentClassName}>
          {buildSpanLine(line, tokens)}
        </span>
      );
    },
    [tokenLines, diff, hasLineNumbers],
  );

  return (
    <code
      className={tw(
        codeBlockCodeClassName(isWrapped),
        sizeClassName,
        hasLineNumbers && codeBlockCodeNumberedClassName,
      )}
      style={
        hasLineNumbers
          ? {['--_codeblock-gutter-width' as string]: `${maxDigits}ch`}
          : undefined
      }>
      {renderLines(
        lines,
        highlightSet,
        diffKinds,
        renderLineContent,
        hasLineNumbers,
        startLineNumber,
      )}
    </code>
  );
}

// ---------------------------------------------------------------------------
// Range-mode code element
// ---------------------------------------------------------------------------

function RangeCodeContent({
  lines,
  tokenLines,
  highlightSet,
  diffKinds,
  isWrapped,
  sizeClassName,
  hasLineNumbers,
  maxDigits,
  startLineNumber,
}: {
  lines: string[];
  tokenLines: TokenLine[];
  highlightSet: Set<number> | null;
  diffKinds: ReadonlyArray<DiffLineKind> | null;
  isWrapped: boolean;
  sizeClassName: string;
  hasLineNumbers: boolean;
  maxDigits: number;
  startLineNumber: number;
}) {
  const codeRef = useRef<HTMLElement>(null);

  // Insert the ::highlight() rules before the commit's layout reads, as the
  // span path does. Inserted later, the new rules restyle the whole document
  // a second time after any layout read in the same commit has already
  // styled it, which on a long page full of code blocks costs a full style
  // recalculation.
  useInsertionEffect(() => {
    if (hasHighlightAPI()) {
      ensureHighlightStyles();
    }
  }, []);

  // Syncs the CSS.highlights registry with the token ranges. It applies them in
  // chunks.
  useEffect(() => {
    if (!hasHighlightAPI()) {
      return;
    }

    const codeEl = codeRef.current;
    if (!codeEl || tokenLines.length === 0) {
      return;
    }

    return applyHighlightRangesChunked(codeEl, tokenLines);
  }, [tokenLines]);

  // Range mode keeps the line's text as a bare text node (its firstChild) so
  // applyHighlightRangesChunked can map token offsets onto it \u2014 no wrapper. The
  // number ::before is a pseudo-element, so it never becomes a child node here.
  const renderLineContent = useCallback(
    (line: string): React.ReactNode => line || '\u200b',
    [],
  );

  return (
    <code
      ref={codeRef}
      className={tw(
        codeBlockCodeClassName(isWrapped),
        sizeClassName,
        hasLineNumbers && codeBlockCodeNumberedClassName,
      )}
      style={
        hasLineNumbers
          ? {['--_codeblock-gutter-width' as string]: `${maxDigits}ch`}
          : undefined
      }>
      {renderLines(
        lines,
        highlightSet,
        diffKinds,
        renderLineContent,
        hasLineNumbers,
        startLineNumber,
      )}
    </code>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * Read-only code display with syntax highlighting, line numbers,
 * and optional copy button.
 *
 * @example
 * ```
 * <CodeBlock code="const x = 42;" language="javascript" />
 * ```
 */
export function CodeBlock({
  code,
  language = 'plaintext',
  title,
  hasLanguageLabel = true,
  hasLineNumbers = false,
  startLineNumber = 1,
  highlightLines,
  isDiff = false,
  hasCopyButton = true,
  onCopy,
  onCopyError,
  endContent,
  isWrapped = false,
  maxHeight,
  isCollapsible = false,
  collapsibleThreshold = 10,
  size = 'md',
  width: widthProp = 'fit-content',
  container = 'card',
  tokenizer: customTokenizer,
  highlightMode = 'auto',
  syntaxTheme,
  xstyle,
  className,
  style,
  ref,
  ...props
}: CodeBlockProps) {
  const t = useComponentTranslator();
  // Owns the clipboard write, the transient copied flag, its reset timer, and
  // the polite copy announcement (a swapped aria-label alone is not reliably
  // announced) — shared with Timestamp via the same hook.
  // A failed write shows a cross for as long as a copy shows the check, and
  // is named and announced as the localized failure (Owner decision, Nov 6
  // 2026). The error itself goes only to `onCopyError`.
  const {
    copy,
    isCopied: copied,
    isFailed: copyFailed,
  } = useClipboardCopy({
    announce: t('@astryx.codeBlock.copied'),
    announceFailure: t('@astryx.codeBlock.copyFailed'),
    onError: onCopyError,
  });

  const useSpans =
    isDiff ||
    highlightMode === 'spans' ||
    (highlightMode === 'auto' && !hasHighlightAPI()) ||
    (highlightMode === 'auto' && isSafari());

  const lines = useMemo(() => {
    const l = code.split('\n');
    if (l.length > 1 && l[l.length - 1] === '') {
      l.pop();
    }
    return l;
  }, [code]);

  // In diff mode the base language sees the code with the glyph column set
  // aside, so a `tsx` diff still highlights as `tsx` on every line; headers
  // contribute an empty line and are rendered as their raw text.
  const diff = useMemo(
    () => (isDiff ? splitDiffLines(lines) : null),
    [isDiff, lines],
  );
  const tokenLines = useTokenLines(
    diff ? diff.content.join('\n') : code,
    language,
    customTokenizer,
  );
  const diffKinds = diff?.kinds ?? null;
  // File coordinates for the gutter and highlights. Values below 1 clamp to
  // 1 so the gutter never shows a 0 or negative line number.
  const effectiveStartLineNumber =
    Number.isFinite(startLineNumber) && startLineNumber > 1
      ? Math.floor(startLineNumber)
      : 1;
  const highlightSet = useMemo(
    () => (highlightLines ? new Set(highlightLines) : null),
    [highlightLines],
  );

  const handleCopy = useCallback(async () => {
    const didCopy = await copy(code);
    if (didCopy) {
      onCopy?.();
    }
  }, [code, copy, onCopy]);

  const sizeClassName = codeBlockSizeClassName(size);
  // Digits in the largest visible line number — sizes the gutter column width.
  const maxLineDigits = String(
    effectiveStartLineNumber + lines.length - 1,
  ).length;
  // With the diff layer on, the label and viewport name say so: `diff` over
  // plaintext, `tsx diff` over a language — so a diff keeps its header,
  // collapse control, and a name that still matches a `diff` fence.
  // A language value labels with its `name` and reflects its first
  // identifier as `data-language`, so theme selectors keep matching (FR13).
  const languageName = languageWord(language);
  const languageAttr = languageKey(language);
  const languageLabel = !hasLanguageLabel
    ? null
    : isDiff
      ? languageName === 'plaintext'
        ? 'diff'
        : `${languageName} diff`
      : languageName !== 'plaintext'
        ? languageName
        : null;
  const showHeader = title != null || languageLabel != null;

  // A collapsed body must never outlive the visible header that controls it.
  const canCollapse =
    showHeader && isCollapsible && lines.length >= collapsibleThreshold;
  const collapseControl = useMemo(
    () => (canCollapse ? {} : null),
    [canCollapse],
  );
  const [collapsedControl, setCollapsedControl] = useState<object | null>(null);
  const isCollapsed =
    collapseControl != null && collapsedControl === collapseControl;
  const toggleCollapsed = useCallback(() => {
    setCollapsedControl(current =>
      current === collapseControl ? null : collapseControl,
    );
  }, [collapseControl]);
  // Links the collapsible header to the code region it shows/hides so assistive
  // tech can move from the button to its controlled content (disclosure
  // pattern). The region stays mounted when collapsed (CSS grid animation), so
  // this is always a resolvable reference — aria-controls can be unconditional.
  const regionId = useId();

  // The code viewport enters the Tab order only while its content actually
  // overflows (AST-025 FR12–FR13): the shared scroll capability measures
  // both axes, keeps focus where it is when overflow goes away, and owns the
  // overflow declarations. role="group" (not "region") so several code
  // blocks on a page don't create duplicate same-named landmarks.
  const {getViewportProps, getContentProps} = useScrollableArea({
    axis: 'both',
    // Nothing inside the code viewport sticks to an outer scroller, so the
    // viewport stays a scroll container while its code fits. A long line, or
    // code past `maxHeight`, then scrolls from the first paint: before script
    // measures it, and in a page that never runs script, such as a rendered
    // file. The Tab stop still follows measured overflow.
    stickyContainment: 'always',
    keyboardAccess: {
      owner: 'viewport',
      role: 'group',
      label: languageLabel ?? t('@astryx.codeBlock.code'),
    },
  });
  const scrollStyle: CSSProperties | undefined =
    maxHeight != null
      ? {
          maxHeight:
            typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
        }
      : undefined;

  // Caller controls render before Copy; together they are the block's controls,
  // in the header when there is one and in the corner cluster otherwise.
  const hasEndContent = isRenderable(endContent);
  const hasControls = hasCopyButton || hasEndContent;
  const copyButtonEl = hasCopyButton ? (
    <IconButton
      variant="ghost"
      size="sm"
      icon={
        <ComponentIcon
          slot="code-block-copy"
          state={{copied: copied && !copyFailed}}
          fallback={{
            icon: copyFailed ? 'close' : copied ? 'check' : 'copy',
            size: 'sm',
          }}
          color="inherit"
        />
      }
      // A visible "Copy" hover/focus hint via Button's built-in tooltip. It
      // stays "Copy" after copying — the copy → check icon flip is the
      // confirmation — and says the failure while a failed copy shows. The
      // aria-label swaps to the localized "Copied" or failure text, backed by
      // the announcement.
      tooltip={
        copyFailed
          ? t('@astryx.codeBlock.copyFailed')
          : t('@astryx.codeBlock.copyCode')
      }
      label={
        copyFailed
          ? t('@astryx.codeBlock.copyFailed')
          : copied
            ? t('@astryx.codeBlock.copied')
            : t('@astryx.codeBlock.copyCode')
      }
      onClick={e => {
        // Stop propagation so copying does not toggle the collapsible header.
        e.stopPropagation();
        void handleCopy();
      }}
      {...mergeProps(themeProps('code-block-copy-button'), {
        className: codeBlockCopyButtonClassName,
      })}
    />
  ) : null;

  const headerEl = showHeader ? (
    <div
      {...mergeProps(
        themeProps('code-block-header', {
          size,
          language: languageAttr,
          container,
        }),
        {
          className: codeBlockHeaderRowClassName(hasLineNumbers),
        },
      )}>
      <div
        role={canCollapse ? 'button' : undefined}
        tabIndex={canCollapse ? 0 : undefined}
        aria-expanded={canCollapse ? !isCollapsed : undefined}
        aria-controls={canCollapse ? regionId : undefined}
        aria-label={
          canCollapse && !title?.trim() && !languageLabel
            ? t('@astryx.codeBlock.code')
            : undefined
        }
        onClick={canCollapse ? toggleCollapsed : undefined}
        onKeyDown={
          canCollapse
            ? (e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleCollapsed();
                }
              }
            : undefined
        }
        {...mergeProps(
          focusOutlineProps.focusVisible(),
          tw(
            codeBlockHeaderClassName,
            canCollapse && codeBlockHeaderCollapsibleClassName,
          ),
        )}>
        <span
          {...mergeProps(
            themeProps('code-block-title', {size, language: languageAttr}),
            {className: codeBlockHeaderTitleClassName},
          )}>
          {canCollapse && (
            // The collapsed chevron points toward the inline end, so it mirrors
            // in RTL (design:bidirectionality DR4). The mirror sits on this box
            // so the glyph's own rotation still eases: rotated down when
            // expanded, a mirrored glyph still points down.
            <span className={tw(codeBlockChevronClassName, RTL_MIRROR_CLASS)}>
              <Icon
                icon="chevronRight"
                size="xsm"
                color="inherit"
                className={tw(
                  codeBlockChevronIconClassName,
                  !isCollapsed && codeBlockChevronExpandedClassName,
                )}
              />
            </span>
          )}
          {title}
          {title && languageLabel ? ' — ' : ''}
          {languageLabel}
        </span>
      </div>
      {hasControls ? (
        <div className={codeBlockHeaderControlsClassName}>
          {hasEndContent ? endContent : null}
          {copyButtonEl}
        </div>
      ) : null}
    </div>
  ) : null;

  const codeBody = (
    <div
      {...getViewportProps<HTMLDivElement>({
        // A tab stop while the code overflows: the shared ring, which a theme
        // restyles through the focus-outline tokens.
        className: tw(
          codeBlockViewportClassName,
          focusOutlineProps.focusVisible(
            codeBlockViewportFocusRingStyles.viewportFocusRingInset,
          ).className,
        ),
        style: scrollStyle,
      })}>
      <div
        {...getContentProps<HTMLDivElement>({
          className: tw(
            codeBlockCodeWrapperClassName,
            showHeader &&
              !hasLineNumbers &&
              codeBlockCodeWrapperCompactClassName,
          ),
        })}>
        {useSpans ? (
          <SpanCodeContent
            lines={lines}
            tokenLines={tokenLines}
            highlightSet={highlightSet}
            diffKinds={diffKinds}
            diff={diff}
            isWrapped={isWrapped}
            sizeClassName={sizeClassName}
            hasLineNumbers={hasLineNumbers}
            maxDigits={maxLineDigits}
            startLineNumber={effectiveStartLineNumber}
          />
        ) : (
          <RangeCodeContent
            lines={lines}
            tokenLines={tokenLines}
            highlightSet={highlightSet}
            diffKinds={diffKinds}
            isWrapped={isWrapped}
            sizeClassName={sizeClassName}
            hasLineNumbers={hasLineNumbers}
            maxDigits={maxLineDigits}
            startLineNumber={effectiveStartLineNumber}
          />
        )}
      </div>
    </div>
  );

  const block = (
    <pre
      ref={ref}
      {...mergeProps(
        mergeProps(
          themeProps('code-block', {size, language: languageAttr, container}),
          {
            className: tw(
              codeBlockRootClassName,
              hasControls && !showHeader && codeBlockRootCornerClassName,
              codeBlockRootWidthClassName,
              widthProp === 'fit-content' && codeBlockRootFitWidthClassName,
              codeBlockContainerClassName[container],
            ),
            style: {['--_codeblock-width' as string]: widthProp},
          },
        ),
        stylex.props(xstyle),
        className,
        style,
      )}
      {...props}>
      {headerEl}
      {canCollapse ? (
        <div
          id={regionId}
          // While collapsed, the region is only hidden visually (0fr grid
          // row); inert also removes it from the tab order and accessibility
          // tree so keyboard users cannot Tab into the invisible scroll
          // container (a tab stop while it overflows). aria-controls pointing at an inert
          // element remains a valid, resolvable reference.
          inert={isCollapsed ? true : undefined}
          className={tw(
            codeBlockCollapseGridClassName,
            isCollapsed && codeBlockCollapseGridCollapsedClassName,
          )}>
          <div className={codeBlockCollapseInnerClassName}>{codeBody}</div>
        </div>
      ) : (
        codeBody
      )}
      {hasControls && !showHeader ? (
        <div
          className={tw(
            codeBlockCornerClusterClassName,
            codeBlockCornerClusterHeightClassName(size),
          )}>
          {hasEndContent ? endContent : null}
          {copyButtonEl}
        </div>
      ) : null}
    </pre>
  );

  return syntaxTheme ? (
    <SyntaxTheme theme={syntaxTheme}>{block}</SyntaxTheme>
  ) : (
    block
  );
}

CodeBlock.displayName = 'CodeBlock';
