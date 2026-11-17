// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file editorThemeClasses.ts
 * @input Uses Tailwind utilities and Astryx design tokens
 * @output Exports sharedEditorTheme(), which builds a Lexical
 *   EditorThemeClasses object mapping Lexical's theme slots to literal class
 *   strings, with document blocks styled like core Markdown
 *   (spec:AST-061 FR2–FR4)
 * @position Shared by RichTextEditor.tsx and RichTextView.tsx so editor and
 *   read-only view render identically
 *
 * SYNC: When modified, keep RichTextEditor.tsx and RichTextView.tsx in sync.
 */

import {CODE_SYNTAX_CLASS} from './internal/CodeSyntaxPlugin';
import {tw} from './tw';
import type {EditorThemeClasses} from 'lexical';

// Document blocks follow core Markdown's typography, spacing, and measure
// (spec:AST-061 FR2–FR4): type-scale tokens for text, one block spacing table
// with no margin before the first block or after the last, and prose capped
// at Markdown's default content width while code and tables span the editor.
// Every top-level block takes the direction of the surface, so a consumer
// stylesheet never has to undo Lexical's per-block `dir="auto"`.
const BLOCK_DIRECTION_CLASS_NAME = '[direction:inherit]';

const majorHeadingBefore = '[margin-block-start:var(--spacing-6)]';
const majorHeadingAfter = '[margin-block-end:var(--spacing-3)]';
const minorHeadingBefore = '[margin-block-start:var(--spacing-4)]';
const minorHeadingAfter = '[margin-block-end:var(--spacing-2)]';
const textBlockSpace = '[margin-block-start:var(--spacing-3)]';
const wideBlockSpace = '[margin-block-start:var(--spacing-4)]';
// A block that names no language has no header: core CodeBlock puts its copy
// button in a column of its own at the inline end (8px, a small control, 8px),
// beside the code rather than over it, so the code ends that much earlier.
const firstBlock = '[&:first-child]:[margin-block-start:0]';
const lastBlock = '[&:last-child]:[margin-block-end:0]';

// A Markdown plugin block takes a paragraph's style and is a decorator, so at
// either edge of the document it sits beside Lexical's zero-size caret
// boundary element and takes no outer margin there either.
const nextToDecoratorBoundary =
  '[&:is([data-lexical-decorator-boundary]:first-child_+_*)]:[margin-block-start:0]';
const beforeDecoratorBoundary =
  '[&:has(+_[data-lexical-decorator-boundary]:last-child)]:[margin-block-end:0]';

// Markdown's default content width.
const proseMeasure = '[max-width:680px]';

// The first block's leading margin would stack with the input inset, so the
// first line aligns with TextArea and the empty-editor placeholder.
const paragraphClassName = tw(
  textBlockSpace,
  firstBlock,
  nextToDecoratorBoundary,
  '[margin-block-end:var(--spacing-3)]',
  lastBlock,
  beforeDecoratorBoundary,
  proseMeasure,
  // The base reset gives every <p> body weight and primary color; a
  // paragraph inside a table header cell takes the cell's instead.
  '[font-weight:inherit]',
  '[color:inherit]',
);

const h1ClassName = tw(
  '[font-family:var(--font-family-heading)]',
  '[font-size:var(--text-heading-1-size)]',
  '[font-weight:var(--text-heading-1-weight)]',
  '[line-height:var(--text-heading-1-leading)]',
  majorHeadingBefore,
  firstBlock,
  majorHeadingAfter,
  lastBlock,
  proseMeasure,
);

const h2ClassName = tw(
  '[font-family:var(--font-family-heading)]',
  '[font-size:var(--text-heading-2-size)]',
  '[font-weight:var(--text-heading-2-weight)]',
  '[line-height:var(--text-heading-2-leading)]',
  majorHeadingBefore,
  firstBlock,
  majorHeadingAfter,
  lastBlock,
  proseMeasure,
);

const h3ClassName = tw(
  '[font-family:var(--font-family-heading)]',
  '[font-size:var(--text-heading-3-size)]',
  '[font-weight:var(--text-heading-3-weight)]',
  '[line-height:var(--text-heading-3-leading)]',
  majorHeadingBefore,
  firstBlock,
  majorHeadingAfter,
  lastBlock,
  proseMeasure,
);

const h4ClassName = tw(
  '[font-family:var(--font-family-heading)]',
  '[font-size:var(--text-heading-4-size)]',
  '[font-weight:var(--text-heading-4-weight)]',
  '[line-height:var(--text-heading-4-leading)]',
  minorHeadingBefore,
  firstBlock,
  minorHeadingAfter,
  lastBlock,
  proseMeasure,
);

