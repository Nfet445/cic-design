# Astryx repository guidance

Astryx is a public design-system repository. Never commit internal links,
identifiers, service names, private operational instructions, or other
Meta-only context.

## Instruction surface

This `AGENTS.md` is the canonical, tool-agnostic instruction surface for the
repository. Add or change shared agent guidance here rather than duplicating it
in tool-specific instruction files. Put genuinely path-specific guidance in a
nested `AGENTS.md`.

## Agent skills

### Issue tracker

Work tickets live as markdown under `.scratch/<feature>/`; design knowledge
stays in `docs/specs/`. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles keep their default names, recorded as a
`Status:` line in each issue file. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the root. See
`docs/agents/domain.md`.

## Start here

- Product builders: use `astryx docs`, component `{Name}.doc.mjs` files, and
  `packages/cli/assets/docs/`.
- Contributors: read `CONTRIBUTING.md` and the relevant guidance linked from
  `docs/README.md`.
- CLI output: an agent reads every byte a command prints. Think about how long
  an answer is, and test a change with agents, as
  `docs/contributing/cli-conventions.md` ("Output: keep answers short") says.
- Pull requests: choose one primary intent and use its template under
  `.github/PULL_REQUEST_TEMPLATE/`; read `docs/contributing/pull-requests.md`
  before opening or reviewing a mixed change. Before you request review, run
  `pnpm review:pre` and its checklist from a fresh session.
- Component work: derive the review's semantic triggers, load matching `current`
  global baseline claims with `node scripts/review-global-baselines.mjs
--authority-commit <base-sha> --review-head <head-sha> --triggers
<comma-separated-triggers>`, then read
  the component's `docs/specs/components/<ComponentRoot>/{Name}.spec.md` when
  one exists and any `module:*` records it
  lists. Load global records before narrower owners, but resolve the direct
  component or family owner first when it governs the exact delta. A global
  route exposes only the listed claim; it never makes the whole record govern
  the component or change. Preserve each matched record, claim, trigger, and
  match reason in the review receipt.
- Before editing a path, run `pnpm specs:for <path>`. After editing, before
  you commit or push, run `pnpm specs:for --diff origin/main` and follow every
  concern-routed claim.
- Any path: `pnpm specs:for <path>` lists the current records linked to it,
  the specs that decided them, and the global claims its component's triggers
  route. It reads the working tree, so on a pull-request branch it shows that
  branch's proposed records; it is a lookup, not review authority. It adds to
  the component-review steps above; it does not replace them.
- Component-local visual intent: reuse or amend the optional `Design decisions`
  table in the current component/module spec only when durable local intent must
  survive future redesigns. Keep exact tuning in code/evidence and shared rules
  in `docs/design/`. DESIGNOWNER authors may include that local intent with the
  pixels and evidence in one atomic appearance-only PR. External contributors
  follow the normal contribution flow and are never asked to author specs;
  maintainers own missing authority.
