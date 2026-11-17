---
'@astryxdesign/core': patch
---

[feat] `Field`, `FieldLabel`, `InputClearButton`, `TextInput`, `TextArea` and `FileInput` now take their own look from precompiled Tailwind utility classes: the field frame and its stacking boundary, the label, description and screen-reader slots, the text control and its height, the textarea's overlays and counter, and the file dropzone's hover, focus, disabled and status arms. A width still travels as the `--astryx-field-width` custom property, and the shared input wrapper, its status ring and `NumberInput`'s wrapper padding stay as they were.

@josephfarina
