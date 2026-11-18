---
schema_version: 1
template_version: 1
kind: implementation-plan
id: plan:AST-119
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
spec: spec:AST-119
owners: [cixzhang]
---

# StyleX to Tailwind 4 implementation plan

## Phases

### Phase 1 — The stylesheet exists and the build accepts it

- [x] `packages/core/tailwind/astryx.input.css` imports
      `tailwindcss/utilities.css` into `layer(astryx-base)`, imports the theme
      bridge, and names the library sources with `@source`.
- [x] `packages/core/scripts/build-css-tailwind.mjs` writes
      `dist/astryx-tailwind.css` with the package banner.
- [x] `packages/core/package.json` exports `./astryx-tailwind.css` and runs the
      Tailwind build after the StyleX build in `build:css`.
- [ ] Point the `./astryx-tailwind.css` export's `types` at a declaration the
      file itself carries, rather than a neighbouring stub (ticket 04).
- [ ] Cache the stylesheet build per component file, as the StyleX build
      caches per module, so a full build does not rescan 1202 files
      (ticket 01).

### Phase 2 — One family proves the contract

- [x] `family:layout-primitives` members use Tailwind classes:
      `Stack/stackClasses.ts`, `Stack/stackItemClasses.ts`,
      `Grid/gridClasses.ts`, `Center/centerClasses.ts`,
      `Layout/paddingClasses.ts`, and `src/utils/tw.ts` join them.
- [x] `xstyle` still merges last: every migrated component wraps it in
      `stylex.props(xstyle)` and passes the result through `mergeProps`.
- [x] Hold the size budget before the family is called done: the family's
      built sheet is 7 840 B (1 343 B gzip, 121 rules) against 9 087 B
      (1 662 B gzip, 77 rules) of StyleX rules for the same eight files, so the
      family is 14% smaller, not larger. The budget came from scope, not from
      the utilities: scanning the class maps alone produced 119 rules and
      7 600 B, and moving `GridSpan`'s two literal strings into
      `Grid/gridClasses.ts` let the build scan only `src/**/*Classes.ts`.
- [x] A build of the same sources twice writes the same sheet: 121 rules,
      7 840 B, inside `@layer astryx-base`. Automatic source detection is off
      (`source(none)`), and its absence had grown the sheet to 187 kB of
      utilities harvested from unrelated text.
- [x] Wrap the compiled utilities in the layer in the build: Tailwind 4.3.2
      prints `@import ... source(none) layer(astryx-base)` as
      `@media layer(astryx-base)`, which no browser reads as a layer, so the
      build adds `@layer astryx-base { … }` after the import.
- [x] Add the stylesheet test that asserts one rule's declaration (FR8):
      `src/Layout/tailwindStylesheet.source-build.test.mjs` builds the sheet in
      process, checks every class the maps can emit has a rule, pins three
      declarations, and fails on a layer printed as `@media layer(...)`.

### Phase 3 — The records say what the code does

- [x] Amend `architecture:component-style-authoring`: INV1 names the pipeline
      of the family instead of StyleX alone, INV3 covers a utility class as
      well as a StyleX atom, and the system model names both pipelines. The
      record keeps its id and its approvals; merging the pull request is the
      approval this amendment asks for, because a supersede needs an approved
      successor and would otherwise leave the repository with no current
      styling authority.
- [x] Amend `spec:AST-080` FR1 and FR3: a package ships a second stylesheet
      while both kinds of module remain, and that file registers the same
      layer order first.
- [x] Amend `spec:AST-080` for the second stylesheet: its export, its layer
      order, and the import contract. FR1 names the pair and the moment it
      ends; FR3 puts the migration sheet in `astryx-base` and requires it to
      register the same three layers first, then the consumer slots.
- [ ] Approve `spec:AST-119`, which this plan tracks.

### Phase 4 — Family waves

Each wave is one pull request per family, with its own tests and a browser
check of the family's states.

