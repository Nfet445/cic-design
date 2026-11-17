# display and feedback surfaces

Status: claimed
Blocked by: 09
Wave: 8
Ticket: 46
Parent: `00-epic-stylex-to-tailwind-4`

## What

The components that draw a box, a label or a placeholder rather than an input
or an overlay. Each carries a simple `stylex.create` map, and several read a
token that the theme owns, so this ticket is the cheapest place to prove that
the class map plus a token variable reaches the same pixels.

## Files

- `packages/core/src/Card/Card.tsx` — 4 creations
- `packages/core/src/Divider/Divider.tsx` — 4
- `packages/core/src/Banner/Banner.tsx` — 4
- `packages/core/src/Badge/Badge.tsx` — 2
- `packages/core/src/Markdown/Markdown.tsx` — 5, plus
  `packages/core/src/Markdown/plugins/HeadingLinksRenderer.tsx` — 2
- `packages/core/src/Code/Code.tsx` — 3
- `packages/core/src/CodeBlock/CodeBlock.tsx` — 3
- `packages/core/src/Blockquote/Blockquote.tsx` — 1
- `packages/core/src/Spinner/Spinner.tsx` — 4, plus
  `packages/core/src/Spinner/spinnerRotor.ts` — 1 (the rotation keyframes)
- `packages/core/src/ProgressBar/ProgressBar.tsx` — 4
- `packages/core/src/Skeleton/Skeleton.tsx` — 3
- `packages/core/src/StatusDot/StatusDot.tsx` — 2
- `packages/core/src/EmptyState/EmptyState.tsx` — 1
- `packages/core/src/Outline/Outline.tsx` — 3
- `packages/core/src/AspectRatio/AspectRatio.tsx` — 2
- `packages/core/src/Thumbnail/Thumbnail.tsx` — 1
- `packages/core/src/MetadataList/MetadataList.tsx` — 2, plus
  `MetadataListItem.tsx` — 1
- `packages/core/src/Timer/Timer.tsx` — 1
- `packages/core/src/Timestamp/Timestamp.tsx` — 1, plus
  `TimestampHoverCard.tsx` — 2
- `packages/core/src/Toast/Toast.tsx` — 1, plus `ToastViewport.tsx` — 1
- `packages/core/src/Carousel/Carousel.tsx` — 3

## Approach

- Literal classes in a `*Classes.ts` module beside the component, joined with
  `tw()`; the build scans `src/**/*Classes.ts`, so an interpolated class emits
  nothing.
- A value the props compute (a carousel offset, a progress width, a status
  tone) is a class plus an inline `--astryx-*` variable, never an inline
  declaration.
- A keyframe animation moves to `packages/core/tailwind/astryx.input.css` as
  `@keyframes astryx<Name>`, and the class names it, because the scanner reads
  class maps and not `.ts` files. `spinnerRotor.ts` is the first of these.
- `xstyle` stays last, `className` after the map. Utilities print inside
  `@layer astryx-base`, so an unlayered StyleX rule still wins; if a rule must
  outrank a class, leave it and say why in the ticket.

## Done when

- No `stylex.create` under these directories, except a rule the ticket names
  and justifies.
- Each test that read a computed style or a StyleX debug name now reads the
  class set; each moved assertion is named in the ticket.
- New exports are registered in the coverage block of
  `packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`, and the
  sheet test stays green.
- A `component`/patch changeset covers the consumer-visible output change.

## Verification

