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
- [ ] Hold the size budget before the family is called done: the family's
      built sheet is 18 491 B (3 229 B gzip, 232 rules) against 9 087 B
      (1 662 B gzip, 77 rules) of StyleX rules for the same eight files, 2.03×
      raw and 1.94× gzip. The measurements point at candidate scope, not at
      the utilities: scanning only the class maps produces 119 rules and
      7 600 B, which is smaller than the StyleX baseline, but misses the two
      literal strings `GridSpan` still holds in its own file. Move those into
      a class map, then point the build at the maps and record the resulting
      budget.
- [x] A build of the same sources twice writes the same sheet: 232 rules,
      18 491 B, inside `@layer astryx-base`. Automatic source detection is off
      (`source(none)`), and its absence had grown the sheet to 187 kB of
      utilities harvested from unrelated text.
- [ ] Add the stylesheet test that asserts one rule's declaration (FR8), so
      the class-set tests do not stand alone.

### Phase 3 — The records say what the code does

- [ ] Supersede `architecture:component-style-authoring` with a record whose
      INVs state FR1, FR3, FR5, and FR6 as the pipeline rule.
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

| Phase | Contract                                | Evidence                                                                                           |
| ----- | --------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 1     | `spec:AST-119/FR1`, `spec:AST-080/FR3`  | `node packages/core/scripts/build-css-tailwind.mjs` writes a file whose rules sit in `astryx-base` |
| 2     | `spec:AST-119/FR3`, `FR5`, `FR7`, `FR8` | `vitest run packages/core/src/Stack packages/core/src/Grid packages/core/src/Center` — 118 tests   |
| 2     | `spec:AST-119/FR5`                      | A consumer `xstyle` and an `@media` rule override `width` and the track template in the browser    |
| 2     | Size budget                             | The family's built bytes and gzip bytes next to its StyleX bytes, in the pull request              |
| 3     | `pnpm check:knowledge`                  | Every amended record validates; the superseded one names its replacement                           |
| 4     | `spec:AST-119/FR4`, `FR6`               | Light and dark theme screenshots per family; hover under a fine and a coarse pointer               |
| 5     | `spec:AST-119/FR9`                      | A generated template renders styled from the stylesheet alone                                      |
| 6     | `spec:AST-119/FR1`                      | `pnpm install` with no `@stylexjs` dependency and a green `pnpm build`                             |

## Status

- Current phase: `2` — the family proof is implemented and green; the size
  budget and the stylesheet test remain.
- Blockers: `spec:AST-119` needs owner approval; OQ1 and OQ3 change the
  consumer story and must settle before Phase 5; OQ2 decides whether FR8's
  class set is a promise.
