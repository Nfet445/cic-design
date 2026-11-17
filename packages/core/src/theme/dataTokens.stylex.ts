// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file dataTokens.stylex.ts
 * @input The data-color defaults and references in `./dataTokenVars`.
 * @output dataVars, DataTokenName, re-exported so importers written against
 *   StyleX keep working while the families migrate.
 * @position Compatibility shim; the values live in `./dataTokenVars`.
 *
 * @deprecated Import `./dataTokenVars` instead. This module only re-exports
 * it, and it disappears when the last family migrates.
 */

/** @deprecated Import `./dataTokenVars` instead. */
export {dataVars} from './dataTokenVars';

/** @deprecated Import `./dataTokenVars` instead. */
export type {DataTokenName} from './dataTokenVars';
