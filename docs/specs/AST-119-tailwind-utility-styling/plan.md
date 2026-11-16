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
      file itself carries, rather than a neighbouring stub.
- [ ] Cache the stylesheet build per component file, as the StyleX build
      caches per module, so a full build does not rescan 1202 files.

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
- [ ] Amend `spec:AST-080` for the second stylesheet: its export, its layer
      order, and the import contract.
- [ ] Approve `spec:AST-119`, which this plan tracks.

### Phase 4 — Family waves

Each wave is one pull request per family, with its own tests and a browser
check of the family's states.

- [ ] Wave 1: `family:layout-regions` and `family:layout-primitives` siblings
      that read the same padding and gap vocabulary (Layout, LayoutPanel,
      AppShell regions).
- [ ] Wave 2: `family:buttons` and `family:action-groups`, the first states
      with hover, press, and focus.
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
- [ ] Wave 3: `family:input-fields` and the selection controls, the first
      form-control markers and `data-*` targets.
- [ ] Wave 4: `family:navigation-destinations` and `family:overlay-dismissal`,
      the first portal and layer-root styling.
- [ ] Wave 5: `packages/charts` and `packages/richtext`, then `packages/lab`.
- [ ] Wave 6: `packages/themes`, which keeps its build and only renames the
      bridge it exports.

### Phase 5 — The consumer surface follows

- [ ] `packages/cli` templates, blocks, and `assets/docs` emit utility classes
      and document `astryx-tailwind.css`.
- [ ] `apps/storybook` loads the Tailwind stylesheet, so a story shows the
      class-backed declarations.
- [ ] `internal/vibe-tests` reads the migrated components from the Tailwind
      environment, which already loads the stylesheet.
- [ ] `astryx swizzle` output states which stylesheet a swizzled component
      needs (OQ4).

### Phase 6 — StyleX leaves

- [ ] `@stylexjs/*` leaves `packages/core`, `packages/lab`, `packages/charts`,
      `packages/richtext`, and `packages/build`.
- [ ] `scripts/build-css.mjs` and the StyleX transform retire for a migrated
      package.
- [ ] `astryx.css` retires or stays per OQ1, and every import of it in the
      repository changes.

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

- Current phase: `4` — wave 2 is done, wave 3 is next. The layout family
  proved the contract; all five of `family:buttons` are settled, four of them
  migrated, and the whole sheet still fits the budget the stylesheet test
  enforces.
- Blockers: `spec:AST-119` and the two amendments need owner approval; OQ1 and
  OQ3 change the consumer story and must settle before Phase 5; OQ2 decides
  whether FR8's class set is a promise.
