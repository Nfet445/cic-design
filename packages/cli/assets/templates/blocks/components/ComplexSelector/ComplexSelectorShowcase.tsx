// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useEffect, useState} from 'react';
import {ComplexSelector} from '@astryxdesign/core/ComplexSelector';
import {Text} from '@astryxdesign/core/Text';
import {useGridFocus} from '@astryxdesign/core/hooks';

type Fruit = 'Apple' | 'Pear' | 'Peach' | 'Plum';
type Ripeness = 'Crisp' | 'Tender' | 'Juicy' | 'Peak';

interface FruitValue {
  fruit: Fruit;
  ripeness: Ripeness;
}

const fruits: Array<{id: Fruit; emoji: string; description: string}> = [
  {id: 'Apple', emoji: '🍎', description: 'Bright and balanced'},
  {id: 'Pear', emoji: '🍐', description: 'Soft floral sweetness'},
  {id: 'Peach', emoji: '🍑', description: 'Round summer flavor'},
  {id: 'Plum', emoji: '🟣', description: 'Jammy and tart'},
];

const ripenessLevels: Array<{
  id: Ripeness;
  shortLabel: string;
  description: string;
}> = [
  {id: 'Crisp', shortLabel: 'C', description: 'Snappy bite'},
  {id: 'Tender', shortLabel: 'T', description: 'Easy bite'},
  {id: 'Juicy', shortLabel: 'J', description: 'Full juice'},
  {id: 'Peak', shortLabel: 'P', description: 'Most intense'},
];

const GRID_CELL_SELECTOR = '[role="gridcell"]';

const styles = {
  grid: 'flex flex-col gap-1 min-w-[280px]',
  row: 'grid [grid-template-columns:minmax(150px,1fr)_repeat(4,44px)] items-center gap-x-1',
  rowHeader: 'flex items-center gap-2 text-start min-w-0',
  emoji: 'text-[18px] shrink-0',
  fruitText: 'flex flex-col min-w-0',
  // `aria-selected` drives the chosen cell, so two arbitrary-value utilities
  // never have to fight over one property.
  cell: 'flex items-center justify-center h-9 border border-[var(--color-border)] rounded-[var(--radius-container)] bg-[var(--color-background-card)] text-[var(--color-text-secondary)] [font-family:inherit] cursor-pointer [@media(hover:hover)]:hover:border-[var(--color-border-emphasized)] [@media(hover:hover)]:hover:text-[var(--color-text-primary)] aria-selected:border-[var(--color-accent)] aria-selected:bg-[var(--color-accent)] aria-selected:text-[var(--color-on-accent)]',
} as const;

function FruitRipenessGrid({
  value,
  onChange,
}: {
  value: FruitValue;
  onChange: (value: FruitValue) => void;
}) {
  const {gridRef, handleKeyDown, handleFocus, focusCell} =
    useGridFocus<HTMLDivElement>({
      columns: ripenessLevels.length,
      cellSelector: GRID_CELL_SELECTOR,
      hasRovingTabIndex: true,
    });

  useEffect(() => {
    const rowIndex = fruits.findIndex(f => f.id === value.fruit);
    const columnIndex = ripenessLevels.findIndex(l => l.id === value.ripeness);
    requestAnimationFrame(() => {
      focusCell(
        rowIndex >= 0 && columnIndex >= 0
          ? rowIndex * ripenessLevels.length + columnIndex
          : 0,
      );
    });
  }, [focusCell, value]);

  return (
    <div
      ref={gridRef}
      role="grid"
      aria-label="Fruit ripeness choices"
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      className={styles.grid}>
      {fruits.map(fruit => (
        <div key={fruit.id} role="row" className={styles.row}>
          <div role="rowheader" className={styles.rowHeader}>
            <span aria-hidden="true" className={styles.emoji}>
              {fruit.emoji}
            </span>
            <span className={styles.fruitText}>
              <Text type="body">{fruit.id}</Text>
              <Text type="supporting" color="secondary">
                {fruit.description}
              </Text>
            </span>
          </div>
          {ripenessLevels.map(level => {
            const isSelected =
              value.fruit === fruit.id && value.ripeness === level.id;
            return (
              <button
                key={`${fruit.id}-${level.id}`}
                type="button"
                role="gridcell"
                aria-label={`${fruit.id}, ${level.id}: ${level.description}`}
                aria-selected={isSelected || undefined}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => onChange({fruit: fruit.id, ripeness: level.id})}
                className={styles.cell}>
                {level.shortLabel}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function ComplexSelectorShowcase() {
  const [value, setValue] = useState<FruitValue>({
    fruit: 'Apple',
    ripeness: 'Juicy',
  });

  return (
    <ComplexSelector<FruitValue>
      label="Fruit blend"
      description="Choose a fruit and ripeness in one control. Arrow keys move across the grid."
      value={value}
      onChange={setValue}
      triggerLabel={`${value.fruit} · ${value.ripeness}`}
      controlStyle={{width: 280}}>
      {(selectedValue, onChange, close) => (
        <FruitRipenessGrid
          value={selectedValue}
          onChange={nextValue => {
            onChange(nextValue);
            close();
          }}
        />
      )}
    </ComplexSelector>
  );
}
