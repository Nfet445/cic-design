---
'@astryxdesign/core': patch
---

[refactor] Строка клавиш якорной подсказки и её подпись рисуются классами Tailwind (`hooks/anchoredHintClasses.ts`), а не стилями StyleX. Сама поверхность подсказки остаётся в StyleX: она уходит в слой `useLayer` через `xstyle` и должна перебивать классы вызывающего. Вид и поведение прежние.

@cixzhang
