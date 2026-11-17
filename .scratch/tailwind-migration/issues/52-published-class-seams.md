# published class seams

Status: ready-for-agent
Blocked by: 41
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
