---
'@astryxdesign/core': patch
---

[component] `@astryxdesign/core` публикует `tw()`: он объединяет значения классов в один `class` и отбрасывает `false`, `null` и `undefined`, поэтому вызывающему не нужно повторять этот помощник, чтобы добавить свои утилиты к опубликованной карте классов.

@cixzhang

[component] `@astryxdesign/core/Layout` публикует `layoutInnerClassName` и `layoutPaddingResetClassName`: первый даёт внутреннему слою раскладки отмену отступов контейнера, второй рисует на корне оверлея ту же границу отступов, что и StyleX-сброс `overlayPaddingReset.reset` (`--container-padding-*` и `--container-corner-*` в `0px`, `--layout-padding-*` и `--_section-padding-propagated` в `initial`). Тест `Layout/layoutPaddingReset.public.test.ts` сверяет класс с исходником сброса, поэтому две формы не разойдутся. Вид и поведение прежние.

[component] `@astryxdesign/core/Field` публикует `fieldInputWrapperClassName({status})` и `fieldStatusBorderClassName`: первый рисует рамку поля так же, как `inputWrapperStyles.base` и `.textField` (ширина рамки, поверхность, кольцо наведения и фокуса, тайминги), второй даёт цвет рамки для статуса `warning`, `error` и `success`. `status` заменяет цвет рамки в покое, поэтому два класса никогда не спорят за `border-color`; отступы, выравнивание и рост остаются за вызывающим. Вид и поведение прежние.
