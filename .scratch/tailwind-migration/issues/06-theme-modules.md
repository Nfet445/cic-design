# theme modules

Status: ready-for-agent
Blocked by: 5
Wave: 3
Ticket: 06

## What

Migrate the remaining theme modules that style themselves: data tokens, the derived-variable registry, `defineTheme`, and the colour-mode blocks.

## Files

- `packages/core/src/theme/dataTokens.stylex.ts`
- `packages/core/src/theme/derivedVarRegistry.ts`
- `packages/core/src/theme/defineTheme.ts`
- `packages/core/src/theme/Theme.tsx`
- `packages/core/src/theme/colorModeBlocks.test.ts`

## Done when

- `defineTheme` output keeps its CSS shape; the theme build still produces `theme.css`.
- Colour-mode blocks keep their `@media`/`data-*` shape.
- 12 `stylex.create` in `theme/` reach zero.

## Verification

- `pnpm exec vitest run packages/core/src/theme`
- `pnpm -F @astryxdesign/core build`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.