- `pnpm exec vitest run packages/core/src/Card packages/core/src/Divider packages/core/src/Banner packages/core/src/Badge packages/core/src/Markdown packages/core/src/Code packages/core/src/CodeBlock packages/core/src/Spinner packages/core/src/ProgressBar packages/core/src/Skeleton packages/core/src/StatusDot packages/core/src/Timestamp packages/core/src/Toast packages/core/src/Carousel packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`
- `node packages/core/scripts/build-css-tailwind.mjs`
- `pnpm -F @astryxdesign/core typecheck`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md`.
- Manual Windows High Contrast check applies to Card, Divider, Outline,
  Banner and StatusDot.

## Progress

- `Card` paints with Tailwind classes (`Card/cardClasses.ts`). Thirteen variant
  backgrounds, four elevation variables, the radius, the corners, the border,
  the overflow arm and the sizing classes are literals; the sizing values ride
  `--astryx-card-width`, `--astryx-card-height`, `--astryx-card-max-width` and
  `--astryx-card-min-height`.
- One rule stays in `Card/cardBorder.stylex.ts`, and the ticket names it:
  `container()` sets `padding` from its variables as an unlayered StyleX rule,
  so the border-inset `calc()` padding cannot be a class — an unlayered rule
  wins over `astryx-base` at any order. Only the subtracted padding stays; the
  border itself is a class.
- Moved assertions in `Card/Card.test.tsx`: the four `getComputedStyle`
  reads of `minWidth`/`overflow` now use `expectClassSet`, and the size check
  reads `expectVariable('--astryx-card-width')`. One consumer override
  (`xstyle` with `minWidth: 240`) still reads `getComputedStyle`, because
  `xstyle` remains StyleX and jsdom still applies its sheet.
- `cardClassName` and its siblings are registered in `familyClassNames()` of
  `packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`. With the
  menu leaves from `poc/tailwind-layout-primitives` the sheet reached 1042
  rules, so the ceiling moved to `toBeLessThan(1050)` and the comment says why.
- Changeset: `.changeset/card-tailwind-classes.md` (`component`, patch).

- `Divider` paints with Tailwind classes (`Divider/dividerClasses.ts`): the row
  per orientation, the line per orientation plus its weight, the label with the
  stacked padding arm, and both full-bleed arms that read
  `--container-padding-*` with a `0px` fallback. No `stylex.create` is left in
  the directory, and no rule needed a `.stylex.ts` exception: no `container()`
  call stands between the class and the line.
- No test in `Divider/` read a computed style, so none had to move. The stale
  comment that said `isFullBleed` "is applied via stylex" is gone with the test
  that held it: it and the two variant stubs became five class assertions
  (`expectClassSet`) over the row, the line, the weight, the label and the
  full-bleed set.
- `Banner` paints with Tailwind classes (`Banner/bannerClasses.ts`): the frame
  and its four elevations, the status header with one fill class per status
  (fill, on-muted foreground and the forced-colors outline together), the
  centered arm, both card-radius arms, the text column with its `8rem` wrap
  threshold, the title and description, the icon wrapper, the end area with its
  block margin and text-context reset, the content area, and the chevron with
  its reduced-motion duration. `edgeCompSlot.inset()` remains StyleX: it
  publishes a private variable the end area reads, and it paints nothing.
- Moved assertions in `Banner/Banner.test.tsx`, and why: the four on-muted
  control rows read `--color-text-primary` through `getComputedStyle` on the
  Button and on its tooltip; they now read the control class on the Button and
  its absence on the tooltip. The endContent test compared computed colors of
  two titles and two dialogs; it now asserts the title's foreground class and
  the end area's reset class around the dialog. Three narrow-viewport tests read
  `flexWrap` and `flexBasis`; they read the class set. The forced-colors test
  read the compiled rule through the style-sheet helper; it reads the three
  `forced-colors:` classes on the header and checks every status carries them.
- The sheet ceiling moved twice: 1050 → 1060 for Divider's 8 rules, then 1060 →
  1080 for Banner's 26. Both reasons are in the test's comment. The build's
  `@source` scan already covered the new maps, so the coverage test passed at
  the first build.

- `Badge` paints with Tailwind classes (`Badge/badgeClasses.ts`): the pill
  (inline flex, the theme's height token, the supporting type scale, the full
  radius, `max-w-full` with `min-w-0`), the `min-h-[1lh]` arm that grows with a
  label, the label's ellipsis and bidi isolation, and one class per variant. A
  semantic variant carries its fill and its forced-colors outline in the same
  class, the way Banner's status does. No rule needed a `.stylex.ts`
  exception.
- Moved assertion in `Badge/Badge.test.tsx`: the forced-colors test read the
  compiled rule through `getForcedColorsRules`; it now asserts the three
  `forced-colors:` classes on the pill and checks every semantic variant
  carries them and a tint variant does not.
- `Code` paints with Tailwind classes (`Code/codeClasses.ts`): the monospace
  face, the code type size, the muted background, the inline padding, the inner
  radius, the break rules, one class per color and the `inherit` size arm. No
  test moved: `Code.test.tsx` only ever read theme-target class names.
- `Blockquote` paints with Tailwind classes (`Blockquote/blockquoteClasses.ts`):
  the inline-start rule with `border-solid` (the other three sides keep a zero
  width, so only the start rule paints), the start padding, the secondary text
  and `m-0` on the quote; the block attribution with its supporting type and
  `not-italic`. No test moved.
- `StatusDot` paints with Tailwind classes (`StatusDot/statusDotClasses.ts`):
  the eight-pixel plate, the icon field, the pulse and one class per variant,
  where the three semantic plates carry their forced-colors outline. The pulse
  is the first component keyframe after the rotor: `@keyframes
