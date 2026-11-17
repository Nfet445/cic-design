// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file stepClasses.ts
 * @input The step's orientation, its progress and semantic status, whether the
 *   row is a button and whether its connectors are hidden at either end
 * @output Every part of a Step as a Tailwind class string, plus the custom
 *   properties a per-instance density or fill timing is written through
 * @position Internal to Step; the Tailwind build scans it for class names
 *
 * A connector is one box whose accent fill is a `::before` scaled along the
 * track axis, so advancing a step grows a line out of the segment's leading
 * edge instead of recolouring the whole segment at once. The density and the
 * fill timing vary per instance, so they arrive as inline custom properties
 * (`--astryx-step-density`, `--astryx-step-density-inline`,
 * `--astryx-step-fill-duration`, `--astryx-step-fill-delay`) that these
 * classes read.
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from '../utils/tw';

/** The inline properties a step writes and its classes read. */
export const stepVars = {
  density: '--astryx-step-density',
  densityInline: '--astryx-step-density-inline',
  fillDuration: '--astryx-step-fill-duration',
  fillDelay: '--astryx-step-fill-delay',
} as const;

/**
 * The marker a step's `<li>` carries so a connector can read its own position.
 * `:first-child` and `:last-child` are scoped to this class rather than to the
 * parent `<ol>`, which is also a first and last child.
 */
export const stepItemClassName = 'astryx-step-item';

// ===================== SEPARATED LAYOUT =====================

export const verticalRootClassName = tw(
  'flex flex-row items-stretch relative gap-0.5',
);

/** The 4px progress bar beside a vertical step's body. */
export const verticalBarClassName = tw('w-1 shrink-0 self-stretch');

export const verticalBodyClassName = tw('flex flex-1 flex-col');

/**
 * `flex-1` alone does not make horizontal steps equal: a flex item's default
 * `min-width: auto` floors it at its own min-content, so a step labelled
 * "Integrations" claims a wider slice of the track. Zeroing the floor lets the
 * even distribution apply. Stretched, not flex-start, for the same reason: a
 * fit-content child spills its label into the next step instead of ellipsizing.
 */
export const horizontalStepClassName = tw(
  'flex flex-1 flex-col items-stretch min-w-0',
);

/** The 4px progress bar above a horizontal step. */
export const horizontalBarClassName = tw('w-full h-1 shrink-0 mb-0.5');

// ===================== CONNECTOR =====================

/**
 * The unfilled track and the accent fill that scales along it. `border-radius:
 * inherit` lets the fill follow whatever the segment rounds to — the full pill
 * of a separated bar, the square ends the on-track segments stack with.
 *
 * Linear timing, deliberately: a node-to-node span is often two segments, and
 * a curve restarts its deceleration at the seam, so the front stalls at the
 * joint and the line stops reading as one growth. The reduced-motion escape
 * restates both halves of the timing, because a segment that redefines
 * `transition-duration` replaces this declaration wholesale.
 */
const CONNECTOR = tw(
  'relative bg-[var(--color-border)]',
  'before:absolute before:inset-0 before:rounded-[inherit] before:bg-[var(--color-accent)]',
  'before:transition-[transform] before:ease-linear',
  'before:duration-[var(--astryx-step-fill-duration)] before:delay-[var(--astryx-step-fill-delay)]',
  'motion-reduce:before:duration-0 motion-reduce:before:delay-0',
);

/**
 * Vertical progress runs down the block axis under both LTR and RTL, because
 * direction only mirrors the inline axis, so the growth anchors at the physical
 * top.
 */
export const connectorFillVClassName = tw(
  CONNECTOR,
  'before:[transform-origin:center_top] before:[transform:scaleY(1)]',
);

export const connectorEmptyVClassName = tw(
  CONNECTOR,
  'before:[transform-origin:center_top] before:[transform:scaleY(0)]',
);

/**
 * Horizontal progress runs along the reading direction, and `transform-origin`
 * takes no logical keywords, so the flip is spelled out. Stated on both states
 * rather than hoisted into CONNECTOR, which is axis-agnostic.
 */
export const connectorFillHClassName = tw(
  CONNECTOR,
  'before:[transform-origin:left_center] rtl:before:[transform-origin:right_center] before:[transform:scaleX(1)]',
);

export const connectorEmptyHClassName = tw(
  CONNECTOR,
  'before:[transform-origin:left_center] rtl:before:[transform-origin:right_center] before:[transform:scaleX(0)]',
);

// ===================== SHARED PARTS =====================

export const iconLabelRowClassName = tw(
  'flex flex-row items-center gap-2 min-w-0',
);

export const iconClassName = tw(
  'flex items-center justify-center shrink-0 size-4',
);

export const iconAccentClassName = tw('text-[color:var(--color-accent)]');
export const iconNotStartedClassName = tw(
  'text-[color:var(--color-icon-secondary)]',
);
export const iconDisabledClassName = tw(
  'text-[color:var(--color-icon-disabled)] opacity-50',
);
export const iconSuccessClassName = tw(
  'text-[color:var(--color-icon-success)]',
);
export const iconWarningClassName = tw(
  'text-[color:var(--color-icon-warning)]',
);
export const iconErrorClassName = tw('text-[color:var(--color-icon-error)]');

