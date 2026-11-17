// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Drawer.tsx
 * @input Uses React, StyleX, theme tokens, the shared layer text/structure resets and content boundary, the Dialog purpose type, shared focus/dismissal/depth primitives, container padding lowering, scroll locking/dialog presence, BaseProps, merged refs/props, themeProps
 * @output Exports Drawer component and DrawerProps
 * @position Core implementation; consumed by index.ts, tested by Drawer.test.tsx, demonstrated in Storybook
 *
 * Overlay panel for inspectors and detail views — the "click a table row,
 * see its details" pattern. Slides in from the inline start or end edge and
 * floats above the page content: unlike a docked panel it never reflows the
 * layout underneath, it overlays it (with or without a scrim).
 *
 * Inline axis only (start/end). Block-axis sheets are BottomSheet's job;
 * a drawer is always a full-height side panel.
 *
 * Sizing is viewport-aware: `width` is the desktop budget, and below
 * the mobile breakpoint it preserves a 56px reveal of the page behind, capped
 * by the requested width (or fills the viewport with the experimental
 * `experimental.isFullWidthOnMobile` option).
 *
 * Uses the native `<dialog>` element (same precedent as Dialog/MobileNav):
 * - `showModal()` when `hasScrim` (default) — top-layer rendering, focus
 *   trapping, `::backdrop`, no z-index management.
 * - `showPopover()` when `hasScrim={false}` — non-modal top-layer overlay;
 *   the page behind stays interactive (e.g. master-detail inspectors).
 *
 * Entry animation uses `@starting-style`; exit slides out before the active
 * modal-dialog or manual-popover host releases the top layer and focus returns
 * to the element that opened the drawer. React owns `display` for both legs
 * rather than a discrete `display` transition, so the panel stops painting in
 * the same commit as the host closes — see the `rendered` style for why.
 *
 * Sibling drawers use the shared layer dismissal stack for topmost-only Escape
 * handling and the browser top layer's chronological paint order.
 *
 * Dismissal follows Dialog: `purpose` decides whether Escape and a scrim click
 * request close, and Drawer renders no close button of its own. Compose
 * `DrawerHeader` with `onOpenChange` for a visible close action, as with
 * `DialogHeader`.
 *
 * The scrolling content area is the drawer's container, like Dialog's inner
 * box: the `padding` prop, else the theme's `padding` on `drawer`, insets it
 * through container tokens, defaulting to `--spacing-4` like Dialog, and the
 * applied inset is published so a lone Section child escapes it and a Layout
 * redistributes it to its regions. Compose `DrawerHeader` inside a `Layout`, as
 * `DialogHeader` is composed in Dialog, so the header is not padded twice. The
 * root dialog stays the overlay boundary (`overlayPaddingReset`).
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Drawer/Drawer.doc.mjs (props table, features, usage)
 * - /packages/core/src/Drawer/Drawer.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Drawer/__tests__/DrawerNonModalPageScroll.a11y.chromium.spec.ts (the page beside a non-modal drawer scrolls)
 * - /docs/specs/components/Drawer/Drawer.spec.md (component contract)
 * - /packages/core/src/Drawer/index.ts (exports if types change)
 * - /packages/cli/assets/templates/blocks/components/Drawer/ (showcase blocks)
 * - /apps/storybook/stories/Drawer.stories.tsx (examples and visual coverage)
 */

