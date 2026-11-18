// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file LoadingMessage.tsx
 * @input A loading message, a Spinner size
 * @output LoadingMessage: a silent Spinner ring above readable loading words
 * @position Shared by Lab owners that announce their own busy start: the ring
 *   is hidden from assistive technology, since its owner announces, and the
 *   words stay readable, laid out as Spinner's own labelled wrapper is (an
 *   inline column, centred, with `--spacing-2` between)
 */

import {Spinner, type SpinnerSize} from '@astryxdesign/core/Spinner';
import {Text} from '@astryxdesign/core/Text';
import {loadingMessageClassName} from './loadingMessageClasses';

export function LoadingMessage({
  label,
  size = 'md',
}: {
  label: string;
  size?: SpinnerSize;
}) {
  return (
    <span className={loadingMessageClassName}>
      <Spinner size={size} aria-hidden />
      <Text type="body" weight="bold">
        {label}
      </Text>
    </span>
  );
}
