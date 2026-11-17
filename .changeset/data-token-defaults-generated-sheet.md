---
'@astryxdesign/core': patch
---

[chore] Internal: the 56 data-color defaults ship as a generated `dataTokens.css`
with a `var()` reference shim; `astryx.css` carries the same declarations in
`@layer astryx-base`, and `theme/dataTokens.stylex` is a deprecated re-export.

@josephfarina