const h5ClassName = tw(
  '[font-family:var(--font-family-heading)]',
  '[font-size:var(--text-heading-5-size)]',
  '[font-weight:var(--text-heading-5-weight)]',
  '[line-height:var(--text-heading-5-leading)]',
  minorHeadingBefore,
  firstBlock,
  minorHeadingAfter,
  lastBlock,
  proseMeasure,
);

const h6ClassName = tw(
  '[font-family:var(--font-family-heading)]',
  '[font-size:var(--text-heading-6-size)]',
  '[font-weight:var(--text-heading-6-weight)]',
  '[line-height:var(--text-heading-6-leading)]',
  minorHeadingBefore,
  firstBlock,
  minorHeadingAfter,
  lastBlock,
  proseMeasure,
);

const quoteClassName = tw(
  wideBlockSpace,
  firstBlock,
  '[margin-block-end:var(--spacing-4)]',
  lastBlock,
  '[margin-inline:0]',
  proseMeasure,
  '[padding-inline-start:var(--spacing-4)]',
  '[border-inline-start-width:2px]',
  '[border-inline-start-style:solid]',
  '[border-inline-start-color:var(--color-border-emphasized)]',
  '[color:var(--color-text-secondary)]',
);

const listClassName = tw(
  textBlockSpace,
  firstBlock,
  '[margin-block-end:var(--spacing-3)]',
  lastBlock,
  proseMeasure,
  '[padding-inline-start:var(--spacing-6)]',
  '[list-style-position:outside]',
);

// Markers by depth (spec:AST-061 DEC-6): a list nested inside n lists, of
// either kind, draws disc, circle, or square, or writes decimal, lower-alpha,
// or lower-roman numbers, for n modulo 3 = 0, 1, 2. Lexical gives every list
// its tag's class above and the depth class at `depth % 3`; only the depth
// class names a marker, so no two classes on a list compete for it.
const ulDepthClassName = [
  '[list-style-type:disc]',
  '[list-style-type:circle]',
  '[list-style-type:square]',
];
const olDepthClassName = [
  '[list-style-type:decimal]',
  '[list-style-type:lower-alpha]',
  '[list-style-type:lower-roman]',
];

// List items space like core Markdown's compact list rows: 4px padding and a
// 2px gap between rows. Lexical puts a nested list in an item of its own after
// its parent item; that wrapper adds no top padding and no marker, and its 8px
// top margin plus the parent row's padding give the 12px Markdown leaves
// between an item's text and its nested list.
const listItemClassName = tw(
  `[padding-block-start:var(--spacing-1)]`,
  '[&:has(ul)]:[padding-block-start:0]',
  '[&:has(ol)]:[padding-block-start:0]',
  '[padding-block-end:var(--spacing-1)]',
  '[margin-block-start:0]',
  '[&:has(ul)]:[margin-block-start:var(--spacing-2)]',
  '[&:has(ol)]:[margin-block-start:var(--spacing-2)]',
  '[margin-block-end:var(--spacing-0-5)]',
  lastBlock,
  // Ensure the marker is shown (some CSS resets set list-style: none on li).
  // A task item (TaskCheckboxPlugin marks it) shows a checkbox instead.
  '[list-style-type:inherit]',
  '[&:has(ul)]:[list-style-type:none]',
  '[&:has(ol)]:[list-style-type:none]',
  '[&:is([data-richtext-task])]:[list-style-type:none]',
  // A task item's text starts 28px in from the list's edge, after core's small
  // checkbox (20px) and its 8px gap, like core Markdown's task lists: the item
  // cancels the list's bullet indent and pads for the checkbox.
  '[margin-inline-start:0]',
  '[&:is([data-richtext-task])]:[margin-inline-start:calc(-1_*_var(--spacing-6))]',
  '[padding-inline-start:0]',
  '[&:is([data-richtext-task])]:[padding-inline-start:calc(20px_+_var(--spacing-2))]',
);

const linkClassName = tw(
  '[color:var(--color-text-accent)]',
  '[text-decoration:underline]',
  '[cursor:pointer]',
  '[&:is(:disabled,[aria-disabled=true])]:[cursor:default]',
);

const textCodeClassName = tw(
  '[font-family:var(--font-family-code)]',
  '[background-color:var(--color-background-muted)]',
  '[padding-inline:var(--spacing-1)]',
  '[border-radius:var(--radius-inner)]',
);

