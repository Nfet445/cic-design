---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-119
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [cixzhang]
affects_architecture:
  - architecture:component-style-authoring
  - architecture:public-component-api
  - architecture:theme-compilation
affects_families: [family:layout-primitives]
affects_contributing: [contributing:api-conventions]
affects_consumer_docs: [principles]
---

# Tailwind 4 utility styling

<!-- path-applicability:v1 -->

```json
{
  "paths": [
    "packages/core/src/**",
    "packages/core/tailwind/**",
    "packages/build/src/**",
    "packages/cli/**",
    "scripts/**"
  ]
}
```

<!-- Describe the system, not the project: present tense, what it does. No proposals, history, pull requests, or research in the record; see docs/contributing/spec-writing.md and report its rubric results in the pull request. -->

## Intent

A component's own styling is Tailwind utility classes written in its source and
precompiled into the package stylesheet. The declarations they generate sit in
`@layer astryx-base`, beside every rule a component owns today, so one
stylesheet replaces the other and the cascade order is unchanged.

A token reaches a utility through a Tailwind theme variable that the active
theme declares: the utility names the semantic token, and the theme names its
value. A per-instance value — a caller's width, a computed track template —
reaches a utility through a CSS variable the element carries inline, so the
declaration stays in a class and a consumer rule can still override it.

The three caller styling props keep the contract `spec:AST-071` states.

## Non-goals

- Changing the theme package format, the token names, or the `astryx-theme`
  layer.
- Changing `xstyle`, `className`, or `style`, or the order they merge in
  (`architecture:public-component-api` INV6).
- A Tailwind dependency for a consumer. A consumer loads one stylesheet and
  keeps whatever utility pipeline it already has.
- Styling a native surface, which `spec:AST-112` covers.
- Generating classes at runtime.

## Public contract

```tsx
import '@astryxdesign/core/astryx-tailwind.css';
import '@astryxdesign/theme-neutral/theme.css';

<Stack gap={2} padding={4} xstyle={styles.tight}>
  <StackItem>One</StackItem>
</Stack>;
```

`Stack` renders `flex flex-col gap-2 [padding-block-start:var(--spacing-4)]`
and whatever `xstyle` compiles to. `styles.tight` still wins, because the
consumer's StyleX rules carry no cascade layer and Astryx rules carry
`astryx-base`.

## Requirements

- **FR1 — One precompiled stylesheet per package.** A package's Tailwind
  utilities are built into that package's stylesheet at build time, so no
  utility is generated in the browser and no Tailwind build step is required
  of a consumer. Core ships its utilities as `@astryxdesign/core/astryx-tailwind.css`.
  The file registers the package layer order and, like `astryx.css`, places
  every rule it holds inside `@layer astryx-base`
  (`spec:AST-080` FR3).
- **FR2 — The same slot, so the swap is one import.** A package's Tailwind
  stylesheet and its StyleX stylesheet hold the same layer and the same kind
  of rules; loading either in that slot yields a working component. A package
  never needs both for one component, and both load without doubling a
  declaration.
- **FR3 — Utilities are literal source text.** A component's classes are
  written in component source or in a module beside it as literal strings, in
  a form a source scanner reads without evaluating code: a class map keyed by
  token or step, and a function that picks map entries with `tw()`. No class
  is assembled from fragments, no conditional fragment is interpolated into a
  larger name, and no class is derived from a runtime value. A dynamic value
  reaches a declaration as a CSS variable (FR5), never as part of a class
  name.
- **FR4 — A token is a theme variable.** A utility that names a design token
  reads a `--color-*`, `--spacing-*`, `--radius-*`, `--text-*`, or `--shadow-*`
  variable the theme declares, by the name `packages/core/src/tailwind-theme.css`
  maps. Utilities in a package stylesheet read those variables and declare
  none of them: the theme owns every value, so theme switching changes what a
  component's utilities compute to, with no stylesheet rebuilt. A spacing step
  is one number, `--spacing-<step>`, and a multiple of it is Tailwind's
  spacing scale (`gap-2`), never a second hard-coded length.
- **FR5 — A per-instance value is a class plus an inline variable.** When a
  prop carries a value no class can name — a caller's `width`, a computed
  `grid-template-columns`, a capped column count — the element carries the
  value in an inline custom property and the declaration in a class that
  reads it. A declaration never lands in an inline style, because an inline
  declaration beats every class, including a consumer's `xstyle` and a
  consumer rule inside an `@media` query. The variable name states its owner
  (`--astryx-<component>-<property>`) and is not StyleX's
  `--x-<property>` debug name, so it outlives the styling library.
