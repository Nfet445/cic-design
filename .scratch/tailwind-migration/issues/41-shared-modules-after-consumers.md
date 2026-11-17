# shared modules whose consumers own the property

Status: ready-for-agent
Blocked by: 14, 15, 21, 23
Wave: 7
Ticket: 41
Parent: `00-epic-stylex-to-tailwind-4`

## What

Move the seven `stylex.create` blocks that ticket 17 could not move: they set a property that their consumer still sets through StyleX, and a layered utility cannot outrank an unlayered StyleX declaration.

The seven, as ticket 17 listed them: `travellingStyles` (row, list, handle), `focusOwner`, `ownRing`, and the four that remain in `privateAttributes/**` once the press and reorder modules landed.

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
