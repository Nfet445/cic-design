// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file multiSelectorClasses.ts
 * @input The panel MultiSelector presents its options in
 * @output The trigger's box and variant chrome, the trigger button, and the two
 *   class strings its panel adds to the ones it shares with `Selector`: the
 *   padded list wrapper and the listbox itself
 * @position Style primitives; scanned by the Tailwind build. The component
 *   composes these with `tw`
 *
 * The panel's cap, heading, divider and empty slot are the same declarations
 * `Selector` states, so they come from `selectorClasses`. The trigger's box
 * shares one element with the shared field box class, and the field box sets
 * `padding-block`, `padding-inline`, `border-width`, `background-color`,
 * `box-shadow` and `transition-property` from classes in the same layer. A
 * utility here that disagreed with one of those would be decided by the
 * sheet's order, not by `tw`, so the chips that must win name the trigger's
 * stable target class (`.astryx-multi-selector`) and outrank the field box by
 * specificity instead.
 */

import {tw} from '../utils/tw';

/**
 * The list's padded wrapper, capped like the search panel's so the list ends
 * above the keyboard with the layer. It states all four paddings rather than
 * the block and inline pair: the listbox below it owns only its outline.
 */
export const multiSelectorListWrapperClassName = tw(
  'box-border',
  'min-h-0',
  '[max-block-size:min(300px,calc(100dvb_-_max(var(--spacing-4),env(safe-area-inset-top,0px))_-_var(--astryx-layer-inset-block-start,0px)_-_max(var(--spacing-4),env(safe-area-inset-bottom,0px))_-_var(--astryx-layer-inset-block-end,0px)),var(--_layer-keyboard-max-block-size,100dvb))]',
  '[@supports_not_(block-size:100dvb)]:[max-block-size:min(300px,calc(100vh_-_var(--spacing-4)_-_var(--astryx-layer-inset-block-start,0px)_-_var(--spacing-4)_-_var(--astryx-layer-inset-block-end,0px)),var(--_layer-keyboard-max-block-size,100vh))]',
  'overflow-y-auto',
  'p-[var(--spacing-1)]',
);

/** The grid or listbox inside that wrapper: a focus ring draws its own edge. */
export const multiSelectorOptionsClassName = 'outline-none';

/**
 * The trigger's box: the visible control, and the field box's own element.
 *
 * `isInert` is a disabled or read-only trigger, which keeps its chrome in the
 * input variant and, in the two borderless ones, neither scales nor paints a
 * press.
 */
export function multiSelectorTriggerContainerClassName({
  variant,
  hasValue,
  isInert,
}: {
  variant: 'input' | 'secondary' | 'ghost';
  hasValue: boolean;
  isInert: boolean;
}): string {
  return tw(
    'justify-between',
    variant === 'ghost' ? 'w-auto' : 'w-full',
    '[&.astryx-multi-selector]:py-[var(--spacing-2)]',
    '[&.astryx-multi-selector]:px-[var(--spacing-3)]',
    '[font-family:var(--font-family-body)]',
    '[font-size:var(--text-label-size)]',
    '[line-height:var(--text-label-leading)]',
    hasValue
      ? 'text-[color:var(--color-text-primary)]'
      : 'text-[color:var(--color-text-secondary)]',
    isInert ? 'cursor-default' : 'cursor-pointer',
    variant !== 'input' &&
      multiSelectorTriggerChromeClassName({variant, isInert}),
  );
}

/**
 * The chrome a borderless trigger wears over the field box: no border, its own
 * fill, the medium weight, its transition list, and the press scale.
 *
 * The paint-off arms state the state each of the shared overlay's arms matches,
 * because a plain `background-image: none` would tie with them in the same
 * layer and the sheet would decide.
 */
