// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file collapsibleClasses.ts
 * @input The group's density and dividers, the chevron side, and the open and
 *   disabled states
 * @output The root, the trigger row and its label, the chevron in every
 *   orientation, and the content region
 * @position Internal to Collapsible; the Tailwind build scans it for class
 *   names
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from '../utils/tw';

export const collapsibleRootClassName = 'w-full';

/**
 * The trigger row: full width, no browser button styling, and the
 * heading-adjacent type that makes the label read as a section header wherever
 * the item is placed. A theme retargets it on its own, apart from the content.
 */
export const collapsibleTriggerClassName = tw(
  'box-border flex w-full items-center justify-between',
  'cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default',
  'p-0 text-start',
  'font-[family-name:var(--font-family-body)]',
  'text-[length:var(--text-large-size)]',
  'font-[weight:var(--font-weight-semibold)]',
  'text-[color:var(--color-text-primary)]',
);

/**
 * The label fills the row rather than hugging its text, so a composed trigger
 * can put something at the far edge beside the chevron. Growing only: the flex
 * floor stays `auto`, so a label still cannot be squeezed narrower than its
 * content and nothing starts overlapping the chevron.
 */
export const collapsibleTriggerLabelClassName =
  '[text-box-edge:cap_alphabetic] [text-box-trim:trim-both] grow';

/** A disabled trigger is non-interactive and dimmed. */
export const collapsibleTriggerDisabledClassName = 'cursor-default opacity-50';

/**
 * The chevron box is sized off the trigger's own type step, which sits between
 * Icon's `sm` and `md`. Pinning the box to that token keeps the glyph the size
 * of the bare svg it replaced, and keeps it tracking the trigger if a theme
 * retunes the step.
 */
export const collapsibleChevronClassName = tw(
  'inline-flex shrink-0 items-center justify-center',
  'h-[var(--text-large-size)] w-[var(--text-large-size)]',
  'text-[length:var(--text-large-size)]',
  'transition-[transform] duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
);

/** A trailing chevron points down and flips up when the content opens. */
export const collapsibleChevronOpenClassName = '[transform:rotate(180deg)]';
export const collapsibleChevronClosedClassName = '[transform:rotate(0deg)]';

/**
 * A leading chevron points into the row when closed and turns down when open,
 * the disclosure convention TreeList already uses. `space-between` leaves
 * nothing between the arrow and the label, so the gap is the chevron's own.
 */
export const collapsibleChevronStartClassName = 'me-2';

/**
 * The leading chevron's two states are spelled per state, RTL included: a bare
 * rotation would drop the mirror, and the mirror alone would drop the turn.
 */
export const collapsibleChevronStartOpenClassName =
  '[transform:rotate(90deg)] rtl:[transform:scaleX(-1)_rotate(90deg)]';
export const collapsibleChevronStartClosedClassName =
  '[transform:rotate(0deg)] rtl:[transform:scaleX(-1)_rotate(0deg)]';

/** The closed content gives up its space. */
export const collapsibleContentHiddenClassName = 'hidden';

/**
 * The content region anchors the body type, so revealed text renders at the
 * system's body scale instead of inheriting from wherever the item is placed.
 * A theme retargets it on its own, apart from the trigger.
 */
export const collapsibleContentClassName = tw(
  'pt-1',
  'font-[family-name:var(--font-family-body)]',
  'text-[length:var(--text-body-size)]',
  'font-[weight:var(--text-body-weight)]',
  'leading-[var(--text-body-leading)]',
  'text-[color:var(--color-text-primary)]',
);

/**
 * Group divider chrome: a hairline above every item except the first. The
 * group's wrapper, or `all` mode, owns the outer edges.
 */
export const collapsibleDividedClassName =
  'border-t border-t-[color:var(--color-border)] first:border-t-0';

/**
 * Row padding per density. The scale follows Table's: compact, balanced,
 * spacious. The content pads only its end, so text does not sit on the divider
 * below.
 */
export const collapsibleTriggerDensityClassName: Record<
  'compact' | 'balanced' | 'spacious',
  string
> = {
  compact: 'py-1',
  balanced: 'py-2',
  spacious: 'py-3',
};

export const collapsibleContentDensityClassName: Record<
  'compact' | 'balanced' | 'spacious',
  string
> = {
  compact: 'pb-1',
  balanced: 'pb-2',
  spacious: 'pb-3',
};

/**
 * The group's wrapper, present only when it draws dividers: items lay out in a
 * column, and each item draws its own hairline above itself.
 */
export const collapsibleGroupWrapperClassName = 'flex flex-col';
