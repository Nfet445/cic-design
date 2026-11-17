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

// =============================================================================
// TabList
// =============================================================================

const TAB_LIST_NAV_CLASS = tw(
  'relative flex items-stretch',
  'gap-[var(--spacing-0-5)] max-w-full min-w-0',
);

/** The strip's frame; a fill list stretches to the container's width. */
export function tabListNavClassName({isFill}: {isFill: boolean}): string {
  return tw(TAB_LIST_NAV_CLASS, isFill && 'w-full');
}

/**
 * The divider rail. It reserves a gap under the tabs so the hover pill no
 * longer touches the underline, and drops the selected indicator through that
 * gap plus the border, onto the rail.
 */
export const TAB_LIST_DIVIDER_CLASS = tw(
  'border-b-[length:var(--border-width)] border-b-solid border-b-[color:var(--color-border)]',
  'pb-[var(--spacing-1)]',
  '[--_tab-indicator-bottom:calc(-1*(var(--spacing-1)_+_var(--border-width)))]',
);

/** A full-bleed list reaches its container's content edges. */
export const TAB_LIST_FULL_BLEED_CLASS = tw(
  'ms-[calc(-1*var(--container-padding-inline-start,0px))]',
  'me-[calc(-1*var(--container-padding-inline-end,0px))]',
  'max-w-none',
  'w-[calc(100%_+_var(--container-padding-inline-start,0px)_+_var(--container-padding-inline-end,0px))]',
);

const TAB_LIST_STRIP_CLASS = tw(
  'flex items-stretch',
  // Inherited rather than restated so an `xstyle` gap override on the TabList
  // still reaches the tabs.
  'gap-[inherit] grow shrink min-w-0',
  // Content-height, not stretched: the bleed padding below is inside the
  // strip's own height, and a stretched height would push the tabs out of the
  // scrollport.
  'self-start',
);

/**
 * A scroll container clips at its padding box, and two things a tab paints sit
 * outside its own box: the focus ring (offset + width) and the selected
 * indicator, which `--_tab-indicator-bottom` pushes further down when a
 * divider rail is reserved. The strip pads by that much and takes the padding
 * straight back off with a negative margin, so nothing is clipped and the tabs
 * stay exactly where they were.
 *
 * A bleed is not free: the padding is real geometry, and any ancestor that
 * scrolls counts it as something to scroll to. So the ring's share is taken
 * only while a ring is actually drawn inside the strip — the same
 * `:has(:focus-visible)` condition that draws it — while the indicator's share
 * is always taken, because the indicator is always drawn.
 */
const TAB_LIST_STRIP_SCROLL_CLASS = tw(
  'overflow-x-auto overflow-y-hidden overscroll-x-contain',
  'scroll-smooth motion-reduce:scroll-auto [scrollbar-width:none]',
  '[scroll-padding-inline:calc(var(--_tab-strip-bleed)_+_var(--spacing-8))]',
  '[--_tab-strip-bleed:0px]',
  '[&:has(:focus-visible)]:[--_tab-strip-bleed:calc(var(--focus-outline-width)_+_var(--focus-outline-offset))]',
  'pt-[var(--_tab-strip-bleed)] -mt-[var(--_tab-strip-bleed)]',
  'pb-[max(var(--_tab-strip-bleed),calc(-1*var(--_tab-indicator-bottom,-1px)))]',
  '-mb-[max(var(--_tab-strip-bleed),calc(-1*var(--_tab-indicator-bottom,-1px)))]',
  'px-[var(--_tab-strip-bleed)] -mx-[var(--_tab-strip-bleed)]',
  'transition-[mask-image] duration-[var(--duration-medium)] ease-[var(--ease-standard)]',
  'motion-reduce:duration-0',
);

/**
 * A stop's own inline padding is restated here because a full-bleed strip has
 * to subtract it: the strip pads back in only the part of the container's
 * padding the stop does not already supply, so the edge label lands on the
 * content inset. Kept in step with `Tab`/`TabMenu`'s inline padding by hand —
 * the import would be circular. Put back the part a stop does not supply, so the first and last label land on the container's content inset
 * while their boxes still hang out over it.
 */
const TAB_LIST_FULL_BLEED_STRIP_CLASS = tw(
  'ps-[calc(var(--_tab-strip-bleed,0px)_+_max(var(--container-padding-inline-start,0px)_-_var(--spacing-3),0px))]',
  'pe-[calc(var(--_tab-strip-bleed,0px)_+_max(var(--container-padding-inline-end,0px)_-_var(--spacing-3),0px))]',
);

