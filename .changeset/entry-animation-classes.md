---
'@astryxdesign/core': patch
---

[refactor] `useEntryAnimation` returns a Tailwind class name to join into `className` instead of a StyleX style, so `FieldStatus` draws its mount entrance from the shared utility sheet. The four presets keep their frames, duration, easing and fill mode, and still turn off under Reduce Motion.

@cixzhang