import {useCallback, useRef, useState, type ReactNode} from 'react';
import {useIsHydrating} from '../hooks/useIsHydrating';
import {useSettledOpen} from '../hooks/useSettledOpen';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import type {DialogPurpose} from '../Dialog';
import {useFocusTrap} from '../hooks/useFocusTrap';
import {useMergedRefs} from '../hooks/useMergedRefs';
import {useScrollLock} from '../hooks/useScrollLock';
import {LayerDepthProvider, useLayerDismissal} from '../Layer';
import {layerTextResetClassName} from '../Layer/layerTextResetClasses';
import {layerStructureResetClassName} from '../Layer/layerStructureResetClasses';
import {LayerContentBoundary} from '../Layer/layerScopedContext';
import {useModalOutlet} from '../Layer/modalOutlet';
import {useBackdropPress} from '../Layer/useBackdropPress';
import {layerClickBoundary} from '../Layer/layerClickBoundary';
import {ModalAnnounceProvider} from '../hooks/ModalAnnounceProvider';
import {composeEventHandlers, mergeProps, themeProps} from '../utils';
import {chainEventHandlers} from '../utils/chainEventHandlers';
import {tw} from '../utils/tw';
import {container, overlayPaddingReset} from '../Layout';
import {
  containerPaddingBlockEndVarStyles,
  containerPaddingBlockStartVarStyles,
  containerPaddingInlineVarStyles,
  paddingStyles,
  spacingStepToToken,
} from '../Layout/padding.stylex';
import type {SpacingStep, SpacingToken} from '../Layout';
import {
  drawerContentClassName,
  drawerMobileWidthVar,
  drawerRootClassName,
  drawerWidthVar,
} from './drawerClasses';
import {useDrawerDialogPresence} from './useDrawerDialogPresence';

type PointerHandler = (event: React.PointerEvent<HTMLDialogElement>) => void;

// =============================================================================
// Styles
// =============================================================================

// Material's established mobile drawer pattern leaves a 56dp reveal. Using
// the same value in CSS pixels gives the overlay a stable visual relationship
// to the page behind while the requested width remains an upper bound.
const MOBILE_PAGE_REVEAL = 56;
const MOBILE_WIDTH_FULL = '100dvw';

// The content area is the drawer's container, so its padding comes from the
// layout container rules. They are unlayered, and an unlayered declaration
// beats any `@layer astryx-base` class, so the safe-area composition that has
// to win on the block-end edge stays here beside them.
const styles = stylex.create({
  // Block-end inset of the content area = container padding + the home
  // indicator's safe area, so the last row of content stays clear of the
  // indicator in every padding mode. The published
  // --container-padding-block-end keeps the safe area OUT, so a bleed child
  // subtracts only the container inset and the safe area survives below it.
  contentSafeArea: {
    paddingBlockEnd:
      'calc(var(--container-padding-block-end, 0px) + env(safe-area-inset-bottom, 0px))',
  },
});
// =============================================================================
// Types
// =============================================================================

export interface DrawerProps extends BaseProps<HTMLDialogElement> {
  /** Ref forwarded to the root <dialog> element */
  ref?: React.Ref<HTMLDialogElement>;

  /**
   * Whether the drawer is open. Fully controlled — pair with `onOpenChange`.
   */
  isOpen: boolean;

  /**
   * Called when the drawer requests an open-state change. Escape and a scrim
   * click call it with `false` as `purpose` allows; a `DrawerHeader` close
   * button calls it when you pass the same callback to the header. The caller
   * owns the open state. When sibling drawers are open, Escape only closes the
   * top (last-opened) drawer.
   */
  onOpenChange: (isOpen: boolean) => void;

  /**
   * Which edge the drawer slides from.
   * - `'end'` — inline-end edge (right in LTR) — the inspector convention
   * - `'start'` — inline-start edge (left in LTR)
   * @default 'end'
   */
  side?: 'start' | 'end';

  /**
   * Desktop width budget. A number is pixels; a string is any CSS length
   * (`'50%'`, `'32rem'`). Below the mobile breakpoint (640px), this
   * remains the maximum while the drawer preserves a 56px reveal of the page
   * behind — see `experimental.isFullWidthOnMobile`.
   * @default 400
   */
  width?: number | string;

  /**
   * Experimental options, outside the stable compatibility promise: anything
   * in this object may change or be removed in a patch release. Omit it for
   * the stable behavior.
   * @experimental
   */
  experimental?: {
    /**
     * Cover the full viewport width on mobile (below 640px) instead of
     * preserving the default 56px reveal of the page behind. The reveal makes
     * the drawer read as an overlay rather than a navigation.
     * @experimental
     * @default false
     */
    isFullWidthOnMobile?: boolean;
  };

