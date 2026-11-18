---
'@astryxdesign/core': patch
---

[feat] `Selector`, `MultiSelector` and `Typeahead` result rows now take their look from precompiled Tailwind utility classes: the row frame, its inset per size, the content box, the mark or checkbox column, and the highlighted, keyboard-highlighted, selected and disabled states. A row reads its fill and its outline style from a private variable the state class sets, so a state wins over the base declaration without depending on sheet order. In Windows High Contrast a highlighted `Typeahead` row draws a system outline through the same variables. `SelectorOption`'s embedded row resets its inset and radius through a class, and `TypeaheadItem`'s frame, label, description and disabled dimming are classes too. The triggers, the popup surfaces and their lists keep their current styling.

@josephfarina