export type TabListStripClassNameOptions = {
  hasScroll: boolean;
  isFullBleed: boolean;
  fadesStart: boolean;
  fadesEnd: boolean;
};

/**
 * The fade reaches transparent at the strip's own edge, not at the bleed edge,
 * so the scrollport paints nothing past the TabList's box. Exactly one mask is
 * emitted: two classes of the same property would be decided by the sheet's
 * order, not by the strip's state.
 */
export function tabListStripClassName({
  hasScroll,
  isFullBleed,
  fadesStart,
  fadesEnd,
}: TabListStripClassNameOptions): string {
  return tw(
    TAB_LIST_STRIP_CLASS,
    hasScroll && TAB_LIST_STRIP_SCROLL_CLASS,
    isFullBleed && TAB_LIST_FULL_BLEED_STRIP_CLASS,
    tabListMaskClassName({hasScroll, fadesStart, fadesEnd}),
  );
}

const FADE_START_CLASS = tw(
  '[mask-image:linear-gradient(to_right,transparent_var(--_tab-strip-bleed),black_calc(var(--_tab-strip-bleed)_+_var(--spacing-8)))]',
  // The gradient follows the inline direction the fade is on.
  '[&:is([dir="rtl"]_*)]:[mask-image:linear-gradient(to_left,transparent_var(--_tab-strip-bleed),black_calc(var(--_tab-strip-bleed)_+_var(--spacing-8)))]',
);

const FADE_END_CLASS = tw(
  '[mask-image:linear-gradient(to_left,transparent_var(--_tab-strip-bleed),black_calc(var(--_tab-strip-bleed)_+_var(--spacing-8)))]',
  '[&:is([dir="rtl"]_*)]:[mask-image:linear-gradient(to_right,transparent_var(--_tab-strip-bleed),black_calc(var(--_tab-strip-bleed)_+_var(--spacing-8)))]',
);

const FADE_BOTH_CLASS =
  '[mask-image:linear-gradient(to_right,transparent_var(--_tab-strip-bleed),black_calc(var(--_tab-strip-bleed)_+_var(--spacing-8)),black_calc(100%_-_calc(var(--_tab-strip-bleed)_+_var(--spacing-8))),transparent_calc(100%_-_var(--_tab-strip-bleed)))]';

function tabListMaskClassName({
  hasScroll,
  fadesStart,
  fadesEnd,
}: Omit<TabListStripClassNameOptions, 'isFullBleed'>): string {
  if (!hasScroll) {
    return '[mask-image:none]';
  }
  if (fadesStart && fadesEnd) {
    return FADE_BOTH_CLASS;
  }
  if (fadesStart) {
    return FADE_START_CLASS;
  }
  if (fadesEnd) {
    return FADE_END_CLASS;
  }
  return '[mask-image:none]';
}

const TAB_LIST_ARROW_CLASS = tw(
  'absolute top-0 hidden items-center justify-center',
  'p-0 border-0 rounded-full',
  // Opaque, because it sits over the tabs it scrolls: the strip's edge fade
  // thins the content underneath but does not clear it.
  'bg-[var(--color-background-popover)] shadow-[var(--shadow-low)]',
  'text-[color:var(--color-text-secondary)]',
  'hover:text-[color:var(--color-text-primary)]',
  'cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default',
  // A pointer-only affordance: keyboard and assistive-technology users move
  // through the strip with the arrow keys, which scrolls the focused tab into
  // view on its own.
  '[@media(hover:hover)]:flex',
);

const TAB_LIST_ARROW_EDGE_CLASS = {
  start: 'start-0',
  end: 'end-0',
};

const ARROW_SIZE_CLASS: Record<TabListSize, string> = {
  sm: 'w-[var(--size-element-sm)] h-[var(--size-element-sm)]',
  md: 'w-[var(--size-element-md)] h-[var(--size-element-md)]',
  lg: 'w-[var(--size-element-lg)] h-[var(--size-element-lg)]',
};

/** A scroll arrow, capped on the edge it scrolls away from. */
export function tabListArrowClassName({
  edge,
  size,
}: {
  edge: 'start' | 'end';
  size: TabListSize;
}): string {
  return tw(
    TAB_LIST_ARROW_CLASS,
    TAB_LIST_ARROW_EDGE_CLASS[edge],
    ARROW_SIZE_CLASS[size],
  );
}