- [x] Waves 1-2: `family:layout-primitives`, the padding and gap vocabulary,
      then `family:buttons`, the first states with hover, press and focus.
  - [x] `Button` renders from `Button/buttonClasses.ts`: layout, variant,
        elevation, icon-only shape, group radius and border, press scale,
        forced-colors edge, and the loading keyframes. The shared modules it
        borrows (focus ring, interaction overlay, press layers, touch band)
        still lower through StyleX, so `xstyle` keeps its place in the merge.
        The button's own rules are 15 465 B (2 830 B gzip) against 13 926 B
        (2 767 B gzip) of StyleX rules for the same five files — 11% larger
        raw, 2% larger gzipped, because Tailwind prints one escaped selector
        per corner, side, and step where StyleX printed an atomic class.
  - [x] `ButtonGroup`, `ToggleButton`, and `ToggleButtonGroup` render from
        class maps (`buttonGroupClasses.ts`, `toggleButtonClasses.ts`,
        `toggleButtonGroupClasses.ts`). `IconButton` needed no change: it is a
        composition wrapper with no declaration of its own, and its size test
        reads the icon slot, which still lowers through StyleX.
  - [x] A state class that overrides a base declaration from another map uses
        a variant with specificity of its own (`aria-pressed:bg-…`) rather
        than a plain utility: both land in `astryx-base`, where the sheet
        order decides and Tailwind sorts `bg-[…]` before `bg-transparent`. The
        stylesheet test pins the one remaining order dependency, the label's
        semibold weight.
  - [x] A per-side border style utility does not exist (`border-s-solid`
        emits nothing), and none is needed: the base sets `border-solid`,
        which feeds `--tw-border-style`, and the side utilities read it. The
        coverage case in the stylesheet test found the dead classes; the
        grouped edge now carries width and colour only.
  - The whole sheet after wave 2: 25 273 B (4 072 B gzip), 251 selector
    rules.
    The remaining work is cut into tickets. The wave order, the size gate, the
    definition of done and the release and rollback rules live with them:
    [`map.md`](../../../.scratch/tailwind-migration/map.md) lists the 36 tickets and
    [`README.md`](../../../.scratch/tailwind-migration/README.md) states the rules a
    ticket must satisfy. A wave is one release, a ticket is one pull request.

- [ ] Wave 0 - the harness: build cache, shared class assertions, browser check
      pages, export declaration (tickets 01-04).
- [ ] Wave 3 - shared infrastructure (tokens, markers, `Icon`, `Text`,
      `Indicator`, `Layer`, hooks, utils) and `family:layout-regions`, which
      reads the vocabulary wave 1 proved (tickets 05-13).
- [ ] Wave 4 - `family:input-fields` in three pull requests: field and text
      inputs, choice inputs, date inputs (tickets 14-16).
- [ ] Wave 5 - the shared style modules that still hand StyleX objects to
      components, so `xstyle` becomes the only StyleX input left (ticket 17).
- [ ] Wave 6 - `family:navigation-destinations`: links and rows, tabs, side
      nav, top nav (tickets 18-21).
- [ ] Wave 7 - `family:overlay-dismissal` and `family:action-groups`, whose
      members are menus over the same layer (tickets 22-25).
- [ ] Wave 8 - `family:data-tables`, whose record is written first, then
      `packages/charts`, `packages/richtext` and `packages/lab`
      (tickets 26-30).
- [ ] Wave 9 - `packages/themes`, the consumer surfaces, the deprecated
      subpaths and the removal of StyleX (tickets 31-36).

### Phase 5 — The consumer surface follows

- [ ] `packages/cli` templates, blocks, and `assets/docs` emit utility classes
      and document `astryx-tailwind.css` (ticket 32).
- [ ] `apps/storybook` loads the Tailwind stylesheet, so a story shows the
      class-backed declarations (ticket 33).
