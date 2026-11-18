// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file containerClasses.ts
 * @input Accepts the padding a container publishes: a component's theme
 *   default, or one spacing token per outer and inner axis
 * @output Tailwind class names for the padding a container applies and the
 *   `--container-padding-*` / `--layout-padding-*` variables it announces, plus
 *   the variable names a container writes inline
 * @position Layout utility; used by Card, Section, Dialog, BottomSheet and
 *   Drawer
 *
 * ## Public API for themes
 *
 * Themes set `padding` on a container component override. The theme build
 * pipeline expands this to component-scoped CSS custom properties, and these
 * classes read the `--astryx-*` tokens it emits:
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
 * Internal variables (`--layout-padding-inner-x`, `--layout-padding-outer-y`,
 * `--container-padding-*`, `--_section-padding-propagated`) are implementation
 * details and must not be referenced by themes. They also do not cross an
 * overlay boundary — see `overlayPaddingReset` in paddingClasses.ts.
 *
 * A per-instance value the classes cannot hold is written inline: a container
 * element writes `--container-max-height` (see {@link containerVars}), which
 * `layoutFillClassName` reads to bound a fill layout.
 *
 * SYNC: packages/core/src/Layout/container.stylex.ts re-exports this module for
 * the callers of that public subpath, and
 * packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs checks the
 * rules these classes print.
 */

import {tw} from '../utils/tw';
import {layoutOwnOuterResetClassName} from './layoutClasses';
import {
  containerPaddingReadClassName,
  containerVariableClassName,
} from './paddingClasses';
import type {ContainerVariable} from './paddingClasses';
import type {SpacingStep} from '../utils/types';

/**
 * Spacing token keys for container padding props.
 */
export type SpacingToken =
  | 'spacing0'
  | 'spacing0_5'
  | 'spacing1'
  | 'spacing1_5'
  | 'spacing2'
  | 'spacing3'
  | 'spacing4'
  | 'spacing5'
  | 'spacing6'
  | 'spacing7'
  | 'spacing8'
  | 'spacing9'
  | 'spacing10'
  | 'spacing11'
  | 'spacing12';

/** The container components that publish a theme default padding. */
export type ContainerComponent =
  'card' | 'section' | 'dialog' | 'bottom-sheet' | 'drawer';

/**
 * The variables a container writes inline because a class cannot hold a
 * per-instance value.
 */
export const containerVars = {
  /** Bounds a fill layout: `layoutFillClassName` reads it. */
  maxHeight: '--container-max-height',
} as const;

/**
 * The padding a container applies and the Layouts inside it read: the four
 * `--container-padding-*` edges resolve from the variables below, and any
 * enclosing Layout's own outer padding is cleared, since this container's
 * values now describe the inset.
 */
export const containerBaseClassName = tw(
  'box-border',
  containerPaddingReadClassName,
  layoutOwnOuterResetClassName,
);

/**
 * The theme default of each container component: one class per variable, so
 * a theme that sets `padding` on a component override moves the inset, the
 * padding the container applies, and the Layout inside it together. Each chain
 * reads its own `--astryx-<component>-padding-*` level and terminates at
 * `--spacing-4`; Section reads the value an ancestor Section propagated ahead
 * of the theme token, and a bottom sheet publishes only the padding past the
 * grab-bar band.
 */
export const containerThemeDefaultPaddingClassName: Record<
  ContainerComponent,
  Record<ContainerVariable, string>
