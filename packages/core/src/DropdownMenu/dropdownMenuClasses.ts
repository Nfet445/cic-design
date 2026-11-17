// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file dropdownMenuClasses.ts
 * @input The menu row's size, variant and disabled state, and the group and
 *   divider shapes the menu's leaf components share
 * @output The class maps for the dropdown menu family's leaves and the
 *   bottom-sheet presentation's frame
 * @position Style primitives; scanned by the Tailwind build. The leaf
 *   components compose these with `tw`
 */

import {tw} from '../utils/tw';

/** The rule between groups of rows. */
export const dropdownMenuDividerClassName = tw(
  '[margin-block:var(--spacing-1)]',
);

/**
 * The radius a row steps back to: the menu's own, less its inner padding, so a
 * row drawn against that padding reads as an inset panel. Both parts come from
 * the menu, and the token is the fallback.
 */
const MENU_ITEM_RADIUS_CLASS =
  'rounded-[max(0px,calc(var(--_dropdown-menu-radius,var(--spacing-2))_-_var(--_dropdown-menu-padding,--spacing-1)))]';

/**
 * The row's box: full width, borderless, and sized by its padding rather than
 * a fixed height.
 */
const MENU_ITEM_ROW_CLASS = tw(
  'box-border w-full',
  '[border-width:0] [border-style:none]',
  MENU_ITEM_RADIUS_CLASS,
  '[padding-inline:var(--spacing-2)]',
  '[font-family:var(--font-family-body)]',
  'text-[length:var(--text-label-size)]',
  'text-start',
  'cursor-pointer aria-disabled:cursor-default',
);

/**
 * The row's block padding per menu size. Only the block padding differs, so one
 * per-instance value keeps every row on one property owner; the inline padding
 * stays on the row.
 */
const MENU_ITEM_SIZE_CLASS = {
  sm: '[padding-block:var(--spacing-1)]',
  md: '[padding-block:var(--spacing-1-5)]',
  lg: '[padding-block:var(--spacing-2)]',
} as const;

/**
 * A destructive row recolors its text, icon, label and description. Its fill
 * stays the shared neutral overlay, so it hovers like every other row.
 */
const MENU_ITEM_DESTRUCTIVE_CLASS = tw(
  'text-[color:var(--color-text-error)]',
  '[--_item-label-color:var(--color-text-error)]',
  '[--_item-description-color:var(--color-text-error)]',
);

/**
 * The box a checkable row shares with every other menu row: it fills the menu
 * and steps back to the inset radius. `Item` sizes these rows, so they do not
 * take `dropdownMenuItemClassName`'s padding.
 */
export function dropdownMenuCheckableRowClassName({
  isDisabled,
}: {
  isDisabled: boolean;
}): string {
  return tw(
    'w-full',
    MENU_ITEM_RADIUS_CLASS,
    'text-[color:var(--color-text-primary)]',
    'cursor-pointer aria-disabled:cursor-default',
    isDisabled && 'opacity-50',
  );
}

/**
 * Where a checkable row's marker sits: a raw flex child of the row, first by
 * default and at the inline-end under a finger or pen. It never takes the
 * pointer, so a press on the mark reaches the row, which owns the state.
 */
export const dropdownMenuMarkerClassName = tw(
  'pointer-events-none order-0 ms-0',
  'pointer-coarse:order-1 pointer-coarse:ms-auto',
);

/**
 * The drill-in wrapper: it adds no box of its own, so the menu's flex gap runs
 * between the rows exactly as it does without it.
 */
export const dropdownMenuTreeClassName = 'contents';

/**
 * The root's rows while a sub-menu's view shows in their place. The `hidden`
 * attribute alone would lose to the `contents` class, so the wrapper swaps the
 * class with it.
 */
export const dropdownMenuTreeHiddenClassName = 'hidden';

/** The radio group's column: the menu's own inter-row gap, inside the group. */
export const dropdownMenuRadioGroupClassName =
  'flex flex-col gap-[var(--spacing-0-5)]';

/** The row's classes, by size, variant and disabled state. */
export function dropdownMenuItemClassName({
  isDestructive,
  isDisabled,
  size,
}: {
  isDestructive: boolean;
  isDisabled: boolean;
  size: 'sm' | 'md' | 'lg';
}): string {
  return tw(
    MENU_ITEM_ROW_CLASS,
    MENU_ITEM_SIZE_CLASS[size],
    isDestructive
      ? MENU_ITEM_DESTRUCTIVE_CLASS
      : 'text-[color:var(--color-text-primary)]',
    isDisabled && 'opacity-50',
  );
}

