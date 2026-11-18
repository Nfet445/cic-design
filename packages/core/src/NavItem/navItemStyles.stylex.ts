// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file navItemStyles.stylex.ts
 * @input Uses theme tokens (color, spacing, radius, typography, transition, size)
 * @output Exports shared nav item appearance styles and NavItemSize type
 * @position Shared styles consumed by SideNavItem, TopNavItem (drawer mode),
 *   TopNavMenu (drawer mode), and any custom nav items that need to match.
 *
 * Centralizes the nav item appearance (layout, colors, hover/active/selected states,
 * disabled state) so all nav-like components stay in sync — especially important
 * when TopNav items render inside MobileNav drawers alongside SideNav items.
 *
 * Individual components layer their own overrides (e.g. collapsed mode,
 * indentation) via stylex.props composition.
 *
 * The focus ring is not defined here. Compose
 * `focusOutlineProps.focusVisible` (utils/focusOutline.stylex.ts) at the call
 * site, on whichever element actually takes focus — in a split-action row that
 * is the link and the toggle, not the row that contains them.
 * @deprecated Internal appearance seam: it is not a public API and it
 *   disappears when StyleX leaves the package.
 */

export type NavItemSize = 'sm' | 'md' | 'lg';

import * as stylex from '@stylexjs/stylex';

/**
 * Base styles shared by all nav item components.
 * Apply as a foundation and override specific properties as needed.
 *
 * @example
 * ```
 * import {navItemStyles} from '@astryxdesign/core/navItemStyles';
 *
 * const styles = stylex.create({
 *   indented: { paddingInlineStart: 'var(--spacing-6)' },
 * });
 *
 * <a {...stylex.props(navItemStyles.item, styles.indented)}>
 *   Dashboard
 * </a>
 * ```
 */
export const navItemStyles = stylex.create({
  /** Base interactive nav item — layout, typography, hover/active states */
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    width: '100%',
    // A minimum, so an item grows with a larger text size and its label never
    // leaves it.
    minHeight: 'var(--size-element-md)',
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 0,
    borderRadius: 'var(--radius-element)',
    borderWidth: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    color: 'var(--color-text-primary)',
    textDecoration: 'none',
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    fontFamily: 'inherit',
    fontSize: 'var(--text-label-size)',
    fontWeight: 'var(--font-weight-normal)',
    lineHeight: 'var(--text-label-leading)',
    textAlign: 'start',
    boxSizing: 'border-box',
  },

  /** Selected/active page indicator — deemphasized background, medium weight */
  selected: {
    // Forced colors flatten `--color-neutral` away, leaving the current page
    // unmarked; Highlight/HighlightText is the platform convention, as in
    // ToggleButton and SegmentedControlItem. No `forced-color-adjust: none`
    // here — a nav row is not a native control, so the keywords land without
    // it, and it would inherit into `endContent` and pin a Badge's own fill.
    backgroundColor: {
      default: 'var(--color-neutral)',
      '@media (forced-colors: active)': 'Highlight',
    },
    color: {
      default: null,
      '@media (forced-colors: active)': 'HighlightText',
    },
    fontWeight: 'var(--font-weight-medium)',
    ':hover:where(:not(:disabled,[aria-disabled="true"]))': {
      '@media (hover: hover)': {
        backgroundColor: {
          default: 'var(--color-neutral)',
          // Nested, not a sibling `(hover: hover) and (forced-colors:
          // active)` block: as siblings `item`'s hover overlay ties on
          // specificity and wins on source order, erasing the fill.
          '@media (forced-colors: active)': 'Highlight',
        },
      },
    },
    ':active': {
      backgroundColor: {
        default: 'var(--color-neutral)',
        '@media (forced-colors: active)': 'Highlight',
      },
    },
    // The touch press model writes these instead of `:active`; the selected
    // item keeps its fill under a finger the way it does under a mouse, and
    // paints no overlay at any phase of the press.
    '[data-astryx-press="on"]': {
      backgroundColor: {
        default: 'var(--color-neutral)',
        '@media (forced-colors: active)': 'Highlight',
      },
      backgroundImage: 'none',
    },
    '[data-astryx-press="fading"]': {
      backgroundColor: {
        default: 'var(--color-neutral)',
        '@media (forced-colors: active)': 'Highlight',
      },
      backgroundImage: 'none',
    },
  },

  /** Disabled state — muted color, no interaction */
  disabled: {
    color: 'var(--color-text-disabled)',
    cursor: 'default',
    pointerEvents: 'none' as const,
  },

  /** Small size variant */
  sm: {
    minHeight: 'var(--size-element-sm)',
    paddingInline: 'var(--spacing-1)',
  },

  /** Medium size variant (default) */
  md: {
    minHeight: 'var(--size-element-md)',
    paddingInline: 'var(--spacing-2)',
  },

  /** Large size variant */
  lg: {
    minHeight: 'var(--size-element-lg)',
    paddingInline: 'var(--spacing-2)',
  },
});
