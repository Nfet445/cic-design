# point xstyle at the Tailwind adapter

Status: ready-for-agent
Blocked by: 61
Wave: 9
Ticket: 62
Parent: `00-epic-stylex-to-tailwind-4`

## What

`xstyle` must keep working: AST-119 FR5 and OQ3 require its value to land unlayered, so a consumer rule always beats a component rule. Today the prop is a `StyleXStyles` value passed to `stylex.props`.

Retarget it at a Tailwind-shaped adapter: the prop accepts a class string or a style object, and its value reaches the element after the component's classes and before `style`. `mergeProps` already accepts both shapes, so most of this stage is deleting the `stylex.props` passthrough and typing the prop.

## Files

- `packages/core/src/utils/mergeProps.ts`
- every `BaseProps`/`xstyle` declaration under `packages/core/src` (measured: 258 files mention `xstyle`)
- `packages/core/src/__tests__/classNameAssertions.ts`

## Done when

- No `stylex.props` call remains in `packages/core/src`, `packages/lab/src`, `packages/charts/src` or `packages/richtext/src`.
- A consumer `xstyle={{'--x': 'red'}}` and a consumer `xstyle="some-class"` both land on the element after the component's classes.
- A new `packages/core/src/__tests__/xstyleContract.test.ts` pins the merge order and the unlayered rule.

## Verification

- `pnpm exec vitest run packages/core/src packages/lab/src packages/charts/src packages/richtext/src`
- `pnpm -F @astryxdesign/core typecheck`
