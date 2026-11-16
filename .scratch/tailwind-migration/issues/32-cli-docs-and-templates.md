# cli docs and templates

Status: ready-for-agent
Blocked by: 31
Wave: 9
Ticket: 32

## What

Rewrite the consumer-facing docs and templates that teach StyleX: the styling overview, `css-and-stylex`, `tokens-and-setup`, `styling-basics`, the 51 template files that emit `stylex.props`, and the generated STYLEX-CAPS block.

## Files

- `packages/cli/assets/docs/styling-overview.doc.mjs`
- `packages/cli/assets/docs/tree/css-and-stylex.doc.mjs`
- `packages/cli/assets/docs/tree/tokens-and-setup.doc.mjs`
- `packages/cli/assets/docs/tree/styling-basics.doc.mjs`
- `packages/cli/assets/templates/**`
- `packages/cli/foundation/agent-docs/agent-docs.mjs`

## Done when

- Generated templates render styled from `astryx-tailwind.css` alone.
- The agent-docs block describes the class maps, the layer order and `xstyle`, and no longer prints the StyleX caps block.
- `pnpm check:cli` and the docs tests pass.

## Verification

- `pnpm exec vitest run packages/cli`
- `astryx docs styling-overview --dense`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.
