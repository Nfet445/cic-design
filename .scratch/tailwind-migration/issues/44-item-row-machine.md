# the item row machine

Status: ready-for-agent
Blocked by: none
Wave: 6
Family: `family:navigation-destinations`
Ticket: 44
Parent: `00-epic-stylex-to-tailwind-4`

## What

The row machine ticket 18 left behind: 13 `stylex.create` blocks in `Item/` and `List/`.

- `Item/`: the row frame, its density padding, the baseline struts that align a leading icon, label and description, `--_item-inset-inline`, the line clamp, and the press overlay;
- `List/ListItem.tsx`: the row's own frame, its selected and disabled paint, the reorder handle, and the `@media (pointer: coarse)` height override.

They go together because they are one machine: `ListItem` renders `Item` and the two share the inset variable and the density scale.

## Why it is its own ticket

Ticket 18 finished `Link`, `Citation`, `BreadcrumbItem`, `Token`, `Pagination` and the avatar status dot, and stopped here: the row machine is a larger surface than the rest of the family combined, and its assertions read computed heights and paddings that must move to class sets in the same commit.

## Done when

- `rg "stylex.create" packages/core/src/Item packages/core/src/List` returns nothing outside a deprecated shim.
- The package stylesheet test covers every emitted class.
- A row at each density keeps its height and its baseline alignment, proven by the class set and, for the touch override, by the built sheet.
- The reorder handle keeps its drag affordance and the Windows High Contrast focus ring.

## Verification

- `pnpm exec vitest run packages/core/src/Item packages/core/src/List`
- `node packages/core/scripts/build-css-tailwind.mjs`
- `pnpm -F @astryxdesign/core typecheck`
