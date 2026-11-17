# the wave's merged failures

Status: done
Wave: 4
Ticket: 40
Parent: `00-epic-stylex-to-tailwind-4`

## What

A repair ticket for failures that only appeared after merging: the `IconButton` variable assertions that read `--_icon-width` from a frame the shared icon box had rewritten to `[width:1rem]`, and the seven `privateAttributes` and `utils` creations that could not move.

## Result

- `464a0cba6` made `packages/core/src/Icon/iconBoxClasses.ts` read `--_icon-width` and `--_icon-height` again, so a themed icon width reaches the frame and the glyph the same way. Merged as `b0b26b175`; `IconButton`, `Icon` and the sheet test passed 205 tests.
- The seven creations were not a regression: they are a layering fact. A StyleX declaration is unlayered and beats a layered utility whatever the order, so moving them alone would repaint the component in a browser while staying green in jsdom. They moved to ticket 41, which waits for their consumers.
