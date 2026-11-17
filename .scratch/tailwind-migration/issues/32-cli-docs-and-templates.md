# cli consumer docs

Status: ready-for-agent
Blocked by: 31
Wave: 9
Ticket: 32
Parent: `00-epic-stylex-to-tailwind-4`

## What

Rewrite the consumer-facing docs that teach StyleX. The four styling documents
must describe the class maps, the layer order and the `xstyle` escape hatch,
and a reader must be able to build a styled page without ever importing
`@stylexjs/stylex`.

Ticket 45 owns `packages/cli/assets/templates/**`; ticket 34 owns the render
pipeline and swizzle. This ticket owns the prose a consumer reads.

## Files

- `packages/cli/assets/docs/styling-overview.doc.mjs` (254 lines, 11 `stylex`)
- `packages/cli/assets/docs/tree/css-and-stylex.doc.mjs` (150 lines) — rename
  the page and the file to `css-and-tailwind`, and update the two places that
  reference the old slug.
- `packages/cli/assets/docs/tree/tokens-and-setup.doc.mjs` (169 lines, 25
  `stylex`)
- `packages/cli/assets/docs/tree/styling-basics.doc.mjs` (181 lines, 13
  `stylex`)
- `packages/cli/foundation/agent-docs/agent-docs.mjs` — the styling-preference
  probe at line 491 and its `'stylex' | 'tailwind' | 'css'` return type.

## What each doc must say

- How a component is styled now: it ships classes; the prebuilt
  `astryx-tailwind.css` carries them in `@layer astryx-base`.
- The order a page needs: `reset, astryx-base, astryx-theme`, then the consumer
  slots.
- `className` merges after the component's own classes and wins; `xstyle` is
  kept for one release and is unlayered, so it wins over any class.
- A per-instance value the props do not cover is a class plus a custom
  property, never an inline declaration — with one worked example.
- Tokens: the theme owns the variables; the library never declares them.
- Drop every StyleX capability table, the `stylex.create`/`stylex.props`
  examples, and the compiler setup a reader no longer needs.

Do not document the deprecated `*.stylex` subpaths as a valid path forward.
Ticket 35 owns their `@deprecated` marking; this ticket only stops teaching
them as the way to build.

## Done when

- `grep -ri stylex packages/cli/assets/docs` returns only the `xstyle` escape
  hatch and the deprecation sentence.
- `astryx docs styling-overview --dense`, `astryx docs css-and-tailwind`, and
  `astryx docs styling-basics` read correctly and contain no dead import.
- The agent-docs probe prefers `tailwind` when both a Tailwind entry and a
  StyleX compiler are present, and the generated block no longer prints the
  StyleX caps table.
- `pnpm check:cli` and the docs tests pass.

## Verification

- `pnpm exec vitest run packages/cli`
- `astryx docs styling-overview --dense`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one
  ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md`
  (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when
  the component draws a border, an outline or a focus ring.
