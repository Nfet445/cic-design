// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tabListClasses.ts
 * @input The tab strip's size, layout and the selected or press state of a tab
 * @output Utility class strings for Tab, TabMenu and the TabList strip
 * @position Style primitives; scanned by the Tailwind build
 *
 * Keeps every class the tab family emits in one module so the build has one
 * place to find them. A property that a state changes is emitted by exactly one
 * branch, because two classes of the same property would be decided by the
 * sheet's order and not by the branch.
 */

import {tw} from '../utils/tw';
import type {TabListSize} from './TabListContext';

const TRIGGER_BOX_CLASS = tw(
  'relative inline-flex items-center justify-center',
  'gap-[var(--spacing-1)] px-[var(--spacing-3)]',
  'bg-transparent border-0 rounded-[var(--radius-element)]',
  '[font-family:inherit]',
  'text-[length:var(--text-label-size)] leading-[var(--text-label-leading)]',
  'cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default',
  'no-underline',
  'transition-[color] duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
);

const TRIGGER_COLOR_CLASS = {
  unselected: 'text-[color:var(--color-text-secondary)]',
  selected: 'text-[color:var(--color-text-primary)]',
};

const TRIGGER_WEIGHT_CLASS = {
  unselected: '[font-weight:var(--font-weight-normal)]',
  selected: '[font-weight:var(--font-weight-semibold)]',
};

const MIN_BLOCK_SIZE_CLASS: Record<TabListSize, string> = {
  sm: 'min-h-[var(--size-element-sm)]',
  md: 'min-h-[var(--size-element-md)]',
  lg: 'min-h-[var(--size-element-lg)]',
};

/** A hugging tab keeps its label's width; a fill tab shares the strip. */
const TAB_LAYOUT_CLASS = {
  hug: 'shrink-0',
  fill: 'flex-1',
};

export type TabClassNameOptions = {
  size: TabListSize;
  isSelected: boolean;
  isFill: boolean;
};

/** A tab's own box: it keeps its tab stop and grows with a larger text size. */
export function tabClassName({
  size,
  isSelected,
  isFill,
}: TabClassNameOptions): string {
  return tw(
    TAB_OVERLAY_STATE_CLASS,
    TAB_PRESS_IMAGE_STATE_CLASS,
    TRIGGER_BOX_CLASS,
    'whitespace-nowrap',
    TRIGGER_COLOR_CLASS[isSelected ? 'selected' : 'unselected'],
    TRIGGER_WEIGHT_CLASS[isSelected ? 'selected' : 'unselected'],
    MIN_BLOCK_SIZE_CLASS[size],
    TAB_LAYOUT_CLASS[isFill ? 'fill' : 'hug'],
  );
}

/**
 * The hover and press a tab paints behind its content. The tab owns the state
 * and publishes it as a private colour; the layer below inherits the colour and
 * paints it, so the arms of one property never have to outrank each other
 * across two elements.
 */
const TAB_OVERLAY_STATE_CLASS = tw(
  '[--_tab-overlay:transparent]',
  '[@media(hover:hover)]:hover:[--_tab-overlay:var(--color-overlay-hover)]',
  // A pointer press steps up to the pressed overlay. Repeated inside the
  // hover-capable branch so it outranks the hover there.
  'active:[--_tab-overlay:var(--color-overlay-pressed)]',
  '[@media(hover:hover)]:active:[--_tab-overlay:var(--color-overlay-pressed)]',
  // Under a coarse pointer the touch press model writes the press attribute
  // instead of `:active`, and paints as an image below.
  'pointer-coarse:active:[--_tab-overlay:transparent]',
);

/* eslint-disable @astryx/no-raw-private-attribute -- Tailwind scans class text,
   so the press attribute has to appear literally in a class name; the owner
   module cannot supply it through interpolation. */
/**
 * The touch press as an image layer over the colour: an image change is
 * discrete, so the layer's colour transition cannot fade its onset, and the
 * strength the tab's `pressedAlpha` arms own is what moves.
 */
const TAB_PRESS_IMAGE_STATE_CLASS = tw(
  'pointer-coarse:[&[data-astryx-press=on]]:[--_tab-press-image:var(--_press-paint-image)]',
  'pointer-coarse:[&[data-astryx-press=fading]]:[--_tab-press-image:var(--_press-paint-image)]',
);
/* eslint-enable @astryx/no-raw-private-attribute */

const OVERLAY_LAYER_CLASS = tw(
  'absolute inset-0 m-auto w-full pointer-events-none',
  'rounded-[var(--radius-element)]',
  'bg-[var(--_tab-overlay)]',
  '[background-image:var(--_tab-press-image,none)]',
  'transition-[background-color] duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
);

/** The layer that paints the tab's hover and press; never shorter than the tab. */
export function tabHoverLayerClassName(size: TabListSize): string {
  return tw(OVERLAY_LAYER_CLASS, MIN_BLOCK_SIZE_CLASS[size]);
}

/** A menu trigger opens a list; it carries no press overlay of its own. */
const TAB_MENU_OVERLAY_STATE_CLASS = tw(
  '[--_tab-overlay:transparent]',
  '[@media(hover:hover)]:hover:[--_tab-overlay:var(--color-overlay-hover)]',
);

/** The menu trigger's hover layer is never shorter than the trigger. */
export function tabMenuHoverLayerClassName(size: TabListSize): string {
  return tw(OVERLAY_LAYER_CLASS, MIN_BLOCK_SIZE_CLASS[size]);
}

