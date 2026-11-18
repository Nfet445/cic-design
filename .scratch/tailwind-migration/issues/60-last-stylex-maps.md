# delete the last StyleX maps and their subpaths

Status: ready-for-agent
Blocked by: 56, 57, 59
Wave: 9
Ticket: 60
Parent: `00-epic-stylex-to-tailwind-4`

## What

Tickets 56 and 57 left a named list of maps whose rule cannot be a class today. Each reason is a seam: an unlayered reset from `packages/core/src/Layer/useLayer.tsx` that every other rule must beat, a StyleX-only argument (`usePopover`'s `xstyle`, `inputXStyle`, `triggerXstyle`), a `stylex.firstThatWorks` fallback chain, or two conditions the Tailwind variant order would decide.

Replace the seam first, then the map: a `--_*` variable published by script, an attribute set by the controller, or a class argument beside the StyleX one. A map whose reason still holds keeps a `.stylex.ts` module and is listed in `## Comments`; everything else becomes class text in a `*Classes.ts` module.

## Files

- `packages/core/src/Tokenizer/Tokenizer.tsx`, `TokenizerBottomSheet.tsx`
- `packages/core/src/SideNav/SideNav.tsx`, `SideNavItem.tsx`
- `packages/core/src/Resizable/ResizeHandle.tsx`
- `packages/core/src/Layer/useLayer.tsx`
- `packages/core/src/Typeahead/Typeahead.tsx`, `BaseTypeahead.tsx`
- `packages/core/src/Selector/Selector.tsx`, `SelectorOption.tsx`, `MultiSelector/MultiSelector.tsx`, `ComplexSelector/ComplexSelector.tsx`
- `packages/core/src/Breadcrumbs/BreadcrumbItem.tsx`, `hooks/anchoredHint.tsx`, `DropdownMenu/DropdownMenuSubMenu.tsx`
- `packages/lab/src/TransferList/TransferListSelector.tsx`
- the component-owned token modules `packages/core/src/DateInput/tokens.stylex.ts`,
  `packages/lab/src/SVGIcon/tokens.stylex.ts` and `packages/lab/src/TransferList/tokens.stylex.ts`, whose
  names move into the core token records first (they are what keeps `dateInputClasses.ts`,
  `svgIconClasses.ts` and `TimeInput/touchTimeFieldClasses.ts` on StyleX), with their `packages/*/package.json` export entries

## Done when

- Every deleted module's `package.json` export is deleted in the same commit, because `packages/core/src/__tests__/publicStyleXNamespaces.test.ts` compares the namespace map to `exports`.
- `pnpm exec vitest run packages/core/src packages/lab/src` is green.
- `## Comments` lists every surviving map with the reason that still holds.

## Verification

- `node packages/core/scripts/build-css-tailwind.mjs`
- `pnpm exec vitest run packages/core/src packages/lab/src`
- `cd packages/core && pnpm exec tsc --noEmit -p tsconfig.json`
