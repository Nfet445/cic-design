# layout regions

Status: done
Blocked by: 5,9
Wave: 3
Family: `family:layout-regions`
Ticket: 12
Parent: `00-epic-stylex-to-tailwind-4`

## What

Migrate `Layout/` (44 `stylex.create`) beyond the padding vocabulary already in `Layout/paddingClasses.ts`: the region grid, header, content, footer and panel.

## Files

- `packages/core/src/Layout/Layout.tsx`
- `packages/core/src/Layout/**`
- `packages/core/src/AppShell/**`

## Done when

- Region spacing still resolves edge > axis > uniform.
- A container query that sizes a panel still works after the move.
- `Layout` keeps `xstyle` last in the merge.

## Verification

- `pnpm exec vitest run packages/core/src/Layout`
- `browser page `layout-regions.html` showing a panel at two widths`

## Notes

- Landed as `Layout/layoutClasses.ts` plus region maps in `Header/`, `Content/`, `Footer/`, `Panel/`. The browser page the ticket asks for is NOT included: its checks assumed the shell carries `--astryx-layout-region-height` and container-padding classes on the tagged element, and the landed split publishes those elsewhere; wiring it is `39-layout-regions-page.md`.

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.
