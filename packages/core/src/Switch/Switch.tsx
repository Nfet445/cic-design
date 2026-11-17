// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Switch.tsx
 * @input Uses React, useId, ChangeEvent, FieldLabel, FieldStatus, IconType, InputStatus, useTooltip, i18n (useComponentTranslator)
 * @output Exports Switch component, SwitchProps, SwitchLabelPosition, SwitchLabelSpacing
 * @position Core implementation; consumed by index.ts, tested by Switch.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Switch/Switch.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Switch/Switch.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Switch/index.ts (exports if types change)
 * - /apps/storybook/stories/Switch.stories.tsx (storybook stories)
 * - /packages/cli/assets/templates/blocks/components/Switch/ (showcase blocks)
 */

import {
  Fragment,
  useId,
  useMemo,
  useOptimistic,
  useTransition,
  useEffect,
  useRef,
  type ChangeEvent,
  type FocusEvent,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {FieldLabel} from '../Field/FieldLabel';
import {FieldStatus} from '../FieldStatus/FieldStatus';
import type {IconType} from '../Icon';
import type {InputStatus} from '../Field/types';
import {Spinner} from '../Spinner';
import {useTooltip} from '../Tooltip';
import {mergeProps, rtlStyles} from '../utils';
import {switchFocusInput, switchScope} from './switch.markers.stylex';
import type {BaseProps} from '../BaseProps';
import type {SizeValue} from '../utils/types';
import {tw} from '../utils/tw';
import {
  switchClassName,
  switchContainerClassName,
  switchInputClassName,
  switchLabelWrapperClassName,
  switchSizeStyle,
  switchStatusClassName,
  switchThumbBoxClassName,
  switchThumbClassName,
  switchTrackBoxClassName,
  switchTrackClassName,
  switchWrapperClassName,
} from './switchClasses';
import {switchHoverPressStyles} from './switchHoverPress.stylex';
import {themeProps} from '../utils/themeProps';
import {useAnnounce} from '../hooks/useAnnounce';

import {useMergedRefs} from '../hooks/useMergedRefs';
import {usePressFeedback} from '../hooks/usePressFeedback';
import {
  registerEnglishFallback,
  useComponentTranslator,
} from '../i18n/useComponentTranslator';
import english from '../i18n/generated-english/Switch/Switch.generated';

registerEnglishFallback(english);
import {interactionOverlayStyles} from '../utils/interactionOverlay.stylex';
import {pressHoldsDragProps} from '../privateAttributes/pressHoldsDrag.stylex';
import {useSwitchTouch, type SwitchTouchParts} from './useSwitchTouch';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {watchHitArea, writeHitInsets} from '../utils/hitArea';

/**
 * The track box of each size, px (width × height), for the touch
 * presentation's thumb geometry.
 * SYNC: switchClasses.ts (the wrapper's and the track's box).
 */
const TRACK_SIZE = {sm: [32, 20], md: [40, 24]} as const;

export type SwitchLabelPosition = 'start' | 'end';

export type SwitchLabelSpacing = 'hug' | 'spread';

export interface SwitchProps extends Omit<BaseProps, 'onChange'> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLInputElement>;
  /**
   * Label text for the switch (always rendered for accessibility).
   */
  label: string;
  /**
   * Whether to visually hide the label (still accessible to screen readers).
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Description text displayed below the label.
   */
  description?: string;
  /**
   * Callback fired when the switch state changes.
   */
  onChange?: (checked: boolean, e: ChangeEvent<HTMLInputElement>) => void;
  /**
   * Async action on change. Fires after onChange if not prevented.
   */
  changeAction?: (
    checked: boolean,
    e: ChangeEvent<HTMLInputElement>,
  ) => void | Promise<void>;
  /**
   * Whether the switch is in a loading state.
   * @default false
   */
  isLoading?: boolean;
  /**
   * Whether the switch is on or off.
   */
  value: boolean;
  /**
   * Whether the switch is disabled.
   * @default false
   */
  isDisabled?: boolean;

  /**
   * The HTML name attribute for the underlying checkbox input.
   * Useful for form submissions.
   */
  htmlName?: string;

  /**
   * Explains why the switch is disabled. When set together with `isDisabled`,
   * the switch shows a tooltip with this text on hover and keyboard focus, and
   * the control stays focusable (via `aria-disabled`) so the reason is
   * discoverable by keyboard and assistive technology. Activation stays
   * blocked.
   *
   * Use this instead of wrapping a disabled switch in `Tooltip` — disabled
   * controls don't emit the pointer events an external tooltip needs.
   *
   * @example
   * ```
   * <Switch
   *   label="Enable notifications"
   *   value={enabled}
   *   isDisabled
   *   disabledMessage="Notifications are turned off org-wide"
   * />
   * ```
   */
  disabledMessage?: string;
  /**
   * Whether the field is optional. Mutually exclusive with isRequired.
   * @default false
   */
  isOptional?: boolean;
  /**
   * Whether the switch is required. Mutually exclusive with isOptional.
   * @default false
   */
  isRequired?: boolean;
  /**
   * Callback fired when the switch receives focus.
   */
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  /**
   * Callback fired when the switch loses focus.
   */
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  /**
   * Icon to display before the label text.
   */
  labelIcon?: ReactNode | IconType;
  /**
   * Width of the field. Numbers are treated as pixels, strings are used as-is
   * (e.g. `'100%'`). Sizes the whole field (label, control, and status) so they
   * stay aligned, unlike setting width via `xstyle`/`className`/`style`.
   */
  width?: SizeValue;
  /**
   * Tooltip text to display in an info icon at the end of the label.
   */
  labelTooltip?: string;
  /**
   * Which side of the switch the label appears on.
   * - 'start': Label appears before the switch
   * - 'end': Label appears after the switch
   * @default 'end'
   */
  labelPosition?: SwitchLabelPosition;
  /**
   * Spacing behavior between label and switch.
   * - 'hug': Label and switch are positioned next to each other
   * - 'spread': Label and switch are pushed to opposite ends
   * @default 'hug'
   */
  labelSpacing?: SwitchLabelSpacing;
  /**
   * Status indicator for the switch.
   * When set with a message, displays a colored message box below the switch.
   */
  status?: InputStatus;
  /**
   * Size variant controlling track and thumb dimensions.
   * - 'sm': 32x20px (matches sm checkbox/radio vertical rhythm)
   * - 'md': 40x24px (default, matches md checkbox/radio vertical rhythm)
   * @default 'md'
   */
  size?: 'sm' | 'md';
}

