# storybook and vibe tests

Status: ready-for-agent
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

### Storybook groundwork (landed on the migration trunk, not committed yet)

`apps/storybook/.storybook/astryxTailwindSheet.ts` serves `virtual:astryx-tailwind-sheet.css` by lazily importing `packages/core/scripts/build-css-tailwind.mjs` and calling `buildAstryxTailwindCss()`, so a story is never one build behind the source it renders; `handleHotUpdate` drops the memoized sheet when a `*Classes.ts` or `*classes.ts` file changes. Registered in `viteFinal` of `apps/storybook/.storybook/main.ts` before `astryxStylex({...})`, imported by `apps/storybook/.storybook/preview.tsx` right after `@astryxdesign/core/reset.css`, declared in `apps/storybook/.storybook/virtual.d.ts`.

Not verified: `pnpm -F @astryxdesign/storybook build` has not run on the branch yet, and `pnpm -F @astryxdesign/storybook typecheck` fails repo-wide on pre-existing errors in `stories/*.stories.tsx` (`@astryxdesign/theme-neutral`, `@astryxdesign/vega` unresolved), `packages/lab/src/ListInput/ListInput.tsx:1036`, `packages/lab/src/Schedule/TimeGridView.tsx:258`, `packages/lab/src/Schedule/useScheduleViewPopover.ts:86` and `packages/richtext/src/RichTextEditorToolbar.tsx:565`.

### vibe-tests: the target that needs the sheet is `astryx`, not `astryx-tailwind`

`internal/vibe-tests/src/build-previews.ts:158` shows the two targets are not the same thing: `astryx-tailwind` is a vibeability target that renders a component written in plain Tailwind against the CDN script at `internal/vibe-tests/src/build-previews.ts:209`, so it never reads our sheet. The target whose screenshots show Astryx components is `astryx`, and `createEntryFile` at `internal/vibe-tests/src/build-previews.ts:155` gives it only `@astryxdesign/core/reset.css` plus whatever the StyleX unplugin injects from source.

So the survey's remaining work here is one import in `createEntryFile` for the `astryx` target: `packages/core/dist/astryx-tailwind.css`, guarded by the same build check `internal/vibe-tests/src/build-report.ts:38` already applies to `packages/core/dist/astryx.css` and `packages/themes/neutral/dist/theme.css`. Do not read the sheet at request time the way Storybook does — these previews are static files written to `results/`, so a build artifact is the right input.
