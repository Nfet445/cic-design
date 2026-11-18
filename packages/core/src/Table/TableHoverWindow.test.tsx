// Copyright (c) Meta Platforms, Inc. and affiliates.
/** Virtual stripes retain the same hover motion on each logical parity. */
import {cleanup, render} from '@testing-library/react';
import {afterEach, describe, it} from 'vitest';
import {Table} from './Table';
import {useTableRowsVirtualization} from './plugins/virtualization/useTableRowsVirtualization';
import {expectClassSet} from '../__tests__/classNameAssertions';
const TRANSITION_CLASSES = [
  'transition-[background-color]',
  'duration-[var(--duration-fast)]',
  'ease-[var(--ease-standard)]',
];
const data = Array.from({length: 20}, (_, i) => ({
  id: String(i),
  name: `Item ${i}`,
}));
const columns = [{key: 'name', header: 'Name'}];
function Fixture() {
  const virtualization = useTableRowsVirtualization({
    rowHeight: 56,
    initialViewportHeight: 240,
  });
  return (
    <>
      <Table data={data} columns={columns} idKey="id" hasHover isStriped />
      <Table
        data={data}
        columns={columns}
        idKey="id"
        hasHover
        isStriped
        virtualization={virtualization}
      />
    </>
  );
}
afterEach(cleanup);
describe('Table windowed hover parity', () => {
  it('preserves each row background transition regardless of logical parity', () => {
    const {container} = render(<Fixture />);
    const tables = container.querySelectorAll('table');
    // The transition is a utility triple and jsdom does not load the sheet that
    // declares it, so parity is read from the class set every row carries.
    expectClassSet(tables[0].querySelector('tbody tr')!, {
      includes: TRANSITION_CLASSES,
    });
    for (const row of tables[1].querySelectorAll(
      'tbody tr:not([aria-hidden])',
    )) {
      expectClassSet(row, {includes: TRANSITION_CLASSES});
    }
  });
});
