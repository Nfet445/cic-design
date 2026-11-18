// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Regression coverage for the floating bulk-actions Table block.
 * @input The shipped TableFloatingBulkActionsTable source.
 * @output Assertions for width, logical scrolling, local stacking, and shared toolbar geometry.
 * @position Template contract test for the website example layout.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

const sourcePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../assets/templates/blocks/components/Table/TableFloatingBulkActionsTable.tsx',
);
const source = fs.readFileSync(sourcePath, 'utf8');
/** The class string a key of the block's one class map carries. */
const classesOf = name =>
  source.match(new RegExp(`${name}:\\s*'([^']*)'`))?.[1];
const pageClasses = classesOf('page');
const tableRegionClasses = classesOf('tableRegion');
const toolbarClasses = classesOf('toolbar');
const columns = source.match(
  /const columns:[\s\S]*?=\s*\[([\s\S]*?)\n\];/,
)?.[1];

describe('Table floating bulk-actions template', () => {
  it('caps the demo height without capping its width', () => {
    expect(pageClasses).toContain('max-h-[640px]');
    expect(pageClasses).not.toContain('max-w');
    expect(pageClasses).not.toContain('mx-');
  });

  it('uses the shared logical-axis scroll behavior', () => {
    expect(source).toContain(
      "import {ScrollableArea} from '@astryxdesign/core/ScrollableArea'",
    );
    expect(source).toMatch(
      /<ScrollableArea[\s\S]*?axis="block"[\s\S]*?label="Bulk actions example"[\s\S]*?overscroll="contain"/,
    );
    expect(source).not.toContain('role="region"');
    expect(source).not.toContain('tabIndex={0}');
    expect(source).not.toContain('aria-label="Metrics"');
    expect(pageClasses).not.toContain('overflow');
    expect(pageClasses).not.toContain('overscroll');
  });

  it('keeps the floating toolbar inside an isolated local stacking context', () => {
    expect(pageClasses).toContain('isolate');
    expect(toolbarClasses).toContain('z-[1]');
    expect(toolbarClasses).not.toContain('z-20');
  });

  it('shares one reserved-space variable across the placement geometry', () => {
    expect(tableRegionClasses).toContain('--table-bulk-actions-space');
    expect(source.match(/var\(--table-bulk-actions-space\)/g)).toHaveLength(4);
  });

  it('keeps the email column compact enough to avoid horizontal overflow', () => {
    expect(columns).toContain(
      "{key: 'email', header: 'Email', width: proportional(1)}",
    );
  });
});
