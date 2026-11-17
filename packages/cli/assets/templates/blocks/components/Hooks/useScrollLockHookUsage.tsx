// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useEffect, useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {useFocusTrap, useScrollLock} from '@astryxdesign/core/hooks';
import {VStack} from '@astryxdesign/core/Layout';
import {Link} from '@astryxdesign/core/Link';

const styles = {
  menu: 'size-full max-w-none max-h-none m-0 border-0 overflow-y-auto [padding:var(--spacing-4)] [color:var(--color-text-primary)] [background-color:var(--color-background-surface)]',
} as const;

const MENU_ITEMS = ['Products', 'Pricing', 'Customers', 'Support'];

export default function UseScrollLockHookUsage() {
  const [isOpen, setIsOpen] = useState(false);
  useScrollLock(isOpen);
  const {containerRef, focusFirst} = useFocusTrap<HTMLDialogElement>({
    isActive: isOpen,
    onEscape: close,
  });

  // The dialog leaves the top layer before the state change, so the page is
  // no longer inert when the focus trap hands focus back to Menu.
  function close() {
    containerRef.current?.close();
    setIsOpen(false);
  }

  useEffect(() => {
    const dialog = containerRef.current;
    if (isOpen && dialog != null && !dialog.open) {
      dialog.showModal();
      focusFirst();
    }
  }, [isOpen, containerRef, focusFirst]);

  return (
    <>
      <Button label="Menu" onClick={() => setIsOpen(true)} />
      <dialog
        ref={containerRef}
        aria-label="Menu"
        onCancel={event => {
          event.preventDefault();
          close();
        }}
        className={styles.menu}>
        <nav aria-label="Site menu">
          <VStack gap={4} hAlign="start">
            <Button label="Close menu" variant="secondary" onClick={close} />
            {MENU_ITEMS.map(item => (
              <Link
                key={item}
                href={`#menu-${item.toLowerCase()}`}
                onClick={close}>
                {item}
              </Link>
            ))}
          </VStack>
        </nav>
      </dialog>
    </>
  );
}
