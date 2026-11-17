---
'@astryxdesign/core': patch
---

[component] SegmentedControl и его сегменты рисуются предкомпилированными классами Tailwind. Линза выбора — псевдоэлементы `::before` и `::after` самой группы — читает переменные `--_segmented-lens-*` и `--_segmented-after-*`, которые пишет анимация выбора; радиус сегмента считается из радиуса и отступа группы, а под forced colors выбранный сегмент берёт Highlight/HighlightText по `aria-checked`. Фокусное кольцо, слой наведения и область касания остаются общими StyleX-слоями. Вид и поведение прежние.

@Nfet445
