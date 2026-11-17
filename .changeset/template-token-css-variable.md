---
'@astryxdesign/cli': patch
---

[docs] Шаблоны читают дизайн-токен как CSS-переменную, а не как `tokens.stylex`: `useScrollLockHookUsage` и `PopoverBottomSheetAlternative` больше не импортируют `@astryxdesign/core/theme/tokens.stylex` и `@stylexjs/stylex`, а `xstyle` заменён на `className` с классом на ту же переменную (`[padding:var(--spacing-4)]`). Вид не меняется.

@vc-cherkas
