// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file powerSearchClasses.ts
 * @input The popover presentation's token value, result count, anchored layer
 *   and the sheet presentation's trigger field
 * @output Utility class names for those surfaces
 * @position Style primitives; scanned by the Tailwind build
 *
 * The layer's minimum width is a floor for comfortable editing, clamped by the
 * viewport gutter, so the runtime flips or slides the editor into view when it
 * does not fit beside the anchor. An engine without the dynamic inline unit
 * takes the `@supports` arm, as the menu caps do.
 */

import {tw} from '../utils/tw';

const POPOVER_LAYER_MIN_INLINE =
  '[min-width:min(400px,calc(100vi_-_max(var(--spacing-4),env(safe-area-inset-left,0px))_-_var(--astryx-layer-inset-inline-start,0px)_-_max(var(--spacing-4),env(safe-area-inset-right,0px))_-_var(--astryx-layer-inset-inline-end,0px)))]';
const POPOVER_LAYER_MIN_INLINE_FALLBACK =
  '[@supports_not_(inline-size:100vi)]:[min-width:min(400px,calc(100vw_-_var(--spacing-4)_-_var(--spacing-4)_-_var(--astryx-layer-inset-inline-start,0px)_-_var(--astryx-layer-inset-inline-end,0px)))]';

/** The filter value inside a token pill. */
export const powerSearchTokenValueClassName =
  '[font-weight:var(--font-weight-bold)]';

/** The editor layer: the trigger's width, with a floor for editing. */
export const powerSearchPopoverLayerClassName = tw(
  '[width:anchor-size(width)]',
  POPOVER_LAYER_MIN_INLINE,
  POPOVER_LAYER_MIN_INLINE_FALLBACK,
);

/** The result count beside the sheet field; it never wraps. */
export const powerSearchResultCountClassName =
  'text-[length:var(--text-supporting-size)] leading-[var(--text-supporting-leading)] text-[color:var(--color-text-secondary)] whitespace-nowrap';

/** The sheet field's height per size step. */
const SHEET_TRIGGER_SIZE_CLASSES = {
  sm: 'min-h-[var(--size-element-sm)]',
  md: 'min-h-[var(--size-element-md)]',
  lg: 'min-h-[var(--size-element-lg)]',
};

export function powerSearchSheetTriggerSizeClassName(
  size: 'sm' | 'md' | 'lg',
): string {
  return SHEET_TRIGGER_SIZE_CLASSES[size];
}

/*
 * The sheet trigger field: the tokenizer field's control box, with
 * display-only tokens and one button as its only tab stop.
 */
const SHEET_TRIGGER_WRAPPER_CLASSES =
  'relative flex-nowrap gap-1 h-auto cursor-pointer [&:is([aria-disabled=true])]:cursor-default';

const SHEET_TRIGGER_WRAPPER_WITH_TOKENS_CLASSES =
  'py-[calc(var(--spacing-1)_-_1px)] px-[calc(var(--spacing-1)_-_1px)]';

const SHEET_TRIGGER_CONTENT_CLASSES =
  'relative min-w-0 grow flex items-center flex-wrap gap-x-1 gap-y-[calc(var(--spacing-1)_-_1px)]';

const SHEET_TRIGGER_START_ICON_WITH_TOKENS_CLASSES =
  'ms-[calc(var(--spacing-2)_-_var(--spacing-1)_+_1px)]';

/** The only tab stop in the field; borderless, while the wrapper takes taps. */
export const powerSearchSheetTriggerClassName =
  'appearance-none [flex:1_1_40px] min-w-10 self-stretch flex items-center py-0 px-1 m-0 border-0 border-none bg-transparent text-[color:var(--color-text-secondary)] [font-family:var(--font-family-body)] text-[length:var(--text-body-size)] leading-[var(--text-body-leading)] text-start whitespace-nowrap cursor-pointer [&:is([aria-disabled=true])]:cursor-default outline-none';

/** Once a token is present the empty trigger covers the token lane. */
export const powerSearchSheetTriggerWithTokensClassName =
  'absolute inset-0 min-w-0 p-0';

/** A long placeholder ends in an ellipsis inside the trigger. */
export const powerSearchSheetTriggerPlaceholderClassName =
  'min-w-0 overflow-hidden text-ellipsis whitespace-nowrap';

/** The end lane: the result count and the caller's end content. */
export const powerSearchSheetTriggerEndClassName =
  'flex items-center gap-2 shrink-0 pe-1';

export {
  SHEET_TRIGGER_WRAPPER_CLASSES as powerSearchSheetTriggerWrapperClassName,
  SHEET_TRIGGER_WRAPPER_WITH_TOKENS_CLASSES as powerSearchSheetTriggerWrapperWithTokensClassName,
  SHEET_TRIGGER_CONTENT_CLASSES as powerSearchSheetTriggerContentClassName,
  SHEET_TRIGGER_START_ICON_WITH_TOKENS_CLASSES as powerSearchSheetTriggerStartIconWithTokensClassName,
};
