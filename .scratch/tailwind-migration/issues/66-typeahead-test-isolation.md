# Tests that only pass inside the full suite

Status: ready-for-agent
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
