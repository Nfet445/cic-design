---
'@astryxdesign/core': patch
---

[component] Перевести подложку разделителя скользящей строки таблицы на классы Tailwind.

Подложка, которую строка рисует в `::after` на время переноса, больше не приходит
из StyleX: `packages/core/src/Table/tableGlideClasses.ts` держит литеральные классы,
а `glidingDivider.ts` оставляет себе только разметку атрибутов и снятие пометок.

@cixzhang
