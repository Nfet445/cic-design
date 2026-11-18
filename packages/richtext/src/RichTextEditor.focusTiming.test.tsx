// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file RichTextEditor.focusTiming.test.tsx
 * @input RichTextEditor, and the text field timing it shares with Core's text
 *   fields
 * @output Proof that the editor's field carries the shared transition timing
 *   classes, so it shows its focus look at once under a coarse pointer or
 *   reduced motion and fades it under a fine pointer
 * @position Unit test for RichTextEditor's use of the shared field box classes
 */

import {cleanup, render} from '@testing-library/react';
import {afterEach, describe, expect, it} from 'vitest';
import {expectClassSet} from '../../core/src/__tests__/classNameAssertions';
import {RichTextEditor} from './RichTextEditor';

afterEach(() => {
  cleanup();
});

describe('RichTextEditor focus timing', () => {
  it('carries the shared field transition timing', () => {
    const {container} = render(<RichTextEditor label="Notes" />);
    const wrappers = Array.from(
      container.querySelectorAll<HTMLElement>('*'),
    ).filter(element =>
      element.classList.contains('transition-[border-color,box-shadow]'),
    );
    expect(wrappers).toHaveLength(1);
    expectClassSet(wrappers[0], {
      includes: [
        'duration-[var(--duration-fast)]',
        'motion-reduce:duration-0',
        'pointer-coarse:duration-0',
      ],
    });
  });
});
