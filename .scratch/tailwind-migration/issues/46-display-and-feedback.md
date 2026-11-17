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

- `Timer` paints with Tailwind classes (`Timer/timerClasses.ts`): the `<time>`
  inherited-property reset, with `tabular-nums` so the changing digits never
  shift the layout. No test moved: `Timer.test.tsx` reads text, `dateTime` and
  the consumer `xstyle` class only.
- `MetadataList` paints with Tailwind classes (`MetadataList/metadataListClasses.ts`):
  the column root, the title's bottom margin, the `dl` reset, the three grid
  arms (side labels, stacked labels, multi-column, horizontal), the show-more
  toggle with its disabled `aria-disabled` cursor arm, and one class that reads
  `--_metadata-list-columns`. The four grid arms all paint
  `grid-template-columns`, so the component joins exactly one.
- `MetadataListItem` paints with its own map
  (`MetadataList/metadataListItemClasses.ts`): the label and value type styles,
  their `24px` row floors, the stacked wrapper with its own label and value
  arms, and the icon wrapper.
- The runtime grid template (a fixed `columns` count, or a custom
  `label.width`) is a class plus an inline private variable, replacing
  `dynamicStyles.gridTemplate`: the `dl` carries
  `[grid-template-columns:var(--_metadata-list-columns)]` and the value rides
  `style={{'--_metadata-list-columns': …}}`. The variable is private and set
  from a prop, not a theme target, so no `derived[]` entry applies and the
  derived-var source scan reports nothing; the registry test is green without
  a new line.
- No test moved in `MetadataList/` or `Timer/`: neither suite reads a computed
  style or a StyleX debug name for these nodes.

## Left

`Card`, `Divider`, `Banner`, `Badge`, `Code`, `Blockquote`, `StatusDot`,
`Skeleton`, `EmptyState`, `Timestamp`/`TimestampHoverCard`, `Timer` and
`MetadataList`/`MetadataListItem` are done. The rest of the ticket's files
still carry their `stylex.create` maps:

- `ProgressBar` (4), `Outline` (3), `Thumbnail` (1), `Toast`/`ToastViewport`
  (2), `Carousel` (3), `Markdown` (5) plus
  `Markdown/plugins/HeadingLinksRenderer.tsx` (2). `CodeBlock` is done in
  window 8; its exception and the shape of its per-state functions are in
  `## Comments`.
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
- `ProgressBar` is the next window's first file and does not fit a short one:
  `ProgressBar/ProgressBar.tsx:156`, `:168` and `:181` are three keyframes
  (slide, slide RTL, reduced-motion pulse) that become `@keyframes
astryxProgressBar*` in `packages/core/tailwind/astryx.input.css`; `:194`,
  `:434`, `:467` and `:501` are the four maps (frame, variants, mark-on-fill,
  mark-on-track). Its fill paints one declaration group under four conditions
  at once — `:dir(rtl)`, `pointer: coarse`, `forced-colors: active` and
  `prefers-reduced-motion: reduce` — and the forced-colors key must beat the
  coarse key, which is the case the class-plus-variable rule does not decide by
  itself; the fill's `width`/`transform`/`transitionProperty` trio is the place
  a tiny `progressBarFill.stylex.ts` exception may be needed, with the reason
  in its header. The fill share and the mark position stay a class plus
  `--_progress-bar-fill` / inline `insetInlineStart`.
- `ProgressBar/ProgressBar.test.tsx` reads the compiled sheet in ten places
  (`:253`, `:688`, `:716`, `:762`, `:805`, `:843`, `:884`, `:1025`, `:1072`,
  `:1301`) and then reads the _map source text_ at `:1191-1215`
  (`compact.slice(compact.indexOf('fill:{'))`), so the touch and forced-colors
  arms are asserted against a literal that no longer exists once the map is a
  class string. That block has to become `stylesheetOf(buildAstryxTailwindCss())`
  reads over `blockOf`, as `Skeleton.test.tsx` did, and the `:1301` keyframe
  read moves to the `@keyframes` name in that sheet.
