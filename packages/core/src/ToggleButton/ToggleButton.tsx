// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ToggleButton.tsx
 * @input Uses Button, React, theme props
 * @output Exports ToggleButton component and types
 * @position Thin wrapper over Button; adds controlled toggle pattern
 *
 * ToggleButton wraps Button with `isPressed` and adds:
 * - `onPressedChange` from internal `onClick`, after any caller `onClick`;
 *   `pressedChangeAction` via Button
 * - `pressedIcon` for outline-to-filled icon swap
 * - Font weight shift on press with width reservation to prevent layout shift
 * - Group integration via ToggleButtonGroupContext
 *
 * Its class strings live in `toggleButtonClasses.ts`.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/ToggleButton/index.ts (exports if types change)
 * - /apps/storybook/stories/ToggleButton.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/ToggleButton/ (showcase blocks)
 */

import React, {use, useOptimistic, type ReactNode} from 'react';

import {Button, type ButtonSize} from '../Button';
import {
  PressGroupBandContext,
  PressGroupContext,
} from '../hooks/pressGroupContext';
import {GROUP_PRESS_POINTERS} from '../hooks/useGroupPressTracking';
import type {Elevation} from '../utils/types';
import {useToggleButtonGroup} from './ToggleButtonGroup';
import {
  toggleButtonClassName,
  toggleButtonLabelClassName,
  toggleButtonLabelPressedClassName,
  toggleButtonLabelReservationClassName,
} from './toggleButtonClasses';
import type {BaseProps} from '../BaseProps';
import {themeDataAttributes, themeProps} from '../utils/themeProps';
import {mergeProps} from '../utils/mergeProps';

// =============================================================================
// Props
// =============================================================================

export interface ToggleButtonProps extends BaseProps<HTMLButtonElement> {
  ref?: React.Ref<HTMLButtonElement>;
  /**
   * Accessible label for the button (required).
   * Used as visible text, or as aria-label for icon-only buttons.
   */
  label: string;

  /**
   * Whether the button is currently pressed/active.
   * When used inside ToggleButtonGroup, this is controlled by the group
   * and this prop is ignored.
   */
  isPressed?: boolean;

  /**
   * Called when the pressed state should change. Receives the next pressed
   * state and the originating click event. Call `event.preventDefault()` to
   * opt out of running `pressedChangeAction` (e.g. to handle the toggle
   * entirely in this callback).
   * When used inside ToggleButtonGroup, this is handled by the group
   * and this prop is ignored.
   */
  onPressedChange?: (
    isPressed: boolean,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => void;

  /**
   * Action handler for API- or navigation-backed toggles, run through Button's
   * clickAction transition after onPressedChange unless that callback prevents
   * default. It also runs without a callback. Omit it for callback-only toggles
   * that need no Action transition. The button shows a loading spinner while
   * the action is pending, including synchronous actions that suspend.
   * Ignored when a value identifies this button as a ToggleButtonGroup member.
   *
   * @example
   * ```
   * <ToggleButton
   *   label="Favorite"
   *   isPressed={isFavorited}
   *   onPressedChange={setIsFavorited}
   *   pressedChangeAction={async (newState) => {
   *     await api.setFavorite(itemId, newState);
   *   }}
   * />
   * ```
   */
  pressedChangeAction?: (isPressed: boolean) => void | Promise<void>;

  /**
   * The size of the toggle button.
   * When used inside ToggleButtonGroup, defaults to the group's size.
   * @default 'md'
   */
  size?: ButtonSize;

  /**
   * Resting elevation — the shadow depth the button sits at, mirroring
   * Button's `elevation` for floating (FAB-style) toggle buttons.
   * `none` is the default flat button. Applies inside a
   * ToggleButtonGroup as well — grouped children retain their own
   * elevation.
   * @default 'none'
   */
  elevation?: Elevation;

  /**
   * Whether the button is disabled.
   * When used inside ToggleButtonGroup, a disabled group disables this button
   * too, but an enabled group does not re-enable a button that disables itself.
   * @default false
   */
  isDisabled?: boolean;

  /**
   * Whether the button is in a loading state.
   * @default false
   */
  isLoading?: boolean;

  /**
   * Icon element rendered before the label text.
   */
  icon?: ReactNode;

  /**
   * When true, renders as a square icon-only button with `label` as aria-label
   * and an automatic tooltip from the label.
   * @default false
   */
  isIconOnly?: boolean;

  /**
   * Icon element to render when the button is pressed.
   * Use to swap between outline (unpressed) and filled (pressed) icon styles.
   * Falls back to `icon` if not provided.
   *
   * To color the pressed icon, pass an already-colored element:
   * @example
   * ```
   * pressedIcon={<StarIconSolid style={{color: 'var(--color-icon-yellow)'}} />}
   * ```
   */
  pressedIcon?: ReactNode;

  /**
   * Optional visible content. When provided, rendered instead of `label`
   * as the visible text.
   */
  children?: ReactNode;

  /**
   * Tooltip text shown on hover.
   * Passed through to Button.
   */
  tooltip?: string;

  /**
   * Value identifier when used inside ToggleButtonGroup.
   * Required when used in a group.
   */
  value?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * A button that toggles between pressed and unpressed states.
 * Thin wrapper over Button — adds controlled toggle pattern,
 * icon swap, and font weight emphasis.
 *
 * Use for toolbar actions, view mode switches, and formatting controls.
 * For on/off settings, use Switch instead.
 *
 * Works standalone (with `isPressed`/`onPressedChange`) or inside
 * ToggleButtonGroup (which controls selection via `value`).
 *
 * @example
 * ```
 * const [isBold, setIsBold] = useState(false);
 * <ToggleButton
 *   label="Bold"
 *   icon={<BoldIcon />}
 *   isPressed={isBold}
 *   onPressedChange={setIsBold}
 * />
 * ```
 */
export function ToggleButton({
  ref,
  label,
  isPressed: isPressedProp,
  onPressedChange: onPressedChangeProp,
  pressedChangeAction,
  size: sizeProp,
  elevation = 'none',
  isDisabled: isDisabledProp = false,
  isLoading = false,
  icon,
  isIconOnly = false,
  pressedIcon,
  children,
  tooltip,
  value,
  xstyle,
  className,
  style,
  onClick: onClickProp,
  ...props
}: ToggleButtonProps): ReactNode {
  const group = useToggleButtonGroup();

  const committedPressed =
    group && value != null
      ? group.selectedValues.has(value)
      : (isPressedProp ?? false);
  const size = sizeProp ?? group?.size ?? 'md';
  // Either source disabling this button is enough. `??` could not express that:
  // the group always supplies a boolean (its own prop defaults to false), so the
  // fallback never ran and an enabled group handed a member that had disabled
  // itself its availability back. A group still disables everything it contains
  // — that is the half `??` got right — but it cannot re-enable a member
  // (family:buttons FR3).
  const isDisabled = (group?.isDisabled ?? false) || isDisabledProp;

  const [optimisticPressed, setOptimisticPressed] =
    useOptimistic(committedPressed);
  const isPressed = optimisticPressed;
  // Both paths use the same in-flight intent, so re-clicks reverse a pending
  // toggle rather than deriving from the stale controlled value.
  const nextPressed = !isPressed;
  const resolvedIcon = isPressed && pressedIcon ? pressedIcon : icon;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      return;
    }
    // A caller onClick (a trigger wrapper often supplies one) runs first and
    // never replaces the toggle's own request (family:buttons FR5, FR11).
    const wasPrevented = event.defaultPrevented;
    onClickProp?.(event);
    if (group && value != null) {
      group.toggle(value);
      event.preventDefault();
      return;
    }
    // A standalone toggle is cancelled only by the caller's own
    // preventDefault(); Button then skips pressedChangeAction too.
    if (!wasPrevented && event.defaultPrevented) {
      return;
    }

    onPressedChangeProp?.(nextPressed, event);
  };

