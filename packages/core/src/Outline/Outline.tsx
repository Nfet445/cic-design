// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Outline.tsx
 * @input Uses React, StyleX, Astryx link provider integration, the outline
 *   class map, Outline hooks/types
 * @output Exports Outline component and OutlineProps type
 * @position Core implementation; consumed by index.ts
 *
 * A table-of-contents navigation component with:
 * - Sliding indicator track (vertical divider + animated active bar)
 * - Density variant (default/compact)
 * - Scroll-spy active state when uncontrolled
 * - Each link in the normal Tab order (Enter/Space activate)
 * - onNavigateStart / onNavigateEnd callbacks around the smooth scroll
 * - Scroll scoping (offset, scrollContainerRef, hasScrollOnClick)
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Outline/Outline.doc.mjs
 * - /packages/core/src/Outline/index.ts
 * - /apps/storybook/stories/Outline.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/Outline/ (showcase blocks)
 */

import {useRef} from 'react';
import * as stylex from '@stylexjs/stylex';
import {useLinkComponent} from '../Link/useLinkComponent';
import {mergeProps} from '../utils';
import {tw} from '../utils/tw';
import type {BaseProps} from '../BaseProps';
import {useScrollSpy} from './useScrollSpy';
import type {OutlineItem} from './types';
import {themeProps} from '../utils/themeProps';
import {focusOutlineFocusVisibleClassName} from '../utils/focusOutlineClasses';
import {interactionOverlayStyles} from '../utils/interactionOverlay.stylex';
import {interactionOverlayBackgroundColorClassName} from '../utils/interactionOverlayClasses';
import {xstyleProps} from '../utils/xstyle';
import {usePressFeedback} from '../hooks/usePressFeedback';
import {
  outlineDividerClassName,
  outlineIndicatorClassName,
  outlineItemClassName,
  outlineLabelClassName,
  outlineLinkClassName,
  outlineListClassName,
  outlineRootClassName,
  outlineTrackClassName,
} from './outlineClasses';

import {useMergedRefs} from '../hooks/useMergedRefs';
import {
  registerEnglishFallback,
  useComponentTranslator,
} from '../i18n/useComponentTranslator';
import english from '../i18n/generated-english/Outline/Outline.generated';

registerEnglishFallback(english);
export type {OutlineItem} from './types';

export interface OutlineProps extends BaseProps<HTMLElement> {
  /** Ref forwarded to the root nav element. */
  ref?: React.Ref<HTMLElement>;

  /** Ordered list of heading items to render. */
  items: OutlineItem[];

  /** ID of the currently active item. When provided, disables built-in scroll-spy. */
  activeId?: string;

  /** Called when the active item changes from scroll-spy or click. */
  onActiveIdChange?: (id: string) => void;

  /** Accessible label for the nav landmark. @default 'Table of contents' */
  label?: string;

  /**
   * Density variant controlling item padding.
   * - 'default': Standard spacing (default)
   * - 'compact': Reduced spacing for dense UIs
   * @default 'default'
   */
  density?: 'default' | 'compact';

  /**
   * Called when navigation to an item begins, before the scroll starts.
   * Receives the item `id`. Pair with `onNavigateEnd` to drive an arrival
   * effect (flash, ring, pulse) on the target heading.
   */
  onNavigateStart?: (id: string) => void;

  /**
   * Called once when navigation to an item resolves — when the smooth scroll
   * settles, or immediately-ish when reduced motion turns it into a jump.
   *
   * Fires exactly once for every `onNavigateStart`, including when the user
   * interrupts the scroll by scrolling manually, so a "navigating" state can
   * never leak. It does not fire if the Outline unmounts mid-scroll.
   */
  onNavigateEnd?: (id: string) => void;

