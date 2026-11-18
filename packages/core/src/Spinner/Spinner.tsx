// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Spinner.tsx
 * @input Uses React, i18n (useComponentTranslator), Tailwind class maps, SVG
 *   rendering
 * @output Exports Spinner component, SpinnerProps, SpinnerSize, SpinnerShade types
 * @position Core implementation of spinner loading indicator
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Spinner/Spinner.doc.mjs
 * - /packages/core/src/Spinner/Spinner.test.tsx and __tests__/SpinnerMotion.a11y.chromium.spec.ts (rotor timing)
 * - /packages/core/src/Spinner/index.ts
 * - /apps/storybook/stories/Spinner.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/Spinner/ (showcase blocks)
 */

import {use, useId, useMemo, useRef, type ReactNode} from 'react';
import {SpinnerOwnerContext} from './SpinnerOwnerContext';
import type {BaseProps} from '../BaseProps';
import {Text} from '../Text/Text';
import {mergeProps} from '../utils/mergeProps';
import {mergeRefs} from '../utils/mergeRefs';
import {useAnnounceRenderedText} from '../hooks/useAnnounceRenderedText';
import {themeProps} from '../utils/themeProps';
import {
  registerEnglishFallback,
  useComponentTranslator,
} from '../i18n/useComponentTranslator';
import english from '../i18n/generated-english/Spinner/Spinner.generated';
import {spinnerRotorTurnClassName, syncRotationPhase} from './spinnerRotor';
import {tw} from '../utils/tw';
import {xstyleProps} from '../utils/xstyle';
import {
  spinnerArcClassName,
  spinnerCircleClassName,
  spinnerClassName,
  spinnerRingClassName,
  spinnerRotorBoxClassName,
  spinnerShadeClassName,
  spinnerSizeClassName,
  spinnerTrackClassName,
  spinnerTrackOpacityClassName,
  spinnerWrapperClassName,
} from './spinnerClasses';

registerEnglishFallback(english);

// =============================================================================
// Constants
// =============================================================================

/**
 * The fraction of the ring the arc covers: SPINNER_ARC_FRACTION. StyleX reads
 * only a literal in this file, and a test pins the two together.
 *
 * Themeable via `--spinner-arc-fraction`, declared alongside the other public
 * vars in `spinnerClasses.ts`. Only the inline `strokeDasharray` attribute
 * (the pre-stylesheet render) still reads the constant directly; the CSS side
 * composes the dash from the live var.
 */
const ARC_FRACTION = 0.375;

const SIZES = {
  sm: {diameter: 10, border: 2},
  md: {diameter: 14, border: 3},
  lg: {diameter: 18, border: 3},
  xl: {diameter: 28, border: 4},
};

/**
 * Where the resolved geometry lands: the public var, resolved into a registered
 * `<length>` the `calc()`s below can do arithmetic on. The box and the ring
 * read these; the public vars are declared once, on the element carrying the
 * theme target, by `spinnerSizeClassName`.
 */
const RESOLVED_DIAMETER = '--_spinner-ring-diameter';
const RESOLVED_STROKE = '--_spinner-ring-stroke';
const RESOLVED_GEOMETRY_VARS = [RESOLVED_DIAMETER, RESOLVED_STROKE];

/**
 * The composed box size: diameter plus a stroke width on each side.
 *
 * It is deliberately NOT registered, unlike the pair above. The element reads
 * it through an inline `width`/`height` with the size's own default as the
 * `var()` fallback, so a render with no stylesheet — where nothing declares
 * it — still sizes the box the way it always did. A registered property always
 * has a value (its `initial-value`), which would swallow that fallback and
 * collapse the box to zero.
 */
const BOX_SIZE = '--_spinner-box-size';

/**
 * Register the resolved geometry vars as `<length>`.
 *
 * Both are consumed inside `calc()` — the box adds two stroke widths to a diameter,
 * the circle halves one. Unregistered, a custom property substitutes as text,
 * so whatever a theme wrote lands in the expression verbatim and a bare `0`
 * (a valid length on its own, a `<number>` inside `calc()`) poisons the sum:
 * `calc(28px + 0 * 2)` is invalid at computed-value time and the box loses its
 * size. Registered, the value is already an absolute length by the time the
 * `calc()` sees it, so `0` means `0px` — a zero-width stroke that paints
 * nothing — rather than a bare `0` that invalidates the sum and leaves the box
 * with no size at all. One `stroke-width` drives both circles, so a themed
 * stroke width of `0` hides the arc along with the track; an arc with no track behind
 * it is `--spinner-track-color: transparent`.
 *
 * Only these private vars are registered. The four public ones deliberately
 * are not: a registered property has an `initial-value`, so every element in
 * the document would report a value for it — and
 * `.github/scripts/theme-var-reachability.js` finds a var's declaring element
 * by exactly that test, so registering them would point the guard at `<html>`
 * and report a var no theme can select.
 */