  // Button runs onClick first and skips clickAction when the callback prevents
  // default. Its transition owns both the optimistic update and pending UI.
  const clickAction =
    pressedChangeAction && !(group && value != null)
      ? async () => {
          setOptimisticPressed(nextPressed);
          await pressedChangeAction(nextPressed);
        }
      : undefined;

  // isIconOnly prop is the source of truth for icon-only rendering.
  const labelContent =
    // eslint-disable-next-line @astryx/no-nullish-jsx-guard -- switching to isRenderable would show `label` for children of '', false or true, a visible change that needs a decision
    children != null ? (
      <span className={toggleButtonLabelClassName}>
        <span
          className={isPressed ? toggleButtonLabelPressedClassName : undefined}>
          {children}
        </span>
        <span
          className={toggleButtonLabelReservationClassName}
          aria-hidden="true">
          {children}
        </span>
      </span>
    ) : !isIconOnly ? (
      <span className={toggleButtonLabelClassName}>
        <span
          className={isPressed ? toggleButtonLabelPressedClassName : undefined}>
          {label}
        </span>
        <span
          className={toggleButtonLabelReservationClassName}
          aria-hidden="true">
          {label}
        </span>
      </span>
    ) : undefined;

  // In a group, the group tracks only a toggle with a value. A toggle without
  // one keeps its own press. Outside a group, the toggle follows its parent.
  const parentPointers = use(PressGroupContext);
  const groupPointers =
    group == null
      ? parentPointers
      : group.tracksPress === true && value != null
        ? GROUP_PRESS_POINTERS
        : null;

  // The group's hit layer is the touch band of each toggle it tracks.
  const isInGroupBand = group != null && groupPointers != null;

  // The toggle's own surface classes follow the theme class and precede a
  // caller's class, so a caller's utility still wins the cascade.
  const surfaceClassName = toggleButtonClassName({isPressed});

  return (
    <PressGroupContext value={groupPointers}>
      <PressGroupBandContext value={isInGroupBand}>
        <Button
          ref={ref}
          label={label}
          variant="ghost"
          size={size}
          elevation={elevation}
          isDisabled={isDisabled}
          isLoading={isLoading}
          isInterruptible
          isIconOnly={isIconOnly}
          icon={resolvedIcon}
          tooltip={tooltip}
          {...mergeProps(
            themeProps('toggle-button', {
              isPressed: isPressed ? 'true' : 'false',
              elevation,
            }),
            {className: surfaceClassName},
            className,
          )}
          xstyle={xstyle}
          style={style}
          onClick={handleClick}
          clickAction={clickAction}
          {...props}
          // The pressed state this component owns wins over a caller's
          // same-named attributes (public-component-api INV5).
          aria-pressed={isPressed}
          {...themeDataAttributes({
            isPressed: isPressed ? 'true' : 'false',
            elevation,
          })}>
          {labelContent}
        </Button>
      </PressGroupBandContext>
    </PressGroupContext>
  );
}

ToggleButton.displayName = 'ToggleButton';