  /**
   * Height in px of a fixed header overlaying the top of the scroll root.
   *
   * Shifts both the activation line *and* the scroll landing by the same
   * amount, so a heading activates exactly where navigating to it puts it —
   * below the header rather than hidden underneath it.
   *
   * It composes with each heading's own `scroll-margin-top` (the header, then
   * the breathing room below it) rather than replacing it. When nothing
   * overlays the content, leave this at 0 and let `scroll-margin-top` do the
   * work — the browser already honors it.
   *
   * @default 0
   */
  offset?: number;

  /**
   * Scroll container to track, instead of auto-detecting the nearest scrollable
   * ancestor. Use this when the content scrolls inside a split pane, modal, or
   * dashboard panel rather than the viewport.
   */
  scrollContainerRef?: React.RefObject<HTMLElement | null>;

  /**
   * Whether activating an item smooth-scrolls to it. Set to false to own the
   * scrolling yourself (virtualized content, a router) — the Outline still
   * updates the active item, the hash, and the navigate callbacks, but performs
   * no scroll and suppresses the anchor's default jump.
   * @default true
   */
  hasScrollOnClick?: boolean;

  /** Test ID for testing frameworks. */
  'data-testid'?: string;
}

/**
 * A followed in-page link moves the sequential focus starting point to its
 * target, so the next Tab continues inside that section. Outline cancels the
 * link's default to scroll itself, so it restores that by focusing the target
 * without scrolling (WCAG 2.4.3). A target that is not focusable becomes
 * programmatically focusable only.
 */
function moveFocusTo(id: string) {
  const target = document.getElementById(id);
  if (target == null) {
    return;
  }
  // A target that already takes focus (a link, a button) keeps its place in
  // the Tab order; only one that refuses focus is made focusable by script.
  target.focus({preventScroll: true});
  // A caller's own tabindex is never overwritten.
  if (document.activeElement !== target && !target.hasAttribute('tabindex')) {
    target.setAttribute('tabindex', '-1');
    target.focus({preventScroll: true});
  }
}

// =============================================================================
// Component
// =============================================================================

/**
 * A table-of-contents navigation component for document headings.
 *
 * Outline accepts a flat `items` array and renders anchor links with
 * indentation based on each heading level. Features a sliding indicator
 * track that animates to the active item.
 *
 * When `activeId` is omitted, it tracks scroll position and marks the last
 * heading whose top has passed its activation line — which is exactly where
 * navigating to that heading lands it: `offset` (a fixed header overlaying the
 * scroll root) plus the heading's own `scroll-margin-top`. It defaults to the
 * first item at the top and the last at the bottom.
 *
 * Keyboard: each link is in the normal Tab order, and Enter/Space activate.
 * There is no arrow, Home, or End movement between links.
 *
 * @example
 * ```
 * <Outline
 *   items={[
 *     {id: 'intro', label: 'Introduction', level: 1},
 *     {id: 'features', label: 'Features', level: 2},
 *     {id: 'api', label: 'API Reference', level: 1},
 *   ]}
 * />
 * ```
 *
 * Scoped to a custom scroll container, under a fixed header:
 *
 * @example
 * ```
 * const scrollContainerRef = useRef<HTMLDivElement>(null);
 * <div ref={scrollContainerRef} style={{overflowY: 'auto'}}>...</div>
 * <Outline
 *   items={items}
 *   scrollContainerRef={scrollContainerRef}
 *   offset={64}
 *   onNavigateEnd={id => flashHeading(id)}
 * />
 * ```
 */
