# remove stylex

Status: blocked
Blocked by: 56, 57
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
"\.test\.\|__tests__\|\.stylex\.ts\|\.doc\.mjs"` returns 31 sites in 24 files, and
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

## Comments — measured frontier after ticket 53

The component maps are gone; what remains is two families:

- 31 `stylex.create` sites in 24 non-test component files (`Tokenizer/Tokenizer.tsx` 4,
  `SideNav/SideNavItem.tsx` 2, `Typeahead/Typeahead.tsx` 2, `Resizable/ResizeHandle.tsx` 2,
  `Table/plugins/stickyColumns/useTableStickyColumns.tsx` 2, and one each in twelve others).
- 101 sites in 43 `*.stylex.ts` modules, dominated by the shared utilities every component composes:
  `Layout/container.stylex.ts` 15, `Text/text.stylex.ts` 15, `Layout/padding.stylex.ts` 14,
  `Stack/stack.stylex.ts` 6, `Field/inputStyles.stylex.ts` 5, then the markers and one-rule
  `*Overrides.stylex.ts` modules.

So removal is not one ticket's work: tickets 54 (layout, text and stack utilities), 55 (field and input
wrappers), 56 (focus ring, press layers and the override modules) and 57 (tables, overlays and leaves)
have to land first. Until then the runtime, the babel plugin and the 20 deprecated `*.stylex` subpaths
stay.

## Plan — measured after ticket 55

The last blocker is not a component rule; it is the token shim. `packages/core/src/theme/tokens.stylex.ts`
is a `stylex.defineVars` module that re-exports 211 token names, and every remaining `stylex.create` reads
its variable names out of it (`spacingVars['--spacing-3']` → `'var(--spacing-3)'`). StyleX's runtime is what
turns those names into variables, so the package cannot drop `@stylexjs/*` while the shim exists, even
though `packages/core/src/theme/tokenVars.ts` and the generated `tokens.css` already carry the same values.

Order of work:

1. Publish the token names from `tokenVars.ts` in the shape the call sites read them —
   `spacingVars`-style record lookups staying source-compatible is not possible, so each call site states
   `var(--spacing-3)` directly or through one helper. 33 non-test files under `packages/core/src` still
   import `tokens.stylex`; the rest of the 106 textual hits are comments, tests and `.stylex.ts` modules
   that step 3 deletes.
2. Delete every remaining `stylex.create` that tickets 56 and 57 leave, then delete the `*.stylex.ts`
   modules and their `package.json` export entries together (deleting a module alone leaves the export
   pointing at nothing — `packages/core/src/__tests__/publicStyleXNamespaces.test.ts` catches it).
3. Retire the StyleX half of `packages/build` (`source-stylesheet.js`, the babel plugin wiring, `vite.ts`'s
   `rulesById` branch) and `scripts/build-css.mjs`'s StyleX targets. `astryx.css` survives as the token and
   reset sheet until OQ1 is decided, so the build keeps emitting it from the generated sheets alone.
4. `xstyle` keeps working through a Tailwind-shaped adapter: the prop stays a class-or-style object and its
   value lands unlayered, as AST-119 FR5 and OQ3 require. `mergeProps` already accepts both shapes, so this
   step is mostly deleting the `stylex.props` passthrough and typing the prop against the adapter.
5. Changeset `breaking` — 80 `*.stylex` export subpaths disappear, `xstyle`'s accepted value narrows, and a
   consumer that installed the StyleX babel plugin no longer needs it.

Measured at the time of writing: 217 non-test files under `packages/core/src` name `@stylexjs/stylex`
(including `*.stylex.ts` modules), 37 in `packages/lab/src`, 1 in `packages/charts/src`, 3 in
`packages/richtext/src`.
