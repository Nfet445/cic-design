// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file markdownChildOverrides.stylex.ts
 * @input The cell spacing and border tokens, the element size tokens, and the
 *   caller's per-column and alignment values
 * @output Cell sizing for Markdown's own Table part, the prose floor of a code
 *   block, and the geometry of the copy control in a heading row
 * @position The two places Markdown overrides a child component's own element;
 *   every other Markdown declaration is a Tailwind class
 *
 * Each child paints the properties Markdown has to change with `astryx-base`
 * utilities: Table sets `max-width`, `overflow-wrap`, `word-break` and
 * `text-align` on a cell, CodeBlock sets a `min-width` floor on its box, and
 * Button sets position, box size and text style.
 * Two utilities on one property leave the sheet to decide, so a same-property
 * override has to be an unlayered StyleX rule, which outranks a layered
 * utility at any order. Kept as one map per child so each exception has one
 * home and a test can name it.
 */

import * as stylex from '@stylexjs/stylex';
import {
  borderVars,
  colorVars,
  sizeVars,
  spacingVars,
} from '../theme/tokens.stylex';

const COARSE_TARGET = '24px';

/**
 * Cell sizing for Markdown's own default Table part, layered over Table's
 * wrap-mode defaults.
 *
 * Table sizes wrap-mode cells with `max-width: 0` + `word-break: break-word`,
 * and its header cell also applies nowrap + ellipsis. Those defaults zero every
 * column's min-content contribution, so automatic layout divides the container
 * equally: a six-column Markdown table squashes to a few characters per cell,
 * identifiers split mid-word, header labels ellipsize, and nothing ever
 * overflows into the Scroll region that exists to take the width.
 *
 * Here the cell reports an honest min-content, the header wraps instead of
 * truncating, and `box-sizing: content-box` makes the per-column `ch` floor a
 * floor on the text box rather than on the padded border box — so the floor
 * means the same number of characters at every density, with no padding
 * arithmetic to keep in sync with Table's own tokens.
 *
 * Data-driven `Table` keeps its released wrap mode; only Markdown's part is
 * restyled.
 */
export const markdownTablePartStyles = stylex.create({
  cell: {
    boxSizing: 'content-box',
    maxWidth: 'none',
    overflow: 'visible',
    overflowWrap: 'break-word',
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-2'],
    wordBreak: 'normal',
  },
  headerCell: {
    boxSizing: 'content-box',
    maxWidth: 'none',
    overflow: 'visible',
    overflowWrap: 'break-word',
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-2'],
    textOverflow: 'clip',
    whiteSpace: 'normal',
    wordBreak: 'normal',
  },
  // Inline Code sets `word-break: break-word` so a long token cannot widen a
  // paragraph. Inside a table cell that same rule zeroes the token's
  // min-content and splits an identifier across lines; the cell keeps it whole
  // and lets the column carry the width instead.
  code: {
    wordBreak: 'normal',
  },
  // A cell that reads against its table draws the column rule on the table's
  // inline-end side, which is the cell's own inline-start.
  ruleOnTableEnd: {
    borderInlineEndWidth: 0,
    borderInlineStartWidth: {
      default: borderVars['--border-width'],
      ':last-child': '0',
    },
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: colorVars['--color-border'],
  },
  // The grid's outer edge. `dividers="grid"` draws the lines *between* cells
  // and stops at the table's rim, so without this the top, bottom, and sides
  // stay open and the grid reads as unfinished. On the table element, not the
  // wrapper, so `border-collapse: collapse` merges it with the cell lines
  // into one 1px rule rather than doubling up at the edge.
  tableOuterEdge: {
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
  },
  alignStart: {textAlign: 'start'},
  alignCenter: {textAlign: 'center'},
  alignEnd: {textAlign: 'end'},
  cellMinWidth: (minWidth: string) => ({minWidth}),
});

/**
 * A code block's prose floor. CodeBlock's fit-content box carries a `min-width`
 * utility of its own, and the prose measure has to widen past it, so this one
 * property cannot be a second utility.
 */
export const markdownCodeBlockOverrides = stylex.create({
  blockWidth: (minWidth: string) => ({minWidth: `min(${minWidth}, 100%)`}),
});

/**
 * The heading's copy control: a sm icon-only Button, centered on the `#` in the
 * hidden baseline probe so the control's own box never widens the row.
 */
export const markdownHeadingLinksCopyButtonStyles = stylex.create({
  overrides: {
    position: 'absolute',
    insetBlockStart: '50%',
    inlineSize: {
      default: sizeVars['--size-element-sm'],
      '@media (any-pointer: coarse)': COARSE_TARGET,
    },
    blockSize: {
      default: sizeVars['--size-element-sm'],
      '@media (any-pointer: coarse)': COARSE_TARGET,
    },
    paddingBlock: 0,
    paddingInline: 0,
    color: 'inherit',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    fontWeight: 'inherit',
    lineHeight: 'inherit',
  },
});
