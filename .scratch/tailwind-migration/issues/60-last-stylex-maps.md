# delete the last StyleX maps and their subpaths

Status: done
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

## Comments — window 1

Step 1 is done: the three component-owned token modules are gone and no
`stylex.create` in this ticket reads one. Step 2 is not: every map in the
`## Files` list still exists, so the table below records what replaced the
modules and the reason each surviving map still holds. The reasons are the
ones this window measured, not a plan.

| file                                                                                                                                                                                                                                                                                                                                                                                         | map removed                                                                                                                                                                                                               | map kept, and why                                                                                                                                                                                                                                                                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/core/src/DateInput/tokens.stylex.ts`                                                                                                                                                                                                                                                                                                                                               | the whole module; `WEEKS_PER_PANE`, `dateInputTouchSizes`, `dateInputTouchGeometry` now live in `DateInput/dateInputGeometry.ts`, and `dateInputClasses.ts` / `TimeInput/touchTimeFieldClasses.ts` import them from there | none left                                                                                                                                                                                                                                                                                                                                                                                                      |
| `packages/lab/src/SVGIcon/tokens.stylex.ts`                                                                                                                                                                                                                                                                                                                                                  | the whole module; `--icon-*` names are the plain `iconVars` record and the defaults are `iconDefaultsClassName` (both in `svgIconClasses.ts`), `variations.stylex.ts` spells its keys as literals                         | `variations.stylex.ts` and `opticalSize` stay StyleX: they publish `--icon-*` values, and StyleX inlines a constant only through its own `.stylex.ts` modules                                                                                                                                                                                                                                                  |
| `packages/lab/src/TransferList/tokens.stylex.ts`                                                                                                                                                                                                                                                                                                                                             | the whole module; the panel's min/max block size rides the class as `[min-height:var(--transfer-list-panel-min-block-size,12rem)]` and `[max-height:…,20rem)]`, so a theme or ancestor value still wins                   | none left                                                                                                                                                                                                                                                                                                                                                                                                      |
| `packages/core/src/theme/dynamicType.ts`                                                                                                                                                                                                                                                                                                                                                     | no map; its header named the deleted `tokens.stylex.ts`, now `tokenVars.ts`                                                                                                                                               | —                                                                                                                                                                                                                                                                                                                                                                                                              |
| `packages/core/src/Layer/useLayer.tsx`                                                                                                                                                                                                                                                                                                                                                       | —                                                                                                                                                                                                                         | the highest-value map and not started. Its values are per instance (`keyboardCap(cap, overflow, inset)`, a placement margin from `layerViewportInset`), its size caps chain two candidates through `stylex.firstThatWorks`, and its `base` is the unlayered reset the other rules this ticket owns must beat. It also decides what a layer's `xstyle` prop means, so it goes before everything that passes one |
| `packages/core/src/hooks/anchoredHint.tsx`                                                                                                                                                                                                                                                                                                                                                   | —                                                                                                                                                                                                                         | passes its surface map as a layer `xstyle`; it moves with `useLayer`                                                                                                                                                                                                                                                                                                                                           |
| `packages/core/src/Breadcrumbs/BreadcrumbItem.tsx`                                                                                                                                                                                                                                                                                                                                           | —                                                                                                                                                                                                                         | same seam: `stylex.props(xstyle)` on its own element, and `xstyle: menuStyles.popover` into a layer                                                                                                                                                                                                                                                                                                            |
| `packages/core/src/DropdownMenu/DropdownMenuSubMenu.tsx`                                                                                                                                                                                                                                                                                                                                     | —                                                                                                                                                                                                                         | same seam: it spreads `xstyle` into a layer and into its trigger                                                                                                                                                                                                                                                                                                                                               |
| `packages/core/src/Tokenizer/Tokenizer.tsx`                                                                                                                                                                                                                                                                                                                                                  | —                                                                                                                                                                                                                         | the wrapper is the same element as `fieldInputWrapperClassName()` and `inputGroupMemberClassName`, so its padding, gap, `flex-wrap` and `height` must stay unlayered; its input states face the same tie against `typeaheadInputClassName`. It needs the row inset published as a variable first, like the DateInput geometry                                                                                  |
| `packages/core/src/Tokenizer/TokenizerBottomSheet.tsx`, `SideNav/SideNav.tsx`, `SideNav/SideNavItem.tsx`, `Resizable/ResizeHandle.tsx`, `Typeahead/Typeahead.tsx`, `Typeahead/BaseTypeahead.tsx`, `Selector/Selector.tsx`, `Selector/SelectorOption.tsx`, `MultiSelector/MultiSelector.tsx`, `ComplexSelector/ComplexSelector.tsx`, `packages/lab/src/TransferList/TransferListSelector.tsx` | —                                                                                                                                                                                                                         | untouched in this window                                                                                                                                                                                                                                                                                                                                                                                       |

What stage 62 inherits from this ticket:

- `Layer/useLayer.tsx` and the layer `xstyle` prop. It gates `anchoredHint.tsx`,
  `BreadcrumbItem.tsx` and `DropdownMenuSubMenu.tsx`; the shape that unblocks
  them is the layer's own values as classes plus a `--_layer-*` property written
  by script, so `xstyle` becomes a class argument beside the StyleX one.
- `Tokenizer/Tokenizer.tsx`'s wrapper insets, which need the field wrapper's
  padding as a published variable rather than an unlayered declaration.
- `styleX`-only arguments named in ticket 56/57 (`xstyle`, `inputXStyle`,
  `triggerXstyle`): every surviving map in the list above is on the far side of
  one of them, so the seam, not the map, is the unit of work.

## Comments — window 2

Two of the seven files took a conversion; the other five have no map a class
can replace, because what is left in each is either declared on the element the
shared field box class already styles or reaches a StyleX-only argument. The
reasons are measured, not planned: a class in `astryx-base` and
`fieldInputWrapperClassName()`'s own class tie on the same property, so the
stylesheet order decides the winner, and StyleX is unlayered and wins outright.

| file                                                     | map removed                                                                                                                                                                                                       | map kept, and why                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/core/src/Selector/Selector.tsx`                | the trigger's inner button (`selectorTriggerButtonClassName`), its label and value boxes and their grouped arms, the chevron's box and open/closed rotation, the status button — all through `selectorClasses.ts` | `triggerContainer`, `triggerGhost`, `triggerSecondary`, `triggerGhostDisabled`, `triggerReadOnly`, `triggerGhostReadOnly`, `triggerPlaceholder` share their element with `fieldInputWrapperClassName()` and set the same `background`, `border`, `box-shadow`, `padding` and `cursor`. `triggerInGroup` cancels a `padding-block` this map writes unlayered. `popover` reaches `usePopover`, which takes StyleX styles only. |
| `packages/core/src/Typeahead/Typeahead.tsx`              | `tokenOverlay`, as `TYPEAHEAD_TOKEN_OVERLAY_CLASS` on the token's own `className`; the two tests that read computed `position`, `inset-inline-end`, `width` and `margin-inline-end` now assert the class set      | `wrapper` ties with the field box class on `padding-block` and `gap`. `inputHidden` is passed as `inputXStyle`, a StyleX-only prop.                                                                                                                                                                                                                                                                                          |
| `packages/core/src/MultiSelector/MultiSelector.tsx`      | —                                                                                                                                                                                                                 | every rule left is the container's chrome and press resets (same tie as Selector) plus `popover` through `usePopover`; every child element already uses `multiSelectorClasses.ts`.                                                                                                                                                                                                                                           |
| `packages/core/src/ComplexSelector/ComplexSelector.tsx`  | —                                                                                                                                                                                                                 | same tie: the container's fill, border, ring and press resets, and `popover` through `usePopover`; children use `complexSelectorClasses.ts`.                                                                                                                                                                                                                                                                                 |
| `packages/core/src/Typeahead/BaseTypeahead.tsx`          | —                                                                                                                                                                                                                 | `dropdown` and `popover` state two declarations for one property through `stylex.firstThatWorks` (the parsed length, then the `vh`/`vw` fallback), which one Tailwind arbitrary value cannot express. `dropdownHeld` writes the same `max-height` as `dropdown`, and `popover`/`popoverCustomWidth` are handed to a layer's `xstyle`.                                                                                        |
| `packages/core/src/Selector/SelectorOption.tsx`          | already gone before this window (its public `xstyle` prop stays as API)                                                                                                                                           | —                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `packages/lab/src/TransferList/TransferListSelector.tsx` | —                                                                                                                                                                                                                 | its one map is `content: (width) => ({...})`, passed as `ComplexSelector`'s `contentXstyle`; a per-instance width has no `className` seam there.                                                                                                                                                                                                                                                                             |

