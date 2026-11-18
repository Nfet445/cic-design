// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TreeListBranches.tsx
 * @input Uses React and theme tokens
 * @output Exports TreeListBranches component (internal)
 * @position Presentational component for tree connector lines; consumed by TreeListItem.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TreeList/TreeListItem.tsx
 * - /packages/cli/assets/templates/blocks/components/TreeList/ (showcase blocks)
 */

import type {CSSProperties} from 'react';
import {spacingVarNames} from '../theme/tokenVars';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';
import {tw} from '../utils/tw';
import {treeListBranchesClassName} from './treeListBranchesClasses';

const GUIDE_COLUMN_WIDTH = spacingVarNames['--spacing-5'];

/**
 * The guide owns its alignment to the chevron column. Its 20px container starts
 * where centering it on the natural 16px chevron leaves it after the row's 8px
 * inline padding: 8px + 16px / 2 - 20px / 2 = 6px.
 */
const GUIDE_COLUMN_START = `calc(${spacingVarNames['--spacing-2']} + ${spacingVarNames['--spacing-4']} / 2 - ${GUIDE_COLUMN_WIDTH} / 2)`;

/** Per-level indent width. Reads the public, themeable `--tree-list-indent`
 * lever set on the tree-list root (default `--spacing-4`, 16px), so the guide
 * lines stay aligned with the row indent when a theme retunes the step. */
const LEVEL_INDENT = 'var(--tree-list-indent)';

/** The column's start offset is the row's to know, so the row publishes it. */
type BranchOffsetStyle = CSSProperties &
  Record<'--astryx-tree-list-branch-offset', string>;

const branchOffsetStyle = (offset: string): BranchOffsetStyle => ({
  '--astryx-tree-list-branch-offset': offset,
});

// =============================================================================
// Types
// =============================================================================

interface TreeListBranchesProps {
  ancestorsIsLast: ReadonlyArray<boolean>;
  isLast: boolean;
  nestedLevel: number;
}

// =============================================================================
// Components
// =============================================================================

/**
 * Renders vertical lines showing parent-child relationships in the tree.
 * Each line spans its own row. An expanded row's children draw the lines
 * beside them, so the lines show and hide with its group.
 *
 * The line element carries the stable `astryx-tree-list-guide` theme target so a
 * theme can recolor or hide the connectors via `defineTheme` (e.g.
 * `backgroundColor` or `display: 'none'`) instead of hiding the built-in guides
 * and reimplementing them.
 */
export function TreeListBranches({
  ancestorsIsLast,
  isLast,
  nestedLevel,
}: TreeListBranchesProps) {
  return (
    <>
      {ancestorsIsLast.map((_, level) => {
        const branchOffset = `calc(${GUIDE_COLUMN_START} + ${level} * ${LEVEL_INDENT})`;
        // A column holds the connector of the ancestor one level deeper, so
        // its line runs past this row while that ancestor has a sibling
        // below. The current item's own connector column (nestedLevel - 1)
        // is rendered below with its terminus or continuation style.
        const continues =
          level < nestedLevel - 1 && !ancestorsIsLast[level + 1];
        return (
          continues && (
            <div
              // eslint-disable-next-line @eslint-react/no-array-index-key -- tree branch levels are fixed positional connectors
              key={level}
              className={treeListBranchesClassName.container}
              style={branchOffsetStyle(branchOffset)}>
              <div
                {...mergeProps(
                  themeProps('tree-list-guide'),
                  tw(
                    treeListBranchesClassName.verticalLine,
                    treeListBranchesClassName.verticalFull,
                  ),
                )}
              />
            </div>
          )
        );
      })}
      {nestedLevel > 0 && (
        <div
          className={treeListBranchesClassName.container}
          style={branchOffsetStyle(
            `calc(${GUIDE_COLUMN_START} + ${nestedLevel - 1} * ${LEVEL_INDENT})`,
          )}>
          <div
            {...mergeProps(
              themeProps('tree-list-guide'),
              // The last item in a group has no sibling below, so its connector
              // is clamped to the row box's bottom edge (verticalLast) instead
              // of bridging into the inter-row gap — no overhang into empty
              // space. Every other row bridges the gap (verticalFull) so the
              // line stays continuous down to the next sibling.
              tw(
                treeListBranchesClassName.verticalLine,
                isLast
                  ? treeListBranchesClassName.verticalLast
                  : treeListBranchesClassName.verticalFull,
              ),
            )}
          />
        </div>
      )}
    </>
  );
}

TreeListBranches.displayName = 'TreeListBranches';
