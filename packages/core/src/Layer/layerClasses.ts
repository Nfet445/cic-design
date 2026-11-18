// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layerClasses.ts
 * @input The layer placement a caller asked for, whether the layer keeps its
 *   anchor clear, and the private geometry variables the runtime writes
 * @output Tailwind utility class strings for a layer's own box
 * @position Layer runtime styling; applied by `useLayer.tsx` (spec:AST-059)
 *
 * Every value here is spelled out: the Tailwind scanner emits class text it
 * reads, never a value built at runtime. The gutter values repeat
 * `layerViewportInset.stylex.ts`, which other owners still read as constants;
 * keep the two in step.
 *
 * The gutters carry their `env()` fallback inside the value and drop the
 * `env()`-less twin the StyleX `firstThatWorks` chain held: every engine
 * Astryx supports resolves `env()`.
 */

import {tw} from '../utils/tw';

/**
 * The viewport gutter, published once per layer element for the margins below
 * to read. The block gutter is one value for both block edges (a flip tactic
 * mirrors it between them), and the inline gutter one value for both inline
 * edges, so a layer that flips across the inline axis still clears a notch.
 */
export const layerGutterVariablesClassName = tw(
  '[--_layer-gutter-block:calc(max(var(--spacing-4),env(safe-area-inset-top,0px),env(safe-area-inset-bottom,0px))+max(var(--astryx-layer-inset-block-start,0px),var(--astryx-layer-inset-block-end,0px)))]',
  '[--_layer-gutter-inline:calc(max(var(--spacing-4),env(safe-area-inset-left,0px),env(safe-area-inset-right,0px))+max(var(--astryx-layer-inset-inline-start,0px),var(--astryx-layer-inset-inline-end,0px)))]',
);

/**
 * The clearance from the anchor, on the placement axis, and the gutter on the
 * far edge: `above` clears block-end and keeps block-start, `below` clears
 * block-start and keeps block-end, `start` clears inline-end and keeps
 * inline-start, `end` clears inline-start and keeps inline-end. The
 * clearance rides `--_astryx-layer-clearance`, which the runtime writes inline
 * and the slide rules read too.
 */
export const layerPlacementBlockStartClassName =
  '[margin-block-start:var(--_astryx-layer-clearance)]';

/** See `layerPlacementBlockStartClassName`. */
export const layerPlacementBlockEndClassName =
  '[margin-block-end:var(--_astryx-layer-clearance)]';

/** See `layerPlacementBlockStartClassName`. */
export const layerPlacementInlineStartClassName =
  '[margin-inline-start:var(--_astryx-layer-clearance)]';

/** See `layerPlacementBlockStartClassName`. */
export const layerPlacementInlineEndClassName =
  '[margin-inline-end:var(--_astryx-layer-clearance)]';

/** A layer flush against its anchor keeps only the far-edge gutter. */
export const layerGutterBlockStartClassName =
  '[margin-block-start:var(--_layer-gutter-block)]';

/** A layer flush against its anchor keeps only the far-edge gutter. */
export const layerGutterBlockEndClassName =
  '[margin-block-end:var(--_layer-gutter-block)]';

/** A layer flush against its anchor keeps only the far-edge gutter. */
export const layerGutterInlineStartClassName =
  '[margin-inline-start:var(--_layer-gutter-inline)]';

/** A layer flush against its anchor keeps only the far-edge gutter. */
export const layerGutterInlineEndClassName =
  '[margin-inline-end:var(--_layer-gutter-inline)]';

/**
 * The viewport cap: the layer box never leaves the viewport, so content wider
 * than it overflows inside the layer, where the composing component decides
 * whether it scrolls or clips. The block cap also honors the room the software
 * keyboard leaves (`--_layer-keyboard-max-block-size`).
 *
 * The `@supports not` arms are the `vh` twins the StyleX fallback chain held:
 * an engine without `dvb` drops the preferred declaration and keeps these.
 */
export const layerViewportFitClassName = tw(
  'box-border',
  '[max-inline-size:calc(100vi_-_max(var(--spacing-4),env(safe-area-inset-left,0px))_-_var(--astryx-layer-inset-inline-start,0px)_-_max(var(--spacing-4),env(safe-area-inset-right,0px))_-_var(--astryx-layer-inset-inline-end,0px))]',
  '[@supports_not_(block-size:100dvb)]:[max-inline-size:calc(100vw_-_max(var(--spacing-4),env(safe-area-inset-left,0px))_-_var(--astryx-layer-inset-inline-start,0px)_-_max(var(--spacing-4),env(safe-area-inset-right,0px))_-_var(--astryx-layer-inset-inline-end,0px))]',
  '[max-block-size:min(calc(100dvb_-_max(var(--spacing-4),env(safe-area-inset-top,0px))_-_var(--astryx-layer-inset-block-start,0px)_-_max(var(--spacing-4),env(safe-area-inset-bottom,0px))_-_var(--astryx-layer-inset-block-end,0px)),var(--_layer-keyboard-max-block-size,100dvb))]',
  '[@supports_not_(block-size:100dvb)]:[max-block-size:min(calc(100vh_-_max(var(--spacing-4),env(safe-area-inset-top,0px))_-_var(--astryx-layer-inset-block-start,0px)_-_max(var(--spacing-4),env(safe-area-inset-bottom,0px))_-_var(--astryx-layer-inset-block-end,0px)),var(--_layer-keyboard-max-block-size,100vh))]',
);

/** A fixed layer sits where its owner measured it. */
export const layerFixedClassName = 'fixed';

/**
 * A layer that keeps its anchor clear scrolls only once its content overflows
 * the box it was given. A layer that fits has no scroll range, so nothing
 * contains a wheel over it and the scroll chains to the page.
 */
export const layerScrollsOnOverflowClassName = 'overflow-y-auto';

/**
 * The keyboard geometry's own defaults, so a layer nested in a capped one does
 * not inherit the outer cap or inset. The runtime overrides a value inline
 * while the software keyboard caps the layer; the surface reads the two caps
 * through `--_layer-keyboard-*`.
 */
export const layerKeyboardDefaultCapClassName =
  '[--_layer-keyboard-max-block-size:100vh]';

/** See `layerKeyboardDefaultsClassName`. */
export const layerKeyboardDefaultOverflowClassName =
  '[--_layer-keyboard-overflow:visible]';

/** See `layerKeyboardDefaultsClassName`. */
export const layerKeyboardDefaultInsetClassName =
  '[--_layer-keyboard-inset-block-end:initial]';

/** See `layerKeyboardDefaultsClassName`. */
export const layerKeyboardDefaultsClassName = tw(
  layerKeyboardDefaultCapClassName,
  layerKeyboardDefaultOverflowClassName,
  layerKeyboardDefaultInsetClassName,
);
