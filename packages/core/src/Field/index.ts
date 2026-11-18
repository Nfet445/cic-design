// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Imports Field component and types from Field.tsx, FieldLabel from FieldLabel.tsx, FieldStatus from FieldStatus.tsx
 * @output Exports Field, FieldProps, FieldStatusInput, FieldStatusType, FieldLabel, FieldLabelProps, FieldStatus component,
 *   the shared input types (including the text-entry keyboard trait types), and
 *   the input box classes a consumer's own control paints
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Field/Field.doc.mjs
 */

export {Field} from './Field';
export type {FieldProps, FieldStatusInput, FieldStatusType} from './Field';
export {FieldLabel} from './FieldLabel';
export type {FieldLabelProps} from './FieldLabel';
export {FieldStatus} from '../FieldStatus';
export type {
  FieldStatusProps,
  FieldStatusVariant,
  FieldStatusVariantMap,
} from '../FieldStatus';
export type {FieldStatusPlacement} from './fieldStatusPlacement';

// Shared input types
export type {InputStatus, InputStatusType, InputSize} from './types';
export type {
  FieldInputBaseProps,
  FieldContainerStyleProps,
  FieldControlStyleProps,
  FieldPartStyleProps,
} from './fieldParts';
export type {AutoCapitalize, EnterKeyHint, InputMode} from './textEntryTraits';

// Input box classes for a consumer's own control
// One class owns `border-color`, so the wrapper takes the status and picks the
// class; `fieldStatusBorderClassName` alone is for a box that paints its own.
export {
  fieldInputWrapperClassName,
  fieldInputWrapperDisabledClassName,
  fieldStatusBorderClassName,
} from './fieldClasses';

// Shared input styles
export {inputStatusHoverShadowStyles} from './inputStyles.stylex';

// Shared input components
export {InputClearButton} from './InputClearButton';
