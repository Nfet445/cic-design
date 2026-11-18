# focus ring, press layers and the override modules

Status: in-progress
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

## Comments — stage C, date family

Converted `focusOutlineStyles.focusVisible` to
`focusOutlineFocusVisibleClassName` (pattern 1 or 2, no StyleX arm left in the
element) in nine call sites across two modules. The spread call sites became a
plain `className={tw(mapClass, focusOutlineFocusVisibleClassName)}`: the ring's
former `stylex.props` arm carried no style, so `mergeProps` added nothing once
both sides were classes.

- `packages/core/src/DateInput/DateInput.tsx` — the calendar toggle. The
  comment that said the toggle keeps its ring on StyleX is gone, and
  `dateInputClasses.ts` `dateInputToggleClassName` now says the caller joins the
  ring class.
- `packages/core/src/DateInput/MonthScroller.tsx` — the day buttons.
- `packages/core/src/DateInput/PickerWheel.tsx`, `Wheel.tsx` — the touch
  columns' listbox.
- `packages/core/src/DateInput/NativeDateField.tsx`, `TouchDateField.tsx` — the
  calendar toggles.
- `packages/core/src/DateTimeInput/DateTimeInput.tsx`,
  `TouchDateTimeField.tsx` — the calendar and clock toggles, and the touch
  month/year header button.
- `packages/core/src/DateTimeInput/NativeDateSegment.tsx`,
  `NativeTimeSegment.tsx` — the native segment toggles.

Markup snapshots for `Wheel` and `PickerWheel` were repinned: the StyleX debug
name became the literal ring classes in the same position. No test reads a ring
from `getComputedStyle`. Nothing new was registered in the sheet test — the
class arms are the shared, already-registered ones, and
`build-css-tailwind.mjs` reported 178 cache hits and 0 misses on the
DateTimeInput half.

Left for stage D:

- `packages/core/src/DateInput/TouchDateField.tsx:707` — the touch
  month/year header button passes `interactionOverlayStyles.backgroundColor`
  into the ring's `stylex.props(…)`, which is pattern 3 (extra StyleX styles
  handed INTO the ring). It needs `interactionOverlayProps` to take and return
  classes first, so it waits for the stage D decision on
  `utils/interactionOverlay.stylex.ts`.

## Comments — stage B and C so far

Stage A landed `focusOutlineFocusVisibleClassName` and its six siblings in
`packages/core/src/utils/focusOutlineClasses.ts`, re-exported from
`packages/core/src/utils/index.ts`, with `.changeset/focus-ring-class-arms.md`.

Stage B proved the swap on real call sites and is done: `Pagination` dot,
`Token` remove button, `HoverCard`, `SwipeActionsLayer`, `Tooltip`,
`CommandPaletteInput`, `SideNavHeading` close button, `TabMenu` item,
`TopNavMenu` item, `ChatToolCalls` row and group header, `CodeBlock` header,
`AvatarGroupOverflow`.

### An inset ring needs no second class

`focusOutlineProps.focusVisible(insetStyles)` set `outlineOffset` at
`:focus-visible`. As a class that would be a second utility for
`outline-offset` at the same (0,2,0) specificity as the shared ring's own
`focus-visible:[outline-offset:var(--focus-outline-offset)]`, so the sheet order
would decide. The shared ring already reads `var(--focus-outline-offset)`, so an
inset is a per-instance value on the element's inline style:

```ts
type InsetRingStyle = React.CSSProperties & {
  '--focus-outline-offset'?: string;
};
```

with `'--focus-outline-offset': 'calc(-1 * var(--focus-outline-width))'`.

Stage C converts the remaining call sites in two windows: core actions and
disclosure, and overlays/chrome with the lab.

### Stage C, second window

`ChatComposerDrawer`, `Lightbox`, `Dialog`, `Popover`, `AppShell`, `CodeBlock`,
`Calendar`, `ResizeHandle`, `ListReorderHandle`, `listReorderEngine` and lab's
`CommentPin` are done; insets became
`'--focus-outline-offset': 'calc(-1 * var(--focus-outline-width))'` on the
element's inline style (`ZOOM_INSET_RING_STYLE`, `MAIN_SCROLL_INSET_RING_STYLE`,
`VIEWPORT_INSET_RING_STYLE`). A third window carries the action and disclosure
group, and a fourth carries the interaction overlay.
