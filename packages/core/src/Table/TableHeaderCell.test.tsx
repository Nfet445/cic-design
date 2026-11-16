// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TableHeaderCell.test.tsx
 * @input Uses vitest, @testing-library/react, StyleX, Table, TableHeaderCell
 * @output Unit tests for TableHeaderCell
 * @position Testing; validates the `<th>` contract, the standalone (no
 *   TableContext) plain render, and the context-driven density/divider styling
 *
 * The cell's own styles are Tailwind utilities, whose declarations jsdom does
 * not resolve, so a test here asserts the class set the cell computed. The
 * built sheet asserts the declarations those classes carry
 * (Layout/tailwindStylesheet.source-build.test.mjs).
 *
 * SYNC: When TableHeaderCell.tsx changes, update tests to match
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import * as stylex from '@stylexjs/stylex';
import {Table} from './Table';
import {TableHeaderCell} from './TableHeaderCell';
import type {TableColumn} from './types';
import {classesOf, expectClassSet} from '../__tests__/classNameAssertions';

// =============================================================================
// Test Data
// =============================================================================

interface User extends Record<string, unknown> {
  name: string;
  age: number;
}

const users: User[] = [{name: 'Alice', age: 30}];

const columns: TableColumn<User>[] = [
  {key: 'name', header: 'Name'},
  {key: 'age', header: 'Age'},
];

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

/** The label treatment every header cell carries inside a table. */
const HEADER_LABEL_CLASSES = [
  'text-start',
  '[font-weight:var(--font-weight-semibold)]',
  '[color:var(--color-text-secondary)]',
  'text-[length:var(--text-label-size)]',
  'box-border',
  'max-w-0',
  'overflow-hidden',
  'text-ellipsis',
  'whitespace-nowrap',
];

/** The divider between the header row and the body. */
const HEADER_DIVIDER_CLASSES = [
  '[--_table-row-divider-width:var(--border-width)]',
  '[border-bottom-width:var(--border-width)]',
  '[border-bottom-style:solid]',
  '[border-bottom-color:var(--color-border)]',
];

/** The divider a header cell draws between columns, zeroed on the last cell. */
const COLUMN_DIVIDER_CLASSES = [
  '[border-inline-end-width:var(--border-width)]',
  '[border-inline-end-style:solid]',
  '[border-inline-end-color:var(--color-border)]',
  'last:[border-inline-end-width:0]',
];

// =============================================================================
// Helpers
// =============================================================================

/** Render a lone header cell with no Table around it. */
function renderStandalone(cell: React.ReactNode) {
  return render(
    <table>
      <thead>
        <tr>{cell}</tr>
      </thead>
    </table>,
  );
}

/** The first header cell of a rendered Table. */
function firstHeaderCell(container: HTMLElement): HTMLElement {
  const th = container.querySelector('thead th');
  expect(th).not.toBeNull();
  return th as HTMLElement;
}

// =============================================================================
// Tests
// =============================================================================

