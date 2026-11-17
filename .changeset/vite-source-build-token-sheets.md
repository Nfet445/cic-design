---
'@astryxdesign/build': patch
---

[fix] A Vite source build's split stylesheet now carries the packages' generated token sheets, so the custom properties its rules read are declared. Token defaults are generated CSS rather than StyleX rules, and the split printed only rules: every declaration reading one, `light-dark()` values included, was dropped by the browser. `light-dark()` stays native at the supported browser floor.

@josephfarina
