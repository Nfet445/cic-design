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

Measured on `ticket/45-template-pages` before the first conversion:

- `grep -rl 'stylex\|xstyle' packages/cli/assets/templates` → **52 files**; the
  count above (40) is `stylex` alone. 15 pages and 25 blocks carry `stylex`, 12
  more pages carry only `xstyle`, and no theme template names either.
- 169 `xstyle=` call sites, 39 `@stylexjs/stylex` imports and 25
  `@astryxdesign/core/theme/tokens.stylex` imports.
- `packages/cli/assets/templates/pages/**` — `table-filter/page.tsx` (64
  mentions), `canvas-editor/page.tsx` (42: 29 `xstyle`, 13 `stylex`),
  `settings-dialog/page.tsx`, `dashboard-alert-rail/page.tsx` and the rest.
- `packages/cli/assets/templates/blocks/**` — `ComplexSelectorShowcase.tsx`,
  `TableFloatingBulkActionsTable.tsx`, `ToolbarTableFilter.tsx`,
  `BaseTypeaheadMenu.tsx` and the rest; mostly `xstyle` passthroughs and
  `stylex.create` maps in the showcase blocks.
- `packages/cli/assets/templates/themes/**` if a theme template names StyleX.

Re-measured at the start of window 2, after window 1:

- 38 files name `stylex` or `xstyle`, 166 `xstyle=` sites, 37
  `@stylexjs/stylex` imports, 23 `@astryxdesign/core/theme/tokens.stylex`
  imports, 36 files with a `stylex.create` map.

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
- `pnpm check:cli` does not exist in `package.json`; the nearest guard is
  `pnpm check:cli-structure`. Measured, not assumed: rename the line below once a
  `check:cli` script lands.
- No per-template typecheck exists: `pnpm -F @astryxdesign/cli typecheck:strict`
  includes `assets/**/*.tsx` but fails on 3840 errors before any conversion,
  because `@astryxdesign/core/<Name>` resolves to `packages/core/dist`, which
  is not built in a fresh worktree (`TS2307 Cannot find module
'@astryxdesign/core/Layout'` ×447). Until `packages/core` is built, the
  syntax guard for a converted template is `node_modules/.bin/esbuild
--loader:.tsx=tsx <file>` plus `prettier --check`.
- Generate one page template and one block template in a scratch directory and
  load the result with `astryx-tailwind.css` alone.

## Progress

Window 1 (`refactor(templates): класс RTL-зеркала вместо xstyle`): 12 templates
stopped naming StyleX at all — `useTreeFocusHookUsage.tsx`,
`BreadcrumbsCustomSeparator.tsx` and the pages `centered-hero`, `gallery-hero`,
`product-gallery`, `course-detail`, `detail-page`, `review-workspace`,
`run-console`, `file-explorer`, `table-grouped`, `ai-chat`. Each
`xstyle={rtlStyles.mirror}` became `className="rtl:[transform:scaleX(-1)]"`, the
same `scaleX(-1)` the deleted StyleX rule wrote.

Three more files lost that one site but still hold `stylex.create` maps:
`pages/table-inbox/page.tsx`, `pages/work-item-detail/page.tsx`,
`pages/settings-dialog/page.tsx`.

Remaining, smallest first:

- `blocks/components/Hooks/usePressFeedbackHookUsage.tsx` and its
  `usePressFeedbackHookUsage.test.tsx` — the test asserts the focus-ring class
  through `stylex.props(focusOutlineStyles.focusVisible)`, so it moves first.
- `blocks/components/Hooks/{useContainerReveal,useScrollLock,useScrollableArea,useInputContainer,useInputStatusIcon,useOverflow,useScrollOverflow}HookUsage.tsx`
  — one `stylex.create` each, two or three declarations.
- `blocks/components/DateTimeInput/DateTimeInputWithValidation.tsx`,
  `blocks/components/Popover/PopoverBottomSheetAlternative.tsx`,
  `blocks/components/DrawerHeader/DrawerHeaderShowcase.tsx`,
  `blocks/components/ScrollableArea/*`.
- The token-reading showcase blocks (`ComplexSelectorShowcase`,
  `TableFloatingBulkActionsTable`, `TableLeadingMarkSelection`,
  `ToolbarTableFilter`, `BaseTypeahead*`, `Item/ItemDocumentTabs`): they import
  `colorVars`/`spacingVars`/`radiusVars` from `tokens.stylex`, which has no
  Tailwind counterpart yet — those need a `--astryx-*` variable read by a class,
  or a decision on whether `tokens.stylex` survives the migration.
- The four large pages: `table-filter` (64), `canvas-editor` (42),
  `table-collapsible`, `dashboard-*`.

The guard test named in **Done when** cannot land before the last conversion:
written now, it would fail on the 40 templates that still carry StyleX. It
lands with the final file, in the shape of
`packages/core/src/inputFontFloor.test.ts` — read every file under
`packages/cli/assets/templates/**` and fail on `@stylexjs/stylex` or `xstyle`.

Window 2 (`refactor(templates): читать CSS-переменную вместо токенов StyleX`):
`blocks/components/Popover/PopoverBottomSheetAlternative.tsx` and
`blocks/components/Hooks/useScrollLockHookUsage.tsx` stopped importing
`tokens.stylex` and StyleX. Each `*Vars['--x']` read became a class reading the
same custom property (`[margin-inline-start:var(--spacing-3)]`,
`[padding:var(--spacing-4)]`), so the token sheet alone styles them; no token
name and no value was invented. `xstyle` became `className` on `VStack` and on
the dialog.

`tw()` is not exported from `@astryxdesign/core` on this branch: the Approach
above says a template may import it, and it cannot. Two classes in one attribute
are joined with a template literal until core exports `tw`; that is a public
API decision, not this ticket's.

Blocked templates found in this window, recorded here instead of inventing a
value:

- `blocks/components/DrawerHeader/DrawerHeaderShowcase.tsx` needs
  `overlayPaddingReset` to stand in for the Drawer root. The Tailwind
  counterpart lives in `layoutClasses.ts` (`layoutInnerClassName`), which no
  package entry exports, so the template keeps the StyleX import until Layout
  publishes a reset class.
- `blocks/components/Hooks/useInputStatusIconHookUsage.tsx` reads
  `inputWrapperStyles` and `inputStatusBorderStyles` from `@astryxdesign/core/Field`,
  which are StyleX. Only `Field` can replace them with class names.

Window 1 checks: `esbuild --loader:.tsx=tsx` parsed all 15 changed templates,
`prettier --check` clean, `eslint` on them reports one pre-existing warning in
`pages/ai-chat/page.tsx` (`consistent-type-assertions`, not this change),
`pnpm check:knowledge` aligned, and `vitest run --project node
packages/cli/foundation/discovery/doc-types.test.mjs
packages/cli/clients/cli/__tests__/cliManifest.test.ts` passed (27 tests). The
`pnpm exec vitest run packages/cli` invocation from **Verification** matches no
test files by itself — it needs `--project node` and a real path.

Merging `poc/tailwind-layout-primitives` at the close of the window said
`Уже актуально`: the branch head (`3b460df42`) already reached this branch
through `12add4df7`, so no merge commit was needed.

## Notes

- Ticket 34 rewrites the render pipeline that compiles a generated page with
  the StyleX babel plugin (`packages/cli/foundation/render/page-worker.mjs`);
  this ticket only changes the templates, so a template that stops importing
  StyleX simply stops needing that branch.
- Follow the ticket rules in `.scratch/tailwind-migration/README.md`.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md`
  (FR1–FR10, DEC-1…DEC-7).
