// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file itemClasses.ts
 * @input A row's density, its alignment, its pressed/selected/disabled state,
 *   its layout and the line count each text line clamps to
 * @output Utility class strings for the row frame, its marker/content cell,
 *   its slots, its two text lines and the first-line strut
 * @position Style primitives; scanned by the Tailwind build
 *
 * The pressed overlay and the focus ring stay StyleX
 * (`interactionOverlayStyles`, `focusWithinOwner`): they are the shared press
 * and ring machines, not this row's paint.
 */

import {tw} from '../utils/tw';
import type {ItemAlign, ItemDensity} from './Item';

/**
 * The inline inset the row publishes and its padding reads back. A theme that
 * sets `paddingInline` on `item` writes this variable through the derived-var
 * registry, so the padding and every consumer that compensates for it stay in
 * step.
 */
const INLINE_INSET = '[--_item-inset-inline:var(--spacing-2)]';

const FRAME = tw(
  'flex items-center gap-2 relative box-border text-start',
  'rounded-[var(--radius-element)]',
  INLINE_INSET,
  'px-[var(--_item-inset-inline)]',
);

/**
 * `spacious` widens the inset as well as the block padding. It keys off the
 * `data-density` attribute the row already sets, so it outranks the frame's
 * own inset by specificity instead of by class order in the shared layer.
 */
export const itemDensityClassName: Record<ItemDensity, string> = {
  compact: 'py-1',
  balanced: 'py-2',
  spacious: tw(
    'py-3',
    'data-[density=spacious]:[--_item-inset-inline:var(--spacing-3)]',
  ),
};

/** `center` is the frame's own `items-center`; only the other two add a class. */
export const itemAlignClassName: Record<ItemAlign, string> = {
  center: '',
  start: 'items-start',
  'first-line': 'items-baseline',
};

/**
 * A zero-width line of label text inside a slot: same size and leading as the
 * label, so its line box is the label's first line box. The slot centers it
 * against the slot's content, and the row's baseline alignment puts it on the
 * label's first line. Its content carries empty alternative text so assistive
 * technology reads nothing from it.
 */
export const itemFirstLineSlotClassName = tw(
  'items-center',
  // The content is a raw zero-width space (U+200B), not an escape: the build
  // reads this file's text, so `\u200B` would reach the sheet as six literal
  // characters.
  "before:content-['​'_/_''] before:overflow-hidden before:w-0",
  'before:[font-size:var(--text-body-size)] before:[line-height:var(--text-body-leading)]',
);

/**
 * The clamp count is a per-instance number no class can name, so the row sets
 * this property inline and the class reads it.
 */
export const itemLineClampVars = {
  clamp: '--astryx-item-line-clamp',
} as const;

export const itemSingleLineTruncateClassName =
  'overflow-hidden text-ellipsis whitespace-nowrap';

// The property is spelled out: the build scans literal class strings, and one
// assembled from the variable name never reaches the sheet.
export const itemMultiLineTruncateClassName = tw(
  'overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical]',
  '[-webkit-line-clamp:var(--astryx-item-line-clamp)]',
);

export const itemLabelClassName = tw(
  'text-[color:var(--_item-label-color,var(--color-text-primary))]',
  '[font-size:var(--text-body-size)] [line-height:var(--text-body-leading)]',
);

export const itemDescriptionClassName = tw(
  'text-[color:var(--_item-description-color,var(--color-text-secondary))]',
  '[font-size:var(--text-supporting-size)] [line-height:var(--text-supporting-leading)]',
);

export const itemInteractiveClassName = tw(
  'cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default',
  'transition-[background-color] duration-[var(--duration-fast-min)] ease-[var(--ease-standard)]',
);

export const itemHighlightedClassName = 'bg-[var(--color-overlay-hover)]';
export const itemSelectedClassName = 'bg-[var(--color-accent-muted)]';
export const itemDisabledClassName = 'cursor-default pointer-events-none';
export const itemLinkRootClassName = 'text-inherit no-underline';
export const itemDisabledContentClassName = 'opacity-50';

const INVISIBLE_CONTROL = tw(
  'cursor-[inherit] [&:is(:disabled,[aria-disabled=true])]:cursor-default',
  'text-inherit flex flex-col flex-1 min-w-0 text-start outline-none',
);

export const itemInvisibleButtonClassName = INVISIBLE_CONTROL;
export const itemInvisibleAnchorClassName = tw(
  INVISIBLE_CONTROL,
  'no-underline',
);

export const itemContentClassName = tw(
  'flex flex-col flex-1 min-w-0 text-start',
);

/**
 * `layout="inline"`: label and description share one line, so the row fits a
 * fixed-height host such as a Selector trigger inside an InputGroup. Centered,
 * not baseline-aligned: two font sizes on a shared baseline make a line box
 * taller than either line.
 */
export const itemInlineContentClassName = 'flex-row items-center gap-x-2';

export const itemInlineLabelClassName = 'shrink-0';
/** The description yields width first, so the label ellipsizes last. */
export const itemInlineDescriptionClassName = 'shrink min-w-0';

export const itemStartContentClassName = 'flex-none flex';
export const itemEndContentClassName = 'flex-none flex ms-auto';

export const itemMarkerContentClassName = tw(
  'flex flex-1 min-w-0 [align-items:inherit] self-stretch [gap:inherit]',
);

/**
 * A tall start/end slot moves the first text baseline down. The marker must
 * follow that baseline, not the stretched group's top edge.
 */
export const itemMarkerContentFirstLineClassName = 'self-baseline';

export interface ItemRootClassNameOptions {
  align: ItemAlign;
  density: ItemDensity;
  isInteractive: boolean;
  isHighlighted: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  hasParentRole: boolean;
  isLinkRoot: boolean;
}

/** The row frame with its density, alignment and paint. */
export function itemClassName({
  align,
  density,
  isInteractive,
  isHighlighted,
  isSelected,
  isDisabled,
  hasParentRole,
  isLinkRoot,
}: ItemRootClassNameOptions): string {
  return tw(
    FRAME,
    itemDensityClassName[density],
    itemAlignClassName[align],
    isInteractive && itemInteractiveClassName,
    isLinkRoot && itemLinkRootClassName,
    isHighlighted && itemHighlightedClassName,
    isSelected && itemSelectedClassName,
    isDisabled && !hasParentRole && itemDisabledClassName,
  );
}
