// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file lightboxClasses.ts
 * @input The viewer's fixed chrome, a page's rail slot, and the caption's
 *   shown or open state
 * @output Class names for the dialog, its stage, the controls and one page's
 *   photo and caption band
 * @position Static styling for Lightbox.tsx; scanned by
 *   `tailwind/astryx.input.css` to build `astryx-tailwind.css`
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from '../utils/tw';

/**
 * The dialog, as the modal layer's root. The dynamic viewport is the height a
 * mobile browser shows; its 100vh is the large viewport, measured with the
 * toolbars retracted, so a viewer that tall runs under Safari's bottom toolbar
 * and hides the caption.
 *
 * The backdrop is the theme's overlay colour over a 2 px blur. A drag to
 * dismiss and its release remove the blur through
 * `--_lightbox-backdrop-filter`: a full-viewport blur repainted every frame of
 * the fade drops frames.
 */
export const lightboxDialogClassName = tw(
  'fixed inset-0 w-[100vw] h-[100dvh] max-w-none max-h-none',
  'm-0 p-0 border-0 border-none bg-transparent overflow-hidden outline-none',
  'backdrop:bg-[var(--color-overlay)]',
  'backdrop:[backdrop-filter:var(--_lightbox-backdrop-filter,blur(2px))]',
);

/** The viewer's centred box: the stage over the click-through chrome. */
export const lightboxContainerClassName = tw(
  'flex flex-col items-center justify-center w-full h-full relative',
);

/**
 * The stage, the pager's viewport and a single photo's. It fills the viewer on
 * every presentation, so its pages have a size of their own. A photo dragged
 * to dismiss draws outside the box that hugs it, so `overflow` opens while
 * `data-zoom-dismissing` sits inside.
 */
export const lightboxMediaGroupClassName = tw(
  'flex flex-col items-center self-stretch grow min-h-0',
  'max-w-full max-h-full overflow-hidden',
  '[&:has([data-zoom-dismissing])]:overflow-visible',
);

/** The box a page's photo sits in, beside the rail's one column. */
export const lightboxImageWrapperClassName = tw(
  'flex items-center justify-center self-stretch grow shrink basis-0',
  'relative overflow-hidden select-none min-h-0',
  '[&:has([data-zoom-dismissing])]:overflow-visible',
);

/**
 * A fitted photo's zoom-in cursor shows only over the photo, where the stage
 * sets `data-lightbox-over-photo`. Beside it, a click closes the viewer.
 */
export const lightboxImageWrapperZoomableClassName = tw(
  'cursor-default',
  '[&:is([data-lightbox-over-photo])]:cursor-zoom-in',
  '[&:is(:disabled,[aria-disabled=true])]:cursor-default',
);

/** `data-zoom-dragging` is set by the stage while a drag moves the photo. */
export const lightboxImageWrapperZoomedClassName = tw(
  'cursor-grab',
  '[&:is([data-zoom-dragging])]:cursor-grabbing',
  '[&:is(:disabled,[aria-disabled=true])]:cursor-default',
);

export const lightboxImageClassName = tw(
  'max-w-full max-h-full object-contain pointer-events-none',
  // The zoom stage scales the photo about its top-left corner and moves it
  // with the individual `scale` and `translate` properties.
  '[transform-origin:0_0]',
);

export const lightboxVideoClassName = tw(
  'max-w-full max-h-full object-contain outline-none',
);

/**
 * Two rows that every page shares through subgrid: the photo's and the caption
 * band's. The band has one height on every page, so every photo centres on the
 * same box, with or without a caption. The next photo slides in level with the
 * current one, and paging never resizes it.
 */
export const lightboxTrackClassName = tw(
  'absolute inset-0 grid grid-cols-[100%] grid-rows-[minmax(0,1fr)_auto]',
);

/**
 * The photo rows take the stage's own pinch, pan and double tap, for every
 * pointer. A descendant cannot allow what an ancestor's `touch-action` rules
 * out, so the track allows only the page's pinch-zoom: a pinch on the controls
 * or a caption still zooms the page. In the touch presentation, a photo
 * without zoom leaves pinch-zoom to the page but takes one-finger drags.
 */
export const lightboxTrackZoomTargetClassName = tw('touch-pinch-zoom');

export const lightboxImageWrapperDismissTargetClassName =
  tw('touch-pinch-zoom');

/**
 * One page per item, the stage's size, at
 * `index * (width + gap)` from the rail's inline start. The pages stack in the
 * track's one column, offset by their relative inset, and each has its own
 * layer: through a busy main thread, Mobile Safari moves the track but cannot
 * paint what it had not painted, so a page that slides in must be painted
 * whole before it moves. The offset is per page, so it arrives in
 * `--astryx-lightbox-page-offset`.
 */
