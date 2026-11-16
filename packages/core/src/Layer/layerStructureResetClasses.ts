// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layerStructureResetClasses.ts
 * @input The class name the Tailwind sheet defines for the structural reset
 * @output Tailwind class that stops inherited structural custom properties at
 *   a layer's content boundary
 * @position Private Core styling; AST-038 FR7 owns the accepted contract
 *
 * Apply beside `layerTextResetClassName`, before component and consumer styles,
 * on the layer's content boundary. Top-layer promotion does not stop DOM
 * inheritance, so a structural value an ancestor component scoped to its own
 * descendants would otherwise reach unrelated content opened from inside it.
 *
 * Name each property: a structural channel stops here only once it is known.
 * Theme tokens and writing context must keep inheriting (AST-038 FR2), so this
 * never resets by prefix. The declarations live in `@layer reset` inside
 * `packages/core/tailwind/astryx.input.css`.
 */
export const layerStructureResetClassName = 'astryx-layer-structure-reset';
