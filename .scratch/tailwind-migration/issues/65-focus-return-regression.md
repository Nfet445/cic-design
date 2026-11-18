# the trigger never regains focus after a pointer pick

Status: ready-for-agent
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