/**
 * A toggle switch component for boolean values.
 *
 * @example
 * ```
 * <Switch
 *   label="Enable notifications"
 *   value={enabled}
 *   onChange={setEnabled}
 * />
 * <Switch
 *   label="Dark mode"
 *   description="Switch to a darker color scheme"
 *   value={darkMode}
 *   onChange={setDarkMode}
 * />
 * ```
 */
export function Switch({
  label,
  isLabelHidden = false,
  description,
  onChange,
  changeAction,
  isLoading = false,
  value,
  isDisabled = false,
  htmlName,
  disabledMessage,
  isOptional = false,
  isRequired = false,
  onFocus,
  onBlur,
  labelIcon,
  labelTooltip,
  labelPosition = 'end',
  labelSpacing = 'hug',
  status,
  size = 'md',
  width,
  xstyle,
  className,
  style,
  ref,
  'aria-describedby': ariaDescribedByProp,
  'aria-labelledby': ariaLabelledByProp,
  ...rest
}: SwitchProps) {
  const t = useComponentTranslator();
  const id = useId();
  // The row is the pressable: the input, the track and the label all sit
  // inside it, and the pressed arms above read the row's scope marker.
  const pressable = usePressFeedback();
  const descriptionID = useId();
  const statusMessageID = useId();

  const [, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const isBusy = isLoading || optimisticValue !== value;

  const announce = useAnnounce();
  // One announcement per busy start (spec:AST-086 FR6). The ref outlives
  // StrictMode's effect replay and rerenders, so only a new busy start (busy
  // again after settling) speaks again.
  const announcedBusyRef = useRef(false);
  useEffect(() => {
    if (!isBusy) {
      announcedBusyRef.current = false;
      return;
    }
    if (announcedBusyRef.current) {
      return;
    }
    announcedBusyRef.current = true;
    announce(t('@astryx.switch.loading'));
  }, [announce, isBusy, t]);

  const isOn = optimisticValue === true;

  // Disabled-reason tooltip. Disabled controls swallow pointer events, so the
  // tooltip listeners attach to the switch row (which already exists) and the
  // native checkbox stays perceivable via aria-disabled instead of the disabled
  // attribute. Toggling is blocked by the isDisabled guard in onChange.
  const showsDisabledMessage = isDisabled && !!disabledMessage;
  const disabledMessageTooltip = useTooltip({
    placement: 'above',
    // The container row is not naturally focusable; focusin bubbles up from the
    // native input, so always attach focus listeners.
    focusTrigger: 'always',
    isEnabled: showsDisabledMessage,
  });

  // Build aria-describedby from description and status message
  // Only include descriptionID when the element actually renders.
  // FieldLabel renders the description (with descriptionID) even when the
  // label is visually hidden — it's sr-only, so keep it linked.
  // A consumer's own `aria-describedby` describes the control, so it comes
  // first here rather than landing on the field wrapper via `...rest`.
  const describedByParts: string[] = [];
  if (ariaDescribedByProp) {
    describedByParts.push(ariaDescribedByProp);
  }
  if (description) {
    describedByParts.push(descriptionID);
  }
  if (status?.message) {
    describedByParts.push(statusMessageID);
  }
  if (showsDisabledMessage) {
    describedByParts.push(disabledMessageTooltip.describedBy);
  }
  const ariaDescribedBy =
    describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

  // The touch presentation (coarse pointer): its parts are always rendered;
  // CSS shows them under a finger and the hook animates and listens there.
  const surfaceRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchParts = useMemo<SwitchTouchParts>(
    () => ({
      surface: surfaceRef,
      input: inputRef,
      thumb: thumbRef,
      track: trackRef,
    }),
    [],
  );
  // The track in a state: its theme target and fill. The other state's, for
  // the fade layer's colour (switchFill.ts).
  const trackPropsFor = (on: boolean) =>
    mergeProps(
      themeProps('switch', {
        checked: on ? 'checked' : null,
        disabled: isDisabled ? 'disabled' : null,
        size,
      }),
      stylex.props(
        switchHoverPressStyles.focusRing,
        on
          ? switchHoverPressStyles.trackOnHover
          : switchHoverPressStyles.trackOffHover,
        switchHoverPressStyles.trackPress,
      ),
      tw(
        switchTrackBoxClassName({size}),
        switchTrackClassName({size, isOn: on, isDisabled}),
      ),
    );
  // Syncs the hit area's insets with the layout around the switch, through
  // utils/hitArea's observers. Under a coarse pointer they grow toward 44 px,
  // stopping at half the gap to each neighbouring target. A disabled switch
  // watches nothing.
  useIsomorphicLayoutEffect(() => {
    const surface = surfaceRef.current;
    if (surface == null || isDisabled) {
      return;
    }
    return watchHitArea(surface, insets => writeHitInsets(surface, insets));
  }, [isDisabled]);
  useSwitchTouch(touchParts, {
    isOn,
    isInteractive: !isDisabled && !isBusy,
    isDisabled,
    trackSize: TRACK_SIZE[size],
    otherTrackProps: trackPropsFor(!isOn),
  });

  const switchElement = (
    <div
      ref={surfaceRef}
      className={switchWrapperClassName({
        size,
        isInteractive: !isDisabled && !isBusy,
      })}>
      <input
        ref={useMergedRefs(ref, disabledMessageTooltip.positionRef, inputRef)}
        id={id}
        type="checkbox"
        role="switch"
        // Withhold the name while disabled: the input stays focusable (not
        // natively disabled), and a disabled control must not submit.
        name={isDisabled ? undefined : htmlName}
        checked={isOn}
        // Focusable but detached from the form while disabled (spec:AST-085).
        aria-disabled={isDisabled ? 'true' : undefined}
        form={isDisabled ? '' : undefined}
        required={isRequired}
        // A form's required default sets nothing here: an off switch is an answer.
        aria-required={isRequired ? 'true' : undefined}
        onChange={e => {
          if (isDisabled || isBusy) {
            return;
          }
          const checked = e.target.checked;
          onChange?.(checked, e);
          if (changeAction && !e.defaultPrevented) {
            startTransition(async () => {
              setOptimisticValue(checked);
              await changeAction(checked, e);
            });
          }
        }}
        onFocus={onFocus}
        onBlur={onBlur}
        // A caller's `aria-labelledby` names the control (a visible title
        // elsewhere in the row, for example), so it reaches the input rather
        // than the field wrapper via `...rest`.
        aria-labelledby={ariaLabelledByProp}
        aria-describedby={ariaDescribedBy}
        // Chromium reports an unchecked native-required checkbox invalid before
        // any interaction; the invalid state follows status instead.
        aria-invalid={
          status?.type === 'error' ? true : isRequired ? false : undefined
        }
        aria-busy={isBusy || undefined}
        {...mergeProps(
          tw(switchInputClassName({isBusy})),
          stylex.props(
            rtlStyles.centerInline('-50%'),
            switchHoverPressStyles.inputBox,
            switchFocusInput,
          ),
        )}
      />
      <div ref={trackRef} aria-hidden="true" {...trackPropsFor(isOn)}>
        <div
          ref={thumbRef}
          {...mergeProps(
            themeProps('switch-thumb', {
              checked: isOn ? 'checked' : null,
              size,
            }),
            stylex.props(switchHoverPressStyles.thumbPress),
            tw(
              switchThumbBoxClassName({size, isOn}),
              switchThumbClassName({isOn}),
            ),
          )}>
          {isBusy && <Spinner size="sm" />}
        </div>
      </div>
    </div>
  );

  const labelElement = (
    <div className={switchLabelWrapperClassName({size})}>
      <FieldLabel
        // See CheckboxInput: the control names its own label target rather
        // than the label guessing at its placement.
        {...themeProps('switch-label')}
        label={label}
        inputID={id}
        isLabelHidden={isLabelHidden}
        isDisabled={isDisabled}
        isOptional={isOptional}
        isRequired={isRequired}
        labelIcon={labelIcon}
        labelTooltip={labelTooltip}
        description={description}
        descriptionID={descriptionID}
      />
    </div>
  );

  return (
    <div
      {...mergeProps(
        themeProps('switch-field', {
          labelPosition: labelPosition !== 'end' ? labelPosition : undefined,
          labelSpacing: labelSpacing !== 'hug' ? labelSpacing : undefined,
        }),
        stylex.props(xstyle),
        tw(switchClassName({width}), className),
        {...switchSizeStyle(width), ...style},
      )}
      {...rest}
      // Native `disabled` suppressed clicks and key events on the switch; the
      // switch is no longer natively disabled, so withhold the caller's
      // handlers while disabled (spec:AST-085 FR2).
      onClick={isDisabled ? undefined : rest.onClick}
      onKeyDown={isDisabled ? undefined : rest.onKeyDown}
      onKeyUp={isDisabled ? undefined : rest.onKeyUp}>
      <div
        ref={el => {
          // Interaction (hover/focus) listeners for the disabled-message
          // tooltip attach to the whole row for a larger trigger target;
          // positioning anchors on the switch itself (above) so the tooltip
          // appears next to the control, not the far edge of the row.
          // Handlers are gated internally by isEnabled, so attaching
          // unconditionally is safe.
          disabledMessageTooltip.interactionRef(el);
        }}
        {...(isDisabled ? undefined : pressable)}
        {...pressHoldsDragProps(!isDisabled)}
        {...mergeProps(
          tw(
            switchContainerClassName({
              isLabelHidden,
              isSpread: labelSpacing === 'spread',
            }),
          ),
          stylex.props(
            !isDisabled && switchScope,
            // The touch press's strength and release live on the row the
            // controller writes to; the track and thumb inherit and paint it.
            !isDisabled && interactionOverlayStyles.pressedAlpha,
            !isDisabled && switchHoverPressStyles.pressStrength,
          ),
        )}>
        {' '}
        {/* Keyed, so a labelPosition change moves the nodes instead of
            rebuilding them: the touch controller stays on the input, track
            and thumb it attached to. */}
        {labelPosition === 'start'
          ? [
              <Fragment key="label">{labelElement}</Fragment>,
              <Fragment key="switch">{switchElement}</Fragment>,
            ]
          : [
              <Fragment key="switch">{switchElement}</Fragment>,
              <Fragment key="label">{labelElement}</Fragment>,
            ]}
      </div>
      {status?.message && (
        <FieldStatus
          type={status.type}
          message={status.message}
          id={statusMessageID}
          variant="detached"
          className={switchStatusClassName}
        />
      )}
      {showsDisabledMessage &&
        disabledMessageTooltip.renderTooltip(disabledMessage)}
    </div>
  );
}

Switch.displayName = 'Switch';
