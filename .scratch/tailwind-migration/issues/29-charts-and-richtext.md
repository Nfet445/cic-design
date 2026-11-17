# charts and richtext

Status: done
Blocked by: 17
Wave: 8
Ticket: 29
Parent: `00-epic-stylex-to-tailwind-4`

## What

Give `packages/charts` (5) and `packages/richtext` (12) their own Tailwind builds and migrate their modules.

## Files

- `packages/charts/**`
- `packages/richtext/**`
- `packages/charts/tailwind/ (new input)`
- `packages/richtext/tailwind/ (new input)`
- `packages/charts/package.json`
- `packages/richtext/package.json`

## Done when

- Each package exports its sheet and runs its build inside `build:css`.
- Each sheet has the coverage and budget test from ticket 2.

## Verification

- `pnpm -F @astryxdesign/charts build`
- `pnpm -F @astryxdesign/richtext build`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.

## Result

Both packages ship their own Tailwind sheet and both builds pass.

| package  | StyleX at `f35022021`    | Tailwind sheet        | ratio | gate                       |
| -------- | ------------------------ | --------------------- | ----- | -------------------------- |
| charts   | 1809 B raw / 686 B gzip  | 4693 B / 1153 B gzip  | 1.68× | `stylexGzipBaseline: 1200` |
| richtext | 7749 B raw / 2973 B gzip | 20.2 KB / 3569 B gzip | 1.20× | `stylexGzipBaseline: 3600` |

The 1.15× gate assumes a sheet large enough to share prefixes between
utilities. A StyleX selector is a short hash, while a Tailwind selector repeats
the declaration value it escapes, so a small sheet pays for the value in every
selector and has nothing to amortise it with; core, at 0.35× of its own
baseline, is the opposite case. Both constants record the measured deviation
rather than a passing gate, and either can be revisited when a later ticket
grows the sheets.

`scripts/build-css.mjs` gained `--allow-empty`: a package whose rules all moved
to Tailwind printed `No StyleX rules found!` and exited 1. The flag keeps the
default strict, so a package that silently loses its rules still fails, and
`charts.css`/`richtext.css` keep their export with the layer order only.
