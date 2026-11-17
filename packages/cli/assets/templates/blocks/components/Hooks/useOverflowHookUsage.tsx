// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useOverflow} from '@astryxdesign/core/hooks';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';

const actions = [
  'Bold',
  'Italic',
  'Underline',
  'Strikethrough',
  'Link',
  'Quote',
  'Code',
  'Clear formatting',
];

const GAP = 4;

const styles = {
  // 480px and 120px are layout widths with no spacing token.
  box: 'w-[480px] min-w-[120px] max-w-full resize-x overflow-hidden',
  row: 'flex gap-1',
  // Takes no space and paints nothing, so the hook measures every item
  // without a flicker. Do not use hidden display, which stops measurement.
  measure:
    'absolute invisible h-0 overflow-hidden whitespace-nowrap pointer-events-none',
} as const;

function MoreMenu({items}: {items: string[]}) {
  return (
    <DropdownMenu
      button={{label: 'More', variant: 'ghost', size: 'sm'}}
      items={items.map(label => ({label}))}
    />
  );
}

export default function UseOverflowHookUsage() {
  const {containerRef, measureRef, visibleCount, hasOverflow} = useOverflow(
    actions.length,
    {gap: GAP},
  );

  return (
    <Card padding={2} className={styles.box}>
      <div
        ref={measureRef}
        aria-hidden="true"
        inert
        className={`${styles.row} ${styles.measure}`}>
        {actions.map(label => (
          <Button key={label} label={label} variant="ghost" size="sm" />
        ))}
        <div data-overflow-indicator>
          <MoreMenu items={actions} />
        </div>
      </div>
      <div
        ref={containerRef}
        role="group"
        aria-label="Text formatting"
        className={styles.row}>
        {actions.slice(0, visibleCount).map(label => (
          <Button key={label} label={label} variant="ghost" size="sm" />
        ))}
        {hasOverflow && <MoreMenu items={actions.slice(visibleCount)} />}
      </div>
    </Card>
  );
}
