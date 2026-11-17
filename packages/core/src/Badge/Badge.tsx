// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Badge.tsx
 * @input Uses React, HTMLAttributes, the badge class map, and stylex for the
 *   consumer's `xstyle`
 * @output Exports Badge component, BadgeProps, BadgeVariant types
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Badge/Badge.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Badge/Badge.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Badge/index.ts (exports if types change)
 * - /apps/storybook/stories/Badge.stories.tsx (storybook stories)
 * - /packages/cli/assets/templates/blocks/components/Badge/ (showcase blocks)
 */

import type {ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import * as stylex from '@stylexjs/stylex';
import {
  badgeClassName,
  badgeGrowsClassName,
  badgeLabelClassName,
  badgeVariantClassName,
} from './badgeClasses';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';
import {isRenderable} from '../utils/isRenderable';
import {textDirectionProps} from '../utils/textDirection';
import {tw} from '../utils/tw';
import type {BadgeVariantMap} from './index';

/**
 * Badge variant type derived from BadgeVariantMap.
 * Extensible via module augmentation of BadgeVariantMap.
 */
export type BadgeVariant = keyof BadgeVariantMap;

export interface BadgeProps extends BaseProps<HTMLSpanElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLSpanElement>;
  /**
   * The visual style variant of the badge.
   * @default 'neutral'
   */
  variant?: BadgeVariant;
  /**
   * The badge label text.
   */
  label: ReactNode;

  /**
   * Optional icon to display before the label.
   */
  icon?: ReactNode;
}

/**
 * A badge component for displaying status indicators, counts, or labels.
 *
 * Styles are Tailwind utilities over Astryx theme tokens.
 * Wrap your app in <Theme> to apply a theme.
 *
 * @example
 * ```
 * <Badge label="Active" />
 * <Badge variant="success" label="Active" />
 * <Badge variant="error" label="3" />
 * <Badge variant="purple" label="Engineering" />
 * ```
 */
export function Badge({
  variant = 'neutral',
  label,
  icon,
  xstyle,
  className,
  style,
  ref,
  ...props
}: BadgeProps) {
  // Clipping a label makes its tail unrecoverable, so the full text has to
  // stay reachable somewhere. `title` is the half of that answer which costs
  // nothing: no measurement, no hook, so `Badge` renders the same on the
  // server and stays usable in a server component. It follows the shape
  // `BaseTable` already uses for a truncated header cell (BaseTable.tsx) —
  // string content only, and only when there is something to show.
  //
  // A rich label is left alone: it is a subtree whose text would have to be
  // flattened to a string, and flattening renders a guess — an icon, a
  // `<strong>`, a nested element all read differently.
  //
  // It is set whether or not the label actually fits, because knowing that
  // requires measuring. The refinement — a tooltip only when the text is
  // really cut, reachable by hover and by focus — needs that measurement and
  // a client component, so it is tracked in #5585.
  const labelTitle =
    typeof label === 'number'
      ? String(label)
      : typeof label === 'string' && label.length > 0
        ? label
        : undefined;
  // Whether the label renders anything, which is when the badge grows with it.
  const hasLabel = isRenderable(label);

  return (
    <span
      ref={ref}
      {...mergeProps(
        themeProps('badge', {variant}),
        {
          className: tw(
            badgeClassName,
            hasLabel && badgeGrowsClassName,
            badgeVariantClassName[variant],
            xstyle && stylex.props(xstyle).className,
          ),
        },
        className,
        style,
      )}
      title={labelTitle}
      {...props}>
      {icon}
      <span {...textDirectionProps(label)} className={badgeLabelClassName}>
        {label}
      </span>
    </span>
  );
}

Badge.displayName = 'Badge';
