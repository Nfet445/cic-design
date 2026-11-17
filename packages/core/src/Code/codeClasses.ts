// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file codeClasses.ts
 * @input Accepts the code color and whether it adopts the surrounding type
 * @output Tailwind utility class names for inline code
 * @position Internal to Code.
 */

import {tw} from '../utils/tw';
import type {CodeColor} from './Code';

/** Monospace, muted, and free to break rather than widening its parent. */
export const codeClassName = tw(
  '[font-family:var(--font-family-code)]',
  'text-[length:var(--text-code-size)] leading-[inherit]',
  'bg-[color:var(--color-background-muted)]',
  'px-[var(--spacing-1)] py-0',
  'rounded-[var(--radius-inner)]',
  '[overflow-wrap:break-word] [word-break:break-word]',
);

export const codeColorClassName: Record<CodeColor, string> = {
  primary: 'text-[color:var(--color-text-primary)]',
  secondary: 'text-[color:var(--color-text-secondary)]',
  inherit: '[color:inherit]',
};

/**
 * Adopt the surrounding text's font-size and line-height, for inline code that
 * should match differently-sized text around it.
 */
export const codeInheritSizeClassName =
  'text-[length:inherit] leading-[inherit]';
