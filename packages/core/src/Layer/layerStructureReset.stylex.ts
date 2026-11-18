// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layerStructureReset.stylex.ts
 * @input The class name in `layerStructureResetClasses.ts`
 * @output The same class, under the subpath callers already import
 * @position Public subpath; kept so `@astryxdesign/core/Layer/
 *   layerStructureReset.stylex` keeps resolving while callers move the reset
 *   from `stylex.props` to `className`
 */

export {layerStructureResetClassName} from './layerStructureResetClasses';
