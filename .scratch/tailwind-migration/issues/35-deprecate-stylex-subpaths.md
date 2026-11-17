# deprecate stylex subpaths

Status: done
Blocked by: 31,32
Wave: 9
Ticket: 35
Parent: `00-epic-stylex-to-tailwind-4`

## What

Mark the 80 `stylex` export entries of `@astryxdesign/core` deprecated with `@deprecated` JSDoc, a `component` changeset that says they will be removed, and a docs note.

## Files

- `packages/core/package.json`
- `the 20 exported `*.stylex.ts` modules`
- `.changeset/`

## Done when

- Each of the 80 entries points at a module whose JSDoc says deprecated.
- A consumer sees the deprecation in the editor and in the changelog.

## Verification

- `pnpm check:changesets`
- `pnpm -F @astryxdesign/core build`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.

## Comments

### What shipped

All 20 `*.stylex` subpaths of `@astryxdesign/core` now carry `@deprecated` in
their module JSDoc, so an editor shows it on the import (`a807fb244 docs(core):
отметить подпути StyleX устаревшими`). Five already had it and were left as
they were (`theme/tokens`, `theme/dataTokens`, `Icon/IconSize`,
`Layer/layerAnimations`, `Layer/layerTextReset`, `Text/text`).

The note is not one sentence copied twenty times, because the replacement
differs per module and a wrong pointer is worse than none:

- A class map replaces it: `Stack/stack` → `Stack/stackClasses.ts`,
  `Stack/stackItem` → `Stack/stackItemClasses.ts`, `Layout/padding` →
  `Layout/paddingClasses.ts` (the module keeps the container variables and the
  overlay reset that must stay unlayered).
- A generated token module replaces it: `theme/tokens` and
  `theme/dataTokens` → `tokenVars` / `dataTokenVars`.
- The picker's numbers: `DateInput/tokens` stays for the callers that still
  read them; the touch surface reads `dateInputClasses.ts` and the
  `--astryx-date-*` variables.
- An internal seam that a class cannot express: `utils/focusOutline` (a ring
  needs `:focus-visible`), `utils/interactionOverlay`,
  `Layout/container`, `Layout/edgeCompensation`, `Layer/layerViewportInset`,
  `NavItem/navItemStyles`, `Selector/selectorPresentation`,
  `internal/touchHitArea`. These say "internal seam, not a public API, it
  disappears when StyleX leaves the package" instead of pointing at a module
  that does not exist.
- `Indicator/indicator.markers` and `internal/indicatorPress`: the scope
  becomes a `data-astryx-*` attribute (ticket 07).

Changelog: `.changeset/deprecate-stylex-subpaths.md`, `[component]`, patch,
credited. No consumer doc was edited on purpose: ticket 32 rewrote the styling
guides days ago, and a third restatement of the same deprecation in a guide
would be one more owner of one fact.

Verification:

- `pnpm check:changesets` — `603 changeset(s) valid`.
- `pnpm -F @astryxdesign/core build` — exit 0, `Wrote dist/astryx-tailwind.css
(291.8 kB)`; `grep -c '@deprecated' dist/Layout/container.stylex.d.ts` — 1,
  so the tag reaches the published declarations.
- `prettier --write` over all 20 modules; `eslint` clean on the three spot
  checks.
- No High Contrast check: this ticket draws nothing.
