---
'@astryxdesign/core': patch
---

[chore] Layout, LayoutHeader, LayoutContent, LayoutFooter, and LayoutPanel take their region
styles from the pre-compiled Tailwind sheet. A region's padding still resolves
edge over axis over uniform, a panel still sizes its container query, and
`xstyle` still merges last.

@josephfarina