> = {
  card: {
    containerPaddingInlineStart:
      '[--container-padding-inline-start:var(--astryx-card-padding-inline-start,var(--astryx-card-padding-inline,var(--astryx-card-padding,var(--spacing-4))))]',
    containerPaddingInlineEnd:
      '[--container-padding-inline-end:var(--astryx-card-padding-inline-end,var(--astryx-card-padding-inline,var(--astryx-card-padding,var(--spacing-4))))]',
    containerPaddingBlockStart:
      '[--container-padding-block-start:var(--astryx-card-padding-block-start,var(--astryx-card-padding,var(--spacing-4)))]',
    containerPaddingBlockEnd:
      '[--container-padding-block-end:var(--astryx-card-padding-block-end,var(--astryx-card-padding,var(--spacing-4)))]',
    layoutPaddingOuterX:
      '[--layout-padding-outer-x:var(--astryx-card-padding-inline-start,var(--astryx-card-padding-inline,var(--astryx-card-padding,var(--spacing-4))))]',
    layoutPaddingOuterY:
      '[--layout-padding-outer-y:var(--astryx-card-padding-block-start,var(--astryx-card-padding,var(--spacing-4)))]',
    layoutPaddingInnerX:
      '[--layout-padding-inner-x:var(--astryx-card-padding-inline-start,var(--astryx-card-padding-inline,var(--astryx-card-padding,var(--spacing-4))))]',
    layoutPaddingInnerY:
      '[--layout-padding-inner-y:var(--astryx-card-padding-block-start,var(--astryx-card-padding,var(--spacing-4)))]',
  },
  section: {
    containerPaddingInlineStart:
      '[--container-padding-inline-start:var(--astryx-section-padding-inline-start,var(--astryx-section-padding-inline,var(--_section-padding-propagated,var(--astryx-section-padding,var(--spacing-4)))))]',
    containerPaddingInlineEnd:
      '[--container-padding-inline-end:var(--astryx-section-padding-inline-end,var(--astryx-section-padding-inline,var(--_section-padding-propagated,var(--astryx-section-padding,var(--spacing-4)))))]',
    containerPaddingBlockStart:
      '[--container-padding-block-start:var(--astryx-section-padding-block-start,var(--_section-padding-propagated,var(--astryx-section-padding,var(--spacing-4))))]',
    containerPaddingBlockEnd:
      '[--container-padding-block-end:var(--astryx-section-padding-block-end,var(--_section-padding-propagated,var(--astryx-section-padding,var(--spacing-4))))]',
    layoutPaddingOuterX:
      '[--layout-padding-outer-x:var(--astryx-section-padding-inline-start,var(--astryx-section-padding-inline,var(--_section-padding-propagated,var(--astryx-section-padding,var(--spacing-4)))))]',
    layoutPaddingOuterY:
      '[--layout-padding-outer-y:var(--astryx-section-padding-block-start,var(--_section-padding-propagated,var(--astryx-section-padding,var(--spacing-4))))]',
    layoutPaddingInnerX:
      '[--layout-padding-inner-x:var(--astryx-section-padding-inline-start,var(--astryx-section-padding-inline,var(--_section-padding-propagated,var(--astryx-section-padding,var(--spacing-4)))))]',
    layoutPaddingInnerY:
      '[--layout-padding-inner-y:var(--astryx-section-padding-block-start,var(--_section-padding-propagated,var(--astryx-section-padding,var(--spacing-4))))]',
  },
  dialog: {
    containerPaddingInlineStart:
      '[--container-padding-inline-start:var(--astryx-dialog-padding-inline-start,var(--astryx-dialog-padding-inline,var(--astryx-dialog-padding,var(--spacing-4))))]',
    containerPaddingInlineEnd:
      '[--container-padding-inline-end:var(--astryx-dialog-padding-inline-end,var(--astryx-dialog-padding-inline,var(--astryx-dialog-padding,var(--spacing-4))))]',
    containerPaddingBlockStart:
      '[--container-padding-block-start:var(--astryx-dialog-padding-block-start,var(--astryx-dialog-padding,var(--spacing-4)))]',
    containerPaddingBlockEnd:
      '[--container-padding-block-end:var(--astryx-dialog-padding-block-end,var(--astryx-dialog-padding,var(--spacing-4)))]',
    layoutPaddingOuterX:
      '[--layout-padding-outer-x:var(--astryx-dialog-padding-inline-start,var(--astryx-dialog-padding-inline,var(--astryx-dialog-padding,var(--spacing-4))))]',
    layoutPaddingOuterY:
      '[--layout-padding-outer-y:var(--astryx-dialog-padding-block-start,var(--astryx-dialog-padding,var(--spacing-4)))]',
    layoutPaddingInnerX:
      '[--layout-padding-inner-x:var(--astryx-dialog-padding-inline-start,var(--astryx-dialog-padding-inline,var(--astryx-dialog-padding,var(--spacing-4))))]',
    layoutPaddingInnerY:
      '[--layout-padding-inner-y:var(--astryx-dialog-padding-block-start,var(--astryx-dialog-padding,var(--spacing-4)))]',
  },
  'bottom-sheet': {
    containerPaddingInlineStart:
      '[--container-padding-inline-start:var(--astryx-bottom-sheet-padding-inline-start,var(--astryx-bottom-sheet-padding-inline,var(--astryx-bottom-sheet-padding,var(--spacing-4))))]',
    containerPaddingInlineEnd:
      '[--container-padding-inline-end:var(--astryx-bottom-sheet-padding-inline-end,var(--astryx-bottom-sheet-padding-inline,var(--astryx-bottom-sheet-padding,var(--spacing-4))))]',
    containerPaddingBlockStart:
      '[--container-padding-block-start:max(calc(var(--astryx-bottom-sheet-padding-block-start,var(--astryx-bottom-sheet-padding,var(--spacing-4)))_-_var(--spacing-6)),0px)]',
    containerPaddingBlockEnd:
      '[--container-padding-block-end:var(--astryx-bottom-sheet-padding-block-end,var(--astryx-bottom-sheet-padding,var(--spacing-4)))]',
    layoutPaddingOuterX:
      '[--layout-padding-outer-x:var(--astryx-bottom-sheet-padding-inline-start,var(--astryx-bottom-sheet-padding-inline,var(--astryx-bottom-sheet-padding,var(--spacing-4))))]',
    layoutPaddingOuterY:
      '[--layout-padding-outer-y:max(calc(var(--astryx-bottom-sheet-padding-block-start,var(--astryx-bottom-sheet-padding,var(--spacing-4)))_-_var(--spacing-6)),0px)]',
    layoutPaddingInnerX:
      '[--layout-padding-inner-x:var(--astryx-bottom-sheet-padding-inline-start,var(--astryx-bottom-sheet-padding-inline,var(--astryx-bottom-sheet-padding,var(--spacing-4))))]',
    layoutPaddingInnerY:
      '[--layout-padding-inner-y:max(calc(var(--astryx-bottom-sheet-padding-block-start,var(--astryx-bottom-sheet-padding,var(--spacing-4)))_-_var(--spacing-6)),0px)]',
  },
  drawer: {
    containerPaddingInlineStart:
      '[--container-padding-inline-start:var(--astryx-drawer-padding-inline-start,var(--astryx-drawer-padding-inline,var(--astryx-drawer-padding,var(--spacing-4))))]',
    containerPaddingInlineEnd:
      '[--container-padding-inline-end:var(--astryx-drawer-padding-inline-end,var(--astryx-drawer-padding-inline,var(--astryx-drawer-padding,var(--spacing-4))))]',
    containerPaddingBlockStart:
      '[--container-padding-block-start:var(--astryx-drawer-padding-block-start,var(--astryx-drawer-padding,var(--spacing-4)))]',
    containerPaddingBlockEnd:
      '[--container-padding-block-end:var(--astryx-drawer-padding-block-end,var(--astryx-drawer-padding,var(--spacing-4)))]',
    layoutPaddingOuterX:
      '[--layout-padding-outer-x:var(--astryx-drawer-padding-inline-start,var(--astryx-drawer-padding-inline,var(--astryx-drawer-padding,var(--spacing-4))))]',
    layoutPaddingOuterY:
      '[--layout-padding-outer-y:var(--astryx-drawer-padding-block-start,var(--astryx-drawer-padding,var(--spacing-4)))]',
    layoutPaddingInnerX:
      '[--layout-padding-inner-x:var(--astryx-drawer-padding-inline-start,var(--astryx-drawer-padding-inline,var(--astryx-drawer-padding,var(--spacing-4))))]',
    layoutPaddingInnerY:
      '[--layout-padding-inner-y:var(--astryx-drawer-padding-block-start,var(--astryx-drawer-padding,var(--spacing-4)))]',
  },
};

