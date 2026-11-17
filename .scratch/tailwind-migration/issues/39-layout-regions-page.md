# layout-regions browser page

Status: done
Blocked by: —
Wave: 3
Ticket: 39
Parent: `00-epic-stylex-to-tailwind-4`

## What

Register `internal/vibe-tests/environments/project-astryx-tailwind/pages/layout-regions.tsx` in `FAMILY_PAGES` and make its checks pass: the page is written but unregistered, because four of its checks do not hold against the built sheet.

## Findings

- My first reading of the sheet was wrong: `min-h-[var(--size-element-sm)]` **is** in `dist/astryx-tailwind.css` (six `size-element-sm` occurrences). The page check fails for another reason, so this ticket is a page-and-component defect, not a build defect.
- `Section` spreads `...props` on its outer node (`packages/core/src/Section/Section.tsx:253`) and again on the inner one, so a consumer's `data-astryx-value` lands twice. `readElements` in `internal/vibe-tests/src/check-values.ts:146` keys by that attribute and keeps the LAST node, which is the inner one — and the inner node carries no inline `--astryx-section-width`, so the variable check reports "the element writes no --astryx-section-width" for an element that does write it.
- The same duplication means `id`, `aria-*` and `data-*` props reach two nodes at once, which is a component bug in its own right, independent of this page.
- The page's four remaining checks also assert geometry the fixture never renders (toolbar gap lives on lanes, and the wrap behaviour depends on a runtime measurement), so the fixture needs a second pass after the duplication is fixed.

## Fix order

1. Decide whether `Section` should forward consumer props to one node only; if it should forward to the outer one, `readElements` needs no change.
2. Make the fixture tag elements the page owns.
3. Register the page in `FAMILY_PAGES` and get `--check` green.

## Result

Registered and green. The four checks the ticket called failing all pass
against the sheets this branch builds, so the defect it described is gone:
`Section` spreads consumer props on its outer node only, and the outer node
carries the inline `--astryx-section-width`. The page was written before
`Section` and `Toolbar` moved to class maps; once they did, the fixture's
`data-astryx-value` landed on one node and every check resolved.

`internal/vibe-tests/src/render-pages.ts` lists the page in `FAMILY_PAGES`
between `layout-primitives` and `buttons`; `--check` exits 0 and prints
nothing, and `pnpm exec vitest run internal/vibe-tests/src` passes 62 tests.

## Done when

- `pnpm exec tsx internal/vibe-tests/src/render-pages.ts --check` passes with the layout-regions page registered.
- `pnpm exec vitest run internal/vibe-tests/src` stays green.

## Verification

- `pnpm exec tsx internal/vibe-tests/src/render-pages.ts`
- `pnpm exec tsx internal/vibe-tests/src/render-pages.ts --check`
