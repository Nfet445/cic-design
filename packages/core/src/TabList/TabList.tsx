// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TabList.tsx
 * @input Uses React, StyleX, TabListContext, useListFocus, useKeyboardHint,
 *   useScrollOverflow, Icon
 * @output Exports TabList component, TabListProps and TabListOverflow types
 * @position Tab strip wrapper; provides TabListContext to Tab and TabMenu
 *   children. A `<nav>` landmark by default; speaks the WAI-ARIA tabs pattern
 *   where the caller asks for it with `role="tablist"`. Owns
 *   roving-tabindex keyboard navigation (Arrow/Home/End) across the tab
 *   strip via the shared useListFocus hook so it is a single Tab stop, and
 *   owns horizontal scrolling when the tabs are wider than the strip.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/TabList/TabList.doc.mjs
 * - /packages/core/src/TabList/index.ts
 * - /packages/core/src/TabList/TabList.test.tsx
 * - /packages/cli/assets/templates/blocks/components/TabList/ (showcase blocks)
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type AriaRole,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import {TabListContext} from './TabListContext';
import type {TabListSize} from './TabListContext';
import {useSize} from '../SizeContext/SizeContext';
import {mergeProps, RTL_MIRROR_CLASS} from '../utils';
import {useListFocus} from '../hooks/useListFocus';
import {useKeyboardHint} from '../hooks/useKeyboardHint';
import {useScrollOverflow} from '../hooks/useScrollOverflow';
import {isRtlElement} from '../hooks/isRtlElement';
import {Icon} from '../Icon';
import {EDGE_COMP_ATTR} from '../Layout/edgeCompensation.stylex';
import {themeProps} from '../utils/themeProps';
import {observeResize} from '../utils/sharedResizeObserver';
import {createDevWarnings} from '../utils/devWarning';
import {focusOutlineProps} from '../utils/focusOutline.stylex';
import {tw} from '../utils/tw';
import {
  tabListArrowClassName,
  tabListNavClassName,
  tabListStripClassName,
  TAB_LIST_DIVIDER_CLASS,
  TAB_LIST_FULL_BLEED_CLASS,
} from './tabListClasses';

import {useMergedRefs} from '../hooks/useMergedRefs';
import {
  registerEnglishFallback,
  useComponentTranslator,
} from '../i18n/useComponentTranslator';
import english from '../i18n/generated-english/TabList/TabList.generated';

// Bundlers replace this value at build time. The declaration lets a product
// without Node's types type-check this file.
declare const process: {readonly env: {readonly NODE_ENV?: string}};

registerEnglishFallback(english);
/**
 * Selector matching the focusable stops in the tab strip: every Tab
 * (`[data-tab-value]`) and every TabMenu trigger (`[data-tab-menu]`),
 * in DOM order. Disabled stops are filtered out by the handler.
 */
const TAB_STOP_SELECTOR = '[data-tab-value],[data-tab-menu]';

function preventFocus(e: React.MouseEvent) {
  e.preventDefault();
}

/** Fraction of the visible strip an arrow press scrolls. */
const SCROLL_PAGE_RATIO = 0.8;

/**
 * How a strip narrower than its tabs behaves.
 *
 * - `'auto'` — the component picks the strategy. Today that is always
 *   `'scroll'`.
 * - `'scroll'` — the tabs scroll horizontally. Every tab stays a tab.
 * - `'visible'` — no overflow handling: tabs keep their intrinsic widths and
 *   spill out of the strip, as they did before overflow existed.
 */
export type TabListOverflow = 'auto' | 'scroll' | 'visible';

