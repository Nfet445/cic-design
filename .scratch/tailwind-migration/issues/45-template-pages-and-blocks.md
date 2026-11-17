# template pages and blocks

Status: ready-for-agent
Blocked by: 31
Wave: 9
Ticket: 45
Parent: `00-epic-stylex-to-tailwind-4`

## What

Move the shipped page and block templates off StyleX. Every template a
consumer generates must render styled from `astryx-tailwind.css` alone, so a
project scaffolded after the migration carries no `stylex` import and no
compiler requirement.

Ticket 32 owns the consumer docs and the agent-docs block; this ticket owns
`packages/cli/assets/templates/**` only.

## Files

- `packages/cli/assets/templates/pages/**` — `canvas-editor/page.tsx` (13
  mentions), `table-filter`, `settings-dialog`, `dashboard-alert-rail` and the
  rest.
- `packages/cli/assets/templates/blocks/**` — 40 files carry `stylex`, mostly
  `xstyle` passthroughs and `stylex.create` maps in the showcase blocks.
- `packages/cli/assets/templates/themes/**` if a theme template names StyleX.

## Approach

A template is consumer code, so it obeys the consumer contract, not the
library's: a plain `className` string, or one of the published class maps when
the template needs the same vocabulary as the component. Two shapes appear
today and each has an obvious replacement:

- `stylex.create` in a showcase block → a local `const styles = {…}` of class
  strings, joined with `tw()`. The library's `tw()` is exported for consumers,
  so a template may import it.
- `xstyle={styles.x}` passed into a component → `className={`${styles.x} …`}`
  on the same component. `className` lands after the component's own classes
  and stays unlayered, so it wins exactly where `xstyle` won.

Do not invent a second styling path: no `@apply`, no inline `style` for
anything a class can express, and no interpolated utility (a template is not
scanned by the library build, so a broken class fails silently — keep every
class literal).

## Done when

- No file under `packages/cli/assets/templates/**` imports `@stylexjs/stylex`
  or writes `xstyle`.
- A guard test fails when a template reintroduces either, in the style of
  `packages/core/src/inputFontFloor.test.ts`.
- Generated pages render styled with only `astryx.css`'s Tailwind counterpart
  loaded.

## Verification

- `pnpm exec vitest run packages/cli`
- `pnpm check:cli`
- Generate one page template and one block template in a scratch directory and
  load the result with `astryx-tailwind.css` alone.

## Notes

- Ticket 34 rewrites the render pipeline that compiles a generated page with
  the StyleX babel plugin (`packages/cli/foundation/render/page-worker.mjs`);
  this ticket only changes the templates, so a template that stops importing
  StyleX simply stops needing that branch.
- Follow the ticket rules in `.scratch/tailwind-migration/README.md`.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md`
  (FR1–FR10, DEC-1…DEC-7).
