// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandPaletteGroup.tsx
 * @input Uses React, the class map
 * @output Exports CommandPaletteGroup component
 * @position Sub-component; visual grouping with heading
 *
 * SYNC: When modified, update:
 * - /packages/cli/assets/templates/blocks/components/CommandPalette/ (showcase blocks)
 */

'use client';

import type {ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import {mergeProps} from '../utils';
import {tw} from '../utils/tw';
import {themeProps} from '../utils/themeProps';
import {xstyleProps} from '../utils/xstyle';
import {
  commandPaletteGroupClassName,
  commandPaletteGroupHeadingClassName,
} from './commandPaletteGroupClasses';

export interface CommandPaletteGroupProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element. */
  ref?: React.Ref<HTMLDivElement>;
  /** Group heading text. */
  heading: string;
  /** Items within this group. */
  children: ReactNode;
}

/**
 * Visual grouping for command palette items with a heading label.
 *
 * Heading style matches DropdownMenu section headings:
 * supporting-size (12px), secondary color, no uppercase/letterSpacing.
 *
 * @compositionHint Place inside CommandPaletteList.
 *   Contains CommandPaletteItem children.
 *
 * @example
 * ```
 * <CommandPaletteGroup heading="Navigation">
 *   <CommandPaletteItem value="home" onSelect={goHome}>
 *     Home
 *   </CommandPaletteItem>
 * </CommandPaletteGroup>
 * ```
 */
export function CommandPaletteGroup({
  heading,
  children,
  ref,
  xstyle,
  className,
  style,
  ...props
}: CommandPaletteGroupProps) {
  return (
    <div
      ref={ref}
      role="group"
      aria-label={heading}
      {...mergeProps(
        themeProps('command-palette-group'),
        xstyleProps(xstyle),
        tw(commandPaletteGroupClassName, className),
        style,
      )}
      {...props}>
      <div
        aria-hidden="true"
        {...mergeProps(
          // Stable theme target for the group heading text. The root carries
          // `astryx-command-palette-group`, but the heading itself had no
          // handle, so a theme could only reach it through a fragile structural
          // selector. This adds an `astryx-command-palette-group-heading` class
          // so `defineTheme` can scope overrides (e.g. heading typography) to
          // the heading alone.
          themeProps('command-palette-group-heading'),
          {className: commandPaletteGroupHeadingClassName},
        )}>
        {heading}
      </div>
      {children}
    </div>
  );
}

CommandPaletteGroup.displayName = 'CommandPaletteGroup';
