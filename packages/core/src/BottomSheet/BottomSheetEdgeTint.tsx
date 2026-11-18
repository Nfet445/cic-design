// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file BottomSheetEdgeTint.tsx
 * @input The edge tint class map
 * @output BottomSheetEdgeTint, an internal decorative element
 * @position Private helper rendered inside every BottomSheet dialog
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/BottomSheet/BottomSheet.tsx
 * - /packages/core/src/BottomSheet/BottomSheetSwitcher.tsx
 * - /packages/core/src/BottomSheet/BottomSheetEdgeTint.test.tsx
 */

// iOS Safari colors its translucent toolbars by sampling the page. It hit
// tests a point inside each viewport edge, finds the nearest fixed or sticky
// ancestor, and extends its `background-color`. Without this element, WebKit
// can pick the dialog backdrop or the page, so equal sheets get different
// toolbar colors. This element is fixed, full width, at the bottom edge,
// taller than WebKit's 10px minimum, and in the sheet's surface color. It is
// masked out: Safari reads the computed style, not the pixels.

import {bottomSheetEdgeTintClassName} from './bottomSheetEdgeTintClasses';

/**
 * Colours the iOS Safari toolbar strip below a sheet. Renders nothing visible;
 * see the file header for why it exists.
 */
export function BottomSheetEdgeTint() {
  return (
    <div
      className={bottomSheetEdgeTintClassName}
      data-sheet-edge-tint=""
      aria-hidden="true"
    />
  );
}
