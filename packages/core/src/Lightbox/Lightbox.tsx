// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Lightbox.tsx
 * @input Uses React, native dialog, StyleX, IconButton, theme tokens, layerTextResetClassName, layerStructureResetClassName,
 *   and isRtlElement (gallery arrow keys follow the rendered direction). The
 *   zoom uses useZoomCore and useZoomStage, a gallery pages with usePager,
 *   and the drag to dismiss fades the backdrop and controls on the animator
 * @output Exports Lightbox component, LightboxProps, LightboxMedia
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Lightbox/Lightbox.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Lightbox/Lightbox.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Lightbox/useZoomCore.ts (the zoom stage for every pointer)
 * - /packages/core/src/Lightbox/useZoomStage.ts (the gestures, for every pointer)
 * - /packages/core/src/Lightbox/__tests__/LightboxZoom.interaction.browser.spec.ts (touch zoom proofs)
 * - /packages/core/src/Lightbox/__tests__/LightboxPaging.interaction.browser.spec.ts (gallery paging proofs)
 * - /packages/core/src/Lightbox/index.ts (exports if types change)
 * - /packages/core/src/Layer/useLayerDismissal.ts (dismissal stack)
 * - /apps/storybook/stories/Lightbox.stories.tsx (storybook stories)
 * - /packages/cli/assets/templates/blocks/components/Lightbox/ (showcase blocks)
 */

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useReducer,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ComponentProps,
  type ReactNode,
} from 'react';
import type {CSSProperties} from 'react';
import {flushSync} from 'react-dom';
import * as stylex from '@stylexjs/stylex';
import {Icon} from '../Icon';
import {IconButton} from '../IconButton';
import {announceInModal} from '../hooks/useAnnounce';
import {useScrollLock} from '../hooks/useScrollLock';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {useAttachment} from '../hooks/useAttachment';
import {observeResizeAfterLayout} from '../utils/sharedResizeObserver';
import {useTouchHitArea} from '../utils/touchHitArea';
import {touchHitAreaStyles} from '../internal/touchHitArea.stylex';
import {usePressTracker} from '../gestures/usePressTracker';
import {mergeProps, rtlStyles} from '../utils';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';
import {tw} from '../utils/tw';
import {focusOutlineProps} from '../utils/focusOutline.stylex';
import {layerTextResetClassName} from '../Layer/layerTextResetClasses';
import {layerStructureResetClassName} from '../Layer/layerStructureResetClasses';
import {LayerContentBoundary} from '../Layer/layerScopedContext';
import {layerClickBoundary} from '../Layer/layerClickBoundary';
import {ModalAnnounceProvider} from '../hooks/ModalAnnounceProvider';
import {overlayPaddingReset} from '../Layout/overlayPaddingReset.stylex';
import {LayerDepthProvider} from '../Layer/LayerDepthContext';
import {useLayerDismissal} from '../Layer/useLayerDismissal';
import {useFocusRegionContainment} from '../hooks/useFocusTrap';

import {useMergedRefs} from '../hooks/useMergedRefs';
import {isRtlElement} from '../hooks/isRtlElement';
import {
  lightboxCaptionBandClassName,
  lightboxCaptionBandTransparentClassName,
  lightboxCaptionBodyClassName,
  lightboxCaptionClampedClassName,
  lightboxCaptionFlowClassName,
  lightboxCaptionInBandClassName,
  lightboxCaptionOpenClassName,
  lightboxCaptionTextBesideToggleClassName,
  lightboxCaptionTextOpenClassName,
  lightboxCaptionTextToggleOwnLineClassName,
  lightboxCaptionToggleClassName,
  lightboxCaptionTogglePlaceClassName,
  lightboxCaptionTogglePlaceHiddenClassName,
  lightboxCaptionTogglePlaceShownClassName,
  lightboxCaptionClassName,
  lightboxPageClassName,
  lightboxPageMediaClassName,
  lightboxPageMediaZoomTargetClassName,
  lightboxChromeLayerClassName,
  lightboxCloseButtonClassName,
  lightboxContainerClassName,
  lightboxControlBackingClassName,
  lightboxControlButtonClassName,
  lightboxCounterBackingClassName,
  lightboxCounterClassName,
  lightboxDialogClassName,
  lightboxImageClassName,
  lightboxImageWrapperClassName,
  lightboxImageWrapperDismissTargetClassName,
  lightboxImageWrapperZoomableClassName,
  lightboxImageWrapperZoomedClassName,
  lightboxMediaGroupClassName,
  lightboxNavButtonClassName,
  lightboxNavNextClassName,
  lightboxNavPrevClassName,
  lightboxTrackClassName,
  lightboxTrackZoomTargetClassName,
  lightboxVideoClassName,
} from './lightboxClasses';
import {lightboxOverrideStyles} from './lightboxOverrides.stylex';
import {useZoomCore} from './useZoomCore';
import {usePager} from '../hooks/usePager';
import {TapGestureRecognizer} from '../gestures/TapGestureRecognizer';
import type {GestureTouch} from '../gestures/types';
import {useGestureRecognizer} from '../gestures/useGestureRecognizer';
import {resolveMotion} from '../motion/resolveMotion';
import {springs} from '../motion/uikit/springs';
import {zoomMedia} from '../motion/uikit/zoomMedia';
import {useZoomStage} from './useZoomStage';
import {useTouchPresentation} from '../utils/touchPresentation';
import {
  registerEnglishFallback,
  useComponentTranslator,
} from '../i18n/useComponentTranslator';
import english from '../i18n/generated-english/Lightbox/Lightbox.generated';
import {isRenderable} from '../utils/isRenderable';
import {
  focusForLastInput,
  moveFocusLeftBehind,
  noteFocusWithin,
  prepareFocusReturnOnRemoval,
  returnFocusForLastInput,
  type FocusWithin,
} from '../utils/focusReturn';
import {animatorFor, type Animator} from '../motion/animator';
import {dismissBackdropAlpha, dismissChromeAlpha} from './zoomStage';
import {useInteractionModalityTracking} from '../utils/interactionModality';
import {MediaTheme} from '../theme/MediaTheme';
import {Text} from '../Text/Text';
import {useTruncation} from '../Text/useTruncation';
import {Link} from '../Link/Link';

registerEnglishFallback(english);
/**
 * Media type for lightbox items.
 */
export type LightboxMediaType = 'image' | 'video';

/**
 * Describes a single media item in a lightbox.
 */
export interface LightboxMedia {
  /** Media source URL */
  src: string;
  /** Alt text for accessibility (used as aria-label for video) */
  alt: string;
  /** Optional caption displayed below the media */
  caption?: ReactNode;
  /**
   * Media type. Zoom/pan is disabled for video.
   * @default 'image'
   */
  type?: LightboxMediaType;
}

export interface LightboxProps extends BaseProps<HTMLDialogElement> {
  /** Ref forwarded to the root dialog element */
  ref?: React.Ref<HTMLDialogElement>;
  /**
   * Whether the lightbox is open.
   */
  isOpen: boolean;
  /**
   * Callback when the lightbox open state changes.
   * Called with `false` on Escape, backdrop click, or close button.
   */
  onOpenChange: (isOpen: boolean) => void;
  /**
   * Media to display. Pass a single object for one item, or an array
   * for gallery mode with prev/next navigation.
   */
  media: LightboxMedia | LightboxMedia[];
  /**
   * Current index in gallery mode (when `media` is an array).
   * When provided, puts the component in controlled mode.
   */
  index?: number;
  /**
   * Initial index in gallery mode for uncontrolled usage.
   * @default 0
   */
  defaultIndex?: number;
  /**
   * Callback when the gallery index changes: the previous and next buttons,
   * the arrow keys or a swipe.
   */
  onIndexChange?: (index: number) => void;
  /**
   * Enable zoom (images only). A pinch or a ctrl-wheel zooms about the
   * fingers or the pointer. A double tap fills the viewer and a double-click
   * zooms 2×, about that point, and the next goes back. Enter, Space, `+` and
   * `-` zoom 2× about the centre and back, and `0` returns to the fitted
   * size. When zoomed, drag or scroll a trackpad to pan, or use the arrow
   * keys. On a phone or a tablet, the pan has momentum. The gestures work
   * for every pointer.
   * @default false
   */
  hasZoom?: boolean;
  /**
   * Whether video should autoplay when the lightbox opens.
   * @default false
   */
  hasAutoPlay?: boolean;
}

// =============================================================================
// Styles
// =============================================================================

/** Set on the stage while a mouse or a pen hovers over the fitted photo. */
const OVER_PHOTO_ATTRIBUTE = 'data-lightbox-over-photo';

/**
 * The values a page carries for its own classes: the rail's offset, the
 * toggle's measured size, and the place's generated lines. They ride
 * variables, so one class serves every page and a consumer `xstyle` still
 * overrides what the class reads.
 */
