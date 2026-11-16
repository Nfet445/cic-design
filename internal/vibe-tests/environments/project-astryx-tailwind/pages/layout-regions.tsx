// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The layout-regions check page: its fixture and the values it says.
 * @input The layout regions Section and Toolbar, and the values their classes
 *   and inline variables carry.
 * @output `family`, `checks` and `FamilyPage`; render-pages.ts renders the page
 *   to layout-regions.html beside this file.
 * @position internal/vibe-tests/environments/project-astryx-tailwind/pages/
 *   layout-regions.tsx
 *
 * Each value here was measured once in a browser. From then on the test reads
 * it back from the built sheets, so a token or class change that moves it
 * fails without a browser.
 */

import {Section} from '@astryxdesign/core/Section';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {CheckPage} from '../../../src/check-page';
import type {Check, ResolvedCheck} from '../../../src/check-values';

export const family = 'layout-regions';

export const checks: Check[] = [
  {
    id: 'section-width-variable',
    element: 'section-sized',
    property: '--astryx-section-width',
    expected: '320px',
    source: {kind: 'variable', name: '--astryx-section-width'},
    note: 'A width prop travels in a custom property, so a consumer rule still wins.',
  },
  {
    id: 'section-width-class',
    element: 'section-sized',
    property: 'width',
    expected: '320px',
    source: {kind: 'class', className: 'w-[var(--astryx-section-width)]'},
    note: 'The class reads the variable, so the two cannot drift apart.',
  },
  {
    id: 'section-padding-escape',
    element: 'section-nested',
    property: 'margin-inline-start',
    expected: 'calc(-1 * 16px)',
    source: {
      kind: 'class',
      className: 'ms-[calc(-1*var(--container-padding-inline-start,0px))]',
    },
    note: 'A nested section pulls itself out by the container padding its parent publishes; this fixture publishes 16px.',
  },
  {
    id: 'toolbar-min-height',
    element: 'toolbar-row',
    property: 'min-height',
    expected: '28px',
    source: {kind: 'class', className: 'min-h-[var(--size-element-sm)]'},
    note: 'The row keeps one element height, so its controls stay on one line.',
  },
  {
    id: 'toolbar-gap',
    element: 'toolbar-row',
    property: 'gap',
    expected: '4px',
    source: {kind: 'class', className: 'gap-1'},
    note: 'One spacing step separates the lanes and the controls inside them.',
  },
  {
    id: 'toolbar-tab-indicator',
    element: 'toolbar-row',
    property: '--_tab-indicator-bottom',
    expected: 'calc(-1 * (0.5rem + 1px))',
    source: {
      kind: 'class',
      className: '[--_tab-indicator-bottom:calc(-1*(var(--spacing-2)+1px))]',
    },
    note: 'A bottom divider drops a nested tab indicator through the block padding onto its rail.',
  },
  {
    id: 'toolbar-row-wraps',
    element: 'toolbar-row',
    property: 'flex-wrap',
    expected: 'wrap',
    source: {kind: 'class', className: 'flex-wrap'},
    note: 'A row that does not fit wraps its lanes instead of clipping them.',
  },
];

export function Fixture() {
  return (
    <>
      <div className="shelf">
        <Section variant="muted" width={320} data-astryx-value="section-sized">
          Section
        </Section>
        <Section
          padding={4}
          style={{'--container-padding-inline-start': '16px'}}
          data-astryx-value="section-nested">
          Nested section
        </Section>
      </div>
      <div className="shelf">
        <Toolbar
          label="Regions"
          dividers={['bottom']}
          data-astryx-value="toolbar-row"
          startContent={<span>Start</span>}
          centerContent={<span>Center</span>}
          endContent={<span>End</span>}
        />
      </div>
    </>
  );
}

export function FamilyPage({rows}: {rows: ResolvedCheck[]}) {
  return (
    <CheckPage
      title="family:layout-regions"
      intro="Section and Toolbar, rendered by renderToStaticMarkup from this page's module. The table reads each value from the built Tailwind and StyleX sheets."
      rows={rows}>
      <Fixture />
    </CheckPage>
  );
}
