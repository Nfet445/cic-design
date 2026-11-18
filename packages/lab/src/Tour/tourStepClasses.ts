// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tourStepClasses.ts
 * @input None
 * @output Exports the class maps of the Tour highlight overlay and callout
 * @position Lab; read by TourStep.tsx and by the Tailwind stylesheet test
 */

/** The callout surface: the same paint as a Popover surface. */
export const tourStepSurfaceClassName =
  'bg-[color:var(--color-background-popover)] rounded-[var(--radius-container)] shadow-[var(--shadow-low)] p-3';

/** Callout body column; capped so long copy does not widen the callout. */
export const tourStepContentClassName = 'flex flex-col gap-3 max-w-[320px]';

/**
 * Full-viewport overlay root. A popover is sized to fit its content by
 * default, so the box is forced to the viewport and the UA styles are
 * neutralized. Click-through by default (coachmark).
 */
const tourStepOverlayClassName =
  'fixed inset-0 w-full h-full m-0 p-0 border-0 border-none bg-transparent overflow-visible';

/** The same box, catching presses for a dimmed step. */
export const tourStepOverlayInteractiveClassName =
  'fixed inset-0 w-full h-full m-0 p-0 border-0 border-none bg-transparent overflow-visible pointer-events-auto';

/** Click-through overlay root for a step without a backdrop. */
export const tourStepOverlayPassiveClassName =
  'fixed inset-0 w-full h-full m-0 p-0 border-0 border-none bg-transparent overflow-visible pointer-events-none';

/**
 * The highlight box, sized to the target and non-interactive so presses reach
 * the target. The accent ring with a surface-colored gap mirrors the
 * focus-visible outline used across the system.
 */
export const tourStepHighlightClassName =
  'absolute pointer-events-none [box-shadow:0_0_0_2px_var(--color-background-surface),0_0_0_4px_var(--color-accent)] transition-[top,left,width,height] duration-[var(--duration-fast)] ease-[var(--ease-standard)]';

/**
 * Spotlight cutout: a huge spread dims the whole viewport EXCEPT this box, so
 * the target reads as lit rather than covered.
 */
export const tourStepCutoutClassName =
  'absolute pointer-events-none [box-shadow:0_0_0_2px_var(--color-background-surface),0_0_0_4px_var(--color-accent),0_0_0_9999px_var(--color-overlay)] transition-[top,left,width,height] duration-[var(--duration-fast)] ease-[var(--ease-standard)]';

/** The box before its target is measured. */
export const tourStepHighlightHiddenClassName = 'opacity-0';

/**
 * Extra clearance between the target and the callout, so the highlight ring
 * (which extends a few px past the target) is never covered by the callout.
 * Placement-aware: the margin goes on the side facing the target.
 */
export const tourStepCalloutGapClassNames = {
  below: 'mt-2',
  above: 'mb-2',
  start: 'me-2',
  end: 'ms-2',
} as const;
