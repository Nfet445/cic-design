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

## Result

`Item` and `ListItem` are class maps (`Item/itemClasses.ts`,
`List/listItemClasses.ts`), merged `395ef989b` and `c945bd80e`. A later fix
made each density state its own `--_item-inset-inline`: the `spacious` inset
had keyed off a `data-density` attribute nothing rendered.

`List.tsx` is a class map too (`List/listClasses.ts`, `41b74cc9b`): the frame,
its gap, the numbered columns, the margins that reach the container's padding,
the corners it publishes to bled rows, the header, and the counter's start. The
start is a per-instance value, so it travels as `--astryx-list-counter-start`
beside the class that reads it. A divided list states `gap-0` instead of the
row gap: two classes of one property are decided by the sheet's order, not by
the class attribute. The corner classes are spelled out in full, because the
build reads class text from the source and a class assembled from parts never
reaches the sheet.

Left: `ListReorderHandle.tsx` (2 `stylex.create`: the handle and the list's
insertion line) and `listReorderEngine.tsx` (1: the reorder-mode hint's
buttons). The insertion line is the one that reaches past its file: the
session publishes it as `listStyle`, a `StyleXStyles` value in
`listReorderContext.ts` and applied through `stylex.props` in `List.tsx`, so
moving it to a class changes that contract to a `className` in the same
commit.
