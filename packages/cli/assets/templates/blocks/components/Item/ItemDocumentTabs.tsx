// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Fragment} from 'react';
import {Divider} from '@astryxdesign/core/Divider';
import {useContainerReveal} from '@astryxdesign/core/hooks';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Item} from '@astryxdesign/core/Item';
import {HStack} from '@astryxdesign/core/Layout';
import {mergeProps} from '@astryxdesign/core/utils';
import {DocumentIcon, PlusIcon, XMarkIcon} from '@heroicons/react/24/outline';

const TABS = [
  {name: 'Project brief', isActive: true},
  {name: 'Research notes', isActive: false},
  {name: 'Interaction prototype', isActive: false},
];

const styles = {
  strip: 'min-w-0 shrink [scrollbar-width:none]',
  rule: 'h-4',
  hidden: 'invisible',
  tab: 'w-[164px] min-w-24 shrink',
  action: '-m-1 [transition-property:none]',
} as const;
function DocumentTab({name, isActive}: (typeof TABS)[number]) {
  const {getContainerProps, getContentRevealProps} = useContainerReveal();
  const revealProps = getContentRevealProps({
    forceVisibility: isActive ? 'shown' : undefined,
    isLayoutPreserved: true,
  });
  return (
    <Item
      label={name}
      density="compact"
      isSelected={isActive}
      onClick={() => {}}
      aria-current={isActive ? 'true' : undefined}
      {...getContainerProps()}
      startContent={
        <Icon
          icon={DocumentIcon}
          size="sm"
          color={isActive ? 'primary' : 'secondary'}
        />
      }
      endContent={
        <IconButton
          label={`Close ${name}`}
          variant="ghost"
          size="sm"
          icon={<Icon icon={XMarkIcon} size="sm" />}
          {...mergeProps(revealProps, {className: styles.action})}
        />
      }
      className={styles.tab}
    />
  );
}

export default function ItemDocumentTabs() {
  return (
    <HStack width="100%" maxWidth={600} gap={0.5} vAlign="center">
      <HStack
        role="group"
        aria-label="Open documents"
        vAlign="center"
        paddingInline={2}
        paddingBlock={1}
        isScrollable
        className={styles.strip}>
        {TABS.map((tab, index) => (
          <Fragment key={tab.name}>
            {index > 0 ? (
              <Divider
                orientation="vertical"
                className={`${styles.rule} ${
                  TABS[index - 1]?.isActive || tab.isActive ? styles.hidden : ''
                }`}
              />
            ) : null}
            <DocumentTab {...tab} />
          </Fragment>
        ))}
      </HStack>
      <IconButton
        label="New document"
        tooltip="New document"
        variant="ghost"
        size="sm"
        icon={<Icon icon={PlusIcon} size="sm" color="secondary" />}
      />
    </HStack>
  );
}
