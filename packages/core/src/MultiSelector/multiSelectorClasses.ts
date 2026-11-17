// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file multiSelectorClasses.ts
 * @input The panel MultiSelector presents its options in
 * @output The two class strings its panel adds to the ones it shares with
 *   `Selector`: the padded list wrapper and the listbox itself
 * @position Style primitives; scanned by the Tailwind build. The component
 *   composes these with `tw`
 *
 * The panel's cap, heading, divider and empty slot are the same declarations
 * `Selector` states, so they come from `selectorClasses`. The trigger's chrome
 * stays on StyleX in `MultiSelector.tsx`: it shares one element with
 * `inputWrapperStyles.base`, whose unlayered `padding`, `gap`,
 * `backgroundColor` and `boxShadow` would win over these layered classes.
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
