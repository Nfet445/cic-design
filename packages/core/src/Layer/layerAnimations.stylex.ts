// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layerAnimations.stylex.ts
 * @input The class map in `layerAnimationsClasses.ts`
 * @output The same `layerAnimations` lookup, now holding class strings
 * @position Public subpath; kept so `@astryxdesign/core/Layer/
 *   layerAnimations.stylex` keeps resolving while callers move the lookup from
 *   `xstyle` to `className`
 */

export {layerAnimations} from './layerAnimationsClasses';