- [ ] `internal/vibe-tests` reads the migrated components from the Tailwind
      environment, which already loads the stylesheet (ticket 33).
- [ ] `astryx swizzle` output states which stylesheet a swizzled component
      needs (OQ4, ticket 34).

### Phase 6 — StyleX leaves

- [ ] `@stylexjs/*` leaves `packages/core`, `packages/lab`, `packages/charts`,
      `packages/richtext`, and `packages/build` (ticket 36).
- [ ] `scripts/build-css.mjs` and the StyleX transform retire for a migrated
      package (ticket 36).
- [ ] `astryx.css` retires or stays per OQ1, and every import of it in the
      repository changes (ticket 36).

## Verification

| Phase | Contract                                | Evidence                                                                                                    |
| ----- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 1     | `spec:AST-119/FR1`, `spec:AST-080/FR3`  | `node packages/core/scripts/build-css-tailwind.mjs` writes a file whose rules sit in `astryx-base`          |
| 2     | `spec:AST-119/FR3`, `FR5`, `FR7`, `FR8` | `vitest run packages/core/src/Stack packages/core/src/Grid packages/core/src/Center` — 118 tests            |
| 2     | `spec:AST-119/FR5`                      | A consumer `xstyle` and an `@media` rule override `width` and the track template in the browser             |
| 2     | Size budget                             | The family's built bytes and gzip bytes next to its StyleX bytes, in the pull request                       |
| 3     | `pnpm check:knowledge`                  | Every amended record validates; the superseded one names its replacement                                    |
| 4     | `spec:AST-119/FR4`, `FR6`               | Light and dark theme screenshots per family; hover under a fine and a coarse pointer                        |
| 4     | Size budget                             | `Button`'s built rules next to its StyleX rules: 15 465 B against 13 926 B, 2 830 B against 2 767 B gzipped |
| 5     | `spec:AST-119/FR9`                      | A generated template renders styled from the stylesheet alone                                               |
| 6     | `spec:AST-119/FR1`                      | `pnpm install` with no `@stylexjs` dependency and a green `pnpm build`                                      |

## Status

- Current phase: `6` — StyleX leaves. Waves 1 and 2 landed on `main` in
  pull request #1; waves 3 through 8 are integrating on the migration trunk
  behind pull request #2, one merge commit per ticket.
- Done: 58 of the 63 tickets. Every family wave landed on the migration trunk
  except the removal stages: the sheet the trunk builds is 373.7 kB raw,
  42.5 kB gzipped and 2 300 rule blocks, and every package's sheet test holds
  its gate.
- Remaining: the five removal tickets. `59` moved the token names off the
  StyleX runtime; `60` deletes the last maps with the component-owned token
  modules under them; `61` retires the StyleX half of `packages/build` and
  `scripts/build-css.mjs`; `62` points `xstyle` at the Tailwind adapter that
  keeps its value unlayered; `63` writes the `breaking` changeset and the
  consumer notes.
- What stays on StyleX, each with a measured reason recorded in its ticket: the
  `ProgressBar` fill (four conditions at once, and Tailwind fixes the variant
  order), the two safe-area compositions, the three motion modules, the
  thumbnail override pair, the `Table` markers, and every seam that takes a
  StyleX-only argument until ticket `62` replaces it.
- The work is scheduled: 49 tickets over waves 0 and 3–9, each with its files,
  its `Blocked by:` line and its verification, in
  [`.scratch/tailwind-migration/`](../../../.scratch/tailwind-migration/map.md).
  `packages/native` and `packages/vega` are out of scope: neither imports
  StyleX, and Tailwind CSS does not apply to React Native.
- Blockers: `spec:AST-119` and the two amendments need owner approval, which
  every wave pull request carries; OQ1, OQ2 and OQ4 shape the consumer story
  and must settle before Phase 5. OQ3 is answered for this plan: the
  consumer's `xstyle` stays unlayered.
