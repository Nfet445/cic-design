# tabs and headings

Status: done
Blocked by: 18
Wave: 6
Family: `family:navigation-destinations`
Ticket: 19
Parent: `00-epic-stylex-to-tailwind-4`

## What

Migrate `TabList/` (10), nav-mode `Tab/`, `TabMenu/`, `NavHeadingMenu/`, `NavHeadingMenuItem/` and `SegmentedControl/` (5).

## Files

- `packages/core/src/TabList/**`
- `packages/core/src/TabMenu/**`
- `packages/core/src/NavMenu/**`
- `packages/core/src/SegmentedControl/**`

## Done when

- The active-third-order indicator keeps its measured position after the move.
- `SegmentedControl` stays the named exception of `family:action-groups` and follows the button maps.

## Verification

- `pnpm exec vitest run packages/core/src/TabList packages/core/src/SegmentedControl`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.

## Result

All five `stylex.create` calls in the family are gone. `TabList`, `Tab`,
`TabMenu`, `NavHeadingMenu`, `NavHeadingMenuItem` and now `SegmentedControl`
paint from class maps; the compose order everywhere is
`mergeProps(<what stays StyleX>, tw(<classes>, className), style)`.

### SegmentedControl

- New map `packages/core/src/SegmentedControl/segmentedControlClasses.ts`:
  `segmentedControlClassName` (track box, `hug`/`fill`, disabled, lens) and
  `segmentedItemClassName` (box, three sizes, concentric radius, selection,
  disabled, layout, icon-only, touch presentation), plus
  `segmentedItemIconSizeClassName`, `SEGMENT_ICON_CLASS`, `SEGMENT_LABEL_CLASS`.
  A property that a state changes is emitted by exactly one branch.
- The lens stays two pseudo-elements of the radiogroup, so the element count
  the selection-motion tests measure is unchanged. `::before` and `::after`
  keep every declaration they had, now as classes reading the
  `--_segmented-lens-*` / `--_segmented-after-*` variables the motion writes.
  I checked the 39 properties per pseudo against the old style block one by
  one; the set is identical.
- Per-instance values stay on variables: `--_segmented-control-padding` and
  `--_segmented-control-radius` on the track, read back by the segment's
  concentric radius (`max(0px, calc(radius - padding))`), so a theme that
  changes either one keeps the nesting true.
- `focusOutlineProps.focusVisible`, `interactionOverlayStyles.backgroundColor`
  and `touchHitAreaStyles.layer` stay StyleX, in that order, with `xstyle`
  last; `hasPressedArm` and the press tests are untouched.

Decision to review: the forced-colors arms (`aria-checked` →
Highlight/HighlightText, plus `forced-color-adjust: none`) are emitted only for
a selected **and** enabled segment. A disabled selected segment drops them
because its `--color-text-disabled` arm has to win, and a Highlight fill under
a disabled colour reads as an active selection. Before the move the arms had no
disabled branch at all, so a disabled selected segment was HighlightText on
ButtonFace. `SegmentedControl.test.tsx` asserts both sides of that rule.

### Assertions that moved, and why

`getComputedStyle` and the injected-StyleX helpers never proved anything about
the shipped sheet: jsdom cannot parse the built Tailwind sheet at all. Each one
moved to `classesOf` / `expectClassSet` from
`packages/core/src/__tests__/classNameAssertions.ts`, under the same test name
and with the same intent:

