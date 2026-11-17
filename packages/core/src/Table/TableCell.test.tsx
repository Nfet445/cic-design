// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TableCell.test.tsx
 * @input Uses vitest, @testing-library/react, StyleX, Table, TableCell
 * @output Unit tests for TableCell
 * @position Testing; validates the `<td>` contract, the standalone (no
 *   TableContext) plain render, and the context-driven density, overflow,
 *   alignment and divider styling
 *
 * The cell's styles are Tailwind utilities, whose declarations jsdom does not
 * resolve, so a test here asserts the class set the cell computed. The built
 * sheet asserts the declarations those classes carry
 * (Layout/tailwindStylesheet.source-build.test.mjs).
 *
 * SYNC: When TableCell.tsx changes, update tests to match
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import * as stylex from '@stylexjs/stylex';
import {Table} from './Table';
import {TableBody} from './TableBody';
import {TableCell} from './TableCell';
import {TableRow} from './TableRow';
import {expectClassSet} from '../__tests__/classNameAssertions';

// =============================================================================
// Test Data
// =============================================================================

type Density = 'compact' | 'balanced' | 'spacious';

/** The density padding and container-edge classes each step owns. */
const DENSITY_CLASSES: Record<Density, {padding: string[]; edge: string[]}> = {
  compact: {
    padding: ['py-1', 'px-2'],
    edge: [
      'first:ps-[max(var(--container-padding-inline-start,var(--spacing-2)),var(--spacing-2))]',
      'last:pe-[max(var(--container-padding-inline-end,var(--spacing-2)),var(--spacing-2))]',
    ],
  },
  balanced: {
    padding: ['py-2', 'px-3'],
    edge: [
      'first:ps-[max(var(--container-padding-inline-start,var(--spacing-3)),var(--spacing-2))]',
      'last:pe-[max(var(--container-padding-inline-end,var(--spacing-3)),var(--spacing-2))]',
    ],
  },
  spacious: {
    padding: ['py-3', 'px-4'],
    edge: [
      'first:ps-[max(var(--container-padding-inline-start,var(--spacing-4)),var(--spacing-2))]',
      'last:pe-[max(var(--container-padding-inline-end,var(--spacing-4)),var(--spacing-2))]',
    ],
  },
};

/** The text treatment every body cell carries. */
const CELL_TEXT_CLASSES = ['box-border', 'text-[length:var(--text-body-size)]'];

/** The two ways a cell handles content that outgrows it. */
const WRAP_CLASSES = [
  'max-w-0',
  'overflow-hidden',
  '[overflow-wrap:break-word]',
  '[word-break:break-word]',
];
const TRUNCATE_CLASSES = [
  'max-w-0',
  'overflow-hidden',
  'text-ellipsis',
  'whitespace-nowrap',
];

/** Both modes clip the cell; they differ in how the text itself behaves. */
const TRUNCATING_CLASSES = ['text-ellipsis', 'whitespace-nowrap'];
const BREAKING_CLASSES = [
  '[overflow-wrap:break-word]',
  '[word-break:break-word]',
];

/** The divider a cell draws between rows, and its reset on the last row. */
const ROW_DIVIDER_CLASSES = [
  '[--_table-row-divider-width:var(--border-width)]',
  '[border-bottom-width:var(--border-width)]',
  '[border-bottom-style:solid]',
  '[border-bottom-color:var(--color-border)]',
];
const LAST_ROW_CLASSES = [
  '[tr:last-child>&]:[--_table-row-divider-width:0px]',
  '[tr:last-child:not([data-table-final-row=false])>&]:[border-bottom-width:0]',
  '[tr[data-table-final-row=true]>&]:[border-bottom-width:0]',
];

/** The divider a cell draws between columns, zeroed on the last cell. */
const COLUMN_DIVIDER_CLASSES = [
  '[border-inline-end-width:var(--border-width)]',
  '[border-inline-end-style:solid]',
  '[border-inline-end-color:var(--color-border)]',
  'last:[border-inline-end-width:0]',
];

