// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useRef, useState} from 'react';
import {BaseTypeahead, createStaticSource} from '@astryxdesign/core/Typeahead';
import type {SearchableItem} from '@astryxdesign/core/Typeahead';
import {Icon} from '@astryxdesign/core/Icon';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';

const frameworks: SearchableItem[] = [
  {id: 'react', label: 'React'},
  {id: 'vue', label: 'Vue'},
  {id: 'angular', label: 'Angular'},
  {id: 'svelte', label: 'Svelte'},
  {id: 'solid', label: 'SolidJS'},
  {id: 'remix', label: 'Remix'},
  {id: 'next', label: 'Next.js'},
  {id: 'nuxt', label: 'Nuxt'},
];

const source = createStaticSource(frameworks);

const styles = {
  root: 'w-full max-w-[360px]',
  // The ring sits on the wrapper, so the magnifier and the input read as one
  // field. The `:has` selector outranks the plain class that hides it.
  field:
    'bg-surface border-border [border-width:var(--border-width)] border-solid rounded-md [padding-block:var(--spacing-5)] [padding-inline:var(--spacing-2)] outline-solid [outline-color:transparent] [outline-width:0] [outline-offset:var(--focus-outline-offset)] [&:has(input:focus-visible)]:[outline-color:var(--focus-outline-color)] [&:has(input:focus-visible)]:[outline-width:var(--focus-outline-width)]',
} as const;

export default function BaseTypeaheadCustomSearch() {
  const [value, setValue] = useState<SearchableItem | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  return (
    <VStack gap={3} className={styles.root}>
      <HStack ref={wrapperRef} gap={2} vAlign="center" className={styles.field}>
        <Icon icon={MagnifyingGlassIcon} size="sm" color="secondary" />
        <BaseTypeahead
          aria-label="Search frameworks"
          searchSource={source}
          value={value}
          onChange={setValue}
          anchorRef={wrapperRef}
          placeholder="Search frameworks…"
          hasEntriesOnFocus
          debounceMs={0}
        />
      </HStack>
      <Text type="supporting" color="secondary">
        {value != null ? `Selected: ${value.label}` : 'No selection'}
      </Text>
    </VStack>
  );
}
