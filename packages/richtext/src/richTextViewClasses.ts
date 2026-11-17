// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file richTextViewClasses.ts
 * @input Uses Tailwind utilities and Astryx design tokens
 * @output Exports the read-only view's literal class strings
 * @position Read by RichTextView.tsx
 */

import {tw} from './tw';

// The document's body text, as core Markdown and the editor set it
// (spec:AST-061 FR2). Without it, blocks the theme leaves unsized — list
// items, quotes, table cells — take the host page's font.
export const richTextViewRootClassName = tw(
  'w-full',
  // Holds the code block headers and task checkboxes drawn over the content.
  'relative',
  '[font-family:var(--font-family-body)]',
  '[font-size:var(--text-body-size)]',
  '[line-height:var(--text-body-leading)]',
  '[color:var(--color-text-primary)]',
);