type LightboxInstanceState = CSSProperties &
  Partial<
    Record<
      | '--astryx-lightbox-page-offset'
      | '--astryx-lightbox-caption-toggle-width'
      | '--astryx-lightbox-caption-toggle-lines'
      | '--_lightbox-caption-place-lines',
      string
    >
  >;

const pageOffsetStyle = (index: number): LightboxInstanceState => ({
  '--astryx-lightbox-page-offset': `calc(${index} * (100% + ${zoomMedia.viewer.pageGap}px))`,
});

const captionToggleStyle = (
  width: number,
  lines: number,
): LightboxInstanceState => ({
  '--astryx-lightbox-caption-toggle-width': `${width}px`,
  '--astryx-lightbox-caption-toggle-lines': `${lines}`,
});

/** 240 lines cover an open caption that scrolls at a 10 px line in a 4,000 px
 * tall window. Each line is a no-break space and a line break, so the text and
 * its ranges hold none of them. */
const CAPTION_PLACE_LINES = `"${'\\A0\\A'.repeat(239)}\\A0"`;

const captionPlaceLinesStyle: LightboxInstanceState = {
  '--_lightbox-caption-place-lines': CAPTION_PLACE_LINES,
};

/**
 * Pan distance (px) per arrow-key press while zoomed. Offsets move the
 * viewport in the arrow's direction — pressing ArrowRight reveals content to
 * the right, so the image itself shifts left (negative x), matching how
 * scrolling and pointer-drag panning feel.
 */
const KEYBOARD_PAN_STEP = 50;
const KEYBOARD_PAN_OFFSETS: Record<string, [number, number]> = {
  ArrowLeft: [KEYBOARD_PAN_STEP, 0],
  ArrowRight: [-KEYBOARD_PAN_STEP, 0],
  ArrowUp: [0, KEYBOARD_PAN_STEP],
  ArrowDown: [0, -KEYBOARD_PAN_STEP],
};

/** The height of a video's native controls, px: no browser reports it. */
const VIDEO_CONTROLS_BAND = 48;

// Elements that the browser replaces with their own content.
const REPLACED_ELEMENT =
  /^(?:img|video|canvas|svg|iframe|embed|object|picture)$/;

/**
 * Whether a box in the caption's flow cannot narrow to sit beside a float. A
 * block-level replaced element, such as an image, keeps its own width, so it
 * drops below the toggle's place when it does not fit beside it. Any other
 * block narrows beside the place, and inline boxes wrap around it.
 */
function isUnnarrowableBlock(element: Element, view: Window): boolean {
  if (!REPLACED_ELEMENT.test(element.localName)) {
    return false;
  }
  const style = view.getComputedStyle(element);
  return (
    !/^(?:inline|contents|none)/.test(style.display) &&
    style.position !== 'absolute' &&
    style.position !== 'fixed' &&
    style.float === 'none'
  );
}

/**
 * Whether the toggle's place, shown with the flow's lines, would push a box
 * in the flow down by half a line or more. The flow is read without the
 * place. The place floats at the flow's start and is as long as the flow, so
 * a box that cannot narrow and is wider than the room beside the place drops
 * below the place's last line. A box shorter than half a line adds no line
 * to the place, so it stays where the text ends.
 */
function wouldPlacePushBlock(
  flow: HTMLElement,
  place: HTMLElement,
  view: Window,
  room: number,
  placeBottom: number,
  line: number,
): boolean {
  for (const element of Array.from(flow.querySelectorAll('*'))) {
    if (element === place || !isUnnarrowableBlock(element, view)) {
      continue;
    }
    const box = element.getBoundingClientRect();
    if (box.width > room + 0.5 && placeBottom - box.top > line / 2) {
      return true;
    }
  }
  return false;
}

/**
 * A fullscreen overlay for viewing images and videos at full resolution.
 *
 * Supports single image and gallery modes. In gallery mode, it provides
 * prev/next navigation via buttons and arrow keys. The arrow keys follow the
 * writing direction: in RTL, ArrowLeft goes to the next item, like the Next
 * button on the left.
 *
 * Optionally supports zoom like a photo viewer. A pinch or a ctrl-wheel zooms
 * about the fingers or the pointer, gives past the limits and springs back. A
 * double tap or a double-click zooms in at that point and back. Enter or
 * Space on the image, and `+` or `-` from the keyboard, zoom too, and `0`
 * returns to the fitted size. When zoomed, a drag or a trackpad's scroll
 * pans. On a phone or a tablet, the pan has momentum and a rubber band at the
 * edges. The arrow keys pan a zoomed photo and navigate the gallery
 * otherwise.
 *
 * Uses the native `<dialog>` element with `showModal()` for focus
 * trapping and top-layer placement. Dismiss via Escape, close button,
 * or backdrop click.
 *
 * @example
 * ```
 * <Lightbox
 *   isOpen={isOpen}
 *   onOpenChange={setIsOpen}
 *   media={{src: "/photo.jpg", alt: "A photo"}}
 * />
 * <Lightbox
 *   isOpen={isOpen}
 *   onOpenChange={setIsOpen}
 *   media={photos}
 * />
 * <Lightbox
 *   isOpen={isOpen}
 *   onOpenChange={setIsOpen}
 *   media={photos}
 *   index={currentIndex}
 *   onIndexChange={setCurrentIndex}
 * />
 * ```
 */
