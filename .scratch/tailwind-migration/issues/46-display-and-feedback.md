# display and feedback surfaces

Status: ready-for-agent
Blocked by: 09
Wave: 8
Ticket: 46
Parent: `00-epic-stylex-to-tailwind-4`

## What

The components that draw a box, a label or a placeholder rather than an input
or an overlay. Each carries a simple `stylex.create` map, and several read a
token that the theme owns, so this ticket is the cheapest place to prove that
the class map plus a token variable reaches the same pixels.

## Files

- `packages/core/src/Card/Card.tsx` — 4 creations
- `packages/core/src/Divider/Divider.tsx` — 4
- `packages/core/src/Banner/Banner.tsx` — 4
- `packages/core/src/Badge/Badge.tsx` — 2
- `packages/core/src/Markdown/Markdown.tsx` — 5, plus
  `packages/core/src/Markdown/plugins/HeadingLinksRenderer.tsx` — 2
- `packages/core/src/Code/Code.tsx` — 3
- `packages/core/src/CodeBlock/CodeBlock.tsx` — 3
- `packages/core/src/Blockquote/Blockquote.tsx` — 1
- `packages/core/src/Spinner/Spinner.tsx` — 4, plus
  `packages/core/src/Spinner/spinnerRotor.ts` — 1 (the rotation keyframes)
- `packages/core/src/ProgressBar/ProgressBar.tsx` — 4
- `packages/core/src/Skeleton/Skeleton.tsx` — 3
- `packages/core/src/StatusDot/StatusDot.tsx` — 2
- `packages/core/src/EmptyState/EmptyState.tsx` — 1
- `packages/core/src/Outline/Outline.tsx` — 3
- `packages/core/src/AspectRatio/AspectRatio.tsx` — 2
- `packages/core/src/Thumbnail/Thumbnail.tsx` — 1
- `packages/core/src/MetadataList/MetadataList.tsx` — 2, plus
  `MetadataListItem.tsx` — 1
- `packages/core/src/Timer/Timer.tsx` — 1
- `packages/core/src/Timestamp/Timestamp.tsx` — 1, plus
  `TimestampHoverCard.tsx` — 2
- `packages/core/src/Toast/Toast.tsx` — 1, plus `ToastViewport.tsx` — 1
- `packages/core/src/Carousel/Carousel.tsx` — 3

## Approach

- Literal classes in a `*Classes.ts` module beside the component, joined with
  `tw()`; the build scans `src/**/*Classes.ts`, so an interpolated class emits
  nothing.
- A value the props compute (a carousel offset, a progress width, a status
  tone) is a class plus an inline `--astryx-*` variable, never an inline
  declaration.
- A keyframe animation moves to `packages/core/tailwind/astryx.input.css` as
  `@keyframes astryx<Name>`, and the class names it, because the scanner reads
  class maps and not `.ts` files. `spinnerRotor.ts` is the first of these.
- `xstyle` stays last, `className` after the map. Utilities print inside
  `@layer astryx-base`, so an unlayered StyleX rule still wins; if a rule must
  outrank a class, leave it and say why in the ticket.

## Done when

- No `stylex.create` under these directories, except a rule the ticket names
  and justifies.
- Each test that read a computed style or a StyleX debug name now reads the
  class set; each moved assertion is named in the ticket.
- New exports are registered in the coverage block of
  `packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`, and the
  sheet test stays green.
- A `component`/patch changeset covers the consumer-visible output change.

## Verification

- `pnpm exec vitest run packages/core/src/Card packages/core/src/Divider packages/core/src/Banner packages/core/src/Badge packages/core/src/Markdown packages/core/src/Code packages/core/src/CodeBlock packages/core/src/Spinner packages/core/src/ProgressBar packages/core/src/Skeleton packages/core/src/StatusDot packages/core/src/Timestamp packages/core/src/Toast packages/core/src/Carousel packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`
- `node packages/core/scripts/build-css-tailwind.mjs`
- `pnpm -F @astryxdesign/core typecheck`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md`.
- Manual Windows High Contrast check applies to Card, Divider, Outline,
  Banner and StatusDot.
