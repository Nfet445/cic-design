# shared stylex modules

Status: partly done — three of ten modules, the rest waits on its consumers (see Result)
Blocked by: 11
Wave: 5
Ticket: 17
Parent: `00-epic-stylex-to-tailwind-4`

## What

Retire the last modules that still hand a StyleX style object to components: focus outline, interaction overlay, row and control press layers, the touch band, icon box sizing, input-group addons, the nav item styles and the selector presentation.

## Files

- `packages/core/src/privateAttributes/**` (ten `stylex.create`, two `stylex.keyframes`, two `defineMarker` scopes — moved here from ticket 07, which keeps only the markers)

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

## Result

Landed: `Icon/iconBoxClasses.ts`, `privateAttributes/menuPressLitClasses.ts` and
`privateAttributes/reorderLineClasses.ts` hold the classes, and the modules that
exported the styles now re-export them (`iconBoxSizeStyles`, `menuPressLitRowClassName`,
`reorderLineClassName`). Three of the ten `stylex.create` are gone.

The other seven wait for the ticket that migrates their consumers. A Tailwind
utility prints in `@layer astryx-base`, StyleX output prints unlayered, and an
unlayered declaration beats a layered one whatever the order. Each of those
modules sets a property that its consumer's own StyleX style also sets on the
same element, so moving the module alone would change what a browser paints:

| module                                                               | property it shares                         | consumer still on StyleX                                                                      |
| -------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `travelling.stylex.ts`                                               | `zIndex` under `@media (pointer: coarse)`  | `List/ListItem.tsx:255` sets 1 there, the travelling row asks for 2 (ticket 18)               |
| `focusOwner.stylex.ts`, `ownRing.stylex.ts`                          | the four outline longhands                 | `Item/Item.tsx:1035` composes `focusWithinOwner` beside `focusOutlineStyles` (tickets 15, 18) |
| `Selector/selectorPresentation.stylex.ts`                            | `borderColor`, `boxShadow`, `outlineWidth` | `Selector.tsx:2333`, `MultiSelector.tsx:2665` (ticket 15)                                     |
| `internal/touchHitArea.stylex.ts`                                    | `::after` and `::before`                   | `CheckboxInput.tsx:513`, `InfoTip.tsx:211`, `ButtonGroup.tsx:199`                             |
| `press.stylex.ts` (four creates, two keyframes)                      | press paint and transform layers           | every row and control consumer above                                                          |
| `utils/focusOutline.stylex.ts`, `utils/interactionOverlay.stylex.ts` | outline and background                     | Token, Carousel, Selector, ListItem                                                           |
| `InputGroup/groupStyles.ts`, `NavItem/navItemStyles.stylex.ts`       | radius, height, `zIndex`, item surface     | the InputGroup consumers and SideNav                                                          |

`reorderLine.stylex.ts` was the one remaining module whose only declaration
(`::after` `display`) no consumer also set.

## Census (checked against the tree at `ccb97ef02`)

Ten `stylex.create` in `packages/core/src/privateAttributes/`:

| file:line                   | exports                                                                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `focusOwner.stylex.ts:39`   | `focusWithinOwner` (:94), `focusWithinOwnerOverlay` (:97)                                                                                   |
| `menuPressLit.stylex.ts:88` | `menuPressLitRowStyle` (:104)                                                                                                               |
| `ownRing.stylex.ts:37`      | `ownRingContainerStyles.focusWithin` (:38)                                                                                                  |
| `press.stylex.ts:125`       | `rowPressLayerStyles`: `cell` (:152), `overDividers` (:257), `cellWithoutLayer` (:312), `cellOnImage` (:334), `cellOnImagePressOnly` (:358) |
| `press.stylex.ts:374`       | `controlPressLayerStyles.control` (:385)                                                                                                    |
| `press.stylex.ts`           | `rowPressPaintStyles` (`checkboxRow`, `radioRow`)                                                                                           |
| `press.stylex.ts`           | `indicatorPressPaintStyles` (`handDown`, `activeFill`, `image`)                                                                             |
| `reorderLine.stylex.ts`     | `reorderLineStyles`, `reorderingHandleStyles.cursor`                                                                                        |
| `travelling.stylex.ts`      | `travellingStyles.row`, `.raisedSwipeRow`                                                                                                   |

Consumers, fifteen files: `Button/Button.tsx` (:519-521), `Item/Item.tsx` (:1035, :1050-1057), `List/ListItem.tsx` (:638-644), `List/ListReorderHandle.tsx` (:186, :219, :384), `RadioList/RadioListItem.tsx` (:303, :405, :411), `CheckboxInput/CheckboxInput.tsx` (:516, :523-546), `CheckboxList/CheckboxListItem.tsx` (:377), `TreeList/TreeListItem.tsx` (:744-745), `DropdownMenu{Item,CheckboxItem,RadioItem,SubMenu}.tsx` (:313, :243, :229, :1306), `Selector/Selector.tsx` (:2331), `Token/Token.tsx` (:503, :558). `Carousel.tsx` imports only `focusOutlineStyles`, so it moves with `utils/focusOutline`, not here.

Keyframes: `pressRelease` (`press.stylex.ts:84`) and `cellRelease` (:99). Author them as `@keyframes astryxPressRelease` / `astryxCellRelease` in `packages/core/tailwind/astryx.input.css`, beside the two button keyframes — the tool moves every top-level node into `@layer astryx-base`, and the scanner reads class names, not a keyframes string in a `.ts` module. Themes declare the same 1→0 alpha animation today, so one shared name removes the duplicate.

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.
