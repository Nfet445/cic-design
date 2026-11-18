// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file privateAttributes/pressClasses.ts
 * @input The press attributes the controller writes, and the overlay's paint
 *   (`--_press-paint-image`)
 * @output The classes that hand a row's press paint down, and that keep a
 *   control's press layer from the touch to the end of the release
 * @position Style primitives; scanned by the Tailwind build
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from '../utils/tw';

/**
 * A CheckboxList row's own press paint, which the layer over its checkbox box
 * reads (`CheckboxInput/checkboxInputClasses.ts`). It is `none` at rest, so a
 * row in another row's content keeps its own paint. A box reads its nearest
 * row's value. A pressed ancestor row hands down nothing.
 *
 * The rest value prints before the attribute arms, which carry the extra
 * attribute in their selector, so an arm wins whatever order the sheet keeps.
 */
export const rowPressPaintCheckboxRowClassName = tw(
  '[--_checkbox-row-press-paint:none]',
  /* eslint-disable @astryx/no-raw-private-attribute -- Tailwind scans class text, so the attribute has to be spelled here */
  '[&[data-astryx-press=on]]:[--_checkbox-row-press-paint:var(--_press-paint-image)]',
  '[&[data-astryx-press=fading]]:[--_checkbox-row-press-paint:var(--_press-paint-image)]',
  /* eslint-enable @astryx/no-raw-private-attribute */
);

/**
 * A row hands its press image down to an indicator that paints its own press
 * (`Indicator/indicatorClasses.ts`), but only in the row's own press states. A
 * pressed outer row hands down nothing, as for the built-in box. Neither
 * property has a default: a default would print beside the attribute arm and
 * beat it. Only CheckboxInput's row declares them. A menu item paints its own
 * press, so a mapped indicator there paints none.
 *
 * While the controller paints the press, the indicator's `:active` fill stays
 * off, so a mouse's press paints once.
 */
export const indicatorPressPaintHandDownClassName = tw(
  /* eslint-disable @astryx/no-raw-private-attribute -- Tailwind scans class text, so the attribute has to be spelled here */
  '[&[data-astryx-press=on]]:[--_indicator-press-image:var(--_press-paint-image)]',
  '[&[data-astryx-press=fading]]:[--_indicator-press-image:var(--_press-paint-image)]',
  '[&[data-astryx-press=on]]:[--_indicator-active-press:transparent]',
  '[&[data-astryx-press=fading]]:[--_indicator-active-press:transparent]',
  /* eslint-enable @astryx/no-raw-private-attribute */
);

/**
 * A RadioList row's paint of a mouse press the controller does not paint, read
 * by the layer over the circle (`radioListItemPressOverlayClassName`) through
 * inheritance. A press through a nested control is that control's, as the
 * row's container rule decides for the controller; the `:has()` is on the row
 * itself and reaches no descendant selector, so a change inside the row
 * re-checks the row alone. Under a coarse pointer the row's circle paints its
 * own `:active` fill, so the row declares none.
 *
 * The nested-control list is spelled in the class text below, in
 * INTERACTIVE_SELECTORS' order (hooks/useClickableContainer.ts), less the
 * read-only ones;
 * `RadioList/RadioListItem.press.source-build.test.mjs` holds the two equal.
 * A row's own radio is the row's action, so its press is the row's; CSS
 * cannot tell it from a nested radio input, so a nested one presses the
 * circle too.
 *
 * A row layer that needs a variant per combination stays StyleX
 * (`rowPressLayerStyles` in `privateAttributes/press.stylex.ts`): one row
 * element crosses thirteen conditions there — the coarse pointer, the enabled
 * arm, two press states, the reduced-motion arm and the `::before`
 * pseudo-element, each also after the overlay class it must beat on
 * `background-image` and `animation-name`, where StyleX wins over a class at
 * any order.
 */
export const rowPressPaintRadioRowClassName = tw(
  /* eslint-disable @astryx/no-raw-private-attribute -- Tailwind scans class text, so the attribute has to be spelled here */
  '[&:active:not([data-astryx-press="on"],[data-astryx-press="fading"]):not(:has(button:not([aria-readonly="true"]):active,a:not([aria-readonly="true"]):active,input:not([type="radio"],[aria-readonly="true"]):active,select:not([aria-readonly="true"]):active,textarea:not([aria-readonly="true"]):active,[role="button"]:not([aria-readonly="true"]):active,[role="link"]:not([aria-readonly="true"]):active,[role="checkbox"]:not([aria-readonly="true"]):active,[role="radio"]:not([aria-readonly="true"]):active,[role="switch"]:not([aria-readonly="true"]):active,[role="tab"]:not([aria-readonly="true"]):active,[role="menuitem"]:not([aria-readonly="true"]):active,[role="option"]:not([aria-readonly="true"]):active,[role="combobox"]:not([aria-readonly="true"]):active,[role="listbox"]:not([aria-readonly="true"]):active,[role="slider"]:not([aria-readonly="true"]):active,[role="spinbutton"]:not([aria-readonly="true"]):active,[data-pressable-container]:not([aria-readonly="true"]):active))]:[--_radio-row-press:var(--color-overlay-pressed)]',
  'pointer-coarse:[&:active:not([data-astryx-press="on"],[data-astryx-press="fading"]):not(:has(button:not([aria-readonly="true"]):active,a:not([aria-readonly="true"]):active,input:not([type="radio"],[aria-readonly="true"]):active,select:not([aria-readonly="true"]):active,textarea:not([aria-readonly="true"]):active,[role="button"]:not([aria-readonly="true"]):active,[role="link"]:not([aria-readonly="true"]):active,[role="checkbox"]:not([aria-readonly="true"]):active,[role="radio"]:not([aria-readonly="true"]):active,[role="switch"]:not([aria-readonly="true"]):active,[role="tab"]:not([aria-readonly="true"]):active,[role="menuitem"]:not([aria-readonly="true"]):active,[role="option"]:not([aria-readonly="true"]):active,[role="combobox"]:not([aria-readonly="true"]):active,[role="listbox"]:not([aria-readonly="true"]):active,[role="slider"]:not([aria-readonly="true"]):active,[role="spinbutton"]:not([aria-readonly="true"]):active,[data-pressable-container]:not([aria-readonly="true"]):active))]:[--_radio-row-press:transparent]',
  /* eslint-enable @astryx/no-raw-private-attribute */
);

/**
 * A control whose press lives on its own surface: Button (and the IconButton
 * and ToggleButton built on it). Its press scale runs as a transition, and the
 * browser makes a layer for it and drops that layer at its end, which repaints
 * the button. Under a coarse primary pointer, a layer kept from the touch to
 * the end of the release keeps the release free of Paint. With any other
 * pointer nothing here applies.
 */
export const controlPressHeldClassName = tw(
  /* eslint-disable @astryx/no-raw-private-attribute -- Tailwind scans class text, so the attribute has to be spelled here */
  'pointer-coarse:[&[data-astryx-press=on]]:will-change-transform',
  'pointer-coarse:[&[data-astryx-press=fading]]:will-change-transform',
  /* eslint-enable @astryx/no-raw-private-attribute */
);
