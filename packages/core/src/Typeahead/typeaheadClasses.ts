// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file typeaheadClasses.ts
 * @input Uses the theme's spacing, radius, typography, type-scale, colour and
 *   border variables, and the row's size and runtime state
 * @output The utility class strings for the field's box and size floor, a typeahead
 *   result row, its content slot
 *   and the default `TypeaheadItem` label, description and icon carry, plus
 *   the field's text entry, its disabled cursor and the two lanes around it
 * @position Internal to BaseTypeahead and TypeaheadItem; the Tailwind build
 *   scans it for class names
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 *
 * A state class sets a private variable the base row reads, so the highlight
 * and the selected weight win without depending on sheet order. In forced
 * colours the highlight paints its outline the same way: the base row states
 * the outline with a fallback, and only the state class that sets the
 * variables inside the media query paints one.
 */

import {tw} from '../utils/tw';

export type TypeaheadRowSize = 'sm' | 'md' | 'lg';

/**
 * Row padding is stated in full for every size, so no size class shares a
 * property with the base row and the stylesheet order never decides the inset.
 */
const ROW_PADDING_CLASS: Record<TypeaheadRowSize, string> = {
  sm: tw(
    '[padding-block:var(--spacing-1)]',
    '[padding-inline:var(--spacing-2)]',
  ),
  md: tw(
    '[padding-block:var(--spacing-1-5)]',
    '[padding-inline:var(--spacing-2)]',
  ),
  lg: tw(
    '[padding-block:var(--spacing-2)]',
    '[padding-inline:var(--spacing-2)]',
  ),
};

/**
 * The field's own box: the element the shared field box class also styles.
 *
 * It holds one token and the input in one row, so it states `gap` and
 * `padding-block` against the field box's own values, and a text caret even
 * while the field is disabled, as the map it replaces did. Utilities in
 * `astryx-base` that disagree are decided by the sheet's order, so these name
 * the field's stable target class (`.astryx-typeahead`) and win by
 * specificity instead.
 *
 * There is no `flex-wrap`: the field box does not wrap and neither does
 * `TextInput`, and this field only ever holds one token, so there is no second
 * row to wrap to. It also cannot wrap and keep its end controls in flow: flex
 * moves an item to a new line rather than shrinking it, so a long value put the
 * clear button and spinner on a row of their own (a 280px field grew to 46px
 * tall). Unwrapped, the token ellipsizes instead.
 */
export const TYPEAHEAD_WRAPPER_CLASS = tw(
  '[&.astryx-typeahead]:gap-[var(--spacing-1)]',
  // Standard padding minus the border width, so the box does not jump when a
  // token (28px) is added inside it.
  '[&.astryx-typeahead]:py-[calc(var(--spacing-1)-1px)]',
  '[&.astryx-typeahead]:cursor-text',
);

/** The field's size floor, the same one the shared input box takes. */
export const typeaheadWrapperSizeClassName: Record<TypeaheadRowSize, string> = {
  sm: 'min-h-[var(--size-element-sm)]',
  md: 'min-h-[var(--size-element-md)]',
  lg: 'min-h-[var(--size-element-lg)]',
};

/** A group's heading above its rows: no target of its own, so no row paint. */
export const typeaheadGroupHeadingClassName = tw(
  'px-[var(--spacing-2)]',
  'pt-[var(--spacing-2)]',
  'pb-[var(--spacing-1)]',
  '[font-size:var(--text-supporting-size)]',
  '[line-height:var(--text-supporting-leading)]',
  'text-[color:var(--color-text-secondary)]',
  'select-none',
);

/** The row the menu shows when a search found nothing. */
export const typeaheadEmptyStateClassName = tw(
  'p-3',
  'text-center',
  '[font-size:var(--text-supporting-size)]',
  'text-[color:var(--color-text-secondary)]',
);

/** The spinner a direct caller gets, in flow beside its field. */
export const typeaheadLoadingStatusClassName = tw(
  'inline-flex',
  'shrink-0',
  'items-center',
  'justify-center',
  'p-[var(--spacing-1)]',
);

/** The fill a highlighted row draws over the base row's transparent one. */
export const TYPEAHEAD_ROW_HIGHLIGHT_CLASS =
  '[--_typeahead-row-bg:var(--color-overlay-hover)]';