export function Lightbox({
  isOpen,
  onOpenChange,
  media,
  index: controlledIndex,
  defaultIndex = 0,
  onIndexChange,
  hasZoom = false,
  hasAutoPlay = false,
  xstyle,
  className,
  style,
  ref,
  onClick: onClickProp,
  onKeyDown: onKeyDownProp,
  ...props
}: LightboxProps) {
  const t = useComponentTranslator();
  const dialogRef = useRef<HTMLDialogElement>(null);
  // The last input in the viewer's own document, a Picture-in-Picture window's
  // too, decides whether focus the viewer moves shows a ring.
  const {ref: modalityRef} = useInteractionModalityTracking();
  const mergedDialogRef = useMergedRefs(ref, dialogRef, modalityRef);
  // Native showModal() lets Tab leave for the browser's own UI, so the shared
  // module wraps it.
  useFocusRegionContainment(dialogRef, isOpen);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const noPagerTrackRef = useRef<HTMLDivElement>(null);
  // A gallery's zoom stage: the current page's photo box.
  const pageMediaRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<Element | null>(null);

  // Index state (controlled + uncontrolled)
  const isControlled = controlledIndex !== undefined;
  const [uncontrolledIndex, setUncontrolledIndex] = useState(defaultIndex);
  const requestedIndex = isControlled ? controlledIndex : uncontrolledIndex;

  const setIndex = useCallback(
    (value: number) => {
      if (!isControlled) {
        setUncontrolledIndex(value);
      }
      onIndexChange?.(value);
    },
    [isControlled, onIndexChange, setUncontrolledIndex],
  );

  // Whether the photo is zoomed: a discrete state for aria-pressed and the
  // cursor. The zoom and pan themselves live outside React (useZoomCore,
  // useZoomStage).
  const [isZoomed, setIsZoomed] = useState(false);

  // Resolve current media item
  const mediaArray = useMemo(
    () => (Array.isArray(media) ? media : [media]),
    [media],
  );
  // Every item is a page of the track, a single photo too, so its photo and
  // caption sit as a gallery page's do. Only paging needs more than one item.
  const isGallery = mediaArray.length > 1;
  // The item shown is current in every respect: its page, the counter, the
  // pager and the announcement.
  const wholeIndex = Number.isNaN(requestedIndex)
    ? 0
    : Math.round(requestedIndex);
  const index = Math.max(0, Math.min(wholeIndex, mediaArray.length - 1));
  const currentItem = mediaArray.length > 0 ? mediaArray[index] : null;
  const currentType = currentItem?.type ?? 'image';
  const isVideo = currentType === 'video';
  const canPrev = isGallery && index > 0;
  const canNext = isGallery && index < mediaArray.length - 1;

  // Scroll lock
  useScrollLock(isOpen);

  // A new media item starts unzoomed. Adjusted during render, so the new item
  // never paints as zoomed; the stage resets the photo before it paints.
  const currentSrc = currentItem?.src;
  const [viewedItem, setViewedItem] = useState({index, src: currentSrc});
  if (
    !Object.is(viewedItem.index, index) ||
    !Object.is(viewedItem.src, currentSrc)
  ) {
    setViewedItem({index, src: currentSrc});
    setIsZoomed(false);
  }

  // Announce gallery navigation to screen readers. Moving between images only
  // updates the visual counter, which is silent to assistive tech, so mirror
  // each change in a polite live region ("<alt>, 3 of 12", or "Image 3 of 12"
  // when the image has no alt). Announce only when the image changes during an
  // already-open session — not on mount, not when opening (even at a new
  // index, since the dialog's aria-label already names the current image), and
  // not on close.
  // While the modal viewer is open, a screen reader reads only messages
  // inside it.
  const announce = useCallback((message: string) => {
    const dialog = dialogRef.current;
    if (dialog != null) {
      announceInModal(dialog, message);
    }
  }, []);
  const prevIndexRef = useRef(index);
  const wasOpenRef = useRef(isOpen);
  useEffect(() => {
    const indexChanged = prevIndexRef.current !== index;
    const wasOpen = wasOpenRef.current;
    prevIndexRef.current = index;
    wasOpenRef.current = isOpen;
    if (!indexChanged || !isOpen || !wasOpen) {
      return;
    }
    const item = mediaArray[index];
    const position = {index: index + 1, total: mediaArray.length};
    announce(
      item?.alt
        ? t('@astryx.lightbox.mediaPosition', {alt: item.alt, ...position})
        : t('@astryx.lightbox.imagePosition', position),
    );
  }, [index, isOpen, announce, mediaArray, t]);

  // A video left on another page stops: the pager keeps the neighbours
  // mounted, and a playing one would go on, with its sound, off screen. With
  // `hasAutoPlay`, the video paged to plays again, as a newly shown one does.
  // The closed dialog keeps them mounted too, so closing stops a playing
  // video. A single video has no page element. Play looks only in the media
  // box: a caption can contain its own video, and that one stays put.
  useEffect(() => {
    const container = containerRef.current;
    if (container == null) {
      return;
    }
    if (!isOpen) {
      for (const video of container.querySelectorAll<HTMLVideoElement>(
        'video',
      )) {
        if (!video.paused) {
          video.pause();
        }
      }
      return;
    }
    for (const video of container.querySelectorAll<HTMLVideoElement>(
      '[data-lightbox-page]:not([data-current]) video',
    )) {
      if (!video.paused) {
        video.pause();
      }
    }
    const onAPage = container.querySelector('[data-lightbox-page]') != null;
    const current = onAPage
      ? container.querySelector<HTMLVideoElement>(
          '[data-lightbox-page][data-current] [data-lightbox-page-media] video',
        )
      : (imageWrapperRef.current?.querySelector<HTMLVideoElement>('video') ??
        null);
    if (hasAutoPlay && current != null && current.paused) {
      // A browser can refuse playback without a user's gesture.
      void current.play()?.catch(() => {});
    }
  }, [index, hasAutoPlay, isOpen]);

  // The backdrop, the controls and the pages a dismissal faded, to restore
  // exactly those. A page faded as a neighbour may be the current one when
  // the viewer opens again.
  const fadedRef = useRef<Animator[]>([]);
  // Set when a dismissal has asked the caller to close; the next render
  // (one more is asked for) reads the caller's answer.
  const dismissalAnsweredRef = useRef(false);
  const [, renderAfterDismissal] = useReducer((n: number) => n + 1, 0);

  // Drag to dismiss, as in Photos. The backdrop fades with the drag's travel,
  // and the controls and the neighbouring photos fade faster. A dismissal
  // fades them out on its spring and closes once the photo has left.
  // The backdrop's blur comes off while the backdrop moves and comes back
  // once it rests, through the dialog's '::backdrop' style. Each move counts:
  // a release's end restores it only if nothing has moved the backdrop since.
  const backdropMovesRef = useRef(0);
  const setBackdropMoving = useCallback((moving: boolean) => {
    const dialog = dialogRef.current;
    if (moving) {
      dialog?.style.setProperty('--_lightbox-backdrop-filter', 'none');
    } else {
      dialog?.style.removeProperty('--_lightbox-backdrop-filter');
    }
  }, []);

  // Open/close dialog. The dialog renders only with an item, so a viewer
  // opened before its first item arrives opens when that item does.
  const hasItem = currentItem != null;
  // Syncs the native dialog with `isOpen` through `showModal()` and `close()`.
  useIsomorphicLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !hasItem) {
      return;
    }

    if (isOpen && !dialog.open) {
      triggerElementRef.current = document.activeElement;
      dialog.showModal();
      // The browser focuses the viewer's first control as it opens. Its ring
      // follows the last input, so a tap or a click shows none.
      const view = dialog.ownerDocument.defaultView ?? window;
      const focused = dialog.ownerDocument.activeElement;
      if (focused instanceof view.HTMLElement && dialog.contains(focused)) {
        focusForLastInput(focused);
      }
    } else if (!isOpen && dialog.open) {
      dialog.close();
      if (triggerElementRef.current instanceof HTMLElement) {
        returnFocusForLastInput(triggerElementRef.current);
      }
    }
  }, [isOpen, hasItem]);

  // A viewer that unmounts while open (rendered only while open, or removed
  // with the rest of a view) never runs the close branch above. Focus the
  // removal lost goes back to the opener while the opener is still on the
  // page.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog == null) {
      return;
    }
    const returnFocusOnRemoval = prepareFocusReturnOnRemoval(dialog);
    return () => {
      if (dialog.open) {
        returnFocusOnRemoval(triggerElementRef.current);
      }
    };
  }, [hasItem]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const {shouldDismissOnCloseRequest} = useLayerDismissal({
    isActive: isOpen,
    onDismiss: handleClose,
    // The dialog's document is this layer's: rendered into an iframe or a
    // Picture-in-Picture window, it ranks with the layers opened inside it.
    getContainer: () => dialogRef.current,
  });

  // The native `cancel` event is the browser's own close-watcher firing: an
  // Android back gesture, or a close request the stack never saw a press for.
  // Escape presses the stack owns never arrive here — it preventDefault()s
  // those, which suppresses the close watcher.
  //
  // Always preventDefault so the browser cannot close a controlled <dialog>
  // behind React's back, then answer with the stack's own rules: top-most
  // only, and never while an IME composition is in progress.
  const handleCancel = useCallback(
    (e: React.SyntheticEvent) => {
      // A cancel that bubbles up from inside (a dismissed file picker) is not
      // a close request; the platform's is fired at the dialog itself.
      if (e.target !== e.currentTarget) {
        return;
      }
      e.preventDefault();
      if (!shouldDismissOnCloseRequest()) {
        return;
      }
      handleClose();
    },
    [handleClose, shouldDismissOnCloseRequest],
  );

  // The last press's pointer type, which the browser's `dblclick` does not
  // carry. A finger's double tap is the stage's own. A mouse's or a pen's is
  // the browser's `dblclick`.
  const pointerTypeRef = useRef('');
  // Where the last press on the media started, which a click does not carry.
  const pressPointRef = useRef<{x: number; y: number} | null>(null);
  // The stage fills the viewer. A finger's tap on it beside the media closes
  // on a tap of its own: the zoom stage's, or the backdrop tap without zoom.
  // A mouse's or a pen's click closes only outside the media
  // (`isClickOutsideMedia`). A zoomed drag sets `didDragRef`, so its click is
  // ignored. The next press clears the flag, and a finger's only on the stage.
  const didDragRef = useRef(false);
  const mediaGroupRef = useRef<HTMLDivElement | null>(null);
  // The current item's caption, which is the viewer's accessible description.
  const captionId = useId();
  const fullCaptionId = useId();
  // The item whose full caption is open over its photo. Paging closes it.
  const [openCaptionIndex, setOpenCaptionIndex] = useState<number | null>(null);
  if (openCaptionIndex != null && openCaptionIndex !== index) {
    setOpenCaptionIndex(null);
  }
  const isCaptionOpen = openCaptionIndex === index;
  // The toggle's width, which its place in the caption's last line takes.
  const [captionToggleWidth, setCaptionToggleWidth] = useState(0);
  // The current page's caption in its band, and whether two lines clamp it.
  // While the caption is open the check keeps its clamped answer, so the
  // toggle stays mounted, with its focus, as the caption closes.
  const bandCaptionRef = useRef<HTMLElement | null>(null);
  const captionTruncation = useTruncation({
    maxLines: 2,
    isExpanded: isCaptionOpen,
  });
  const isCaptionClamped = captionTruncation.isTruncated;
  const bandCaptionMeasureRef = useMergedRefs(
    bandCaptionRef,
    captionTruncation.ref,
  );
  const [captionShownLines, setCaptionShownLines] = useState(0);
  // The current caption's lines, without its toggle's place.
  const bandCaptionFlowRef = useRef<HTMLDivElement | null>(null);
  const bandCaptionPlaceRef = useRef<HTMLSpanElement | null>(null);
  // The caption's width at its last measure, and the cancel of a smaller
  // count that waits for the next frame.
  const captionWidthRef = useRef(0);
  const cancelCaptionShrinkRef = useRef<(() => void) | null>(null);
  // Whether the open caption scrolls inside its panel.
  const [isCaptionScrolling, setIsCaptionScrolling] = useState(false);
  // Whether a block in the open caption sits below the toggle's place, as a
  // wide image does. The place then makes the caption taller, and the taller
  // caption makes the place longer, so the place is not shown and the toggle
  // takes the line below the caption.
  const [isCaptionPlaceOff, setIsCaptionPlaceOff] = useState(false);
  const captionPlaceOffRef = useRef(false);
  // The caption's toggle. Under a coarse pointer it takes taps out toward
  // 44 px. A finger's tap on it is its own, as UIKit gives a control's tap
  // precedence over the single tap of the photo around it.
  const captionToggleRef = useRef<HTMLButtonElement | null>(null);
  const measureCaptionLines = useCallback(() => {
    // The toggle's committed state, so this measure stays one callback for
    // the caption's observer.
    const isCaptionOpen =
      captionToggleRef.current?.getAttribute('aria-expanded') === 'true';
    // A measure in the same frame cancels a waiting smaller count, so it
    // counts the text's lines again.
    const wasShrinking = cancelCaptionShrinkRef.current != null;
    cancelCaptionShrinkRef.current?.();
    cancelCaptionShrinkRef.current = null;
    const caption = bandCaptionRef.current;
    if (caption != null) {
      const view = caption.ownerDocument.defaultView ?? window;
      const style = view.getComputedStyle(caption);
      const line = parseFloat(style.lineHeight);
      const hasLine = Number.isFinite(line) && line > 0;
      const linesOf = (height: number) =>
        Math.round(
          (height -
            parseFloat(style.paddingTop) -
            parseFloat(style.paddingBottom)) /
            line,
        );
      // The client height rounds to whole pixels, so this rounds to whole
      // lines.
      const lineCount = hasLine ? linesOf(caption.clientHeight) : 0;
      const flow = bandCaptionFlowRef.current;
      const place = bandCaptionPlaceRef.current;
      const width = caption.clientWidth;
      const hasNewWidth = width !== captionWidthRef.current;
      // The flow's lines. A block that does not fit beside the place drops
      // below it. The caption's height then counts the place's lines and the
      // block's, and that height lengthens the place again in each delivery.
      // So when the place has pushed a block down, the place leaves the flow.
      const textLines =
        hasLine && flow != null
          ? Math.round(flow.getBoundingClientRect().height / line)
          : 0;
      // The place stays off until the caption closes. A wider caption could
      // fit the block beside the place, but its height may not change, so no
      // delivery would turn the place back on.
      const isPlaceOff = isCaptionOpen && captionPlaceOffRef.current;
      // The open caption's count decides the place once per open. A later
      // width can still push a block below a shown place. Then this is the
      // count without the place, for the next frame.
      let linesWithPlaceOff: number | null = null;
      if (
        isCaptionOpen &&
        !isPlaceOff &&
        hasLine &&
        flow != null &&
        place != null
      ) {
        const placeBottom = place.getBoundingClientRect().bottom;
        const blockBelowPlace =
          place.getBoundingClientRect().height > 0
            ? Array.from(flow.querySelectorAll<HTMLElement>('*')).find(
                element =>
                  element !== place &&
                  !/^(?:inline|contents|none)/.test(
                    view.getComputedStyle(element).display,
                  ) &&
                  Math.abs(element.getBoundingClientRect().top - placeBottom) <=
                    1,
              )
            : undefined;
        if (blockBelowPlace != null) {
          // The lines without the place, from reads alone: the text before
          // the block, and everything from the block's top down. The block
          // starts at the place's bottom edge, so the flow's height below
          // it is the same with or without the place.
          const text = flow.ownerDocument.createRange();
          text.setStartAfter(place);
          text.setEndBefore(blockBelowPlace);
          const textBox = text.getBoundingClientRect();
          const textHeight =
            textBox.height > 0 ? textBox.bottom - textBox.top : 0;
          const textBottom =
            textBox.height > 0
              ? textBox.bottom
              : flow.getBoundingClientRect().top;
          // The text can end on the place's last line. Then an empty block, a
          // thin rule or a 1x1 image starts at the place's bottom too, and it
          // stays beside the place. The loop happens only when the place
          // pushes the block a line below the text. The range's box ends at
          // the glyphs, above the line box, so the check allows half a line.
          if (
            blockBelowPlace.getBoundingClientRect().top - textBottom >
            line / 2
          ) {
            const belowHeight =
              flow.getBoundingClientRect().bottom -
              blockBelowPlace.getBoundingClientRect().top;
            linesWithPlaceOff =
              Math.round(textHeight / line) + Math.round(belowHeight / line);
          }
        }
      }
      captionPlaceOffRef.current = isPlaceOff;
      setIsCaptionPlaceOff(isPlaceOff);
      if (linesWithPlaceOff != null) {
        // Turning the place off changes the caption's height. Inside this
        // delivery that is a resize loop, so it waits for the next frame, and
        // the place keeps its length until then.
        const lines = linesWithPlaceOff;
        const frame = view.requestAnimationFrame(() => {
          cancelCaptionShrinkRef.current = null;
          if (bandCaptionRef.current !== caption) {
            return;
          }
          captionPlaceOffRef.current = true;
          setIsCaptionPlaceOff(true);
          setCaptionShownLines(lines);
        });
        cancelCaptionShrinkRef.current = () => {
          view.cancelAnimationFrame(frame);
        };
        captionWidthRef.current = width;
        setIsCaptionScrolling(caption.scrollHeight > caption.clientHeight + 1);
        return;
      }
      setCaptionShownLines(lineCount);
      // The open caption is a scroll container, so its height includes the
      // toggle's place, and that height never falls by itself. A new width
      // can need fewer lines. The flow's height counts only the text's lines.
      if (
        isCaptionOpen &&
        hasLine &&
        flow != null &&
        (hasNewWidth || wasShrinking)
      ) {
        if (textLines < lineCount) {
          // Fewer lines shrink the caption. Inside this delivery that is a
          // resize loop, so they wait for the next frame. A toggle that no
          // longer fits beside the last line then takes a line of its own.
          const frame = view.requestAnimationFrame(() => {
            cancelCaptionShrinkRef.current = null;
            if (bandCaptionRef.current !== caption) {
              return;
            }
            // eslint-disable-next-line @eslint-react/dom-no-flush-sync -- the smaller count must lay out before the caption is read again in this frame
            flushSync(() => {
              setCaptionShownLines(textLines);
            });
            setCaptionShownLines(
              Math.max(textLines, linesOf(caption.clientHeight)),
            );
          });
          cancelCaptionShrinkRef.current = () => {
            view.cancelAnimationFrame(frame);
          };
        }
      }
      captionWidthRef.current = width;
    }
    setIsCaptionScrolling(
      isCaptionOpen &&
        caption != null &&
        caption.scrollHeight > caption.clientHeight + 1,
    );
  }, []);
  // The caption's reads and its toggle's width wait for one microtask after
  // the observer's callback. There the caption is read before any write, and
  // one commit lands before the frame paints. A read after a write in that
  // delivery would force a layout before the browser's own.
  const captionDeliveryRef = useRef<{
    isCaptionDirty: boolean;
    toggleWidth: number | null;
  } | null>(null);
  const noteCaptionDelivery = useCallback(
    (isCaptionDirty: boolean, toggleWidth: number | null) => {
      let due = captionDeliveryRef.current;
      if (due == null) {
        due = {isCaptionDirty: false, toggleWidth: null};
        captionDeliveryRef.current = due;
        queueMicrotask(() => {
          const pending = captionDeliveryRef.current;
          captionDeliveryRef.current = null;
          if (pending == null) {
            return;
          }
          // eslint-disable-next-line @eslint-react/dom-no-flush-sync -- a delivery comes after layout and before paint; the caption's "more" and the toggle's place commit in that frame
          flushSync(() => {
            if (pending.isCaptionDirty) {
              measureCaptionLines();
            }
            if (pending.toggleWidth != null) {
              setCaptionToggleWidth(pending.toggleWidth);
            }
          });
        });
      }
      due.isCaptionDirty ||= isCaptionDirty;
      due.toggleWidth = toggleWidth ?? due.toggleWidth;
    },
    [measureCaptionLines],
  );
  // Syncs the toggle's place and the open caption's lines and scroll with
  // the caption's laid-out size. A resize, a font load and the caption's own
  // open resize it. Paging attaches the next page's caption, and a new
  // caption or the dialog's opening attaches it again. Each registration
  // gets one delivery after the browser lays the caption out, and the commit
  // reads nothing. A delivery changes attributes and styles only and adds no
  // element, so no observer that reacts to new elements runs mid-delivery.
  // The toggle's observers sit deeper, so they deliver in the same frame.
  useAttachment(
    bandCaptionRef,
    element => {
      // A new caption has no measure yet, so an open caption's first
      // delivery counts its text's lines, as a new width does.
      captionWidthRef.current = 0;
      const box = element.closest('[data-lightbox-caption]') ?? element;
      const stop = observeResizeAfterLayout(box, () => {
        noteCaptionDelivery(true, null);
      });
      if (stop == null) {
        measureCaptionLines();
        return () => {};
      }
      return stop;
    },
    isOpen ? currentItem?.caption : null,
  );
  // Close, where focus goes off a paged-away toggle when the stage takes none.
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  // The current caption's toggle shows while two lines clamp it, or open.
  const hasCaptionToggle = isCaptionClamped || isCaptionOpen;
  const captionToggleHitAreaRef = useTouchHitArea(hasCaptionToggle);
  const captionToggleRefs = useMergedRefs(
    captionToggleRef,
    captionToggleHitAreaRef,
  );
  usePressTracker(captionToggleRef);
  // Counts an open caption's lines while the toggle's place is not shown, so
  // the count is the text's own lines. The place also takes the toggle's width
  // for its current label. A toggle that does not fit beside the last line
  // then takes a line of its own, before the resize delivery reads the
  // caption.
  const countOpenCaption = useCallback(() => {
    const caption = bandCaptionRef.current;
    const flow = bandCaptionFlowRef.current;
    if (caption == null || flow == null) {
      return;
    }
    const view = caption.ownerDocument.defaultView ?? window;
    const line = parseFloat(view.getComputedStyle(caption).lineHeight);
    if (!Number.isFinite(line) || line <= 0) {
      return;
    }
    // The layout width, as the observer's own fallback reads it: a scaled
    // ancestor does not change it.
    const toggleWidth = captionToggleRef.current?.offsetWidth ?? 0;
    if (toggleWidth > 0) {
      setCaptionToggleWidth(toggleWidth);
    }
    const flowBox = flow.getBoundingClientRect();
    const lines = Math.round(flowBox.height / line);
    // The place's state is decided here, once per open, from this layout
    // without the place. A place that would push a block down stays off, so
    // the first resize delivery finds the caption at its final size.
    const place = bandCaptionPlaceRef.current;
    const isPlaceOff =
      place != null &&
      toggleWidth > 0 &&
      wouldPlacePushBlock(
        flow,
        place,
        view,
        flowBox.width -
          toggleWidth -
          parseFloat(view.getComputedStyle(place).marginInlineStart),
        flowBox.top + lines * line,
        line,
      );
    captionPlaceOffRef.current = isPlaceOff;
    setIsCaptionPlaceOff(isPlaceOff);
    setCaptionShownLines(lines);
  }, []);
  // Syncs the toggle's place in the caption's last line with its width. The
  // width is the delivery's own size, measured in the layout the delivery
  // follows, so nothing reads the toggle there. A hidden toggle's size is
  // zero, so the last width stays until a shown toggle's delivery brings
  // another.
  useAttachment(
    captionToggleRef,
    toggle => {
      const stop = observeResizeAfterLayout(toggle, entry => {
        // No entry: another subscriber already observes the toggle, so it
        // is measured here.
        const width =
          entry == null
            ? toggle.offsetWidth
            : (entry.borderBoxSize?.[0]?.inlineSize ?? 0);
        if (width > 0) {
          noteCaptionDelivery(false, Math.round(width));
        }
      });
      if (stop == null) {
        setCaptionToggleWidth(toggle.offsetWidth);
        return () => {};
      }
      return stop;
    },
    null,
  );
  // Whether a mouse's or a pen's click on the media closes the viewer. It
  // does when its press or its release lands outside the current page's
  // media. That is the fitted photo's laid-out box, the caption's band and
  // the caption's own box. While zoomed, the photo's shown box is media too.
  const isClickOutsideMedia = useCallback((e: ReactMouseEvent<HTMLElement>) => {
    const viewer = imageWrapperRef.current;
    const page = viewer?.querySelector('[data-current]');
    const media = page?.querySelector('img') ?? page?.querySelector('video');
    // The page's photo box, which centres the photo.
    const box = media?.parentElement;
    const group = mediaGroupRef.current;
    if (
      e.detail === 0 ||
      pointerTypeRef.current === 'touch' ||
      viewer == null ||
      page == null ||
      media == null ||
      box == null ||
      group == null ||
      !(e.target instanceof Node) ||
      !group.contains(e.target)
    ) {
      return false;
    }
    const space = (box.clientHeight - media.offsetHeight) / 2;
    const boxRect = box.getBoundingClientRect();
    const top = boxRect.top + space;
    const bottom = top + media.offsetHeight;
    const caption = page.querySelector<HTMLElement>('[data-lightbox-caption]');
    const width = media.offsetWidth;
    const middle = boxRect.left + box.clientWidth / 2;
    const shown = media.getBoundingClientRect();
    // The caption band can sit apart from the photo. There the media is the
    // photo's rows, the band and the caption's own box, which an open caption
    // lifts over the photo. So the space between the photo and the band is
    // outside it.
    const captionBox = caption?.getBoundingClientRect();
    const bandBox = caption?.parentElement?.getBoundingClientRect();
    const isOutside = ({x, y}: {x: number; y: number}) => {
      const isOnShownPhoto =
        x >= shown.left &&
        x <= shown.right &&
        y >= shown.top &&
        y <= shown.bottom;
      if (isOnShownPhoto) {
        return false;
      }
      if (captionBox == null) {
        return y < top || y > bottom || Math.abs(x - middle) > width / 2;
      }
      const isOnPhotoRows =
        y >= top &&
        y <= top + media.offsetHeight &&
        Math.abs(x - middle) <= width / 2;
      const isOnCaption =
        y >= captionBox.top &&
        y <= captionBox.bottom &&
        x >= captionBox.left &&
        x <= captionBox.right;
      const isOnBand =
        bandBox != null &&
        y >= bandBox.top &&
        y <= bandBox.bottom &&
        x >= bandBox.left &&
        x <= bandBox.right;
      return !isOnPhotoRows && !isOnCaption && !isOnBand;
    };
    const press = pressPointRef.current;
    return (
      isOutside({x: e.clientX, y: e.clientY}) ||
      (press != null && isOutside(press))
    );
  }, []);
  const handleBackdropClick = useCallback(
    (e: ReactMouseEvent<HTMLDialogElement>) => {
      if (didDragRef.current) {
        didDragRef.current = false;
        return;
      }
      const isMediaClose =
        pointerTypeRef.current !== 'touch' && isClickOutsideMedia(e);
      if (
        e.target === e.currentTarget ||
        e.target === containerRef.current ||
        isMediaClose
      ) {
        handleClose();
      }
    },
    [handleClose, isClickOutsideMedia],
  );

  const isZoomTarget = hasZoom && !isVideo;

  // The current page's caption band. The drag to close fades it with the
  // viewer's controls.
  const currentCaptionBandRef = useRef<HTMLDivElement | null>(null);
  const dismissFades = useCallback((): {
    backdrop: Animator | null;
    chrome: Animator[];
  } => {
    const dialog = dialogRef.current;
    const container = containerRef.current;
    if (dialog == null || container == null) {
      return {backdrop: null, chrome: []};
    }
    // A caption in a band fades as the band, which carries its backing.
    const band = currentCaptionBandRef.current;
    const chrome: HTMLElement[] = band == null ? [] : [band];
    for (const element of container.querySelectorAll<HTMLElement>(
      '[data-lightbox-chrome], [data-lightbox-page]:not([data-current]), [data-lightbox-caption]',
    )) {
      if (
        element.parentElement?.closest(
          '[data-lightbox-page]:not([data-current])',
        ) == null &&
        band?.contains(element) !== true
      ) {
        chrome.push(element);
      }
    }
    return {
      backdrop: animatorFor(dialog, {pseudoElement: '::backdrop'}),
      chrome: chrome.map(element => animatorFor(element)),
    };
  }, []);
  const onDragStart = () => {
    didDragRef.current = true;
  };
  // The zoom stage takes the keyboard's zoom and pan and every pointer's
  // gestures. Past a limit, a pinch or a pan gives way and returns.
  const zoom = useZoomCore({
    stageRef: pageMediaRef,
    surfaceRef: trackRef,
    isEnabled: isOpen && isZoomTarget,
    itemKey: viewedItem,
    // Zoom changes are silent to assistive tech, since only the transform
    // changes. Announce them in the polite live region.
    onZoomedChange: next => {
      setIsZoomed(next);
      announce(
        next ? t('@astryx.lightbox.zoomedIn') : t('@astryx.lightbox.zoomedOut'),
      );
    },
  });
  const {isTouch} = useTouchPresentation();
  const startsOnCaption = (touch: GestureTouch | undefined) => {
    const target = touch?.target;
    return (
      target instanceof Element &&
      target.closest('[data-lightbox-caption]') != null
    );
  };
  const stage = useZoomStage(zoom, {
    stageRef: pageMediaRef,
    surfaceRef: trackRef,
    isEnabled: isOpen && isZoomTarget,
    itemKey: viewedItem,
    // The stage shares its surface with the page around it. A tap there
    // closes, as on the backdrop, unless it lands on the caption.
    onTapOutside: ({x, y}) => {
      const caption = trackRef.current
        ?.querySelector('[data-current] [data-lightbox-caption]')
        ?.getBoundingClientRect();
      if (
        caption != null &&
        x >= caption.left &&
        x <= caption.right &&
        y >= caption.top &&
        y <= caption.bottom
      ) {
        return;
      }
      handleClose();
    },
    onDragStart,
    isTouchPresentation: isTouch,
    // Only a gallery's touch pager takes a drag past a zoomed photo's edge.
    hasOuterPager: isGallery && isTouch,
    // A pinch whose first finger lands on a caption is the page's.
    shouldBeginPinch: recognizer =>
      !startsOnCaption(recognizer.trackedTouches[0]),
    dismiss: {
      // Part of the touch presentation, which applies under a coarse primary
      // pointer. Where it is fine, a drag leaves the photo in place. A video
      // keeps its own controls' drags.
      isEnabled: isOpen && !isVideo && isTouch,
      onDrag: travel => {
        const {backdrop, chrome} = dismissFades();
        fadedRef.current = backdrop == null ? chrome : [backdrop, ...chrome];
        backdropMovesRef.current += 1;
        setBackdropMoving(true);
        backdrop?.set({opacity: dismissBackdropAlpha(travel)});
        const opacity = dismissChromeAlpha(travel);
        for (const animator of chrome) {
          animator.set({opacity});
        }
      },
      onRelease: (dismisses, touch) => {
        const {backdrop, chrome} = dismissFades();
        fadedRef.current = backdrop == null ? chrome : [backdrop, ...chrome];
        // They keep pace with the photo: the dismissal's measured spring, or
        // on a cancel the shared settle spring, read where the stage is.
        const spring = dismisses
          ? zoomMedia.dismiss.dismissSizeSpring
          : resolveMotion(pageMediaRef.current, springs.settle);
        const opacity = dismisses ? 0 : 1;
        const move = (backdropMovesRef.current += 1);
        setBackdropMoving(true);
        const backdropMotion = backdrop?.animate(
          {opacity},
          {spring},
          {touchRelease: touch},
        );
        for (const animator of chrome) {
          animator.animate({opacity}, {spring}, {touchRelease: touch});
        }
        // Back at rest: the blur returns, unless the backdrop moved again.
        void backdropMotion?.finished.then(() => {
          if (!dismisses && backdropMovesRef.current === move) {
            setBackdropMoving(false);
          }
        });
      },
      onDismissed: () => {
        handleClose();
        // A caller may keep the viewer open, since the close is its call. The
        // render after its answer brings the photo, the backdrop and the
        // controls back, so no open dialog stays invisible.
        dismissalAnsweredRef.current = true;
        renderAfterDismissal();
      },
    },
  });

  // Restore the photo, the backdrop and the controls only when the viewer
  // opens or a dismissal is answered. Each write promotes a layer, and
  // releasing it later repaints during a gesture.
  const restoreAfterDismissal = useCallback(() => {
    stage.reset();
    backdropMovesRef.current += 1;
    setBackdropMoving(false);
    const faded = fadedRef.current;
    fadedRef.current = [];
    for (const animator of faded) {
      animator.set({opacity: 1});
    }
  }, [stage, setBackdropMoving]);
  // Effect: syncs the photo's and the controls' animations with an opening
  // viewer, so it opens at rest with the backdrop's blur back.
  useIsomorphicLayoutEffect(() => {
    if (isOpen) {
      restoreAfterDismissal();
    }
  }, [isOpen, restoreAfterDismissal]);
  useIsomorphicLayoutEffect(() => {
    if (!dismissalAnsweredRef.current) {
      return;
    }
    dismissalAnsweredRef.current = false;
    if (isOpen) {
      restoreAfterDismissal();
    }
  });
  // Whether a mouse or a pen hovers over the fitted photo, for its cursor. The
  // stage fills the viewer, so the photo's box is read, not the event target.
  // The attribute is written on the stage, so hovering renders nothing.
  const markPointerOverPhoto = (e: ReactPointerEvent<HTMLElement>) => {
    if (e.pointerType === 'touch' || e.buttons !== 0) {
      return;
    }
    const photo =
      e.currentTarget.querySelector('[data-current] img') ??
      e.currentTarget.querySelector('img');
    const r = photo?.getBoundingClientRect();
    e.currentTarget.toggleAttribute(
      OVER_PHOTO_ATTRIBUTE,
      r != null &&
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom,
    );
  };
  // A gallery pages like Photos, on a UIKit paging scroll view's release. A
  // drag or a flick moves one page at most, with Photos' 40 pt gap. A zoomed
  // photo keeps the drag until its edge, then the pager takes the next one.
  // As in Photos, the photo left behind returns to the fitted size once the
  // pager rests.
  // A controlled parent can refuse a swipe by keeping its index. The pager
  // then goes back to the photo the parent shows.
  // A video's native controls are taken as a band at its bottom edge, since
  // browsers expose no control geometry. A drag that starts there stays the
  // video's, as a scrubber's or a volume slider's drag.
  const startsOnVideoControls = (touch: GestureTouch | undefined) => {
    const video = trackRef.current?.querySelector(
      '[data-current] video[controls]',
    );
    if (touch == null || video == null) {
      return false;
    }
    const box = video.getBoundingClientRect();
    return (
      touch.startX >= box.left &&
      touch.startX <= box.right &&
      touch.startY <= box.bottom &&
      touch.startY >= box.bottom - VIDEO_CONTROLS_BAND
    );
  };

  // Paging turns the page that holds focus inert, which drops focus inside
  // it, such as on its caption toggle or its photo. Such focus moves to the
  // new page's photo, or to Close without zoom, so the arrow keys keep paging.
  const pagingFocusRef = useRef<FocusWithin | null>(null);
  const noteFocusBeforePaging = useCallback(() => {
    pagingFocusRef.current = noteFocusWithin(
      imageWrapperRef.current?.querySelector<HTMLElement>('[data-current]'),
    );
  }, []);
  // Effect: syncs DOM focus with the new page, since the browser drops focus
  // from the page that turned inert.
  useIsomorphicLayoutEffect(() => {
    const note = pagingFocusRef.current;
    pagingFocusRef.current = null;
    moveFocusLeftBehind(
      note,
      isZoomTarget ? pageMediaRef.current : closeButtonRef.current,
      note?.container,
    );
  }, [index, isZoomTarget]);

  usePager({
    viewportRef: imageWrapperRef,
    // A single photo has no pager, since it has nothing to page to. Its track
    // still holds its one page and takes the zoom's gestures.
    trackRef: isGallery ? trackRef : noPagerTrackRef,
    count: mediaArray.length,
    gap: zoomMedia.viewer.pageGap,
    index,
    // The drag paging is part of the touch presentation. Under a fine pointer
    // the buttons and the arrow keys page, and the page keeps its scroll.
    isPanEnabled: isOpen && isGallery && isTouch,
    // Under the touch presentation a change of `index` slides the pager, and
    // a refused drag springs back. Under a fine pointer it moves the pager at
    // once, so a refused button shows nothing.
    isControlledChangeAnimated: isTouch,
    // In the touch presentation every pointer pages. A drag that starts on a
    // video's controls stays the video's.
    panOptions: {
      allowedPointerTypes: ['touch', 'pen', 'mouse'],
      maximumNumberOfTouches: 1,
      shouldBegin: pan => !startsOnVideoControls(pan.trackedTouches[0]),
    },
    shouldBeginPan: direction => !stage.isZoomed() || stage.isAtEdge(direction),
    onIndexChange: (next, reason) => {
      if (reason === 'drag') {
        noteFocusBeforePaging();
        setIndex(next);
      }
    },
    // The pager names the page it rests on. Its report can come before the
    // render that marks that page current, so the page, not the mark, decides.
    onSettle: settled => {
      for (const page of trackRef.current?.querySelectorAll<HTMLElement>(
        ':scope > [data-lightbox-page]',
      ) ?? []) {
        const img = page.querySelector<HTMLElement>('img');
        if (img != null && page.dataset.lightboxPage !== String(settled)) {
          img.style.translate = '';
          img.style.scale = '';
        }
      }
    },
  });

  // Whether a point is on the current page's media. That is inside its
  // caption's own box, or in its photo's or video's rows across the width of
  // both. So a click beside a narrow photo, within its caption's width, stays
  // on the media. The band between the photo and the caption row does not.
  // The photo takes no pointer events, so a press on it lands on its box. An
  // element with no size yet (a photo still loading) counts for nothing.
  const isOnCurrentMedia = (x: number, y: number) => {
    const page = imageWrapperRef.current?.querySelector('[data-current]');
    const sized = (element: Element | null | undefined) => {
      const r = element?.getBoundingClientRect();
      return r != null && r.width > 0 && r.height > 0 ? r : null;
    };
    const media =
      sized(page?.querySelector('img')) ?? sized(page?.querySelector('video'));
    const caption = sized(page?.querySelector('[data-lightbox-caption]'));
    const boxes = [media, caption].filter((r): r is DOMRect => r != null);
    const inRows = (r: DOMRect | null) =>
      r != null && y >= r.top && y <= r.bottom;
    return (
      (inRows(caption) &&
        caption != null &&
        x >= caption.left &&
        x <= caption.right) ||
      (inRows(media) &&
        x >= Math.min(...boxes.map(r => r.left)) &&
        x <= Math.max(...boxes.map(r => r.right)))
    );
  };
  // Without zoom, the stage fills the viewer. So a finger's tap on it
  // beside the media closes the viewer, as a click on the backdrop does. A
  // press that moves past the tap's movement limit is no tap. A mouse's or a
  // pen's click closes it only outside the media (`isClickOutsideMedia`).
  // With zoom, the stage's own tap closes it.
  useGestureRecognizer(
    imageWrapperRef,
    () =>
      new TapGestureRecognizer({
        name: 'lightbox-backdrop-tap',
        allowedPointerTypes: ['touch'],
      }),
    tap => {
      if (tap.state !== 'ended') {
        return;
      }
      const {x, y} = tap.location();
      if (!isOnCurrentMedia(x, y)) {
        handleClose();
      }
    },
    {isEnabled: isOpen && !isZoomTarget, manageStyle: false},
  );

  // Gallery navigation. The buttons and the arrow keys ask for the new item.
  // Under the touch presentation the pager then slides there, as a paging
  // scroll view's `setContentOffset` does. Under a fine pointer it moves at
  // once.

  const goToPrev = useCallback(() => {
    if (canPrev) {
      noteFocusBeforePaging();
      setIndex(index - 1);
    }
  }, [canPrev, index, noteFocusBeforePaging, setIndex]);

  const goToNext = useCallback(() => {
    if (canNext) {
      noteFocusBeforePaging();
      setIndex(index + 1);
    }
  }, [canNext, index, noteFocusBeforePaging, setIndex]);

  // Keyboard navigation. While zoomed, arrows pan the image (matching common
  // lightbox conventions); when not zoomed they navigate the gallery.
  //
  // Gallery arrows follow the rendered direction, resolved at keydown: in RTL
  // the Next button sits on the left, so ArrowLeft goes to the next item and
  // ArrowRight to the previous one. Panning stays physical in both directions:
  // the image itself is not mirrored, so ArrowRight still reveals what is to
  // its right.
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isZoomTarget) {
        if (e.key === '+' || e.key === '=') {
          e.preventDefault();
          stage.zoomIn();
          return;
        }
        if (e.key === '-') {
          e.preventDefault();
          stage.zoomOut();
          return;
        }
        // Ctrl or Cmd with 0 resets the browser's page zoom; leave it.
        if (e.key === '0' && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          stage.zoomOut();
          return;
        }
        if (stage.isZoomed() && KEYBOARD_PAN_OFFSETS[e.key] !== undefined) {
          e.preventDefault();
          const [dx, dy] = KEYBOARD_PAN_OFFSETS[e.key];
          stage.panBy(dx, dy);
          return;
        }
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const towardEnd =
          (e.key === 'ArrowRight') !== isRtlElement(dialogRef.current);
        if (towardEnd) {
          goToNext();
        } else {
          goToPrev();
        }
      }
    },
    [isZoomTarget, stage, goToPrev, goToNext],
  );

  // Enter/Space on the focused zoom button toggles zoom. Keys from a child
  // stay the child's.
  const handleImageKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) {
        return;
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        stage.toggle();
      }
    },
    [stage],
  );

  if (!currentItem) {
    return null;
  }

  // A control of the viewer. With zoom it sits on Lightbox's own backing,
  // which takes the control's place. Its icon keeps the on-dark colour. So a
  // theme's restyling of the button can't remove its contrast.
  const control = (
    place: string,
    {
      icon,
      label,
      isDisabled,
      onClick,
      isMirrored = false,
      buttonRef,
    }: {
      icon: ComponentProps<typeof Icon>['icon'];
      label: string;
      isDisabled?: boolean;
      onClick: () => void;
      isMirrored?: boolean;
      buttonRef?: React.Ref<HTMLButtonElement>;
    },
  ) => {
    const button = (
      <IconButton
        icon={
          <Icon
            icon={icon}
            size="sm"
            color="inherit"
            xstyle={[
              isMirrored && rtlStyles.mirror,
              hasZoom && lightboxOverrideStyles.onDarkChrome,
            ]}
          />
        }
        ref={buttonRef}
        label={label}
        variant="ghost"
        isDisabled={isDisabled}
        onClick={onClick}
        className={tw(!hasZoom && place, lightboxControlButtonClassName)}
      />
    );
    return hasZoom ? (
      <span className={tw(place, lightboxControlBackingClassName)}>
        {button}
      </span>
    ) : (
      button
    );
  };

  const renderMedia = (
    {src, alt, type: kind = 'image'}: LightboxMedia,
    isCurrent: boolean,
  ) =>
    kind === 'video' ? (
      <video
        src={src}
        aria-label={alt}
        controls
        autoPlay={isOpen && isCurrent && hasAutoPlay}
        preload={isCurrent ? 'auto' : 'metadata'}
        className={lightboxVideoClassName}
      />
    ) : (
      <img
        ref={isCurrent ? stage.contentRef : undefined}
        src={src}
        alt={isCurrent ? alt : ''}
        aria-hidden={isCurrent ? undefined : true}
        draggable={false}
        className={lightboxImageClassName}
      />
    );
  // The current item and its neighbours; the pager shows one at rest.
  const pageIndexes = [index - 1, index, index + 1].filter(
    i => i >= 0 && i < mediaArray.length,
  );
  const hasCaptionBand = mediaArray.some(item => isRenderable(item.caption));
  // Its place ends the caption's last line, unless the open caption scrolls.
  const hasCaptionTogglePlace =
    hasCaptionToggle &&
    !isCaptionScrolling &&
    !(isCaptionOpen && isCaptionPlaceOff);
  // The keyboard's zoom button is the current page's photo box, so the
  // caption band stays outside it.
  const zoomButtonProps = {
    role: 'button',
    tabIndex: 0,
    'aria-pressed': isZoomed,
    'aria-label': t('@astryx.lightbox.zoom'),
    onKeyDown: handleImageKeyDown,
  } as const;

  return (
    <dialog
      ref={mergedDialogRef}
      onCancel={handleCancel}
      onKeyDown={e => {
        handleKeyDown(e);
        onKeyDownProp?.(e);
      }}
      aria-label={currentItem.alt || t('@astryx.lightbox.mediaViewer')}
      aria-describedby={
        isRenderable(currentItem.caption) ? captionId : undefined
      }
      {...mergeProps(
        themeProps('lightbox'),
        stylex.props(overlayPaddingReset.reset, xstyle),
        tw(
          lightboxDialogClassName,
          layerTextResetClassName,
          layerStructureResetClassName,
          className,
        ),
        style,
      )}
      {...props}
      // Presses inside the lightbox do not reach handlers around where it is
      // written.
      {...layerClickBoundary({
        ...props,
        onClick: (e: React.MouseEvent<HTMLDialogElement>) => {
          handleBackdropClick(e);
          onClickProp?.(e);
        },
      })}>
      <LayerDepthProvider>
        <ModalAnnounceProvider dialogRef={dialogRef} isOpen={isOpen}>
          <LayerContentBoundary>
            {/* A media surface: the controls and the caption take the dark
            surface tokens and the theme's rules for them. */}
            <MediaTheme mode="dark">
              <div
                ref={containerRef}
                className={lightboxContainerClassName}
                // Every press in the viewer records where and how it began. A
                // mouse's or a pen's press clears a zoomed drag's flag anywhere.
                // A finger's press clears it only on the stage.
                onPointerDown={e => {
                  pointerTypeRef.current = e.pointerType;
                  pressPointRef.current = {x: e.clientX, y: e.clientY};
                  const isOnStage =
                    e.target instanceof Node &&
                    imageWrapperRef.current?.contains(e.target) === true;
                  if (e.pointerType !== 'touch' || isOnStage) {
                    didDragRef.current = false;
                  }
                }}>
                <div
                  data-lightbox-chrome=""
                  className={lightboxChromeLayerClassName}>
                  {control(lightboxCloseButtonClassName, {
                    icon: 'close',
                    label: t('@astryx.lightbox.close'),
                    onClick: handleClose,
                    buttonRef: closeButtonRef,
                  })}

                  {/* Gallery nav: prev — stays mounted and is disabled at the start of
                the range so pressing/arrowing to the boundary doesn't unmount the
                focused control and drop focus to <body>. */}
                  {isGallery &&
                    control(
                      tw(lightboxNavButtonClassName, lightboxNavPrevClassName),
                      {
                        icon: 'chevronLeft',
                        label: t('@astryx.lightbox.previous'),
                        isDisabled: !canPrev,
                        onClick: goToPrev,
                        isMirrored: true,
                      },
                    )}
                </div>

                {/* The stage: a track of pages, each a photo and its caption */}
                <div
                  ref={mediaGroupRef}
                  data-lightbox-media=""
                  className={lightboxMediaGroupClassName}>
                  <div
                    ref={imageWrapperRef}
                    className={tw(
                      lightboxImageWrapperClassName,
                      isZoomTarget &&
                        !isZoomed &&
                        lightboxImageWrapperZoomableClassName,
                      isZoomTarget &&
                        isZoomed &&
                        lightboxImageWrapperZoomedClassName,
                    )}
                    onPointerMove={
                      isZoomTarget ? markPointerOverPhoto : undefined
                    }
                    onPointerLeave={
                      isZoomTarget
                        ? e =>
                            e.currentTarget.removeAttribute(
                              OVER_PHOTO_ATTRIBUTE,
                            )
                        : undefined
                    }
                    onDoubleClick={
                      isZoomTarget
                        ? e => {
                            // A finger's double tap is the stage's own.
                            if (pointerTypeRef.current !== 'touch') {
                              stage.doubleClickAt(e.clientX, e.clientY);
                            }
                          }
                        : undefined
                    }>
                    <div
                      ref={trackRef}
                      className={tw(
                        lightboxTrackClassName,
                        isZoomTarget && lightboxTrackZoomTargetClassName,
                        isTouch &&
                          !isZoomTarget &&
                          !isVideo &&
                          lightboxImageWrapperDismissTargetClassName,
                      )}>
                      {pageIndexes.map(i => (
                        <div
                          key={i}
                          data-lightbox-page={i}
                          data-current={i === index ? '' : undefined}
                          // Only the current page is on screen at rest: the
                          // others stay out of the tab order and the
                          // accessibility tree.
                          inert={i !== index ? true : undefined}
                          aria-hidden={i !== index ? true : undefined}
                          className={lightboxPageClassName}
                          style={pageOffsetStyle(i)}>
                          <div
                            ref={i === index ? pageMediaRef : undefined}
                            data-lightbox-page-media=""
                            {...(isZoomTarget && i === index
                              ? zoomButtonProps
                              : undefined)}
                            className={tw(
                              lightboxPageMediaClassName,
                              isZoomTarget &&
                                lightboxPageMediaZoomTargetClassName,
                              isZoomTarget &&
                                i === index &&
                                focusOutlineProps.focusVisible(
                                  lightboxOverrideStyles.zoomButtonFocusInset,
                                ).className,
                            )}>
                            {renderMedia(mediaArray[i], i === index)}
                          </div>
                          {hasCaptionBand && (
                            <div
                              ref={
                                i === index ? currentCaptionBandRef : undefined
                              }
                              className={tw(
                                lightboxCaptionBandClassName,
                                (!isRenderable(mediaArray[i].caption) ||
                                  (i === index && isCaptionOpen)) &&
                                  lightboxCaptionBandTransparentClassName,
                              )}>
                              {isRenderable(mediaArray[i].caption) && (
                                // The page's one caption: clamped in the
                                // band, or open over the photo's bottom.
                                <div
                                  id={i === index ? fullCaptionId : undefined}
                                  data-lightbox-caption=""
                                  className={tw(
                                    lightboxCaptionInBandClassName,
                                    i === index &&
                                      isCaptionOpen &&
                                      lightboxCaptionOpenClassName,
                                  )}>
                                  <div
                                    className={lightboxCaptionBodyClassName}
                                    style={
                                      i === index
                                        ? captionToggleStyle(
                                            captionToggleWidth,
                                            captionShownLines,
                                          )
                                        : undefined
                                    }>
                                    <Text
                                      ref={
                                        i === index
                                          ? bandCaptionMeasureRef
                                          : undefined
                                      }
                                      id={i === index ? captionId : undefined}
                                      as="div"
                                      type="body"
                                      maxLines={
                                        i === index && isCaptionOpen ? 0 : 2
                                      }
                                      hasTruncateTooltip={false}
                                      className={tw(
                                        lightboxCaptionClassName,
                                        lightboxCaptionClampedClassName,
                                        i === index &&
                                          isCaptionOpen &&
                                          lightboxCaptionTextOpenClassName,
                                        i === index &&
                                          hasCaptionToggle &&
                                          isCaptionScrolling &&
                                          lightboxCaptionTextBesideToggleClassName,
                                        i === index &&
                                          hasCaptionToggle &&
                                          isCaptionOpen &&
                                          isCaptionPlaceOff &&
                                          !isCaptionScrolling &&
                                          lightboxCaptionTextToggleOwnLineClassName,
                                      )}>
                                      <div
                                        ref={
                                          i === index
                                            ? bandCaptionFlowRef
                                            : undefined
                                        }
                                        className={
                                          lightboxCaptionFlowClassName
                                        }>
                                        <span
                                          ref={
                                            i === index
                                              ? bandCaptionPlaceRef
                                              : undefined
                                          }
                                          aria-hidden="true"
                                          className={tw(
                                            lightboxCaptionTogglePlaceClassName,
                                            i === index &&
                                              hasCaptionTogglePlace &&
                                              captionShownLines > 0
                                              ? lightboxCaptionTogglePlaceShownClassName
                                              : lightboxCaptionTogglePlaceHiddenClassName,
                                          )}
                                          style={captionPlaceLinesStyle}
                                        />
                                        {mediaArray[i].caption}
                                      </div>
                                    </Text>
                                    {i === index && (
                                      // Mounted with the caption, and hidden
                                      // until the caption needs it. So a
                                      // measurement only shows or hides it,
                                      // and adds no element.
                                      <Link
                                        ref={captionToggleRefs}
                                        hidden={!hasCaptionToggle}
                                        type="inherit"
                                        // The toggle takes the caption's
                                        // own colour. A theme's accent on
                                        // the media surface can match the
                                        // band. The underline sets the
                                        // toggle apart.
                                        color="inherit"
                                        hasUnderline
                                        aria-expanded={isCaptionOpen}
                                        aria-controls={fullCaptionId}
                                        onClick={() => {
                                          if (isCaptionOpen) {
                                            setOpenCaptionIndex(null);
                                            return;
                                          }
                                          // eslint-disable-next-line @eslint-react/dom-no-flush-sync -- the opened caption lays out without the toggle's place before its lines are counted
                                          flushSync(() => {
                                            setCaptionShownLines(0);
                                            setOpenCaptionIndex(index);
                                          });
                                          countOpenCaption();
                                        }}
                                        className={tw(
                                          lightboxCaptionToggleClassName,
                                          stylex.props(touchHitAreaStyles.layer)
                                            .className,
                                        )}>
                                        {isCaptionOpen
                                          ? t('@astryx.lightbox.captionLess')
                                          : t('@astryx.lightbox.captionMore')}
                                      </Link>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  data-lightbox-chrome=""
                  className={lightboxChromeLayerClassName}>
                  {/* Gallery nav: next — see "prev" above; stays mounted and disabled at
              the end of the range instead of unmounting. */}
                  {isGallery &&
                    control(
                      tw(lightboxNavButtonClassName, lightboxNavNextClassName),
                      {
                        icon: 'chevronRight',
                        label: t('@astryx.lightbox.next'),
                        isDisabled: !canNext,
                        onClick: goToNext,
                        isMirrored: true,
                      },
                    )}

                  {/* Gallery counter */}
                  {isGallery && mediaArray.length > 1 && (
                    <Text
                      as="div"
                      type="body"
                      color={hasZoom ? 'inherit' : undefined}
                      className={tw(
                        lightboxCounterClassName,
                        hasZoom && lightboxCounterBackingClassName,
                      )}
                      xstyle={
                        hasZoom
                          ? [lightboxOverrideStyles.onDarkChrome]
                          : undefined
                      }>
                      {index + 1} / {mediaArray.length}
                    </Text>
                  )}
                </div>
              </div>
            </MediaTheme>
          </LayerContentBoundary>
        </ModalAnnounceProvider>
      </LayerDepthProvider>
    </dialog>
  );
}

Lightbox.displayName = 'Lightbox';