  /**
   * Accessible label for the drawer (required — the drawer has no
   * built-in heading to derive a name from).
   */
  label: string;

  /**
   * Whether to render a modal scrim behind the drawer.
   * - `true` (default) — `showModal()`: top layer, focus trap, body scroll
   *   lock, click-outside-to-close.
   * - `false` — `showPopover()`: non-modal top-layer overlay; the page behind
   *   stays interactive. Escape still closes through the shared layer stack.
   * @default true
   */
  hasScrim?: boolean;

  /**
   * Configures how the drawer enables dismissals, matching Dialog.
   * - required: Disables Escape and scrim click (for mandatory flows); a
   *   modal required drawer is exposed as an `alertdialog`
   * - form: Prevents scrim click, allows the Escape key
   * - info: Allows Escape and scrim click
   *
   * A non-modal drawer has no scrim, so `form` and `info` behave the same.
   * @default 'info'
   */
  purpose?: DialogPurpose;

  /**
   * Internal padding of the drawer content using the spacing scale, matching
   * Dialog. Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8,
   * 10. When omitted, uses the theme default for drawers (`--spacing-4`, 16px,
   * unless the theme sets `padding` on `drawer`), as Dialog does. Pass `0` for
   * a full-bleed content area. The content area is a container: a Section that
   * is its only child escapes the padding, bleed children such as Table and
   * Divider compensate against it, and a Layout picks it up for its regions.
   */
  padding?: SpacingStep;

  /**
   * Drawer content. Rendered inside a full-height scrollable area.
   * Focus the element with `data-autofocus` on open, if present.
   */
  children: ReactNode;

