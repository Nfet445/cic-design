# dialogs and sheets

Status: partly done — `Dialog`, `DialogHeader`, `AlertDialog`, `Drawer`, its header, its scrim and its content safe area, `MobileNav` and the bottom-sheet edge tint are classes. What is left is `Popover/` (this window) and the `BottomSheet` host plus `Lightbox`, which moved to ticket 50.
Blocked by: 11,17
Wave: 7
Family: `family:overlay-dismissal`
Ticket: 22
Parent: `00-epic-stylex-to-tailwind-4`

## What

Migrate `Dialog/`, `AlertDialog/`, `Drawer/` (4), `BottomSheet/` (6), `MobileNav/` and `Lightbox/`.

## Files

- `packages/core/src/Dialog/**`
- `packages/core/src/AlertDialog/**`
- `packages/core/src/Drawer/**`
- `packages/core/src/BottomSheet/**`
- `packages/core/src/MobileNav/**`
- `packages/core/src/Lightbox/**`

## Done when

- The `::backdrop`, entry animation and viewport inset come from classes the layer build carries.
- Anchor positioning keeps its CSS-only guarantee (INV21 of `architecture:layer-runtime`).

## Verification

- `pnpm exec vitest run packages/core/src/Dialog packages/core/src/AlertDialog packages/core/src/BottomSheet packages/core/src/Drawer`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.

## Result

Landed, each with its own class map, its own component edit, an entry in the
changeset `.changeset/dialog-tailwind-classes.md` and a coverage block in
`packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`:

- `cc83d31e1` — `Dialog/dialogClasses.ts`: root geometry and entrance, the
  inline preview, the scrolling inner surface and the sizing/offset variables
  (`--astryx-dialog-width`, `-max-width`, `-max-height`, `-inset-block-start`,
  `-inset-block-end`, `-inset-inline-start`, `-inset-inline-end`). `::backdrop`,
  the entrance `@keyframes` and the viewport inset are classes the layer build
  carries; both keyframes moved into `packages/core/tailwind/astryx.input.css`.
- `54fbf805d` — `AlertDialog/alertDialogClasses.ts`: the action row's
  `[touch-action:pinch-zoom]` and the stacked action's `w-full`. Button already
  keeps `min-w-0 max-w-full`, so the alert no longer repeats that pair.
- `8abbf4056` — `Layer/layerHeaderClasses.ts` (was `Dialog/dialogHeaderClasses.ts`):
  the dialog and drawer headers lay out the same row, so one map serves both, and
  `DrawerHeader` lost its own `stylex.create`.
- `fa312e375` — `Drawer/drawerClasses.ts`: the panel, its side arms, the open
  transform with its `@starting-style` first frame, the `::backdrop` scrim and
  its fade, the settled-open collapse, and the scrolling content area. The
  widths ride `--astryx-drawer-width` and `--astryx-drawer-mobile-width`, read
  by the class; `dynamicStyles.inlineSize` is gone.

### Drawer notes

- **`display` is one class, not a state pair.** `hidden` and `flex` both live in
  one layer and sort by property, not by the order they are written, so a base
  utility plus an override cannot be relied on. React already owns whether the
  panel paints (`isRendered`), so the map prints `flex` or `hidden`, never both.
- **Direction reads `:dir(rtl)` on the element.** Tailwind's `rtl:` variant
  expands to `:where(:dir(rtl), [dir="rtl"], [dir="rtl"] *)`, and the last arm
  also matches a drawer that overrides an RTL ancestor with `dir="ltr"`. The map
  uses `[&:dir(rtl)]` instead, so the nearest resolved direction wins, and
  `DrawerDirection.test.tsx` asserts that shape rather than a computed transform.
- **Mobile width keeps the inclusive breakpoint** as an arbitrary media variant
  (`[@media(max-width:640px)]`), because `max-[640px]:` compiles to
  `width < 640px` and would drop the 640px edge the StyleX rule covered.
- **`contentSafeArea` stays on StyleX.** It must beat `container()`'s own
  block-end padding, and the container rules are unlayered: an unlayered
  declaration outranks any `@layer astryx-base` class. Same class of reason as
  the Dialog fullscreen padding above.
- **Four focus tests query with `hidden: true`.** jsdom's UA sheet hides a
  popover host that is not `:popover-open`, and the stand-in that file installs
  tracks that state outside the cascade, so the panel's own `flex` class (which
  the shipped sheet carries) never reaches the accessibility tree there. The
  assertions themselves (focus return, StrictMode remount) are unchanged.

