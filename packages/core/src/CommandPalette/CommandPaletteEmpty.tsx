// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandPaletteEmpty.tsx
 * @input Uses React, the class map
 * @output Exports CommandPaletteEmpty component
 * @position Sub-component; empty state shown when there are no items to display
 *
 * SYNC: When modified, update:
 * - /packages/cli/assets/templates/blocks/components/CommandPalette/ (showcase blocks)
 */

'use client';

import React, {type ReactNode} from 'react';
import {mergeProps} from '../utils';
import {tw} from '../utils/tw';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';
import {xstyleProps} from '../utils/xstyle';
import {commandPaletteEmptyClassName} from './commandPaletteEmptyClasses';

export interface CommandPaletteEmptyProps extends BaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  /** The message or content to display. */
  children: ReactNode;
}

/**
 * Empty state for the command palette list area.
 *
 * Rendered automatically by CommandPalette in two situations:
 * - `emptyBootstrapText`: no search term and bootstrap() returns nothing
 * - `emptySearchText`: a search query returned no results
 *
 * Can also be composed as a standalone empty result surface. Render actionable
 * empty content outside listbox and option semantics.
 *
 * @example
 * ```
 * <CommandPalette
 *   emptyBootstrapText="Start typing to search"
 *   emptySearchText="No results found"
 *   searchSource={source}
 * />
 * ```
 */
export function CommandPaletteEmpty({
  ref,
  children,
  xstyle,
  className,
  style,
  ...props
}: CommandPaletteEmptyProps) {
  return (
    <div
      ref={ref}
      {...mergeProps(
        themeProps('command-palette-empty'),
        xstyleProps(xstyle),
        tw(commandPaletteEmptyClassName, className),
        style,
      )}
      {...props}>
      {children}
    </div>
  );
}

CommandPaletteEmpty.displayName = 'CommandPaletteEmpty';