  /**
   * Test ID for the root element.
   */
  'data-testid'?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * An overlay panel for inspectors and detail views.
 *
 * Slides in from the logical start or end edge and floats above the page
 * using the native `<dialog>` element: modal with a scrim by default, or a
 * non-modal overlay with `hasScrim={false}` that leaves the page behind
 * interactive. `width` is the desktop budget; below 640px the panel preserves
 * a 56px page reveal without exceeding that budget (or fills the viewport
 * with the experimental `experimental.isFullWidthOnMobile`). Escape
 * closes the top-most open drawer; focus returns to the element that
 * opened it.
 *
 * Dismissal matches Dialog: `purpose` decides whether Escape and a scrim click
 * close the drawer, and `DrawerHeader` renders a close button when given
 * `onOpenChange`.
 *
 * Like Dialog, the drawer is a container: `padding` (or a theme's `padding`
 * on `drawer`) insets the content area, a lone Section child escapes that
 * inset, and a Layout inside picks it up for its header, content, and footer
 * regions. The default inset is `--spacing-4`, matching Dialog.
 *
 * @example
 * ```
 * const [selected, setSelected] = useState(null);
 * const handleOpenChange = isOpen => !isOpen && setSelected(null);
 * <Drawer
 *   isOpen={selected != null}
 *   onOpenChange={handleOpenChange}
 *   label={`Details: ${selected?.name}`}>
 *   <Layout
 *     header={<DrawerHeader title={selected?.name} onOpenChange={handleOpenChange} />}
 *     content={<LayoutContent><HostDetails host={selected} /></LayoutContent>}
 *   />
 * </Drawer>
 * ```
 */
export function Drawer({
  isOpen: isOpenProp,
  onOpenChange,
  side = 'end',
  width = 400,
  experimental,
  label,
  hasScrim = true,
  purpose = 'info',
  padding,
  children,
  xstyle,
  className,
  style,
  onClick: onClickProp,
  onKeyDown: onKeyDownProp,
  ref,
  ...props
}: DrawerProps) {
  // A drawer open on the server renders closed until hydration, and opens in
  // the render after it, the first one that can enter its native host: a
  // <dialog> painted open with aria-modal before it is modal claims a state it
  // does not have (FR17).
  const isHydrating = useIsHydrating();
  const isOpen = isOpenProp && !isHydrating;
  // A drawer open on the server was present on page load, so it opens settled,
  // with no slide-in; its later opens and closes animate as usual
  // (spec:AST-013 FR13).
  const [settledOpen] = useSettledOpen(isOpenProp, isOpen, false);
  const opensSettled = settledOpen && isOpen;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const {containerRef: focusTrapRef} = useFocusTrap<HTMLDialogElement>({
    isActive: isOpen && hasScrim,
  });
  const mergedDialogRef = useMergedRefs(ref, dialogRef, focusTrapRef);
  // Derive dismissal behavior from purpose, as Dialog does.
  const allowEscape = purpose !== 'required';
  const allowScrimClick = purpose === 'info';
  // Same lowering as Dialog: with no padding prop the content area reads the
  // theme's --astryx-drawer-padding chain (--spacing-4 when unset), else the
  // explicit step.
  const usesThemePadding = padding == null;
  const effectivePadding = padding ?? 4;
  const paddingToken = spacingStepToToken[effectivePadding] as SpacingToken;
  // Whether the panel paints: true while open and for the whole slide-out.
  const [isRendered, setIsRendered] = useState(isOpen);

  // Adjusted during render, not in an effect: the panel has to be rendered in
  // the same commit that targets the open transform, or @starting-style has
  // nothing to animate from.
  if (isOpen && !isRendered) {
    setIsRendered(true);
  }

  useDrawerDialogPresence({
    dialogRef,
    isOpen,
    isModal: hasScrim,
    setIsRendered,
  });

  // Toasts outside an open modal are inert, so the open drawer hosts them.
  // It releases them when its exit starts.
  // showModal() must run first, so keep this call after useDrawerDialogPresence.
  const outletRef = useModalOutlet(dialogRef, isOpen && hasScrim);

  const handleDismiss = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // The shared stack owns Escape delivery across every overlay family. The
  // provider below gives layers opened from Drawer content a greater logical
  // depth even when they render elsewhere in the DOM or browser top layer.
  const {shouldDismissOnCloseRequest} = useLayerDismissal({
    // The native host stays present through the slide-out. Keep this entry on
    // the stack until the same commit that hides the host, so a second Escape
    // cannot fall through to a lower layer during the exit animation.
    isActive: isRendered,
    // A `required` drawer consumes Escape without closing, so the press cannot
    // fall through and dismiss a layer behind it either.
    escapeBehavior: allowEscape ? 'close' : 'block',
    onDismiss: handleDismiss,
    getContainer: () => dialogRef.current,
  });

  // Lock body scroll while a modal drawer is open (iOS Safari workaround).
  useScrollLock(isOpen && hasScrim);

  // A modal dialog's native cancel event is a platform close request (for
  // example Android Back). Keep controlled state authoritative and apply the
  // same top-most/IME rules as the shared Escape listener.
  const handleCancel = useCallback(
    (event: React.SyntheticEvent<HTMLDialogElement>) => {
      // A cancel that bubbles up from inside (a dismissed file picker) is not
      // a close request; the platform's is fired at the dialog itself.
      if (event.target !== event.currentTarget) {
        return;
      }
      event.preventDefault();
      if (shouldDismissOnCloseRequest() && allowEscape) {
        handleDismiss();
      }
    },
    [allowEscape, handleDismiss, shouldDismissOnCloseRequest],
  );

  // A press on the ::backdrop targets the <dialog> itself (the content area
  // fills the panel). The press must start and end there.
  const handleScrimPress = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);
  const scrimPress = useBackdropPress(
    handleScrimPress,
    hasScrim && allowScrimClick,
  );

  const widthValue = typeof width === 'number' ? `${width}px` : width;
  const isFullWidthOnMobile = experimental?.isFullWidthOnMobile ?? false;
  const mobileWidth = isFullWidthOnMobile
    ? MOBILE_WIDTH_FULL
    : `min(${widthValue}, calc(100dvw - ${MOBILE_PAGE_REVEAL}px))`;