/**
 * The number badge occupies the same box as every other indicator, so swapping
 * a number for a check never nudges the label. Forced colors replace status
 * fills with Canvas, and the outline keeps the fill's shape visible
 * (architecture:theme-tokens INV11).
 */
export const numberBadgeClassName = tw(
  'grid place-items-center size-4 shrink-0 text-center rounded-[var(--radius-full)]',
  '[font-size:var(--font-size-xs)] [font-weight:var(--font-weight-semibold)]',
  'forced-colors:[outline:1px_solid_CanvasText] forced-colors:[outline-offset:-1px]',
);

export const numberOnAccentClassName = tw(
  'bg-[var(--color-accent)] text-[color:var(--color-background-surface)]',
);
export const numberNotStartedClassName = tw(
  'bg-[var(--color-background-muted)] text-[color:var(--color-text-secondary)]',
);
export const numberDisabledClassName = tw(
  'bg-[var(--color-background-muted)] text-[color:var(--color-text-disabled)] opacity-50',
);
export const numberAccentClassName = tw(
  'bg-[var(--color-accent)] text-[color:var(--color-on-accent)]',
);
export const numberSuccessClassName = tw(
  'bg-[var(--color-success)] text-[color:var(--color-on-success)]',
);
export const numberWarningClassName = tw(
  'bg-[var(--color-warning)] text-[color:var(--color-on-warning)]',
);
export const numberErrorClassName = tw(
  'bg-[var(--color-error)] text-[color:var(--color-on-error)]',
);

/**
 * Horizontal steps divide the track evenly, so a label can end up with less
 * room than it wants. It stays on one line and ellipsizes rather than wrapping,
 * so every step keeps the same height and the track stays straight. The full
 * string stays in the accessible name.
 */
export const labelClassName = tw(
  '[font-size:var(--text-body-size)] [line-height:var(--text-body-leading)]',
  '[font-weight:var(--font-weight-normal)] text-[color:var(--color-text-primary)]',
  'min-w-0 truncate',
);

export const labelInProgressClassName = tw(
  '[font-weight:var(--font-weight-semibold)]',
);
export const labelNotStartedClassName = tw(
  'text-[color:var(--color-text-secondary)]',
);
export const labelDisabledClassName = tw(
  'text-[color:var(--color-text-disabled)]',
);

export const optionalClassName = tw(
  '[font-size:var(--text-body-size)] text-[color:var(--color-text-secondary)]',
);

export const descriptionRowClassName = tw('ps-0');
export const descriptionRowWithIndicatorClassName = tw('ps-6');

/**
 * Block, not inline: an inline span sits in a line box belonging to its parent,
 * which is floored by the parent's strut, so the gap under the label would be
 * set by the page's line-height rather than by this text. A 16px line box
 * (`--spacing-4`) is tighter than the supporting leading without collapsing the
 * text the way capsize trim did.
 */
export const descriptionClassName = tw(
  'block [font-size:var(--text-supporting-size)] [line-height:var(--spacing-4)]',
  'text-[color:var(--color-text-secondary)]',
);

export const stepContentClassName = tw('pt-2');

/**
 * The content slot sits outside the hover target, so it re-applies that
 * target's inline padding to stay flush with it. The gutter on top lines it up
 * with the label rather than with the indicator.
 */
export const contentIndentClassName = tw(
  '[padding-inline-start:calc(var(--astryx-step-density-inline)_+_24px)]',
  '[padding-inline-end:var(--astryx-step-density-inline)]',
);

export const contentIndentNoIndicatorClassName = tw(
  '[padding-inline:var(--astryx-step-density-inline)]',
);

/**
 * The on-track layout pads its row by the density space, not by the inline
 * density the separated layout uses, so its content slot reads that property.
 */
export const otContentIndentClassName = tw(
  '[padding-inline-start:calc(var(--astryx-step-density)_+_24px)]',
  '[padding-inline-end:var(--astryx-step-density)]',
);
export const otContentIndentNoIndicatorClassName = tw(
  '[padding-inline:var(--astryx-step-density)]',
);

/** The current step, named below a track whose own labels have collapsed. */
export const summaryRootClassName = tw(
  'flex flex-col items-center gap-0.5 min-w-0',
);

export const buttonResetClassName = tw(
  'flex w-full flex-col items-stretch text-start',
  'rounded-[var(--radius-element)] bg-transparent',
  'cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default',
  'transition-[background-color] duration-[var(--duration-fast-min)] ease-[var(--ease-standard)]',
  'motion-reduce:duration-0',
);

/** Density's block half, one inline property so all three sizes read it. */
export const densityBlockClassName = tw(
  '[padding-block:var(--astryx-step-density)]',
);
export const densityInlineClassName = tw(
  '[padding-inline:var(--astryx-step-density-inline)]',
);