// GFM tables, styled like core Markdown's table: semibold secondary header
// text, a divider under every row but the last, and a wide table that scrolls
// inside its own wrapper instead of widening the editor.
const tableScrollableWrapperClassName = tw(
  '[overflow-x:auto]',
  '[max-width:100%]',
  // One grid track that may shrink to nothing: the wrapper asks its host for
  // no minimum width, so a grid or flex host never grows to fit a wide table
  // and the wrapper scrolls instead, while a shrink-to-fit host still sizes to
  // the table's natural width.
  'grid',
  '[grid-template-columns:minmax(0,1fr)]',
  wideBlockSpace,
  firstBlock,
  '[margin-block-end:var(--spacing-4)]',
  lastBlock,
);

const tableClassName = tw(
  '[border-collapse:collapse]',
  'w-full',
  // The grid's outer edge, matching core Markdown's table: the row and column
  // lines stop at the table's rim, so without this the top, bottom, and sides
  // stay open. `border-collapse: collapse` merges it with the cell lines into
  // one 1px rule rather than doubling up at the edge.
  '[border-width:var(--border-width)]',
  'border-solid',
  '[border-color:var(--color-border)]',
);

const tableRowClassName = tw(
  '[border-bottom-width:1px]',
  '[border-bottom-style:solid]',
  '[border-bottom-color:var(--color-border)]',
  '[&:last-child]:[border-bottom-color:transparent]',
);

const tableCellClassName = tw(
  // Column floors (TableColumnFloorPlugin) size the text box, not the padding,
  // as in core Markdown's tables.
  '[box-sizing:content-box]',
  '[padding-block:var(--spacing-2)]',
  '[padding-inline:var(--spacing-2)]',
  '[text-align:start]',
  '[vertical-align:middle]',
  '[overflow-wrap:break-word]',
  // A line on every cell edge, as core Markdown's table draws with
  // `dividers="grid"`. The row lines come from `tableRow`; this is the column
  // half. The last column draws none, so the rim is the `table` rule's own
  // border rather than two lines stacked at the edge — the same rule core
  // `TableCell` follows (`:last-child` → 0).
  '[border-inline-end-width:var(--border-width)]',
  '[&:last-child]:[border-inline-end-width:0]',
  '[border-inline-end-style:solid]',
  '[border-inline-end-color:var(--color-border)]',
);

const tableCellHeaderClassName = tw(
  '[font-weight:var(--font-weight-semibold)]',
  '[color:var(--color-text-secondary)]',
);

// Cells in a table selection are ringed, for the reason `hrSelected` gives: a
// person has to see what the next keystroke will replace. A ring, not a wash:
// a wash sits behind the cell's text and eats into its contrast, and no one
// token stays clear of the field in every theme. `outline` takes no space, so
// the document's geometry is untouched (spec:AST-061 FR9), and the inset
// offset keeps each ring inside its own cell.
const selectionRingClassName = tw(
  '[outline-width:var(--focus-outline-width)]',
  '[outline-style:var(--focus-outline-style)]',
  '[outline-color:var(--focus-outline-color)]',
);
const tableCellSelectedClassName = tw(
  selectionRingClassName,
  '[outline-offset:calc(-1_*_var(--focus-outline-width))]',
);

// Thematic breaks, drawn like core Markdown's rule. A rule is a decorator, and
// Lexical puts a zero-size caret boundary element beside a decorator at either
// edge of the document, so a rule there is not literally the first or last
// child; it still takes no outer margin.
const hrClassName = tw(
  '[border-width:0]',
  '[border-top-width:var(--border-width)]',
  '[border-top-style:solid]',
  '[border-top-color:var(--color-border)]',
  '[margin-block-start:var(--spacing-6)]',
  firstBlock,
  nextToDecoratorBoundary,
  '[margin-block-end:var(--spacing-6)]',
  lastBlock,
  beforeDecoratorBoundary,
);

// A selected rule (click, or arrow onto it) or Markdown plugin node (click)
// shows the focus ring, so users can see what Backspace will delete.
const hrSelectedClassName = tw(
  selectionRingClassName,
  '[outline-offset:var(--focus-outline-offset)]',
);

