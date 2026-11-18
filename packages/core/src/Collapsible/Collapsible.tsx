// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Collapsible.tsx
 * @input Uses React, Tailwind classes, useCollapsible hook,
 *   CollapsibleGroupPresentationContext, getIcon
 * @output Exports Collapsible component and CollapsibleProps
 * @position Collapsible content primitive — trigger toggles visibility of children
 *
 * Collapsible is a standalone primitive that makes any content collapsible.
 * It renders a trigger area (always visible) and a content area that toggles.
 * Handles state management, accessibility (aria-expanded + aria-controls linking
 * the trigger to its content region), and chevron indicator.
 *
 * Works standalone or coordinated by CollapsibleGroup via the `value` prop.
 * When the surrounding CollapsibleGroup sets `hasDividers`, each Collapsible
 * draws its own row chrome (borderBlockStart suppressed on :first-child, plus
 * density padding) from CollapsibleGroupPresentationContext — the group cannot
 * draw it from outside. The presentation
 * context is reset around children so nested collapsibles stay chrome-free.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Collapsible/index.ts (exports)
 * - /packages/core/src/Collapsible/Collapsible.doc.mjs
 * - /apps/storybook/stories/Collapsible.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/Collapsible/ (showcase blocks)
 */

import {
  use,
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';

import {useCollapsible} from './useCollapsible';
import {LayoutChangeSnapshot} from '../motion/LayoutChangeSnapshot';
import {
  moveFocusLeftBehind,
  noteFocusWithin,
  type FocusWithin,
} from '../utils/focusReturn';
import {useInteractionModalityTracking} from '../utils/interactionModality';
import {useFocusLeavingChange} from '../utils/useFocusLeavingChange';
import {useMergedRefs} from '../hooks/useMergedRefs';
import {
  applyLayoutChangeTransition,
  holdLayoutExit,
  playLayoutChange,
  releaseLayoutExit,
  reportLayoutChange,
  type AnimatedLayout,
} from '../motion/animatedLayout';
import {CollapsibleGroupPresentationContext} from './CollapsibleGroupContext';
import type {CollapsibleChevronPosition} from './CollapsibleGroupContext';
import {Icon} from '../Icon';
import {mergeProps} from '../utils';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';
import {focusOutlineFocusVisibleClassName} from '../utils/focusOutlineClasses';
import {interactionOverlayStyles} from '../utils/interactionOverlay.stylex';
import {interactionOverlayPressedBackgroundColorClassName} from '../utils/interactionOverlayClasses';
import {usePressFeedback} from '../hooks/usePressFeedback';
import {tw} from '../utils/tw';
import {xstyleProps} from '../utils/xstyle';
import {
  collapsibleChevronClassName,
  collapsibleChevronClosedClassName,
  collapsibleChevronOpenClassName,
  collapsibleChevronStartClassName,
  collapsibleChevronStartClosedClassName,
  collapsibleChevronStartOpenClassName,
  collapsibleContentClassName,
  collapsibleContentDensityClassName,
  collapsibleContentHiddenClassName,
  collapsibleDividedClassName,
  collapsibleRootClassName,
  collapsibleTriggerClassName,
  collapsibleTriggerDensityClassName,
  collapsibleTriggerDisabledClassName,
  collapsibleTriggerLabelClassName,
} from './collapsibleClasses';

export interface CollapsibleProps extends BaseProps {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Content shown in the trigger area (always visible).
   * Rendered inside a button with aria-expanded and a chevron indicator.
   */
  trigger: ReactNode;

  /**
   * Content that collapses/expands when the trigger is clicked.
   */
  children?: ReactNode;

  /**
   * Default open state for standalone uncontrolled usage. Ignored when `value`
   * binds this item to a surrounding CollapsibleGroup.
   * @default true
   */
  defaultIsOpen?: boolean;

  /**
   * Controlled open state for standalone usage. Ignored when `value` binds this
   * item to a surrounding CollapsibleGroup.
   */
  isOpen?: boolean;

  /**
   * Whether the collapsible is disabled. A disabled item can't be toggled —
   * its trigger is non-interactive and dimmed. Following the system-wide
   * disabled convention, the trigger uses `aria-disabled` (not the native
   * `disabled` attribute) and drops out of the tab order, staying perceivable
   * to assistive tech. The content stays in whatever open state it was;
   * disabling doesn't collapse an already-open item.
   * @default false
   */
  isDisabled?: boolean;

  /**
   * Callback when standalone open state changes. A surrounding
   * CollapsibleGroup owns grouped state and calls its `onChange` instead.
   */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * The handle from `useAnimatedLayout({containerRef})`. With it, opening and
   * closing glides the content after this Collapsible, up to that container,
   * instead of jumping, and the chevron turns on the same timing.
   */
  animatedLayout?: AnimatedLayout;

  /**
   * Logical position of the disclosure chevron.
   *
   * - `end` (default): a trailing indicator that points down when collapsed and
   *   up when expanded.
   * - `start`: a leading disclosure arrow ahead of the label. It points inward
   *   toward the content when collapsed, mirrors under RTL, and points down when
   *   expanded.
   *
   * Inside a CollapsibleGroup this defaults to the group's `chevronPosition`.
   *
   * @default 'end'
   */
  chevronPosition?: CollapsibleChevronPosition;

  /**
   * Unique identifier for this collapsible within a CollapsibleGroup. When set
   * inside a group, the group owns open state and its `onChange` is the
   * notification callback.
   */
  value?: string;

  /**
   * Test ID for the collapsible element.
   */
  'data-testid'?: string;
}

/**
 * A primitive that makes any content collapsible.
 *
 * Renders a trigger area (always visible) with a chevron indicator,
 * and a content area that toggles visibility on click.
 * Handles its own state by default, or defers to CollapsibleGroup
 * when a `value` prop is provided and a group is present.
 *
 * Use inside Card for elevated collapsible sections.
 * Wrap multiple instances in CollapsibleGroup for accordion behavior.
 *
 * @example
 * ```
 * <Collapsible trigger="Details">
 *   <Text type="body">Collapsible content</Text>
 * </Collapsible>
 * <Card>
 *   <Collapsible trigger="Settings">
 *     <SettingsForm />
 *   </Collapsible>
 * </Card>
 * <CollapsibleGroup type="single" defaultValue="general">
 *   <VStack gap={2}>
 *     <Card>
 *       <Collapsible trigger="General" value="general">
 *         <GeneralSettings />
 *       </Collapsible>
 *     </Card>
 *     <Card>
 *       <Collapsible trigger="Advanced" value="advanced">
 *         <AdvancedSettings />
 *       </Collapsible>
 *     </Card>
 *   </VStack>
 * </CollapsibleGroup>
 * ```
 */
export function Collapsible({
  trigger,
  children,
  defaultIsOpen,
  isOpen: controlledIsOpen,
  isDisabled = false,
  onOpenChange,
  chevronPosition,
  value,
  animatedLayout,
  ref,
  xstyle,
  className,
  style,
  ...props
}: CollapsibleProps) {
  const pressable = usePressFeedback();
  // Build the config for the hook
  const collapsibleConfig =
    controlledIsOpen !== undefined
      ? {isOpen: controlledIsOpen, onOpenChange}
      : {defaultIsOpen: defaultIsOpen ?? true, onOpenChange};

  const {isOpen, toggle} = useCollapsible({
    isCollapsible: collapsibleConfig,
    value,
  });

  // With an `animatedLayout` handle, the content's size change animates: the
  // content after this Collapsible, up to the handle's container, glides, and
  // the revealed content plays its own entrance on the same timing
  // (`architecture:react-component-runtime` INV12). Without one, nothing
  // changes.
  const contentRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const layoutChange = useMemo(
    () => reportLayoutChange(animatedLayout, contentRef),
    [animatedLayout],
  );
  // Every open-state change, whatever caused it (a click, an owner-set
  // `isOpen`, a group's value), is measured before it lands (`spec:AST-105`
  // FR1): LayoutChangeSnapshot calls this in the commit, before the DOM
  // changes. The chevron (the trigger's Icon, its `icon` theming target)
  // turns on the glide's motion too.
  const measureChange = useCallback(() => {
    applyLayoutChangeTransition(
      animatedLayout,
      triggerRef.current?.querySelector<HTMLElement>(':scope > .astryx-icon') ??
        null,
    );
    layoutChange.measureBefore();
  }, [animatedLayout, layoutChange]);
  // Without a handle the chevron keeps the theme's own turn: a spring a handle
  // set stays only while it is passed (`spec:AST-105` FR2).
  useLayoutEffect(() => {
    if (animatedLayout == null) {
      applyLayoutChangeTransition(
        null,
        triggerRef.current?.querySelector<HTMLElement>(
          ':scope > .astryx-icon',
        ) ?? null,
      );
    }
  }, [animatedLayout]);
  // A close with a handle keeps the content rendered while it plays its exit
  // (the exit makes it inert and gives up its space), then hides it
  // (`spec:AST-105` FR4). Derived from the open state as it changes, during
  // render, so the closing commit already keeps it.
  const [renderedIsOpen, setRenderedIsOpen] = useState(isOpen);
  const [isExiting, setIsExiting] = useState(false);
  if (renderedIsOpen !== isOpen) {
    setRenderedIsOpen(isOpen);
    setIsExiting(!isOpen && animatedLayout != null);
  }
  const endExit = useCallback(() => {
    // eslint-disable-next-line @eslint-react/set-state-in-effect -- holdLayoutExit decides from layout read in the closing commit (the content's place in the area's visible part, Reduce Motion and the pointer, and whether an end margin frees its space); an exit it does not hold hides the content before the frame paints
    setIsExiting(false);
  }, []);
  const wasOpenRef = useRef(isOpen);
  useLayoutEffect(() => {
    if (wasOpenRef.current === isOpen) {
      return;
    }
    wasOpenRef.current = isOpen;
    const content = contentRef.current;
    if (content == null) {
      return;
    }
    // A change that was not measured (no handle) lands at once, entrance and
    // exit included, so the content and what follows stay in step.
    const isMeasured = layoutChange.animate();
    if (isOpen) {
      // Opened again mid-exit: the content takes its place in flow.
      releaseLayoutExit(content);
      if (isMeasured) {
        playLayoutChange(animatedLayout, content);
      }
      return;
    }
    const isHeld =
      isExiting &&
      isMeasured &&
      holdLayoutExit(animatedLayout, content, endExit);
    if (isExiting && !isHeld) {
      // An exit holdLayoutExit did not hold (unmeasured, out of view, Reduce
      // Motion with a fine pointer, or no margin frees its space): hide the
      // content before this frame paints.
      endExit();
    }
  }, [isOpen, isExiting, layoutChange, animatedLayout, endExit]);
  useLayoutEffect(() => {
    if (!isOpen && !isExiting && contentRef.current != null) {
      // Hidden again after its exit: drop the exit's inline values.
      releaseLayoutExit(contentRef.current);
    }
  }, [isOpen, isExiting]);

  // Focus inside the content when it closes would be lost to the page once
  // the content hides. It moves to the trigger that closes it (AR4); focus
  // anywhere else is not moved. The shared sequence notes it in the commit
  // before the DOM changes and moves it once the close has committed.
  // The trigger's own document's last input decides the moved focus's ring.
  const {ref: modalityRef} = useInteractionModalityTracking();
  const mergedTriggerRef = useMergedRefs(triggerRef, modalityRef);
  const noteClosingFocus = useFocusLeavingChange(
    isOpen,
    (wasOpen: boolean) =>
      wasOpen ? noteFocusWithin(contentRef.current) : null,
    (focus: FocusWithin) =>
      moveFocusLeftBehind(focus, triggerRef.current, contentRef.current),
  );
  const beforeOpenChange = useCallback(
    (wasOpen: boolean) => {
      noteClosingFocus(wasOpen);
      if (animatedLayout != null) {
        measureChange();
      }
    },
    [animatedLayout, measureChange, noteClosingFocus],
  );
  // Activation is blocked by this guard rather than the native `disabled`
  // attribute, so the trigger keeps `aria-disabled` semantics and stays
  // discoverable. A native `disabled` button would silently swallow events
  // (e.g. a wrapping tooltip's hover) — the system-wide disabled convention.
  const handleToggle = () => {
    if (isDisabled) {
      return;
    }
    toggle();
  };

  const presentation = use(CollapsibleGroupPresentationContext);
  const isDivided = presentation?.hasDividers ?? false;
  const density = presentation?.density ?? null;
  // The item wins over the group so a single row can differ, but the group is
  // the level this is normally set at — mixed sides in one list read as a bug.
  const position = chevronPosition ?? presentation?.chevronPosition ?? 'end';
  const isChevronAtStart = position === 'start';

  // Links the trigger to the region it shows/hides so assistive tech can move
  // from the button to its controlled content (disclosure pattern).
  const contentId = useId();

  const chevron = (
    <Icon
      // The glyph is part of the placement, not a separate choice: a trailing
      // indicator points down and flips up, a leading one points into the row
      // and turns down. Rotating `chevronDown` by a quarter turn would leave
      // the closed state pointing the wrong way.
      icon={isChevronAtStart ? 'chevronRight' : 'chevronDown'}
      // Nearest size to the trigger's 17px type step; `chevron` re-pins the
      // exact box (see the style) so the glyph does not resize.
      size="sm"
      // Was `--color-icon-secondary` on the old wrapper span; `secondary`
      // is the same token, expressed as an Icon color.
      color="secondary"
      className={tw(
        collapsibleChevronClassName,
        isChevronAtStart && collapsibleChevronStartClassName,
        isChevronAtStart
          ? isOpen
            ? collapsibleChevronStartOpenClassName
            : collapsibleChevronStartClosedClassName
          : isOpen
            ? collapsibleChevronOpenClassName
            : collapsibleChevronClosedClassName,
      )}
    />
  );

  return (
    <div
      ref={ref}
      {...mergeProps(
        themeProps('collapsible', {
          density: density ?? undefined,
          divided: isDivided ? 'divided' : null,
        }),
        xstyleProps(xstyle),
        tw(
          collapsibleRootClassName,
          isDivided && collapsibleDividedClassName,
          className,
        ),
        style,
      )}
      {...props}>
      <button
        ref={mergedTriggerRef}
        type="button"
        onClick={handleToggle}
        aria-disabled={isDisabled || undefined}
        aria-expanded={isOpen}
        aria-controls={contentId}
        // A disabled trigger drops out of the tab order so it isn't a silently
        // dead tab stop; activation stays blocked by the handleToggle guard,
        // and aria-disabled keeps the state perceivable to assistive tech —
        // the system-wide disabled convention (never native `disabled`, which
        // would swallow events like a wrapping tooltip's hover).
        tabIndex={isDisabled ? -1 : undefined}
        {...(isDisabled ? undefined : pressable)}
        {...mergeProps(
          themeProps('collapsible-trigger', {
            density: density ?? undefined,
            chevronPosition: position,
            open: isOpen ? 'open' : null,
            disabled: isDisabled ? 'disabled' : null,
          }),
          stylex.props(
            // The strength and the release; the press paint is a class below.
            !isDisabled && interactionOverlayStyles.pressedAlpha,
          ),
          tw(
            collapsibleTriggerClassName,
            density != null && collapsibleTriggerDensityClassName[density],
            isDisabled && collapsibleTriggerDisabledClassName,
            // The system's pressed overlay on the disclosure row. The trigger
            // has no hover surface of its own, so this is the one background
            // it paints, and only while it is pressed.
            !isDisabled && interactionOverlayPressedBackgroundColorClassName,
            focusOutlineFocusVisibleClassName,
          ),
        )}>
        {isChevronAtStart && chevron}
        <span className={collapsibleTriggerLabelClassName}>{trigger}</span>
        {!isChevronAtStart && chevron}
      </button>
      <LayoutChangeSnapshot value={isOpen} onBeforeChange={beforeOpenChange} />
      <div
        ref={contentRef}
        id={contentId}
        {...mergeProps(
          themeProps('collapsible-content', {
            density: density ?? undefined,
            open: isOpen ? 'open' : null,
          }),
          {
            className: tw(
              collapsibleContentClassName,
              density != null && collapsibleContentDensityClassName[density],
              !isOpen && !isExiting && collapsibleContentHiddenClassName,
            ),
          },
        )}>
        {/* One box holds the content, so an opening or closing slides it
            under the region's clip: a translation cannot move bare text. */}
        <div>
          {presentation != null ? (
            <CollapsibleGroupPresentationContext value={null}>
              {children}
            </CollapsibleGroupPresentationContext>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}

Collapsible.displayName = 'Collapsible';
