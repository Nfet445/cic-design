// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file OverlayScrim.tsx
 * @input Scrim props (mode, position, align, visibility)
 * @output Renders the scrim div with background, media theme, transitions
 * @position Internal rendering primitive; used by Overlay and useOverlay
 *
 * Not exported directly — consumers use Overlay (component) or
 * useOverlay (hook), both of which render this internally.
 */

import type {ReactNode} from 'react';
import {MediaTheme} from '../theme/MediaTheme';
import {mergeProps} from '../utils';
import {tw} from '../utils/tw';
import {themeProps} from '../utils/themeProps';
import {
  overlayScrimAlignClassName,
  overlayScrimBaseClassName,
  overlayScrimFocusRevealClassName,
  overlayScrimHiddenClassName,
  overlayScrimHoverRevealClassName,
  overlayScrimPositionClassName,
  overlayScrimShownClassName,
  overlayScrimTintClassName,
} from './overlayClasses';

// =============================================================================
// Types (re-exported from index.ts for consumers)
// =============================================================================

export type OverlayScrimMode = 'dark' | 'light' | false;
export type OverlayPosition = 'fill' | 'bottom' | 'top';
export type OverlayAlign = 'start' | 'center' | 'end';
export type OverlayShowOn = 'hover' | 'always' | 'focus' | 'hover-or-focus';

export interface OverlayScrimProps {
  scrim: OverlayScrimMode;
  position: OverlayPosition;
  align: OverlayAlign;
  showOn: OverlayShowOn;
  isOpen: boolean | undefined;
  children: ReactNode;
}

// =============================================================================
// Visibility style helpers — extract branching logic from render
// =============================================================================

/**
 * The reveal a JS-controlled overlay wears: open or closed, with the slide its
 * position asks for.
 */
function getControlledVisibility(
  isOpen: boolean,
  position: OverlayPosition,
): string {
  return isOpen
    ? overlayScrimShownClassName({position})
    : overlayScrimHiddenClassName({position});
}

/**
 * The reveal a CSS-driven overlay wears. Each mode owns its own arm: a hover
 * scrim watches the container's hover and its focus inside, a focus scrim only
 * the focus.
 */
function getShowOnVisibility(
  showOn: OverlayShowOn,
  position: OverlayPosition,
): string {
  switch (showOn) {
    case 'always':
      return overlayScrimShownClassName({position});
    case 'hover':
    case 'hover-or-focus':
      return overlayScrimHoverRevealClassName({position});
    case 'focus':
      return overlayScrimFocusRevealClassName({position});
  }
}

// =============================================================================
// Component (internal)
// =============================================================================

export function OverlayScrim({
  scrim,
  position,
  align,
  showOn,
  isOpen,
  children,
}: OverlayScrimProps) {
  const isControlled = isOpen !== undefined;

  const themeMode =
    scrim === 'dark' ? 'dark' : scrim === 'light' ? 'light' : null;

  const content = themeMode ? (
    <MediaTheme mode={themeMode}>{children}</MediaTheme>
  ) : (
    children
  );

  const visibility = isControlled
    ? getControlledVisibility(isOpen, position)
    : getShowOnVisibility(showOn, position);

  return (
    <div
      {...mergeProps(
        themeProps('overlay-scrim', {position}),
        tw(
          overlayScrimBaseClassName,
          overlayScrimPositionClassName[position],
          overlayScrimAlignClassName[align],
          scrim !== false && overlayScrimTintClassName[scrim],
          visibility,
        ),
      )}
      inert={isControlled && !isOpen ? true : undefined}>
      {content}
    </div>
  );
}
