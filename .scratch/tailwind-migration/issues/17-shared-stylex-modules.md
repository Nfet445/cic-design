# shared stylex modules

Status: ready-for-agent
Blocked by: 7,11
Wave: 5
Ticket: 17

## What

Retire the last modules that still hand a StyleX style object to components: focus outline, interaction overlay, row and control press layers, the touch band, icon box sizing, input-group addons, the nav item styles and the selector presentation.

## Files

- `packages/core/src/utils/focusOutline*`
- `packages/core/src/utils/interactionOverlay*`
- `packages/core/src/internal/touchHitArea*`
- `packages/core/src/Internal/iconBoxSize*`
- `packages/core/src/InputGroup/**`
- `packages/core/src/NavItem/navItemStyles*`
- `packages/core/src/Selector/selectorPresentation*`

## Done when

- No core component calls `stylex.props()` on a style it does not own, so `xstyle` is the only StyleX input left in a migrated file.
- The press and hover overlays keep their `:active`/`[data-astryx-press=on]` behaviour and their coarse-pointer and reduced-motion guards.
- After this ticket, `xstyle` is the only reason `@stylexjs` stays in core.

## Verification

- `pnpm exec vitest run packages/core/src/Button packages/core/src/ButtonGroup packages/core/src/ToggleButton`
- `node packages/core/scripts/build-css-tailwind.mjs`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.