function registerSpinnerVars(): void {
  if (
    typeof CSS === 'undefined' ||
    typeof CSS.registerProperty !== 'function'
  ) {
    return;
  }
  for (const name of RESOLVED_GEOMETRY_VARS) {
    try {
      CSS.registerProperty({
        name,
        syntax: '<length>',
        inherits: true,
        initialValue: '0px',
      });
    } catch {
      // Already registered — a second copy of the package on the page, or a
      // fast-refresh re-evaluation. registerProperty throws rather than
      // replacing, and the existing registration is this same one.
    }
  }
}

// Registering an inherited property with an `initial-value` invalidates style
// for the whole document, so this runs when the module is evaluated rather
// than when a spinner mounts. A spinner is the loading indicator: it mounts
// onto a page that is already rendered, with someone already waiting, and the
// recalc it triggers there is paid on the full tree. At import the tree is
// whatever has rendered so far, which for a bundle loaded in the head is
// nothing.
//
// It is safe at module scope in both directions. The `typeof CSS` guard above
// keeps it out of the server render, and tree-shaking cannot strip it from a
// build that renders a spinner: core's `sideEffects` allowlist does not name
// this file, so a bundle that never imports `Spinner` drops the module whole —
// registration and all, which is the outcome you want — while one that does
// import it keeps the module, and a bare call is not something a bundler may
// elide.
registerSpinnerVars();

// =============================================================================
// Styles
// =============================================================================

// The class maps live in `spinnerClasses.ts`: the build scans that module,
// and a class assembled here would reach the DOM with no rule behind it.

// =============================================================================
// Types
// =============================================================================

export type SpinnerSize = keyof typeof SIZES;

export type SpinnerShade = 'default' | 'onMedia' | 'subtle' | 'inherit';

export interface SpinnerProps extends BaseProps<HTMLSpanElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLSpanElement>;
  /**
   * Spinner size. The diameter is the ring itself; the rendered box adds the
   * stroke width on each side (xl draws a 28px ring in a 36px box). A theme can
   * redefine what each named size resolves to — see `--spinner-diameter`.
   * - 'sm': 10px diameter
   * - 'md': 14px diameter
   * - 'lg': 18px diameter
   * - 'xl': 28px diameter
   * @default 'md'
   */
  size?: SpinnerSize;
  /**
   * Color shade.
   * - 'default': accent color on light backgrounds
   * - 'onMedia': white on dark/accent backgrounds
   * - 'subtle': secondary text color, less prominent — for inline use in lists
   * - 'inherit': inherits the parent's `currentColor` (with a translucent
   *   track) — use inside colored elements like buttons so the ring matches
   *   the resolved foreground regardless of theme/variant
   * @default 'default'
   */
  shade?: SpinnerShade;
  /**
   * Visible content displayed below the spinner.
   * Accepts a string or ReactNode for rich content.
   *
   * When `label` is a string, the visible text also provides the accessible
   * name of the progressbar (via aria-labelledby, avoiding a duplicate
   * announcement) unless `aria-label` is explicitly set.
   *
   * @example
   * ```
   * <Spinner label="Loading..." />
   * <Spinner label={<><strong>Fetching data</strong><br/>This may take a moment</>} aria-label="Fetching data" />
   * ```
   */
  label?: ReactNode;
  /**
   * Test ID for the root element.
   */
  'data-testid'?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * An animated loading indicator. Available in four sizes and four color shades.
 *
 * @example
 * ```
 * <Spinner />
 * <Spinner size="sm" />
 * <Spinner size="lg" shade="onMedia" />
 * <Spinner label="Loading..." />
 * <Spinner aria-label="Loading data" />
 * ```
 */
