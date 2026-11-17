// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file dividerClasses.ts
 * @input Accepts the orientation, the variant and the full-bleed flag Divider
 *   resolves
 * @output Tailwind utility class names for the divider row, its lines and its
 *   label
 * @position Internal to Divider.
 *
 * The line picks one sizing class per orientation, so two classes here never
 * paint the same declaration. A full-bleed divider reads the container padding
 * variables with a `0px` fallback: outside a `container()` they resolve to
 * nothing and the divider keeps its ordinary width.
 */

import {tw} from '../utils/tw';
import type {DividerVariant} from './Divider';

/** The row: a flex line when horizontal, a stack when vertical. */
export const dividerClassName: Record<'horizontal' | 'vertical', string> = {
  horizontal: 'flex items-center w-full',
  vertical: 'inline-flex flex-col items-center h-full',
};

/** The rule itself, one orientation each. */
export const dividerLineClassName: Record<'horizontal' | 'vertical', string> = {
  horizontal: 'h-[length:var(--border-width)] grow shrink',
  vertical: 'w-[length:var(--border-width)] grow shrink',
};

/**
 * Line weight. An augmented variant has no entry, so the lookup is undefined,
 * `tw` drops it and the line keeps no background.
 */
export const dividerLineVariantClassName: Partial<
  Record<DividerVariant, string>
> = {
  subtle: 'bg-[color:var(--color-border)]',
  strong: 'bg-[color:var(--color-border-emphasized)]',
};

/** The label between the two lines, in supporting type. */
export const dividerLabelClassName = tw(
  'shrink-0 px-[var(--spacing-3)]',
  'text-[length:var(--text-supporting-size)] leading-[var(--text-supporting-leading)]',
  'text-[color:var(--color-text-secondary)]',
);

/** A vertical divider stacks its label, so the padding moves to the block axis. */
export const dividerVerticalLabelClassName = 'px-0 py-[var(--spacing-3)]';

/**
 * Full bleed: the negative margin cancels the nearest container's padding and
 * the size adds it back, so the line reaches both container edges.
 */
export const dividerFullBleedClassName: Record<
  'horizontal' | 'vertical',
  string
> = {
  horizontal: tw(
    'ms-[calc(-1*var(--container-padding-inline-start,0px))]',
    'me-[calc(-1*var(--container-padding-inline-end,0px))]',
    'w-[calc(100%+var(--container-padding-inline-start,0px)+var(--container-padding-inline-end,0px))]',
  ),
  vertical: tw(
    'mt-[calc(-1*var(--container-padding-block-start,0px))]',
    'mb-[calc(-1*var(--container-padding-block-end,0px))]',
    'h-[calc(100%+var(--container-padding-block-start,0px)+var(--container-padding-block-end,0px))]',
  ),
};
