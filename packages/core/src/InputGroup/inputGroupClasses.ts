// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file inputGroupClasses.ts
 * @input The group's size and disabled state
 * @output Tailwind utility class names for the group row and its text cell
 * @position Internal to InputGroup; the Tailwind build scans it for class names
 *
 * `groupStyles.ts` stays StyleX: Tokenizer still styles the same row through
 * StyleX, so a layered class would lose where that rule wins today.
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import type {InputGroupSize} from './InputGroup';
import {tw} from '../utils/tw';

/** The group row; its children sit in one stretch-aligned line. */
export const inputGroupClassName = 'inline-flex items-stretch bg-transparent';

export const inputGroupDisabledClassName = 'cursor-default opacity-50';

export const inputGroupSizeClassName: Record<InputGroupSize, string> = {
  sm: 'h-[var(--size-element-sm)]',
  md: 'h-[var(--size-element-md)]',
  lg: 'h-[var(--size-element-lg)]',
};

/**
 * The prefix or suffix cell. Its inline-start edge overlaps the neighbour's
 * border, and only the row's first and last cells keep the outer corners.
 */
export const inputGroupTextClassName = tw(
  'flex items-center shrink-0 whitespace-nowrap',
  'px-[var(--spacing-2)]',
  'bg-[var(--color-background-muted)]',
  '[font-family:var(--font-family-body)]',
  '[font-size:var(--text-body-size)] [line-height:var(--text-body-leading)]',
  'text-[color:var(--color-text-secondary)]',
  '[unicode-bidi:isolate]',
  '[border-width:var(--border-width)] border-solid border-[color:var(--color-border-emphasized)]',
  'ms-[calc(-1*var(--border-width))] first:ms-0',
  'rounded-ss-none rounded-es-none rounded-se-none rounded-ee-none',
  'first:rounded-ss-[var(--radius-element)] first:rounded-es-[var(--radius-element)]',
  'last:rounded-se-[var(--radius-element)] last:rounded-ee-[var(--radius-element)]',
);
