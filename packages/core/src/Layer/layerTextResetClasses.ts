// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layerTextResetClasses.ts
 * @input The class name the Tailwind sheet defines for the baseline
 * @output Tailwind class for the text baseline of a content-bearing layer root
 * @position Private Core styling; AST-038 owns the accepted contract
 *
 * Apply before component and consumer styles on the layer's content boundary.
 * Top-layer promotion does not stop DOM inheritance. Reset text formatting, not
 * writing context, theme variables, surface colors, geometry, or interaction.
 *
 * The declarations live in `@layer reset` inside `packages/core/tailwind/
 * astryx.input.css`, below every `astryx-base` rule, so a component style or a
 * caller's className on the same element still wins. A utility class cannot
 * hold that position: the build sorts utilities by property, not by intent.
 */
export const layerTextResetClassName = 'astryx-layer-text-reset';
