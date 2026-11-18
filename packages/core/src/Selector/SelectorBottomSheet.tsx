// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SelectorBottomSheet.tsx
 * @input Uses BottomSheet, Section, and Heading
 * @output Shared mobile listbox sheet for Selector and MultiSelector
 * @position Internal presentation primitive for selection controls
 */

import {lazy, Suspense, useEffect, type ReactNode, type RefObject} from 'react';
import {Heading} from '../Heading';
import {Section} from '../Section';
import {
  SELECTOR_BOTTOM_SHEET_CONTENT_CLASS,
  SELECTOR_BOTTOM_SHEET_HEADING_CLASS,
} from './selectorOptionClasses';

const LazyBottomSheet = lazy(async () =>
  import('../BottomSheet/BottomSheet').then(module => ({
    default: module.BottomSheet,
  })),
);

interface SelectorBottomSheetProps {
  children: ReactNode;
  finalFocusRef: RefObject<HTMLElement | null>;
  initialFocusRef: RefObject<HTMLElement | null>;
  isOpen: boolean;
  label: string;
  onOpenChange: (isOpen: boolean) => void;
}

function SelectorBottomSheetInitialFocus({
  isOpen,
  targetRef,
}: {
  isOpen: boolean;
  targetRef: RefObject<HTMLElement | null>;
}) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      targetRef.current?.focus({preventScroll: true});
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen, targetRef]);

  return null;
}

export function SelectorBottomSheet({
  children,
  finalFocusRef,
  initialFocusRef,
  isOpen,
  label,
  onOpenChange,
}: SelectorBottomSheetProps) {
  return (
    <Suspense fallback={null}>
      <LazyBottomSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        finalFocusRef={finalFocusRef}
        label={label}
        height="hug"
        purpose="info">
        <Section paddingBlockStart={4} paddingBlockEnd={0} paddingInline={1}>
          <div className={SELECTOR_BOTTOM_SHEET_CONTENT_CLASS}>
            <Heading level={3} className={SELECTOR_BOTTOM_SHEET_HEADING_CLASS}>
              {label}
            </Heading>
            {children}
            <SelectorBottomSheetInitialFocus
              isOpen={isOpen}
              targetRef={initialFocusRef}
            />
          </div>
        </Section>
      </LazyBottomSheet>
    </Suspense>
  );
}

SelectorBottomSheet.displayName = 'SelectorBottomSheet';
