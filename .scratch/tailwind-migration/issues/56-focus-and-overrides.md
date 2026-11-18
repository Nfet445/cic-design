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

## Plan (measured 2026-11-18, after `f3c0039d3`)

A class CAN express the ring: a Tailwind variant prints `.class:focus-visible`
(specificity 0,2,0) and `[&:has(:focus-visible)]:` prints 0,3,0, so the ring
beats a rest-state utility inside `@layer astryx-base` on specificity rather
than on sheet order. What kept the seam on StyleX was the unlayered
declarations of components that still held maps; once those are gone, nothing
is left to outrank.

Measured call sites, excluding tests: `focusOutlineProps.` and
`focusOutlineStyles.` appear in 93 files (`focusVisible(` 72, `focusWithin(` 3,
`suppressed(` 2, `focusWithinFirstChild(`, `focusWithinOrPublished(`
`publishFocusVisibleVars(` 1 each); `interactionOverlayProps.` and
`interactionOverlayStyles.` appear 60 times. By directory the largest are
`DateInput` 6, `DropdownMenu` 5, `Chat` 5, `TopNav` 4, `DateTimeInput` 4,
`TabList` 3, `SideNav` 3, plus `lab/Schedule` 2 and `lab/Comments` 2.

### Stages (parent does stage A and B, then one window per group)

A. New `packages/core/src/utils/focusOutlineClasses.ts` with literal classes for
every variant and a class-based `focusOutlineProps` whose functions accept
class strings and return `{className}`; `FOCUS_OUTLINE` and
`FOCUS_OUTLINE_PARTS` move there unchanged.
B. Prove the shape on three call sites of different kinds (a plain button, a
`stylex.props(...)` spread, and one that passes `xstyle`), verify in the
built sheet that the variant rules exist and print after the rest state.
C. One window per group: `core/DateInput`+`DateTimeInput`, `core/DropdownMenu`+
`Chat`+`TopNav`+`TabList`+`SideNav`, the rest of core, then `lab`.
D. Delete `utils/focusOutline.stylex.ts` and `utils/interactionOverlay.stylex.ts`,
fold or document every `*Overrides.stylex.ts`, then answer ticket 36 in
`## Comments`: which rules stay and why, or that nothing stays.

## Stage D — the press overlay

The ring half is class-shaped and is moving window by window. The overlay half is not, yet, and it is the
second half of this ticket. Measured at the time of writing: 47 non-test call sites name
`interactionOverlayStyles.` or `interactionOverlayProps.`.

`packages/core/src/utils/interactionOverlayClasses.ts` publishes
`interactionOverlayBackgroundImageClassName`, but it is a shortcut, not a replacement: it paints the hover
and pressed gradients and the two `data-astryx-press` arms, and it carries neither the strength variable
nor the release animation. A component that swaps its StyleX arm for that class keeps its paint and silently
loses the fade.

The full arm has to state, in Class-text form:

1. `--astryx-press-alpha` strength arms — `1` under `[data-astryx-press=on]`, and the `fading` arm runs the
   release; the registered `@property` (a `<number>` from 0 to 1) stays where it is declared today, and it
   must keep living in one place because the controller writes the same property.
2. `--_press-paint` and `--_press-paint-image` — the `color-mix` expression over the pressed token and the
   strength, carried on the element the controller writes to, plus the `var()` readers for a descendant or
   a `::after` that paints instead.
3. The release animation — `animation-name`, `animation-duration` (with its reduce-motion arm),
   `animation-timing-function` and `animation-fill-mode: both`, keyed on `[data-astryx-press=fading]`. The
   keyframes move to `packages/core/tailwind/astryx.input.css` as `@keyframes astryxPressRelease`, like
   every other migrated animation.
4. The mouse arms exactly as the StyleX map states them: hover and `:active` under `@media (hover: hover)`,
   `:active` alone otherwise, `background-color` arms yielding to the image while the controller paints, and
   the coarse-pointer reset that stops `:active` from painting on a finger.

The specificity problem the ring solved with `:has()` appears here too: the hover arm and the pressed arm
set the same property, so each arm needs its own rank rather than an order. The file's own comment already
explains why the StyleX version keeps the enabled guard outside the media branch, and the class version
must reproduce that reason, not the letter.

Once the arm exists, the call sites convert the same three ways the ring did: a bare spread becomes a
`tw()` join, a ring-plus-overlay `stylex.props` becomes `mergeProps(themeProps(…), stylex.props(rest), tw(classes, overlayClass), style)`,
and a descriptor-looking ❝`{...interactionOverlayProps.backgroundImage}` ❞ inside a `stylex.props` moves
the class to the element. `xstyle` stays last and unlayered.
