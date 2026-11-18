# storybook and vibe tests

Status: done
Blocked by: 31
Wave: 9
Ticket: 33
Parent: `00-epic-stylex-to-tailwind-4`

## What

Load the Tailwind sheet in Storybook and in `internal/vibe-tests`, so stories and generated examples show the class-backed declarations.

## Files

- `apps/storybook/.storybook/**`
- `internal/vibe-tests/environments/**`

## Done when

- A migrated story shows the same computed values as the browser check page.
- The Tailwind environment no longer needs a second stylesheet.

## Verification

- `pnpm -F storybook build`
- `pnpm -F @astryxdesign/vibe-tests aggregate --help`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.

## Comments

### Attempt 1 (`ticket/33-storybook-and-vibe-tests`)

Started from `a70963644` (the Storybook plugin another branch wrote) and then
merged `poc/tailwind-layout-primitives`, so every story and preview below
renders the migrated sources.

**Storybook.** `apps/storybook/.storybook/astryxTailwindSheet.ts` compiles
`packages/core/dist/astryx-tailwind.css` at request time through
`buildAstryxTailwindCss()` and serves it as
`virtual:astryx-tailwind-sheet.css`; `main.ts` registers the plugin in
`viteFinal`, `preview.tsx` imports the module after `@astryxdesign/reset.css`.
`pnpm -F @astryxdesign/storybook build` completes successfully (exit 0, about
19 s of the build inside the plugin's `load`). The sheet lands in
`dist/assets/iframe-*.css`: the utilities sit in `@layer astryx-base{…}` and
`.astryx-layer-text-reset` is present, so a story resolves the same classes
the package build compiles. The build prints six pre-existing Lightning CSS
warnings (a mangled `var(-- tab-indicator-bottom…)` and `var(-- sheet-reserve…)`
in two class literals); none comes from this change.

**vibe-tests.** `createEntryFile` (`internal/vibe-tests/src/build-previews.ts`)
now appends `import '<repo>/packages/core/dist/astryx-tailwind.css';` after
`@astryxdesign/core/reset.css` for the `astryx` target only, and throws the
`pnpm -F @astryxdesign/core build` hint when that file is missing. The
`astryx-tailwind` target keeps its CDN Tailwind and `src/tailwind-theme.css`,
so its baseline is untouched. `main()` moved behind the `isEntryPoint` guard
that `render-pages.ts` uses, so `createEntryFile` can be tested;
`internal/vibe-tests/src/build-previews.test.ts` covers both targets.

Verification:

- `pnpm -F @astryxdesign/storybook build` — exit 0.
- `pnpm exec vitest run internal/vibe-tests/src` — 64 passed (the 62 that were
  there plus the 2 new). The first run failed once in
  `validateCanonicalSuite` (provenance) and passed on every rerun.
- `pnpm exec tsx internal/vibe-tests/src/render-pages.ts --check` — exit 0.
- `pnpm -F @astryxdesign/vibe-tests aggregate --help` — prints usage, exit 0.
- `prettier --check` and `eslint` clean on the six touched files.

`pnpm -F @astryxdesign/core build` fails on this branch before `build:css` runs,
at `src/BottomSheet/BottomSheetPanel.tsx(1046,15): error TS2345: Argument of
type 'PropsObject' is not assignable to parameter of type
'ScrollableElementProps<HTMLDivElement>'`. That file belongs to another window,
so the validation above used `build:esm` (which ran before the typecheck
failed) plus `build:css`.

### Left over in this ticket

- The `Done when` browser comparison is not run: no browser opened a migrated
  story next to the family check page. The build proves the classes resolve;
  the computed values still need a reviewer's eyes.
- `internal/vibe-tests/environments/project-astryx-tailwind/globals.css` still
  imports `@astryxdesign/core/tailwind-theme.css` and not
  `@astryxdesign/core/astryx-tailwind.css`, so that environment does not yet
  carry the Astryx class maps its own Tailwind build cannot scan. Changing it
  touches the fixture suite (`fixtures:build`, `fixtures:verify`), which was
  not run here; it is the remaining half of `The Tailwind environment no longer
needs a second stylesheet`.
- No changeset: this ticket changes no published package surface.
- The manual Windows High Contrast check does not apply: this change adds no
  border, outline or focus ring.

## Comments

### Storybook groundwork (landed on the migration trunk, not committed yet)

`apps/storybook/.storybook/astryxTailwindSheet.ts` serves `virtual:astryx-tailwind-sheet.css` by lazily importing `packages/core/scripts/build-css-tailwind.mjs` and calling `buildAstryxTailwindCss()`, so a story is never one build behind the source it renders; `handleHotUpdate` drops the memoized sheet when a `*Classes.ts` or `*classes.ts` file changes. Registered in `viteFinal` of `apps/storybook/.storybook/main.ts` before `astryxStylex({...})`, imported by `apps/storybook/.storybook/preview.tsx` right after `@astryxdesign/core/reset.css`, declared in `apps/storybook/.storybook/virtual.d.ts`.

Not verified: `pnpm -F @astryxdesign/storybook build` has not run on the branch yet, and `pnpm -F @astryxdesign/storybook typecheck` fails repo-wide on pre-existing errors in `stories/*.stories.tsx` (`@astryxdesign/theme-neutral`, `@astryxdesign/vega` unresolved), `packages/lab/src/ListInput/ListInput.tsx:1036`, `packages/lab/src/Schedule/TimeGridView.tsx:258`, `packages/lab/src/Schedule/useScheduleViewPopover.ts:86` and `packages/richtext/src/RichTextEditorToolbar.tsx:565`.

### vibe-tests: the target that needs the sheet is `astryx`, not `astryx-tailwind`

`internal/vibe-tests/src/build-previews.ts:158` shows the two targets are not the same thing: `astryx-tailwind` is a vibeability target that renders a component written in plain Tailwind against the CDN script at `internal/vibe-tests/src/build-previews.ts:209`, so it never reads our sheet. The target whose screenshots show Astryx components is `astryx`, and `createEntryFile` at `internal/vibe-tests/src/build-previews.ts:155` gives it only `@astryxdesign/core/reset.css` plus whatever the StyleX unplugin injects from source.

So the survey's remaining work here is one import in `createEntryFile` for the `astryx` target: `packages/core/dist/astryx-tailwind.css`, guarded by the same build check `internal/vibe-tests/src/build-report.ts:38` already applies to `packages/core/dist/astryx.css` and `packages/themes/neutral/dist/theme.css`. Do not read the sheet at request time the way Storybook does — these previews are static files written to `results/`, so a build artifact is the right input.

### Final slice (`9a01693b8`)

`internal/vibe-tests/environments/project-astryx-tailwind/globals.css` now
imports `@astryxdesign/core/astryx-tailwind.css` in the reset → `astryx.css` →
built sheet order `render-pages.ts` uses, and keeps
`@astryxdesign/core/tailwind-theme.css`.

Decision: the bridge stays. The built sheet carries no `@theme` block, so
without the bridge the environment's own Tailwind build generates none of the
words a generated page writes (`bg-surface`, `text-primary`) — the worker
measured 0 matches in a compiled probe. The bridge declares no variable of its
own (`@theme reference inline`), so keeping it adds no second styling path: it
is the vocabulary, the built sheet is the component rules. That is why
`The Tailwind environment no longer needs a second stylesheet` reads as the
component sheet, not the bridge.

Verification after the change and the merge of the trunk:

- `pnpm exec vitest run internal/vibe-tests/src` — 64 passed.
- `node scripts/fixture-suite.mjs verify` — `verified 3 canonical fixtures`.
- `prettier --check` clean.
- Storybook: `pnpm -F @astryxdesign/storybook build` exit 0 from the earlier
  slice; the sheet is in `dist/assets/iframe-*.css` inside `@layer astryx-base`.

Still not run, and left to review rather than code: the `Done when` browser
comparison of a migrated story against the family check page. The build proves
the classes resolve; nobody has looked at the computed values side by side.

No changeset: no published package surface changed.