export interface TabListProps extends Omit<BaseProps<HTMLElement>, 'onChange'> {
  ref?: React.Ref<HTMLElement>;
  /**
   * The currently selected tab value.
   */
  value: string;
  /**
   * Callback fired when a tab is selected.
   */
  onChange: (value: string) => void;
  /**
   * Size of the tab hover targets. Uses the same element size tokens
   * as Button and TextInput (`sm` = 28px, `md` = 32px, `lg` = 36px).
   * @default 'md'
   */
  size?: TabListSize;
  /**
   * Layout mode for tab sizing.
   * - `'hug'` (default): each tab hugs its content width.
   * - `'fill'`: tabs stretch equally to fill the container width.
   * @default 'hug'
   */
  layout?: 'hug' | 'fill';
  /**
   * Whether to show a bottom divider under the tab list.
   * @default false
   */
  hasDivider?: boolean;
  /**
   * Bleeds the strip out to its container's content edges.
   *
   * Both halves are computed from the `--container-padding-*` custom
   * properties a padded Layout container publishes. The strip's box is pulled
   * out through the container's inline padding, so a `hasDivider` underline —
   * or the header's own divider, when the strip is docked on it — spans the
   * full content width. The strip then pads back in by whatever that bleed
   * exceeds a stop's own inline padding, so the first and last label still
   * land on the container's content inset rather than 4px short of it.
   *
   * Outside a padded container the properties are unset, the pad-back clamps
   * to zero, and the strip is left exactly as it was. Block-edge docking stays
   * with the surrounding layout because it cannot be detected through nested
   * wrappers without pulling a mid-content strip into its siblings.
   * @default false
   */
  isFullBleed?: boolean;
  /**
   * ARIA role for the strip.
   *
   * `"tablist"` asks for the WAI-ARIA tabs pattern: `role="tablist"` /
   * `role="tab"` and `aria-selected`, with each tab pointing at the panel it
   * controls via its `panelId`. Only tabs may live in a tablist strip, and a
   * tab does not navigate — an `href` is ignored there.
   *
   * Left unset, the strip is a `<nav>` landmark marking the current tab with
   * `aria-current`. Any other value is passed through to the element
   * unchanged.
   */
  role?: AriaRole;
  /**
   * What happens when the tabs are wider than the strip.
   *
   * `'auto'` lets the component choose; today it always scrolls. `'scroll'`
   * scrolls the tabs horizontally, with edge fades and — for pointers that
   * can hover — arrow affordances. `'visible'` turns overflow handling off and
   * lets the tabs spill out of the strip.
   *
   * The selected tab is always scrolled back into view.
   * @default 'auto'
   */
  overflow?: TabListOverflow;
  /**
   * Tab and TabMenu children.
   */
  children: ReactNode;
}

/**
 * Tab navigation wrapper. Provides context for value/onChange/size
 * to Tab and TabMenu children.
 *
 * @example
 * ```
 * <TabList value={activeTab} onChange={setActiveTab}>
 *   <Tab value="home" label="Home" />
 *   <Tab value="settings" label="Settings" />
 *   <TabMenu label="More">
 *     <Tab value="analytics" label="Analytics" />
 *     <Tab value="reports" label="Reports" />
 *   </TabMenu>
 * </TabList>
 * ```
 */
