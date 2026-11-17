---
'@astryxdesign/core': patch
---

[refactor] Входные поля рисуют кнопку статуса из подсказки классами Tailwind: `useInputStatusIcon` собирает её фон, отступы, курсор и скругление из `hooks/inputStatusIconClasses.ts`, а смещение кольца фокуса остаётся в маленьком StyleX-файле, потому что кольцо задаёт своё смещение вне слоя. Вид и поведение прежние.

@cixzhang
