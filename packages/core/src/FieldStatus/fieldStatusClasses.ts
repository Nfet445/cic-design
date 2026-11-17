// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file fieldStatusClasses.ts
 * @input The status type and the variant the caller asked for
 * @output The message box, its two placements, the detached content row and
 *   glyph, and the three status fills
 * @position Internal to FieldStatus; the Tailwind build scans it for class
 *   names
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from '../utils/tw';
import type {InputStatusType} from '../Field/types';

/**
 * The message box. Forced colors replace a status fill with Canvas, so an
 * outline keeps the fill's shape visible there. A validation message often
 * echoes the value that failed (an address, a URL), so an unbroken token wraps
 * inside the field instead of painting past its edges (WCAG 2.2 SC 1.4.10
 * Reflow); text inside keeps the same wrap through its own property.
 */
export const fieldStatusBaseClassName = tw(
  'forced-colors:outline-[1px] forced-colors:outline-solid',
  'forced-colors:outline-[color:CanvasText] forced-colors:[outline-offset:-1px]',
  'font-[family-name:var(--font-family-body)]',
  'text-[length:var(--text-supporting-size)]',
  'leading-[var(--text-supporting-leading)]',
  '[overflow-wrap:anywhere] [--_astryx-text-overflow-wrap:anywhere]',
);

/**
 * The message under the border of the field above it. The overlap is visual
 * only: pointer input reaches the control beneath instead of the later-painted
 * box stealing the click.
 */
export const fieldStatusAttachedClassName = tw(
  '[margin-top:calc(-1*var(--_field-status-overlap,var(--spacing-1-5)))]',
  '[padding-block-start:calc(var(--_field-status-overlap,var(--spacing-1-5))+var(--spacing-2))]',
  'px-2 pb-2',
  'rounded-es-[var(--radius-element)] rounded-ee-[var(--radius-element)]',
  'pointer-events-none',
);

/** The free-standing message under a control that draws no border. */
export const fieldStatusDetachedClassName = 'mt-1 rounded-md p-2';

/** The detached message's content row: glyph, then the wrapping text. */
export const fieldStatusDetachedContentClassName = 'flex items-start gap-1';

/**
 * The leading glyph. Its height is one line box of the message text, so it
 * aligns to the first line when the message wraps rather than to the row top.
 */
export const fieldStatusDetachedIconClassName =
  'inline-flex h-[calc(var(--text-supporting-size)*var(--text-supporting-leading))] shrink-0 items-center';

/** The status fill and its on-muted foreground. */
export const fieldStatusColorClassName: Record<InputStatusType, string> = {
  warning:
    'bg-[color:var(--color-warning-muted)] text-[color:var(--color-on-warning-muted)]',
  error:
    'bg-[color:var(--color-error-muted)] text-[color:var(--color-on-error-muted)]',
  success:
    'bg-[color:var(--color-success-muted)] text-[color:var(--color-on-success-muted)]',
};
