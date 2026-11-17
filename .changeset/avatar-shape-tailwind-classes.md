---
'@astryxdesign/core': patch
---

[component] Форма `Avatar` публикует радиус литеральным классом в `Avatar/avatarClasses.ts`: обёртка, содержимое, фокусное кольцо и чип «+N» в `AvatarGroupOverflow` читают ту же приватную переменную `--_avatar-radius`, что и раньше, поэтому `borderRadius` темы по-прежнему доходит до всех поверхностей через производную переменную. Кольцо и перекрытие в стопке `AvatarGroup` остаются в `Avatar/avatarGroupRing.stylex.ts`: завершающий `className` вызывающего (`border-0`, `ms-*`) выигрывал бы у утилиты при равной специфичности. Вид и поведение прежние.