- **FR6 — A state that no descendant can express uses a variant.** A
  hover, focus, disabled, or container-width state is a Tailwind variant on
  the rule that carries it, and a pointer state is guarded by
  `@media (hover: hover)` as `spec:AST-017` requires. A parent state a child
  must read uses the ancestor marker pattern `architecture:component-style-authoring`
  states, never a descendant selector a consumer's markup could not satisfy.
- **FR7 — Logical edges stay logical.** An inline-start or inline-end
  padding is Tailwind's logical utility (`ps-*`, `pe-*`). A block-start or
  block-end padding uses a property-scoped utility
  (`[padding-block-start:var(--spacing-4)]`), because the scale addresses the
  physical `top`/`bottom` names; `spec:AST-025` still requires the logical
  edge. A uniform `padding` is Tailwind's `p-*`, and the edge-over-axis-over-uniform
  precedence `family:layout-primitives` FR3 states is preserved.
- **FR8 — Testing asserts what a stylesheet decides.** A unit test does not
  carry a CSS engine: it asserts the class set a component computes and the
  inline custom properties it sets, and a rule's declaration is asserted once,
  against the built stylesheet. A test never asserts a computed declaration
  that only a browser can resolve. The class set is a contract: a test names
  the classes it expects, so a variant, a step, and an axis stay observable
  when the declarations move between stylesheets.
- **FR9 — The build decides, not the dev runtime.** A declaration exists
  because the package stylesheet holds it, not because a development runtime
  injected it. A page that renders a component without the package stylesheet
  shows unstyled markup, and the documentation of each package names the
  stylesheet to import.
- **FR10 — The build names its candidate sources.** A package's stylesheet
  build turns off Tailwind's automatic source detection and lists the
  directories that may contribute classes, excluding test files. Detection
  reads every word a scanned text contains, so a comment, a test id, or a
  property value that happens to spell a utility name adds an unrequested
  rule; listing sources keeps the sheet a function of the components and
  makes the same sources produce the same sheet. A rule no class map can
  produce is a build defect, not an optimisation target.

## Current-state impact

- `architecture:component-style-authoring` INV1–INV7 state that
  component-owned styling lowers through the StyleX pipeline; FR1, FR3, and
  FR5 replace that mechanism and keep its ownership rule.
- `spec:AST-071` stays: FR1–FR3 of that record govern `xstyle`, `className`,
  and `style`, and the internal mechanism is free to change.
- `spec:AST-080` gains a second stylesheet per package: its layer-order,
  prebuilt-file, and import-contract requirements apply to both.
- `architecture:public-component-api` INV6 keeps the merging order; INV23
  still forbids a public `data-*` attribute added to feed CSS, and a
  class-backed custom property replaces the dynamic data attribute the
  same INV offers for a per-instance value.
- `architecture:theme-compilation` is unchanged: a theme still compiles to
  `@layer astryx-theme` rules from the same token source, and
  `packages/core/src/tailwind-theme.css` keeps mapping those names to
  Tailwind theme variables.
- `family:layout-primitives` FR3, FR4, and FR6 are the precedence, the axis
  split of `gap`, and the parent requirement this record's FR7 restates in
  Tailwind terms; no family requirement changes.
- `packages/build` loses the StyleX transform for a source build of a
  migrated package, and `packages/cli` templates and docs emit utility
  classes instead of `stylex.create`.

## Verification

