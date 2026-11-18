# published class seams

Status: done
Wave: 9
Ticket: 52
Parent: `00-epic-stylex-to-tailwind-4`

## What

Publish the class-map seams that consumers and templates still reach through
StyleX. Three callers wait on this ticket: ticket 45 parked four block
templates, ticket 36 cannot delete the StyleX runtime while a package entry
still hands one out, and ticket 07 kept two markers because no class seam
expresses them.

## Why

A class map is package-private until an entry point exports it. `tw()` is still
not exported from `@astryxdesign/core`, and the maps a consumer needs
(`layoutInnerClassName`, the Field wrapper and status border, the focus ring and
the interaction overlay) sit behind StyleX today. Every excluded template and
every parked marker is a consumer that had no seam to call.

## Work

1. Export `tw()` from `@astryxdesign/core` so a consumer joins classes without
   re-implementing the helper. Keep it a pure string join: it is a convenience,
   not a styling authority.
2. Publish the four seams as class exports, each beside the map that already
   holds the rule:
   - `Layout/layoutClasses.ts`: `layoutInnerClassName` and a reset class that
     writes what `overlayPaddingReset.reset` writes (`--container-padding-*:
0px`, `--layout-padding-*: initial`), reachable from
     `@astryxdesign/core/Layout`.
   - `Field/fieldClasses.ts`: the input wrapper classes and the status border
     classes, so `useInputStatusIcon` can paint a field without
     `inputStyles.stylex.ts`.
   - `utils/focusOutline` and `utils/interactionOverlay`: a class arm beside the
     StyleX one, used by `usePressFeedback` and by any composer that must draw
     the ring.
3. Convert the four parked block templates in `packages/cli/assets/templates`
   (`DrawerHeaderShowcase`, `useInputStatusIconHookUsage`,
   `usePressFeedbackHookUsage` and its test) to the published seams and tick
   ticket 45.
4. Move `usePressFeedbackHookUsage.test.tsx` off
   `stylex.props(focusOutlineStyles.focusVisible).className` onto the class
   seam: the test asserts the ring, so it follows the ring.

## Done when

- `grep -r "stylex" packages/cli/assets/templates` finds nothing.
- `packages/core/src/Layout/layoutClasses.ts`, `Field/fieldClasses.ts`,
  `utils/focusOutline*` and `utils/interactionOverlay*` export the named classes
  and each is asserted in the stylesheet test's coverage walk.
- `pnpm exec vitest run --project node packages/cli/api/template` passes.
- A changeset of category `component` records the new exports.

## Progress

Five seams, one commit each, `feat` with a Russian description:

- `877b80dfa feat(core): публиковать tw() из точки входа пакета` — `tw.ts`
  states its public position and carries the caller example;
  `utils/index.ts` exports it beside `mergeProps`, so the root entry and
  `@astryxdesign/core/utils` hand out the same function.
  `utils/tw.public.test.ts` reads both entries, never the relative path.
- `cbf2c189e feat(layout): публиковать внутренний слой раскладки и границу
отступов оверлея` — `layoutClasses.ts` gains `layoutPaddingResetClassName`,
  the fifteen properties of `overlayPaddingReset.reset` as arbitrary utilities
  (`--container-padding-*` and `--container-corner-*` `0px`,
  `--layout-padding-*` and `--_section-padding-propagated` `initial`); the
  `--astryx-section-padding` variable stays out because a reset must not eat the
  section's own opt-out. `Layout/layoutPaddingReset.public.test.ts` reads the
  StyleX source and fails when the two forms drift. `Layout` exports it beside
  `layoutInnerClassName`.
- `5c1cb1601 feat(field): публиковать классы рамки поля и статусной границы`
  — `fieldInputWrapperClassName({status})` draws `inputWrapperStyles.base` and
  `.textField`; the wrapper takes the status so one class owns `border-color`
  (the rule `FileInput/fileInputClasses.ts:18-36` states). `fieldStatusBorderClassName`
  gives the three status colours. `Field/fieldInputWrapper.public.test.ts`.
- `ffd94fb8d feat(utils): публиковать классы кольца фокуса и оверлея
взаимодействия` — `focusOutlineFocusVisibleClassName` repeats the four
  longhands of `focusOutlineStyles.focusVisible`;
  `interactionOverlayBackgroundImageClassName` repeats the hover and pressed
  gradients with the `:where(:not(:disabled,[aria-disabled="true"]))` guard, the
  coarse-pointer reset, and the `data-astryx-press` arms. The press arms read
  `var(--_press-paint-image, …)`: a page that loads this class without the StyleX
  strength still paints the pressed token, at full strength and without the
  release fade — the file states that as a `shortcut:` comment.
  `utils/publishedClassArms.public.test.ts`.
- Window 5 converts the four parked templates and lands the ticket 45 guard
  test; ticket 45 is closed.

Every class the seams publish is registered in `familyClassNames()` of
`Layout/tailwindStylesheet.source-build.test.mjs`, so the coverage walk asserts
a rule for each one. No `*.doc.mjs` change: the seams add no component prop and
no `--astryx-*` variable, so `derivedVarRegistry.test.ts` sees nothing new.

`pnpm -F @astryxdesign/core typecheck` fails only on the pre-existing
`src/Markdown/Markdown.doc.mjs(247,7): error TS2741` in a file this ticket does
not touch.