// Fenced code in core CodeBlock's frame: syntax background, a border, the code
// type size, and room at the top for the header that CodeBlockHeaderPlugin
// draws over a block that names its language. Long lines wrap rather than
// scroll: a scrolling region inside the editable text cannot take keyboard
// focus of its own, so keyboard users could not scroll it
// (axe scrollable-region-focusable).
const codeClassName = tw(
  'block',
  '[font-family:var(--font-family-code)]',
  '[font-size:var(--text-code-size)]',
  '[line-height:var(--text-code-leading)]',
  '[background-color:var(--color-syntax-background)]',
  '[border-width:var(--border-width)]',
  'border-solid',
  '[border-color:var(--color-border)]',
  '[border-radius:var(--radius-element)]',
  '[padding-block-start:var(--spacing-3)]',
  // Only a block whose header names a language; `plaintext` names none, as in
  // core CodeBlock (CodeBlockHeaderPlugin).
  '[&:is([data-language]:not([data-language=plaintext]))]:[padding-block-start:calc(var(--spacing-2)_+_var(--size-element-sm)_+_var(--spacing-3))]',
  '[padding-block-end:var(--spacing-3)]',
  '[padding-inline-start:var(--spacing-4)]',
  // Room for the corner copy button CodeBlockHeaderPlugin draws over a block
  // that names no language, so no line runs under it.
  '[padding-inline-end:calc(var(--spacing-4)_+_var(--size-element-sm)_+_2_*_var(--spacing-2))]',
  '[&:is([data-language]:not([data-language=plaintext]))]:[padding-inline-end:var(--spacing-4)]',
  // Sized like core Markdown's code frame: as wide as its longest line, at
  // least the prose measure (or the whole width when that is narrower), and
  // never wider than the editor, where long lines wrap.
  '[box-sizing:border-box]',
  '[width:fit-content]',
  '[min-width:min(680px,100%)]',
  '[max-width:100%]',
  wideBlockSpace,
  firstBlock,
  '[margin-block-end:var(--spacing-4)]',
  lastBlock,
  // Long lines wrap exactly as core CodeBlock's wrapped lines do, so a code
  // block is as tall here as in core Markdown (spec:AST-061 FR5, DEC-9).
  '[white-space:pre-wrap]',
  '[word-break:break-all]',
  '[overflow-wrap:break-word]',
);

/**
 * Builds the Lexical EditorThemeClasses object from the class maps above.
 */
export function sharedEditorTheme(): EditorThemeClasses {
  const block = (className: string): string =>
    tw(className, BLOCK_DIRECTION_CLASS_NAME);
  const boldClassName = '[font-weight:var(--font-weight-semibold)]';
  return {
    paragraph: block(paragraphClassName),
    // A Markdown plugin's block node is spaced and measured as a paragraph, as
    // core Markdown spaces its block (RichTextExtensionNode reads it).
    markdownExtensionBlock: block(paragraphClassName),
    heading: {
      h1: block(h1ClassName),
      h2: block(h2ClassName),
      h3: block(h3ClassName),
      h4: block(h4ClassName),
      h5: block(h5ClassName),
      h6: block(h6ClassName),
    },
    quote: block(quoteClassName),
    list: {
      ul: block(listClassName),
      ol: block(listClassName),
      listitem: listItemClassName,
      nested: {
        listitem: listItemClassName,
      },
      // Lexical picks the class at `depth % 3` (spec:AST-061 DEC-6).
      ulDepth: ulDepthClassName,
      olDepth: olDepthClassName,
    },
    link: linkClassName,
    text: {
      bold: boldClassName,
      italic: '[font-style:italic]',
      underline: '[text-decoration:underline]',
      strikethrough: '[text-decoration:line-through]',
      code: textCodeClassName,
    },
    // The plain class lets CodeSyntaxPlugin's highlight rules find code blocks.
    code: `${block(codeClassName)} ${CODE_SYNTAX_CLASS}`,
    hr: hrClassName,
    hrSelected: hrSelectedClassName,
    // MarkdownExtensionsPlugin puts it on a selected plugin node.
    markdownExtensionSelected: hrSelectedClassName,
    table: block(tableClassName),
    // Lexical stamps rows and cells `dir="auto"` too, which would set a cell
    // of English text left-to-right inside a right-to-left document.
    tableRow: block(tableRowClassName),
    tableCell: block(tableCellClassName),
    tableCellHeader: block(tableCellHeaderClassName),
    // Added on top of the cell's own class by Lexical while the cell is in a
    // table selection, so it carries no direction of its own.
    tableCellSelected: tableCellSelectedClassName,
    tableScrollableWrapper: block(tableScrollableWrapperClassName),
  };
}