  // The side the panel is ANCHORED to, which is the side it must slide back
  // out to. Latched at open, because a consumer commonly derives `side` from
  // the same state that drives `isOpen` (`side={selected?.side ?? 'end'}`):
  // that state clears on close, so the live prop flips mid-exit and the panel
  // teleports to the other edge and slides out the wrong way. Children stay
  // mounted for the exit for the same reason; so does the anchor. It is state,
  // adjusted while the open drawer renders: a ref written here would keep the
  // side of a render that React discards.
  const [exitSide, setExitSide] = useState(side);
  if (isOpen && side !== exitSide) {
    setExitSide(side);
  }
  const anchoredSide = isOpen ? side : exitSide;

  const panelClassName = drawerRootClassName({
    side: anchoredSide,
    isRendered,
    isOpen,
    hasScrim,
    opensSettled,
  });
  // A width rides an inline custom property; the classes read it.
  const layoutVariables: Record<`--${string}`, string> = {
    [drawerWidthVar]: widthValue,
    [drawerMobileWidthVar]: mobileWidth,
  };

  // Filter out native `open` to prevent InvalidStateError when passed
  const {open: _open, ...safeProps} = props as Record<string, unknown>;

  return (
    <dialog
      ref={mergedDialogRef}
      {...mergeProps(
        themeProps('drawer', {side: anchoredSide}),
        stylex.props(overlayPaddingReset.reset, xstyle),
        tw(
          panelClassName,
          layerTextResetClassName,
          layerStructureResetClassName,
          className,
        ),
        {...layoutVariables, ...style},
      )}
      {...safeProps}
      popover={hasScrim ? undefined : 'manual'}
      aria-label={label}
      aria-modal={hasScrim && !isHydrating ? 'true' : undefined}
      {...(purpose === 'required' && hasScrim
        ? {role: 'alertdialog'}
        : undefined)}
      // Presses inside the drawer do not reach handlers around where it is
      // written.
      {...layerClickBoundary({
        ...safeProps,
        onClick: composeEventHandlers(onClickProp, scrimPress.onClick),
      })}
      // The hook records where the press started first. The caller's capture
      // handler then runs, also when a child prevented default.
      onPointerDownCapture={chainEventHandlers(
        scrimPress.onPointerDownCapture,
        safeProps.onPointerDownCapture as PointerHandler | undefined,
      )}
      onPointerUpCapture={chainEventHandlers(
        scrimPress.onPointerUpCapture,
        safeProps.onPointerUpCapture as PointerHandler | undefined,
      )}
      onPointerCancelCapture={chainEventHandlers(
        scrimPress.onPointerCancelCapture,
        safeProps.onPointerCancelCapture as PointerHandler | undefined,
      )}
      onKeyDown={onKeyDownProp}
      onCancel={handleCancel}>
      <ModalAnnounceProvider dialogRef={dialogRef} isOpen={isOpen && hasScrim}>
        <LayerDepthProvider>
          <LayerContentBoundary>
            {/* Scrollable content area — tabIndex so the dialog's focusing steps
              land on the panel body rather than the first button inside. */}
            <div
              ref={outletRef}
              tabIndex={-1}
              {...mergeProps(
                stylex.props(
                  ...container(
                    usesThemePadding
                      ? {useThemeDefault: 'drawer'}
                      : {
                          paddingInnerX: paddingToken,
                          paddingInnerY: paddingToken,
                          paddingOuterX: paddingToken,
                          paddingOuterY: paddingToken,
                        },
                  ),
                  !usesThemePadding &&
                    effectivePadding !== 4 &&
                    paddingStyles[effectivePadding],
                  !usesThemePadding &&
                    effectivePadding !== 4 &&
                    containerPaddingInlineVarStyles[effectivePadding],
                  !usesThemePadding &&
                    effectivePadding !== 4 &&
                    containerPaddingBlockStartVarStyles[effectivePadding],
                  !usesThemePadding &&
                    effectivePadding !== 4 &&
                    containerPaddingBlockEndVarStyles[effectivePadding],
                  styles.contentSafeArea,
                ),
                {className: drawerContentClassName},
              )}>
              {children}
            </div>
          </LayerContentBoundary>
        </LayerDepthProvider>
      </ModalAnnounceProvider>
    </dialog>
  );
}

Drawer.displayName = 'Drawer';