describe('TableHeaderCell', () => {
  it('renders a th element around its children', () => {
    const {container} = renderStandalone(
      <TableHeaderCell>Name</TableHeaderCell>,
    );
    const th = container.querySelector('th');
    expect(th).not.toBeNull();
    expect(th).toHaveTextContent('Name');
    expect(screen.getByRole('columnheader')).toBe(th);
  });

  it('sets no scope attribute unless one is given', () => {
    const {container} = renderStandalone(
      <TableHeaderCell>Name</TableHeaderCell>,
    );
    expect(container.querySelector('th')).not.toHaveAttribute('scope');
  });

  it('reflects the scope prop on the th', () => {
    const {container} = renderStandalone(
      <TableHeaderCell scope="rowgroup">Name</TableHeaderCell>,
    );
    expect(container.querySelector('th')).toHaveAttribute('scope', 'rowgroup');
  });

  it('renders unstyled when used outside a Table', () => {
    const th = renderStandalone(
      <TableHeaderCell>Name</TableHeaderCell>,
    ).container.querySelector('th') as HTMLElement;
    // No table context — no density, divider or overflow styling at all.
    expect(classesOf(th)).toEqual(['astryx-table-header-cell']);
    expect(th).not.toHaveAttribute('data-density');
  });

  it('takes the balanced density padding from the table by default', () => {
    const {container} = render(<Table data={users} columns={columns} />);
    const th = firstHeaderCell(container);
    expectClassSet(th, {
      includes: [
        ...DENSITY_CLASSES.balanced.padding,
        ...DENSITY_CLASSES.balanced.edge,
      ],
      excludes: [
        ...DENSITY_CLASSES.compact.padding,
        ...DENSITY_CLASSES.spacious.padding,
      ],
    });
    expect(th).toHaveAttribute('data-density', 'balanced');
  });

  it('takes the compact density padding from the table', () => {
    const {container} = render(
      <Table data={users} columns={columns} density="compact" />,
    );
    const th = firstHeaderCell(container);
    expectClassSet(th, {
      includes: [
        ...DENSITY_CLASSES.compact.padding,
        ...DENSITY_CLASSES.compact.edge,
      ],
      excludes: DENSITY_CLASSES.balanced.padding,
    });
    expect(th).toHaveAttribute('data-density', 'compact');
  });

  it('takes the spacious density padding from the table', () => {
    const {container} = render(
      <Table data={users} columns={columns} density="spacious" />,
    );
    const th = firstHeaderCell(container);
    expectClassSet(th, {
      includes: [
        ...DENSITY_CLASSES.spacious.padding,
        ...DENSITY_CLASSES.spacious.edge,
      ],
      excludes: DENSITY_CLASSES.balanced.padding,
    });
  });

  it('applies the header label treatment inside a table', () => {
    const {container} = render(<Table data={users} columns={columns} />);
    expectClassSet(firstHeaderCell(container), {
      includes: HEADER_LABEL_CLASSES,
    });
  });

  it('publishes the divider width a pinned header cell reads', () => {
    const {container} = render(<Table data={users} columns={columns} />);
    expectClassSet(firstHeaderCell(container), {
      includes: ['[--_table-row-divider-width:var(--border-width)]'],
    });
  });

  it('draws the bottom divider even when the table has dividers off', () => {
    const {container} = render(
      <Table data={users} columns={columns} dividers="none" />,
    );
    // The header/body separator is unconditional inside a table.
    expectClassSet(firstHeaderCell(container), {
      includes: HEADER_DIVIDER_CLASSES,
      excludes: COLUMN_DIVIDER_CLASSES,
    });
  });

  it('draws no column divider when the table divides rows only', () => {
    const {container} = render(
      <Table data={users} columns={columns} dividers="rows" />,
    );
    expectClassSet(firstHeaderCell(container), {
      excludes: COLUMN_DIVIDER_CLASSES,
    });
  });

  // The divider sits on the logical inline-end edge so it mirrors under RTL,
  // and the `last:` variant rides in the class name, so the override lands on
  // whichever cell ends the row.
  it('draws a column divider that the last header cell zeroes out', () => {
    const {container} = render(
      <Table data={users} columns={columns} dividers="columns" />,
    );
    expectClassSet(firstHeaderCell(container), {
      includes: COLUMN_DIVIDER_CLASSES,
    });
  });

  it('draws a column divider when the table divides on a grid', () => {
    const {container} = render(
      <Table data={users} columns={columns} dividers="grid" />,
    );
    expectClassSet(firstHeaderCell(container), {
      includes: COLUMN_DIVIDER_CLASSES,
    });
  });

  it('anchors a context menu on the cell', () => {
    const {container} = render(
      <Table>
        <thead>
          <tr>
            <TableHeaderCell
              contextMenuActions={[
                {id: 'copy', label: 'Copy', onSelect: vi.fn()},
              ]}>
              Name
            </TableHeaderCell>
          </tr>
        </thead>
      </Table>,
    );
    expectClassSet(firstHeaderCell(container), {includes: ['relative']});
  });

  it('leaves the cell unpositioned with no context menu', () => {
    const {container} = render(<Table data={users} columns={columns} />);
    expectClassSet(firstHeaderCell(container), {excludes: ['relative']});
  });

  it('lets consumer xstyle merge on top of the context header styling', () => {
    const custom = stylex.create({trailing: {textAlign: 'end'}});
    const {container} = render(
      <Table>
        <thead>
          <tr>
            <TableHeaderCell xstyle={custom.trailing}>Name</TableHeaderCell>
          </tr>
        </thead>
      </Table>,
    );
    const th = firstHeaderCell(container);
    // The family class stays; the StyleX atom ships unlayered, above it.
    expectClassSet(th, {
      includes: ['text-start', ...DENSITY_CLASSES.balanced.padding],
    });
    for (const token of (stylex.props(custom.trailing).className ?? '')
      .split(/\s+/)
      .filter(Boolean)) {
      expect(th).toHaveClass(token);
    }
  });

  it('accepts an array of xstyle values', () => {
    const custom = stylex.create({
      caps: {textTransform: 'uppercase'},
      spaced: {letterSpacing: '2px'},
    });
    const th = renderStandalone(
      <TableHeaderCell xstyle={[custom.caps, custom.spaced]}>
        Name
      </TableHeaderCell>,
    ).container.querySelector('th') as HTMLElement;
    for (const style of [custom.caps, custom.spaced]) {
      for (const token of (stylex.props(style).className ?? '')
        .split(/\s+/)
        .filter(Boolean)) {
        expect(th).toHaveClass(token);
      }
    }
  });

  it('forwards the ref to the th element', () => {
    const ref = vi.fn();
    renderStandalone(<TableHeaderCell ref={ref}>Name</TableHeaderCell>);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLTableCellElement));
  });

  it('spreads html attributes onto the th', () => {
    const {container} = renderStandalone(
      <TableHeaderCell
        id="name-header"
        aria-sort="ascending"
        data-column-key="name">
        Name
      </TableHeaderCell>,
    );
    const th = container.querySelector('th') as HTMLElement;
    expect(th.id).toBe('name-header');
    expect(th).toHaveAttribute('aria-sort', 'ascending');
    expect(th).toHaveAttribute('data-column-key', 'name');
  });

  it('keeps a consumer className and style alongside the astryx class', () => {
    const {container} = renderStandalone(
      <TableHeaderCell className="custom-header" style={{width: '10px'}}>
        Name
      </TableHeaderCell>,
    );
    const th = container.querySelector('th') as HTMLElement;
    expect(th).toHaveClass('astryx-table-header-cell');
    expect(th).toHaveClass('custom-header');
    expect(th.style.width).toBe('10px');
  });
});
