# remove stylex

Status: blocked
Blocked by: 30, 41, 52
Wave: 9
Ticket: 36
Parent: `00-epic-stylex-to-tailwind-4`

## What

Remove `@stylexjs/*` from core, lab, charts and richtext, retire the StyleX half of `packages/build` and `scripts/build-css.mjs`, and decide `astryx.css` under OQ1.

## Files

- `packages/core/package.json`
- `packages/lab/package.json`
- `packages/charts/package.json`
- `packages/richtext/package.json`
- `packages/build/**`
- `scripts/build-css.mjs`

## Done when

- `pnpm install` resolves no `@stylexjs` package.
- `pnpm build` is green with the StyleX build absent.
- `xstyle` keeps working through a Tailwind-shaped adapter, or the public prop is removed in the same major with a migration note.

## Verification

- `pnpm install`
- `pnpm build`
- `pnpm exec vitest run packages/core/src`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.

## Comments

Measured on the integration branch after tickets 07, 35 and 51 landed:
`grep -rn "stylex.create(" packages/core/src --include='*.ts' --include='*.tsx' | grep -v
"\.test\.\|__tests__\|\.stylex\.ts\|\.doc\.mjs"` returns 49 sites in 33 files, and
`packages/lab/src` holds 21 files with a map. Almost every remaining site is one of these four
shapes, and each needs the seam its ticket names before it moves:

- a property whose consumer still paints the same element through an unlayered StyleX rule
  (`NumberInput/NumberInput.tsx:100`, `MultiSelector/MultiSelector.tsx:175`,
  `ComplexSelector/ComplexSelector.tsx:101`, `Selector/Selector.tsx:153`, `Tokenizer/Tokenizer.tsx:455`
  against `Field/inputStyles.stylex.ts`) — ticket 52 publishes the field classes;
- an arm that only `:focus-visible` can express, or a ring above a clip
  (`SideNav/SideNav.tsx:231`, `Resizable/ResizeHandle.tsx:87`, `Table/plugins/stickyColumns/useTableStickyColumns.tsx:259`,
  `VisuallyHidden` and `internal/SheetConfirmation.tsx` are already done);
- a StyleX-shaped seam another component consumes as a value (`Table/TableCell.tsx:64` and
  `Table/TableHeaderCell.tsx:53` via `ContextMenu`'s `triggerXstyle`, `hooks/anchoredHint.tsx:33` and
  `Layer/useLayer.tsx:80` via `Layer.render`'s `xstyle`, `DropdownMenu/DropdownMenuSubMenu.tsx:152`
  via the style-only wrapper lint rule, `BaseProps.ts:81`/`:86` which only name the type);
- a private attribute owner module (`privateAttributes/*.stylex.ts`) — ticket 41.

The removal order that follows from this: finish 30 and 41, publish the seams in 52, then convert the
remaining consumers, then this ticket drops `@stylexjs` from the four packages, retires the StyleX half
of `packages/build` and `scripts/build-css.mjs`, and decides `astryx.css` (OQ1).