/**
 * The four spacing tokens beyond `SpacingStep`: the public `SpacingToken` names
 * every step the theme scale publishes, and these have no utility scale entry
 * of their own, so the class prints the variable value directly.
 */
const extraVariableClassByToken: Record<
  'spacing7' | 'spacing9' | 'spacing11' | 'spacing12',
  Record<ContainerVariable, string>
> = {
  spacing7: {
    containerPaddingInlineStart:
      '[--container-padding-inline-start:var(--spacing-7)]',
    containerPaddingInlineEnd:
      '[--container-padding-inline-end:var(--spacing-7)]',
    containerPaddingBlockStart:
      '[--container-padding-block-start:var(--spacing-7)]',
    containerPaddingBlockEnd:
      '[--container-padding-block-end:var(--spacing-7)]',
    layoutPaddingOuterX: '[--layout-padding-outer-x:var(--spacing-7)]',
    layoutPaddingOuterY: '[--layout-padding-outer-y:var(--spacing-7)]',
    layoutPaddingInnerX: '[--layout-padding-inner-x:var(--spacing-7)]',
    layoutPaddingInnerY: '[--layout-padding-inner-y:var(--spacing-7)]',
  },
  spacing9: {
    containerPaddingInlineStart:
      '[--container-padding-inline-start:var(--spacing-9)]',
    containerPaddingInlineEnd:
      '[--container-padding-inline-end:var(--spacing-9)]',
    containerPaddingBlockStart:
      '[--container-padding-block-start:var(--spacing-9)]',
    containerPaddingBlockEnd:
      '[--container-padding-block-end:var(--spacing-9)]',
    layoutPaddingOuterX: '[--layout-padding-outer-x:var(--spacing-9)]',
    layoutPaddingOuterY: '[--layout-padding-outer-y:var(--spacing-9)]',
    layoutPaddingInnerX: '[--layout-padding-inner-x:var(--spacing-9)]',
    layoutPaddingInnerY: '[--layout-padding-inner-y:var(--spacing-9)]',
  },
  spacing11: {
    containerPaddingInlineStart:
      '[--container-padding-inline-start:var(--spacing-11)]',
    containerPaddingInlineEnd:
      '[--container-padding-inline-end:var(--spacing-11)]',
    containerPaddingBlockStart:
      '[--container-padding-block-start:var(--spacing-11)]',
    containerPaddingBlockEnd:
      '[--container-padding-block-end:var(--spacing-11)]',
    layoutPaddingOuterX: '[--layout-padding-outer-x:var(--spacing-11)]',
    layoutPaddingOuterY: '[--layout-padding-outer-y:var(--spacing-11)]',
    layoutPaddingInnerX: '[--layout-padding-inner-x:var(--spacing-11)]',
    layoutPaddingInnerY: '[--layout-padding-inner-y:var(--spacing-11)]',
  },
  spacing12: {
    containerPaddingInlineStart:
      '[--container-padding-inline-start:var(--spacing-12)]',
    containerPaddingInlineEnd:
      '[--container-padding-inline-end:var(--spacing-12)]',
    containerPaddingBlockStart:
      '[--container-padding-block-start:var(--spacing-12)]',
    containerPaddingBlockEnd:
      '[--container-padding-block-end:var(--spacing-12)]',
    layoutPaddingOuterX: '[--layout-padding-outer-x:var(--spacing-12)]',
    layoutPaddingOuterY: '[--layout-padding-outer-y:var(--spacing-12)]',
    layoutPaddingInnerX: '[--layout-padding-inner-x:var(--spacing-12)]',
    layoutPaddingInnerY: '[--layout-padding-inner-y:var(--spacing-12)]',
  },
};

