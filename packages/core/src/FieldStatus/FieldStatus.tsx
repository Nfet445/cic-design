// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FieldStatus.tsx
 * @input Uses React, Tailwind classes, the entry animation, the field status
 *   announcement and Icon
 * @output Exports FieldStatus component, FieldStatusProps
 * @position Core implementation; consumed by Field, Switch, CheckboxInput, and the FieldStatus entrypoint
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/FieldStatus/FieldStatus.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Field/Field.doc.mjs (compat docs when public API changes)
 * - /packages/core/src/FieldStatus/index.ts (exports if types change)
 * - /packages/core/src/FieldStatus/useFieldStatusAnnouncement.ts (announcement timing shared with Field)
 * - /packages/core/src/Field/index.ts (compat re-export if public API changes)
 * - /packages/cli/assets/templates/blocks/components/FieldStatus/ (showcase blocks)
 */

'use client';

import React from 'react';
import type {BaseProps} from '../BaseProps';
import {mergeProps} from '../utils/mergeProps';
import {tw} from '../utils/tw';
import type {InputStatusType} from '../Field/types';
import {
  fieldStatusAttachedClassName,
  fieldStatusBaseClassName,
  fieldStatusColorClassName,
  fieldStatusDetachedClassName,
  fieldStatusDetachedContentClassName,
  fieldStatusDetachedIconClassName,
} from './fieldStatusClasses';
import {useEntryAnimation} from '../hooks/useEntryAnimation';
import {themeProps} from '../utils/themeProps';
import {xstyleProps} from '../utils/xstyle';
import {Icon} from '../Icon/Icon';
import type {IconName} from '../Icon';
import type {FieldStatusVariantMap} from './index';
import {useFieldStatusAnnouncement} from './useFieldStatusAnnouncement';

/**
 * Maps each status type to its status glyph. Mirrors the mapping the input
 * controls already use for the on-field status affordance, so the detached
 * message shows the same icon a consumer sees elsewhere for that status.
 */
const statusIconMap: Record<InputStatusType, IconName> = {
  warning: 'warning',
  error: 'error',
  success: 'success',
};

/**
 * FieldStatus variant type. Extensible via module augmentation of FieldStatusVariantMap.
 */
export type FieldStatusVariant = keyof FieldStatusVariantMap;

export interface FieldStatusProps extends BaseProps<HTMLDivElement> {
  /**
   * Ref to the rendered message box.
   */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * The type of status to display.
   */
  type: InputStatusType;
  /**
   * The status message to display.
   */
  message: string;
  /**
   * Visual variant of the status message.
   * - 'attached': Overlaps with input above (used in Field)
   * - 'detached': Floats below with spacing (used in Switch, CheckboxInput)
   * @default 'attached'
   */
  variant?: FieldStatusVariant;
}

// A direct `tooltip` resolves to the deprecated signature first; every other
// call, a `FieldStatusVariant`-typed value included, resolves to the second,
// which `ComponentProps<typeof FieldStatus>` reads.
/**
 * @deprecated FieldStatus has no `tooltip` presentation
 * (`component:FieldStatus` FR7): it draws a plain message box with no tooltip.
 * Set `statusVariant="tooltip"` on the field control instead, which shows the
 * message from its on-field status icon. Removed in the next minor release.
 */
export function FieldStatus(
  props: FieldStatusProps & {variant: 'tooltip'},
): React.JSX.Element;
/**
 * A status message component for form fields: an `attached` message under a
 * field, or a `detached` one with its own status icon.
 *
 * @example
 * ```
 * <FieldStatus type="error" message="This field is required" />
 * ```
 */
export function FieldStatus(props: FieldStatusProps): React.JSX.Element;
/**
 * A status message component for form fields.
 *
 * The `detached` variant renders a leading status icon before the message so
 * status is not conveyed by color or position alone (WCAG 1.4.1). The icon is
 * decorative for assistive tech (`aria-hidden`): the message text already names
 * the status in words and is announced through the live region. The `attached`
 * variant keeps its status affordance on the bordered input, so it renders no
 * icon here to avoid a duplicate. FieldStatus has no `tooltip` presentation:
 * a field control given `statusVariant="tooltip"` surfaces the status through
 * a tooltip on its on-field icon and renders no FieldStatus for it
 * (`component:FieldStatus` FR7).
 *
 * Screen-reader announcements go through the persistent `useAnnounce` live
 * regions (assertive for errors, polite otherwise) rather than `role`/
 * `aria-live` on the rendered element. Live regions that mount together with
 * their content are not reliably announced by assistive technology, and
 * FieldStatus is almost always conditionally rendered by its callers. The
 * message is announced whenever it appears — including on first mount — and
 * whenever it changes.
 *
 * @example
 * ```
 * <FieldStatus
 *   type="error"
 *   message="This field is required"
 * />
 * <FieldStatus
 *   type="warning"
 *   message="This will be visible to others"
 *   variant="detached"
 * />
 * ```
 */
export function FieldStatus({
  ref,
  type,
  message,
  id,
  variant = 'attached',
  xstyle,
  className,
  style,
  ...rest
}: FieldStatusProps) {
  const entryClassName = useEntryAnimation('slideDown');
  // Announce-on-mount is intentional: callers conditionally mount FieldStatus
  // when a status appears (and whole forms can mount with a server-side
  // validation error already present), and both cases must be heard.
  useFieldStatusAnnouncement(message, type);

  return (
    <div
      ref={ref}
      id={id}
      {...rest}
      {...mergeProps(
        themeProps('field-status', {type, variant}),
        xstyleProps(xstyle),
        tw(
          entryClassName,
          fieldStatusBaseClassName,
          variant === 'attached'
            ? fieldStatusAttachedClassName
            : fieldStatusDetachedClassName,
          fieldStatusColorClassName[type],
          className,
        ),
        style,
      )}>
      {variant === 'detached' ? (
        <span className={fieldStatusDetachedContentClassName}>
          <span className={fieldStatusDetachedIconClassName}>
            <Icon
              icon={statusIconMap[type]}
              size="sm"
              color="inherit"
              // Stable theme target on the detached message box's leading glyph
              // itself, so a theme can restyle just this icon (color, size) —
              // and each status — via `defineTheme`. Same-element rules in
              // @layer astryx-theme win over the icon's own base
              // width/height/fontSize, which a field-level target could not
              // reach.
              {...themeProps('field-status-icon', {type})}
            />
          </span>
          <span>{message}</span>
        </span>
      ) : (
        message
      )}
    </div>
  );
}

FieldStatus.displayName = 'FieldStatus';
