// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file inputFontFloor.test.ts
 * @input Uses node:fs and node:path to read the text-control sources, the
 *   class maps that state the floor, and the package's Tailwind build
 * @output Invariants for the 16px input floor shared by every text control
 * @position Family-wide source and sheet test, in the source-reading style of
 *   reset.test.ts. jsdom's CSSOM drops declarations nested inside @supports,
 *   so the iOS branch cannot be asserted against injected rules; the runtime
 *   half (`TextInput.test.tsx`) asserts only the ungated class it must not
 *   carry.
 */

import {readFileSync, readdirSync} from 'node:fs';
import path from 'node:path';

import {beforeAll, describe, expect, it} from 'vitest';

import {buildAstryxTailwindCss} from '../scripts/build-css-tailwind.mjs';
import {stylesheetOf, type Stylesheet} from './__tests__/classNameAssertions';

/**
 * Every text control that floors its text to 16px, named by the file that
 * states the floor. iOS Safari zooms the page when a focused control renders
 * under 16px; no other coarse-pointer browser does. `-webkit-touch-callout` is
 * implemented by iOS WebKit alone, so each floor nests
 * `@supports (-webkit-touch-callout: none)` inside the coarse-pointer query:
 * iPhones and iPads keep the zoom guard, while Android and touch laptops keep
 * the theme's own type scale instead of an inflated 16px.
 *
 * A migrated control states the floor as a utility class string in its class
 * map; a control still on StyleX states it as a declaration in its own source.
 * Both forms are read the same way, so a control moves between them without
 * leaving the list.
 */
const FLOORED_FLOOR_FILES = [
  // Migrated: the class map carries the utility.
  'DateInput/dateInputClasses.ts',
  'DateRangeInput/dateRangeInputClasses.ts',
  'DateTimeInput/dateTimeInputClasses.ts',
  'FileInput/fileInputClasses.ts',
  'TextArea/textAreaClasses.ts',
  'TextInput/textInputClasses.ts',
  'TimeInput/timeInputClasses.ts',
  'Chat/chatClasses.ts',
  'CommandPalette/commandPaletteInputClasses.ts',
  'Field/panelSearchInputClasses.ts',
  'Typeahead/typeaheadClasses.ts',
  'NumberInput/numberInputClasses.ts',
  // Still on StyleX: the component source carries the declaration.
  'ComplexSelector/ComplexSelector.tsx',
  'DateTimeInput/nativePickerSegmentClasses.ts',
  'Selector/Selector.tsx',
  // The rich-text package carries the same floor; its path is relative to
  // packages/core/src.
  '../../richtext/src/richTextEditorClasses.ts',
];

/** The utility class that states the floor, both variants in order. */
const IOS_GATED_CLASS_FLOOR =
  /pointer-coarse:\[@supports\(-webkit-touch-callout:none\)\]:text-\[length:max\(1rem,var\(--text-(?:body|label)-size\)\)\]/;

/** The same floor as a StyleX declaration: the coarse query's only member. */
const IOS_GATED_STYLEX_FLOOR =
  /'@media \(pointer: coarse\)': \{\s*'@supports \(-webkit-touch-callout: none\)': ['`]max\(1rem, (?:var\(--text-(?:body|label)-size\)|\$\{typeScaleVars\['--text-(?:body|label)-size'\]\})\)['`]/;

/**
 * A floor every coarse pointer gets, iOS or not: the regression both forms can
 * introduce, by dropping the support query that gates them.
 */
const BARE_COARSE_FLOORS = [
  "'@media (pointer: coarse)': `max(1rem",
  'pointer-coarse:text-[length:max(1rem',
];

/** The class the migrated controls ship, spelled with its floored size. */
const SHIPPED_FLOOR_CLASS =
  'pointer-coarse:[@supports(-webkit-touch-callout:none)]:text-[length:max(1rem,var(--text-body-size))]';

/** Collect every non-test component source under `dir`, recursively. */
function componentSources(dir: string): string[] {
  const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
  const out: string[] = [];
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...componentSources(full));
    } else if (
      SOURCE_EXTENSIONS.some(ext => entry.name.endsWith(ext)) &&
      !entry.name.endsWith('.test.ts') &&
      !entry.name.endsWith('.test.tsx') &&
      !entry.name.endsWith('.doc.mjs')
    ) {
      out.push(full);
    }
  }
  return out;
}

describe('the 16px input floor', () => {
  it('gates every floored text control to iOS alone', () => {
    // Guards the loop below against the list silently emptying out.
    // Sixteen files carry the floor: one class map per floored control, and
    // the rich-text editor. The count fell from eighteen when the date and
    // typeahead fields moved their declarations into the maps that their
    // siblings already shared.
    expect(FLOORED_FLOOR_FILES.length).toBeGreaterThanOrEqual(16);
    for (const file of FLOORED_FLOOR_FILES) {
      const source = readFileSync(path.resolve(__dirname, file), 'utf8');
      expect(
        IOS_GATED_CLASS_FLOOR.test(source) ||
          IOS_GATED_STYLEX_FLOOR.test(source),
        file,
      ).toBe(true);
      for (const bare of BARE_COARSE_FLOORS) {
        expect(source, file).not.toContain(bare);
      }
    }
  });

  it('leaves no bare coarse-pointer font floor anywhere in core or richtext', () => {
    // Catches a new (or renamed) control reintroducing the ungated floor,
    // wherever it lands — the list above only knows the current family. The
    // rich-text package carries the same floor, so it is scanned too.
    const scanRoots = [
      __dirname,
      path.resolve(__dirname, '../../richtext/src'),
    ];
    const offenders = scanRoots
      .flatMap(root => componentSources(root))
      .map(file => ({
        file,
        source: readFileSync(file, 'utf8'),
      }))
      .filter(({source}) =>
        BARE_COARSE_FLOORS.some(bare => source.includes(bare)),
      )
      .map(({file}) => path.relative(__dirname, file));
    expect(offenders).toEqual([]);
  });

  describe('the built sheet', () => {
    let stylesheet: Stylesheet;

    beforeAll(async () => {
      stylesheet = stylesheetOf(await buildAstryxTailwindCss());
    });

    it('ships the floor under the coarse query only where iOS implements the gate', () => {
      // What the browser reads: the coarse query, then the iOS support query,
      // then the floor. The class map states the same two variants in order;
      // this pins the rule the build compiles from it, so a dropped gate would
      // floor every touch device.
      expect(stylesheet.blockOf(SHIPPED_FLOOR_CLASS)).toBe(
        '@media(pointer:coarse){@supports(-webkit-touch-callout:none){font-size:max(1rem,var(--text-body-size));}}',
      );
    });

    it('floors no text on a coarse pointer alone', () => {
      expect(stylesheet.compact).not.toMatch(
        /@media\(pointer:coarse\)\{font-size:max\(1rem/,
      );
    });
  });
});
