// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The layout-primitives check page: its fixture and the values it says.
 * @input The layout primitives Stack, Grid and Center, and the values their
 *   classes and inline variables carry.
 * @output `family`, `checks` and `FamilyPage`; render-pages.ts renders the page
 *   to layout-primitives.html beside this file.
 * @position internal/vibe-tests/environments/project-astryx-tailwind/pages/
 *   layout-primitives.tsx
 *
 * Each value here was measured once in a browser. From then on the test reads
 * it back from the built sheets, so a token or class change that moves it
 * fails without a browser.
 */

import {Center} from '@astryxdesign/core/Center';
import {Grid} from '@astryxdesign/core/Grid';
import {Stack} from '@astryxdesign/core/Stack';
import {CheckPage} from '../../../src/check-page';
import type {Check, ResolvedCheck} from '../../../src/check-values';

export const family = 'layout-primitives';

export const checks: Check[] = [
  {
    id: 'stack-gap',
    element: 'stack-row',
    property: 'gap',
    expected: '8px',
    source: {kind: 'class', className: 'gap-2'},
    note: 'Two spacing steps are half a rem, so 8px at the default root size.',
  },
  {
    id: 'stack-padding-inline-start',
    element: 'stack-padded',
    property: 'padding-inline-start',
    expected: '16px',
    source: {kind: 'class', className: 'ps-4'},
    note: 'A logical edge keeps the padding on the start side in RTL.',
  },
  {
    id: 'stack-padding-block-start',
    element: 'stack-block-padded',
    property: 'padding-block-start',
    expected: '16px',
    source: {
      kind: 'class',
      className: '[padding-block-start:var(--spacing-4)]',
    },
    note: 'The block axis has no theme scale, so the class names the property.',
  },
  {
    id: 'grid-template-columns-variable',
    element: 'grid-tracks',
    property: '--astryx-grid-template-columns',
    expected: 'repeat(3, 1fr)',
    source: {kind: 'variable', name: '--astryx-grid-template-columns'},
    note: 'Three fixed tracks, written on the element so a rule can override them.',
  },
  {
    id: 'grid-template-columns-class',
    element: 'grid-tracks',
    property: 'grid-template-columns',
    expected: 'repeat(3, 1fr)',
    source: {
      kind: 'class',
      className: 'grid-cols-[var(--astryx-grid-template-columns)]',
    },
    note: 'The class reads the variable, so the two cannot drift apart.',
  },
  {
    id: 'center-width',
    element: 'center-box',
    property: 'width',
    expected: '300px',
    source: {kind: 'class', className: 'w-[var(--astryx-center-width)]'},
  },
  {
    id: 'center-height',
    element: 'center-box',
    property: 'height',
    expected: '120px',
    source: {kind: 'class', className: 'h-[var(--astryx-center-height)]'},
    note: 'The centre is 300 by 120 and centres its child on both axes.',
  },
];

export function Fixture() {
  return (
    <>
      <div className="shelf">
        <Stack direction="horizontal" gap={2} data-astryx-value="stack-row">
          <div className="box" />
          <div className="box" />
          <div className="box" />
        </Stack>
        <Stack
          direction="vertical"
          paddingInlineStart={4}
          data-astryx-value="stack-padded">
          <div className="box" />
          <div className="box" />
        </Stack>
        <Stack
          direction="vertical"
          paddingBlockStart={4}
          data-astryx-value="stack-block-padded">
          <div className="box" />
        </Stack>
      </div>
      <div className="shelf">
        <Grid columns={3} gap={2} data-astryx-value="grid-tracks">
          <div className="box" />
          <div className="box" />
          <div className="box" />
          <div className="box" />
          <div className="box" />
          <div className="box" />
        </Grid>
        <Center width={300} height={120} data-astryx-value="center-box">
          <div className="box" />
        </Center>
      </div>
    </>
  );
}

export function FamilyPage({rows}: {rows: ResolvedCheck[]}) {
  return (
    <CheckPage
      title="family:layout-primitives"
      intro="Stack, Grid and Center, rendered by renderToStaticMarkup from this page's module. The table reads each value from the built Tailwind and StyleX sheets."
      rows={rows}>
      <Fixture />
    </CheckPage>
  );
}
