---
'@astryxdesign/core': patch
---

[component] Курсор ручки перестановки в `List` идёт от класса `reorderingHandleCursorClassName` (`privateAttributes/reorderingClasses.ts`) в `className`, а не от стиля StyleX `reorderingHandleStyles.cursor`: ручка хватает строку (`grab`), пока список помечен `data-astryx-reordering`, и показывает обычный курсор, когда ручка отключена. Помеченный список перебивает базовый курсор как потомок, а отключённое состояние перебивает оба: его селектор специфичнее. Вид и поведение прежние.

@cixzhang
