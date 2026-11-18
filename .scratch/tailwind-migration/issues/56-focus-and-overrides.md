# focus ring, press layers and the override modules

Status: ready-for-agent
Blocked by: 54
Wave: 10
Ticket: 56
Parent: `00-epic-stylex-to-tailwind-4`

## What

The last interaction paint that has to outrank a layer utility, and the modules that exist only for
that reason.

## Measured scope

- `packages/core/src/utils/focusOutline.stylex.ts` 1 map and `utils/interactionOverlay.stylex.ts`
  1 map — `focusOutlineProps` and `interactionOverlayProps` hand a StyleX value to `Layer`, `Item`
  and every delegate control.
- `packages/core/src/privateAttributes/press.stylex.ts` 1 (`rowPressLayerStyles`) and
  `ownRing.stylex.ts` 1 (`ownRingContainerStyles`).
- Twelve `*Overrides.stylex.ts` modules that each hold one rule which must beat a class:
  `Card/cardBorder`, `ClickableCard/clickableCardBorder`, `Drawer/drawerContentSafeArea`,
  `Dialog/dialogFullscreenSafeArea`, `TextArea/textAreaWrapper`, `BottomSheet/bottomSheetPanelPadding`,
  `Table/plugins/rowExpansion/rowExpansionOverrides`, `Markdown/markdownChildOverrides`,
  `Table/table.stylex.ts`, `Table/plugins/tree/treeExpanderFocus`, `Switch/switchHoverPress`,
  `RadioList/radioListItemRow`, `SelectableCard/selectableCardSelection`,
  `DropdownMenu/menuRowState`, `Selector/selectorPresentation`, `Lightbox/lightboxOverrides`.

## Done when

- `focusOutlineProps` and `interactionOverlayProps` either take and return classes, or state why the
  ring must stay StyleX; whichever answer, `ownRingContainerStyles` and `rowPressLayerStyles` follow
  it, because both wait on the same boundary.
- Every `*Overrides.stylex.ts` either disappears into the class map it overrides or keeps a sentence
  naming the rule that must win and why a class cannot express it.

## Verification

- `node packages/core/scripts/build-css-tailwind.mjs`
- `pnpm exec vitest run packages/core/src/{utils,privateAttributes,Item,List,RadioList,Table,Switch,Markdown,Lightbox,Selector,DropdownMenu} packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs packages/core/src/__tests__`
- `pnpm -F @astryxdesign/core typecheck`
- Manual Windows High Contrast check: a focused row, a pressed row and a reorder handle.

## Notes

- This is the ticket that decides whether ticket 36 can remove the runtime; write the answer in
  `## Comments` even if it is "these five rules stay and here is why".
