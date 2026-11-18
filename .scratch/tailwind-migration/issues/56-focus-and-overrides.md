# focus ring, press layers and the override modules

Status: done
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

### Stage D, what the overlay arm learned (window 56g)

A converted overlay site keeps exactly `interactionOverlayStyles.pressedAlpha` in its StyleX
argument: that entry publishes `--astryx-press-alpha`, the release animation and the
`--_press-paint-image` variable the new class reads, and it writes no `background-image` or
`background-color`, so it cannot outrank the class. Sites whose whole reason for the map was the
strength or the release (`Thumbnail`, `ClickableCard`, `CheckboxInput`, `CheckboxListItem`,
`SelectableCard`) plus `AvatarGroupOverflow`'s `backgroundImageOnNeutral` stay as they are.

The overlay class family lives in `packages/core/src/utils/interactionOverlayClasses.ts`
(`interactionOverlayBackgroundImageClassName`, `interactionOverlayBackgroundColorClassName`,
`interactionOverlayPressedBackgroundColorClassName`).

### Stage D, window I: chrome, actions, and the lab pin

Every overlay arm in the window's seventeen files now reads a class. One commit per file, in the
brief's order: `TopNavItem`, `TopNavMenu`, `TopNavMegaMenu`, `TopNavMegaMenuItem` (both render
branches each), `SideNavItem` (collapsed, expanded, the actions row and the toggle),
`SideNavHeading` (collapsed link and menu trigger), `Token` (three sites), `Outline` (item link),
`Link` (anchor and button forms), `Collapsible` (trigger row), `SegmentedControlItem` (the segments
a press can change), `Calendar` (day button), `Stepper/Step` (four buttons: the circle, the row, and
both densities' blocks), `lab/CommentPin`. Each site keeps exactly
`interactionOverlayStyles.pressedAlpha` and puts the paint class in its `tw()` call;
`Step` also moves its four `focusOutlineStyles.focusVisible` arms to
`focusOutlineFocusVisibleClassName`.

Two files in the list had nothing to convert: `TabList/Tab` already carried
`!isDisabled && interactionOverlayStyles.pressedAlpha` with `focusOutlineFocusVisibleClassName`, and
`CommandPalette/CommandPaletteItem` already carried the background class beside `pressedAlpha`.

`Button/Button.tsx` stays a survivor. The ticket states no reason of its own; the reason lives in
code — `buttonTrackedOverlayClassName()` (`packages/core/src/Button/buttonClasses.ts`) returns
`'[&:active:not([data-astryx-press=on])]:[background-size:0_0]'`, a class that can hide the overlay
image only by its size, because an unlayered StyleX declaration outranks a class. Converting the
button means editing that module — outside this window's list — and then the trick can become
`[background-image:none]`, since both arms are classes in one layer and the `:not()` arm is the more
specific of the two. A person should decide that as one small change with its own commit.

Three suites asserted the press with `hasPressedArm` (a rule in the stylesheet). They now read the
class instead, through `expectClassSet`: `Collapsible.test.tsx`, `Link.test.tsx`,
`SegmentedControl.test.tsx`. The rest of the touched suites needed no change;
`TokenizerBottomSheet.test.tsx` reports one failure under a full multi-directory run that passes
when run alone (an `FR20` settle timing flake, unrelated to the overlay).

### Stage D, window K: last overlays, triggers and layers

Three files converted; eight kept with a reason; five in the list had no map at all. One commit per
file.

| file                                                         | maps removed                                        | maps kept, and why                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------ | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Tokenizer/Tokenizer.tsx`                                    | `truncatedSizeStyles`, `layerPlaceholderSizeStyles` | `styles`: the wrapper is the same element as `fieldInputWrapperClassName()` and `inputGroupMemberClassName()`, and its unlayered padding, gap, flex-wrap and height must beat those classes. The input states tie against `typeaheadInputClassName`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `SideNav/SideNav.tsx`                                        | `leftoverStyles.resizableHandle`                    | none                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `SideNav/SideNavItem.tsx`                                    | none                                                | `leftoverStyles` (collapsed row) and `indentStyles` (indent per depth) must beat `navItemStyles`' padding, which no class can.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `Selector/SelectorOption.tsx`                                | none                                                | no `stylex.create` map: only an `xstyle` pass-through and its JSDoc.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `Resizable/ResizeHandle.tsx`                                 | none                                                | `styles` and `dynamicStyles`. The arms are a selection, not a set: `overlay` rewrites the handle's own background, `horizontal`/`vertical` and `noDivider*` rewrite its width and height, and `pillHidden`/`pillVisible`/`pillHover`/`pillActive` write the same `opacity`, `pointer-events` and `background-color`. `stylex.props` resolves those last-wins inside one call; as classes they would all sit in one attribute and the sheet order would decide. `hitAreaLength*`, `pillOffset*` and `pillOffsetY` take a measured pane length or a side at runtime. The conversion is a restructure into one class set per element (nested ternaries replacing the "all arms present" list), not a rename — its own window. |
| `Chat/ChatComposerDrawer.tsx`                                | none                                                | no map: `xstyle` pass-through only.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `Typeahead/Typeahead.tsx`                                    | none                                                | `wrapper` shares the element with `fieldInputWrapperClassName()`, so its `padding-block` and `gap` would tie with that class inside `astryx-base`. `inputHidden` travels through `BaseTypeahead`'s `inputXStyle` and `tokenOverlay` through `Token`'s `xstyle`, both StyleX-only slots — converting them is a public prop change on those two components.                                                                                                                                                                                                                                                                                                                                                                  |
| `Typeahead/BaseTypeahead.tsx`                                | none                                                | `dropdown` and `popover` use `stylex.firstThatWorks`: two declarations of one property whose order _is_ the fallback, which a class pair cannot state. `dropdownHeld` and `popoverCustomWidth` take runtime values in the same slot.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `Table/TableCell.tsx`, `TableHeaderCell.tsx`, `TableRow.tsx` | none                                                | no maps: `xstyle` pass-through only. Ticket 57 already moved the context-menu trigger to `triggerClassName`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `Layer/useLayer.tsx`                                         | none                                                | `base` is the reset that must outrank every class a layer element carries, so it has to stay unlayered; `keyboardCap` writes three private custom properties from runtime values; `placement*` and `gutter*`/`viewportFit` are anchor-positioning arms that must beat `base`'s margin reset and carry a runtime clearance; `fixed` and `scrollsOnOverflow` are joined with `base` in the same call. This map is the blocker under `BreadcrumbItem`'s and `anchoredHint`'s surfaces.                                                                                                                                                                                                                                        |
| `AppShell/AppShell.tsx`                                      | `skipLink`                                          | the area fills and `mainFocusTarget` travel through `LayoutPanel`'s and `LayoutContent`'s `xstyle`, which takes StyleX styles only; `mainElevatedCorner` pairs with that ring; the safe-area arms live in the documented safe-area modules.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `Breadcrumbs/BreadcrumbItem.tsx`                             | none                                                | `menuStyles.popover`: the layer element carries `useLayer`'s unlayered `base`, which zeroes `margin`, so a class margin would lose. `Layer` has a `className` option, but the reset keeps the margin StyleX.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `hooks/anchoredHint.tsx`                                     | none                                                | `styles.hint` and `passive`: the same layer `base` reset zeroes the hint's padding and margin, and the hint's own block margin is an inline style at the call site.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `DropdownMenu/DropdownMenuSubMenu.tsx`                       | none                                                | `triggerStyles.caret` — verified as the documented survivor: the caret is a structural-only slot wrapper (`display: flex`, `align-items: center`), and a class string resolves to no style for the wrapper rule.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

Notes for whoever continues:

- The brief's counts were stale for `SelectorOption`, the three `Table` files and
  `ChatComposerDrawer`: none of them has a `stylex.create` map any more.
- The four files that remain are blocked on seams, not on effort: `ResizeHandle` needs its
  per-element selection restructured, `Typeahead` needs `inputClassName`/`className` on
  `BaseTypeahead` and `Token`, and `BreadcrumbItem`/`anchoredHint` need `useLayer`'s `base` reset to
  move first. `useLayer`'s `base` moving is the single change that unblocks the most.
- Sheet measured 2230 rules before this window and 2242 after (ceiling 2260, unchanged);
  `dist/astryx-tailwind.css` 372.6 kB → 373.7 kB. `AppShell`'s classes were not registered in the
  sheet test before this window; `APP_SHELL_SKIP_LINK_CLASS`, `sideNavClassName.resizableHandle` and
  `tokenizerFixedHeightClassName` now are.

## Closing note

Every ring site that could take a class now does: `grep -rl "focusOutlineProps.focusVisible("` over
non-test sources is empty, and the overlay family moved in windows 56g/H/I/K. What stays is the seam
list below, each blocked by a StyleX-only argument rather than by paint:

- `KeyboardFocusOutlineStyles` arms that publish variables (`publishFocusVisibleVars`) stay in
  `packages/core/src/utils/focusOutline.stylex.ts`; they are variables, not paint.
- Other `focusOutlineProps` members (`focusWithin`, `focusWithinFirstChild`,
  `focusWithinOrPublished`, `suppressed`) still serve files whose element also receives an unlayered
  reset from `Layer/useLayer.tsx`, which is the same blocker `BreadcrumbItem` and `anchoredHint`
  record.