export function TabList({
  ref,
  value,
  onChange,
  size: sizeProp,
  layout = 'hug',
  hasDivider = false,
  isFullBleed = false,
  role,
  overflow = 'auto',
  xstyle,
  className,
  style,
  children,
  onKeyDown: onKeyDownProp,
  onFocus: onFocusProp,
  onBlur: onBlurProp,
  'aria-label': ariaLabelFromProps,
  'aria-labelledby': ariaLabelledBy,
  'aria-orientation': _ariaOrientation,
  [EDGE_COMP_ATTR]: _edgeCompAttr,
  ...restProps
}: TabListProps) {
  const t = useComponentTranslator();
  const ariaLabel = ariaLabelFromProps ?? t('@astryx.tabList.label');
  const size = useSize(sizeProp, 'md');
  const hasScroll = overflow !== 'visible';

  const stripRef = useRef<HTMLDivElement | null>(null);
  // Only an asserted `role="tablist"` switches the pattern. Left unset the
  // strip is the `<nav>` it has always been, and every other role passes
  // through to the element untouched.
  const isTabList = role === 'tablist';

  // Roving-tabindex keyboard navigation across the tab strip via the shared
  // hook. Under the navigation pattern `orientation: 'both'` accepts both
  // arrow axes per the WAI-ARIA APG allowance for tab strips
  // (ArrowRight/ArrowDown advance, ArrowLeft/ArrowUp retreat). A tablist
  // reports itself as horizontal, so there the strip takes only the
  // horizontal arrows and leaves ArrowUp and ArrowDown to scroll the page. We
  // do not set `aria-orientation` on the `<nav>`: that attribute is invalid on
  // the navigation role and triggers an axe `aria-allowed-attr` violation.
  //
  // `hasRovingTabIndex` makes the hook own the single tab stop: it stamps
  // tabindex 0/-1, repairs the stop on mount and as stops mount/unmount or
  // toggle disabled, and -- via `handleFocus` on the nav -- keeps the stop in
  // sync after clicks or programmatic focus. Individual Tabs still render
  // `tabIndex={isSelected ? 0 : -1}` (see Tab.tsx) as the initial source of
  // truth; the hook's repair preserves an existing tab stop and only promotes
  // the first enabled stop when none is tabbable.
  const {listRef, handleKeyDown, handleFocus} = useListFocus<HTMLElement>({
    itemSelector: TAB_STOP_SELECTOR,
    boundarySelector: '.astryx-tab-list, [popover]',
    orientation: isTabList ? 'horizontal' : 'both',
    hasRovingTabIndex: true,
  });

  const {
    hintElement,
    onKeyDown: onHintKeyDown,
    onFocus: onHintFocus,
    onBlur: onHintBlur,
  } = useKeyboardHint();

  const {scrollRef, overflowStart, overflowEnd} = useScrollOverflow();

  const attachStrip = useCallback(
    (el: HTMLDivElement | null) => {
      stripRef.current = el;
      scrollRef(hasScroll ? el : null);
    },
    [hasScroll, scrollRef],
  );

  const revealStop = useCallback(
    (stop: HTMLElement | null) => {
      const strip = stripRef.current;
      if (!hasScroll || !strip || !stop) {
        return;
      }
      const stripBox = strip.getBoundingClientRect();
      const stopBox = stop.getBoundingClientRect();
      const inset = parseFloat(getComputedStyle(strip).scrollPaddingLeft) || 0;
      const pastEnd = stopBox.right - (stripBox.right - inset);
      const pastStart = stopBox.left - (stripBox.left + inset);
      // A stop wider than the space kept clear cannot be shown whole, so show
      // its reading start, the way `scrollIntoView({inline: 'nearest'})` does.
      const tooWide = stopBox.width > stripBox.width - 2 * inset;
      const delta = tooWide
        ? isRtlElement(strip)
          ? pastEnd
          : pastStart
        : pastEnd > 0
          ? pastEnd
          : pastStart < 0
            ? pastStart
            : 0;
      if (delta !== 0) {
        // Not an animation: the strip has to arrive already showing the right
        // tab, so this overrides the CSS smooth behaviour arrow presses use.
        strip.scrollBy({left: delta, behavior: 'instant'});
      }
    },
    [hasScroll],
  );

  const revealSelectedTab = useCallback(() => {
    const strip = stripRef.current;
    if (!strip) {
      return;
    }
    revealStop(
      Array.from(strip.querySelectorAll<HTMLElement>('[data-tab-value]')).find(
        el => el.dataset.tabValue === value,
      ) ?? null,
    );
  }, [revealStop, value]);

  // Both reveals below reach the callback through a ref instead of depending
  // on it: its identity also changes with `overflow`, and that is not a reason
  // to scroll anything.
  const revealSelectedTabRef = useRef(revealSelectedTab);
  useEffect(() => {
    revealSelectedTabRef.current = revealSelectedTab;
  }, [revealSelectedTab]);

  // The tab whose focus revealed it (see `handleRootFocus`), while it keeps
  // focus.
  const focusRevealedValueRef = useRef<string | null>(null);

  // The tab you are on has to be visible. Selection can move without focus —
  // on mount, or when the host sets `value` itself — and neither scrolls the
  // strip the way clicking or arrowing to a tab does. The check is what makes
  // a selection change the trigger, rather than the effect happening to run.
  const revealedValueRef = useRef<string | null>(null);
  useEffect(() => {
    if (revealedValueRef.current === value) {
      return;
    }
    revealedValueRef.current = value;
    if (value != null && focusRevealedValueRef.current === value) {
      // A press or an arrow focused this tab first, and focusing it revealed
      // it. Measuring now would force the new selection's style and layout
      // inside the press, before it can paint. The next frame lays them out
      // anyway, so finish there: the selected weight can still widen the tab.
      const frame = requestAnimationFrame(() => revealSelectedTabRef.current());
      return () => cancelAnimationFrame(frame);
    }
    revealSelectedTabRef.current();
  }, [value]);

  // ...and it has to stay visible when the strip is what moved. A strip that
  // fitted at one width can hide the selected tab at a narrower one, and no
  // prop changes when that happens. This one re-reveals the same selection by
  // design, which is why the check above sits in the effect rather than in
  // `revealSelectedTab`.
  //
  // The wrapper is observed rather than the strip because the shared observer
  // keeps one callback per element and `useScrollOverflow` already holds the
  // strip's.
  useEffect(() => {
    const root = listRef.current;
    if (!hasScroll || !root) {
      return;
    }
    const onResize = () => revealSelectedTabRef.current();
    return observeResize(root, onResize);
  }, [hasScroll, listRef]);

  const scrollByPage = useCallback((direction: -1 | 1) => {
    const strip = stripRef.current;
    if (!strip) {
      return;
    }
    // Under RTL the scroll axis is inverted, so flip the physical delta.
    const rtlSign = isRtlElement(strip) ? -1 : 1;
    strip.scrollBy({
      left: rtlSign * direction * strip.clientWidth * SCROLL_PAGE_RATIO,
    });
  }, []);

  const scrollToStart = useCallback(() => scrollByPage(-1), [scrollByPage]);
  const scrollToEnd = useCallback(() => scrollByPage(1), [scrollByPage]);

  const contextValue = useMemo(
    () => ({
      value,
      onChange,
      size,
      layout,
      pattern: isTabList ? ('tabs' as const) : ('nav' as const),
    }),
    [value, onChange, size, layout, isTabList],
  );

  const handleRootKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      onKeyDownProp?.(e);
      if (e.defaultPrevented) {
        return;
      }
      onHintKeyDown(e);
      handleKeyDown(e);
    },
    [onKeyDownProp, onHintKeyDown, handleKeyDown],
  );

  const handleRootFocus = useCallback(
    (e: React.FocusEvent<HTMLElement>) => {
      onFocusProp?.(e);
      if (e.defaultPrevented) {
        return;
      }
      onHintFocus(e);
      handleFocus(e);
      // The browser scrolls a focused element into view only when it is
      // entirely outside the scrollport, so arrowing onto a half-visible stop
      // leaves it cut off under the fade. Finish the job it started.
      const stop = e.target.closest<HTMLElement>(TAB_STOP_SELECTOR);
      revealStop(stop);
      focusRevealedValueRef.current = stop?.dataset.tabValue ?? null;
    },
    [onFocusProp, onHintFocus, handleFocus, revealStop],
  );

  const handleRootBlur = useCallback(
    (e: React.FocusEvent<HTMLElement>) => {
      onBlurProp?.(e);
      focusRevealedValueRef.current = null;
      if (e.defaultPrevented) {
        return;
      }
      onHintBlur(e);
    },
    [onBlurProp, onHintBlur],
  );

  // `role="tablist"` owns only tabs, so anything else in the strip is invalid
  // markup. Dev-only, and only under the asserted role — nothing else in the
  // component reads the rendered DOM.
  const [warn] = useState(createDevWarnings);
  useEffect(() => {
    const strip = stripRef.current;
    if (process.env.NODE_ENV === 'production' || !isTabList || !strip) {
      return;
    }
    const stranger = Array.from(strip.children).find(
      child => child.getAttribute('role') !== 'tab',
    );
    if (stranger) {
      warn(
        'TabList',
        `role="tablist" owns only tabs, but the strip contains a <${stranger.tagName.toLowerCase()}> that is not one. ` +
          'Render menus and other controls outside the strip, or drop the role for the navigation pattern.',
        'content',
      );
    }
    // No dependency list: the check is on rendered DOM, which can change
    // without any prop this component could watch.
  });

  // A tablist is not navigation, so the landmark element is only right under
  // the navigation pattern. The role is fixed by a prop rather than by what
  // the strip happens to hold, so this is settled once at the callsite.
  const Wrapper = isTabList ? 'div' : 'nav';

  return (
    <TabListContext value={contextValue}>
      <Wrapper
        ref={useMergedRefs(ref, listRef)}
        {...restProps}
        role={isTabList ? undefined : role}
        aria-label={isTabList ? undefined : ariaLabel}
        aria-labelledby={isTabList ? undefined : ariaLabelledBy}
        onKeyDown={handleRootKeyDown}
        onFocus={handleRootFocus}
        onBlur={handleRootBlur}
        {...{[EDGE_COMP_ATTR]: ''}}
        {...mergeProps(
          themeProps('tab-list', {size}),
          stylex.props(xstyle),
          tw(
            tabListNavClassName({isFill: layout === 'fill'}),
            hasDivider && TAB_LIST_DIVIDER_CLASS,
            isFullBleed && TAB_LIST_FULL_BLEED_CLASS,
            className,
          ),
          style,
        )}>
        <div
          ref={attachStrip}
          role={isTabList ? 'tablist' : undefined}
          aria-label={isTabList ? ariaLabel : undefined}
          // The name belongs to whichever element carries the widget role.
          aria-labelledby={isTabList ? ariaLabelledBy : undefined}
          {...mergeProps(
            themeProps('tab-strip'),
            tabListStripClassName({
              hasScroll,
              isFullBleed,
              fadesStart: hasScroll && overflowStart,
              fadesEnd: hasScroll && overflowEnd,
            }),
          )}>
          {children}
        </div>
        {hasScroll && overflowStart && (
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            // Nothing hidden from assistive technology should end up holding
            // focus, and a click would put it here.
            onMouseDown={preventFocus}
            onClick={scrollToStart}
            {...mergeProps(
              themeProps('tab-scroll-button'),
              focusOutlineProps.focusVisible(
                tabListArrowClassName({edge: 'start', size}),
              ),
            )}>
            <Icon
              icon="chevronLeft"
              size="sm"
              color="inherit"
              className={RTL_MIRROR_CLASS}
            />
          </button>
        )}
        {hasScroll && overflowEnd && (
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onMouseDown={preventFocus}
            onClick={scrollToEnd}
            {...mergeProps(
              themeProps('tab-scroll-button'),
              focusOutlineProps.focusVisible(
                tabListArrowClassName({edge: 'end', size}),
              ),
            )}>
            <Icon
              icon="chevronRight"
              size="sm"
              color="inherit"
              className={RTL_MIRROR_CLASS}
            />
          </button>
        )}
        {hintElement}
      </Wrapper>
    </TabListContext>
  );
}

TabList.displayName = 'TabList';
