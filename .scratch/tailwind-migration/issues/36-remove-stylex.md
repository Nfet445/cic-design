# remove stylex

Status: blocked
Blocked by: 63
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

Measured after ticket 36B. Converted to literal classes in a `*Classes.ts` map, one file per
commit, each registered in `Layout/tailwindStylesheet.source-build.test.mjs`:
`Table/TableCell.tsx`, `Table/TableRow.tsx`, `Table/TableHeaderCell.tsx`, `SideNav/SideNav.tsx`,
`AppShell/AppShell.tsx` (its area fills only), `hooks/anchoredHint.tsx`,
`Chat/ChatComposerDrawer.tsx`, `lab/src/TransferList/TransferListSelector.tsx` (lab sheet).

Four sites keep their map, and each names its blocker in place:

- `SideNav/SideNavItem.tsx` — `leftoverStyles` and `indentStyles` lose to
  `NavItem/navItemStyles.stylex.ts`, which is unlayered and paints the same `padding-inline-*` and
  size; the seam is the NavItem class map, not a new attribute.
- `DropdownMenu/DropdownMenuSubMenu.tsx` — `triggerStyles.caret` sits on a style-only wrapper,
  which the lint rule reports once the style arrives as a class; the rule has to accept a class
  that resolves to a real declaration first.
- `AppShell/AppShell.tsx` — `mainFocusTarget`, `mainElevatedCorner`, `mainSafeAreaEnd` and
  `panelAutoFill` arrive through `LayoutContent`/`LayoutPanel`'s `xstyle`, whose own class paints
  `outline`, padding, `overflow` and `flex` in the same layer. `mainSafeAreaEnd` also composes with
  the container padding variable, so sheet order cannot replace last-wins; the seam is a Layout
  class that owns the safe-area inset as its own arm.

`SideNav/SideNav.tsx` and `Chat/ChatComposerDrawer.tsx` hold no map any more; only their `@input`
headers still name StyleX. No changeset: no prop, export or theme variable changed.

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

## Comments — ticket 36C, the seven component files

The seven files this window owns are at their frontier. `Table/TableCell.tsx`,
`Table/TableHeaderCell.tsx`, `Table/TableRow.tsx`, `SideNav/SideNav.tsx` and
`Chat/ChatComposerDrawer.tsx` hold no `stylex.create` of their own any more, and each answers a
seam that already existed: `ContextMenu`'s `triggerClassName`, `NavItem`'s value, the marker.

What moved here: `DropdownMenu/DropdownMenuSubMenu.tsx`'s `triggerStyles.caret` is now
`dropdownMenuSubMenuCaretClassName` (`flex items-center`), registered in the sheet test. The
earlier note in this ticket asked for the style-only-wrapper rule to resolve a class's
declarations first. That did not happen, and seventeen wrappers in this package — `SideNav`'s
three zone rows, `SideNavCollapseButton`'s mirrored chevron, `ChatToolCalls`' glyph boxes,
`SideNavItem`'s actions slot — already carry the same `eslint-disable-next-line
@astryx/no-style-only-wrapper` with a stated reason, all of them added by this migration. The
caret's box is that same shape (a flex row of its own, `display` and `align-items`), so it takes
the same suppression rather than waiting on the rule. Reverting it is one class and two comments
if the rule learns to read class text.

What still holds a map, and why:

- `SideNav/SideNavItem.tsx` — `leftoverStyles` and `indentStyles`. Both set `width`,
  `padding-inline` and `padding-inline-start` that `NavItem/navItemStyles.stylex.ts` also paints.
  That module is unlayered and these utilities land in `@layer astryx-base`, so the unlayered rule
  wins at every order and every specificity — the collapsed rail's square and the nesting indent
  would both vanish. The seam is `NavItem/navItemStyles.ts`, not a new attribute.
- `Table/TableRow.tsx` — `tableRowMarker` (`stylex.defineMarker()`), not a paint: cells and
  `plugins/rowExpansion` read it through `stylex.when.ancestor`. A marker has no class form, and
  its consumers are still `*.stylex.ts`. The row's own box is already classes.
- `DropdownMenu/DropdownMenuSubMenu.tsx` still composes `layerAnimations`,
  `layerViewportInset`, `focusOutlineStyles` and `menuRowStateStyles` — shared modules that
  tickets 56 and 57 own.

Measured: `packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs` passes with the
2320 ceiling unchanged (`flex` and `items-center` were already in the sheet, so the caret added no
rule). `Table`, `SideNav`, `Chat` and `DropdownMenu` suites are green, and
`pnpm exec tsc --noEmit -p tsconfig.json` reports only the four pre-existing
`src/i18n/getLocaleDirection.ts` errors this window does not own.
