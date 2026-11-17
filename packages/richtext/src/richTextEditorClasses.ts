// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file richTextEditorClasses.ts
 * @input Uses Tailwind utilities and Astryx design tokens
 * @output Exports the editor surface's literal class strings, and the variable
 *   that carries a caller's minimum body height
 * @position Read by RichTextEditor.tsx; the classes decide the editor's frame,
 *   body inset, and placeholder position
 */

import {tw} from './tw';

/** Carries the caller's `minHeight` to the editable body. */
export const RICH_TEXT_BODY_MIN_HEIGHT_VARIABLE =
  '--astryx-richtext-body-min-height';

// A new container boundary, so Toolbar's Section does not inherit padding from
// an ancestor Section outside the editor field.
export const richTextEditorWrapperClassName = tw(
  '[--container-padding-inline-start:0px]',
  '[--container-padding-inline-end:0px]',
  '[--container-padding-block-start:0px]',
  '[--container-padding-block-end:0px]',
  '[flex-direction:column]',
  '[align-items:stretch]',
  '[gap:0]',
  '[padding-block:0]',
  '[padding-inline:0]',
  '[min-height:auto]',
);

export const richTextEditorBodyClassName = tw(
  'relative',
  '[box-sizing:border-box]',
  'w-full',
  '[padding-block:var(--spacing-1)]',
  '[padding-inline:var(--spacing-2)]',
  '[min-height:var(--astryx-richtext-body-min-height)]',
);

export const richTextEditorBodyWithToolbarClassName = tw(
  '[border-top-width:1px]',
  'border-solid',
  '[border-top-color:var(--color-border)]',
);

// Reserve the same trailing space as TextArea: the normal text inset plus room
// for the 20px status icon and its gap.
export const richTextEditorBodyWithStatusClassName =
  '[padding-inline-end:calc(var(--spacing-2)_+_var(--spacing-6))]';

export const richTextEditorContentEditableClassName = tw(
  'block',
  'w-full',
  'border-0',
  '[border-style:none]',
  'p-0',
  'outline-none',
  '[color:var(--color-text-primary)]',
);

export const richTextEditorPlaceholderClassName = tw(
  'absolute',
  '[top:0]',
  '[inset-inline-start:0]',
  'pointer-events-none',
  'select-none',
  '[color:var(--color-text-secondary)]',
);

// ContentEditable and Lexical's sibling placeholder inherit one shared text
// style, so their leading and coarse-pointer sizing match TextInput/TextArea
// without duplicating placeholder typography. The 16px floor is iOS-only: iOS
// Safari zooms the page when a focused control sits under 16px, and only iOS
// WebKit implements -webkit-touch-callout to key the floor to it.
export const richTextEditorRootClassName = tw(
  'relative',
  'w-full',
  '[font-family:var(--font-family-body)]',
  '[font-size:var(--text-body-size)]',
  '[line-height:var(--text-body-leading)]',
  '[@media_(pointer:coarse)]:[@supports_(-webkit-touch-callout:none)]:[font-size:max(1rem,var(--text-body-size))]',
);

export const richTextEditorStatusIconClassName = tw(
  'absolute',
  '[top:var(--spacing-2)]',
  '[inset-inline-end:var(--spacing-2)]',
  'z-1',
  'flex',
  'items-center',
);

// `default`, not `not-allowed`: a disabled control already carries its own
// visual treatment, and `not-allowed` is unpaintable on the part of the
// library sealed behind `pointer-events: none`.
export const richTextEditorDisabledClassName = tw(
  '[cursor:default]',
  '[&:is(:disabled,[aria-disabled=true])]:[cursor:default]',
);

export const richTextEditorCounterClassName = tw(
  'flex',
  'justify-end',
  '[margin-top:var(--spacing-1)]',
  '[font-family:var(--font-family-body)]',
  '[font-size:var(--text-supporting-size)]',
  '[color:var(--color-text-secondary)]',
);

export const richTextEditorCounterErrorClassName =
  '[color:var(--color-text-error)]';

// Only `lg` adds block padding; `sm` and `md` take the base body spacing.
export const richTextEditorBodySizeClassName = {
  lg: '[padding-block:var(--spacing-2)]',
} as const;
