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

## Left

`Card`, `Divider`, `Banner`, `Badge`, `Code`, `Blockquote` and `StatusDot` are
done. The rest of the ticket's files still carry their `stylex.create` maps:

- `CodeBlock` (3), `Spinner` (4) plus `Spinner/spinnerRotor.ts` (1),
  `ProgressBar` (4), `Skeleton` (3), `EmptyState` (1), `Outline` (3),
  `AspectRatio` (2), `Thumbnail` (1), `MetadataList`/`MetadataListItem` (3),
  `Timer` (1), `Timestamp`/`TimestampHoverCard` (3), `Toast`/`ToastViewport` (2),
  `Carousel` (3), `Markdown` (5) plus `Markdown/plugins/HeadingLinksRenderer.tsx`
  (2).
- Two keyframes are still inside `.ts` files and must move to
  `packages/core/tailwind/astryx.input.css` before their component converts:
  `Spinner/spinnerRotor.ts` (`rotation`, 100 turns per iteration, so
  `@keyframes astryxSpinnerRotor`) and `Skeleton.tsx` (`skeletonFade`, the ten
  stepped holds that climb 0.25 → 0.925 and alternate). `StatusDot` is the
  worked example: `@keyframes astryxStatusDotPulse` in the input sheet, the
  class `animate-[astryxStatusDotPulse_2s_ease-in-out_infinite]` plus
  `motion-reduce:animate-none`. `animate-[…]` is one class string, so the
  rotor's duration, which reads
  `--_astryx-pre-tempo-duration-slow-min` times 100, will need care: it is a
  `calc()` over a token, so the arbitrary value has to be spelled out in the
  class (an interpolated value would emit nothing).
- `Skeleton`'s tests are the heaviest in this ticket. `pulse` reads
  `declarationsOf` over `getAllInjectedCss()` and parses the keyframes out of
  that sheet to check the ten opacity steps, the `linear` timing and the
  absence of `steps()`; all of it has to be rewritten against the built
  stylesheet (`stylesheetOf`/`buildAstryxTailwindCss`, as
  `Layout/tailwindStylesheet.source-build.test.mjs` does) or the class set.
  Its forced-colors read has to move to classes, as Banner's and Badge's did.
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
- The manual Windows High Contrast check for Card, Divider, Banner, Badge and
  StatusDot is not done. All five carry their boundary as a `forced-colors:`
  outline class and their tests assert the class rather than the compiled
  rule, so the manual check is the only place the boundary is seen. Divider
  draws a border-width line, so it is in the same list.
- The family browser check page does not exist yet.

## Result

`Card`, `Divider`, `Banner`, `Badge`, `Code`, `Blockquote` and `StatusDot` are
converted, verified and committed, one commit each:

- `refactor(card): перевести стили карточки на Tailwind-классы`
- `refactor(divider): перевести стили разделителя на Tailwind-классы`
- `refactor(banner): перевести стили баннера на Tailwind-классы`
- `refactor(badge): перевести стили бейджа на Tailwind-классы`
- `refactor(code): перевести стили встроенного кода на Tailwind-классы`
- `refactor(blockquote): перевести стили цитаты на Tailwind-классы`
- `refactor(status-dot): перевести стили точки статуса на Tailwind-классы`

This window ran out after `StatusDot`; the rest is listed under Left. The
changeset `.changeset/card-tailwind-classes.md` covers all seven components.

The merge of `poc/tailwind-layout-primitives` conflicted once, in the sheet
test's ceiling. Both sides were kept: the branch's sub-menu paragraph and its
13 rules, and this ticket's four new maps and their ~45. The merged build
measures 1169 rules, so the comment names that number and the ceiling is
`toBeLessThan(1180)`. `node --check` passes on the test file.

After the merge `node packages/core/scripts/build-css-tailwind.mjs` plus
`pnpm exec vitest run packages/core/src/Badge packages/core/src/Code
packages/core/src/CodeBlock packages/core/src/Blockquote
packages/core/src/Spinner packages/core/src/ProgressBar packages/core/src/Skeleton
packages/core/src/StatusDot
packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs` is green
(431 tests). A wider run over the converted family plus the branch's menus
(`Card`, `Divider`, `Banner`, `DropdownMenu`) is also green (791 tests).
Nothing is pushed.
