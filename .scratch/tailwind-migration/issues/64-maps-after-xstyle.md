# the maps that wait on the xstyle adapter

Status: done
Blocked by: 62
Wave: 9
Ticket: 64
Parent: `00-epic-stylex-to-tailwind-4`

## What

After ticket 62 the props that took only a StyleX value (`xstyle`, `inputXStyle`,
`ContextMenu.triggerXstyle`, `usePopover`'s `xstyle`) accept a class or a style object, so the twenty-one
files ticket 60 could not finish have no blocked argument left.

Convert them, in this order, one commit per file: `Selector/SelectorOption.tsx`, `Selector/Selector.tsx`,
`MultiSelector/MultiSelector.tsx`, `ComplexSelector/ComplexSelector.tsx`, `Typeahead/Typeahead.tsx`,
`Typeahead/BaseTypeahead.tsx`, `Tokenizer/Tokenizer.tsx`, `Tokenizer/TokenizerBottomSheet.tsx`,
`SideNav/SideNav.tsx`, `SideNav/SideNavItem.tsx`, `Table/TableCell.tsx`, `Table/TableHeaderCell.tsx`,
`Table/TableRow.tsx`, `Breadcrumbs/BreadcrumbItem.tsx`, `hooks/anchoredHint.tsx`, `AppShell/AppShell.tsx`,
`Chat/ChatComposerDrawer.tsx`, `packages/lab/src/TransferList/TransferListSelector.tsx`.

## Files

The eighteen files above, plus the `*.stylex.ts` modules they leave behind and those modules'
`packages/*/package.json` export entries.

## Done when

- `grep -rn "stylex.create" packages/*/src --include='*.ts' --include='*.tsx'` finds only JSDoc examples and
  the `.stylex.ts` modules this ticket deletes.
- A map that survives states its reason in `## Comments`: `firstThatWorks` fallback order, a public StyleX
  marker, or an unlayered rule it must cancel.

## Verification

- `node packages/core/scripts/build-css-tailwind.mjs`
- `pnpm exec vitest run packages/core/src packages/lab/src`
- `cd packages/core && pnpm exec tsc --noEmit -p tsconfig.json`

## Comments — closed

Eighteen files converted across five windows; the last one (`BreadcrumbItem`,
`breadcrumbItemClasses`) landed from a timeout salvage. Two per-instance
variables appeared on the way and are documented with `private: true` and
classified in `VARS_WITHOUT_DERIVED_MAPPING`: `--astryx-typeahead-menu-width`
and `--astryx-typeahead-held-block-size`.

Verified: `Selector`, `MultiSelector`, `ComplexSelector`, `Typeahead`,
`Tokenizer`, `Breadcrumbs` plus the sheet test — 1 398 passed; the whole core
suite at 23 791 tests with only the known ICU/Temporal failures.
