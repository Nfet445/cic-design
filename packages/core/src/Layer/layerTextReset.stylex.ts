// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layerTextReset.stylex.ts
 * @input The class name in `layerTextResetClasses.ts`
 * @output The same class, under the subpath callers already import
 * @position Public subpath; kept so `@astryxdesign/core/Layer/
 *   layerTextReset.stylex` keeps resolving while callers move the reset from
 *   `stylex.props` to `className`
 */

export {layerTextResetClassName} from './layerTextResetClasses';
