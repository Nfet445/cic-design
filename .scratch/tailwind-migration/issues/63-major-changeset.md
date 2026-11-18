# major changeset and stylex removal notes

Status: ready-for-agent
Blocked by: 62
Wave: 9
Ticket: 63
Parent: `00-epic-stylex-to-tailwind-4`

## What

Write the `breaking` changeset the removal needs, and the consumer-facing notes: which subpaths disappear, what `xstyle` now accepts, and that a consumer's own StyleX babel plugin is no longer needed for Astryx but still works for the consumer's own code.

Ship the notes where a product builder looks: `packages/cli/assets/docs/**` (the styling pages ticket 32 rewrote) and the changelog entry the changeset generates.

## Files

- `.changeset/stylex-removal.md`
- `packages/cli/assets/docs/tree/css-and-tailwind.doc.mjs`, `styling-basics.doc.mjs`
- `docs/specs/AST-119-tailwind-utility-styling/spec.md` (status and OQ1 once decided)

## Done when

- `pnpm check:changesets` accepts a `breaking` entry naming the removed subpaths and the `xstyle` narrowing.
- `pnpm check:knowledge` is aligned.
- The doc pages state the migration path for a consumer that imported a `*.stylex` subpath.

## Verification

- `pnpm check:changesets`
- `pnpm check:knowledge`
- `pnpm exec vitest run --project node packages/cli`
