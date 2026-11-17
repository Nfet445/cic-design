// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file codeBlockHeaderClasses.ts
 * @input Uses Tailwind utilities and Astryx design tokens
 * @output Exports the class strings CodeBlockHeaderPlugin draws over a code
 *   block: the header row, the corner button box, and the labels
 * @position Read by internal/CodeBlockHeaderPlugin.tsx
 */

import {tw} from './tw';

// Core CodeBlock's compact header row: 8px above and below a small control,
// 16px at the sides.
export const codeBlockHeaderRowClassName = tw(
  'absolute',
  'flex',
  'items-center',
  'justify-between',
  '[padding-block:var(--spacing-2)]',
  '[padding-inline:var(--spacing-4)]',
  '[box-sizing:border-box]',
);

// No language: the copy button alone, 8px from the top end corner.
export const codeBlockHeaderCornerClassName = tw(
  'absolute',
  'flex',
  'justify-end',
  '[padding:var(--spacing-2)]',
  '[box-sizing:border-box]',
  'pointer-events-none',
);

export const codeBlockHeaderCornerButtonClassName = '[pointer-events:auto]';

export const codeBlockHeaderTitleClassName = tw(
  '[font-size:var(--text-supporting-size)]',
  '[font-family:var(--font-family-code)]',
  '[font-weight:var(--font-weight-medium)]',
  '[line-height:var(--text-supporting-leading)]',
  '[color:var(--color-syntax-comment)]',
  'min-w-0',
  'overflow-hidden',
  'text-ellipsis',
  'whitespace-nowrap',
);

export const codeBlockHeaderCopyButtonClassName =
  '[color:var(--color-syntax-comment)]';
