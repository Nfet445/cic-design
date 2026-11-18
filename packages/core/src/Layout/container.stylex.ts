// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file container.stylex.ts
 * @input Uses the class map in containerClasses.ts
 * @output The container padding class builder, for the callers of this public
 *   subpath
 * @position Layout public subpath; used by Card, Section, Dialog,
 *   BottomSheet and Drawer
 *
 * ## Public API for themes
 *
 * Themes set `padding` on container component overrides. The theme build
 * pipeline expands this to component-scoped CSS custom properties, emitting
 * the `--astryx-*` tokens that the component reads:
 *
 *   --astryx-card-padding            (shorthand — all sides; emitted)
 *   --astryx-card-padding-inline     (horizontal)
 *   --astryx-card-padding-block-start
 *   --astryx-card-padding-block-end
 *
 * Read order per level: `var(--astryx-…, <next level>)`, terminating at
 * `--spacing-4`. Same pattern for section, dialog, bottom-sheet, and drawer.
 *
 * ```ts
 * components: {
 *   card: { base: { padding: '20px' } },          // → --astryx-card-padding: 20px
 *   section: { base: { padding: '12px 20px' } },  // → directional tokens
 *   dialog: { base: { padding: '16px' } },
 *   'bottom-sheet': { base: { padding: '16px' } },
 *   drawer: { base: { padding: '16px' } },
 * }
 * ```
 *
 * Internal variables (`--layout-padding-inner-x`, `--container-padding-*`,
 * `--container-corner-*`, `--_section-padding-propagated`) are implementation
 * details and must not be referenced by themes. They also do not cross an overlay boundary — see
 * `overlayPaddingReset` in padding.stylex.ts.
 *
 * SYNC: When modified, update /packages/core/src/Layout/Layout.doc.mjs
 * @deprecated A container returns a class string, so pass it to `className`
 *   and not to `stylex.props`. Import `container` from
 *   `Layout/containerClasses` instead; this module keeps the public subpath
 *   working until StyleX leaves the package.
 */

export {container, containerVars} from './containerClasses';
export type {
  ContainerComponent,
  ContainerOptions,
  SpacingToken,
} from './containerClasses';
