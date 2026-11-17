---
'@astryxdesign/cli': patch
---

[docs] Шаблоны страниц и блоков зеркалят направленные значки классом `rtl:[transform:scaleX(-1)]` вместо `xstyle`-стиля из `@astryxdesign/core/utils`: у `centered-hero`, `gallery-hero`, `product-gallery`, `course-detail`, `detail-page`, `table-inbox`, `table-grouped`, `work-item-detail`, `review-workspace`, `run-console`, `file-explorer`, `ai-chat` и `settings-dialog` больше нет импорта StyleX ради одного значка. Вид не меняется.

@vc-cherkas
