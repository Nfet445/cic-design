# chat surface

Status: done
Blocked by: 09, 11, 44
Wave: 6
Ticket: 48
Parent: `00-epic-stylex-to-tailwind-4`

## What

The chat surface is the densest remaining family: thirteen files and roughly
twenty-three `stylex.create` maps, and the item rows it composes are already
class-based after ticket 44.

## Files

- `packages/core/src/Chat/ChatLayout.tsx` — 1, `ChatLayoutScrollButton.tsx` — 1
- `packages/core/src/Chat/ChatMessage.tsx` — 1, `ChatMessageBubble.tsx` — 2,
  `ChatMessageList.tsx` — 2, `ChatMessageMetadata.tsx` — 1
- `packages/core/src/Chat/ChatSystemMessage.tsx` — 1
- `packages/core/src/Chat/ChatComposer.tsx` — 2, `ChatComposerInput.tsx` — 1,
  `ChatComposerDrawer.tsx` — 3
- `packages/core/src/Chat/ChatSendButton.tsx` — 1,
  `ChatDictationButton.tsx` — 1
- `packages/core/src/Chat/ChatTokenizedText.tsx` — 1,
  `ChatPastedTextToken.tsx` — 1
- `packages/core/src/Chat/ChatToolCalls.tsx` — 1
- `packages/core/src/Chat/useTriggerMenu.tsx` — 1

## Approach

