# side nav

Status: ready-for-agent
Blocked by: 18
Wave: 6
Family: `family:navigation-destinations`
Ticket: 20

## What

Migrate `SideNav/` (8), `TreeList/` (6) and their row controls, including the size cascade from `family:component-size-cascade`.

## Files

- `packages/core/src/SideNav/**`
- `packages/core/src/TreeList/**`

## Done when

- The row-control size cascade still reaches an action the consumer did not size.
- Collapse and resize affordances keep their measured geometry.

## Verification

- `pnpm exec vitest run packages/core/src/SideNav packages/core/src/TreeList`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.