- Before adding a new `data-*` attribute to a component, treat it as public API: themes generate selectors on data attributes. Add one only when a current record names it and says why ([`architecture:public-component-api`](docs/architecture/public-component-api.md) DEC-2). For a dynamic per-instance style, pass a class plus an inline `--astryx-<component>-<prop>` property (the pipeline's per-instance value); never add a data attribute just to feed CSS. For any other internal-only concern, use a private `data-astryx-*` attribute under INV23, or no attribute.
- Layers: anchored layers follow their anchor through CSS anchor positioning only; script never moves a layer to follow its anchor ([`architecture:layer-runtime`](docs/architecture/layer-runtime.md) INV21). A press scales only the trigger's own visual; a layer renders outside it and anchors to the untransformed box (INV22).
- Cross-component work: read the relevant contract under `docs/families/`,
  applicable design spec under `docs/design/`, and current architecture under
  `docs/architecture/`.
- Consequential shared-system changes: use a record under `docs/specs/`.
- Writing or reviewing any knowledge record: run the rubric in
  `docs/contributing/spec-writing.md` over the record and put its results in
  the pull request description under `## Writing rubric results`. A record
  describes the system in the present tense; proposals, history, pull requests,
  research, and project status (what is built so far, what goes first) stay out
  of it. When reviewing, read the record against the reported results; a record
  pull request without them is incomplete, so ask for them before reviewing the
  content.
- Integration contribution work: read `docs/specs/AST-039/spec.md`. Every new
  discoverable item owns a strongly typed, same-stem `.doc.mjs`; root manifests
  locate directories and never catalog their items. No catalog file (like
  `themes/manifest.json`) and no per-item map in the manifest, ever.

## Authority

Knowledge records declare `authority`:

- `draft`: not authoritative; may still need evidence or owner review;
- `current`: explicitly approved and authoritative;
- `archived`: context only, with a reason such as `superseded`, `withdrawn`,
  or `historical` and a replacement link when one exists.

Only `current` records govern implementation and review. Never infer approval
from merged code, silence, an old review, or an existing wiki page.

## Judgment boundary

Resolve checkable behavior from code, tests, and browser evidence. Ask a human
only when a stable public API, theme contract, ownership boundary, compatibility
policy, or genuinely subjective visual direction remains undecided. Ask one
question at a time.

Before drafting, reviewing, or implementing a proposed outcome, search current
records and open pull requests using the proposed canonical owner/id, affected
paths and exported symbols, and the behavior's semantic terms. Extend or project
the existing canonical owner by default. Create a new record only for a distinct
fact boundary, and state why the existing owner cannot contain it. Do not create
new policy for work that is already complete, owned, or superseded.

## Validation

Run `pnpm check:knowledge` after editing knowledge records or templates. A
material template-shape change requires a schema-version bump and migration of
active records; changing template guidance alone does not rewrite accepted
history.

## Custom Commands

### `/vibe-test [count]` - Run vibeability tests

Tests how well AGENTS.md helps LLMs generate correct Astryx component code.

**Usage:**

```
/vibe-test 5                    # Run 5 stratified sample tests (one-shot)
/vibe-test                      # Run all 21 tests (one-shot)
/vibe-test 5 --degradation      # Run 5 tests with degradation curve (10-turn)
```

**How to execute:**

1. Run `pnpm -F @astryxdesign/vibe-tests interactive --sample <count>` to set up iteration
2. Spawn parallel subagents (one per test prompt) to:
   - Read the task file from `results/<iteration>/tasks/{promptId}.json`
   - Generate code for the prompt using Astryx components (AGENTS.md auto-injected)
   - Self-evaluate for success/escape hatches
   - Write `.tsx` result to `results/<iteration>/results/{promptId}.tsx`
   - Write `.json` metadata to `results/<iteration>/results/{promptId}.json`
3. Trigger `gh workflow run vibe-screenshots.yml` to build previews and capture screenshots
4. Run `pnpm -F @astryxdesign/vibe-tests aggregate --iteration <id>` to see results

**Degradation mode (--degradation):**
Tests context retention across 10-turn conversations with filler, distractor, and recovery turns.
Probes at turns 0, 6, 8, 10 to measure quality degradation. Results show a line graph of each test's progression.

**Result format:**

```json
{
  "id": "<iter>-<promptId>",
  "timestamp": "...",
  "model": "claude-code-interactive",
  "persona": "naive",
  "promptCategory": "...",
  "trajectoryDepth": 0,
  "prompt": "...",
  "response": "<code>",
  "evaluation": {"success": true, "componentsUsed": [...], "escapeHatches": [...]}
}
```

Runners may also write an optional `<promptId>.provenance.json` sidecar beside the result metadata. The versioned, executor-neutral contract and fallback behavior are documented in `internal/vibe-tests/docs/execution-provenance.md`.

## AI Context

For architectural context, decisions, and research, see the **[GitHub Wiki](https://github.com/meta/astryx/wiki)**:

- **Decisions** — API Conventions, Why StyleX, StyleX Distribution
- **Architecture** — System Architecture, Component Authoring Guide
- **Research** — AI + Design Systems, AI Model Trajectory, Swizzle Ergonomics
- **Future** — Animation System, RSC Utilities, Distribution Strategy

For component-specific documentation, see the `{Name}.doc.mjs` file in each component directory under `packages/core/src/` (e.g. `Button/Button.doc.mjs`). These are plain JS files with JSDoc type annotations exporting a `ComponentDoc` object (typed via `@astryxdesign/cli/authoring`).

## Documentation Standard

Documentation lives in two places:

1. **File Headers** — Each source file has a structured JSDoc header with `@input`, `@output`, `@position`, in about 12 lines at most
2. **Component Docs** — `{Name}.doc.mjs` files in each component directory (props, features, examples)

**Update Protocol**: When modifying code, keep the file's header comment accurate. Look for `SYNC:` comments as reminders.

**Source comments** ([`architecture:knowledge-contracts`](docs/architecture/knowledge-contracts.md#source-comments) INV29): make the code explain itself with names, structure, and control flow. A comment explains only non-obvious work: a reason, a constraint, an invariant, or a browser quirk. Never narrate the code, restate names or types, or cite pull requests, issues, dates, or spec records (`pnpm specs:for <path>` finds the record). When a citation is a file's only link to a record or claim, add that link to a record before you remove it: for a whole record, link the file through `applies_to`, `verified_by`, or `path-applicability:v1`; for a claim such as `AST-108 FR4`, add a claim-scoped reference such as `system_specs: [spec:AST-108/FR4]` to the file's own component, module, or theme record. Write in ASD-STE100 Simplified Technical English: short sentences, one topic each, active voice, present tense. Keep public JSDoc, the Effect note naming the system it syncs, and directives a tool reads: lint and TypeScript directives, `@pr-a11y` lines, and any other comment line a repository tool parses. The record has a worked before/after example.

**Audience**: every `.doc.mjs`, and everything under `packages/cli/assets/docs/`, is written for people **building with** Astryx — not for people building Astryx. Internal review rubrics, readiness gates, audit checklists and lab→core criteria belong in the wiki. A public authoring-quality rubric belongs in shipped docs when callers use it to evaluate an artifact they create through Astryx and a current system spec assigns that ownership. [`packages/cli/assets/docs/README.md`](packages/cli/assets/docs/README.md) has the test and the page each kind of material goes to.

## Quick Reference

- **Runtime**: use the Node version in `.nvmrc` before tests and typechecking;
  `CONTRIBUTING.md` explains how to select it.
- **Package manager**: pnpm 11, pinned by the `packageManager` field (see
  CONTRIBUTING.md for install options — Corepack is one of several, and Node
  25+ no longer bundles it)
- **Testing**: Vitest (colocated tests)
- **Components**: `packages/core/`
- **Storybook**: `apps/storybook/`
- **Imports inside a package**: import the defining module (`'../List/List'`), never a folder's index barrel (`'../List'`); public consumers import `@astryxdesign/core`. `@astryx/no-internal-barrel-import` enforces it.

## JSDoc Conventions

- **`@example` code fences must use plain ` ``` `, not ` ```tsx `.**
  Storybook's autodocs parser doesn't handle language-tagged fences in JSDoc correctly — the code block won't render as a proper code block. Always use untagged fences in `@example` blocks.

<!-- TAILWIND-CAPS:START -->

**Astryx styling pipeline.** Read `docs/specs/AST-119-tailwind-utility-styling/spec.md` before styling work.

- **Source**: one precompiled sheet per package, built from `packages/<pkg>/tailwind/*.input.css`; `@source` scans only `src/**/*Classes.ts`.
- **Classes**: literal class text in `*Classes.ts` maps, joined with `tw()` at the call site. A template literal, a helper, or class text outside a `*Classes.ts` file never reaches the sheet; `@astryx/no-invisible-class` fails on it.
- **Values**: a per-instance value is a class plus an inline `--astryx-<component>-<prop>` property, typed `React.CSSProperties & Partial<Record<…>>`. Never an inline declaration a class can express.
- **Arbitrary values**: a declaration is `[property:value]`. A `var()` with a comma fallback must use that form (`[overflow-x:var(--x,clip)]`, not `overflow-x-[var(--x,clip)]`). A `calc()` in an arbitrary value loses the underscores of every `var(--_x)` it reads.
- **Layers**: utilities print inside `@layer astryx-base` (order `reset, astryx-base, astryx-theme`). Consumer `xstyle` and `style` are unlayered and always win (DEC-8); a consumer `@layer utilities` rule outranks `astryx-base` whatever the specificity.
- **State**: a state utility needs its own specificity — repeat the attribute or class (`[&[data-astryx-x][data-astryx-x]:hover]:…`, `[&.astryx-button]:…`), never rely on sheet order.
- **Escape**: a rule that must outrank a consumer utility stays in a `.stylex.ts` module and names the rule it beats (DEC-9). Nothing else holds StyleX.
- **Tokens**: read `var(--spacing-*)`, `var(--color-*)`, `var(--radius-*)`, `var(--duration-*)`. The library declares no token and adds no Tailwind palette colour (`@astryx/no-raw-color`).
- **Keyframes**: `@keyframes astryxX` in `packages/<pkg>/tailwind/<pkg>.input.css`, referenced with `animation-name` and an explicit duration.
- **Props**: `className` merges through `tw()`; `mergeProps` takes at most four arguments and its third is a class string or a style object; `xstyle` goes last.
- **Tests**: assert class sets (`classesOf`, `expectClassSet`, `expectVariable`), never `getComputedStyle` for a Tailwind declaration; declarations are asserted once against the built sheet.
- **Verify**: `node packages/<pkg>/scripts/build-css-tailwind.mjs`, then the package's `*TailwindStylesheet.source-build.test.mjs`.

<!-- TAILWIND-CAPS:END -->

<!-- ASTRYX-CLI:START -->

Astryx CLI|Run from repo root. Load agent docs before any component work.
astryx() { node packages/cli/clients/cli/bin/astryx.mjs "$@"; }
BOOTSTRAP (run every branch, <500ms):
astryx help # discover all commands and options
astryx docs # list available doc topics
astryx docs principles --dense # design rules, anti-patterns, xstyle, tokens
astryx docs tokens --dense # spacing, color, radius, typography, shadow
astryx docs theme --dense # theme provider, light/dark, overrides
astryx component --list # all components grouped by category
astryx template --list # available page templates
ON DEMAND:
astryx docs <topic> --index # section index: one line per section, with its key
astryx docs <topic> <section> # one section, by key or title
astryx component <Name> --dense # props, variants, usage, anatomy for one component
astryx template <name> # emit full page source
astryx template <name> --skeleton # layout skeleton with spatial annotations
astryx swizzle <Name> # eject component source for deep customization
astryx upgrade --from <old version> --apply # run version migration codemods
OPTIONS: --detail compact|brief less output | --dense token-efficient | --zh Chinese
RULE: always run bootstrap on each branch — docs reflect the branch's actual API
RULE: always run astryx component <Name> --dense before modifying a component
RULE: after @astryxdesign/core bump, always run astryx upgrade --from <old version> --apply

<!-- ASTRYX-CLI:END -->
