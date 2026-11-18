# the trigger never regains focus after a pointer pick

Status: done
Wave: 9
Ticket: 65
Parent: `00-epic-stylex-to-tailwind-4`

## What

`packages/core/src/DropdownMenu/DropdownMenu.test.tsx` fails four cases on the integration branch. All four
end at `expect(trigger).toHaveFocus()` in the `DropdownMenu focus return after a pointer pick` group, and the
trigger still carries `focusOutline__focusOutlineStyles.suppressed` when the assertion runs, so the pointer
suppression is applied and the focus hand-back never happens.

Failing cases:

- `returns focus to the trigger after a pointer pick without a ring`
- `asks the browser for no ring on the design system's Button too`
- `a trigger the caller renders > returns focus after a pointer pick with the browser asked for no ring`
- `a trigger the caller renders > clears a ring the browser already drew before refocusing after a pointer pick`

Each one passes when run alone (`-t "returns focus to the trigger after a pointer pick"`), and the whole file
passes on `origin/main`. The failure appears only in a full-file run, so a shared `document.activeElement`
state or an unmounted layer's restore timer is involved.

## Bisect

| commit                                                                      | failures in the file |
| --------------------------------------------------------------------------- | -------------------- |
| `49ca790c4`                                                                 | 2                    |
| `84c0b07b2` (`refactor(typeahead): наложение значения берёт вид из класса`) | 4                    |
| `ef31922ff` (merge of ticket 60d)                                           | 4                    |
| `a44ed5c2d` (merge of ticket 60b, the layer chain)                          | 8                    |
| `df7e76da0` (gutter assertions moved to classes)                            | 4                    |
| `HEAD`                                                                      | 4                    |

The four extra failures at `a44ed5c2d` were the stale `useLayer__styles.gutter*` assertions and are fixed.
The remaining four are older than the layer conversion and were merely masked in the aggregate runs.

## Where to look

- `packages/core/src/Layer/useLayer.tsx` — the layer's own focus restore and its `--focus-outline-offset`
  ring, converted in ticket 60b.
- `packages/core/src/Popover/usePopover.tsx` and `packages/core/src/DropdownMenu/DropdownMenu.tsx` — the
  close path that stores the trigger and calls `focus()` on it.
- `packages/core/src/Button/Button.tsx` — the trigger is a `Button` under a `DropdownMenu.Trigger asChild`, so
  a dropped ref forward would explain a restore that reaches nothing.

## Done when

- The four cases pass in a full-file run, and the file passes in a run of the whole `packages/core/src`
  suite.
- No assertion reads a StyleX debug name (`*__styles.*`); the ring and the gutter are read through
  `classesOf` or a class-map export.

## Verification

- `pnpm exec vitest run packages/core/src/DropdownMenu/DropdownMenu.test.tsx`
- `pnpm exec vitest run packages/core/src`

## Comments — window 65

Started from `/tmp/win-wt65.md` on `ticket/65-work`.

**The four cases were one race, not a lost ref.** The open path arms `shouldFocusOnOpenRef` and moves focus
into the menu from a `requestAnimationFrame` (`DropdownMenu.tsx`, the effect above the entrance hold). Nothing
cancelled that frame when the menu closed. When the close won the frame — a pointer pick that lands inside the
same 16 ms, or a close whose own timing an earlier test in the file shifted — `handleLayerHide` handed focus
back to the trigger and the stale frame then pulled it into the closed `role="menu"` element, which is the
`<div tabindex="-1" role="menu">` the failure printed. `openFocusFrameRef` holds the frame now and
`handleLayerHide` cancels it (and clears `focusLastOnOpenRef`, which the frame would have consumed) before it
decides anything else, so an ArrowUp open that is cancelled cannot leak its last-row focus into the next open.
The trigger ref, the Popover close path and `utils/focusReturn.ts` were already correct.

**The Popover gutter tests were stale, not broken.** Five cases in `Popover.test.tsx` still read
`useLayer__styles.viewportFit` / `gutterInline*` and `toHaveStyle({boxSizing})`, which ticket 60b replaced with
class maps; they are now `expectClassSet` over `Layer/layerClasses.ts` (and `layerViewportFitClassName.split(' ')`
for the multi-class fit, as `useLayer.test.tsx` does). The side-placement case also had the old expectation: a
`placement="end"` layer keeps the far-edge gutter of **both** axes (`[margin-inline-end:var(--_layer-gutter-inline)]`
from the placement, `[margin-block-end:var(--_layer-gutter-block)]` from the alignment), which
`useLayer.test.tsx`'s viewport-inset table already pins for `end`/`start`.

Left alone: `focusOutlineStyles.suppressed` in the trigger's `xstyle`. That suppression stays StyleX on
purpose — a `box-border`-style utility sits in `@layer astryx-base` and cannot outrank the Button's unlayered
ring — so the assertion reads the class the trigger really carries, not a leftover debug name.

Measured: `DropdownMenu.test.tsx` 243/243; the owned directories (`DropdownMenu`, `Popover`, `Layer`, `hooks`,
`utils`) 3675 passed with only the 14 ICU/Temporal failures left. Whole `packages/core/src`: 17 failures, all
older than this window (`postinstall`, `ComplexSelector` and two `Selector` clearance cases fail on a clean
`ticket/65-work` too), 23768 passed.

Commits: `13291f9ec` (the fix), `54af64522` (the Popover assertions), plus this note.

Left: nothing in the four cases. The `Selector`/`ComplexSelector` clearance failures are theirs to fix.

## Comments — closed

Root cause: `DropdownMenu`'s deferred open-focus frame outlived the close, so a
close that won the frame had focus pulled back into the closed `role="menu"`.
`openFocusFrameRef` now holds that frame and `handleLayerHide` cancels it at the
top of the close path, clearing `focusLastOnOpenRef` with it.

Five stale `Popover` gutter assertions moved to `expectClassSet` over
`Layer/layerClasses.ts` in the same window. `DropdownMenu.test.tsx` 243/243.
