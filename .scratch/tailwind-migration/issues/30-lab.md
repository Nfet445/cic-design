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