function multiSelectorTriggerChromeClassName({
  variant,
  isInert,
}: {
  variant: 'secondary' | 'ghost';
  isInert: boolean;
}): string {
  return tw(
    '[&.astryx-multi-selector]:border-0',
    variant === 'ghost'
      ? '[&.astryx-multi-selector]:bg-transparent'
      : '[&.astryx-multi-selector]:bg-[var(--color-neutral)]',
    '[&.astryx-multi-selector:focus-within]:shadow-none',
    '[font-weight:var(--font-weight-medium)]',
    '[&.astryx-multi-selector]:[transition-property:background-image,background-color,color,opacity,transform]',
    // The press scale goes at once as the list opens.
    '[&.astryx-multi-selector:has([aria-expanded=true])]:[transition-property:background-image,background-color,color,opacity]',
    isInert
      ? tw(
          '[transform:none]',
          '[&.astryx-multi-selector:hover]:[background-image:none]',
          '[&.astryx-multi-selector:active]:[background-image:none]',
          '[&.astryx-multi-selector[data-astryx-press=on]]:[background-image:none]',
          '[&.astryx-multi-selector[data-astryx-press=fading]]:[background-image:none]',
        )
      : tw(
          '[transform:scale(1)]',
          // A mouse press; under a coarse pointer the touch press model writes
          // `data-astryx-press` instead (see interactionOverlay.stylex.ts).
          '[&:active:not(:has([aria-expanded=true]))]:pointer-fine:[transform:scale(0.98)]',
          '[&[data-astryx-press=on]:not(:has([aria-expanded=true]))]:[transform:scale(0.98)]',
        ),
  );
}

/**
 * The trigger button: it fills the container and draws nothing of its own, so
 * the container's padding, border and focus ring are the whole visible box.
 * Its cursor is one of two classes rather than a base class plus an override,
 * because two utilities of the same property are ordered by the sheet, not by
 * their order here.
 */
export function multiSelectorTriggerClassName({
  isReadOnly,
}: {
  isReadOnly: boolean;
}): string {
  return tw(
    'flex',
    'items-center',
    'justify-between',
    'gap-[var(--spacing-4)]',
    'grow',
    'shrink',
    'basis-0',
    'min-w-0',
    'p-0',
    'm-0',
    '[border-width:0]',
    '[border-style:none]',
    'bg-transparent',
    '[font-family:inherit]',
    '[font-size:inherit]',
    '[line-height:inherit]',
    '[color:inherit]',
    isReadOnly ? 'cursor-default' : 'cursor-pointer',
    'disabled:cursor-default',
    'aria-disabled:cursor-default',
    'outline-none',
    'rounded-[var(--radius-element)]',
  );
}

/** The value row inside the button: chips and text share one clipped line. */
export const MULTI_SELECTOR_TRIGGER_CONTENT_CLASS = tw(
  'flex',
  'items-center',
  'gap-[var(--spacing-4)]',
  'grow',
  'shrink',
  'basis-0',
  'min-w-0',
  'overflow-hidden',
);

/** The single-line value, ellipsized rather than widening the trigger. */
export const MULTI_SELECTOR_TRIGGER_TEXT_CLASS = tw(
  'overflow-hidden',
  'text-ellipsis',
  'whitespace-nowrap',
);

/** The selected chips wrap onto another line when the row runs out of room. */
export const MULTI_SELECTOR_TRIGGER_BADGES_CLASS = tw(
  'flex',
  'flex-wrap',
  'gap-[var(--spacing-4)]',
  'items-center',
);

/** The `+N` tail of a clipped chip row, in supporting weight. */
export const MULTI_SELECTOR_TRIGGER_OVERFLOW_CLASS = tw(
  'shrink-0',
  'text-[length:var(--text-label-size)]',
  'text-[color:var(--color-text-secondary)]',
  'font-medium',
);

/**
 * The status glyph's button: it takes no padding or border of its own, so the
 * glyph box inside it is the target, and it inherits the trigger's color.
 */
export const MULTI_SELECTOR_STATUS_BUTTON_CLASS = tw(
  'flex',
  'items-center',
  'justify-center',
  'p-0',
  'm-0',
  '[border-width:0]',
  '[border-style:none]',
  'bg-transparent',
  '[color:inherit]',
  'cursor-pointer',
  'disabled:cursor-default',
  'aria-disabled:cursor-default',
  'rounded-[var(--radius-element)]',
);

/**
 * Only what Icon does not already provide: `size="sm"` gives the 16px box and
 * the color, but the glyph still must not shrink in the flex row.
 */
export const MULTI_SELECTOR_TRIGGER_ICON_CLASS = tw('shrink-0');

/**
 * The chevron turns in place on the glyph itself, so the
 * `multi-selector-indicator-icon` theme target and the rotation sit on one
 * element.
 */
export const MULTI_SELECTOR_TRIGGER_ICON_ROTATION_CLASS = tw(
  'transition-[transform]',
  'duration-[var(--duration-fast)]',
  'ease-[var(--ease-standard)]',
  'origin-center',
);

/**
 * The `rotate` property would not ride the transform transition, so the open
 * state writes the same `transform` the StyleX rule did.
 */
export const MULTI_SELECTOR_TRIGGER_ICON_OPEN_CLASS =
  '[transform:rotate(180deg)]';
