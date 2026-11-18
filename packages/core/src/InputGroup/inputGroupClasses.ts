// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file inputGroupClasses.ts
 * @input The group's size and disabled state
 * @output Tailwind utility class names for the group row and its text cell
 * @position Internal to InputGroup; the Tailwind build scans it for class names
 *
 * A wrapper that keeps its own StyleX rules still wins over these classes,
 * because an unlayered declaration outranks a class in `astryx-base`.
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
 * A member of the group row: an input wrapper, a Button addon or a text cell.
 * Its inline-start edge overlaps the neighbour's border, only the row's first
 * and last members keep the outer corners, and a focused member rises above
 * its neighbour so an unfocused one cannot cover its focus ring.
 */
export const inputGroupMemberClassName = tw(
  'flex-1 min-w-0 h-full',
  'ms-[calc(-1*var(--border-width))] first:ms-0',
  'rounded-ss-none rounded-es-none rounded-se-none rounded-ee-none',
  'first:rounded-ss-[var(--radius-element)] first:rounded-es-[var(--radius-element)]',
  '[:nth-last-child(1_of_:not([popover]):not(template):not(dialog))]:rounded-se-[var(--radius-element)]',
  '[:nth-last-child(1_of_:not([popover]):not(template):not(dialog))]:rounded-ee-[var(--radius-element)]',
  'focus-within:z-2',
);

/**
 * A Button that sits directly in the group row. It runs the row's full height
 * and squares the corners it shares with a neighbour: the leading edge when it
 * is not the row's first member, the trailing edge when a member follows it.
 * Its keyboard ring rises above the shared edge.
 *
 * Only a direct child adapts, so a Button a member renders internally keeps
 * its own geometry.
 */
/* eslint-disable @astryx/no-raw-private-attribute -- Tailwind scans class text,
   so the group marker has to be spelled literally; its owner module cannot
   supply it through interpolation. */
export const inputGroupButtonAddonClassName = tw(
  '[:where(.astryx-input-group>[data-astryx-input-group-item])]:h-full',
  '[:where(.astryx-input-group>[data-astryx-input-group-item]):not(:first-child)]:rounded-ss-none',
  '[:where(.astryx-input-group>[data-astryx-input-group-item]):not(:first-child)]:rounded-es-none',
  '[:where(.astryx-input-group>[data-astryx-input-group-item]):nth-last-child(1_of_:not([popover]):not(template):not(dialog))]:rounded-se-none',
  '[:where(.astryx-input-group>[data-astryx-input-group-item]):nth-last-child(1_of_:not([popover]):not(template):not(dialog))]:rounded-ee-none',
  '[:where(.astryx-input-group>[data-astryx-input-group-item]):focus-visible]:z-2',
);
/* eslint-enable @astryx/no-raw-private-attribute */

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