/**
 * Windows High Contrast drops the fill, so a highlighted row draws a system
 * outline there instead. The three values ride private variables so nothing
 * competes with the base row's `outline-style` declaration.
 */
export const TYPEAHEAD_ROW_HIGHLIGHT_FORCED_COLORS_CLASS = tw(
  'forced-colors:[--_typeahead-row-outline-style:solid]',
  'forced-colors:[--_typeahead-row-outline-width:var(--border-width)]',
  'forced-colors:[--_typeahead-row-outline-color:Highlight]',
);

/** A selected row states its choice in weight, beside the check it draws. */
export const TYPEAHEAD_ROW_SELECTED_CLASS =
  '[font-weight:var(--font-weight-medium)]';

/** The row's content box: takes the free inline size and clips its overflow. */
export const TYPEAHEAD_ROW_CONTENT_CLASS = tw(
  'flex',
  'flex-1',
  'min-w-0',
  'overflow-hidden',
);

/** The default item fills the content slot so its label can ellipsize. */
export const TYPEAHEAD_DEFAULT_ITEM_CLASS = tw('min-w-0', 'w-full');

/**
 * A result row in the list: a full-width, borderless, transparent row on the
 * element radius, inset by the row's padding rather than a fixed height.
 */
export function typeaheadRowClassName({
  isHighlighted,
  isSelected,
  size,
}: {
  isHighlighted: boolean;
  isSelected: boolean;
  size: TypeaheadRowSize;
}): string {
  return tw(
    'box-border',
    'flex',
    'items-center',
    'w-full',
    'rounded-[var(--radius-element)]',
    'cursor-pointer',
    'aria-disabled:cursor-default',
    'text-start',
    'bg-[color:var(--_typeahead-row-bg,transparent)]',
    '[border-width:0]',
    '[border-style:none]',
    '[outline-style:var(--_typeahead-row-outline-style,none)]',
    '[outline-width:var(--_typeahead-row-outline-width,0)]',
    '[outline-color:var(--_typeahead-row-outline-color,currentColor)]',
    ROW_PADDING_CLASS[size],
    isHighlighted && TYPEAHEAD_ROW_HIGHLIGHT_CLASS,
    isHighlighted && TYPEAHEAD_ROW_HIGHLIGHT_FORCED_COLORS_CLASS,
    isSelected && TYPEAHEAD_ROW_SELECTED_CLASS,
  );
}

/** `TypeaheadItem`'s frame: the icon and the text stack, side by side. */
export const TYPEAHEAD_ITEM_FRAME_CLASS = tw(
  'flex',
  'items-center',
  'gap-2',
  '[min-height:0]',
);

export const TYPEAHEAD_ITEM_CONTENT_CLASS = tw(
  'flex',
  'flex-col',
  'flex-1',
  'min-w-0',
);

export const TYPEAHEAD_ITEM_LABEL_CLASS = tw(
  '[font-size:var(--text-label-size)]',
  '[line-height:var(--text-label-leading)]',
  'font-normal',
  'text-[color:var(--color-text-primary)]',
  'truncate',
);

export const TYPEAHEAD_ITEM_DESCRIPTION_CLASS = tw(
  '[font-size:var(--text-supporting-size)]',
  '[line-height:var(--text-supporting-leading)]',
  'text-[color:var(--color-text-secondary)]',
  'truncate',
);

export const TYPEAHEAD_ITEM_DISABLED_CLASS = 'opacity-50';

/**
 * The field's text entry: no box of its own, the field draws it. The field's
 * own box stays on StyleX — it shares one element with the shared field box
 * class and sets the same `padding`, `gap`, `backgroundColor` and `boxShadow`
 * properties, which two classes in `astryx-base` would order by the sheet
 * rather than by `tw`.
 */
export const typeaheadInputClassName = tw(
  'block flex-1 min-w-[60px]',
  'border-0 border-none p-0',
  '[font-family:var(--font-family-body)]',
  'text-[length:var(--text-body-size)] leading-[var(--text-body-leading)]',
  // iOS Safari zooms the page when a focused control sits under 16px, and only
  // iOS WebKit implements -webkit-touch-callout to key that floor to it.
  'pointer-coarse:[@supports(-webkit-touch-callout:none)]:text-[length:max(1rem,var(--text-body-size))]',
  'text-[color:var(--color-text-primary)] bg-transparent outline-none',
  'placeholder:text-[color:var(--color-text-secondary)]',
);

