// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The buttons check page: its fixture and the values it asserts.
 * @input The Button family's size, padding and icon-only classes, and the
 *   values their tokens carry.
 * @output `family`, `checks` and `FamilyPage`; render-pages.ts renders the page
 *   to buttons.html beside this file.
 * @position internal/vibe-tests/environments/project-astryx-tailwind/pages/
 *   buttons.tsx
 *
 * The heights floor at a size token instead of a fixed length, so the check
 * reads the token: that floor is the height a reviewer measures, because one
 * line of label text stays under it.
 */

import {Button} from '@astryxdesign/core/Button';
import {Stack} from '@astryxdesign/core/Stack';
import {CheckPage} from '../../../src/check-page';
import type {Check, ResolvedCheck} from '../../../src/check-values';

export const family = 'buttons';

export const checks: Check[] = [
  {
    id: 'button-md-height',
    element: 'button-md',
    property: 'height',
    expected: '32px',
    source: {
      kind: 'class',
      className: 'h-[max(var(--size-element-md),1lh)]',
      floor: '--size-element-md',
    },
    note: 'The md height never drops below the md size token, which is 32px.',
  },
  {
    id: 'button-lg-height',
    element: 'button-lg',
    property: 'height',
    expected: '36px',
    source: {
      kind: 'class',
      className: 'h-[max(var(--size-element-lg),1lh)]',
      floor: '--size-element-lg',
    },
    note: 'The lg height never drops below the lg size token, which is 36px.',
  },
  {
    id: 'button-md-padding-block',
    element: 'button-md',
    property: 'padding-block',
    expected: '8px',
    source: {kind: 'class', className: 'py-[var(--spacing-2)]'},
  },
  {
    id: 'button-md-padding-inline',
    element: 'button-md',
    property: 'padding-inline',
    expected: '12px',
    source: {kind: 'class', className: 'px-[var(--spacing-3)]'},
  },
  {
    id: 'button-md-gap',
    element: 'button-md',
    property: 'gap',
    expected: '8px',
    source: {kind: 'class', className: 'gap-[var(--spacing-2)]'},
    note: 'The gap between the icon and the label is two spacing steps.',
  },
  {
    id: 'button-icon-md-height',
    element: 'button-icon-md',
    property: 'height',
    expected: '32px',
    source: {kind: 'class', className: 'h-[var(--size-element-md)]'},
    note: 'An icon-only button drops the line-height floor and uses the token alone.',
  },
  {
    id: 'button-icon-md-aspect',
    element: 'button-icon-md',
    property: 'aspect-ratio',
    expected: '1/1',
    source: {
      kind: 'class',
      className: 'aspect-[var(--button-icon-only-aspect)]',
    },
    note: 'The square aspect makes the 32px height its width as well.',
  },
];

export function Fixture() {
  return (
    <Stack direction="horizontal" gap={3} data-astryx-value="button-shelf">
      <Button
        label="Save changes"
        size="md"
        variant="primary"
        data-astryx-value="button-md"
      />
      <Button
        label="Save changes"
        size="lg"
        variant="secondary"
        data-astryx-value="button-lg"
      />
      <Button
        label="Settings"
        size="md"
        variant="ghost"
        isIconOnly
        icon={<span aria-hidden="true">*</span>}
        data-astryx-value="button-icon-md"
      />
    </Stack>
  );
}

export function FamilyPage({rows}: {rows: ResolvedCheck[]}) {
  return (
    <CheckPage
      title="family:buttons"
      intro="Button at its md and lg heights, plus the icon-only square, rendered by renderToStaticMarkup from this page's module. The table reads each value from the built Tailwind and StyleX sheets."
      rows={rows}>
      <Fixture />
    </CheckPage>
  );
}