export const lightboxPageClassName = tw(
  'relative col-start-1 row-start-1 row-span-2 grid grid-cols-[100%]',
  'grid-rows-subgrid min-h-0 will-change-transform',
  '[inset-inline-start:var(--astryx-lightbox-page-offset)]',
);

/**
 * A page's photo box: the zoom stage of the current page, in the photo row.
 * Its caption sits in the caption band below it, so the viewer's size never
 * changes with the item.
 *
 * `data-zoom-dismissing` on the box makes a dragged photo draw outside it,
 * above its caption band and below the controls. The drag fades the band,
 * which makes it a stacking context painted after the box.
 */
export const lightboxPageMediaClassName = tw(
  'row-start-1 min-h-0 min-w-0 flex items-center justify-center',
  'overflow-hidden',
  '[&:has([data-zoom-dismissing])]:overflow-visible',
  '[&:is([data-zoom-dismissing])]:z-[1]',
);

/**
 * The photo box is the zoom button. It takes the stage's cursor, not the
 * reset's button cursor, so the zoom-in cursor shows only over the photo.
 */
export const lightboxPageMediaZoomTargetClassName = tw(
  'touch-none [cursor:inherit]',
  '[&:is(:disabled,[aria-disabled=true])]:cursor-default',
);

/**
 * A gallery's caption band, under every page's photo. It is two caption lines
 * tall whatever the caption, so the photo area stays the same. Its lines are
 * the caption's own type, on the caption's backing, and its padding clears the
 * screen's bottom edge and the safe area there.
 *
 * The backing is the controls' backing colour, darker, so the caption keeps
 * 4.5:1 over any photo or backdrop behind it (WCAG 2.2 1.4.3).
 */
export const lightboxCaptionBandClassName = tw(
  'row-start-2 relative flex justify-center items-start min-w-0 box-content',
  // The caption Text's type, so `2lh` is two caption lines.
  // SYNC: the caption Text's `type` in Lightbox.tsx.
  'text-[length:var(--text-body-size)] leading-[var(--text-body-leading)]',
  '[block-size:calc(var(--spacing-2)_+_2lh)]',
  '[padding-block-end:calc(var(--spacing-3)_+_env(safe-area-inset-bottom,0px))]',
  'bg-[color-mix(in_srgb,var(--color-on-light)_90%,transparent)]',
);

/**
 * The band under an open caption, which brings its own backing, and a page
 * with no caption, which keeps the band's space so its photo sits where every
 * other page's does.
 */
export const lightboxCaptionBandTransparentClassName = tw('bg-transparent');

export const lightboxCaptionInBandClassName = tw('flex min-w-0 max-w-full');

/** The caption's Text and its toggle; the toggle is out of the flow. */
export const lightboxCaptionBodyClassName = tw(
  'relative flex items-start min-w-0 max-w-full',
);

/** Lets the clamped Text shrink inside the band. */
export const lightboxCaptionClampedClassName = tw('shrink min-w-0');

/**
 * The caption's lines in one block, so the clamp counts them and the floats in
 * it wrap them. Every state renders it, with or without a toggle.
 */
export const lightboxCaptionFlowClassName = tw('block');

/**
 * The toggle's place at the end of the caption's last line. The text wraps
 * around it, so the clamp's ellipsis comes just before the toggle. The lines
 * are generated, so the caption's text and its ranges hold none of them: each
 * line is a no-break space, and the place shows as many as the caption does.
 * 240 lines cover an open caption that scrolls at a 10 px line in a window
 * 4,000 px tall. They arrive in `--_lightbox-caption-place-lines`.
 *
 * The float is physical: a right-to-left caption flips it, as the toggle
 * follows its own.
 */
export const lightboxCaptionTogglePlaceClassName = tw(
  'float-right rtl:float-left ms-1 overflow-hidden whitespace-pre',
  'select-none invisible',
  // The clamp draws an ellipsis on its last line. The place shows nothing.
  'before:content-[var(--_lightbox-caption-place-lines)]',
);

/**
 * The place shows one line box for each line the caption shows. Layout rounds
 * line boxes to its own grid, and each engine rounds them its own way, so the
 * place ends exactly where the caption's last line ends. Only its last line
 * keeps the text away.
 *
 * `hidden` is a separate class, not the base's own `display`: the shown and
 * hidden arms write the same property.
 */
export const lightboxCaptionTogglePlaceHiddenClassName = tw('hidden');

