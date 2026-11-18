// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file anchoredHint.tsx
 * @input A context layer (Layer/useLayer.tsx) and the theme's tokens
 * @output renderAnchoredHint: the anchored hint layer
 *   Core's keyboard hints share. It is a small surface in the top layer,
 *   below the start of the element it is anchored to. It has the popover
 *   background, the element radius, the low shadow and supporting text. It
 *   holds a row of key glyphs and a label
 * @position Internal to Core, not exported from the package. The keyboard
 *   hint (hooks/useKeyboardHint.tsx) renders its passive hint with it. A
 *   reorderable List (List/listReorderEngine.tsx) renders the hint of its
 *   reorder mode with it, whose glyphs are buttons
 *
 * The hint's surface and its two rows are classes
 * (`hooks/anchoredHintClasses.ts`).
 */

import type {ReactNode} from 'react';
import type {ContextLayerReturn} from '../Layer/useLayer';
import {
  anchoredHintClassName,
  anchoredHintPassiveClassName,
} from './anchoredHintClasses';
import {tw} from '../utils/tw';

/**
 * Renders `content` as an anchored hint in `layer` (a context layer whose
 * `ref` holds the anchor). A passive hint lets pointer events through; an
 * interactive one (`isInteractive`) takes them, for glyphs that are buttons.
 */
export function renderAnchoredHint(
  layer: ContextLayerReturn,
  content: ReactNode,
  {isInteractive = false}: {isInteractive?: boolean} = {},
): ReactNode {
  return layer.render(content, {
    placement: 'below',
    alignment: 'start',
    className: tw(
      anchoredHintClassName,
      !isInteractive && anchoredHintPassiveClassName,
    ),
    style: {
      marginBlockStart: 'var(--spacing-2)',
    },
  });
}