- `Thumbnail/Thumbnail.tsx:142` is one map of about twelve keys, but three of
  them are pressed-state and hover-reveal rules (`:180` `interactive`, `:286`
  the remove slot's offset vars) that share `interactionOverlay.stylex.ts` and
  `useContainerReveal`, so it converts with those two seams open, not alone.
- `Outline/Outline.tsx:138` is the row frame and its text, `:232`
  `densityStyles` and `:243` `indentStyles` read the depth as a variable.
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

The sixth window was told `ProgressBar`, `Outline`/`Thumbnail`,
`MetadataList`, `Timer`, `CodeBlock` in that order, and swapped the order after
reading the files: `ProgressBar` carries three keyframes and four maps whose
fill is decided by four stacked conditions at once, and its test scrapes the
map's own source text at `ProgressBar.test.tsx:1191-1215` — a window of its own,
recorded under Left with those line numbers. `Outline` and `Thumbnail` were left
after it for the same reason (Outline's two maps read the depth, Thumbnail's
remove slot shares the reveal seams). The two files it did convert:

- `refactor(timer): перевести стили таймера на Tailwind-классы`
- `refactor(metadata-list): перевести стили списка метаданных на Tailwind-классы`

`timerClassName`, the six `metadataList*` names and the six
`metadataListItem*` names are registered in `familyClassNames()` of
`Layout/tailwindStylesheet.source-build.test.mjs`. `MetadataList` replaced its
`dynamicStyles.gridTemplate` function with the class plus the private
`--_metadata-list-columns` variable. No test in either directory moved.

Verification after both commits: `node packages/core/scripts/build-css-tailwind.mjs`
writes 185.3 kB (was 184.6 kB), `pnpm exec vitest run packages/core/src/Timer
packages/core/src/MetadataList packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
packages/core/src/theme` is green (1941 passed, 1 skipped) with the ceiling
still `toBeLessThan(1380)` — the measured map is under it, so it did not move —
prettier and eslint are clean, and `pnpm -F @astryxdesign/core typecheck` passes.
`git merge poc/tailwind-layout-primitives` reports "Уже актуально": the window
started from the trunk merge `9dafa1906`, so the sheet test needed no conflict
resolution this time. Nothing is pushed.

## Comments

- Window 7: the Toast card and its row moved to `packages/core/src/Toast/toastClasses.ts`
  (`toastSurfaceClassName({isError, isEntering, isExiting})`, `toastInnerClassName`,
  `toastContentClassName`, `toastEndContentClassName`). `TOAST_EDGE_DRIFT` now names the
  token rather than its value; the reduced-motion arm lives in the class
  (`motion-reduce:duration-[0.01ms]`), so the exit cleanup still sees a `transitionend`.
  Assertions moved: `ToastViewport.test.tsx` "keeps real trailing controls…" reads
  `classesOf`, "uses tokenized transform…" reads the card's class set, and "keeps reduced
  motion transitions eventful…" reads `toastClasses.ts` plus the viewport source.
- `ToastViewport` itself is still on StyleX: its map covers positioning, safe-area padding,
  edge arms, the wrapper grid track and the exit arm, and about a dozen tests read those
  declarations through `getComputedStyle`. A window that takes it must rewrite those reads
  in the same commit, so the map's class vocabulary should be written alongside the
  component rather than before it.

- Window 8: `CodeBlock` paints with Tailwind classes
  (`CodeBlock/codeBlockClasses.ts`). The container's card and section frames,
  the header row in both divider states, the header button and its
  collapsible arm, the title, the controls column, the corner cluster in both
  heights, the collapse grid and its zero-row arm, the chevron and its
  rotation, the code element in both wrap states and its number gutter, the
  line chunk with its `content-visibility` floor, the line in every number and
  diff combination, every tint, the diff marker, the two size classes and the
  copy button are literals over the same tokens.
- Four property groups decided the shape of the module: the code element's
  `min-width`/`white-space` pair, the row's grid template, the row's tint and
  the marker's colour paint one declaration per state, so each is a function
  returning the whole class string — `codeBlockCodeClassName`,
  `codeBlockLineClassName`, `codeBlockLineTintClassName`,
  `codeBlockDiffMarkerClassName`. The tint function takes the highlight arm
  first because a caller's highlight replaces a diff tint rather than stacking
  on it.
- One named `stylex.create` exception, as the Left note asked:
  `CodeBlock/codeBlockViewportFocusRing.stylex.ts` keeps only the viewport's
  inset `outline-offset`. The viewport still calls
  `focusOutlineProps.focusVisible(codeBlockViewportFocusRingStyles.viewportFocusRingInset)`
  and joins its `.className` into the class string, so
  `CodeBlock.focusRing.test.tsx` and `__tests__/insetFocusRing.ts` read the same
  atoms as before. The header says why: the root clips its corners, and an
  unlayered StyleX rule outranks the `astryx-base` utility, which would lose to
  the ring's own `outline-offset: 0`.
- The chevron's frames are `@keyframes astryxChevronReveal` in
  `packages/core/tailwind/astryx.input.css`, and
  `codeBlockChevronClassName` names them with the medium duration and the
  standard curve plus `motion-reduce:animate-none`.
- The width prop is a class plus an inline `--_codeblock-width`, the digit
  count is `--_codeblock-gutter-width` (already documented), and the
  `content-visibility` floor is `--_codeblock-chunk-height`. All three are
  private and computed from props, so they are set as computed keys and the
  derived-var source scan does not see them — the same plumbing as
  `--_codeblock-gutter-width`, which `VARS_WITHOUT_DERIVED_MAPPING` exempts.
- No assertion moved: no suite in `CodeBlock/` reads a computed style or a
  StyleX debug name for these nodes. `CodeBlock.test.tsx`'s root-props test
  still reads the consumer `xstyle` class, which stays StyleX, and the RTL
  mirror test still reads `rtlStyles.mirror`, kept on the chevron wrapper.
- `mergeProps` takes four arguments; the root needs five values (theme props,
  the class string, `stylex.props(xstyle)`, the consumer class and the
  consumer style), so the root nests two calls. Passing five silently dropped
  the consumer class and the `xstyle` class, which the root-props test caught.
- The 30 class names are registered in `familyClassNames()` of
  `Layout/tailwindStylesheet.source-build.test.mjs`, walking the line, tint
  and marker combinations. The sheet measures 1609 rules with every family
  registered, so the ceiling stays `toBeLessThan(1620)` and the comment names
  the number and says CodeBlock reuses almost every code font, spacing and
  border utility its siblings spell.
- `.changeset/card-tailwind-classes.md` gained a `CodeBlock` paragraph and a
  `ProgressBar` one, which window 7's commits had left out.
- Two failures are outside this window and were not touched:
  `theme/derivedVarRegistry.test.ts` reports
  `--astryx-bottom-sheet-keyboard-inset` (`BottomSheet/BottomSheetPanel.tsx:1098`,
  another family) and `Markdown/Markdown.test.tsx` expects a `withCounter`
  class that the List conversion replaced with `[counter-increment:astryx-list]`.