const INDICATOR_CLASS = tw(
  'absolute pointer-events-none',
  // Sits on the tab's bottom edge by default. An ancestor that reserves space
  // for a divider rail sets `--_tab-indicator-bottom` to drop the indicator
  // onto the rail beneath the reserved gap.
  'bottom-[var(--_tab-indicator-bottom,-1px)]',
  'start-[var(--spacing-3)] end-[var(--spacing-3)]',
  'h-[2px] rounded-full',
  'transition-[opacity,background-color] duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
);

const INDICATOR_COLOR_CLASS = {
  accent: {
    selected: 'bg-[var(--color-accent)] opacity-100',
    unselected: 'bg-transparent opacity-0',
  },
  icon: {
    selected: 'bg-[var(--color-icon-primary)] opacity-100',
    unselected: 'bg-transparent opacity-0',
  },
};

/** The tab's measured underline; the accent one marks the selected tab. */
export function tabIndicatorClassName({
  isSelected,
  color = 'accent',
}: {
  isSelected: boolean;
  color?: 'accent' | 'icon';
}): string {
  return tw(
    INDICATOR_CLASS,
    INDICATOR_COLOR_CLASS[color][isSelected ? 'selected' : 'unselected'],
  );
}

export const TAB_ICON_CLASS =
  'inline-flex items-center justify-center shrink-0';

const ICON_SIZE_CLASS: Record<TabListSize, string> = {
  sm: 'w-[14px] h-[14px]',
  md: 'w-[16px] h-[16px]',
  lg: 'w-[18px] h-[18px]',
};

export function tabIconSizeClassName(size: TabListSize): string {
  return ICON_SIZE_CLASS[size];
}

export const TAB_LABEL_CONTAINER_CLASS = 'inline-grid';

export const TAB_LABEL_TEXT_CLASS = '[grid-row-start:1] [grid-column-start:1]';

/**
 * An invisible copy at the selected weight, so the label's box keeps the width
 * of its heaviest state and a selection does not move the strip.
 */
export const TAB_LABEL_SIZER_CLASS = tw(
  '[grid-row-start:1] [grid-column-start:1]',
  'invisible pointer-events-none [font-weight:var(--font-weight-semibold)]',
);

export const TAB_END_CONTENT_CLASS = 'inline-flex items-center shrink-0';

export type TabMenuTriggerClassNameOptions = {
  size: TabListSize;
  hasSelectedOption: boolean;
};

/**
 * A menu trigger is a tab that opens a list: it keeps its label's width in a
 * scrolling strip, and it never wraps.
 */
export function tabMenuTriggerClassName({
  size,
  hasSelectedOption,
}: TabMenuTriggerClassNameOptions): string {
  return tw(
    TAB_MENU_OVERLAY_STATE_CLASS,
    TRIGGER_BOX_CLASS,
    'shrink-0',
    TRIGGER_COLOR_CLASS[hasSelectedOption ? 'selected' : 'unselected'],
    TRIGGER_WEIGHT_CLASS[hasSelectedOption ? 'selected' : 'unselected'],
    MIN_BLOCK_SIZE_CLASS[size],
  );
}

export const TAB_MENU_TRIGGER_LABEL_CLASS =
  'relative inline-grid items-center self-stretch';

export const TAB_MENU_CHEVRON_CLASS =
  'w-[var(--spacing-4)] h-[var(--spacing-4)] shrink-0';

/** Applied to the chevron icon, so the rotating element is the themed one. */
export const TAB_MENU_CHEVRON_ICON_CLASS = tw(
  'transition-[transform] duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
);

export const TAB_MENU_CHEVRON_OPEN_CLASS = 'rotate-180';

export const TAB_MENU_DROPDOWN_CLASS = tw(
  // A held pointer slides across the items; it selects no text.
  'select-none flex flex-col',
  'gap-[var(--spacing-0-5)] p-[var(--spacing-1)]',
);

const MENU_ITEM_BOX_CLASS = tw(
  'flex items-center justify-between',
  'gap-[var(--spacing-2)] py-[var(--spacing-2)] px-[var(--spacing-3)]',
  'rounded-[var(--radius-element)]',
  '[font-family:inherit]',
  'text-[length:var(--text-label-size)] leading-[var(--text-label-leading)]',
  'text-[color:var(--color-text-primary)]',
  'cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default',
  'bg-transparent',
  'transition-[background-color] duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
  '[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:bg-[var(--color-overlay-hover)]',
);

const MENU_ITEM_WEIGHT_CLASS = {
  unselected: '[font-weight:var(--font-weight-normal)]',
  selected: '[font-weight:var(--font-weight-medium)]',
};

export function tabMenuItemClassName(isSelected: boolean): string {
  return tw(
    MENU_ITEM_BOX_CLASS,
    MENU_ITEM_WEIGHT_CLASS[isSelected ? 'selected' : 'unselected'],
  );
}

export const TAB_MENU_ITEM_CONTENT_CLASS =
  'flex items-center gap-[var(--spacing-2)]';

export const TAB_MENU_HEADING_CLASS = tw(
  'text-[length:var(--text-supporting-size)] leading-[var(--text-supporting-leading)]',
  '[font-weight:var(--font-weight-semibold)] text-[color:var(--color-text-secondary)]',
  'py-[var(--spacing-1)] px-[var(--spacing-3)]',
);
