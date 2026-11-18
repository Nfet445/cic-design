// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file fileInputClasses.ts
 * @input Uses the theme's color, spacing, radius, size, type-scale, duration
 *   and ease variables, and the input status type
 * @output The utility class strings FileInput's container, its text lines and
 *   its visually hidden trigger carry
 * @position Internal to FileInput; the Tailwind build scans it for class names
 *
 * FileInput draws its own box instead of composing the shared input wrapper, so
 * its hover, focus, disabled and status arms can all live in the sheet: no
 * unlayered StyleX declaration competes with them.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import type {InputStatusType} from '../Field/types';
import {tw} from '../utils/tw';

const STATUS_BORDER_CLASS: Record<InputStatusType, string> = {
  warning: 'border-[color:var(--color-border-warning)]',
  error: 'border-[color:var(--color-border-error)]',
  success: 'border-[color:var(--color-border-success)]',
};

// Hover is a fine-pointer affordance: the inset ring only exists where a
// pointer can hover, and never while the box is focused or unavailable.
// The inset ring exists only under a fine pointer, and never while the box is
// focused or disabled. Each ring is a whole class string: a class the source
// only assembles from a prefix would never reach the sheet.
const DROPZONE_HOVER_RING =
  'pointer-fine:not-disabled:not-focus-within:hover:shadow-[inset_0_0_0_2px_color-mix(in_srgb,var(--color-accent)_20%,transparent)]';
const COMPACT_HOVER_RING =
  'pointer-fine:not-disabled:not-focus-within:hover:shadow-[inset_0_0_0_2px_color-mix(in_srgb,var(--color-border-emphasized)_30%,transparent)]';
const DISABLED_SELECTOR = '[&:is(:disabled,[aria-disabled=true])]';

const TEXT_CLASS = tw(
  '[font-family:var(--font-family-body)]',
  'text-[length:var(--text-body-size)]',
  'pointer-coarse:[@supports(-webkit-touch-callout:none)]:text-[length:max(1rem,var(--text-body-size))]',
  '[line-height:var(--text-body-leading)]',
);

/**
 * The box the whole control paints. A drag over the dropzone repaints the
 * border and the surface, so it replaces the status border rather than adding
 * to it: one class owns `border-color` at a time, and only `:focus-within`
 * outranks it.
 */
export function fileInputBoxClassName({
  isDropzone,
  isSelectionDisabled,
  isDragOver,
  isDisabled,
  isBusy,
  status,
}: {
  isDropzone: boolean;
  isSelectionDisabled: boolean;
  isDragOver: boolean;
  isDisabled: boolean;
  isBusy: boolean;
  status: InputStatusType | null;
}): string {
  const active = isDropzone && !isSelectionDisabled && isDragOver;
  return tw(
    'box-border',
    'relative',
    '[z-index:1]',
    'flex',
    isDropzone ? 'flex-col' : 'items-center',
    isDropzone && 'items-center justify-center gap-2 py-6 px-4',
    !isDropzone && 'gap-2 py-1 px-2 [height:var(--size-element-md)]',
    isDropzone ? 'border-dashed' : 'border-solid',
    '[border-width:var(--border-width)]',
    active
      ? 'border-[color:var(--color-accent)] bg-[color:var(--color-accent-muted)]'
      : tw(
          status != null
            ? STATUS_BORDER_CLASS[status]
            : 'border-[color:var(--color-border-emphasized)]',
          'bg-[color:var(--color-background-surface)]',
          'focus-within:border-[color:var(--color-accent)]',
        ),
    'rounded-[var(--radius-element)]',
    '[transition-property:border-color,box-shadow,background-color]',
    '[transition-duration:var(--duration-fast)]',
    'motion-reduce:[transition-duration:0s]',
    '[transition-timing-function:var(--ease-standard)]',
    isDropzone ? DROPZONE_HOVER_RING : COMPACT_HOVER_RING,
    'cursor-pointer',
    '[&:is(:disabled,[aria-disabled=true])]:cursor-default',
    isDisabled && 'opacity-50',
    isBusy && 'cursor-default shadow-none',
    'outline-none',
  );
}

/** The line of text a dropzone centers, or a compact box truncates. */
export function fileInputTextClassName({
  kind,
  isCompact,
  wraps,
}: {
  kind: 'placeholder' | 'fileName';
  isCompact: boolean;
  wraps: boolean;
}): string {
  return tw(
    TEXT_CLASS,
    kind === 'placeholder' &&
      tw(
        'text-[color:var(--color-text-secondary)]',
        isCompact ? 'text-start' : 'text-center',
      ),
    kind === 'fileName' &&
      tw(
        'text-[color:var(--color-text-primary)]',
        'flex-1',
        'min-w-0',
        wraps
          ? tw('text-center', '[white-space:normal]')
          : tw('overflow-hidden', 'text-ellipsis', 'whitespace-nowrap'),
      ),
  );
}

/** The real trigger is a 1px visually hidden button. */
export const fileInputHiddenInputClassName = tw(
  'absolute',
  '[width:1px]',
  '[height:1px]',
  'p-0',
  '[margin:-1px]',
  'overflow-hidden',
  '[clip:rect(0,0,0,0)]',
  'whitespace-nowrap',
  '[border-width:0]',
);