Deliberately left on StyleX, each now in its own `*.stylex.ts` beside the
class map (the shape `Card/cardBorder.stylex.ts` set), so the reason lives
with the rule:

- `Dialog/dialogFullscreenSafeArea.stylex.ts` fullscreen safe-area padding. It
  pads the same element `container()` pads, and `container()` is unlayered: an
  unlayered declaration always wins over an `@layer astryx-base` class, so the
  padding cannot move without moving `container()` first. `Dialog.tsx` still
  exports `dialogFullscreenSafeAreaPaddingContract` from the component, so the
  test's import path is unchanged.
- `AlertDialog/alertDialogTouchMotion.stylex.ts` touch motion. It must beat the
  dialog's `open:[animation-name:…]` class, which two classes in one layer
  cannot do — sheet order decides there, not the class attribute. The class map
  already prints `open:[animation-name:none]` for a dialog with no entrance, so
  the conflict is between two utilities of `dialogClasses.ts`, not a missing
  utility.
- `Drawer/drawerContentSafeArea.stylex.ts` block-end safe area. The content
  area is the drawer's container, and the container rules that own its padding
  are unlayered, so the safe-area arithmetic cannot be a class.
- `Popover/` is outside this ticket's `## What` and still holds both
  `stylex.create` blocks (the surface caps use a `firstThatWorks` fallback chain
  and `layerViewportInset` constants a class literal cannot import). It belongs
  in its own ticket.
- `Drawer/Drawer.tsx` (panel, scrim, content), `BottomSheet/` (`BottomSheet.tsx`,
  `BottomSheetPanel.tsx` 2, `BottomSheetEdgeTint.tsx`, `BottomSheetSwitcher.tsx`),
  `MobileNav/MobileNav.tsx` (2) and `Lightbox/Lightbox.tsx` (2) are untouched.

Moved assertions (a computed-style, `document.styleSheets` or StyleX debug-class
read replaced by a class-set or inline-variable assertion through
`packages/core/src/__tests__/classNameAssertions.ts`):

- `Dialog/Dialog.test.tsx`: "uses opacity-only fullscreen keyframes for the
  fullscreen variant" (source-text keyframe read) became "keeps the directional
  entrance for standard dialogs and the fade for fullscreen"; the sizing test
  now reads `--astryx-dialog-width`, `-max-width` and `-max-height`.
- `Dialog/Dialog.ssr.test.tsx`: `entryMotion()` reads the class set instead of
  `getComputedStyle(dialog).animationName`, and the hydration test compares
  class sets instead of class-name strings.
- `Dialog/Dialog.source-build.test.mjs`: the Babel/StyleX compile check became a
  source read of the border reset in `dialogClasses.ts`.
- `AlertDialog/AlertDialog.test.tsx`: the five `--x-width` debug reads became
  `--astryx-dialog-width` reads, and the `getComputedStyle(button).maxWidth` /
  `.width` reads became `expectClassSet` over `whitespace-nowrap w-full
max-w-full`.

- `d3abf1495` — `BottomSheet/bottomSheetEdgeTintClasses.ts`: the 12 px strip
  WebKit samples for the iOS toolbar colour. The mask keeps the strip, because
  WebKit disqualifies a tint whose element is `visibility: hidden` or
  `opacity: 0`; 12 px clears its 10 px sampling floor.
- `cde8fa300` — `MobileNav/mobileNavClasses.ts`: the `<dialog>` host (one
  `flex`/`hidden` display class plus the `display` transition with
  `allow-discrete`), the `::backdrop` scrim and its `@starting-style` fade, both
  drawer edges in both motion states with `[&:dir(rtl)]` arms, the header row
  and the scrolling content. The width rides
  `--astryx-mobile-nav-width`; `dynamicStyles.width` is gone.

### MobileNav notes

- **`→` is not enough for RTL here either.** The drawer parks off-screen with
  `[&:dir(rtl)]:[transform:translateX(100%)]` on the start edge and the mirror on
  the end edge, and the `@starting-style` arms carry their own direction arm so
  the entry starts from the edge the closed state parks at.
