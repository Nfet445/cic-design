---
'@astryxdesign/core': patch
---

[component] Зеркалирование направленных глифов под RTL идёт от общей константы `RTL_MIRROR_CLASS` (`utils/rtlClasses.ts`) в `className`, а не от стиля StyleX через `xstyle`: так глиф может одновременно нести свои классы. Её берут шевроны `Pagination`, `Carousel`, `Stepper`, `TabList`, `SideNavCollapseButton`, `CodeBlock`, `ContextMenu`, `Lightbox`, `TopNav` и `PowerSearch`, стрелки календарей `DateInput`/`DateTimeInput`, слэш `BreadcrumbItem` и переключатель раскрытия строки `Table`. `rtlStyles` теперь содержит только `centerInline`. Вид и поведение прежние.

@cixzhang
