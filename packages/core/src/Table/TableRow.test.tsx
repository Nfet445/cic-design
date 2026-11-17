// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TableRow.test.tsx
 * @input Uses vitest, @testing-library/react, StyleX, Table, TableRow
 * @output Unit tests for TableRow
 * @position Testing; validates the `<tr>` contract, the standalone (no
 *   TableContext) plain render, and the context-driven striping and hover
 *
 * The row's surface is Tailwind utilities, whose declarations jsdom does not
 * resolve, so a test here asserts the class set the row computed. The built
 * sheet asserts the declarations those classes carry
 * (Layout/tailwindStylesheet.source-build.test.mjs).
 *
 * SYNC: When TableRow.tsx changes, update tests to match
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

/**
 * The stripe every body row carries when the table stripes by DOM position.
 * `even of :not([data-expansion-panel])` counts data rows only, so a detail
 * panel opened between them cannot flip the parity.
 */
const STRIPE_CLASSES = [
  '[&:nth-child(even_of_:not([data-expansion-panel]))]:bg-[var(--color-background-muted)]',
  '[&:nth-child(even_of_:not([data-expansion-panel]))]:[--table-row-overlay:var(--color-background-muted)]',
];

/**
 * The stripe a row carries when it states its own parity, which is how a body
 * that keeps only a slice of its rows in the DOM stays striped.
 */
const LOGICAL_STRIPE_CLASSES = [
  'bg-[var(--color-background-muted)]',
  '[--table-row-overlay:var(--color-background-muted)]',
];

/** The highlight a row paints under the pointer, and its transition. */
const HOVER_CLASSES = [
  '[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:bg-[var(--color-overlay-hover)]',
  '[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:[--table-row-overlay:var(--color-overlay-hover)]',
  'transition-[background-color]',
  'duration-[var(--duration-fast)]',
  'ease-[var(--ease-standard)]',
];

// =============================================================================
// Helpers
// =============================================================================

/** Render a lone row with no Table around it. */
function renderStandalone(row: React.ReactNode) {
  return render(
    <table>
      <tbody>{row}</tbody>
    </table>,
  );
}

/** Render one body row inside a table built from children. */
function renderBodyRow(
  table: {
    isStriped?: boolean;
    hasHover?: boolean;
    dividers?: 'rows' | 'columns' | 'grid' | 'none';
  },
  rowProps: Omit<React.ComponentProps<typeof TableRow>, 'children'> = {},
) {
  return render(
    <Table {...table}>
      <TableBody>
        <TableRow {...rowProps}>
          <TableCell>Alice</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Bob</TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  );
}

/** The first body row of a rendered table. */
function firstBodyRow(container: HTMLElement): HTMLElement {
  const row = container.querySelector('tbody tr');
  expect(row).not.toBeNull();
  return row as HTMLElement;
}

// =============================================================================
// Tests
// =============================================================================