- **`overflow-clip`, not `overflow-hidden`.** `hidden` makes the dialog a scroll
  container, and a scroll container in the top layer whose subtree holds another
  scroller paints no entry transition in Chromium. `MobileNavEntryAnimation.test.tsx`
  now pins the class pair instead of reading the StyleX source with the
  TypeScript parser: the file lost its `typescript` import and its style-definition
  reader.
- **`Heading` takes `className`**, so the header's text offset
  (`ms-[var(--spacing-2)]`) is a class, not `xstyle`.

### BottomSheet host — tried and reverted (`59`-failure lesson)

`BottomSheet.tsx`'s dialog host and the switcher's dialog/positioner were
converted in this window and reverted before commit. `tsc` was clean, but
`pnpm exec vitest run packages/core/src/BottomSheet` gave 57 failures: every
assertion that read the stack recede through `getComputedStyle(positioner).transform`
(`expected '' to contain 'scale(.96)'` at `BottomSheetStacking.test.tsx:627`,
z-index and reduced-motion duration reads in `BottomSheetSwitcher.test.tsx`)
has no stylesheet to read once the class carries the style, and jsdom applies no
utility classes. The host also owns the depth recede (`origin-top`, a transform
transition, depth 1 → `translateY(calc(var(--spacing-2) * -1)) scale(0.96)`,
depth 2+ → `scale(0.92)`), so the map and the ~55 assertion moves belong in one
pass. Start from `BottomSheetStacking.test.tsx` and move those reads to class
sets before touching the component.

Still StyleX-backed and unchanged: the two fullscreen safe-area padding
assertions and the container-padding isolation test in `Dialog.test.tsx`.

Still to do in a follow-up pass on this ticket:

- `BottomSheet/BottomSheet.tsx` (host, depth recede), `BottomSheetPanel.tsx`
  (2 `stylex.create` blocks) and `BottomSheetSwitcher.tsx`.
- `Lightbox/Lightbox.tsx` (2 blocks, ~1300 lines of styles).
- `Popover/` — still the last item, with the `firstThatWorks` cap chain and the
  `Layer/layerViewportInset` constants to express through a `--_astryx-*`
  indirection; the sheet budget will need its own raise then.

The sheet budget rose from 1050 to 1080 rules: the drawer panel contributes
about 60 (two sides, two painting states, two direction arms, the scrim) and the
mobile nav about 30 (its dialog, the scrim's fade, both drawer edges in both
motion states, the header). The face here is the merged sheet, so the Card
family's variants and these classes share one ceiling.

Verification on the merged tree (`ced593a88`, then after the Drawer pass on the
merge of `poc/tailwind-layout-primitives` `4737a5bfe`, which needed no conflict
resolution):

- `pnpm exec vitest run packages/core/src/Drawer packages/core/src/BottomSheet
packages/core/src/MobileNav packages/core/src/Lightbox packages/core/src/Dialog
packages/core/src/AlertDialog
packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs` — 1319
  passed, 50 files.
- `pnpm exec vitest run packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`
  — 54 passed, rule budget 1050, sheet 149.1 kB.
- `node packages/core/scripts/build-css-tailwind.mjs` — 149.1 kB.
- `pnpm -F @astryxdesign/core typecheck` — exit 0.
- Prettier and ESLint on every touched file — clean.

The merge of `poc/tailwind-layout-primitives` (`ced593a88`) needed no conflict
resolution in the sheet test: both sides added their own imports and their own
coverage block, and the merged sheet fits the existing budget of 860.

Second window on the merged tree (`9afca0d75`, merging
`poc/tailwind-layout-primitives` at `b3bb8cdfa` — ticket 23's bottom-sheet frame
and the Card/DropdownMenu class maps):

- `pnpm exec vitest run packages/core/src/Layout packages/core/src/Card
packages/core/src/DropdownMenu packages/core/src/MobileNav
packages/core/src/BottomSheet` — 1367 passed, 56 files.
- `pnpm exec vitest run packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`
  — 54 passed, budget 1080, sheet 153.1 kB.
- `node packages/core/scripts/build-css-tailwind.mjs` — 153.1 kB.
- `pnpm exec tsc -p packages/core/tsconfig.json --noEmit` — exit 0.
- The one merge conflict was the budget comment and value in the sheet test;
  both sides are kept (see above) and `node --check` passes.

Third window (`543805881`, on the merge of `poc/tailwind-layout-primitives`,
then the merge `1be004522`):