// ===================== ON-TRACK LAYOUT =====================

/**
 * A vertical on-track step stacks its indicators in a column; a horizontal one
 * divides the track evenly, so it releases the flex floor as well.
 */
export const otVerticalRootClassName = tw('flex flex-col relative');
export const otHorizontalRootClassName = tw('flex flex-1 flex-col min-w-0');

export const otInteractiveClassName = tw(
  'box-border text-start rounded-[var(--radius-element)] bg-transparent',
  'cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default',
  'transition-[background-color] duration-[var(--duration-fast-min)] ease-[var(--ease-standard)]',
  'motion-reduce:duration-0',
);

export const otRowWrapClassName = tw(
  'flex flex-row items-stretch gap-2 w-full',
);
export const otColWrapClassName = tw('flex flex-col items-stretch w-full');

export const otIndicatorColClassName = tw(
  'flex flex-col items-center w-4 shrink-0 self-stretch',
);

/** Square ends, so stacked segments read as one continuous line. */
const OT_SEG_BASE = tw('shrink-0 rounded-none');

export const otSegBaseVClassName = tw(OT_SEG_BASE, 'w-1');
/** The flexible segment below the node grows to meet the next leading cap. */
export const otSegFlexVClassName = tw(OT_SEG_BASE, 'flex-1 min-h-2');
/** The fixed leading cap offsets the node down to the label's first line. */
export const otSegLeadVClassName = tw(
  OT_SEG_BASE,
  'h-[var(--astryx-step-density)]',
);
export const otSegHClassName = tw(OT_SEG_BASE, 'h-1 flex-1 min-w-2');

/**
 * The gap a connector leaves where it meets the node, clipped rather than
 * padded: one `clip-path` clips the segment and its absolutely placed fill
 * against the same reference box, so no percentage can resolve differently
 * between the two layers and the node cannot move. The value arrives with
 * nothing in between to reject it, so it is clamped — `inset()` accepts a
 * negative length where padding would have been clamped for us, and an
 * oversized gap must leave a short track rather than an unbounded one.
 */
export const otSegGapLeadVClassName = tw(
  '[clip-path:inset(0_0_max(0px,min(var(--step-connector-gap,0px),var(--spacing-2)))_0)]',
);
export const otSegGapRailVClassName = tw(
  '[clip-path:inset(max(0px,min(var(--step-connector-gap,0px),var(--spacing-2)))_0_0_0)]',
);

/** The horizontal pair is physical, because `inset()` has no logical form. */
export const otSegGapLeadHClassName = tw(
  '[clip-path:inset(0_max(0px,min(var(--step-connector-gap,0px),var(--spacing-2)))_0_0)]',
  'rtl:[clip-path:inset(0_0_0_max(0px,min(var(--step-connector-gap,0px),var(--spacing-2))))]',
);
export const otSegGapRailHClassName = tw(
  '[clip-path:inset(0_0_0_max(0px,min(var(--step-connector-gap,0px),var(--spacing-2))))]',
  'rtl:[clip-path:inset(0_max(0px,min(var(--step-connector-gap,0px),var(--spacing-2)))_0_0)]',
);

export const otTrackRowClassName = tw('flex flex-row items-center w-full');

export const otSegHiddenIfFirstClassName = tw(
  '[.astryx-step-item:first-child_&]:invisible',
);
export const otSegHiddenIfLastClassName = tw(
  '[.astryx-step-item:last-child_&]:invisible',
);

export const otBodyClassName = tw(
  'flex flex-1 flex-col justify-start gap-0.5 min-w-0',
);

export const otLabelWrapHClassName = tw(
  'flex flex-col items-stretch gap-0.5 text-center',
);
export const otLabelRowStartClassName = tw('flex flex-row items-center gap-2');
export const otLabelRowCenterClassName = tw(
  'flex flex-row items-center justify-center flex-wrap gap-1',
);

export const otContentClassName = tw('pt-2');
export const otContentWrapClassName = tw('relative');

/**
 * A vertical on-track step draws its connector inside the row holding the
 * indicator and the label, and the content slot sits below that row. This
 * segment spans the slot so the track does not break open where a step carries
 * content. The 6px centers a 4px line in the 16px indicator column.
 */
export const otContentSegClassName = tw(
  'absolute inset-y-0 w-1',
  '[inset-inline-start:calc(var(--astryx-step-density)_+_6px)]',
);

/** Density's block and inline padding around a whole on-track row. */
export const otRowPadClassName = tw('[padding:var(--astryx-step-density)]');
/** The negative margin that lets the rail bridge the wrapper's own padding. */
export const otRailBridgeClassName = tw(
  '[margin-block:calc(-1_*_var(--astryx-step-density))]',
);
export const otPadBlockClassName = tw(
  '[padding-block:var(--astryx-step-density)]',
);
export const otMarginTopClassName = tw(
  '[margin-block-start:var(--astryx-step-density)]',
);
