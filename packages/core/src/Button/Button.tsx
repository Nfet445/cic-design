// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Button.tsx
 * @input Uses React, ButtonHTMLAttributes, ReactNode, i18n (useComponentTranslator), group contexts
 * @output Exports Button component, ButtonProps, ButtonVariant types
 * @position Core implementation; consumed by index.ts, tested by Button.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Button/Button.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Button/Button.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Button/index.ts (exports if types change)
 * - /apps/storybook/stories/Button.stories.tsx (storybook stories)
 * - /packages/cli/assets/templates/blocks/components/Button/ (showcase blocks)
 *
 * Last synced props: label, variant, size, isDisabled, isLoading, isInterruptible, clickAction, icon, isIconOnly, width, children, tooltip, endContent, href, as, target, rel
 */

import {
  isValidElement,
  use,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from 'react';
import type {BaseProps} from '../BaseProps';
import type {Elevation, SizeValue} from '../utils/types';
import * as stylex from '@stylexjs/stylex';
import {useTooltip} from '../Tooltip/useTooltip';
import {Spinner} from '../Spinner/Spinner';
import {Icon} from '../Icon/Icon';
import {VisuallyHidden} from '../VisuallyHidden/VisuallyHidden';
import {IconDefaultSizeProvider} from '../Icon/IconDefaultSizeContext';
import {iconBoxSizeStyles, type IconSize} from '../Icon/IconSize.stylex';

import {EDGE_COMP_ATTR} from '../Layout/edgeCompensation.stylex';
import {useSize} from '../SizeContext/SizeContext';
import {useButtonGroup} from '../ButtonGroup/ButtonGroupContext';
import {useIsHydrating} from '../hooks/useIsHydrating';
import {
  PressGroupBandContext,
  PressGroupContext,
  pressGroupItemProps,
} from '../hooks/pressGroupContext';
import {useInputGroup} from '../InputGroup/InputGroupContext';
import {InputGroupInternalContext} from '../InputGroup/InputGroupInternalContext';
import {
  groupStyles as inputGroupStyles,
  inputGroupItemProps,
} from '../InputGroup/groupStyles';
import {mergeProps} from '../utils/mergeProps';
import {useMergedRefs} from '../hooks/useMergedRefs';
import {useTouchHitArea} from '../utils/touchHitArea';
import {ButtonHitAreaContext} from './buttonHitArea';
import {touchHitAreaStyles} from '../internal/touchHitArea.stylex';
import {useLinkComponent} from '../Link/useLinkComponent';
import type {LinkComponentType} from '../Link/types';
import {themeProps} from '../utils/themeProps';
import {focusOutlineProps} from '../utils/focusOutline.stylex';
import {interactionOverlayStyles} from '../utils/interactionOverlay.stylex';
import {
  controlPressLayerStyles,
  rowPressLayerStyles,
} from '../privateAttributes/press.stylex';
import {usePressFeedback} from '../hooks/usePressFeedback';
import type {ButtonVariantMap} from './index';
import {
  registerEnglishFallback,
  useComponentTranslator,
} from '../i18n/useComponentTranslator';
import english from '../i18n/generated-english/Button/Button.generated';
import {isRenderable} from '../utils/isRenderable';
import {
  buttonClassName,
  buttonContentClassName,
  buttonEndContentClassName,
  buttonForcedColorsEdgeClassName,
  buttonHiddenContentClassName,
  buttonHiddenContentDelayedClassName,
  buttonIconWrapperClassName,
  buttonLabelClassName,
  buttonLinkClassName,
  buttonPressClassName,
  buttonSpinnerDelayedClassName,
  buttonSpinnerOverlayClassName,
  buttonTrackedOverlayClassName,
  buttonTrackedPressClassName,
  buttonWidthClassName,
  buttonWidthVar,
} from './buttonClasses';
import {tw} from '../utils/tw';

registerEnglishFallback(english);

/** Inline variable that carries a consumer's width; the class reads it. */
type WidthStyle = React.CSSProperties &
  Partial<Record<typeof buttonWidthVar, string>>;

/** `aria-haspopup` values of a trigger that keeps its own press and opening. */
const MENU_POPUPS: ReadonlySet<string> = new Set(['true', 'menu', 'listbox']);

/**
 * Button variant type derived from ButtonVariantMap.
 * Extensible via module augmentation of ButtonVariantMap.
 */
export type ButtonVariant = keyof ButtonVariantMap;

export type ButtonSize = 'sm' | 'md' | 'lg';

const iconSizeByButtonSize = {
  sm: 'sm',
  md: 'sm',
  lg: 'md',
} satisfies Record<ButtonSize, IconSize>;

export interface ButtonProps extends BaseProps<HTMLButtonElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLButtonElement>;
  /** HTML button type attribute. @default 'button' */
  type?: 'button' | 'submit' | 'reset';
  /** HTML name attribute for form submission. */
  name?: string;
  /** HTML value attribute for form submission. */
  value?: string | number | ReadonlyArray<string>;
  /** Associates the button with a form element by ID. */
  form?: string;
  /**
   * Accessible label for the button (required for accessibility).
   * Rendered as visible text by default. When `isIconOnly` is true,
   * used as aria-label instead.
   */
  label: string;
  /**
   * The visual style variant of the button.
   * @default 'secondary'
   */
  variant?: ButtonVariant;
  /**
   * The size of the button.
   * @default 'md'
   */
  size?: ButtonSize;
  /**
   * Resting elevation — the shadow depth the button sits at. Use for floating
   * buttons (FABs) that hover above content. `none` is the default flat button.
   * @default 'none'
   */
  elevation?: Elevation;
  /**
   * Whether the button is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether the button is in a loading state. Loading prevents interaction
   * without dimming the spinner; explicit disabled states remain dimmed.
   * @default false
   */
  isLoading?: boolean;
  /**
   * Keep the button interactive while a `clickAction` is pending. The loading
   * state still renders the spinner and `aria-busy`, but the button is not
   * disabled and the in-flight action is not deduped — so a re-click lands and
   * interrupts the previous action with a fresh one. Use for interruptible
   * actions (e.g. a toggle whose action can be re-triggered before the previous
   * one settles), not fire-once actions (submit/save/pay).
   * @default false
   */
  isInterruptible?: boolean;
  /**
   * Click handler. For async actions that should show a loading state,
   * use `clickAction` instead.
   */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /**
   * Async click action. Shows loading state while pending.
   */
  clickAction?: (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => void | Promise<void>;
  /**
   * Icon element rendered before the label text.
   */
  icon?: ReactNode;
  /**
   * When true, renders as a square icon-only button with `label` as aria-label.
   * Requires `icon` to be provided.
   * @default false
   */
  isIconOnly?: boolean;
  /**
   * Width of the button. Numbers are treated as pixels, strings are used as-is
   * (e.g. `'100%'` for a full-width button). By default the button sizes to
   * its content.
   */
  width?: SizeValue;
  /**
   * Optional visible content. When provided, rendered instead of `label` as the
   * visible text (label still serves as the accessible name via aria-label).
   */
  children?: ReactNode;
  /**
   * Content rendered after the label text (badge, icon, chevron, etc.).
   * Ignored when `isIconOnly` is true to preserve square aspect ratio.
   *
   * Wrapped in a container that inherits the button's text color,
   * so child elements match the button variant's color automatically.
   */
  endContent?: ReactNode;
  /**
   * Tooltip text shown on hover.
   */
  tooltip?: string;
  /**
   * When provided, renders the button as a link (`<a>` or custom component).
   * When the button is disabled, still renders as `<button>` regardless of href
   * (disabled links are an accessibility anti-pattern).
   */
  href?: string;
  /**
   * Custom link component to use when `href` is provided.
   * Overrides the provider-level default set by LinkProvider.
   * Useful for Next.js `<Link>` or other router-aware components.
   */
  as?: LinkComponentType;
  /**
   * HTML target attribute for the link. Only applies when `href` is provided.
   */
  target?: string;
  /**
   * HTML rel attribute for the link. Only applies when `href` is provided.
   */
  rel?: string;
}

/**
 * "I am the last member of the group" — the trailing end cap.
 *
 * NOT `:last-child`: several members render an invisible layer element AFTER
 * their button (a tooltip'd Button returns button + layer; DropdownMenu returns
 * trigger + popover). `useLayer` renders those inline rather than portaling
 * them, so the layer — not the button — took the `:last-child` slot and the real
 * trailing button silently kept square corners (#2508).
 *
 * Layers always carry the native `popover` attribute (useLayer.tsx), and a
 * popover is never an in-flow member — it is `display: none` until shown, then
 * promoted to the top layer. Context layers also retain an inert `<template>`
 * marker so they can re-resolve their JSX position. Neither element is a group
 * member, so "last member" is: no following element sibling besides those
 * pieces of layer infrastructure — the last sibling that is not one of them.
 *
 * Written as `:nth-last-child(1 of …)`, not `:not(:has(~ …))`: the stylesheet
 * is global, and WebKit re-evaluates a sibling-relative `:has()` against every
 * earlier sibling on each insertion, so filling any container on the page
 * became quadratic (ButtonGroup FR3). A member is never layer infrastructure,
 * so being the last such sibling is the same as having none after it.
 *
 * Reading it the other way round — marking the *buttons* and testing for a
 * marked sibling — is the trap: it silently reclassifies anything it doesn't
 * recognise as "not a member", so a member wrapped in a `display: contents`
 * wrapper (Tooltip, HoverCard) or a raw child would make the button BEFORE it
 * round mid-group. Ignoring known layers keeps the predicate conservative: an
 * unrecognised sibling still counts, exactly as `:last-child` did, so the worst
 * case degrades to the old behaviour instead of a wrong corner.
 *
 * Kept as a same-file const: StyleX only statically evaluates a selector key
 * from a const in the same file.
 *
 * The leading edge still uses `:first-child` — a member's button always precedes
 * its own layer, so the first button is genuinely `:first-child`.
 */
/**
 * Whether `node` adds nothing to a content name: nothing renders, or an Icon
 * with no label. Any other node can add text.
 */
function addsNoName(node: ReactNode): boolean {
  if (!isRenderable(node)) {
    return true;
  }
  if (!isValidElement<{label?: unknown}>(node) || node.type !== Icon) {
    return false;
  }
  const {label} = node.props;
  return typeof label !== 'string' || label.trim() === '';
}

/**
 * A versatile button component with multiple variants.
 *
 * Styles use Astryx theme tokens via StyleX.
 * Wrap your app in <Theme> to apply a theme.
 * Themes can provide component-level variant overrides via theme.components.button.variants
 *
 * When `href` is provided (and the button is not disabled), renders as an `<a>`
 * element (or custom link component) with full button styling, enabling native
 * browser behaviors like right-click → open in new tab and Cmd+Click.
 *
 * @example
 * ```
 * <Button label="Click me" />
 * <Button label="Primary action" variant="primary" />
 * <Button label="Delete" variant="destructive" />
 * <Button label="Settings" icon={<GearIcon />} variant="ghost" isIconOnly />
 * <Button label="Pick emoji" icon={<span>🚀</span>} variant="ghost" size="sm" isIconOnly />
 * <Button label="Edit" icon={<PencilIcon />} />
 * <Button label="Messages" endContent={<Badge label={3} />} />
 * <Button label="Edit" icon={<PencilIcon />} endContent={<Badge label="New" />} />
 * <Button label="Sign in" variant="primary" width="100%" />
 * <Button label="Visit site" href="https://example.com" variant="primary" />
 * <Button label="Open in new tab" href="https://example.com" target="_blank" rel="noopener noreferrer" />
 * ```
 */
export function Button({
  label,
  variant = 'secondary',
  size: sizeProp,
  type = 'button',
  isDisabled = false,
  isLoading = false,
  isInterruptible = false,
  clickAction,
  icon,
  isIconOnly = false,
  width,
  elevation = 'none',
  children,
  endContent,
  tooltip,
  href,
  as,
  target,
  rel,
  xstyle,
  className,
  style,
  ref,
  ...props
}: ButtonProps): ReactNode {
  const pressFeedback = usePressFeedback();
  const t = useComponentTranslator();
  const size = useSize(sizeProp, 'md');
  const buttonGroup = useButtonGroup();
  const isSolidVariant =
    variant === 'primary' ||
    variant === 'secondary' ||
    variant === 'destructive';
  // A tracking group's tracker paints this button's pointer press. A menu
  // trigger is not tracked: it keeps its own press and opening.
  const groupPointers = use(PressGroupContext);
  const groupItemProps =
    groupPointers != null && !MENU_POPUPS.has(String(props['aria-haspopup']))
      ? pressGroupItemProps(groupPointers)
      : undefined;
  const isGroupTracked = groupItemProps != null;
  const inputGroup = useInputGroup();

  const [isPending, startTransition] = useTransition();
  // clickAction is normally fire-once (submit/save/pay), so a same-tick
  // double-click must dedupe — which neither isPending nor useOptimistic do.
  // Hence the ref guard. Interruptible callers (e.g. ToggleButton) opt out so a
  // re-click can land and interrupt the in-flight action with a fresh one.
  const actionInFlightRef = useRef(false);
  const isLoadingState = isLoading || isPending;
  // The loading live region must exist empty before it receives "Loading":
  // many screen readers skip a live region that mounts already holding its
  // text, which is what a Button first rendered loading did (spec:AST-086
  // FR3). Only that case holds the text back, until the frame after the
  // region mounts; a Button mounted idle never re-renders for this.
  const [isLiveRegionReady, setIsLiveRegionReady] = useState(
    () => !isLoadingState,
  );
  useEffect(() => {
    if (isLiveRegionReady) {
      return;
    }
    const frame = requestAnimationFrame(() => setIsLiveRegionReady(true));
    return () => cancelAnimationFrame(frame);
  }, [isLiveRegionReady]);
  // Delay the spinner reveal for action-driven loading (clickAction's own
  // transition) so a fast action that settles within the delay does not flash
  // a spinner. Interruptible loading is delayed too, so rapid re-clicks settle
  // before any spinner shows. Explicit isLoading-only stays immediate, since
  // the consumer is deliberately showing it.
  const delaySpinner = isPending || isInterruptible;
  const groupDisabled = buttonGroup?.isDisabled ?? false;
  const inputGroupState = use(InputGroupInternalContext);
  const isTrueDisabled =
    isDisabled || groupDisabled || inputGroupState.isDisabled;
  // Busy-only: the button can't fire again purely because an action is in
  // flight, not because it's genuinely isDisabled/group-disabled. Per the API
  // Conventions "Disabled vs Busy" rule, busy is visual-only (aria-busy +
  // spinner) and must never take focusability away — the click-handler ref
  // guard (actionInFlightRef) is what actually makes a fire-once action fire
  // once, so the native disabled attribute adds nothing but a focus loss
  // here. When interruptible, the loading state drives the spinner and
  // aria-busy but not disabled at all, so clicks keep landing and can
  // interrupt the in-flight action.
  const isBusyOnlyDisabled =
    !isTrueDisabled && isLoadingState && !isInterruptible;
  const buttonDisabled = isTrueDisabled || isBusyOnlyDisabled;
  // Server markup has no click guard until it hydrates, and a native submit
  // or reset button acts on its form without one.
  const isHydrating = useIsHydrating();
  const renderedType =
    buttonDisabled && isHydrating && (type === 'submit' || type === 'reset')
      ? 'button'
      : type;
  // The group draws one band for all its members: a ButtonGroup, or a
  // tracking group that says so. A disabled or busy-only button takes no tap.
  const groupDrawsBand = use(PressGroupBandContext);
  const hasHitArea = buttonGroup == null && !groupDrawsBand && !buttonDisabled;
  const hitAreaRef = useTouchHitArea(hasHitArea, use(ButtonHitAreaContext));
  // isIconOnly prop is the source of truth for icon-only rendering.
  // When false (default), label is always rendered as visible text.

  const LinkComponent = useLinkComponent(as);

  // Render as link when href is provided and the button is not TRULY
  // disabled. Disabled links are an accessibility anti-pattern, so a
  // genuinely isDisabled/group-disabled button falls back to <button>.
  // Busy-only does NOT fall back: swapping <a> for a disabled <button>
  // mid-action would drop focus the same way the native attribute does
  // (credit @AKnassa, #4879), which is exactly the bug this PR fixes.
  const renderAsLink = href != null && !isTrueDisabled;

  // Attach tooltip behavior via the hook rather than wrapping the button in a
  // <Tooltip> element. The hook adds hover/focus triggers to the button itself,
  // so no extra DOM node is inserted — the button stays a direct child of its
  // container (no layout shift, and edge-compensation markers remain
  // discoverable through the container's direct-child `:has()` selector).
  const tooltipHook = useTooltip({
    placement: 'above',
    isEnabled: tooltip != null,
  });

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // The ref guard dedupes fire-once actions. Interruptible callers skip it so
    // a re-click while pending starts a fresh action that interrupts the prior.
    if (buttonDisabled || (actionInFlightRef.current && !isInterruptible)) {
      e.preventDefault();
      // An aria-disabled button still receives clicks. preventDefault cancels
      // only its own default action, such as a form submit. Stop propagation
      // so a clickable ancestor does not act.
      e.stopPropagation();
      return;
    }
    props.onClick?.(e);
    if (clickAction && !e.defaultPrevented) {
      actionInFlightRef.current = true;
      startTransition(async () => {
        try {
          await clickAction(e);
        } finally {
          actionInFlightRef.current = false;
        }
      });
    }
  };

  // A disabled button cancels Enter and Space, its activation keys. Other
  // keys, such as Escape and the arrows, still reach the caller's handler.
  const handleKeyDown = buttonDisabled
    ? (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
        } else {
          props.onKeyDown?.(e);
        }
      }
    : undefined;

  // Ghost buttons are edge-compensatable — containers detect this attribute
  // via :has() and pull their own slot margins to align flush at edges.
  const isFlat = variant === 'ghost';
  const edgeCompAttr = isFlat ? {[EDGE_COMP_ATTR]: ''} : null;

  // The button's own layout comes from utility classes. The shared modules it
  // borrows — focus ring, interaction overlay, press layers, touch band — still
  // lower through StyleX until they migrate themselves.
  const layoutClassName = tw(
    buttonClassName({
      variant,
      size,
      elevation,
      isIconOnly,
      isInactive: buttonDisabled,
      isTrulyDisabled: isTrueDisabled,
      isGrouped: buttonGroup != null,
      orientation: buttonGroup?.orientation ?? 'horizontal',
    }),
    isGroupTracked && buttonTrackedOverlayClassName(),
    renderAsLink && buttonLinkClassName,
    !buttonGroup &&
      (isGroupTracked ? buttonTrackedPressClassName() : buttonPressClassName()),
    width != null && buttonWidthClassName(),
    buttonForcedColorsEdgeClassName({
      isSolid: isSolidVariant,
      isGrouped: buttonGroup != null,
      orientation: buttonGroup?.orientation ?? 'horizontal',
      isError: variant === 'destructive',
    }),
  );

  const widthStyle: WidthStyle | null =
    width == null
      ? null
      : {[buttonWidthVar]: typeof width === 'number' ? `${width}px` : width};

  // Shared StyleX props for both button and link rendering. `xstyle` stays last
  // so a consumer style still lands after the component's own atoms.
  const sharedStylexProps = focusOutlineProps.focusVisible(
    interactionOverlayStyles.backgroundImage,
    // The press the controller writes, on a layer under the label whose
    // release runs on the compositor.
    rowPressLayerStyles.cell,
    rowPressLayerStyles.cellOnImage,
    controlPressLayerStyles.control,
    inputGroup != null && buttonGroup == null && inputGroupStyles.buttonAddon,
    xstyle,
  );

  const sharedMergedProps = mergeProps(
    // Inside a group the group owns the surface's elevation, so the button
    // reflects the tier it actually paints rather than the prop it was handed.
    mergeProps(
      themeProps('button', {
        variant,
        size,
        elevation: buttonGroup ? 'none' : elevation,
      }),
      sharedStylexProps,
    ),
    {className: layoutClassName, style: widthStyle ?? undefined},
    className,
    style,
  );

  const iconSize = iconSizeByButtonSize[size];
  const hitAreaClassName = hasHitArea
    ? stylex.props(touchHitAreaStyles.layer).className
    : undefined;

  const buttonContent = (
    <>
      {isLoadingState && (
        <span
          className={tw(
            buttonSpinnerOverlayClassName,
            delaySpinner && buttonSpinnerDelayedClassName(),
          )}
          aria-hidden="true">
          <Spinner size="sm" shade="inherit" />
        </span>
      )}
      <span
        className={tw(
          buttonContentClassName(),
          // The content wrapper's `::after` carries the touch band, so the
          // button's own `::before` (the touch press) and `::after` (a
          // caller's decoration) stay as they are.
          hitAreaClassName,
          isLoadingState &&
            (delaySpinner
              ? buttonHiddenContentDelayedClassName()
              : buttonHiddenContentClassName),
        )}
        aria-hidden={isLoadingState || undefined}>
        {isRenderable(icon) && (
          <span
            className={tw(
              buttonIconWrapperClassName,
              stylex.props(iconBoxSizeStyles[iconSize]).className,
            )}>
            <IconDefaultSizeProvider value={iconSize}>
              {icon}
            </IconDefaultSizeProvider>
          </span>
        )}
        {isIconOnly ? null : (
          <span className={buttonLabelClassName}>{children ?? label}</span>
        )}
        {!isIconOnly && isRenderable(endContent) && (
          <span className={buttonEndContentClassName}>{endContent}</span>
        )}
      </span>
      {/* Live region for loading state announcements */}
      <VisuallyHidden role="status" aria-live="polite">
        {isLoadingState && isLiveRegionReady ? t('@astryx.button.loading') : ''}
      </VisuallyHidden>
    </>
  );

  // aria-label is set when:
  // 1. Icon-only mode (label is the only accessible name)
  // 2. Loading state on non-icon-only (announce the button's purpose)
  // 3. Children differ from label (children are visible, label is accessible name)
  const needsAriaLabel =
    (isIconOnly && label !== '') ||
    (isLoadingState && !isIconOnly) ||
    (children != null && children !== label);
  const ariaLabelProp = needsAriaLabel ? {'aria-label': label} : null;

  // The Button's accessible name when props decide it: the derived
  // aria-label, else a caller aria-label, else the label text alone. It is
  // not known here when a caller aria-labelledby names the Button from other
  // elements, or when `icon` or `endContent` can add text to its content
  // name (a count, for example). A decorative Icon in either slot adds none.
  const accessibleName =
    props['aria-labelledby'] != null
      ? undefined
      : needsAriaLabel
        ? label
        : (props['aria-label'] ??
          (addsNoName(icon) && addsNoName(endContent) ? label : undefined));
  // A tooltip that repeats the name adds nothing to the description, so a
  // screen reader does not read the same words twice.
  const isTooltipName =
    tooltip != null &&
    accessibleName != null &&
    tooltip.trim() === accessibleName.trim();

  // When a tooltip is attached via the hook, point aria-describedby at the
  // tooltip content (composing with any consumer-provided value).
  const describedByProp =
    tooltip != null && !isTooltipName
      ? {
          'aria-describedby':
            [props['aria-describedby'], tooltipHook.describedBy]
              .filter(Boolean)
              .join(' ') || undefined,
        }
      : null;

  // Merge the consumer ref with the tooltip hook's trigger ref so both point at
  // the same element. useMergedRefs tolerates undefined, so this is a no-op for
  // the tooltip side when no tooltip is set.
  const mergedButtonRef = useMergedRefs(
    ref,
    tooltip != null ? tooltipHook.ref : undefined,
    hitAreaRef,
  );

  let element: ReactNode;

  if (renderAsLink) {
    element = (
      <LinkComponent
        ref={mergedButtonRef as React.Ref<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={rel}
        {...(inputGroup != null && buttonGroup == null
          ? inputGroupItemProps
          : undefined)}
        {...sharedMergedProps}
        {...pressFeedback}
        {...groupItemProps}
        {...props}
        {...ariaLabelProp}
        {...describedByProp}
        {...edgeCompAttr}
        // A caller's own busy or disabled state is kept, so a component that
        // hands these props to a Button (a caller-rendered trigger) is heard.
        aria-busy={isLoadingState || props['aria-busy'] || undefined}
        aria-disabled={buttonDisabled || props['aria-disabled'] || undefined}
        onClick={handleClick}
        {...(handleKeyDown ? {onKeyDown: handleKeyDown} : null)}>
        {buttonContent}
      </LinkComponent>
    );
  } else {
    element = (
      <button
        ref={mergedButtonRef}
        type={renderedType}
        {...(inputGroup != null && buttonGroup == null
          ? inputGroupItemProps
          : undefined)}
        {...sharedMergedProps}
        {...pressFeedback}
        {...groupItemProps}
        {...props}
        {...(isTrueDisabled ? {name: undefined} : null)}
        {...ariaLabelProp}
        {...describedByProp}
        {...edgeCompAttr}
        // A caller's own busy or disabled state is kept, so a component that
        // hands these props to a Button (a caller-rendered trigger) is heard.
        aria-busy={isLoadingState || props['aria-busy'] || undefined}
        aria-disabled={buttonDisabled || props['aria-disabled'] || undefined}
        onClick={handleClick}
        {...(handleKeyDown ? {onKeyDown: handleKeyDown} : null)}>
        {buttonContent}
      </button>
    );
  }

  if (tooltip) {
    return (
      <>
        {element}
        {tooltipHook.renderTooltip(tooltip)}
      </>
    );
  }

  return element;
}

Button.displayName = 'Button';