/**
 * The bottom-sheet presentation's frame: the sheet body, the header row that
 * carries the back button, and the caller's regions inset to the list's
 * content edge. A sub-menu's own heading is the row's sibling, so the root
 * heading takes the list's content edge and the drilled one does not.
 */
export const dropdownMenuSheetClassName = {
  content: 'w-full',
  header: tw(
    'flex flex-row items-center',
    'gap-[var(--spacing-1)] [margin-bottom:var(--spacing-2)]',
  ),
  rootHeading: '[margin-inline-start:var(--spacing-3)]',
  // The heading is the panel's focus target once a sub-menu opens; the ring is
  // the panel's, not the text's.
  viewHeading: 'outline-none',
  region: tw(
    '[padding-inline:var(--spacing-3)]',
    '[padding-block:var(--spacing-2)]',
  ),
} as const;

/**
 * The group heading. It is not a `menuitem`, so it carries no row affordance;
 * the secondary text color keeps it apart from the rows it names.
 */
export const dropdownMenuGroupHeadingClassName = tw(
  '[padding-block:var(--spacing-1)]',
  '[padding-inline:var(--spacing-2)]',
  '[font-family:var(--font-family-body)]',
  'text-[length:var(--text-supporting-size)]',
  'leading-[var(--text-supporting-leading)]',
  'text-[color:var(--color-text-secondary)]',
  'select-none',
);

// -----------------------------------------------------------------------------
// The pointer popover
// -----------------------------------------------------------------------------

/** A per-instance lift of the menu's block cap; the viewport still bounds it. */
export const dropdownMenuMaxBlockSizeVar =
  '--astryx-dropdown-menu-max-block-size';

/** The menu's width when the caller states one. */
export const dropdownMenuInlineSizeVar = '--astryx-dropdown-menu-inline-size';

const POPOVER_INLINE_CAP =
  '[max-inline-size:calc(100vi_-_max(var(--spacing-4),env(safe-area-inset-left,0px))_-_var(--astryx-layer-inset-inline-start,0px)_-_max(var(--spacing-4),env(safe-area-inset-right,0px))_-_var(--astryx-layer-inset-inline-end,0px))]';
const POPOVER_INLINE_CAP_FALLBACK =
  '[@supports_not_(inline-size:100vi)]:[max-inline-size:calc(100vw_-_var(--spacing-4)_-_var(--spacing-4)_-_var(--astryx-layer-inset-inline-start,0px)_-_var(--astryx-layer-inset-inline-end,0px))]';
// The menu's own cap on the placement axis sits under the viewport one, and
// `menuMaxHeight` lifts it through the variable.
const POPOVER_BLOCK_CAP =
  '[max-block-size:min(var(--astryx-dropdown-menu-max-block-size,300px),calc(100dvb_-_max(var(--spacing-4),env(safe-area-inset-top,0px))_-_var(--astryx-layer-inset-block-start,0px)_-_max(var(--spacing-4),env(safe-area-inset-bottom,0px))_-_var(--astryx-layer-inset-block-end,0px)),var(--_layer-keyboard-max-block-size,100dvb))]';
const POPOVER_BLOCK_CAP_FALLBACK =
  '[@supports_not_(block-size:100dvb)]:[max-block-size:min(var(--astryx-dropdown-menu-max-block-size,300px),calc(100vh_-_var(--spacing-4)_-_var(--astryx-layer-inset-block-start,0px)_-_var(--spacing-4)_-_var(--astryx-layer-inset-block-end,0px)),var(--_layer-keyboard-max-block-size,100vh))]';

// A sub-menu's drilled-in view with a header or footer renders in the surface
// host that follows the menu, as the frame marked
// `data-astryx-submenu-regions="view"`. The rule reads that from the DOM, so
// no state mirrors which view shows.
/* eslint-disable @astryx/no-raw-private-attribute -- Tailwind scans class text, so the attribute has to be spelled here */
const STEPS_ASIDE_FOR_VIEW_CLASS =
  '[&:has(~_[data-astryx-submenu-host]_>_[data-astryx-submenu-regions=view]:not([hidden]))]:hidden';
/* eslint-enable @astryx/no-raw-private-attribute */

/** The heel of a finger held on the trigger keeps no native affordances. */
export const dropdownMenuTriggerPressableClassName = tw(
  '[-webkit-touch-callout:none]',
  'select-none',
);

