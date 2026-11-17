# lab

Status: in-progress (window 1 done: sheet + ChatUnreadDivider)
Blocked by: 22,29
Wave: 8
Ticket: 30
Parent: `00-epic-stylex-to-tailwind-4`

## What

Migrate `packages/lab` (58 `stylex.create`, 283 `stylex.props`) in two halves: non-overlay components first, then the tour and emoji pickers that build on `Layer`.

## Files

- `packages/lab/src/**`
- `packages/lab/tailwind/ (new input)`
- `packages/lab/package.json`

## Done when

- `lab` ships its own sheet and its tests cover the class maps.
- The overlay-backed components reuse the wave 7 layer classes instead of new ones.

## Verification

- `pnpm -F @astryxdesign/lab build`
- `pnpm exec vitest run packages/lab/src`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.

## Result, window 1 (non-overlay half started)

Done:

- The sheet plumbing, in its own commit: `packages/lab/tailwind/lab.input.css`,
  `packages/lab/scripts/build-css-tailwind.mjs`,
  `packages/lab/tailwind/lab-tailwind.css.d.ts`, the
  `./lab-tailwind.css` export and the `build:css` chain in
  `packages/lab/package.json`, `packages/lab/src/tw.ts`, and
  `packages/lab/src/labTailwindStylesheet.source-build.test.mjs`. The shape is
  charts' and richtext's, not a new one.
- The gzip baseline in that test is lab's measured StyleX sheet: 12 514 B gzip
  (72.8 KB raw, 1 623 rules from 224 reachable files). The constant records the
  measurement, not a gate the sheet can reach; with one component migrated the
  Tailwind sheet is 1.6 KB raw.
- `ChatUnreadDivider` (`packages/lab/src/Chat/ChatUnreadDivider.tsx:47-80` →
  `Chat/chatUnreadDividerClasses.ts`). Its test asserts the class set:
  `astryx-chat-unread-divider` from `themeProps` then the map's tokens, and the
  rule and label children each equal their map string.

Deviations to review:

- No changeset: `pnpm check:repo` → `check-changesets` rejects a changeset for
  `@astryxdesign/lab` ("is private/ignored and cannot be released"), and
  ticket 29 shipped charts and richtext the same way. The ticket's "one
  changeset" line cannot apply to a canary-only package; a human decides whether
  the umbrella wants its own record instead.

- The component test asserts `className` tokens directly instead of importing
  `packages/core/src/__tests__/classNameAssertions.ts`: that file is outside
  lab's `rootDir` (`packages/lab/tsconfig.json` → `rootDir: ./src`), so the
  import fails `pnpm -F @astryxdesign/lab typecheck` with TS6059. The sheet test
  (`.mjs`, not typechecked) does use `describeTailwindStylesheet`.
- `pnpm -F @astryxdesign/lab typecheck` fails on this worktree for every lab
  file, not only the changed ones: `packages/core/dist` is not built, so
  `@astryxdesign/core`, `/utils`, `/theme/tokens.stylex` and `/hooks` have no
  declarations (TS2307, then TS2339 on `BaseProps`). Unchanged by this window.

Remaining in this half, smallest first (`stylex.create` at the given line, all
in `packages/lab/src`):

