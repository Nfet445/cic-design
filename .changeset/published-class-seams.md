---
'@astryxdesign/core': patch
---

[component] `@astryxdesign/core` публикует `tw()`: он объединяет значения классов в один `class` и отбрасывает `false`, `null` и `undefined`, поэтому вызывающему не нужно повторять этот помощник, чтобы добавить свои утилиты к опубликованной карте классов.

@cixzhang

[component] `@astryxdesign/core/Layout` публикует `layoutInnerClassName` и `layoutPaddingResetClassName`: первый даёт внутреннему слою раскладки отмену отступов контейнера, второй рисует на корне оверлея ту же границу отступов, что и StyleX-сброс `overlayPaddingReset.reset` (`--container-padding-*` и `--container-corner-*` в `0px`, `--layout-padding-*` и `--_section-padding-propagated` в `initial`). Тест `Layout/layoutPaddingReset.public.test.ts` сверяет класс с исходником сброса, поэтому две формы не разойдутся. Вид и поведение прежние.

[component] `@astryxdesign/core/Field` публикует `fieldInputWrapperClassName({status})` и `fieldStatusBorderClassName`: первый рисует рамку поля так же, как `inputWrapperStyles.base` и `.textField` (ширина рамки, поверхность, кольцо наведения и фокуса, тайминги), второй даёт цвет рамки для статуса `warning`, `error` и `success`. `status` заменяет цвет рамки в покое, поэтому два класса никогда не спорят за `border-color`; отступы, выравнивание и рост остаются за вызывающим. Вид и поведение прежние.

[component] `@astryxdesign/core/utils` публикует два класса рядом со StyleX-картами: `focusOutlineFocusVisibleClassName` рисует общее кольцо фокуса теми же четырьмя длинными свойствами `outline-*`, что и `focusOutlineStyles.focusVisible` (кольцо появляется только на `:focus-visible`, а обёртка вокруг контрола дописывает вариант сама), и `interactionOverlayBackgroundImageClassName` рисует системный оверлей наведения и нажатия на собственной поверхности: токен наведения под точным указателем, токен нажатия на `:active` и краску контроллера нажатий по атрибуту `data-astryx-press`, которую грубый указатель не дублирует через `:active`. Вид и поведение прежние.

[component] Четыре шаблона CLI — `DrawerHeaderShowcase`, `useInputStatusIconHookUsage`, `usePressFeedbackHookUsage` и его тест — перешли со StyleX на опубликованные классы и `className`, поэтому скопированный шаблон не требует ни компилятора StyleX, ни его рантайма. Тест `core/src/templateStyleXGuard.test.ts` читает каждый файл под `packages/cli/assets/templates` и падает, если шаблон снова назовёт `@stylexjs/stylex`, `xstyle` или `tokens.stylex`. Вид и поведение прежние.
