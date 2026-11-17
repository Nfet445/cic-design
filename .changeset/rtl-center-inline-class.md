---
'@astryxdesign/core': patch
---

[component] Центрирование по инлайн-оси идёт от общих классов `rtlCenterInlineClassName` и `rtlCenterInlineBlockOffsetClassName` (`utils/rtlClasses.ts`) в `className`, а не от стиля StyleX `rtlStyles.centerInline` через `stylex.props`: физические `left: 50%` и `translateX(-50%)` называют один и тот же край, поэтому элемент центрируется и в LTR, и в RTL, а логический якорь сдвигал бы его на собственную ширину. Классы берут нативное поле `CheckboxInput` и `RadioListItem`, поле `Switch` (его собственный `transform` дополняет их), обёртка кнопки закрытия `Popover`, зона захвата и пилюля `ResizeHandle`, трек и клип `Slider`, кнопка копирования якоря `Markdown`. `rtlStyles` удалён вместе с файлом. Вид и поведение прежние.

@cixzhang
