// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file radioListItemClasses.ts
 * @input The control's size and whether the item is disabled
 * @output The wrapper, press overlay, native input, indicator slot and the
 *   row's bare default look
 * @position Internal to RadioListItem; the Tailwind build scans it for class
 *   names
 *
 * The row's bare default look names the row class twice, so it outranks the
 * padding and radius Item sets as utilities in the same layer.
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from '../utils/tw';

/**
 * The row's default appearance is a bare surface: no density padding, no
 * radius, and no full-row background — only the indicator tints on hover (via
 * `indicatorScopeProps`). `min-w-0` preserves label truncation now that the
 * Item is the row's flex child. Each declaration names `astryx-radio-list-item`
 * a second time, because Item's own padding, radius and fill utilities sit in
 * the same layer.
 */
export const radioListItemRowClassName = tw(
  '[&.astryx-radio-list-item]:p-0',
  '[&.astryx-radio-list-item]:rounded-none',
  '[&.astryx-radio-list-item]:min-w-0',
  '[&.astryx-radio-list-item]:bg-transparent',
);

/** Wrapper and input share the control's box; each size states both edges. */
const SIZE: Record<'sm' | 'md', string> = {
  sm: 'size-5',
  md: 'size-6',
};

/** The row's press target, holding only the indicator. */
export function radioListItemWrapperClassName({
  size,
}: {
  size: 'sm' | 'md';
}): string {
  return tw(
    'relative isolate flex shrink-0 items-center justify-center',
    SIZE[size],
  );
}

/**
 * The press paint the controller leaves to the row: the row declares it on
 * itself and this layer over the circle reads it. `--_radio-row-press` is a
 * private inherited value, not a theme hook.
 */
export const radioListItemPressOverlayClassName = tw(
  'after:pointer-events-none after:absolute after:inset-0 after:rounded-full',
  "after:content-['']",
  'after:bg-[var(--_radio-row-press,transparent)]',
);

/**
 * The radio stays out of sight over the circle. A disabled one answers with a
 * default cursor whether it carries the native attribute or the focusable
 * `aria-disabled`; the variants state that once, so no second utility has to
 * beat the base one by sheet order.
 */
export function radioListItemInputClassName({
  size,
}: {
  size: 'sm' | 'md';
}): string {
  return tw(
    'absolute top-1/2 z-[1] m-0 cursor-pointer p-0 opacity-0',
    'disabled:cursor-default aria-disabled:cursor-default',
    'pointer-coarse:min-h-6 pointer-coarse:min-w-6',
    SIZE[size],
  );
}

/** Holds only the indicator, so the focus ring has one unambiguous target. */
export const radioListItemIndicatorSlotClassName = 'contents';
