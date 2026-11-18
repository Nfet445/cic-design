// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tokens.stylex.ts
 * @input The token defaults and references in `./tokenVars`.
 * @output The same names, re-exported so importers written against StyleX keep
 *   working while the families migrate.
 * @position Compatibility shim; the values live in `./tokenVars`.
 *
 * @deprecated Import `./tokenVars` instead. This module only re-exports it, and
 * it disappears when the last family migrates (spec:AST-119 FR4).
 */

/** @deprecated Import `./tokenVars` instead. */
export {
  colorDefaults,
  colorVars,
  spacingDefaults,
  spacingVars,
  sizeDefaults,
  sizeVars,
  borderDefaults,
  borderVars,
  focusDefaults,
  focusVars,
  radiusDefaults,
  radiusVars,
  shadowDefaults,
  shadowVars,
  durationDefaults,
  durationVars,
  easeDefaults,
  easeVars,
  typographyDefaults,
  typographyVars,
  textSizeDefaults,
  textSizeVars,
  fontWeightDefaults,
  fontWeightVars,
  typeScaleDefaults,
  typeScaleVars,
} from './tokenVars';

/** @deprecated Import `./tokenVars` instead. */
export type {
  ColorVarName,
  SpacingVarName,
  SizeVarName,
  BorderVarName,
  FocusVarName,
  RadiusVarName,
  ShadowVarName,
  DurationVarName,
  EaseVarName,
  TypographyVarName,
  TextSizeVarName,
  FontWeightVarName,
  TypeScaleVarName,
} from './tokenVars';
