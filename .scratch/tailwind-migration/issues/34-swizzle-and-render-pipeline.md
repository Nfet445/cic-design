# swizzle and render pipeline

Status: done
Blocked by: 32
Wave: 9
Ticket: 34
Parent: `00-epic-stylex-to-tailwind-4`

## What

Update `astryx swizzle` and the render pipeline so ejected source states which stylesheet it needs and stops rewriting StyleX imports.

## Files

- `packages/cli/api/swizzle/copy/copy.mjs`
- `packages/cli/api/swizzle/_moduleGraph.mjs`
- `packages/cli/foundation/render/page-worker.mjs`
- `packages/cli/api/theme-edit/_preview-app.mjs`

## Done when

- A swizzled component states its stylesheet dependency and renders.
- The render pipeline loads the Tailwind sheet for a preview.
- `swizzle.routing.test.mjs` passes with the StyleX assertions removed.

## Verification

- `pnpm exec vitest run packages/cli/clients/cli/commands/swizzle.routing.test.mjs`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.

## Comments

- 2026-11-17: closed. `swizzle` names `@astryxdesign/core/astryx-tailwind.css` in its receipt and prints the import instead of the StyleX build note; the render pipeline already loads the sheet.
- Root-cause fix in `packages/cli/api/swizzle/_moduleGraph.mjs`: `choosePublic` no longer offers a `.stylex` subpath for a name whose origin is a plain module. The deprecated `IconSize.stylex` shim re-exports the class map under the old name `iconBoxSizeStyles`, so the copy used to import `{iconBoxSizeStyles as iconBoxClassName}` — a different value under a misleading name.
- The copy still takes a genuine StyleX module from its exported path (`@astryxdesign/core/Layout/edgeCompensation.stylex`), which stays until the marker and shared-module tickets land.