export const typeaheadInputDisabledClassName = 'cursor-default';

/** The clear button and the busy indicator, in the field's inline end. */
export const typeaheadEndLaneClassName = tw(
  'flex items-center',
  'gap-[var(--spacing-1)]',
  'ms-auto',
);

/**
 * The box the value may occupy. Its inline end is where the end lane begins,
 * so a long value stops there instead of running under the clear button; `flex`
 * with `min-w-0` yields all of its space in a narrow field.
 */
export const typeaheadContentLaneClassName = tw(
  'relative flex items-center self-stretch flex-1 min-w-0',
);

/**
 * The value token, painted over the input rather than beside it: in flow the
 * token would add its own width to the row. It is bounded by the content lane
 * at both ends, so a long value ellipsizes at the lane's edge instead of
 * running under the end controls; the `auto` end margin keeps those two insets
 * from being over-constrained. The negative inline start and the zero block
 * start put it 3px inside the field's own padding on both axes, where it has
 * always sat.
 */
export const TYPEAHEAD_TOKEN_OVERLAY_CLASS = tw(
  'absolute',
  '[inset-block-start:0]',
  '[inset-inline-start:calc(-1*(var(--spacing-1)_-_1px))]',
  '[inset-inline-end:0]',
  'w-fit',
  '[margin-block:0]',
  '[margin-inline-start:0]',
  '[margin-inline-end:auto]',
);

/**
 * The input while its value arrives as a token: the token is painted over the
 * same space and owns the pointer, and the input keeps its own width so the
 * field measures as it does with no value at all.
 */
export const TYPEAHEAD_INPUT_HIDDEN_CLASS = tw(
  'opacity-0',
  'pointer-events-none',
);

/**
 * The result popup's box: no taller than its layer's block-size cap, which
 * folds in the software keyboard, so the list ends above the keyboard with the
 * layer. A later list for the same query holds the height this one reached
 * (`spec:AST-092` FR6): the component publishes that height as the private
 * `--astryx-typeahead-held-block-size`, and both arms below read it first. The
 * `@supports` arm serves an engine without the dynamic-viewport units, the same
 * pair `multiSelectorListWrapperClassName` states.
 */
export const typeaheadDropdownClassName = tw(
  'box-border',
  'overflow-y-auto',
  'p-[var(--spacing-1)]',
  '[max-block-size:var(--astryx-typeahead-held-block-size,min(300px,calc(100dvb_-_max(var(--spacing-4),env(safe-area-inset-top,0px))_-_var(--astryx-layer-inset-block-start,0px)_-_max(var(--spacing-4),env(safe-area-inset-bottom,0px))_-_var(--astryx-layer-inset-block-end,0px)),var(--_layer-keyboard-max-block-size,100dvb)))]',
  '[@supports_not_(block-size:100dvb)]:[max-block-size:var(--astryx-typeahead-held-block-size,min(300px,calc(100vh_-_var(--spacing-4)_-_var(--astryx-layer-inset-block-start,0px)_-_var(--spacing-4)_-_var(--astryx-layer-inset-block-end,0px)),var(--_layer-keyboard-max-block-size,100vh)))]',
);

/**
 * The menu's box: at least as wide as the input it anchors to, and never wider
 * than the room its layer leaves (`spec:AST-059` FR2, FR7). The `@supports` arm
 * serves an engine without the `vi` unit.
 */
export const typeaheadPopoverClassName = tw(
  'box-border',
  '[min-width:min(anchor-size(width),calc(100vi_-_max(var(--spacing-4),env(safe-area-inset-left,0px))_-_var(--astryx-layer-inset-inline-start,0px)_-_max(var(--spacing-4),env(safe-area-inset-right,0px))_-_var(--astryx-layer-inset-inline-end,0px)))]',
  '[@supports_not_(inline-size:100vi)]:[min-width:min(anchor-size(width),calc(100vw_-_var(--spacing-4)_-_var(--spacing-4)_-_var(--astryx-layer-inset-inline-start,0px)_-_var(--astryx-layer-inset-inline-end,0px)))]',
);

/**
 * The explicit `menuWidth`, a per-instance width: the component publishes it as
 * the private `--astryx-typeahead-menu-width` beside this class.
 */
export const TYPEAHEAD_MENU_WIDTH_CLASS =
  '[width:var(--astryx-typeahead-menu-width)]';