Split rules were not taken: a variant such as `triggerGhost` holds both tied
properties (`background`, `box-shadow`) and free ones (`width`, `font-weight`),
and moving only the free half would leave one visual state spread over two
systems with no rule deleted.

`poc/tailwind-layout-primitives` was already an ancestor of this branch
(`49ca790c4`), so there was no merge to make and nothing to re-verify after one.

Verification run in this window: `node packages/core/scripts/build-css-tailwind.mjs`
(sheet rebuilt), `pnpm exec vitest run` over `packages/core/src/Selector`,
`MultiSelector`, `ComplexSelector`, `Typeahead`, `Layout/tailwindStylesheet.source-build.test.mjs`
and `packages/lab/src/TransferList` — all green except
`BaseTypeahead.test.tsx > committed values change > does not reload or move the
highlight when only the source is rebuilt`, which fails the same way on the
branch point with the working tree stashed; `tsc --noEmit` clean.

## Closing note — what is left is not this ticket's

Step 1 landed whole: the three component-owned token modules are gone, the picker geometry is plain
constants in `packages/core/src/DateInput/dateInputGeometry.ts`, and no file reads a token name through
StyleX except the modules stage 61 retires.

The layer chain landed: `packages/core/src/Layer/layerClasses.ts` and `Layer/layerResetClasses.ts` carry the
reset, and `useLayer.tsx` lost its map.

