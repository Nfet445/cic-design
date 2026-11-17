# tooltip hovercard

Status: done
Blocked by: 22
Wave: 7
Family: `family:overlay-dismissal`
Ticket: 24
Parent: `00-epic-stylex-to-tailwind-4`

## What

Migrate `Tooltip/` and `HoverCard/`.

## Files

- `packages/core/src/Tooltip/**`
- `packages/core/src/HoverCard/**`

## Done when

- The arrow offset and the hover-intent timings keep their values.
- `docs/specs/components/Tooltip/Tooltip.spec.md` claims are unchanged and still hold.

## Verification

- `pnpm exec vitest run packages/core/src/Tooltip packages/core/src/HoverCard`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.

## Closing notes

- `packages/core/src/Tooltip/tooltipClasses.ts` and `packages/core/src/HoverCard/hoverCardClasses.ts` replace both StyleX maps: wrapper (`contents`/`inline`), the trigger's dashed hint, the inverted tooltip surface, the hover card's surface and both content paddings. Commit `1d8dbe40e`, merged `cd2148d5b`.
- The tooltip surface and the hover card surface now travel as `className` on the layer container instead of `xstyle`, so they sit in `@layer astryx-base` with the rest of the family; a consumer's `xstyle` still reaches the same element and still wins, because `xstyle` is unlayered.
- `--_hovercard-radius` stays a variable inside the class map: a theme override assigns it in an unlayered rule, so the default this class writes never beats the theme.
- The focus ring keeps `focusOutlineProps.focusVisible()`; its `className` is joined with `tw(...)` before the wrapper classes, so a caller's ring colour still wins.
- Tooltip and HoverCard suites: 227 tests; with the stylesheet test 269.
- Windows High Contrast: the tooltip surface is an inverted solid fill with no border, and the hover card adds only a shadow, so no forced-colors rule changed.
