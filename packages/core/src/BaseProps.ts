// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BaseProps.ts
 * @input None (pure type definitions)
 * @output Exports BaseProps — the shared base interface for all Astryx components
 * @position Type foundation; extended by all component prop interfaces
 *
 * Keeps: event handlers, aria-*, role, tabIndex, hidden, draggable, inert,
 * dir, className, style, id, xstyle, data-*.
 * Omits: title, contentEditable, and obscure/non-standard HTML attributes.
 */

import type React from 'react';
import type {AstryxXStyle} from './utils/xstyle';

/**
 * Base props shared by all Astryx components.
 *
 * Omits props that are footguns, deprecated, or irrelevant to component APIs.
 * Components that genuinely need an omitted prop can declare it explicitly.
 */
export interface BaseProps<T extends HTMLElement = HTMLElement> extends Omit<
  React.HTMLAttributes<T>,
  | 'children'
  | 'title'
  | 'contentEditable'
  | 'dangerouslySetInnerHTML'
  | 'suppressContentEditableWarning'
  | 'suppressHydrationWarning'
  // Obscure
  | 'accessKey'
  | 'autoCapitalize'
  | 'autoFocus'
  | 'contextMenu'
  | 'enterKeyHint'
  | 'lang'
  | 'nonce'
  | 'slot'
  | 'spellCheck'
  | 'translate'
  | 'radioGroup'
  | 'inputMode'
  | 'is'
  // RDFa
  | 'about'
  | 'content'
  | 'datatype'
  | 'inlist'
  | 'prefix'
  | 'property'
  | 'rel'
  | 'resource'
  | 'rev'
  | 'typeof'
  | 'vocab'
  // Non-standard
  | 'autoCorrect'
  | 'autoSave'
  | 'color'
  | 'results'
  | 'security'
  | 'unselectable'
  // Microdata
  | 'itemProp'
  | 'itemScope'
  | 'itemType'
  | 'itemID'
  | 'itemRef'
  // Popover API (use Popover)
  | 'popover'
  | 'popoverTargetAction'
  | 'popoverTarget'
  // Shadow DOM
  | 'exportparts'
  // Form defaults
  | 'defaultChecked'
  | 'defaultValue'
> {
  /**
   * The consumer's own override, applied after the component's classes and
   * before `style`. A class is the consumer's CSS, which is unlayered, so it
   * wins over the component's paint. An object is inline style, which wins over
   * both.
   *
   * @example
   * ```
   * <Component xstyle="my-app-field" />
   * <Component xstyle={{'--field-width': '12rem'}} />
   * ```
   */
  xstyle?: AstryxXStyle;

  /** Allow data-* attributes for telemetry, testing, integration hooks, and
   * Astryx component prop/state reflection (for example data-variant/data-size). */
  [key: `data-${string}`]: string | undefined;
}
