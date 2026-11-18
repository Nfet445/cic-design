// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {useScrollOverflow} from '@astryxdesign/core/hooks';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Switch} from '@astryxdesign/core/Switch';
import {Token} from '@astryxdesign/core/Token';
const styles = {
  strip: 'flex gap-2 overflow-x-auto',
  filter: 'shrink-0',
  fadeLeft:
    '[mask-image:linear-gradient(to_right,transparent,black_var(--spacing-8))]',
  fadeRight:
    '[mask-image:linear-gradient(to_left,transparent,black_var(--spacing-8))]',
  fadeBoth:
    '[mask-image:linear-gradient(to_right,transparent,black_var(--spacing-8),black_calc(100%_-_var(--spacing-8)),transparent)]',
} as const;

const FILTERS = [
  'Open now',
  'Free delivery',
  'Vegetarian',
  'Under $15',
  'Top rated',
  'Outdoor seating',
  'Pet friendly',
];

export default function UseScrollOverflowHookUsage() {
  const [filters, setFilters] = useState(FILTERS.slice(0, 2));
  const [isRtl, setIsRtl] = useState(false);
  const {scrollRef, overflowStart, overflowEnd} = useScrollOverflow();
  const nextFilter = FILTERS.find(filter => !filters.includes(filter));
  const fadeStart = isRtl ? styles.fadeRight : styles.fadeLeft;
  const fadeEnd = isRtl ? styles.fadeLeft : styles.fadeRight;

  return (
    <VStack gap={3} width={320}>
      <div dir={isRtl ? 'rtl' : 'ltr'}>
        <div
          ref={scrollRef}
          role="group"
          aria-label="Active filters"
          className={`${styles.strip} ${
            overflowStart && overflowEnd
              ? styles.fadeBoth
              : overflowStart
                ? fadeStart
                : overflowEnd
                  ? fadeEnd
                  : ''
          }`}>
          {filters.map(filter => (
            <Token
              key={filter}
              label={filter}
              className={styles.filter}
              onRemove={() =>
                setFilters(current => current.filter(item => item !== filter))
              }
            />
          ))}
        </div>
      </div>
      <HStack gap={3} vAlign="center">
        <Button
          label="Add filter"
          variant="secondary"
          isDisabled={nextFilter == null}
          onClick={() => nextFilter && setFilters([...filters, nextFilter])}
        />
        <Switch label="Right to left" value={isRtl} onChange={setIsRtl} />
      </HStack>
    </VStack>
  );
}
