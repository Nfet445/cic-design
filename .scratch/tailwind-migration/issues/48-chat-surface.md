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