| test                                                                | before                                                     | after                                                                                                     |
| ------------------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| keeps hug layout content-sized inside a stretching flex parent      | `width: fit-content`                                       | `inline-flex`, `w-fit`                                                                                    |
| fill layout overrides the intrinsic control width                   | `width: 100%`                                              | `flex`, `w-full`, no `w-fit`                                                                              |
| fill items can shrink and truncate long labels                      | `min-width`, `overflow`, `text-overflow`                   | `min-w-0`, `flex-1`, `overflow-hidden`, `text-ellipsis`                                                   |
| caps the hug layout at its container and lets segments truncate     | `max-width`, `min-width`, `flex-shrink`                    | the `:has([role=radio]:not([aria-label]))` cap pair, `min-w-0`, no `shrink-0` on a labelled segment       |
| keeps the content-sized hug layout from #6643 while adding the cap  | `width`, `max-width`, `display`                            | `inline-flex`, `w-fit`, cap pair, no `w-full`                                                             |
| lets a fill control yield to a narrow row too                       | `width`, `min-width`, `max-width`                          | `w-full`, cap pair, no `w-fit`                                                                            |
| truncates the label of an icon-and-label segment but keeps its icon | `min-width`, `flex-shrink`, `text-overflow`                | `min-w-0`, `shrink-0` on the icon box, `text-ellipsis`                                                    |
| does not cap a control whose segments are all icon-only             | `width`, `max-width`, `min-width`, per-radio `flex-shrink` | `w-fit`, `[max-width:none]`, `[min-width:auto]`, `shrink-0` per radio                                     |
| compiles forced-colors overrides …                                  | `getForcedColorsRules()`, `getAllInjectedCss()`            | the three class names, plus the disabled pair as a new case                                               |
| keeps the pointer presentation as it was …                          | `transition-property`                                      | `transition-[color,background-color,box-shadow]`, `duration-[var(--duration-fast)]`, no `transition-none` |
| one touch model: a finger on any engine …                           | `transition-property === 'none'`                           | `transition-none`, no surface transition class                                                            |

No assertion was dropped: the icon-only cap test now states in the test why
both the base width and the cap arms are present (the cap keys off a labelled
radio, which such a track has none of).

`packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs` gained the
SegmentedControl walk (3 track layouts × disabled × lens, 3 sizes × selection ×
disabled, one fill + icon-only + touch arm, the icon size map and the two box
constants) and four declaration cases: the lens variables, the concentric
radius, the labelled-track cap, and the forced-colors arms.

### Sheet

- `node packages/core/scripts/build-css-tailwind.mjs` → `dist/astryx-tailwind.css`
  **123.4 kB** (126 367 B raw).
- Rules **891** against `expect(stylesheet.rules.size).toBeLessThan(940)` — the
  budget comment already names the tab family; no bump was needed.
- Gzip **16 616 B** against the 48 680 B gate (1.15 × 42 331 at `f35022021`).
- `pnpm exec vitest run packages/core/src/SegmentedControl
packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`
  → 177 passed. `pnpm -F @astryxdesign/core typecheck`, prettier and eslint
  (0 errors) are clean.

### Still open, for review

- Manual Windows High Contrast check not done: the segment draws a selected
  surface, a box shadow and a focus ring, so a person has to look at it. The
  class set is asserted; the pixels are not.
- The Playwright specs in `packages/core/src/SegmentedControl/__tests__/`
  (`interaction.browser.spec.ts`, the hit-area and label-contrast specs) were
  not run here; they need a built Storybook and installed browsers. They read
  `::before`/`::after` computed styles, so they are the closest thing to the
  pixel check this ticket has.
- No browser check page was added for `family:navigation-destinations`; the
  TabList slice of this ticket shipped without one, so this ticket keeps that
  gap rather than inventing a page for half a family.

## Closing notes

- `TabList` (strip, masks, arrows), `Tab`, `TabMenu`, `NavHeadingMenu` landed in `c2e73e856`; `SegmentedControl` and `SegmentedControlItem` in `6ae979c3e` via `packages/core/src/SegmentedControl/segmentedControlClasses.ts`, merged `298f7c870`. No `stylex.create` remains in `TabList/`, `Tab/`, `TabMenu/`, `NavHeadingMenu/` or `SegmentedControl/`.
- Two `TabList.test.tsx` assertions read `getComputedStyle(strip).maskImage`, which jsdom cannot answer once the mask is a class: they now match the whole class (`transparent_var(--_tab-strip-bleed)`, `transparent_calc(100%_-_var(--_tab-strip-bleed))`), and the bleed test reads `[--_tab-strip-bleed:0px]`, `px-`/`-mx-` and the `:has(:focus-visible)` bump from the class set.
- The stylesheet's rule budget became 940 when this family landed; the sheet builds 124.8 kB.
- `TabList`, `Tab`, `TabMenu`, `NavHeadingMenu` and `SegmentedControl` suites plus the stylesheet test: 1218 tests.
- The lens and the selected-segment forced-colors arms are emitted per state in the class map; the disabled selected segment no longer reads as active in Windows High Contrast, which the old single style block could not express.
