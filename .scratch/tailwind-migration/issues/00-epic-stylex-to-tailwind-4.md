# Epic: StyleX → Tailwind 4

Status: ready-for-agent
Type: task
Blocked by: —
Wave: all
Tickets: 01–36
Contract: `spec:AST-119` (`docs/specs/AST-119-tailwind-utility-styling/spec.md`)
Phase map: `docs/specs/AST-119-tailwind-utility-styling/plan.md`
Rules: `.scratch/tailwind-migration/README.md`
Index: `.scratch/tailwind-migration/map.md`

## What

Move every component of `@astryxdesign/core`, `@astryxdesign/lab`,
`@astryxdesign/charts` and `@astryxdesign/richtext` from StyleX atoms to
Tailwind 4 utilities that a per-package build compiles into one stylesheet in
`@layer astryx-base`, then remove StyleX from the repository. The public props,
`xstyle`, `className` and `style` keep working throughout, and `xstyle` stays
unlayered, so consumer rules still win.

Waves 1–2 are done and sit in pull request #1: `family:layout-primitives` and
`family:buttons`. The epic is closed when its last child ticket is closed and
`pnpm install` resolves no `@stylexjs` package.

## Rules of engagement

- One child ticket, one worker, one pull request, one changeset.
- Start a ticket only when its `Blocked by:` line is satisfied.
- The five done criteria, the gzip gate (`1.15 ×` the StyleX baseline at
  `f35022021`), the revert policy and the deprecation window are in
  `.scratch/tailwind-migration/README.md`; they are decisions, not suggestions.
- The records owner (`cixzhang`) reviews every wave; records amend in the same
  pull request.
- `packages/native` and `packages/vega` are out of scope: neither imports
  StyleX, and Tailwind CSS does not apply to React Native. `packages/themes` is
  touched only in the shape of the CSS it emits.

## Children

Progress: 41 of 50 tickets done, plus two waves (layout primitives,
buttons) that landed before the tickets were written.

### Wave 0 — the harness

- [x] `01-stylesheet-build-cache` — cache the sheet build per class map
- [x] `02-test-harness` — shared class assertions, per-package sheet test, gzip gate
- [x] `03-browser-check-pages` — checked-in pages and fixtures per family
- [x] `04-css-export-types` — a declaration the stylesheet itself carries

### Wave 3 — shared infrastructure and `family:layout-regions`

- [x] `05-tokens` — 18 `defineVars` become `tokens.css` plus a shim, 251 importers follow
- [x] `06-theme-modules` — data tokens, derived registry, `defineTheme`, colour modes
- [ ] `07-private-attributes` — markers and variables, 26 `.stylex.ts` files
- [x] `08-icon` — `Icon/` and the `IconSize` contract
- [x] `09-text` — the typography vocabulary every family reads
- [x] `10-indicator` — indicator states over the new marker path
- [x] `11-layer-hooks-utils` — layer plumbing, hooks, focus ring, interaction overlay
- [x] `12-layout-regions` — `Layout/`, its regions and `AppShell`
- [x] `13-section-toolbar` — `Section/`, `Toolbar/`, family closed

### Wave 4 — `family:input-fields` in three pull requests

- [x] `14-field-and-text-inputs` — `Field`, `TextInput`, `TextArea`, `NumberInput`, `FileInput`
- [x] `15-choice-inputs` — `Selector`, `MultiSelector`, `ComplexSelector`, `Typeahead`
- [x] `16-date-inputs` — `DateInput`, `DateRangeInput`, `DateTimeInput`, `TimeInput`

### Wave 5 — the shared style modules

- [x] `17-shared-stylex-modules` — `xstyle` becomes the only StyleX input left

### Wave 6 — `family:navigation-destinations`

- [ ] `18-links-and-items` — links, rows, avatars, pagination, cards
- [x] `19-tabs-and-headings` — `TabList`, nav tabs, tab menus, `SegmentedControl`
- [x] `20-side-nav` — `SideNav`, `TreeList`, the size cascade
- [x] `21-top-nav` — `TopNav` and its mega menus

