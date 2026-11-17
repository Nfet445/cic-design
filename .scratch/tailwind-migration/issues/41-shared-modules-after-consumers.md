# shared modules whose consumers own the property

Status: in-progress — most modules are classes; what is left needs the marker
flip (ticket 07) and the published focus-ring seam (ticket 52).
Blocked by: 07
Wave: 7
Ticket: 41
Parent: `00-epic-stylex-to-tailwind-4`

## What

Move the seven `stylex.create` blocks that ticket 17 could not move: they set a property that their consumer still sets through StyleX, and a layered utility cannot outrank an unlayered StyleX declaration.

The seven, as ticket 17 listed them: `travellingStyles` (row, list, handle), `focusOwner`, `ownRing`, and the four that remain in `privateAttributes/**` once the press and reorder modules landed.

Three more survivors joined the list as their families closed, each waiting on the same condition:

- `packages/core/src/SideNav/SideNavItem.tsx` — `leftoverStyles.collapsedItem/Sm/Lg` and `indentStyles.sm/md/primary` set `width`, `paddingInline` and `paddingInlineStart` that the unlayered `navItemStyles` also paints, so they wait for `packages/core/src/NavItem/navItemStyles.ts`.
- `packages/core/src/SideNav/SideNav.tsx:231` — `leftoverStyles.resizableHandle` keeps the ring inside the clipping wrapper, and `ResizeHandle` applies `focusOutlineStyles.focusVisible` unlayered, so it waits for the resizable handle in `49-overflow-and-gesture`.
- `packages/core/src/Card/cardBorder.stylex.ts` — the border-inset `calc()` padding, because `container()` sets unlayered `padding` on the same element.

## Why it waits

Each consumer must paint from classes first. Until then a moved module repaints the component in the browser even though every unit test stays green.

## When a dependency lands

Re-check each of the seven against its consumers: if the consumer no longer writes the same property through StyleX, move the module in the ticket 17 shape — `*Classes.ts` next to the component that owns it or under `privateAttributes/`, a deprecated `.stylex.ts` shim while importers remain, coverage in the package stylesheet test.

## Done when

- `rg "stylex.create" packages/core/src/privateAttributes packages/core/src/utils` returns nothing outside deprecated shims.
- The package stylesheet test covers every class the moved modules emit.
- The full core suite stays at the known-failing count.

## Verification

- `pnpm exec vitest run packages/core/src/privateAttributes packages/core/src/utils packages/core/src/List packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`
- `node packages/core/scripts/build-css-tailwind.mjs`
- `pnpm -F @astryxdesign/core typecheck`

## Comments

Window 3 (merged) took `utils/rtlStyles.ts` out of the tree: `rtlClasses.ts`
holds the centre-inline class and the store-size mirror, and
`privateAttributes/reorderingClasses.ts` holds the handle's cursor, so
`reordering.stylex.ts` keeps only the mark's owner functions.

What is left is eleven `stylex.create` calls in five modules, and none of them
is a paint a class can express today:

- `privateAttributes/press.stylex.ts` (4) reads the indicator and press
  attributes as ancestors; a Tailwind arm needs the marker flip of ticket 07.
- `privateAttributes/{ownRing,focusOwner}.stylex.ts` (1 + 1) read the same
  ancestors.
- `utils/focusOutline.stylex.ts` (3) and `utils/interactionOverlay.stylex.ts`
  (2) are the ring and the overlay image: they back `focusOutlineProps`, which
  composes `stylex.props`, so the class arm belongs to ticket 52 with the rest
  of the published seams.