describe('TableRow', () => {
  it('renders a tr element around its children', () => {
    const {container} = renderStandalone(
      <TableRow>
        <TableCell>Alice</TableCell>
      </TableRow>,
    );
    const row = firstBodyRow(container);
    expect(row.tagName).toBe('TR');
    expect(row).toHaveTextContent('Alice');
    expect(screen.getByRole('row')).toBe(row);
  });

  it('renders unstyled when used outside a Table', () => {
    const row = firstBodyRow(
      renderStandalone(
        <TableRow>
          <TableCell>Alice</TableCell>
        </TableRow>,
      ).container,
    );
    // No table context — no surface styling at all, only the stable class and
    // the StyleX marker the row-expansion plugin matches.
    expectClassSet(row, {
      includes: ['astryx-table-row'],
      excludes: [...STRIPE_CLASSES, ...HOVER_CLASSES],
    });
  });

  it('paints no surface when the table neither stripes nor hovers', () => {
    const {container} = renderBodyRow({});
    expectClassSet(firstBodyRow(container), {
      excludes: [
        ...STRIPE_CLASSES,
        ...LOGICAL_STRIPE_CLASSES,
        ...HOVER_CLASSES,
      ],
    });
  });

  it('stripes from the row place among its siblings', () => {
    const {container} = renderBodyRow({isStriped: true});
    // Every body row carries the same rule; the selector picks the even ones.
    expectClassSet(firstBodyRow(container), {
      includes: STRIPE_CLASSES,
      excludes: LOGICAL_STRIPE_CLASSES,
    });
  });

  it('publishes the overlay variable the stripe paints through', () => {
    const {container} = renderBodyRow({isStriped: true});
    // The hover highlight and the stripe both paint through
    // `--table-row-overlay`, so the stripe must publish it, not only a
    // background colour.
    expectClassSet(firstBodyRow(container), {
      includes: [
        '[&:nth-child(even_of_:not([data-expansion-panel]))]:[--table-row-overlay:var(--color-background-muted)]',
      ],
    });
  });

  it('highlights the row under the pointer only when the table asks', () => {
    const {container} = renderBodyRow({hasHover: true});
    expectClassSet(firstBodyRow(container), {
      includes: HOVER_CLASSES,
      excludes: STRIPE_CLASSES,
    });
  });

  it('paints both the stripe and the highlight', () => {
    const {container} = renderBodyRow({isStriped: true, hasHover: true});
    expectClassSet(firstBodyRow(container), {
      includes: [...STRIPE_CLASSES, ...HOVER_CLASSES],
    });
  });

  // A body that keeps only a slice of its rows in the DOM states each row's
  // parity, because the row's place among its siblings is not its place in
  // the data.
  it('paints the stated parity of a row that knows its logical index', () => {
    const {container} = renderBodyRow(
      {isStriped: true},
      {'data-table-logical-index': '1'},
    );
    expectClassSet(firstBodyRow(container), {
      includes: LOGICAL_STRIPE_CLASSES,
      excludes: STRIPE_CLASSES,
    });
  });

  it('leaves an even logical row unstriped', () => {
    const {container} = renderBodyRow(
      {isStriped: true},
      {'data-table-logical-index': '2'},
    );
    expectClassSet(firstBodyRow(container), {
      excludes: [...STRIPE_CLASSES, ...LOGICAL_STRIPE_CLASSES],
    });
  });

  it('keeps the header row free of the body surface', () => {
    const {container} = render(
      <Table isStriped hasHover>
        <thead>
          <TableRow isHeaderRow>
            <TableCell>Name</TableCell>
          </TableRow>
        </thead>
        <TableBody>
          <TableRow>
            <TableCell>Alice</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expectClassSet(container.querySelector('thead tr') as HTMLElement, {
      excludes: [...STRIPE_CLASSES, ...HOVER_CLASSES],
    });
  });

  it('lets consumer xstyle merge on top of the row surface', () => {
    const custom = stylex.create({raised: {zIndex: 2}});
    const {container} = renderBodyRow(
      {isStriped: true},
      {xstyle: [custom.raised]},
    );
    const row = firstBodyRow(container);
    expectClassSet(row, {includes: STRIPE_CLASSES});
    for (const token of (stylex.props(custom.raised).className ?? '')
      .split(/\s+/)
      .filter(Boolean)) {
      expect(row).toHaveClass(token);
    }
  });

  it('forwards the ref to the tr element', () => {
    const ref = vi.fn();
    renderStandalone(
      <TableRow ref={ref}>
        <TableCell>Alice</TableCell>
      </TableRow>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLTableRowElement));
  });

  it('spreads html attributes onto the tr', () => {
    const {container} = renderBodyRow(
      {},
      {id: 'row-alice', 'aria-selected': true, 'data-row-key': 'alice'},
    );
    const row = firstBodyRow(container);
    expect(row.id).toBe('row-alice');
    expect(row).toHaveAttribute('aria-selected', 'true');
    expect(row).toHaveAttribute('data-row-key', 'alice');
  });

  it('keeps a consumer className and style alongside the astryx class', () => {
    const {container} = renderBodyRow(
      {},
      {className: 'custom-row', style: {opacity: 0.5}},
    );
    const row = firstBodyRow(container);
    expect(row).toHaveClass('astryx-table-row');
    expect(row).toHaveClass('custom-row');
    expect(row.style.opacity).toBe('0.5');
  });
});
