// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useRef, useState} from 'react';
import {BaseTypeahead, createStaticSource} from '@astryxdesign/core/Typeahead';
import type {SearchableItem} from '@astryxdesign/core/Typeahead';
import {VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

const frameworks: SearchableItem[] = [
  {id: 'react', label: 'React', auxiliaryData: {category: 'UI library'}},
  {id: 'remix', label: 'Remix', auxiliaryData: {category: 'Web framework'}},
  {id: 'next', label: 'Next.js', auxiliaryData: {category: 'Web framework'}},
];

const source = createStaticSource(frameworks);

const styles = {
  root: 'w-full max-w-[360px]',
  // The ring sits on the wrapper, so the input reads as one field. The `:has`
  // selector outranks the plain class that hides it.
  field:
    'bg-surface border-border [border-width:var(--border-width)] border-solid rounded-md [padding-block:var(--spacing-5)] [padding-inline:var(--spacing-2)] outline-solid [outline-color:transparent] [outline-width:0] [outline-offset:var(--focus-outline-offset)] [&:has(input:focus-visible)]:[outline-color:var(--focus-outline-color)] [&:has(input:focus-visible)]:[outline-width:var(--focus-outline-width)]',
  result: 'min-w-0',
} as const;

export default function BaseTypeaheadCustomResults() {
  const [value, setValue] = useState<SearchableItem | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  return (
    <VStack gap={3} className={styles.root}>
      <div ref={wrapperRef} className={styles.field}>
        <BaseTypeahead
          aria-label="Search frameworks"
          searchSource={source}
          value={value}
          onChange={setValue}
          anchorRef={wrapperRef}
          placeholder="Search frameworks…"
          hasEntriesOnFocus
          debounceMs={0}
          renderItem={item => (
            <VStack gap={0} className={styles.result}>
              <Text type="label">{item.label}</Text>
              <Text type="supporting" color="secondary">
                {
                  (item.auxiliaryData as {category?: string} | undefined)
                    ?.category
                }
              </Text>
            </VStack>
          )}
        />
      </div>
    </VStack>
  );
}
