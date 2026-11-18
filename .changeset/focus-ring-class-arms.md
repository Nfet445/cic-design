---
'@astryxdesign/core': patch
---

[component] Publish the class arms of the shared focus ring from
`@astryxdesign/core/utils`: `focusOutlineWithinClassName`,
`focusOutlineWithinFirstChildClassName`, `focusOutlineWithinComboboxClassName`,
`focusOutlineSuppressedClassName`, `focusOutlinePublishVarsClassName` and
`focusOutlineWithinOrPublishedClassName` beside the existing
`focusOutlineFocusVisibleClassName`. A `:has()` arm beats a component's own
rest-state utility on specificity, so a class-drawn ring survives whatever
order the utilities print in.

@cixzhang