| Contract            | Verification                                                                                                 | Representative states                                            | Mutation or failure expectation                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `spec:AST-119/FR1`  | Build a package, then load only its Tailwind stylesheet in a page that renders a migrated component          | Default, dense, and narrow viewport                              | A declaration missing from the built file shows in the browser; a rule outside `astryx-base` fails the build |
| `spec:AST-119/FR2`  | A page importing either stylesheet renders the component; a page importing both keeps one declaration        | Both files loaded in either order                                | A rule emitted outside the package layer fails review                                                        |
| `spec:AST-119/FR3`  | Source scan over the package: every class token is a literal in a class map or a `tw()` argument             | A component with a conditional variant                           | A computed class name fails review                                                                           |
| `spec:AST-119/FR4`  | A theme switch in one page changes what a component's utilities compute to; the built file declares no token | Light, dark, and a second theme package                          | A `--spacing-*` declaration or a literal length in the built file fails review                               |
| `spec:AST-119/FR5`  | A consumer `xstyle` and a consumer `@media` rule override a component's own value                            | A caller-set width, a computed track template                    | A declaration in the element's inline style fails review                                                     |
| `spec:AST-119/FR6`  | Hover, focus, and disabled states under a fine and a coarse pointer                                          | Pointer states, a container-driven layout change                 | A hover rule outside `(hover: hover)` fails review                                                           |
| `spec:AST-119/FR7`  | Element geometry under RTL and vertical writing                                                              | Inline-start padding, block padding, edge over axis over uniform | A physical `padding-left` or `padding-top` fails review                                                      |
| `spec:AST-119/FR8`  | A unit test over the computed class set and the inline variables; a stylesheet test over the declarations    | A variant, a spacing step, a sizing prop                         | A test asserting a computed browser declaration fails review                                                 |
| `spec:AST-119/FR9`  | A page rendering without the package stylesheet, and one importing it                                        | Server-rendered markup                                           | Markup that depends on an injected declaration fails review                                                  |
| `spec:AST-119/FR10` | Build the same sources twice and compare the sheets, then compare each rule against the class maps           | A source comment or test id that spells a utility name           | A sheet that changes between identical builds, or a rule no class map produces, fails review                 |

## Decision log

### DEC-1 — Utilities live in `@layer astryx-base`

A component's rules must sit exactly where its rules sit today, so the
stylesheet swap is one import and the cascade order
`reset < astryx-base < astryx-theme < utilities` holds. A consumer's own
utilities sit in `utilities`, so they beat a library rule without a
specificity war, and a theme override still beats both. Shipping the
utilities in a `utilities` layer, or unlayered, would change which of two
Astryx rules wins.

### DEC-2 — Classes are written in component source, not `@apply`

A class written in source is visible to a reader of the component, to the
source scanner that decides what the stylesheet contains, and to the test
that asserts the class set (FR8). A rule assembled in a stylesheet with
`@apply` hides the vocabulary from the scanner and from the class-set
contract, and couples every component to one stylesheet file.

### DEC-3 — A class map module holds the vocabulary

A family keeps its class strings in a module beside its component
(`stackClasses.ts`, `gridClasses.ts`), keyed by the token or step the prop
names, with `tw()` joining the picks. The map makes the whole vocabulary
readable in one place, keeps the conditional logic out of the render path,
and keeps every string literal, so FR3 holds.

### DEC-4 — A dynamic value keeps the CSS-variable indirection

StyleX gave this for free: a dynamic style became a class plus an inline
variable. Tailwind has no dynamic styles, so the component writes the
variable itself and names the class that reads it. The alternative — an
inline declaration — would lose every consumer override, which is the
regression `Grid`'s own test guards.

### DEC-5 — Block padding uses a property-scoped utility

Tailwind 4 addresses the spacing scale by physical property on the block
axis, and `spec:AST-025` requires the logical edge. A property-scoped
utility keeps the logical property and still reads the theme's spacing
variable, at the cost of a longer class name than `pt-*`.

### DEC-6 — A unit test asserts classes, a stylesheet test asserts declarations

No unit-test environment resolves a stylesheet: only a browser turns a class
into a declaration. Splitting the contract — class set in the component
test, declaration in a stylesheet test — keeps both observable, keeps the
component test fast, and stops a test from asserting a declaration it cannot
see.

## Open questions

- **OQ1 — Does `astryx.css` keep shipping after every package migrates?**
  (`human-api`) Removing it is a breaking change for a consumer that imports
  it; keeping it means a package builds rules nothing reads.
- **OQ2 — Is a utility class name public API?** (`human-api`) FR8 makes the
  class set a contract a test names. A consumer that targets `astryx-` classes
  would then be coupled to names this record does not promise.
- **OQ3 — Which cascade slot does a consumer's own `xstyle` rule take?**
  (`human-api`) A consumer that compiles its own StyleX rules into
  `astryx-base` loses the override FR5 promises; the records that document
  the composition order do not say which layer a consumer rule lands in.
- **OQ4 — Does the swizzle path ship utilities or source styles?**
  (`human-api`) A swizzled component that keeps Tailwind classes depends on
  the consumer's Tailwind build; `spec:AST-110` governs the output contract.
