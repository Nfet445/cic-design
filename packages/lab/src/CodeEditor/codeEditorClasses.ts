// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file codeEditorClasses.ts
 * @input Accepts nothing: every class is fixed except the size record
 * @output The utility class strings the frame, gutter, code surface and
 *   placeholder carry, plus the two size variants
 * @position Style primitives; the Tailwind build scans it for class names
 *
 * The focused frame is one complete class rather than a second border-color:
 * two classes setting `border-color` are ordered by the sheet, not by the
 * class attribute, so the accent border would lose to the base one at random.
 */

import {tw} from '../tw';

export const codeEditorClassName = tw(
  'relative flex overflow-hidden',
  'rounded-[var(--radius-element)] bg-[color:var(--color-background-muted)]',
  '[border-width:var(--border-width)] border-solid border-[color:var(--color-border)]',
);

/** The base frame plus the accent border and its one-pixel ring. */
export const codeEditorFocusedClassName = tw(
  codeEditorClassName,
  'border-[color:var(--color-accent)]',
  'shadow-[0_0_0_1px_var(--color-accent)]',
);

export const codeEditorScrollerClassName = tw(
  'flex flex-1 overflow-auto',
  'max-h-[var(--astryx-code-editor-max-height,none)]',
);

export const codeEditorGutterClassName = tw(
  'shrink-0 select-none text-end py-3 ps-4 pe-3',
  'text-[color:var(--color-text-disabled)]',
  '[border-inline-end-width:var(--border-width)] [border-inline-end-style:solid]',
  '[border-inline-end-color:var(--color-border)]',
);

export const codeEditorGutterLineClassName =
  'font-mono leading-[var(--text-code-leading)]';

export const codeEditorTextBlockClassName = 'relative flex-1';

export const codeEditorCodeClassName = tw(
  'block min-h-[3em] m-0 py-3 px-4 whitespace-pre',
  '[overflow-wrap:normal] [word-break:normal] [tab-size:2]',
  'font-mono leading-[var(--text-code-leading)] outline-none',
  'text-[color:var(--color-text-primary)]',
  'caret-[color:var(--color-text-primary)]',
);

export const codeEditorPlaceholderClassName = tw(
  'absolute top-[var(--spacing-3)] left-[var(--spacing-4)] pointer-events-none select-none',
  'font-mono leading-[var(--text-code-leading)]',
  'text-[color:var(--color-text-disabled)]',
);

export const codeEditorSizeClassNames = {
  sm: 'text-[length:var(--font-size-sm)]',
  md: 'text-[length:var(--font-size-base)]',
} as const;