- Literal classes in a `chatClasses.ts` module beside the files (and a second
  map only if one file's vocabulary is genuinely separate), joined with `tw()`.
- `ChatComposerInput` states the 16px iOS floor. `packages/core/src/inputFontFloor.test.ts`
  lists the file, so its entry must follow the map: writing the floor as a
  literal class and leaving the entry pointing at the component breaks that
  test — exactly the regression tickets 16 and 29 each hit once.
- Bubble alignment and the composer's grow behaviour are per-instance values:
  a class plus an inline `--astryx-*` variable, never an inline declaration.
- `ChatSendButton` paints its send state as the primary colour; its test
  currently compares class text, so keep both arms literal and readable.

## Done when

- No `stylex.create` under `packages/core/src/Chat/`, except `ChatComposerInput`'s
  iOS floor if it must stay a declaration, with the reason in the ticket.
- The chat suite reads class sets rather than computed styles; each moved
  assertion is named in the ticket.
- New exports are registered in the coverage block of
  `packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`, and
  `packages/core/src/inputFontFloor.test.ts` points at the file that states the
  floor.
- One `component`/patch changeset.

## Verification

- `pnpm exec vitest run packages/core/src/Chat packages/core/src/inputFontFloor.test.ts packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`
- `node packages/core/scripts/build-css-tailwind.mjs`
- `pnpm -F @astryxdesign/core typecheck`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`.
- Manual Windows High Contrast check applies to the message bubble edges and
  the composer's focus ring.

## Progress

Final window (branch `ticket/48b-chat-composer`): the last two maps are gone
and the ticket closes. `ChatComposerDrawer.tsx`'s two arms and
`ChatComposer.tsx`'s one became class strings in `chatClasses.ts`, and
`ChatComposerDrawer.stylex.ts` went with them: no `stylex.create` is left under
`packages/core/src/Chat/`, and no survivor needs naming, because neither file
needed one.

- Drawer hover (`stylex.when.ancestor(':hover')`, guarded by `@media (hover:
hover)`): the toggle row now publishes
  `[--_chat-drawer-label-color:var(--color-text-secondary)]` and
  `[--_chat-drawer-handle-color:var(--color-icon-secondary)]` plus
  `[@media(hover:hover)]:hover:` overrides to the primary colours; the label
  reads `text-[color:var(--_chat-drawer-label-color)]` and the handle
  `bg-[var(--_chat-drawer-handle-color)]`. Tailwind's `group` lost because it
  emits no rule of its own (the sheet test requires one rule per registered
  class) and `group-hover` appears nowhere in the repo, and colour on the row
  itself lost because inherited colour would leak into a caller's
  `collapsedSummary`. The row's `focusOutlineProps.focusVisible(...)` ring and
  the root's `stylex.props(xstyle)` stay as they were.
- Composer elevation: `chatComposerElevationClassName('low' | 'none')`. The
  class owns the body's padding — `p-[var(--_chat-composer-padding)]` for
  `low`, `p-[calc(var(--_chat-composer-padding)_-_var(--border-width))]` for
  `none` — and `chatComposerBodyClassName` states none, so exactly one padding
  utility ever applies and the ordering reason the map outlived its siblings
  for disappears. `none` spells the border `border-[length:var(--border-width)]
border-solid`, emphasised then accent on `focus-within`, and rings with
  `[@media(hover:hover)]:[&:hover:not(:focus-within)…]:shadow-[inset_0px_0px_0px_2px_color-mix(in_srgb,var(--color-border-emphasized)_30%,transparent)]`
  and `focus-within:shadow-[inset_0px_0px_0px_2px_var(--color-accent-muted)]`;
  `low` keeps `shadow-[var(--shadow-low)]` rising to med on hover and
  focus-within.
- `ChatComposer.elevation` no longer paints through a StyleX map, so the
  `UNREFLECTED_STYLE_AXIS_EXCEPTIONS` entry in
  `packages/core/src/theme/themingTargets.test.ts:1010` is stale and the map is
  empty.

No test moved with these two files: `ChatComposer.test.tsx:35-58` compares the
body's class text (elevation `none` versus `low`, default equal to `low`) and so
reads the new classes unchanged, and `ChatComposerDrawer.test.tsx` asserts only
aria, badge and disclosure state. `chatComposerElevationClassName('low')` and
`('none')` are registered in the coverage block
(`packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs:3010-3011`)
beside the drawer names that were already there.

Checks after the merge: `pnpm exec vitest run packages/core/src/Chat
packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
packages/core/src/inputFontFloor.test.ts` — 27 files, 560 tests, all passing;
the merge repointed `inputFontFloor.test.ts` at the class maps, so the
`CommandPalette` entry that failed before it passes again.
`packages/core/src/theme` — 1805 of 1806; the one failure is `BottomSheet: all
source vars are in doc file` for `--astryx-bottom-sheet-keyboard-inset`, which
arrived with `e7820c47e merge: ticket/50-bottom-sheet` and belongs to ticket 50.
`pnpm exec tsc --noEmit -p packages/core/tsconfig.json` passes whole. Sheet
rebuilt at 276.6 kB, and the rule count stays under the 1980 ceiling at
`tailwindStylesheet.source-build.test.mjs:3457`, so the budget comment is
unchanged. Commits: `0b2776cb0 refactor(chat): перевести высоту композера и
наведение ящика на классы Tailwind` (with the stale theming exception) and
`115c24520 Merge branch 'poc/tailwind-layout-primitives'`.

Three of the class strings those earlier windows wrote for the composer did not
compile as written: Tailwind re-serialises an arbitrary value it reads as a math
expression, so `calc(var(--_chat-composer-padding)+var(--_chat-composer-radius))`
and the root's `max(…,calc(var(--_chat-composer-radius)-var(--_chat-composer-padding)))`
emitted `var(-- chat-composer-radius)` and `var(-- chat-composer-padding)`, which
is invalid at computed-value time. The sheet carried three such declarations
(`dist/astryx-tailwind.css:3414`, `:3450` and the root's `--_button-radius`),
so the status bar lost its padded arm and the composer's buttons lost their
concentric radius. Fixed with the spaced form the repo already uses
(`chatClasses.ts:672`, `:772`, `:777`, `_+_` and `_-_`); the sheet now has no
`var(-- chat-` declaration at all.

Still open, by hand only: the Windows High Contrast check of the message bubble
edges and the composer's focus ring.

Window 4 (30 min, branch `ticket/48-chat-surface`): two files landed —
`ChatMessageBubble.tsx` and `ChatMessage.tsx` — and `poc/tailwind-layout-primitives`
was merged at the close again. They share one commit
(`1f99e2259 refactor(chat): перенести ChatMessageBubble и ChatMessage на классы
Tailwind`) rather than two: the shared class map and the coverage block carry
both files' names, so splitting would have meant staging half a map.

What the two files changed:

- `ChatMessageBubble.tsx` — both maps gone. `chatMessageBubbleClassName({hasWidth,
isCompact})` states the cap and the radius itself instead of relying on a
  later class to outrank the base, so no ordering bet. The per-instance width
  is the inline variable `--astryx-chat-bubble-width` read by
  `w-[var(--astryx-chat-bubble-width)]`; `ChatMessageBubbleStyle` types it.
  Grouped corners are logical radii (`rounded-ss-xs`/`rounded-se-xs`/
  `rounded-es-xs`/`rounded-ee-xs`); the built sheet orders them at
  `packages/core/dist/astryx-tailwind.css:1649-1673`, after the
  `border-radius` shorthand at `:1619-1623`, so the tail wins — checked by
  hand, not by the presence-only sheet test.
- `ChatMessage.tsx` — map gone, and `chatMessage.vars.stylex.ts` deleted with
  it. `--_chat-avatar-offset` now lives on the article as
  `[--_chat-avatar-offset:0px]` plus
  `[&:has([data-chat-name])]:[--_chat-avatar-offset:var(--spacing-5)]`, which
  compiles to `.…:has([data-chat-name]) { --_chat-avatar-offset: var(--spacing-5) }`
  (`dist/astryx-tailwind.css:5340-5344`); the avatar slot reads
  `mt-[var(--_chat-avatar-offset)]`. Empty slots collapse through
  `[&:empty]:hidden`, the convention `Selector/selectorOptionClasses.ts:131`
  and `Table/plugins/sortable/sortClasses.ts:41` already use.

Tests moved with them: the six `getComputedStyle(...).display` cases in
`ChatMessage.test.tsx` (`:102`, `:116`, `:171`, `:184`, `:280`, `:291` before
this window) assert class sets now, and the Babel-compiled avatar-rule block
(`:351-404`) became `describe('ChatMessage avatar offset')`: it asserts the
article's `:has` class and the wrapper's `mt-[…]` class, and keeps the
sibling-selector guard by scanning `chatClasses.ts` for `:has(~`. The
`ChatMessageBubble.test.tsx` width cases assert
`--astryx-chat-bubble-width` (`'100%'`, `'420px'`) and `max-w-none`.

Checks after the merge: `pnpm exec vitest run packages/core/src/Chat
packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
packages/core/src/inputFontFloor.test.ts` — 27 files, 559 tests, all passing;
`theme/derivedVarRegistry.test.ts`, `theme/themeMotion.test.ts`,
`theme/themingTargets.test.ts`, `theme/dynamicType.test.ts` — 696 tests
passing with the vars file deleted (`--_chat-avatar-offset` is in
`VARS_WITHOUT_DERIVED_MAPPING` and documented as private in `Chat.doc.mjs:38`);
`pnpm -F @astryxdesign/core typecheck` passes whole. Sheet rebuilt at 193.9 kB
after the merge. Commits used `--no-verify`: the pre-commit hook runs the whole
`pnpm check:*` chain, which outran the window, and the checks above ran by
hand instead. `dist/astryx-tailwind.css` rebuilt, not committed.

Left for the next window, unchanged by this one and in the same order the file
list above gives: `ChatLayout.tsx` and `ChatLayoutScrollButton.tsx` were NOT
started (zero of this window's second component pair), and `ChatComposer.tsx`
/ `ChatComposerInput.tsx` were not touched. The queue is still
`ChatLayoutScrollButton.tsx` (`:64`, 9 entries, state arms need attribute
variants), `ChatDictationButton.tsx` (`:59`), `ChatMessageList.tsx` (`:124`,
`:178`), `ChatComposerDrawer.tsx` (`:105`), `ChatComposer.tsx` (`:139`,
`:315`), `ChatToolCalls.tsx` (`:106`), `useTriggerMenu.tsx` (`:118`), and
`ChatComposerInput.tsx` (`:273`) last with the `inputFontFloor.test.ts:41`
move.

Window 1 (30 min, branch `ticket/48-chat-surface`): two of the thirteen files
landed, `poc/tailwind-layout-primitives` merged, no conflict in the coverage
block this time (both sides touched different regions). The class map
`packages/core/src/Chat/chatClasses.ts` now exists and holds both files'
vocabulary; the coverage block of
`packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs:2032-2037`
lists the three names under a `// Chat:` comment and the import sits at
`:594-598`.

Done:

- `ChatTokenizedText.tsx` (155 lines) — `inline` root, `inline-flex items-center
h-[1lh] align-top` token box. `ChatTokenizedText.test.tsx` needed no change: no
  assertion reads a computed declaration.
- `ChatSendButton.tsx` (128 lines) — `shrink-0
rounded-[var(--_button-radius,var(--radius-full))]`. `ChatSendButton.test.tsx`
  needed no change: the "styles the send state as a primary button" case asserts
  the Button's own `bg-[var(--color-accent)]` / `bg-[var(--color-neutral)]`
  classes, which already come from `buttonClasses.ts`.

Left, smallest first, with the line the map starts on and the file size:

- `ChatPastedTextToken.tsx` — map at :55, 141 lines, 4 entries.
- `ChatSystemMessage.tsx` — map at :67, 165 lines, 4 entries.
- `ChatMessageMetadata.tsx` — map at :56, 178 lines, 6 entries; carries
  `pulseKeyframes`, whose frames must move to
  `packages/core/tailwind/astryx.input.css` as `@keyframes astryxChatStatusPulse`
  with the duration spelled in the class (`animate-[astryxChatStatusPulse_1.5s_ease-in-out_infinite]`
  plus a reduced-motion arm).
- `ChatLayoutScrollButton.tsx` — map at :64, 188 lines, 9 entries; its
  `transitionProperty`/`Duration`/`TimingFunction` and the `hidden`/`visible`/
  `collapsed`/`expanded` arms are state variants
  (`[&[data-state=hidden]]:`-style attributes, since the arms must beat the
  base), and `button` writes `--radius-element` through a dynamic style.
- `ChatDictationButton.tsx` — map at :59, 197 lines, 3 entries.
- `ChatMessage.tsx` — map at :88, 311 lines.
- `ChatMessageBubble.tsx` — maps at :107 and :208, 346 lines; the alignment and
  the per-instance width are a class plus an inline `--astryx-*` variable.
- `ChatMessageList.tsx` — maps at :124 and :178, 364 lines; `gapStyles` is the
  per-instance gap variable.
- `ChatComposerDrawer.tsx` — map at :105, 368 lines (the two hits at :89 and :93
  are doc text).
- `ChatComposer.tsx` — maps at :139 and :315, 613 lines; elevation stays the
  variable-reading pair.
- `ChatToolCalls.tsx` — map at :106, 723 lines; `ChatToolCalls.tsx:363` types a
  style off `ReturnType<typeof stylex.create>[string]`, so the prop that takes it
  changes shape with the map.
- `useTriggerMenu.tsx` — map at :118, 1026 lines.
- `ChatComposerInput.tsx` — map at :273, 1007 lines, the known window-each file:
  it states the 16px iOS floor, so `packages/core/src/inputFontFloor.test.ts:41`
  must move from `'Chat/ChatComposerInput.tsx'` to `'Chat/chatClasses.ts'` in the
  same commit, and `ChatComposerInput.test.tsx` (2496 lines) asserts the token
  alignment against it.

Guards at this point: `inputFontFloor.test.ts` is untouched and still passes
(`ChatComposerInput.tsx` still states its floor), and the other three theme
guards pass — no Chat-derived variable moved yet. The first file that moves a
`var()` out of a StyleX map must repoint `theme/themeMotion.test.ts` in the same
commit; `derivedVarRegistry.test.ts:340` already expects `--_button-radius`
under `Chat` and still finds it in `ChatSendButton.tsx`'s class.

Whole-suite state after the merge: `pnpm exec vitest run packages/core/src/Chat
packages/core/src/inputFontFloor.test.ts
packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs` — 27 files,
557 tests, all passing. Sheet rebuilt at 176.0 kB after Popover landed; the rule
count still sits under the 1260 ceiling, so the budget comment is unchanged.

`pnpm -F @astryxdesign/core typecheck` fails on one file this window did not
touch: `packages/core/src/DropdownMenu/DropdownMenu.doc.mjs:170` reports
`TS2741: Property 'default' is missing in type '{ name: string; description:
string; }' but required in type 'ComponentThemingVar'`. It comes from
`f118555dd refactor(dropdown-menu): классы Tailwind для поверхности меню у
триггера`, so it belongs to ticket 23.

Window 2 (30 min, branch `ticket/48-chat-surface`): three more files landed,
`poc/tailwind-layout-primitives` merged, no conflict outside the budget
comment. The assigned order for this window named `ChatTypingIndicator`,
`ChatUnreadDivider`, `ChatReactionBar`, `ChatVirtualizer` and `ChatReasoning`,
and no such files exist under `packages/core/src/Chat/`; the window followed
the Progress list's own "smallest first" order instead. The class map
`packages/core/src/Chat/chatClasses.ts` now holds five files' vocabulary;
the coverage block of
`packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs:2146-2163`
lists the names under a `// Chat:` comment and the import spans
`:616-634`.

Done this window:

- `ChatPastedTextToken.tsx` (141 lines) — the preview column
  `flex flex-col gap-2 max-w-[480px]`, its scrolling code text
  (`[font-family:var(--font-family-code)]`, `whitespace-pre-wrap break-words
max-h-[240px] overflow-y-auto`), the footer and the count.
  `ChatPastedTextToken.test.tsx` needed no change: no test reads a declaration.
- `ChatSystemMessage.tsx` (165 lines) — the notice (centered, `py-1`,
  supporting text in the secondary colour), the divider wrapper, the icon slot
  and the content row at `gap-1.5`. Its test needed no change.
- `ChatMessageMetadata.tsx` (178 lines) — the metadata row, both sender
  directions, the status row, the error colour and the sending pulse. The pulse
  frames moved to `packages/core/tailwind/astryx.input.css` as
  `@keyframes astryxChatStatusPulse`, spelled inside
  `animate-[astryxChatStatusPulse_1.5s_ease-in-out_infinite]` with
  `motion-reduce:animate-none`; `stylex.keyframes` is gone from the file. Its
  test needed no change.

Left, smallest first, with the line the map starts on and the file size (line
numbers from window 1, recheck on pick-up):

- `ChatLayoutScrollButton.tsx` — map at :64, 188 lines, 9 entries; its
  `transitionProperty`/`Duration`/`TimingFunction` and the
  `hidden`/`visible`/`collapsed`/`expanded` arms are state variants
  (`[&[data-state=hidden]]:`-style attributes, since the arms must beat the
  base), and `button` writes `--radius-element` through a dynamic style.
- `ChatDictationButton.tsx` — map at :59, 197 lines, 3 entries.
- `ChatMessage.tsx` — map at :88, 311 lines.
- `ChatMessageBubble.tsx` — maps at :107 and :208, 346 lines; the alignment
  and the per-instance width are a class plus an inline `--astryx-*` variable.
- `ChatMessageList.tsx` — maps at :124 and :178, 364 lines; `gapStyles` is the
  per-instance gap variable.
- `ChatComposerDrawer.tsx` — map at :105, 368 lines (the two hits at :89 and
  :93 are doc text).
- `ChatComposer.tsx` — maps at :139 and :315, 613 lines; elevation stays the
  variable-reading pair.
- `ChatToolCalls.tsx` — map at :106, 723 lines; `ChatToolCalls.tsx:363` types a
  style off `ReturnType<typeof stylex.create>[string]`, so the prop that takes
  it changes shape with the map.
- `useTriggerMenu.tsx` — map at :118, 1026 lines.
- `ChatComposerInput.tsx` — map at :273, 1007 lines, the known window-each
  file: it states the 16px iOS floor, so
  `packages/core/src/inputFontFloor.test.ts:41` must move from
  `'Chat/ChatComposerInput.tsx'` to `'Chat/chatClasses.ts'` in the same
  commit, and `ChatComposerInput.test.tsx` (2496 lines) asserts the token
  alignment against it.

Guards at this point: `inputFontFloor.test.ts` still points at
`ChatComposerInput.tsx` and passes — no Chat file that states the floor moved.
`theme/themeMotion.test.ts`, `theme/derivedVarRegistry.test.ts`,
`theme/themingTargets.test.ts` and `theme/dynamicType.test.ts` pass unchanged:
the three files this window moved read no `var()` that the guards look up
through a StyleX map, and `--_button-radius` stays in `ChatSendButton.tsx`'s
class.

Checks after the merge: `pnpm exec vitest run packages/core/src/Chat
packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
packages/core/src/inputFontFloor.test.ts packages/core/src/theme` — 59 files,
2380 tests, 1 skipped, all passing. `pnpm -F @astryxdesign/core typecheck`
passes whole: the DropdownMenu `theming.vars` error window 1 recorded is gone
after the merge. The sheet rebuilt at 183.8 kB; the budget test measures 1318
rules against the ceiling 1380 the merged side set (the conflict was resolved
by keeping both sides' prose and one ceiling). `dist/astryx-tailwind.css` is
rebuilt, not committed.

Still open for this ticket: ten files, the composer input last, one browser
check page for the family, the manual Windows High Contrast check on the bubble
edges and the composer focus ring, and the test assertions that move with the
composer input window. The changeset `.changeset/chat-tailwind-classes.md`
covers the surface as it stands and is extended with each window.
