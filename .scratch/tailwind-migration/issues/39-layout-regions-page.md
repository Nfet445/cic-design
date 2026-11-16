# layout-regions browser page

Status: needs-info
Blocked by: —
Wave: 3
Ticket: 39
Parent: `00-epic-stylex-to-tailwind-4`

## What

Register `internal/vibe-tests/environments/project-astryx-tailwind/pages/layout-regions.tsx` in `FAMILY_PAGES` and make its checks pass: the page is written but unregistered, because four of its checks do not hold against the built sheet.

## Findings

- `--astryx-section-width` is written as an inline style by `Section`, but the page's variable check reports "the element writes no --astryx-section-width": the element tagged `data-astryx-value="section-sized"` is the outer one, so either the check targets the wrong node or `readElements` drops the inline style when a class is present.
- The toolbar's `min-h-[var(--size-element-sm)]` rule is absent from `dist/astryx-tailwind.css` although `Toolbar/toolbarClasses.ts:79` holds it — the scan does not reach the constant, which is a build-ticket matter rather than a page matter.
- `FAMILY_PAGES` currently lists `layout-primitives` and `buttons` only.

## Done when

- `pnpm exec tsx internal/vibe-tests/src/render-pages.ts --check` passes with the layout-regions page registered.
- `pnpm exec vitest run internal/vibe-tests/src` stays green.

## Verification

- `pnpm exec tsx internal/vibe-tests/src/render-pages.ts`
- `pnpm exec tsx internal/vibe-tests/src/render-pages.ts --check`
