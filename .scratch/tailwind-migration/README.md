# Tailwind migration: ticket rules

The umbrella is `issues/00-epic-stylex-to-tailwind-4.md`; it lists the 36
children and their progress. The rules below apply to every child.

These rules are decisions, not suggestions. A ticket that breaks one is not
ready for review, and a pull request that breaks one is not merged.

## Unit of work

- A ticket is a **set of files**, not a component. Where a family record and a
  ticket disagree about a component, the file decides: a field styled in
  `Selector/` belongs to the forms ticket, the popup it opens belongs to the
  overlay ticket.
- A ticket may change at most about 10 `stylex.create` calls and 300 lines. A
  heavier member (`Table`, `Chat`, `Layout`, `DropdownMenu`, `DateInput`) is
  split inside its wave, with `Blocked by:` where the halves really depend.
- No component migrates before a current family record names it. `Table` waits
  for `family:data-tables` (ticket 26).

## One ticket, one worker, one pull request

- One ticket, one subagent (`worker`), one branch, one pull request, one
  changeset. Never two writers in one working tree.
- Parallel work is allowed only when the tickets touch disjoint files, and even
  then each writer gets its own worktree.
- Wave order is the map's order. A ticket starts only when everything in its
  `Blocked by:` line is `done`.

## Definition of done

A ticket is done when all five exist:

1. `*Classes.ts` class maps, with every class literal in the map and no literal
   left in the component;
2. coverage of those classes in the package's stylesheet test, and the sheet
   inside the size gate;
3. the family's tests assert classes and variables, not declarations that jsdom
   cannot evaluate. A test that reads `getComputedStyle`, walks
   `document.styleSheets` or matches StyleX debug class names only ever passed
   because StyleX injected a real sheet at runtime. jsdom cannot parse the built
   Tailwind sheet at all — importing `packages/core/dist/astryx-tailwind.css`
   throws `Could not parse CSS stylesheet` and then `RangeError: Maximum call
stack size exceeded` inside `@acemir/cssom` on nested rules — so no component
   change can revive such an assertion. Assert the class set through
   `packages/core/src/__tests__/classNameAssertions.ts` instead, and say in the
   ticket which assertions moved and why;
4. a browser check page for the family, with the values it shows recorded in
   the pull request;
5. a changeset (`component`, patch) and the ticket updated to `done`.

The manual Windows High Contrast check is part of the checklist whenever the
component draws a border, an outline or a focus ring. There is no browser
emulation for it in this repository, so the check is manual and its result is
written into the ticket.

## Gates

- **Size:** the package's Tailwind sheet gzip may not exceed `1.15 ×` its
  StyleX baseline at `f35022021`. Raw bytes are reported, never gated. The
  constant lives in each package's stylesheet test and changes only through a
  ticket that says why.
- **Layers:** the sheet registers `@layer reset, astryx-base, astryx-theme;`
  first, then the consumer slots. Tailwind's `@layer properties;` statement is
  removed by the build; a statement that survives breaks the contract.
- **Overrides:** `xstyle`, `className` and `style` stay unlayered and merge
  last, so a consumer rule still wins. A state that has to beat a base class
  from another map uses a variant with its own specificity (`aria-pressed:`),
  never class order in a shared layer.
- **Compiled text:** every class is a literal in a `*Classes.ts` file. A class
  assembled by interpolation reaches the DOM with no rule behind it, and the
  stylesheet test is what catches it.

## Traps that cost a window each

- `mergeProps(xds, stylexResult, classNameOrStyle, style)` takes a **class
  string** or a **style object** as its third argument, never `{className}`.
  A migrated map is a string: join it with `tw()`, and never hand it to
  `stylex.props()`, which only accepts StyleX values.
- An arbitrary value can lose to a plain utility on ordering, not on wording:
  `font-[var(--font-weight-semibold)]` prints **before** `.font-medium`, and two
  opacities or two backgrounds are ordered by the sheet. Use the stock utility
  (`font-semibold`) or move the state into a variant whose selector carries the
  specificity (`[&[aria-disabled=true]]:opacity-…`, `aria-pressed:bg-…`).
- Keyframes live in `packages/core/tailwind/astryx.input.css` as
  `@keyframes astryxX`, because the build scans class maps only. A duration
  computed from tokens is spelled out inside the arbitrary class, never
  interpolated.
- A rule that must beat the layer's own utilities — a padding `container()`
  sets, a motion arm that has to outrank another animation — stays in its own
  tiny `.stylex.ts` beside the component, with one sentence saying why. Three
  such files exist (`Card/cardBorder.stylex.ts`,
  `Dialog/dialogFullscreenSafeArea.stylex.ts`,
  `AlertDialog/alertDialogTouchMotion.stylex.ts` and `Drawer/drawerContentSafeArea.stylex.ts`).
- Every class-coverage ticket edits the same block of
  `packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`, so its
  merge always conflicts. Resolve by keeping **both** sides at the statement
  level, add the `it(` closer or `import {` opener the halves need, remove any
  extra `  });` that closes the `describe` early, and run `node --check` before
  vitest. Then set one ceiling with the measured number in the comment.
- Migrating one component trips four guards at once, and every one wants the
  class map rather than an exception: `theme/derivedVarRegistry.test.ts` (a new
  variable needs the `*.doc.mjs` `theming.vars[]`/`derived[]` entry, a
  `theme/derivedVarRegistry.ts` record and its `DIR_TO_REGISTRY_KEY` line),
  `theme/themeMotion.test.ts` (a literal `var()` must be read from the map once
  it moves), `theme/themingTargets.test.ts` (an exception that no longer applies
  is deleted, not kept) and `theme/dynamicType.test.ts` together with
  `inputFontFloor.test.ts` (repoint to the map file). Otherwise the guard fails
  **after** the merge, in whichever ticket merges next.
- Concurrency: three windows is the safe number. Six made every suite four
  minutes long and killed the windows at their 1800 s limit with the work
  uncommitted.

## Release and rollback

- One wave is one release. Rollback is a revert of the wave's pull request, not
  a forward fix, unless a later wave already depends on it - and then the
  reason is written in the ticket.
- Consumer surfaces (`packages/cli`, Storybook, `internal/vibe-tests`) follow
  the last core family. `packages/themes` keeps its packages and only renames
  the bridge it emits.
- The `stylex` subpaths of `@astryxdesign/core` (80 export entries) are marked
  `@deprecated` for one release, then removed in a major together with the
  StyleX build.

## Reviews

- The records owner (`cixzhang`) is a required reviewer on every wave. The
  records amend in the same pull request; there is no separate records pull
  request.
- The pull request states the writing-rubric results for every record it
  touches (`docs/contributing/spec-writing.md`, R1-R7).

## Known failures

`packages/core/src` carries 14 tests that fail on `main` too, from ICU and
Temporal behaviour on Node 26 (`Calendar`, `PowerSearch.calendarSystems`,
`Timestamp`, `postinstall`, four `utils/` calendar tests). A wave must not make
them worse and must not fix them; a change in that count is a finding.
