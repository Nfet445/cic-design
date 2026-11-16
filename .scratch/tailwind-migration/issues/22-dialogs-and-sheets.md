# dialogs and sheets

Status: ready-for-agent
Blocked by: 11,17
Wave: 7
Family: `family:overlay-dismissal`
Ticket: 22

## What

Migrate `Dialog/`, `AlertDialog/`, `Drawer/` (4), `BottomSheet/` (6), `MobileNav/` and `Lightbox/`.

## Files

- `packages/core/src/Dialog/**`
- `packages/core/src/AlertDialog/**`
- `packages/core/src/Drawer/**`
- `packages/core/src/BottomSheet/**`
- `packages/core/src/MobileNav/**`
- `packages/core/src/Lightbox/**`

## Done when

- The `::backdrop`, entry animation and viewport inset come from classes the layer build carries.
- Anchor positioning keeps its CSS-only guarantee (INV21 of `architecture:layer-runtime`).

## Verification

- `pnpm exec vitest run packages/core/src/Dialog packages/core/src/AlertDialog packages/core/src/BottomSheet packages/core/src/Drawer`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.
