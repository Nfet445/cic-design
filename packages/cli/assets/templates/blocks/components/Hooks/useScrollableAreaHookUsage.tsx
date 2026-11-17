// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {useScrollableArea} from '@astryxdesign/core/hooks';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';

// Each shadow is a literal class: a Tailwind build scans the generated source,
// so a class assembled from parts would never reach the stylesheet.
const styles = {
  viewport: 'h-40',
  shadowTop: '[box-shadow:inset_0_12px_8px_-8px_var(--color-shadow)]',
  shadowBottom: '[box-shadow:inset_0_-12px_8px_-8px_var(--color-shadow)]',
  shadowBoth:
    '[box-shadow:inset_0_12px_8px_-8px_var(--color-shadow),inset_0_-12px_8px_-8px_var(--color-shadow)]',
} as const;

const ACTIVITY = [
  'Maya created the Checkout project',
  'Sam invited Lee',
  'Build 318 passed',
  'Lee opened "Card total rounds down"',
  'Maya deployed 1.4.2 to staging',
  'Build 319 failed',
  'Sam fixed the rounding test',
  'Build 320 passed',
  'Maya deployed 1.4.3 to production',
  'Lee closed "Card total rounds down"',
];

export default function UseScrollableAreaHookUsage() {
  const [count, setCount] = useState(3);
  const {getViewportProps, getContentProps, state} = useScrollableArea({
    axis: 'block',
    keyboardAccess: {owner: 'viewport', label: 'Activity log'},
    overscroll: 'contain',
  });
  const {isScrollable, atStart, atEnd} = state.block;
  const hiddenAbove = isScrollable && !atStart;
  const hiddenBelow = isScrollable && !atEnd;

  const shadow =
    hiddenAbove && hiddenBelow
      ? styles.shadowBoth
      : hiddenAbove
        ? styles.shadowTop
        : hiddenBelow
          ? styles.shadowBottom
          : '';

  return (
    <Card width={320} padding={4}>
      <VStack gap={3}>
        <HStack justify="between" vAlign="center">
          <Heading level={4}>Activity log</Heading>
          <Button
            label="Add entry"
            variant="secondary"
            isDisabled={count === ACTIVITY.length}
            onClick={() => setCount(count + 1)}
          />
        </HStack>
        <div {...getViewportProps({className: `${styles.viewport} ${shadow}`})}>
          <VStack {...getContentProps()} gap={2}>
            {ACTIVITY.slice(0, count).map(entry => (
              <Text key={entry} type="body">
                {entry}
              </Text>
            ))}
          </VStack>
        </div>
      </VStack>
    </Card>
  );
}
