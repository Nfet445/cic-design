---
'@astryxdesign/core': patch
---

[component] Icon sizes now come from a Tailwind class that reads `--astryx-icon-size`, an inline custom property the component sets for its `size`, instead of a StyleX rule per size; colors, `data-size`/`data-color`, props, and the `xstyle`/`className`/`style` merge order are unchanged. `@astryxdesign/core/Icon/IconSize.stylex` still resolves and still exports `iconSizeStyles` and `iconBoxSizeStyles`, now marked deprecated; import the `IconSize` type from `@astryxdesign/core/Icon`.

@Nfet445