// =============================================================================
// Helpers
// =============================================================================

/** Render a lone cell with no Table around it. */
function renderStandalone(cell: React.ReactNode) {
  return render(
    <table>
      <tbody>
        <tr>{cell}</tr>
      </tbody>
    </table>,
  );
}

/** Render the first cell of a table built from children. */
function renderCell(table: React.ComponentProps<typeof Table>) {
  return render(
    <Table {...table}>
      <TableBody>
        <TableRow>
          <TableCell>Alice</TableCell>
          <TableCell>30</TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  );
}

/** The first body cell of a rendered table. */
function firstCell(container: HTMLElement): HTMLElement {
  const cell = container.querySelector('tbody td');
  expect(cell).not.toBeNull();
  return cell as HTMLElement;
}

// =============================================================================
// Tests
// =============================================================================

describe('TableCell', () => {
  it('renders a td element around its children', () => {
    const {container} = renderStandalone(<TableCell>Alice</TableCell>);
    const cell = firstCell(container);
    expect(cell.tagName).toBe('TD');
    expect(cell).toHaveTextContent('Alice');
    expect(screen.getByRole('cell')).toBe(cell);
  });

  it('renders unstyled when used outside a Table', () => {
    const cell = firstCell(
      renderStandalone(<TableCell>Alice</TableCell>).container,
    );
    // No table context — no density, overflow, alignment or divider styling.
    expectClassSet(cell, {
      includes: ['astryx-table-cell'],
      excludes: [
        ...DENSITY_CLASSES.balanced.padding,
        ...CELL_TEXT_CLASSES,
        ...WRAP_CLASSES,
        ...ROW_DIVIDER_CLASSES,
      ],
    });
    expect(cell).not.toHaveAttribute('data-density');
  });

  it('takes the balanced density padding from the table by default', () => {
    const cell = firstCell(renderCell({}).container);
    expectClassSet(cell, {
      includes: [
        ...CELL_TEXT_CLASSES,
        ...DENSITY_CLASSES.balanced.padding,
        ...DENSITY_CLASSES.balanced.edge,
      ],
      excludes: [
        ...DENSITY_CLASSES.compact.padding,
        ...DENSITY_CLASSES.spacious.padding,
      ],
    });
    expect(cell).toHaveAttribute('data-density', 'balanced');
  });

  it('takes the compact density padding from the table', () => {
    const cell = firstCell(renderCell({density: 'compact'}).container);
    expectClassSet(cell, {
      includes: [
        ...DENSITY_CLASSES.compact.padding,
        ...DENSITY_CLASSES.compact.edge,
      ],
      excludes: DENSITY_CLASSES.balanced.padding,
    });
    expect(cell).toHaveAttribute('data-density', 'compact');
  });

  it('takes the spacious density padding from the table', () => {
    const cell = firstCell(renderCell({density: 'spacious'}).container);
    expectClassSet(cell, {
      includes: [
        ...DENSITY_CLASSES.spacious.padding,
        ...DENSITY_CLASSES.spacious.edge,
      ],
      excludes: DENSITY_CLASSES.balanced.padding,
    });
  });

  it('wraps content that outgrows the cell by default', () => {
    const cell = firstCell(renderCell({}).container);
    expectClassSet(cell, {
      includes: WRAP_CLASSES,
      excludes: TRUNCATING_CLASSES,
    });
  });

  it('truncates content when the table asks for it', () => {
    const cell = firstCell(renderCell({textOverflow: 'truncate'}).container);
    expectClassSet(cell, {
      includes: TRUNCATE_CLASSES,
      excludes: BREAKING_CLASSES,
    });
  });

  it('aligns content to the middle by default', () => {
    const cell = firstCell(renderCell({}).container);
    expectClassSet(cell, {
      includes: ['align-middle'],
      excludes: ['align-top', 'align-bottom'],
    });
  });

  it('aligns content where the table asks', () => {
    for (const [verticalAlign, expected] of [
      ['top', 'align-top'],
      ['bottom', 'align-bottom'],
    ] as const) {
      const cell = firstCell(renderCell({verticalAlign}).container);
      expectClassSet(cell, {
        includes: [expected],
        excludes: ['align-middle'],
      });
    }
  });

  it('draws the row divider and publishes its width', () => {
    const cell = firstCell(renderCell({dividers: 'rows'}).container);
    // The pinned-column and row-expansion plugins read the width back to
    // continue the line elsewhere than the table paints it.
    expectClassSet(cell, {
      includes: [...ROW_DIVIDER_CLASSES, ...LAST_ROW_CLASSES],
      excludes: COLUMN_DIVIDER_CLASSES,
    });
  });

  it('draws no row divider when the table divides columns only', () => {
    const cell = firstCell(renderCell({dividers: 'columns'}).container);
    expectClassSet(cell, {
      includes: COLUMN_DIVIDER_CLASSES,
      excludes: [...ROW_DIVIDER_CLASSES, ...LAST_ROW_CLASSES],
    });
  });

  it('draws both dividers on a grid', () => {
    const cell = firstCell(renderCell({dividers: 'grid'}).container);
    expectClassSet(cell, {
      includes: [...ROW_DIVIDER_CLASSES, ...COLUMN_DIVIDER_CLASSES],
    });
  });

  it('draws no divider when the table divides nothing', () => {
    const cell = firstCell(renderCell({dividers: 'none'}).container);
    expectClassSet(cell, {
      excludes: [
        ...ROW_DIVIDER_CLASSES,
        ...LAST_ROW_CLASSES,
        ...COLUMN_DIVIDER_CLASSES,
      ],
    });
  });

  it('moves its density padding onto the context menu trigger', () => {
    const {container} = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell
              contextMenuActions={[
                {id: 'copy', label: 'Copy', onSelect: vi.fn()},
              ]}>
              Alice
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    // The trigger fills the cell and carries the padding, so the whole cell
    // opens the menu and the `<td>` keeps only its text treatment.
    expectClassSet(firstCell(container), {
      includes: [...CELL_TEXT_CLASSES, 'h-full'],
      excludes: DENSITY_CLASSES.balanced.padding,
    });
  });

  it('keeps the padding on the cell with no context menu', () => {
    const cell = firstCell(renderCell({}).container);
    expectClassSet(cell, {
      includes: DENSITY_CLASSES.balanced.padding,
      excludes: ['h-full'],
    });
  });

  it('lets consumer xstyle merge on top of the cell styling', () => {
    const custom = stylex.create({rightAligned: {textAlign: 'end'}});
    const {container} = renderStandalone(
      <TableCell xstyle={custom.rightAligned}>Alice</TableCell>,
    );
    const cell = firstCell(container);
    for (const token of (stylex.props(custom.rightAligned).className ?? '')
      .split(/\s+/)
      .filter(Boolean)) {
      expect(cell).toHaveClass(token);
    }
  });

  it('spreads html attributes onto the td', () => {
    const {container} = renderStandalone(
      <TableCell colSpan={2} headers="name" id="cell-alice">
        Alice
      </TableCell>,
    );
    const cell = firstCell(container);
    expect(cell).toHaveAttribute('colspan', '2');
    expect(cell).toHaveAttribute('headers', 'name');
    expect(cell.id).toBe('cell-alice');
  });

  it('forwards the ref to the td element', () => {
    const ref = vi.fn();
    renderStandalone(<TableCell ref={ref}>Alice</TableCell>);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLTableCellElement));
  });

  it('keeps a consumer className and style alongside the astryx class', () => {
    const {container} = renderStandalone(
      <TableCell className="custom-cell" style={{width: '10px'}}>
        Alice
      </TableCell>,
    );
    const cell = firstCell(container);
    expect(cell).toHaveClass('astryx-table-cell');
    expect(cell).toHaveClass('custom-cell');
    expect(cell.style.width).toBe('10px');
  });
});