export const lightboxCaptionTogglePlaceShownClassName = tw(
  '[display:-webkit-box] [-webkit-box-orient:vertical]',
  '[-webkit-line-clamp:var(--astryx-lightbox-caption-toggle-lines)]',
  '[inline-size:var(--astryx-lightbox-caption-toggle-width)]',
  '[shape-outside:inset(calc(100%_-_1lh_+_0.5px)_0_0_0)]',
);

/**
 * The caption's link over its place: the caption's last line, inside the
 * Text's inline padding. It takes the caption's font and line height, so it
 * sits on that line as its text does. `[&[hidden]]` wins over the Link's own
 * `inline-flex` through its attribute, which is the only thing that hides a
 * Link whose class set already declares `display`.
 *
 * SYNC: `lightboxCaptionClassName`'s `px-3`.
 */
export const lightboxCaptionToggleClassName = tw(
  'absolute end-3 bottom-0 [&[hidden]]:hidden',
);

/**
 * A block that does not fit beside the toggle's place sits below the place, so
 * the place leaves the flow. The toggle takes a line of its own under the
 * caption's last line.
 */
export const lightboxCaptionTextToggleOwnLineClassName = tw(
  '[padding-block-end:1lh]',
);

/**
 * An open caption that scrolls keeps its toggle's width clear at every line's
 * end. The toggle stays in view as the lines move.
 */
export const lightboxCaptionTextBesideToggleClassName = tw(
  '[padding-inline-end:calc(var(--spacing-3)_+_var(--astryx-lightbox-caption-toggle-width)_+_var(--spacing-1))]',
);

/**
 * The open caption: the same element, out of the band and over the photo's
 * bottom, on the controls' scrim. Its last line and the toggle stay where they
 * were, and it grows upward.
 */
export const lightboxCaptionOpenClassName = tw(
  'absolute inset-x-0 bottom-0 justify-center max-w-none',
  '[padding-block-end:calc(var(--spacing-3)_+_env(safe-area-inset-bottom,0px))]',
  'bg-[color-mix(in_srgb,var(--color-on-light)_90%,transparent)]',
);

/**
 * The open caption's text, up to 60 % of the viewport tall. A finger scrolls a
 * longer one, and the toggle stays in view beside it. A pinch on it still
 * zooms the page.
 */
export const lightboxCaptionTextOpenClassName = tw(
  '[max-block-size:calc(60dvh_-_var(--spacing-3)_-_env(safe-area-inset-bottom,0px))]',
  'overflow-y-auto',
  '[touch-action:pan-y_pinch-zoom]',
);

/**
 * The caption's box. Its type and colour are the caption Text's, and both of
 * its lines start at one edge.
 */
export const lightboxCaptionClassName = tw(
  '[padding-block-start:var(--spacing-2)] [padding-block-end:0]',
  'px-3 max-w-[600px] shrink-0',
);

export const lightboxCloseButtonClassName = tw('absolute top-3 end-3 z-[1]');

/**
 * The individual `translate` property, not `transform`: this class lands on
 * the Button root, or on its backing with zoom. A `transform` on the Button
 * root would replace its own transform rules, and the measured `scale(0.98)`
 * press feedback stops firing. `translate` composes with them.
 */
export const lightboxNavButtonClassName = tw(
  'absolute top-1/2 [translate:0_-50%] z-[1]',
);

export const lightboxNavPrevClassName = tw('start-3');

export const lightboxNavNextClassName = tw('end-3');

/**
 * The counter takes its own clicks in the click-through layer, so a click on
 * it leaves the viewer open.
 */
export const lightboxCounterClassName = tw(
  'absolute top-3 start-3 z-[1] pointer-events-auto',
);

export const lightboxControlButtonClassName = tw('pointer-events-auto');

/**
 * The controls sit in layers over the viewer that pass clicks through. A drag
 * to dismiss fades the layers, which carry no transition of their own, since a
 * Button's opacity transition would trail the finger. They sit above the
 * stage, even a photo dragged to dismiss: while a fade writes their opacity,
 * each is a stacking context, and the track's positioned pages, later in tree
 * order, would otherwise cover them and take the taps meant for the controls.
 */
export const lightboxChromeLayerClassName = tw(
  'absolute inset-0 z-[2] pointer-events-none',
);

/**
 * With zoom a photo can lie under the controls. Lightbox's own translucent
 * backing keeps them readable over any photo: 3:1 for the buttons, 4.5:1 for
 * the counter's text. A theme restyles the buttons, not the backing.
 */
export const lightboxControlBackingClassName = tw(
  'inline-flex rounded-full',
  'bg-[color-mix(in_srgb,var(--color-on-light)_75%,transparent)]',
);

export const lightboxCounterBackingClassName = tw(
  'rounded-full px-2',
  'bg-[color-mix(in_srgb,var(--color-on-light)_75%,transparent)]',
);
