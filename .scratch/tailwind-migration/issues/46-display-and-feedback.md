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

## Left

`Card`, `Divider` and `Banner` are done. The rest of the ticket's files still
carry their `stylex.create` maps:

- `Badge` (2), `Code` (3), `CodeBlock` (3), `Blockquote` (1), `Spinner` (4) plus
  `Spinner/spinnerRotor.ts` (1), `ProgressBar` (4), `Skeleton` (3),
  `StatusDot` (2), `EmptyState` (1), `Outline` (3), `AspectRatio` (2),
  `Thumbnail` (1), `MetadataList`/`MetadataListItem` (3), `Timer` (1),
  `Timestamp`/`TimestampHoverCard` (3), `Toast`/`ToastViewport` (2),
  `Carousel` (3), `Markdown` (5) plus `Markdown/plugins/HeadingLinksRenderer.tsx`
  (2).
- `spinnerRotor.ts` is the first keyframe: `@keyframes astryxSpinnerRotor` goes
  into `packages/core/tailwind/astryx.input.css`, and the rotor class names it.
- Card's remaining test `getComputedStyle` read is the consumer-`xstyle` one
  named above.
- The manual Windows High Contrast check for Card, Divider and Banner is not
  done. Banner now carries its boundary as a `forced-colors:` outline class on
  the header, and its test asserts the class rather than the compiled rule, so
  the manual check is the only place the boundary is seen. Divider draws a
  border-width line, so it is in the same list.
- The family browser check page does not exist yet.
- The next window should start with `Badge` (2 maps), then `Code`,
  `CodeBlock`, `Blockquote`, `Spinner` (plus the first keyframe,
  `@keyframes astryxSpinnerRotor`), `ProgressBar`, `Skeleton` and `StatusDot`.
  `Banner` showed the shape a status-driven map takes: one class per status
  holding the fill and its forced-colors outline, and a second map for the
  variable a built-in control rewrites.

## Result

`Card`, `Divider` and `Banner` are converted, verified and committed, one
commit each:

- `refactor(card): перевести стили карточки на Tailwind-классы`
- `refactor(divider): перевести стили разделителя на Tailwind-классы`
- `refactor(banner): перевести стили баннера на Tailwind-классы`

The window ran out after `Banner`; the rest is listed under Left. The changeset
`.changeset/card-tailwind-classes.md` covers all three components.

The merge of `poc/tailwind-layout-primitives` auto-merged the sheet test with
both sides intact (this ticket's Card, Divider and Banner registrations and the
branch's `DropdownMenu` menu-leaf registrations), `node --check` passes, and
after the merge `node packages/core/scripts/build-css-tailwind.mjs` plus
`pnpm exec vitest run packages/core/src/Divider packages/core/src/Banner
packages/core/src/Card packages/core/src/DropdownMenu
packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs` is green
(560 tests). `pnpm check:repo` exits 0. Nothing is pushed.