### Wave 7 — `family:overlay-dismissal` and `family:action-groups`

- [x] `22-dialogs-and-sheets` — `Dialog`, `AlertDialog`, `Drawer`, `BottomSheet`, `MobileNav`, `Lightbox`
- [ ] `23-menus` — `DropdownMenu`, `ContextMenu`, `MoreMenu`, option menus
- [x] `49-overflow-and-gesture` — scroll shadows, overflow measurement, swipe, resize
- [x] `50-bottom-sheet-host` — the `BottomSheet` host and `Lightbox`, split out of ticket 22 because their tests own about twenty computed-style reads
- [x] `24-tooltip-hovercard` — `Tooltip`, `HoverCard`
- [x] `25-search-surfaces` — `CommandPalette`, `PowerSearch`, `Tokenizer`, composer popup

### Wave 8 — the data surfaces

- [x] `26-data-tables-record` — write `docs/families/data-tables.md` first
- [x] `27-table-structure` — header, rows, cells
- [x] `28-table-behaviour` — sorting, filtering, selection, virtualised body
- [x] `29-charts-and-richtext` — two packages get their own sheets
- [ ] `30-lab` — 58 creations in two halves
- [x] `46-display-and-feedback` — Card, Divider, Markdown, Code, Spinner, Toast, Carousel
- [x] `47-form-controls-and-leftovers` — Switch, Checkbox, Radio, Slider, Stepper, and the family leftovers
- [x] `48-chat-surface` — thirteen files and twenty-three creations

### Wave 9 — themes, consumers, removal

- [x] `31-themes` — the bridge keeps its names, only its shape changes
- [x] `32-cli-docs-and-templates` — consumer styling docs stop teaching StyleX
- [ ] `45-template-pages-and-blocks` — the shipped page and block templates become class-based
- [ ] `33-storybook-and-vibe-tests` — both load the sheet
- [x] `34-swizzle-and-render-pipeline` — ejected source states its stylesheet
- [ ] `35-deprecate-stylex-subpaths` — 80 export entries, one release
- [x] `37-table-row-and-cell` — row and body cell
- [x] `38-data-token-sheet` — 56 data tokens get their own sheet
- [x] `39-layout-regions-page` — a check page that does not contradict the classes
- [x] `40-integration-regressions` — repair the wave's merged failures
- [ ] `41-shared-modules-after-consumers` — the seven creations whose consumers own the property
- [x] `42-table-plugin-styles` — the table plugins and the cells they borrow
- [x] `43-full-suite-green` — the full core suite back to its known-failing count
- [ ] `36-remove-stylex` — `@stylexjs` leaves the repository

## Done when

- Every child is `done`, and the waves were released in order, one release each.
- `pnpm install` resolves no `@stylexjs` package and `pnpm build` is green
  without the StyleX build.
- No package ships a stylesheet whose rules sit outside `astryx-base`, and each
  package's sheet test holds the gzip gate.
- `spec:AST-119` is `current`, `architecture:component-style-authoring` and
  `spec:AST-080` describe the pipeline that actually runs, and the 80 `stylex`
  export entries are gone.

## Verification

- `pnpm build` and `pnpm exec vitest run packages/core/src` per wave; the 14
  ICU and Temporal failures that exist on `main` are the only expected ones.
- Each package's stylesheet test: class coverage, gzip gate, layer order.
- The browser check page of every migrated family, with its values recorded in
  the wave's pull request.
- `pnpm check:knowledge`, `pnpm check:changesets` and `pnpm review:pre` before
  every wave.

## Notes

- The epic does not carry work of its own: it exists so the tracker shows one
  umbrella with 36 children instead of 36 loose tickets.
- A new decision that changes the plan edits this file, `map.md` and the child
  ticket it affects, in one commit.
- OQ1 (the fate of `astryx.css`), OQ2 (whether the class set is a promise) and
  OQ4 (swizzle) stay open on `spec:AST-119`; OQ3 is answered: the consumer's
  `xstyle` stays unlayered.
