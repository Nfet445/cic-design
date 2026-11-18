// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file panelSearchInputClasses.ts
 * @input The keyboard-focus gate the component tracks in state
 * @output The search row's gutter, its field box, the keyboard focus ring, the
 *   magnifier slot and the bare input
 * @position Internal to PanelSearchInput; the Tailwind build scans it for
 *   class names
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from '../utils/tw';

/**
 * Gutter only. Matches the option list's own padding so the field below lines
 * up with the option rows rather than with the panel edge.
 */
export const panelSearchInputWrapperClassName = tw(
  'py-[var(--spacing-1)] px-[var(--spacing-1)]',
);

/**
 * The borderless field of a dropdown's search row: the box an option row
 * draws, without a border or a fill. Focus rings this, not the full-width row.
 */
export const panelSearchInputFieldClassName = tw(
  'box-border flex w-full items-center gap-2',
  'py-[var(--spacing-1-5)] px-2',
  'rounded-[var(--radius-element)]',
  'transition-[box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
  'motion-reduce:duration-0',
);

/**
 * The same row with the shared field box. The box owns the inset, the gap, the
 * curve and the transition, so the row adds its width alone: a second padding
 * or gap here would compete with the box's, and the sheet order would decide.
 */
export const panelSearchInputBoxedFieldClassName = 'w-full';

/**
 * The focus ring, applied only while focus was taken by keyboard. The
 * `:has(input:focus-visible)` condition stays the browser's own heuristic; it
 * narrows to the text input, so tabbing onto the clear button does not re-ring
 * the field.
 *
 * Inset, not the shared 3px-offset outline: the field is inset a few pixels
 * from the panel edge, where an outline would land on the panel's border and
 * the divider.
 */
export const panelSearchInputKeyboardFocusClassName =
  'has-[input:focus-visible]:shadow-[inset_0_0_0_2px_var(--color-accent)]';

/** The magnifier needs explicit flex centering to avoid a line-height offset. */
export const panelSearchInputIconClassName = 'flex shrink-0 items-center';

/**
 * The bare input. The field draws the focus ring, so this one draws none. Its
 * size matches the option rows below it; the iOS floor keeps the page from
 * zooming on focus, keyed to iOS alone, since only iOS WebKit implements
 * `-webkit-touch-callout`.
 */
export const panelSearchInputInputClassName = tw(
  'm-0 min-w-0 grow shrink basis-0 border-0 bg-transparent p-0 outline-none',
  'text-[color:var(--color-text-primary)]',
  'font-[family-name:var(--font-family-body)]',
  'text-[length:var(--text-label-size)] leading-[var(--text-label-leading)]',
  'pointer-coarse:[@supports(-webkit-touch-callout:none)]:text-[length:max(1rem,var(--text-label-size))]',
  'placeholder:text-[color:var(--color-text-secondary)]',
);