/** The eight variables a spacing token sets, one class per variable. */
const variableClassByToken: Record<
  SpacingToken,
  Record<ContainerVariable, string>
> = {
  spacing0: variablesOfStep(0),
  spacing0_5: variablesOfStep(0.5),
  spacing1: variablesOfStep(1),
  spacing1_5: variablesOfStep(1.5),
  spacing2: variablesOfStep(2),
  spacing3: variablesOfStep(3),
  spacing4: variablesOfStep(4),
  spacing5: variablesOfStep(5),
  spacing6: variablesOfStep(6),
  spacing7: extraVariableClassByToken['spacing7'],
  spacing8: variablesOfStep(8),
  spacing9: extraVariableClassByToken.spacing9,
  spacing10: variablesOfStep(10),
  spacing11: extraVariableClassByToken.spacing11,
  spacing12: extraVariableClassByToken.spacing12,
};

export interface ContainerOptions {
  /**
   * Shortcut to set all padding values at once.
   * Sets paddingOuterX, paddingOuterY, paddingInnerX, and paddingInnerY
   * to the same value. Individual properties override this when set.
   * @default 'spacing4'
   */
  padding?: SpacingToken;

  /**
   * Outer horizontal padding (left/right).
   * Sets --container-padding-inline-start/end and --layout-padding-outer-x CSS variables.
   * Overrides `padding` for the horizontal outer axis.
   */
  paddingOuterX?: SpacingToken;