- `543805881` — the three rules that have to stay unlayered moved out of the
  component files into a `*.stylex.ts` beside the class map, one file each:
  `Dialog/dialogFullscreenSafeArea.stylex.ts`,
  `AlertDialog/alertDialogTouchMotion.stylex.ts` and
  `Drawer/drawerContentSafeArea.stylex.ts`. Each file header states which
  unlayered rule the StyleX rule must beat, so the reason no longer sits in a
  component that otherwise has no StyleX. `Dialog.tsx` re-exports
  `dialogFullscreenSafeAreaPaddingContract`, and `AlertDialog.tsx` lost its
  `@stylexjs/stylex` import with the rule. No behavior, no class and no
  assertion changed: the moved rules are StyleX still, so the sheet, the class
  sets and every computed-style read are identical.

Decided with the sheet in hand, not from the comment:

- `Dialog` fullscreen padding stays StyleX. `container()` pads the element from
  an unlayered rule, and an unlayered declaration outranks `@layer
astryx-base` whatever the class declares.
- `AlertDialog` touch motion stays StyleX. `dialogClasses.ts` sets
  `open:[animation-name:astryxDialogEnter]` (and the fullscreen variant from
  `:49`, `:53`) on the same element; `dialogClasses.ts:57` already carries
  `open:[animation-name:none]`, so the question was never a missing utility —
  two utilities in one layer are decided by sheet order, which the class
  attribute cannot express. An unlayered `animation-name: none` can.
- `Drawer` block-end safe area stays StyleX for the reason recorded when the
  panel landed.

Window findings:

- `packages/core/src/DropdownMenu/DropdownMenu.tsx:834` fails `tsc
-p packages/core/tsconfig.json --noEmit` with `TS2353: Object literal may
only specify known properties, and 'className' does not exist in type
'CSSProperties'`. It is present on the tree before this window's edits
  (verified by stashing them) and comes from the `poc` merge; DropdownMenu is
  another ticket's file, so it is left for its owner.
- `poc` carries two unformatted files this ticket does not own:
  `Banner/Banner.doc.mjs` and `Divider/Divider.doc.mjs` fail
  `prettier --check`.
- The sheet test needed no conflict resolution this time: the merge took both
  sides' coverage blocks on its own and `node --check` passes. The budget did
  not move for this window's work, because no class was added.

Verification on the merged tree (`1be004522`):

- `pnpm exec vitest run packages/core/src/BottomSheet
packages/core/src/Lightbox packages/core/src/Dialog packages/core/src/AlertDialog
packages/core/src/Drawer packages/core/src/Popover packages/core/src/Layout
packages/core/src/Banner packages/core/src/Divider packages/core/src/SideNav
packages/core/src/TreeList packages/core/src/Card packages/core/src/MobileNav`
  — 2221 passed, 75 files.
- `pnpm exec vitest run packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`
  — 54 passed, sheet 158.8 kB.
- `node packages/core/scripts/build-css-tailwind.mjs` — 158.8 kB (153.1 kB
  before the merge of the Divider/`SideNav`/`TreeList`/`Banner` class maps).
- Prettier and ESLint on every touched file — clean.

Fourth window (`6fa34afa2`, merge `e98456473`): no class landed. The window
owed four sites; two minutes of reading showed none of them fits beside its
assertion moves, and the edit window closed before any of them was green. What
this window buys the next one is the exact seam for each, below. Nothing in the
tree changed, so the sheet, the class sets and every assertion are identical.

### Measured cost of each remaining site

- `BottomSheet/` — 4 sites, and `BottomSheetStacking.test.tsx` (3260 lines) plus
  `BottomSheetPanel.test.tsx` (1056) hold 20 `getComputedStyle`/
  `document.styleSheets` reads between them. This is the `59`-failure lesson's
  scope, not one window's.
- `Lightbox/Lightbox.tsx` — 2 blocks, ~1300 lines of styles, one test read
  (`Lightbox.test.tsx`). Cheap on assertions, expensive on style volume.
- `Popover/` — 2 blocks, 6 + 3 style keys, and only one test read. Smallest of
  the three, with the one prescription the ticket already carries.

### `Popover/` seam, read off the code

