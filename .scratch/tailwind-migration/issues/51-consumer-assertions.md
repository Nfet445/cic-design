# consumer assertions still reading StyleX

Status: ready-for-agent
Blocked by: (none)
Wave: 9
Ticket: 51
Parent: `00-epic-stylex-to-tailwind-4`

## What

The wave tickets moved the styles; a handful of consumer tests still read what
only a StyleX runtime used to inject into jsdom (a `::backdrop` rule through
`CSSStyleSheet.insertRule`, a computed declaration, a debug class name). Each
one fails on the integration branch and passes on `main`, so the suite cannot
go green until they read the class map and the built sheet instead.

## Files

- `packages/core/src/__tests__/slotPresence.controls.test.tsx` (7 cases)
- `packages/core/src/CheckboxList/CheckboxList.test.tsx` (3 cases)
- `packages/core/src/Indicator/touchTarget.test.tsx` (1 case)
- `packages/core/src/DateInput/DateInputTouch.test.tsx` (2 cases)
- `packages/core/src/theme/extensibleAxes.test.ts` (2 cases)
- `packages/core/src/motion/animatedLayoutAdopters.test.tsx` (2 cases)
- `packages/core/src/motion/reducedMotionValues.test.ts` (1 case)
- `packages/core/src/theme/derivedVarRegistry.test.ts` (1 case)

`packages/core/src/__tests__/modalBackdrop.test.tsx` (12 cases) is handled
separately because it owns a whole StyleX interception harness.

## Done when

- `pnpm exec vitest run` over those eight files is green.
- Every changed assertion reads a class set (`classesOf`, `expectClassSet`,
  `expectVariable` from `packages/core/src/__tests__/classNameAssertions.ts`),
  the built sheet through `buildAstryxTailwindCss()`, or the class map module
  the component renders from. No test keeps probing a declaration that only a
  StyleX transform ever wrote.
- No component source changes: if a case cannot pass without one, record why in
  `## Comments` instead of forcing it.

## Verification

- `node packages/core/scripts/build-css-tailwind.mjs`
- `pnpm exec vitest run packages/core/src/__tests__/slotPresence.controls.test.tsx packages/core/src/CheckboxList packages/core/src/Indicator/touchTarget.test.tsx packages/core/src/DateInput/DateInputTouch.test.tsx packages/core/src/theme/extensibleAxes.test.ts packages/core/src/motion packages/core/src/theme/derivedVarRegistry.test.ts`
- `pnpm -F @astryxdesign/core typecheck`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`.
- A class map holds literal class strings: assert the utility the map names, not
  a `getComputedStyle` result, which jsdom can never compute for a class.
- A per-instance value is a class plus an inline `--astryx-*` variable; read the
  variable with `expectVariable`.