astryxStatusDotPulse` sits in `packages/core/tailwind/astryx.input.css` and
  the class names it as `animate-[astryxStatusDotPulse_2s_ease-in-out_infinite]`
  with `motion-reduce:animate-none`.
- Two assertions moved in `StatusDot/StatusDot.test.tsx`: the forced-colors
  test now reads the three classes on the dot (and checks each semantic
  variant, plus a tint variant's absence), and the "variant ink" test dropped
  its StyleX probe — it compares the dot against
  `statusDotVariantClassName[variant]` instead of a local `stylex.create`
  map's atomic classes.
- The sheet ceiling moved 1160 → 1180 for the four maps above: they added about
  45 rules and the sheet sits at 1159. The reason is in the test's comment.

- `Skeleton` paints with Tailwind classes (`Skeleton/skeletonClasses.ts`): the
  placeholder with its `contrast-more` composite and both forced-colors arms
  (GrayText fill, `opacity: 1`), the pulse, one class per radius, and the two
  utility classes that read the props' variables. No `stylex.create` is left in
  the directory; `stylex.props(xstyle)` is the only remaining StyleX call.
- The pulse's keyframes moved to `packages/core/tailwind/astryx.input.css` as
  `@keyframes astryxSkeletonFade`, and one class spells the whole shorthand:
  `animate-[astryxSkeletonFade_var(--_astryx-pre-tempo-duration-medium-max,var(--duration-medium-max))_linear_infinite_alternate]`
  plus `motion-reduce:animate-none`. The build emits it whole — the comma
  inside the `var()` fallback survives, and the class a test reads is the same
  string the map holds.
- Width, height and the stagger delay are a class plus an inline variable
  (`--_skeleton-width`, `--_skeleton-height`, `--_skeleton-delay`, set as
  computed keys, not a cast). The variables brought three follow-ups a
  migrating component must expect: they are documented in
  `Skeleton/Skeleton.doc.mjs` (`theming.vars[]` and `theming.derived[]`), mapped
  in `theme/derivedVarRegistry.ts` under `skeleton`, and listed in
  `DIR_TO_REGISTRY_KEY` of `derivedVarRegistry.test.ts`.
- `Skeleton/Skeleton.test.tsx` no longer reads an injected StyleX sheet. The
  `pulse` helper reads `buildAstryxTailwindCss()` through `stylesheetOf`, the
  keyframe assertions run against `@keyframes astryxSkeletonFade` in that
  sheet, and the timing/direction/iteration assertions read the one class that
  spells the shorthand. The forced-colors test reads `blockOf` over the two
  `forced-colors:` classes.
- Two source guards moved with the code, not around it: `themeMotion.test.ts`
  reads `Skeleton/skeletonClasses.ts` for the literal
  `var(--_astryx-pre-tempo-duration-medium-max,var(--duration-medium-max))`
  (a class string cannot hold the StyleX form), and the `Skeleton.radius`
  exception in `themingTargets.test.ts` is gone — the radius is a class now, so
  the axis no longer paints without reaching `themeProps()`.
- `skeletonClassName` and its siblings are registered in `familyClassNames()`
  of `packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`.

- `EmptyState` paints with Tailwind classes (`EmptyState/emptyStateClasses.ts`):
  the centered container and its compact arm, the text column, the title and
  description with their compact sizes, and the action row with its stacked
  arm. The compact classes override only what the compact layout changes, so
  they stay joined after the base. No test moved: `EmptyState.test.tsx` reads
  only the consumer-`xstyle` class, which is still StyleX.
- `Timestamp` paints with Tailwind classes (`Timestamp/timestampClasses.ts`):
  the `<time>` element's inherited-property reset. `TimestampHoverCard`
  paints with `Timestamp/timestampHoverCardClasses.ts`: the definition-list
  grid with its two gaps, the `contents` row, the label and value cells in
  supporting and body type, the value cell that spans both tracks (`flex`,
  with a `supports-[grid-template-columns:subgrid]:grid` arm), the action
  cell, and the four grid templates as one string-valued map. No test moved;
  `Timestamp.test.tsx` reads no computed style for these nodes.
- `Timestamp.test.tsx` fails 5 ICU cases ("Timestamp calendar systems",
  `chinese` calendar) on `main` too; the count is unchanged.

## Left

`Card`, `Divider`, `Banner`, `Badge`, `Code`, `Blockquote`, `StatusDot`,
`Skeleton`, `EmptyState` and `Timestamp`/`TimestampHoverCard` are done. The
rest of the ticket's files still carry their `stylex.create` maps:

- `CodeBlock` (3), `Spinner` (4) plus `Spinner/spinnerRotor.ts` (1),
  `ProgressBar` (4), `Outline` (3),
  `AspectRatio` (2), `Thumbnail` (1), `MetadataList`/`MetadataListItem` (3),
  `Timer` (1), `Timestamp`/`TimestampHoverCard` (3), `Toast`/`ToastViewport` (2),
  `Carousel` (3), `Markdown` (5) plus `Markdown/plugins/HeadingLinksRenderer.tsx`
  (2).
- One keyframe is still inside a `.ts` file:
  `Spinner/spinnerRotor.ts` (`rotation`, 100 turns per iteration, so
  `@keyframes astryxSpinnerRotor`). Skeleton is the worked example of the
  shape: the frames in `packages/core/tailwind/astryx.input.css`, one class
  that spells the whole shorthand, `motion-reduce:` arm for the slower turn
  (the rotor must never stop, so `motion-reduce:animate-none` is wrong there:
  it needs `animate-[astryxSpinnerRotor_calc(3s*100)_linear_infinite]`).
- `Spinner/spinnerRotor.ts` cannot convert alone: `spinnerRotorStyles.turn` is
  imported by `packages/lab/src/CircularProgress/CircularProgress.tsx` and its
  test reads `stylex.props(spinnerRotorStyles.turn).className`. The rotor export
  changes with the lab caller or not at all, so either the same window owns
  both or the rotor keeps one named `stylex.create` until CircularProgress
  migrates.
- `CodeBlock` needs one named `stylex.create` exception, like Card's
  `cardBorder.stylex.ts`: `CodeBlock.focusRing.test.tsx` asserts the shared
  inset ring through `__tests__/insetFocusRing.ts`, which reads the StyleX
  atoms of `focusOutlineStyles.focusVisible` on the viewport. Keep the ring as
  `focusOutlineProps.focusVisible(inset)` and make the inset offset the StyleX
  map; the other ~40 keys convert. Its line/diff groups also stack stateful
  classes on one property (`code` vs `codeWrapped`, `line` vs `lineNumbered` vs
  the two diff arms vs the highlight tint), so each group needs one function
  that returns a complete class string per state rather than two classes that
  paint the same declaration.
- `CodeBlock/CodeBlock.tsx:76-489` holds the four maps and the keyframes: the
  card and section frames, the prop-driven `width`/`gutterWidth` functions
  (line 97), the `chevronReveal` keyframes (line 116, which has to become
  `@keyframes astryxChevronReveal` in `tailwind/astryx.input.css`), and about
  40 keys in `styles` with `::before`/`::after` content, four property groups
  whose state arms paint the same declaration (`code`/`codeWrapped` at 268 and
  282, `line`/`lineNumbered`/the two diff arms/the highlight tint at 312-404),
  and the collapse grid transition. It is a window of its own.
- `ToastViewport.tsx:79-260` carries about 17 keys, not one: the outlet's
  `display: contents`, the viewport reset with its safe-area paddings (a
  `pointer: coarse` block arm and both RTL inline arms), the four placement
  arms, and eight wrapper keys with `@starting-style` entries and a
  `:last-child`/`:first-child` gap arm. `Toast/Toast.tsx:83-150` is smaller but
  paints the swipe transform from three `--_toast-swipe-*` private vars.
- `ProgressBar` computes its fill width and its mark position from props, so
  those go through a class plus an inline `--astryx-*` variable, and its test
  reads computed geometry.
- `Spinner`'s `sizeStyles` and `shadeStyles` declare the four public
  `--spinner-*` vars, and `theme-var-reachability.js` finds a var by the
  element that declares it — the converted classes must keep declaring them on
  the same element (`!hasLabel ? span : wrapper`), or the guard reads the var
  as unreachable.
- Card's remaining test `getComputedStyle` read is the consumer-`xstyle` one
  named above.
- The manual Windows High Contrast check for Card, Divider, Banner, Badge,
  StatusDot and Skeleton is not done. All five carry their boundary as a `forced-colors:`
  outline class and their tests assert the class rather than the compiled
  rule, so the manual check is the only place the boundary is seen. Divider
  draws a border-width line, so it is in the same list.
- The family browser check page does not exist yet.

## Result

`Card`, `Divider`, `Banner`, `Badge`, `Code`, `Blockquote`, `StatusDot` and
`Skeleton` are converted, verified and committed, one commit each:

- `refactor(card): перевести стили карточки на Tailwind-классы`
- `refactor(divider): перевести стили разделителя на Tailwind-классы`
- `refactor(banner): перевести стили баннера на Tailwind-классы`
- `refactor(badge): перевести стили бейджа на Tailwind-классы`
- `refactor(code): перевести стили встроенного кода на Tailwind-классы`
- `refactor(blockquote): перевести стили цитаты на Tailwind-классы`
- `refactor(status-dot): перевести стили точки статуса на Tailwind-классы`
- `Skeleton: перевести на карту Tailwind-классов`

The window that added `Skeleton` ran out there; the four components it was
given first (`CodeBlock`, `Spinner` and its rotor, `ProgressBar`) are listed
under Left with the reason each one did not fit: `CodeBlock` needs a named
StyleX exception for the shared inset ring and per-state class functions for
four property groups over a 1388-line file, the rotor's export is shared with
Lab's `CircularProgress`, and `ProgressBar` reads computed geometry in its
test. `Skeleton` was chosen because it carries two of the three recorded
traps — the keyframes move and the sheet-reading test rewrite — and it is the
smallest file that exercises both.

A later window added two more, smallest-first, because `CodeBlock` does not
fit a 30-minute window (it carries four maps, the chevron keyframes and four
property groups that need a class function per state):

- `refactor(empty-state): перевести стили пустого состояния на Tailwind-классы`
- `refactor(timestamp): перевести стили метки времени на Tailwind-классы`

The merge of `poc/tailwind-layout-primitives` conflicted once, in the sheet
test's ceiling. Both sides were kept: the menu's paragraph and its 18 rules,
and this ticket's Skeleton map and its 25. The merged build measures 1212
rules, so the comment names that number and the ceiling stays
`toBeLessThan(1260)`. `node --check` passes on the test file.

The fifth window's merge of `poc/tailwind-layout-primitives` (the
form-controls ticket's work) auto-merged the sheet test with no conflict. The
module list now carries both sides' imports and both registration blocks, the
sheet test passes at its existing `toBeLessThan(1260)` ceiling, and the
comment's 1212 is the number it measured before this window added EmptyState
and Timestamp, so this window left the ceiling alone.

After the merge `node packages/core/scripts/build-css-tailwind.mjs` plus
`pnpm exec vitest run packages/core/src/CodeBlock packages/core/src/Spinner
packages/core/src/ProgressBar packages/core/src/Skeleton
packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
packages/core/src/theme packages/lab/src/CircularProgress` is green (2247
tests). `pnpm -F @astryxdesign/core typecheck` and `eslint` are clean.
Nothing is pushed.
