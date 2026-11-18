# Tests that only pass inside the full suite

Status: done
Wave: 9
Owner: unassigned

## Problem

`packages/core/src/Typeahead/BaseTypeahead.test.tsx` fails when the file runs alone
and passes inside a full `pnpm exec vitest run packages/core/src`.

Failing case: `BaseTypeahead > committed values change > does not reload or move the
highlight when only the source is rebuilt`
(`packages/core/src/Typeahead/BaseTypeahead.test.tsx:789`).

```
Expected: aria-activedescendant="_r_1_-option-2"
Received: aria-activedescendant="_r_1_-option-1"
```

Three consecutive single-file runs fail; the full run reports `Tests 14 failed |
23777 passed`, the fourteen known ICU/Temporal failures only.

## What is known

- Green on `origin/main` (`20b6a000e`); red at `1cc2816b7` and later.
- The same option ids (`_r_1_`) show the input is the same instance, so the
  highlight index is 0 when the test expects 1 after `{ArrowDown}`. Either the
  key moved `-1 → 0` because the bootstrap highlight had not landed yet, or a
  bootstrap ran again and reset the index to 0.
- `packages/core/src/Typeahead/BaseTypeahead.tsx` sets the highlight in the
  bootstrap callback (`setHighlightedIndex(shown.length > 0 ? 0 : -1)`, around
  line 1291) and reads it for `aria-activedescendant` around line 2287.

## Ask

Find the shared state that makes the file behave differently in isolation — a
`useId` counter, a module-level cache, `document.body` reuse, or a bootstrap that
resolves at a different tick under load — and make the case independent of the
run shape. Prefer fixing the component over loosening the assertion; if the
assertion cannot express the intent, say why in a comment.

Do not change the fourteen known ICU/Temporal failures.

## Result

The test found an option in jsdom before its popover opened. In a failing run,
`aria-expanded` was `false` before ArrowDown, so the key opened the list rather
than moving the highlight. The test now waits for an open list and the first
active option before it moves to the second; it still checks that rebuilding the
source neither reloads nor moves that highlight.

Four isolated runs passed all 64 tests. The core suite reported 23,771 passed,
18 failed, and one skipped on Node 26.13.1. The full repository suite stopped
during the core build on existing `Intl.Locale` type errors. Those results have
have not been repeated for the full suite on the Node version pinned by `.nvmrc`.
A later isolated run on Node 24.22.1 passed all 65 tests, including one test
added concurrently by another task.

The specific shared state or preceding test, if any, was not identified. The
observed cause is the race between mounted options and the open popover, not a
proven dependency on a particular prior test.
