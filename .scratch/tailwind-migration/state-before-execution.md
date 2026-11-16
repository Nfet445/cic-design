# State before execution

Snapshot taken before ticket 01 starts, so the run can be read against a fixed
point.

## Where the work stands

- Branch (integration): `poc/tailwind-layout-primitives`.
- Head: `afaffdf81 docs(spec): собрать миграцию под зонтичный тикет`.
- Pull request: https://github.com/Nfet445/cic-design/pull/1, draft, open.
- Working tree clean; `dist/` artifacts are generated, not tracked.

## What is already migrated

- Wave 1 - `family:layout-primitives`: `Stack`, `StackItem`, `Grid`, `GridSpan`,
  `Center`, and the padding vocabulary in `Layout/paddingClasses.ts`.
- Wave 2 - `family:buttons`: `Button`, `ButtonGroup`, `ToggleButton`,
  `ToggleButtonGroup`. `IconButton` needed no change.
- Both waves live in commits `def0ea516`, `d53d6bd09`, `ad792fd06`,
  `f54b6b097`, `f35022021`.

## Numbers that later tickets are measured against

- Tailwind sheet, `packages/core/dist/astryx-tailwind.css`: 25 273 B, 4 052 B
  gzip, 251 selector rules.
- StyleX sheet, `packages/core/dist/astryx.css`: 282.1 KB, 8 871 rules from
  1 734 reachable files.
- StyleX baseline for the gzip gate, measured at `f35022021`: every package
  keeps its sheet within `1.15 ×` that baseline. Family-level baselines already
  recorded: layout primitives 9 087 B / 1 662 B gzip / 77 rules; buttons
  13 926 B / 2 767 B gzip / 125 rules.
- StyleX volume left in `packages/core/src`: 611 `stylex.create`, 1 190
  `stylex.props`, 258 files mentioning `xstyle`, 64 `*.stylex.ts`.
- Outside core: `lab` 58 creations, `richtext` 12, `charts` 5, `vega` 0,
  `native` 0.

## Known red on main, not caused by this work

Fourteen tests in `packages/core/src` fail on `main` too, from ICU and Temporal
behaviour on Node 26: `Calendar/Calendar.calendarSystems.test.tsx`,
`PowerSearch/PowerSearch.calendarSystems.test.tsx`,
`Timestamp/Timestamp.test.tsx` (5), `postinstall.test.mjs`,
`utils/calendarDateParser.roundtrip.test.ts` (2), `utils/calendarSystem.test.ts`
(3), `utils/plainDate.test.ts`. A wave must not change that count.

## How this run is executed

- One ticket, one worktree, one branch, one implementer subagent, one commit on
  the integration branch after the ticket's work merges.
- Worktrees live under `/tmp/tailwind-4-tickets/wt-<NN>`, branches
  `ticket/<NN>-<slug>`, both cut from the integration branch tip when the ticket
  starts.
- A ticket's own rules, gates and done criteria are in
  `issues/<NN>-<slug>.md` and `README.md`; this file does not repeat them.
- The epic's checklist is updated after each merge, in the same commit as the
  merge's bookkeeping.
