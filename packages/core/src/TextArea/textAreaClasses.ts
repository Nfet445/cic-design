// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file textAreaClasses.ts
 * @input Uses the theme's typography, type-scale and spacing variables, and the
 *   inline padding the wrapper publishes as `--_textarea-inline-padding`
 * @output The utility class strings TextArea's wrapper, its control, its size
 *   arm and its overlays carry
 * @position Internal to TextArea; the Tailwind build scans it for class names
 *
 * The wrapper zeroes the padding the shared field box sets in `astryx-base`.
 * Two single-class rules in that layer cannot outrank each other by order, so
 * the zeroing repeats the element's own `astryx-text-area` class and wins on
 * the extra compound.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from '../utils/tw';

export type TextAreaSize = 'sm' | 'md' | 'lg';

/**
 * The bare positioning context the icons, status and counter anchor to. The
 * `<textarea>` spans the whole box and carries its own internal padding, so the
 * native resize grip stays in the true corner and the scrollbar represents the
 * full input area.
 */
export const textAreaWrapperClassName = tw(
  'z-1',
  '[&.astryx-text-area]:block',
  '[&.astryx-text-area]:py-0',
  '[&.astryx-text-area]:px-0',
  // Defined on the wrapper so the counter, a sibling overlay, inherits the same
  // inset and stays aligned with the text edge.
  '[--_textarea-inline-padding:var(--spacing-2)]',
);

const SIZE_CLASS: Record<TextAreaSize, string> = {
  sm: '',
  md: '',
  lg: 'py-2',
};

/** The block padding a size adds below the control's base `py-1`. */
export function textAreaSizeClassName(size: TextAreaSize): string {
  return SIZE_CLASS[size];
}

/**
 * The overlays are anchored to the wrapper's corners, so only one of them can
 * own the end inset: the busy arm reserves room for the spinner beside the
 * status icon, and it must replace, not add to, the plain status inset.
 */
export function textAreaClassName({
  isDisabled,
  hasStartIcon,
  hasStatusIcon,
  isBusy,
  hasCounter,
}: {
  isDisabled: boolean;
  hasStartIcon: boolean;
  hasStatusIcon: boolean;
  isBusy: boolean;
  hasCounter: boolean;
}): string {
  return tw(
    'block',
    'w-full',
    'box-border',
    'min-w-0',
    '[border-width:0]',
    '[border-style:none]',
    'py-1',
    'px-[var(--_textarea-inline-padding)]',
    '[font-family:var(--font-family-body)]',
    'text-[length:var(--text-body-size)]',
    'pointer-coarse:[@supports(-webkit-touch-callout:none)]:text-[length:max(1rem,var(--text-body-size))]',
    '[line-height:var(--text-body-leading)]',
    'text-[color:var(--color-text-primary)]',
    'bg-transparent',
    'outline-none',
    'placeholder:text-[color:var(--color-text-secondary)]',
    'resize-y',
    isDisabled && 'cursor-default',
    hasStartIcon &&
      'ps-[calc(var(--_textarea-inline-padding)_+_var(--spacing-6))]',
    isBusy && hasStatusIcon
      ? 'pe-[calc(var(--_textarea-inline-padding)_+_var(--spacing-12))]'
      : hasStatusIcon &&
          'pe-[calc(var(--_textarea-inline-padding)_+_var(--spacing-6))]',
    hasCounter && 'pb-7',
  );
}

export const textAreaStartIconClassName = tw(
  'absolute',
  'top-2',
  'start-[var(--_textarea-inline-padding)]',
  'pointer-events-none',
  'flex',
);

export const textAreaEndSlotClassName = tw(
  'absolute',
  'top-2',
  'end-[var(--_textarea-inline-padding)]',
  'pointer-events-none',
  'flex',
  'items-center',
  'gap-2',
);

/** The counter sits under the textarea on the same inline inset as the text. */
export function textAreaCounterClassName({
  isOverLimit,
}: {
  isOverLimit: boolean;
}): string {
  return tw(
    'absolute',
    'bottom-1',
    'end-[var(--_textarea-inline-padding)]',
    'pointer-events-none',
    'flex',
    'items-center',
    'gap-1',
    '[font-family:var(--font-family-body)]',
    'text-[length:var(--text-supporting-size)]',
    '[line-height:var(--text-supporting-leading)]',
    isOverLimit
      ? 'text-[color:var(--color-text-error)]'
      : 'text-[color:var(--color-text-secondary)]',
  );
}
