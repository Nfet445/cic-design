# layout, text and stack utilities

Status: blocked — the last StyleX rule is the lab LineClamp tooltip read
Blocked by: 30 (its `lab` LineClamp still reads `Text/text.stylex`)
Wave: 10
Ticket: 54
Parent: `00-epic-stylex-to-tailwind-4`

## What

The utility modules every component composes but that still build a `stylex.create` map.
They are what keeps the StyleX runtime in the package after the components themselves moved.

## Measured scope

- `packages/core/src/Layout/container.stylex.ts` 15 maps — `container()` returns the four
  container paddings and corners from theme variables; Card, Section, Dialog, BottomSheet and
  Drawer call it.
- `packages/core/src/Layout/padding.stylex.ts` 14 maps — the container variables and the overlay
  reset that must stay unlayered.
- `packages/core/src/Layout/paddingStyles.stylex.ts` 1, `containerCorners.stylex.ts` 1,
  `edgeCompensation.stylex.ts` 1, `overlayPaddingReset.stylex.ts` 1.
- `packages/core/src/Text/text.stylex.ts` 15 maps — Heading and lab `LineClamp` still read it.
- `packages/core/src/Stack/stack.stylex.ts` 6 and `Stack/stackItem.stylex.ts` 3 — kept for the
  deprecated public subpaths and for readers that never moved.

## Done when

- Each of those modules publishes custom properties and literal classes instead of a map, and its
  deprecated subpath either re-exports classes or states why it must keep a StyleX export.
- `rg "stylex.create" packages/core/src/Layout packages/core/src/Text packages/core/src/Stack`
  returns nothing but `privateAttributes`-style owners with a written reason.
- Card, Section, Dialog, BottomSheet and Drawer keep their theme overrides: `pnpm -F
@astryxdesign/core build` and `astryx theme build packages/themes/neutral/src/neutralTheme.ts`
  both succeed, and the emitted CSS keeps every `--astryx-<component>-padding*` name.

## Verification

- `node packages/core/scripts/build-css-tailwind.mjs`
- `pnpm exec vitest run packages/core/src/{Layout,Text,Stack,Card,Section,Dialog,BottomSheet,Drawer} packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`
- `pnpm -F @astryxdesign/core typecheck`
- Manual Windows High Contrast check where a border or focus ring moves.

## Notes

- Follow `.scratch/tailwind-migration/README.md`: literal class text only, a per-instance value is a
  class plus an inline `--astryx-*` property, and a rule that must beat a layer utility stays in its
  own module with a reason.

## Comments — window 1

Landed: `Stack` and `StackItem` (`stackClasses.ts`, `stackItemClasses.ts` now the only map), the `Text`
scale, the padding boundary as `layoutPaddingResetClassName` in `Layout/layoutClasses.ts` (published
through `Layout/padding.stylex` as `overlayPaddingReset.reset`, now a class string), and the overlay
roots that read it (Dialog, Drawer, BottomSheet panel, Lightbox, MobileNav, AppShell, Layer). The seven
tests that read the reset's custom properties from `getComputedStyle` now read the class set, because a
utility's custom property never resolves in jsdom.

Left: `Layout/padding.stylex.ts` still builds 14 maps (the container variables, `paddingInlineStyles`,
`paddingBlockStyles`, `paddingInlineStartStyles`, …, which carry the numeric steps for callers that pass a
number), plus `paddingStyles.stylex.ts` and `edgeCompensation.stylex.ts` (1 each). The steps in
`paddingClasses.ts` already exist; the work is making every numeric caller use them and teaching the
container variables the same class-plus-inline-property shape.

## Comments — window 2

Landed `refactor(layout): отдать числовые отступы классам` (36 files): `padding.stylex.ts`,
`paddingStyles.stylex.ts` and `edgeCompensation.stylex.ts` are gone; every numeric caller (Layout region
components, Section, Banner, Toolbar, ScrollableArea, Popover, Dialog, Drawer, BottomSheet, PowerSearch)
takes the step class from `paddingClasses.ts`. Suites: 50 files / 1405 tests, then 88 files / 2351 on the
integration branch, with only the pre-existing Chinese-calendar failure.

Left: `Layout/container.stylex.ts` (15 maps) and `Layout/containerCorners.stylex.ts` (1). `container()` is
the seam every padded surface calls (Card, Section, Dialog, Drawer, BottomSheet, Popover, Banner, Toolbar,
ScrollableArea), so its maps carry the step, the edge compensation and the published corner variables at
once; each needs the class-per-step treatment plus the corner variables as inline custom properties.

## Comments — window 3

The container landed before this window (`refactor(layout): вернуть container как класс вместо карты
StyleX`, `refactor(layout): отдать углы контейнера классам`): `Layout/container.stylex.ts` is a re-export
shim, `containerCornersClasses.ts` carries the corners, `overlayPaddingReset.stylex.ts` keeps only the
reset that must outrank a layer utility. Step 2's grep over `Layout`, `Text`, `Stack`, `Section` and
`Toolbar` returns one production hit, `Text/truncationTooltip.stylex.ts:18`; the other hits are a test
fixture and the `*stylex.create()*` prose in `.doc.mjs` files.

Landed `refactor(text): оставить StyleX только правило подсказки переноса`: `Text/text.stylex.ts` is a
shim again — it re-exports the class builders and the one remaining StyleX value, whose map moved to
`Text/truncationTooltip.stylex.ts` with its reason. The declarations the map holds were already literal
classes: `truncationTooltipContentClassName` (`max-w-[300px]`, `[word-break:break-word]`) in
`textClasses.ts` from the first window, so the sheet gains no class: it measured 2215 on this branch
before the merge and 2224 after it, still under the 2230 ceiling.

Stays StyleX: `truncationTooltipStyles`, because `packages/lab` LineClamp passes it to `stylex.props`
(`packages/lab/src/LineClamp/LineClamp.tsx:548`). A class string in that position becomes an inline style
and no `className` — `stylex.props('max-w-[300px]')` returns `{style: {0:'m',1:'a',2:'x',…}}` — so the
tooltip would silently lose both declarations. `Text` and `Heading` already paint the tooltip from the
class.

Left: that one lab call, in ticket 30's files, which this ticket's standing rules put out of reach.
`<span {...stylex.props(truncationTooltipStyles.content)}>` becomes
`<span className={truncationTooltipContentClassName}>`; then `Text/truncationTooltip.stylex.ts` can be
deleted with the `./Text/text.stylex` export entry and its `['truncationTooltipStyles']` line in
`__tests__/publicStyleXNamespaces.test.ts`. Status stays blocked on that call, so the epic box stays
unticked.
