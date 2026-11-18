// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file textFieldFocusTiming.test.tsx
 * @input Every text field: TextInput, TextArea, NumberInput, the date and time
 *   fields in each presentation, Tokenizer, Typeahead, PowerSearch,
 *   PanelSearchInput with its input box, and ChatComposer
 * @output Proof that each field's box carries the timing classes that keep the
 *   focus look from fading under a coarse pointer or reduced motion, and its
 *   fast fade under a fine pointer
 * @position Unit test for the timing classes the field box publishes in
 *   `../fieldClasses` and `../../Chat/chatClasses`
 */

import {cleanup, render} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {ReactElement} from 'react';
import {classesOf} from '../../__tests__/classNameAssertions';
import {PanelSearchInput} from '../PanelSearchInput';
import {TextInput} from '../../TextInput/TextInput';
import {TextArea} from '../../TextArea/TextArea';
import {NumberInput} from '../../NumberInput/NumberInput';
import {DateInput} from '../../DateInput/DateInput';
import {DateRangeInput} from '../../DateRangeInput/DateRangeInput';
import {DateTimeInput} from '../../DateTimeInput/DateTimeInput';
import {TimeInput} from '../../TimeInput/TimeInput';
import {Tokenizer} from '../../Tokenizer/Tokenizer';
import {Typeahead} from '../../Typeahead/Typeahead';
import type {SearchSource} from '../../Typeahead/types';
import {PowerSearch} from '../../PowerSearch/PowerSearch';
import {ChatComposer} from '../../Chat/ChatComposer';

// The sheet presentations measure their panes; jsdom has no ResizeObserver.
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', MockResizeObserver);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const source: SearchSource = {search: async () => [], bootstrap: () => []};

/**
 * The transition each field box declares. The box, not its buttons, is where
 * the focus look fades.
 */
const BOX_TRANSITION_CLASSES = [
  'transition-[border-color,box-shadow]',
  'transition-[box-shadow,border-color]',
];

/** The timing every field box shares: fast fade, no fade when it should be instant. */
const FIELD_TIMING_CLASSES = [
  'duration-[var(--duration-fast)]',
  'motion-reduce:duration-0',
  'pointer-coarse:duration-0',
];

const FIELDS: ReadonlyArray<readonly [string, () => ReactElement]> = [
  ['TextInput', () => <TextInput label="Name" value="" onChange={() => {}} />],
  [
    'TextArea',
    () => <TextArea label="Description" value="" onChange={() => {}} />,
  ],
  [
    'NumberInput',
    () => <NumberInput label="Quantity" value={null} onChange={() => {}} />,
  ],
  [
    'DateInput, popover',
    () => <DateInput label="Date" presentation="popover" onChange={() => {}} />,
  ],
  [
    'DateInput, bottom sheet',
    () => (
      <DateInput label="Date" presentation="bottom-sheet" onChange={() => {}} />
    ),
  ],
  [
    'DateInput, native',
    () => <DateInput label="Date" presentation="native" onChange={() => {}} />,
  ],
  [
    'DateRangeInput',
    () => <DateRangeInput label="Range" value={null} onChange={() => {}} />,
  ],
  [
    'DateTimeInput, popover',
    () => (
      <DateTimeInput
        label="Meeting time"
        presentation="popover"
        onChange={() => {}}
      />
    ),
  ],
  [
    'DateTimeInput, bottom sheet',
    () => (
      <DateTimeInput
        label="Meeting time"
        presentation="bottom-sheet"
        onChange={() => {}}
      />
    ),
  ],
  [
    'TimeInput, popover',
    () => <TimeInput label="Time" presentation="popover" onChange={() => {}} />,
  ],
  [
    'TimeInput, bottom sheet',
    () => (
      <TimeInput label="Time" presentation="bottom-sheet" onChange={() => {}} />
    ),
  ],
  [
    'Tokenizer',
    () => (
      <Tokenizer
        label="Members"
        searchSource={source}
        value={[]}
        onChange={() => {}}
      />
    ),
  ],
  [
    'Typeahead',
    () => (
      <Typeahead
        label="Assignee"
        searchSource={source}
        value={null}
        onChange={() => {}}
      />
    ),
  ],
  [
    'PowerSearch',
    () => (
      <PowerSearch
        config={{
          name: 'Search',
          fields: [
            {
              key: 'title',
              label: 'Title',
              defaultOperator: 'contains',
              operators: [
                {key: 'contains', label: 'contains', value: {type: 'string'}},
              ],
            },
          ],
        }}
        filters={[]}
        onChange={() => {}}
      />
    ),
  ],
  ['ChatComposer', () => <ChatComposer onSubmit={() => {}} />],
  [
    'PanelSearchInput with its input box',
    () => (
      <PanelSearchInput
        label="Search"
        clearLabel="Clear search"
        value=""
        onValueChange={() => {}}
        hasInputBox
      />
    ),
  ],
];

describe('text field focus timing', () => {
  it.each(FIELDS)(
    '%s carries the shared field timing classes',
    (_name, renderField) => {
      const {container} = render(renderField());
      const boxes = Array.from(
        container.querySelectorAll<HTMLElement>('*'),
      ).filter(element => {
        const classes = classesOf(element);
        return BOX_TRANSITION_CLASSES.some(name => classes.includes(name));
      });
      expect(boxes.length).toBeGreaterThan(0);
      for (const box of boxes) {
        for (const className of FIELD_TIMING_CLASSES) {
          expect(classesOf(box)).toContain(className);
        }
      }
    },
  );
});
