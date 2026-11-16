# links and items

Status: ready-for-agent
Blocked by: 17
Wave: 6
Family: `family:navigation-destinations`
Ticket: 18

## What

Migrate the row and link members: `Link/`, `Item/`, `ListItem/`, `BreadcrumbItem/`, `Avatar/` (12), `Pagination/`, `Citation/`, `ClickableCard/`, `Token/` link mode.

## Files

- `packages/core/src/Link/**`
- `packages/core/src/Item/**`
- `packages/core/src/List/**`
- `packages/core/src/BreadcrumbItem/**`
- `packages/core/src/Avatar/**`
- `packages/core/src/Pagination/**`
- `packages/core/src/Citation/**`
- `packages/core/src/ClickableCard/**`

## Done when

- Hover, pressed and visited states come from variants over the same tokens.
- `useLinkComponent()` stays the only link element source.

## Verification

- `pnpm exec vitest run packages/core/src/Link packages/core/src/List packages/core/src/Avatar packages/core/src/Pagination`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.
