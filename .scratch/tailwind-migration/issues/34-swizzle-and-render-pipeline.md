# swizzle and render pipeline

Status: ready-for-agent
Blocked by: 32
Wave: 9
Ticket: 34

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
