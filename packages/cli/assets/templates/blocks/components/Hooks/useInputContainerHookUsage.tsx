// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useRef, useState} from 'react';
import {InputClearButton} from '@astryxdesign/core/Field';
import {useInputContainer} from '@astryxdesign/core/hooks';
import {Icon} from '@astryxdesign/core/Icon';
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';

const styles = {
  /*
   * The ring sits on the container, which holds the focus, so it reads
   * `:has()` rather than `:focus-visible`.
   */
  field:
    'flex items-center gap-2 w-[320px] min-h-10 px-3 border border-[var(--color-border-emphasized)] rounded-[var(--radius-element)] cursor-text outline-none [&:has(>input:focus-visible)]:[outline-width:var(--focus-outline-width)] [&:has(>input:focus-visible)]:[outline-style:var(--focus-outline-style)] [&:has(>input:focus-visible)]:[outline-color:var(--focus-outline-color)] [&:has(>input:focus-visible)]:[outline-offset:var(--focus-outline-offset)]',
  input:
    'grow min-w-0 border-none outline-none bg-transparent text-inherit [font-family:inherit] [font-size:inherit]',
} as const;

export default function UseInputContainerHookUsage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const {onClick, onMouseUp} = useInputContainer({containerRef, inputRef});

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      onMouseUp={onMouseUp}
      className={styles.field}>
      <Icon icon={MagnifyingGlassIcon} color="secondary" />
      <input
        ref={inputRef}
        type="text"
        aria-label="Search"
        placeholder="Search"
        value={query}
        onChange={event => setQuery(event.target.value)}
        className={styles.input}
      />
      {query !== '' && (
        <InputClearButton
          label="Clear search"
          onClick={() => {
            setQuery('');
            inputRef.current?.focus();
          }}
        />
      )}
    </div>
  );
}