export function Spinner({
  size = 'md',
  shade = 'default',
  label,
  xstyle,
  className,
  style,
  'aria-label': ariaLabel,
  'data-testid': testId,
  ref,
  ...restProps
}: SpinnerProps) {
  const {border, diameter} = SIZES[size];
  const frameSize = diameter + border * 2;
  const circumference = Math.PI * diameter;
  const arcLength = circumference * ARC_FRACTION;
  const hasLabel = label != null;
  const labelId = useId();
  const t = useComponentTranslator();
  const spinnerRef = useRef<HTMLSpanElement>(null);
  const rootRef = useMemo(() => mergeRefs(spinnerRef, ref), [ref]);

  // When a visible string label renders (and no explicit aria-label is set),
  // name the progressbar from the visible Text via aria-labelledby instead
  // of duplicating the same string as aria-label — the duplicate would be
  // announced twice by screen readers (WCAG 4.1.2).
  const namedByVisibleLabel =
    hasLabel && typeof label === 'string' && ariaLabel == null;

  // Resolve accessible name: explicit aria-label > string label > the
  // localized default. The fallback is AT-facing text, so it goes through the
  // translation runtime like visible text does.
  const resolvedAriaLabel =
    ariaLabel ??
    (typeof label === 'string' ? label : undefined) ??
    t('@astryx.spinner.loading');

  // Only a standalone Spinner announces. A Core component that composes it
  // owns the task and silences it through the internal SpinnerOwnerContext;
  // app code hides it with `aria-hidden`. A caller `role` other than
  // progressbar also keeps it silent, as it shipped, so app code that
  // silenced a composed ring that way keeps working; new code uses
  // `aria-hidden`.
  const isComposedInOwner = use(SpinnerOwnerContext);
  const isHidden =
    restProps['aria-hidden'] === true || restProps['aria-hidden'] === 'true';
  const callerRole = restProps.role;
  const hasShippedSilentRole =
    callerRole != null && callerRole !== 'progressbar';
  useAnnounceRenderedText(
    spinnerRef,
    !isComposedInOwner && !isHidden && !hasShippedSilentRole,
    '',
    {
      skipFirstRender: true,
      fallbackText: resolvedAriaLabel,
    },
  );

  const spinner = (
    <span
      ref={hasLabel ? undefined : rootRef}
      // An indeterminate progress indicator, so no aria-valuenow.
      role="progressbar"
      aria-label={namedByVisibleLabel ? undefined : resolvedAriaLabel}
      aria-labelledby={namedByVisibleLabel ? labelId : undefined}
      data-testid={hasLabel ? undefined : testId}
      {...(hasLabel ? {} : restProps)}
      {...mergeProps(
        hasLabel ? '' : themeProps('spinner', {size, shade}),
        {
          className: tw(
            spinnerClassName,
            // The defaults are declared on whichever element carries the theme
            // target, and only there: when a label moves the target to the
            // wrapper, this span must inherit the wrapper's value rather than
            // declare its own, which would shadow a theme's override with the
            // default it is trying to replace.
            !hasLabel && spinnerSizeClassName[size],
            !hasLabel && spinnerShadeClassName[shade],
            hasLabel ? null : xstyleProps(xstyle).className,
          ),
        },
        hasLabel ? undefined : className,
        // The box is sized here, after the caller's `style`, exactly as it was
        // before the geometry became themeable: the component's own size wins
        // over a `style={{width}}` a caller passes, and the precedence between
        // the two is unchanged by this PR. What the value is made of has
        // changed — it is the composed var rather than a number — so a themed
        // diameter moves the box with the ring. The fallback is the size's own
        // frame, for the render where no stylesheet has declared the var.
        {
          ...(hasLabel ? {} : style),
          width: `var(${BOX_SIZE}, ${frameSize}px)`,
          height: `var(${BOX_SIZE}, ${frameSize}px)`,
        },
      )}>
      {/* The track is zero-sized by attribute. With no stylesheet, the
          rotor's arc alone fills the box, instead of two discs side by side.
          `ring` sizes both to the box. */}
      <svg
        width={0}
        height={0}
        aria-hidden="true"
        className={spinnerRingClassName}>
        <circle
          cx="50%"
          cy="50%"
          r={diameter / 2}
          strokeWidth={border}
          className={tw(
            spinnerCircleClassName,
            spinnerTrackClassName,
            spinnerTrackOpacityClassName[shade],
          )}
        />
      </svg>
      <span
        ref={syncRotationPhase}
        aria-hidden="true"
        className={tw(spinnerRotorBoxClassName, spinnerRotorTurnClassName)}>
        <svg
          width={frameSize}
          height={frameSize}
          className={spinnerRingClassName}>
          <circle
            cx="50%"
            cy="50%"
            r={diameter / 2}
            strokeWidth={border}
            // The size's own dash, for the render with no stylesheet. The rule
            // above composes the same lengths from the resolved diameter, so a
            // themed ring keeps this fraction of arc rather than this length.
            strokeDasharray={`${arcLength} ${circumference - arcLength}`}
            className={tw(spinnerCircleClassName, spinnerArcClassName)}
          />
        </svg>
      </span>
    </span>
  );

  if (!hasLabel) {
    return spinner;
  }

  return (
    <div
      ref={rootRef}
      data-testid={testId}
      {...restProps}
      {...mergeProps(
        themeProps('spinner', {size, shade}),
        {
          className: tw(
            spinnerWrapperClassName,
            spinnerSizeClassName[size],
            spinnerShadeClassName[shade],
            xstyleProps(xstyle).className,
          ),
        },
        className,
        style,
      )}>
      {spinner}
      {typeof label === 'string' ? (
        <Text id={labelId} type="body" weight="bold">
          {label}
        </Text>
      ) : (
        label
      )}
    </div>
  );
}

Spinner.displayName = 'Spinner';