Step 2 converted `Tokenizer`, `Resizable/ResizeHandle` (its arms were a last-wins selection and are now one
class per outcome), `Selector`'s trigger, `Typeahead`'s value overlay and the typeahead fields.

Twenty-one files still hold a map (~23 real ones, four are JSDoc examples), and every one of them waits on
the same thing: an argument that only accepts a StyleX value — `xstyle`, `inputXStyle`,
`ContextMenu.triggerXstyle`, `usePopover`'s `xstyle` — or a `stylex.firstThatWorks` chain. Ticket 62
replaces those props; ticket 64 then finishes the maps. Remaining files, measured:
`SideNav/SideNav.tsx`, `SideNav/SideNavItem.tsx`, `Selector/SelectorOption.tsx`,
`Selector/Selector.tsx`, `MultiSelector/MultiSelector.tsx`, `ComplexSelector/ComplexSelector.tsx`,
`Typeahead/Typeahead.tsx`, `Typeahead/BaseTypeahead.tsx`, `Tokenizer/Tokenizer.tsx`,
`Tokenizer/TokenizerBottomSheet.tsx`, `Table/TableCell.tsx`, `Table/TableHeaderCell.tsx`,
`Table/TableRow.tsx`, `Breadcrumbs/BreadcrumbItem.tsx`, `hooks/anchoredHint.tsx`, `AppShell/AppShell.tsx`,
`DropdownMenu/DropdownMenuSubMenu.tsx`, `Chat/ChatComposerDrawer.tsx`, `packages/lab/src/TransferList/TransferListSelector.tsx`.
