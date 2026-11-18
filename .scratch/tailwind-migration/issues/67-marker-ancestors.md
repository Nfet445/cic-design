# 67 — Replace the four remaining marker ancestors with data attributes

Status: ready-for-agent
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