export function Outline({
  items,
  activeId,
  onActiveIdChange,
  label: labelFromProps,
  density = 'default',
  onNavigateStart,
  onNavigateEnd,
  offset = 0,
  scrollContainerRef,
  hasScrollOnClick = true,
  xstyle,
  className,
  style,
  ref,
  'data-testid': testId,
  ...props
}: OutlineProps) {
  const pressable = usePressFeedback();
  const t = useComponentTranslator();
  const label = labelFromProps ?? t('@astryx.outline.label');
  const rootRef = useRef<HTMLElement | null>(null);
  const LinkComponent = useLinkComponent();
  const {activeId: resolvedActiveId, scrollTo} = useScrollSpy({
    activeId,
    items,
    onActiveIdChange,
    rootRef,
    offset,
    scrollContainerRef,
    hasScrollOnClick,
    onNavigateStart,
    onNavigateEnd,
  });

  /**
   * The single navigation path, shared by click and keyboard activation:
   * push the hash, then hand off to the scroll-spy's `scrollTo`, which fires
   * the navigate callbacks and moves the indicator when the scroll settles.
   */
  const navigate = (id: string) => {
    if (scrollTo(id)) {
      window.history.pushState(null, '', `#${id}`);
      moveFocusTo(id);
    }
  };

  /** Whether an event carries a modifier chord we must leave to the browser. */
  const hasModifier = (
    event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
  ) => event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;

  const handleClick =
    (id: string) => (event: React.MouseEvent<HTMLElement>) => {
      // Let the browser handle modified clicks (open in new tab, etc.) without
      // touching the active state.
      if (event.defaultPrevented || hasModifier(event)) {
        return;
      }

      // With no target in the DOM — lazily-rendered or virtualized content —
      // there is nothing to scroll to and nothing to make active. Leave the
      // anchor to the browser's native fragment navigation (which still
      // updates the URL) rather than swallowing the click into a dead link.
      if (document.getElementById(id) == null) {
        return;
      }

      // Suppress the anchor's default jump: we own the scroll (or, with
      // `hasScrollOnClick={false}`, deliberately leave it to the consumer).
      event.preventDefault();
      navigate(id);
    };

  const handleKeyDown =
    (id: string) => (event: React.KeyboardEvent<HTMLElement>) => {
      // Enter is a link's native activation and already produces a click.
      // Space is not, so wire it up here to match the button-like affordance.
      if (event.key !== ' ' && event.key !== 'Spacebar') {
        return;
      }
      if (event.defaultPrevented || hasModifier(event)) {
        return;
      }

      // preventDefault does double duty: it stops the page from scrolling, and
      // it tells useScrollSpy this Space is an activation, not a manual scroll.
      event.preventDefault();
      navigate(id);
    };

  return (
    <nav
      {...props}
      ref={useMergedRefs(rootRef, ref)}
      aria-label={label}
      data-testid={testId}
      {...mergeProps(
        themeProps('outline', {density}),
        xstyleProps(xstyle),
        tw(outlineRootClassName, className),
        style,
      )}>
      <ul className={outlineListClassName} role="list">
        {items.map(item => {
          const isActive = item.id === resolvedActiveId;

          return (
            <li key={item.id} className={outlineItemClassName} role="listitem">
              <LinkComponent
                href={`#${item.id}`}
                aria-current={isActive ? 'location' : undefined}
                onClick={handleClick(item.id)}
                onKeyDown={handleKeyDown(item.id)}
                {...pressable}
                {...mergeProps(
                  themeProps('outline-item', {
                    active: isActive ? 'active' : null,
                    level: item.level,
                  }),
                  stylex.props(
                    // The strength and the release; the colour is a class below.
                    interactionOverlayStyles.pressedAlpha,
                  ),
                  tw(
                    outlineLinkClassName(density, item.level, isActive),
                    interactionOverlayBackgroundColorClassName,
                    focusOutlineFocusVisibleClassName,
                  ),
                )}>
                <span className={outlineLabelClassName}>{item.label}</span>
              </LinkComponent>
            </li>
          );
        })}
      </ul>

      {/* Track divider. Rendered after the list so the active anchor appears
          earlier in DOM order; `order: -1` keeps the track visually before it. */}
      <div className={outlineTrackClassName} aria-hidden="true">
        <span className={outlineDividerClassName} />
      </div>
      <span
        {...mergeProps(
          themeProps('outline-indicator'),
          outlineIndicatorClassName,
        )}
        aria-hidden="true"
      />
    </nav>
  );
}

Outline.displayName = 'Outline';
