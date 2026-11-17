---
'@astryxdesign/core': patch
---

[feat] `Selector` and `MultiSelector` option rows now take their look from precompiled Tailwind utility classes: the row frame, its inset per size, the content box, the mark column, and the highlighted, keyboard-highlighted, selected and disabled states. The row reads its fill and its outline style from a private variable the state class sets, so a state wins over the base declaration without depending on sheet order. `SelectorOption`'s embedded row resets its inset and radius through a class too. The trigger, the popup surface and its list keep their current styling.

@josephfarina