/** The trigger's held state: the pressed overlay as its fill. */
export const dropdownMenuTriggerOpenClassName =
  '[background-image:linear-gradient(var(--color-overlay-pressed),var(--color-overlay-pressed))]';

/**
 * The menu's own surface: the rows' column, the menu's radius and padding
 * handed to the rows, both viewport caps, and the step aside while a
 * drilled-in sub-menu view shows beside it. The ring is the focus owner's, so
 * the box draws none.
 */
export const dropdownMenuPopoverClassName = tw(
  'box-border flex flex-col',
  'gap-[var(--spacing-0-5)]',
  STEPS_ASIDE_FOR_VIEW_CLASS,
  'outline-none',
  '[-webkit-touch-callout:none]',
  'select-none',
  POPOVER_INLINE_CAP,
  POPOVER_INLINE_CAP_FALLBACK,
  POPOVER_BLOCK_CAP,
  POPOVER_BLOCK_CAP_FALLBACK,
  '[--_dropdown-menu-radius:var(--radius-container)]',
  '[--_dropdown-menu-padding:var(--spacing-1)]',
  'p-[var(--spacing-1)]',
  'rounded-[var(--_dropdown-menu-radius)]',
  'opacity-100',
  '[transition-property:opacity]',
  '[transition-duration:var(--duration-fast)]',
  '[transition-timing-function:var(--ease-standard)]',
);

/** A menu that scrolls owns the vertical pan and stops it chaining away. */
export const dropdownMenuScrollClassName = tw(
  'overflow-y-auto',
  'overflow-x-hidden',
  'overscroll-contain',
);

/**
 * With a header or footer, the regions and the menu share one column under the
 * menu's block cap: the regions keep their height and the menu shrinks and
 * scrolls between them.
 */
export const dropdownMenuRegionsFrameClassName = tw(
  'box-border flex flex-col',
  POPOVER_BLOCK_CAP,
  POPOVER_BLOCK_CAP_FALLBACK,
);

/** The menu's share of that column: it takes the room and may shrink to none. */
export const dropdownMenuMenuInFrameClassName = tw(
  'grow',
  'shrink',
  '[min-block-size:0]',
);

/** Where a sub-menu with a header or footer renders its surface: beside the
 * menu, owning no box, so the popover's layout is unchanged. */
export const dropdownMenuSurfaceHostClassName = 'contents';

/** A header or footer inside the frame: its height is its own. */
export const dropdownMenuRegionClassName = tw(
  'shrink-0',
  'p-[var(--spacing-1)]',
);

/** A header or footer steps aside for a drilled-in view, as the menu does. */
export const dropdownMenuStepsAsideForViewClassName =
  STEPS_ASIDE_FOR_VIEW_CLASS;

/**
 * The layer box: the same block cap the menu paints, so the layer's flip
 * decision sees the height the menu takes.
 */
export const dropdownMenuPopoverViewportClassName = tw(
  'box-border',
  POPOVER_BLOCK_CAP,
  POPOVER_BLOCK_CAP_FALLBACK,
);

// Without a width the menu prefers the trigger's minimum width, clamped by the
// runtime's cap because a CSS minimum beats a maximum. An engine without the
// dynamic inline unit takes the `@supports` arm.
const MATCH_TRIGGER_WIDTH =
  '[min-width:min(anchor-size(width),calc(100vi_-_max(var(--spacing-4),env(safe-area-inset-left,0px))_-_var(--astryx-layer-inset-inline-start,0px)_-_max(var(--spacing-4),env(safe-area-inset-right,0px))_-_var(--astryx-layer-inset-inline-end,0px)))]';
const MATCH_TRIGGER_WIDTH_FALLBACK =
  '[@supports_not_(inline-size:100vi)]:[min-width:min(anchor-size(width),calc(100vw_-_var(--spacing-4)_-_var(--spacing-4)_-_var(--astryx-layer-inset-inline-start,0px)_-_var(--astryx-layer-inset-inline-end,0px)))]';

/** The layer box's width with no explicit `menuWidth`. */
export const dropdownMenuPopoverMatchTriggerClassName = tw(
  MATCH_TRIGGER_WIDTH,
  MATCH_TRIGGER_WIDTH_FALLBACK,
);

/** The layer box's minimum width when the caller states one. */
export const dropdownMenuPopoverMinWidthClassName =
  'min-w-[var(--astryx-dropdown-menu-inline-size)]';

/** The layer box's fixed width when the caller states one. */
export const dropdownMenuPopoverFixedWidthClassName =
  'w-[var(--astryx-dropdown-menu-inline-size)]';
