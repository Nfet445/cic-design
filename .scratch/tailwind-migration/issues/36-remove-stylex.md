# remove stylex

Status: ready-for-agent
Blocked by: 35
Wave: 9
Ticket: 36

## What

Remove `@stylexjs/*` from core, lab, charts and richtext, retire the StyleX half of `packages/build` and `scripts/build-css.mjs`, and decide `astryx.css` under OQ1.

## Files

- `packages/core/package.json`
- `packages/lab/package.json`
- `packages/charts/package.json`
- `packages/richtext/package.json`
- `packages/build/**`
- `scripts/build-css.mjs`

## Done when

- `pnpm install` resolves no `@stylexjs` package.
- `pnpm build` is green with the StyleX build absent.
- `xstyle` keeps working through a Tailwind-shaped adapter, or the public prop is removed in the same major with a migration note.

## Verification

- `pnpm install`
- `pnpm build`
- `pnpm exec vitest run packages/core/src`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.