| component              | site                                                                                                                                                                                                                                                                        |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NavigationStack`      | `NavigationStack/NavigationStack.tsx:158`, `:368` (two maps, the second is dynamic)                                                                                                                                                                                         |
| `CommentParts`         | `Comments/CommentParts.tsx:110`, `:251` (second map is highlight rules)                                                                                                                                                                                                     |
| `DialogHeroHeader`     | `DialogHeroHeader/DialogHeroHeader.tsx:67`                                                                                                                                                                                                                                  |
| `ChatReasoning`        | `ChatReasoning/ChatReasoning.tsx:67`                                                                                                                                                                                                                                        |
| `ChatTypingIndicator`  | `Chat/ChatTypingIndicator.tsx:65` (keyframes: move the arm animation to `@keyframes astryxX` in the input CSS and spell its duration in the class)                                                                                                                          |
| `ChatReactionBar`      | `Chat/ChatReactionBar.tsx:103`                                                                                                                                                                                                                                              |
| `LogStream`            | `LogStream/LogStream.tsx:124` (carries raw colours at `:114-121`; use tokens while migrating)                                                                                                                                                                               |
| `CircleCheckIndicator` | `CircleCheckIndicator/CircleCheckIndicator.tsx:26` plus `CircleCheckIndicator/circleCheck.stylex.ts:45,59` (inset-shadow ring, forced-colors border, ancestor hover markers — `circleCheckMotionStyles`/`circleCheckSizeStyles` want a `*.stylex.ts` or attribute variants) |
| `LoadingMessage`       | `LoadingMessage.tsx:20`                                                                                                                                                                                                                                                     |
| `ChatVirtualizer`      | `Chat/ChatVirtualizer.tsx` (1 map, largest file)                                                                                                                                                                                                                            |

Then the remaining 40-odd carriers, and the overlay half (tour, emoji
pickers) after wave 7 lands.

## Result, window 2 (ListInput and TransferList)

Commits on `ticket/30-lab`, one per family:

- `2c35157bf` `refactor(list-input): перевести записи и сетку колонок на классы`
  — `ListInput/listInputClasses.ts` (new) + `[--astryx-list-input-columns]`
  inline variable for the field template.
- `de6510e71` `refactor(transfer-list): перевести панели и строки на классы`
  — `TransferList/transferListClasses.ts` (new, includes the selector's
  surface, fieldset and footer), `TransferList/transferListOverrides.stylex.ts`
  (three rules that must outrank a core utility: `Item`'s
  `pointer-events-none` on a disabled row, its `opacity-50` dim, and `Button`'s
  own label type scale and background image on the panel-header action).
- `399cf0cef` `Merge branch 'poc/tailwind-layout-primitives'` — no conflicts.

Both `stylex.create` maps are gone from `ListInput.tsx`,
`TransferList.tsx` and `TransferListSelector.tsx`. `lab.css` 72.8 → 68.6 KB;
`dist/lab-tailwind.css` 7.7 → 12.2 kB.
`labTailwindStylesheet.source-build.test.mjs` now lists the `listInput` and
`transferList` class maps, so the sheet is checked against every class they
emit.

Verified: `node scripts/build-css.mjs --package lab` (1504 StyleX rules from
229 reachable files), `node packages/lab/scripts/build-css-tailwind.mjs`,
`pnpm exec vitest run packages/lab/src/ListInput packages/lab/src/TransferList
packages/lab/src/labTailwindStylesheet` → 5 files, 86 tests pass; prettier
clean; `pnpm exec eslint packages/lab/src/TransferList` clean. Merge re-ran the
same build and suite.

Deviations to review:

- `TransferListSelector.tsx:255` keeps one dynamic `stylex.create` for the
  popup box (`content: (width) => …`). `ComplexSelector` exposes only
  `contentXstyle` (`packages/core/src/ComplexSelector/ComplexSelector.tsx:528`,
  applied at `:846`), so the popup's width has no class or inline-style seam.
  The map carries a header saying so. Adding `contentClassName`/`contentStyle`
  to core would let this go.
- `ListInput.test.tsx` and `TransferList.test.tsx` import `classesOf` from
  `../../../core/src/__tests__/classNameAssertions`, which is outside lab's
  `rootDir`; `pnpm -F @astryxdesign/lab typecheck` therefore reports TS6059 for
  those two lines on a worktree where `@astryxdesign/core` has declarations.
  Same trade-off as window 1's note, now on two files, so it is worth a decision
  (a lab-local copy of `classesOf`, or an exception in the lab tsconfig).
- `pnpm -F @astryxdesign/lab typecheck` still cannot answer here:
  `packages/core/dist` is not built on this worktree, so every lab file fails
  TS2307 before the changed files are reached.

## Remaining: `Schedule` is one map, not a family

`Schedule` keeps a single shared map. `Schedule/shared.tsx:770` exports
`styles` (about 60 rules) and five view files consume it — 158 references in
total:

| file                        | lines | references to the shared map or its own stylex |
| --------------------------- | ----- | ---------------------------------------------- |
| `Schedule/shared.tsx`       | 1717  | 67                                             |
| `Schedule/TimeGridView.tsx` | 1003  | 53                                             |
| `Schedule/MonthlyView.tsx`  | 744   | 39                                             |
| `Schedule/ListView.tsx`     | 240   | 12                                             |
| `Schedule/Schedule.tsx`     | 334   | 2                                              |
| `Schedule/WeeklyView.tsx`   | 134   | 0                                              |
| `Schedule/DayView.tsx`      | 117   | 0                                              |

Size is not the only reason it wants its own window:

- `Schedule/schedule.stylex.ts` defines the `timeGridViewportScope` marker, read
  with `stylex.when.siblingBefore(':focus-visible', …)`. The focus ring is drawn
  by an overlay reacting to a sibling's keyboard focus; a plain class cannot
  express "sibling before is focus-visible", so that rule stays in a
  `*.stylex.ts` with its reason, or moves to `:has()` on the container.
- The time grid positions events and the gutter at computed offsets, so several
  rules are per-instance values and need the class + `--astryx-*` variable
  shape rather than a static class.
- Vertical rhythm in `TimeGridView` is `calc()` over a row height variable;
  check each one against the `--spacing` scale before it becomes a utility.

Suggested split, smallest first: `Schedule.tsx` (2 references) → `ListView.tsx`
(12) → `MonthlyView.tsx` (39) → `TimeGridView.tsx` (53) → `shared.tsx` (67, the
map itself, last, since the views keep importing it until then).

## Result, window 3 (four more components)

Commits on `ticket/30-lab`, one per component:

- `d3dff72db` `refactor(loading-message): перевести колонку кольца и слов на классы`
  — `LoadingMessage` (`packages/lab/src/LoadingMessage.tsx`) →
  `loadingMessageClasses.ts`; one map, two rules (the ring column's
  `inline-flex flex-col items-center` and its `gap-2`).
- `6659e4d45` `refactor(chat-typing-indicator): перевести точки и подпись на классы`
  — `ChatTypingIndicator.tsx` → `Chat/chatTypingIndicatorClasses.ts`; the arm
  animation became `@keyframes astryxChatTypingIndicatorBounce` in
  `packages/lab/tailwind/lab.input.css`, the delays are
  `[animation-delay:160ms]` / `[animation-delay:320ms]` and the motion guard is
  `motion-reduce:animate-none`. The dots column width stays a per-instance
  `--astryx-chat-typing-indicator-dots-column-width` read by the class.
- `b6bd9b945` `refactor(chat-reasoning): перевести строку рассуждения на классы`
  — `ChatReasoning.tsx` → `ChatReasoning/chatReasoningClasses.ts`; shimmer is
  `@keyframes astryxChatReasoningShimmer`. The expanded/collapsed grid row, the
  chevron rotation, the streaming label and the selected count are state classes
  that _replace_ the base rather than stack on it.
- `448007476` `refactor(chat-reaction-bar): перевести пилюли и кнопку добавления на классы`
  — `Chat/ChatReactionBar.tsx` → `Chat/chatReactionBarClasses.ts`, same rule for
  the selected pill and the selected count.

The replacement rule is the load-bearing part of this window. Two classes that
set one property (`grid-rows-[0fr]` and `grid-rows-[1fr]`, `bg-muted` and
`bg-accent-muted`) are ordered by the sheet, not by the attribute, so a state
gets its own complete class and `tw()` picks one. A hover arm inside a
`@media (hover: hover)` guard is still an extra class, because the base sets no
hover value.

Verified after each commit: `node packages/lab/scripts/build-css-tailwind.mjs`
(`dist/lab-tailwind.css` 12.2 → 19.1 kB), `node scripts/build-css.mjs --package
lab` (1504 → 1370 StyleX rules from 233 reachable files, `lab.css` 68.6 → 65.5
KB), `pnpm exec vitest run` on the four component directories plus
`packages/lab/src/labTailwindStylesheet` → 5 files, 40 tests pass; prettier and
eslint clean on every touched file.

## Result, window 4 (DiffViewer and ChatEmojiPicker)

Commits on `ticket/30-lab`, one per component:

- `23aeb4b9a` `refactor(diff-viewer): перевести строки и подсветку на классы Tailwind`
  — `DiffViewer/DiffViewer.tsx` (2098 lines, the largest file left) →
  `DiffViewer/diffViewerClasses.ts`; its three maps (the table, the annotation
  cells, the per-instance sizes) became one class map. Four private variables
  carry the per-instance values the classes read:
  `--astryx-diff-viewer-pin-offset`, `--astryx-diff-viewer-column-width`,
  `--astryx-diff-viewer-split-rows`,
  `--astryx-diff-viewer-pane-columns`, each set inline next to the class that
  consumes it. `rtlStyles.mirror` became
  `[&:is([dir="rtl"]_*)]:[transform:scaleX(-1)]`. The focus ring stays on
  `focusOutlineProps` and joins the map class through `mergeProps`, so the ring
  is not dropped by a later `className`.

- `5d1bd89b6` `refactor(chat-emoji-picker): перевести панель, сетку и ячейки на классы Tailwind`
  — `Chat/ChatEmojiPicker.tsx` → `Chat/chatEmojiPickerClasses.ts`. The grid is
  `grid-cols-8` (it was `repeat(${GRID_COLUMNS}, 1fr)`), a cell is `size-8`, and
  the panel's computed `GRID_COLUMNS * 34 + 8` is the literal `w-[280px]`. The
  cell names no base background — the hover paint sits alone inside
  `[@media(hover:hover)]` — and its inset ring is
  `outline-offset-0 focus-visible:outline-offset-[-2px]`, the pair
  `TransferList` already ships.

What this file taught the rule: a same-property pair has to become one complete
class even when it reads like an override chain. The line-number column's base
colour, the marker column's base colour and `break-normal` all lost to a second
class in the built sheet — `text-[color:var(--color-syntax-punctuation)]` sorts
after `…-added-marker`, and `break-normal` sets `overflow-wrap: normal` back
over `[overflow-wrap:anywhere]`. So the gutter ships three complete colour
classes, the marker's colour moved onto the `+`/`-` glyph, and the wrapped
variants keep `whitespace-pre-wrap` plus `[overflow-wrap:anywhere]` only. A
throwaway test that builds the sheet and lists every class entry declaring one
property twice now reports only the benign pairs:
`transition-[transform]` lands before `duration-[…]`/`ease-[…]` (so the
explicit pair wins, as intended), and a pinned cell's background-image tint
sits beside the sticky class's background-color.

Verified: `node packages/core/scripts/build-css-tailwind.mjs`,
`node packages/lab/scripts/build-css-tailwind.mjs`
(`dist/lab-tailwind.css` 19.1 → 27.2 kB), prettier and eslint clean,
`pnpm exec vitest run packages/lab/src/DiffViewer
packages/lab/src/Chat packages/lab/src/labTailwindStylesheet.source-build.test.mjs`
→ 10 files, 106 tests pass, `pnpm exec tsc --noEmit -p packages/core` reports only the
pre-existing `BottomSheet/BottomSheetPanel.tsx:1046` `PropsObject` error.

The class map strings themselves are what the tests read: a space-separated
list is not one token, so a test needs every token, not `classList.contains` of
the whole entry.

The DiffViewer tests read the class map directly through a local `carries(elt,
mapClassName)` helper that checks every space-separated token, rather than
core's `classesOf`: they stay inside lab's `rootDir`, so `tsc -p packages/lab`
would not reach a TS6059 once `packages/core/dist` exists. Three tests are new:
the changed row and its changed words, the pinned line number's private
variable, and the complete class a wrapped or narrow-indicator variant needs.
A fourth pins that the shared focus ring survives next to the map class.

Deviations to review:

- `DiffViewer.doc.mjs` is unchanged. The new `--astryx-*` names are private
  plumbing between the component and its sheet, not a theming surface, and no
  lab doc records `theming.vars` yet; windows 2 and 3 left theirs undocumented
  the same way.
- No changeset: `@astryxdesign/lab` is private, and `check-changesets` rejects
  a changeset that names it.

Remaining `stylex.create` sites in `packages/lab/src`, per file (32 files, 43
maps), smallest first:

| maps | file                                            |
| ---- | ----------------------------------------------- |
| 1    | `Chat/ChatVirtualizer.tsx`                      |
| 1    | `CircleCheckIndicator/CircleCheckIndicator.tsx` |
| 1    | `CodeEditor/CodeEditor.tsx`                     |
| 1    | `Comments/CommentActions.tsx`                   |
| 1    | `Comments/CommentComposer.tsx`                  |
| 1    | `Comments/CommentMarkdown.tsx`                  |
| 1    | `Comments/CommentRow.tsx`                       |
| 1    | `Comments/Comments.tsx`                         |
| 1    | `DialogHeroHeader/DialogHeroHeader.tsx`         |
| 1    | `EmojiPicker/EmojiPicker.tsx`                   |
| 1    | `LineClamp/LineClamp.tsx`                       |
| 1    | `LogStream/LogStream.tsx`                       |
| 1    | `PageControl/PageControl.tsx`                   |
| 1    | `Radial/RadialChart.tsx`                        |
| 1    | `SVGIcon/SVGIcon.tsx`                           |
| 1    | `SVGIcon/WeightedSVGIcon.tsx`                   |
| 1    | `SVGIcon/colors.stylex.ts`                      |
| 1    | `Schedule/shared.tsx`                           |
| 1    | `SelectableCardGroup/SelectableCardGroup.tsx`   |
| 1    | `TabBar/TabBar.tsx`                             |
| 1    | `Tour/TourStep.tsx`                             |
| 1    | `TransferList/TransferListSelector.tsx`         |
| 2    | `CircleCheckIndicator/circleCheck.stylex.ts`    |
| 2    | `CommentPin/CommentPin.tsx`                     |
| 2    | `Comments/CommentParts.tsx`                     |
| 2    | `NavigationStack/NavigationStack.tsx`           |
| 2    | `SVGIcon/variations.stylex.ts`                  |
| 2    | `SVGIcon/weighted.stylex.ts`                    |
| 2    | `internal/useScrollEdgeEffect.ts`               |
| 3    | `CircularProgress/CircularProgress.tsx`         |
| 3    | `Stat/Stat.tsx`                                 |
| 3    | `TransferList/transferListOverrides.stylex.ts`  |

The five `*.stylex.ts` files and `useScrollEdgeEffect.ts` are the ones that
keeping StyleX is the current answer for: they carry markers, ancestor/sibling
conditions or a rule that must outrank a core utility, and they keep a header
saying so.

Deviations to review:

- `packages/lab/src/LoadingMessage.test.tsx` is new: `LoadingMessage` had no
  test, and the map it now uses needed one.
- Every component test imports `classesOf` from
  `../../../core/src/__tests__/classNameAssertions`, outside lab's `rootDir`.
  The window 2 note stands and now covers four more files.
- `pnpm -F @astryxdesign/lab typecheck` still cannot answer here:
  `packages/core/dist` is absent on this worktree, so every lab file fails
  TS2307 before the changed files are reached.
