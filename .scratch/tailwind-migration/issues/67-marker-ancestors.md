# 67 — Replace the four remaining marker ancestors with data attributes

Status: ready-for-human
Wave: 9
Blocked by: none

## Why

`stylex.defineMarker()` exists for one thing: letting a descendant or sibling
rule name an ancestor or neighbour without a selector the compiler cannot see.
StyleX compiles it to `:where(.x-default-marker[data-x] *)`, and a class cannot.

Ticket 07 moved most markers onto plain data attributes (`data-astryx-indicator-scope`,
`data-astryx-press`, `data-astryx-overlay-scope`, `data-astryx-focus-owner`) once
their consumers were class-based. Four modules still hold a marker, and each is
the last reason its component carries StyleX.

## What

1. `packages/core/src/Switch/switchHoverPress.stylex.ts` — `stylex.when.siblingBefore(':focus-visible', switchFocusInput)`
   (the knock-on focus ring) and `stylex.when.ancestor(':hover' | ':active', switchScope)`.
2. `packages/core/src/Table/plugins/rowExpansion/rowExpansionOverrides.stylex.ts` —
   `stylex.when.ancestor(':last-child', tableRowMarker)`.
3. `packages/lab/src/Schedule/scheduleOverrides.stylex.ts` — `stylex.when.siblingBefore(':focus-visible', timeGridViewportScope)`
   and the month-cell focus arms.
4. `packages/lab/src/TabBar/tabBar.stylex.ts` — `stylex.when.ancestor(':focus-visible' | '[data-tab-bar-pressed]', tabBarItemMarker)`.

## How — the two mechanisms a class does have

**Ancestor** becomes an attribute on the ancestor plus an attribute descendant
selector in the class text. The attribute is owned by
`packages/core/src/privateAttributes/<name>.stylex.ts` (or the owning
`*Classes.ts` with one narrow `eslint-disable @astryx/no-raw-private-attribute`
naming the owner), and the rule repeats the attribute twice when it must beat a
class of the same layer:

```
'[&[data-astryx-switch-scope][data-astryx-switch-scope]_:hover]:opacity-100'
```

Note the descendant combinator: the marker meant "inside the scope", so the
class must select the control, not the scope element itself.

**Sibling-before** is the one shape a class cannot write from the following
element alone — `:focus-visible + &` needs the _previous_ sibling's class in the
selector. Write it as an arbitrary variant that names that class literally:

```
'[.astryx-switch_input:focus-visible_+_&]:[box-shadow:…]'
```

If the escaped class name makes the rule fragile, the honest alternative is to
move the effect to `:has()` on a shared parent
(`'[&:has(.astryx-switch_input:focus-visible)]:[box-shadow:…]'`), which is
what the overlay and focus-owner work already does.

## Definition of done

- Each of the four modules is deleted, with its `package.json` export, its
  `publicStyleXNamespaces.test.ts` line and — if listed — its
  `scripts/sync-exports.js` entry.
- Every visual state still works: hover, `:active`, focus-visible knock-on,
  `[data-tab-bar-pressed]`, the last row's expansion card.
- The affected tests read classes, not `getComputedStyle`.
- Classes registered in the package sheet test; the ceiling moves only with a
  measured number.
- A note in this ticket names any state that could NOT move, and why.

## Result

Switch and Table row expansion in Core, and Schedule and TabBar in Lab, use
scoped Tailwind selectors for the former marker states. The four style maps and
three marker modules were removed. None had a package subpath or a namespace or
sync-exports entry.

The Core and Lab builds compact generated CSS formatting to address the gzip
size increase seen on the first implementation. The existing gzip baselines
and limits still apply.

The expansion column insets and expanded-row divider suppression retain small
marker-free StyleX rules. They must compose after preceding plugins' StyleX
values, which layered utilities cannot override. Matching utilities keep the
rules effective when StyleX and Tailwind both run inside the base layer.

Focused component and stylesheet tests passed. The final sheets measure
46,561 B gzip for Core (48,680 B limit) and 14,168 B for Lab (14,391 B limit).
Chromium checks covered Switch keyboard focus and toggling, Table expansion,
Schedule focus rings, and TabBar focus and selection. Storybook needed a local
response workaround for an existing invalid FieldStatus CSS declaration and
an unrelated Lab barrel export; these workarounds did not change source files.
The full suite was not run. The build package's Node tests did not start because
Core's prerequisite TypeScript build failed in `getLocaleDirection.ts` on
`Intl.Locale` text-info types. Windows High Contrast remains a manual check and
must be recorded before this ticket is done.