- **The caps cannot travel through `xstyle`.** `Popover.tsx:588-592` hands
  `styles.surfaceViewportFit` and `styles.surfaceScrollable` to
  `usePopoverInternal({xstyle: [...]})`; that option is typed `StyleXStyles`
  and lands in `focusOutlineProps.focusVisible(...)` and `stylex.props()` at
  `usePopover.tsx:715-720`. A class there reaches no stylesheet. The class seam
  is `usePopover`'s own `className` option (`usePopover.tsx:167`), which
  `Popover.tsx:597` already uses for `layerAnimations[placement]`.
- So the cap class and its `--astryx-popover-max-inline-size` value ride
  `className` and `style`, and `xstyle` keeps only the caller's `xstyle`.
- **`popoverSizeXstyle` (`Popover.tsx:1054`) is not a surface style.** It goes
  to `popover.render(...)`'s `xstyle` (`Popover.tsx:1110`), i.e. the layer's
  positioned element, so its `matchTrigger`/`customWidth` do not sit on the
  same element as `surfaceViewportFit` and must not be folded into the class
  that carries it.
- **The anchor chain collapses to one arm without a behavior change.**
  `firstThatWorks`' third arm `'anchor-size(width)'` and the `…Fallback` arms
  cover engines without anchor positioning or `env()`: there both
  `min(anchor-size(width), …)` and its fallback parse to nothing, so
  `min-width` stays `auto` either way. One
  `[min-width:min(anchor-size(width),var(--astryx-popover-max-inline-size))]`
  is equivalent, and it needs no `stylex.create`.
- **Three new variables, not one.** `--astryx-popover-max-inline-size`,
  `--astryx-popover-max-block-size` (`surfaceViewportFit` has both axes) and
  `--astryx-popover-width` (the per-instance `customWidth`). Each needs a
  `Popover.doc.mjs` entry and a line in
  `packages/core/src/theme/derivedVarRegistry.test.ts`.
- **`usePopover.tsx`'s own `surface`, `contentWrapper` and
  `closeButtonWrapper` stay StyleX beside retained StyleX neighbours:**
  `focusOutlineProps.focusVisible(...)` and `paddingStyles[padding]` are
  `Layout`/`utils`-owned and unlayered, so the three classes join
  `mergeProps`' third argument (`usePopover.tsx:712-714`) and
  `stylex.props(rtlStyles.centerInline('100%'))` stays at
  `usePopover.tsx:723-726`.
- **`usePopover.forcedColorsEdge.test.tsx` goes vacuous once `surface` is a
  class.** It walks `document.styleSheets` and matches class names, so it
  finds no rule and its `toEqual([])` passes without proving anything. Move it
  to `expectClassSet` over the three `forced-colors:` border classes.

### This window's verification (merge `e98456473`, no conflict)

- `node packages/core/scripts/build-css-tailwind.mjs` — 166.5 kB (158.8 kB at
  `1be004522`; the tickets folded in between (`DropdownMenu`, `DateInput`,
  `StatusDot`, `Blockquote`, `Code`, `Badge`) own the difference).
- `pnpm exec vitest run packages/core/src/BottomSheet packages/core/src/Lightbox
packages/core/src/Popover packages/core/src/Dialog
packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs` — 1158
  passed, 32 files.
- The merge of `poc/tailwind-layout-primitives` (`e98456473`) brought one docs
  commit and no sheet-test conflict, so there was nothing to keep on both
  sides; `git status` is clean and no file was staged.

Left for the next window, unchanged by this one:

- `BottomSheetPanel.tsx` (the `pastGrabBarStyles` map at `:286` and the
  `styles` map at `:332`), `BottomSheet.tsx:136` and
  `BottomSheetSwitcher.tsx:98`. Start from the assertions, as the `59`-failure
  lesson above says: `BottomSheetPanel.test.tsx:738`, `:742`, `:967`, `:1050`
  and the `document.styleSheets` walks at `:845`/`:866` read the panel's own
  declarations, and `BottomSheetStacking.test.tsx:627` onward reads the
  positioner's transform. The panel alone is 15 style keys plus a 12-step
  padding map, so it is one window of its own.
- `Lightbox/Lightbox.tsx:193` and `:578` (`pageStyles`): 2 blocks and about
  1300 lines of styles.
- `Popover/Popover.tsx:395` and `Popover/usePopover.tsx:91`: the caps ride
  `stylex.firstThatWorks` over `layerViewportInset` constants, and a class
  literal cannot import one, so the constant's value has to be written into the
  class and the coupling recorded here.
