// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layerResetClasses.ts
 * @input The class name the Tailwind sheet defines for the layer root reset
 * @output Tailwind class for the box reset of a layer's root element
 * @position Private Core styling; the layer runtime in `useLayer.tsx` applies it
 *
 * A layer root is a popover in the top layer. The UA gives `[popover]` a
 * margin, and a consumer's reset may give it padding, a border or a canvas
 * background. Zeroing them here lets a component's surface, a caller's
 * `className` or `xstyle` set each one without cancelling anything first.
 *
 * The declarations live in the `reset` sublayer of `astryx-base` in
 * `packages/core/tailwind/astryx.input.css`, below every `astryx-base` rule,
 * so any class or StyleX declaration on the same element still wins.
 */
export const layerResetClassName = 'astryx-layer-reset';
