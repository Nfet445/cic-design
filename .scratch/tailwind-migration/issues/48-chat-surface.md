# chat surface

Status: ready-for-agent
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