  /**
   * Outer vertical padding (top/bottom).
   * Sets --container-padding-block-start, --container-padding-block-end, and --layout-padding-outer-y CSS variables.
   * Overrides `padding` for the vertical outer axis.
   */
  paddingOuterY?: SpacingToken;

  /**
   * Inner horizontal padding for content areas.
   * Sets --layout-padding-inner-x CSS variable.
   * Overrides `padding` for the horizontal inner axis.
   */
  paddingInnerX?: SpacingToken;

  /**
   * Inner vertical padding for content areas.
   * Sets --layout-padding-inner-y CSS variable.
   * Overrides `padding` for the vertical inner axis.
   */
  paddingInnerY?: SpacingToken;

  /**
   * When set to a component name ('card' | 'section' | 'dialog' |
   * 'bottom-sheet' | 'drawer'), internal layout
   * padding variables cascade from the component-specific public CSS
   * container tokens (set by theme pipeline from `padding` shorthand)
   * instead of being set to explicit spacing token values.
   *
   * This allows themes to override container padding via component-specific
   * public CSS custom properties without touching internal vars.
   *
   * Used by Card, Section, Dialog, BottomSheet, and Drawer when no explicit
   * padding prop is provided.
   * @default undefined (uses explicit spacing token values)
   */
  useThemeDefault?: ContainerComponent;
}

/**
 * The class names that make an element a container: it applies the padding it
 * announces, and it publishes the variables a Layout inside it reads.
 *
 * Themes should use `padding` (or `paddingBlock`/`paddingInline`) in
 * component overrides to adjust padding. Do not reference
 * `--layout-padding-*` variables directly.
 *
 * @example
 * ```
 * import { container, containerVars } from '@astryxdesign/core/Layout';
 *
 * // A card container with the theme's card padding
 * <div className={container({ useThemeDefault: 'card' })}>
 *   <Layout ... />
 * </div>
 *
 * // Uniform padding
 * <div className={container({ padding: 'spacing3' })}>
 *   <Layout ... />
 * </div>
 *
 * // Asymmetric — padding as base, paddingOuterY overrides vertical
 * <div className={container({ padding: 'spacing3', paddingOuterY: 'spacing2' })}>
 *   <Layout ... />
 * </div>
 * ```
 */
export function container({
  padding = 'spacing4',
  paddingOuterX,
  paddingOuterY,
  paddingInnerX,
  paddingInnerY,
  useThemeDefault,
}: ContainerOptions): string {
  if (useThemeDefault) {
    return tw(
      containerBaseClassName,
      ...Object.values(containerThemeDefaultPaddingClassName[useThemeDefault]),
    );
  }

  const outerX = variableClassByToken[paddingOuterX ?? padding];
  const outerY = variableClassByToken[paddingOuterY ?? padding];
  const innerX = variableClassByToken[paddingInnerX ?? padding];
  const innerY = variableClassByToken[paddingInnerY ?? padding];
  return tw(
    containerBaseClassName,
    outerX.containerPaddingInlineStart,
    outerX.containerPaddingInlineEnd,
    outerY.containerPaddingBlockStart,
    outerY.containerPaddingBlockEnd,
    outerX.layoutPaddingOuterX,
    outerY.layoutPaddingOuterY,
    innerX.layoutPaddingInnerX,
    innerY.layoutPaddingInnerY,
  );
}

/** The eight variables of one spacing step, from the step classes. */
function variablesOfStep(step: SpacingStep): Record<ContainerVariable, string> {
  return {
    containerPaddingInlineStart: containerVariableClassName(
      'containerPaddingInlineStart',
      step,
    ),
    containerPaddingInlineEnd: containerVariableClassName(
      'containerPaddingInlineEnd',
      step,
    ),
    containerPaddingBlockStart: containerVariableClassName(
      'containerPaddingBlockStart',
      step,
    ),
    containerPaddingBlockEnd: containerVariableClassName(
      'containerPaddingBlockEnd',
      step,
    ),
    layoutPaddingOuterX: containerVariableClassName(
      'layoutPaddingOuterX',
      step,
    ),
    layoutPaddingOuterY: containerVariableClassName(
      'layoutPaddingOuterY',
      step,
    ),
    layoutPaddingInnerX: containerVariableClassName(
      'layoutPaddingInnerX',
      step,
    ),
    layoutPaddingInnerY: containerVariableClassName(
      'layoutPaddingInnerY',
      step,
    ),
  };
}
