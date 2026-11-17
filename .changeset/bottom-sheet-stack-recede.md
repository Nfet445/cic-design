---
'@astryxdesign/core': patch
---

[refactor] `BottomSheet` keeps the stack's recede rule in its own StyleX file, so a covered sheet still lifts and shrinks over any travel utility it shares `transform` with. Its tests no longer read a computed `transform`; they assert the depth the dialog reports and the rule's two transform strings.

@Nfet445
