# links and items

Status: done (see Result and Comments; `Item/` and `List/` moved to ticket 44)
Blocked by: 17
Wave: 6
Family: `family:navigation-destinations`
Ticket: 18
Parent: `00-epic-stylex-to-tailwind-4`

## What

Migrate the row and link members: `Link/`, `Item/`, `ListItem/`, `BreadcrumbItem/`, `Avatar/` (12), `Pagination/`, `Citation/`, `ClickableCard/`, `Token/` link mode.

## Files

- `packages/core/src/Link/**`
- `packages/core/src/Item/**`
- `packages/core/src/List/**`
- `packages/core/src/BreadcrumbItem/**`
- `packages/core/src/Avatar/**`
- `packages/core/src/Pagination/**`
- `packages/core/src/Citation/**`
- `packages/core/src/ClickableCard/**`

## Done when

- Hover, pressed and visited states come from variants over the same tokens.
- `useLinkComponent()` stays the only link element source.

## Verification

- `pnpm exec vitest run packages/core/src/Link packages/core/src/List packages/core/src/Avatar packages/core/src/Pagination`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.

## Result

Landed, each with its own class map, its own component edit and a coverage block
in `packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`:

- `Link/linkClasses.ts` — `linkClassName`, `linkColorClassName`, `linkDisplayClassName`;
  the display is two separate literals (`inline-flex` outside a clamp, `inline`
  inside one) because Tailwind orders utilities by property, not by string order.
- `Citation/citationClasses.ts` — badge, icon wrap, icon and label, in the
  `label` and `number` variants with and without a `url`.
- `Breadcrumbs/breadcrumbItemClasses.ts` — row, size tier, separator, start icon,
  chevron, link and current-page paint.
- `Token/tokenClasses.ts` — surface, size tier, colour pair, label, hidden label,
  invisible action control and remove button. Token's link mode is Token's own
  class map; `TokenLink.tsx` holds no styles of its own.
- `Pagination/paginationClasses.ts` — root, controls row, compact trims, ellipsis,
  dots, active page, page box and page-size selector.
- `Avatar/avatarStatusDotClasses.ts` — plate, variant ink and icon box. The dot's
  size and border width ride `--astryx-status-dot-*` variables written inline;
  no styled property is declared inline.

Two defects found and fixed on the way:

- The `Link` new-tab hint had lost its word boundary in the `Text` migration, so
  the accessible name read `Docs(opens in new tab)`. A literal `{' '}` before the
  `VisuallyHidden` hint restores `Docs (opens in new tab)` and
  `Docs (new window)`; the two long-failing `Link.test.tsx` assertions now pass
  (before: 2 failed / 663 passed, after: 665 passed).
- Four hover classes in `Link` and `Citation` were assembled with an interpolated
  enabled guard, so Tailwind emitted no rule for them. The guard
  `:not(:disabled,[aria-disabled=true])` is now spelled out inside each literal.

Moved assertions (sheet or computed-style reads replaced by class-set
assertions through `packages/core/src/__tests__/classNameAssertions.ts`):

- `Link.test.tsx` — the whole `Link display` suite: "keeps its inline-flex box
  outside a clamped Text", "keeps its inline-flex box inside a Text that does not
  clamp", "is inline inside a clamped Text, so the clamp can truncate it",
  "decides from the clamp, not the children: composed content is inline too", "is
  inline inside a clamped Text for the external-link form", "keeps its own box
  inside a clamped Text when it sets display or maxLines", "keeps the button form
  as an inline-flex box inside a clamped Text", "keeps its own box in a layer
  opened inside a clamped Text".
- `Citation.test.tsx` — the StyleX probe became a class set: "uses the secondary
  text color in the label variant", "uses the secondary text color, not accent, in
  the number variant", "keeps the accent-muted badge background when the source has
  a url", "uses the pointer cursor with a url in the label variant", "uses the
  pointer cursor with a url in the number variant".
- `Token.test.tsx` — "keeps the remove button from shrinking when a static /
  clickable / link token is cut by its width" read `getComputedStyle().flexShrink`;
  it now asserts the remove button's class set.
- `AvatarStatusDot.test.tsx` — "fills the ring variant with surface and inks it
  with the variant colour", "uses each filled status plate matching on-fill ink
  role", "lets a user icon inherit the dot ink instead of hard-coding surface".

Left on StyleX, with the reason:

- `BreadcrumbItem`'s menu popover styles: the trigger configures `DropdownMenu`'s
  own surface through private variables, so they belong to that menu, not to the
  crumb's paint.
- `Link`, `Token`, `Item`-shaped rows keep their pressed overlay
  (`interactionOverlayStyles`) and their focus ring (`focusOutlineProps`) in
  StyleX: they are the shared press and ring machines, not component paint.
- `AvatarGroup`'s ring and overlap stay in `avatarGroupRing.stylex.ts`: the
  ring has to outrank the avatar's own border, and a caller's trailing
  `className` (`border-0`, `ms-*`) wins a sheet-order tie.

Then the two remaining groups of this ticket:

- `ClickableCard/clickableCardClasses.ts` — surface, the press and hover overlay,
  both border states, the disabled dimming and the hidden control. The overlay's
  `[data-astryx-press]` arms are literal classes, as in `SelectableCard`; the
  press machine (`interactionOverlayStyles.pressedAlpha`) still paints the
  alpha-strength levels.
- `Avatar/avatarClasses.ts` — `avatarShapeClassName` publishes the shape's
  `--_avatar-radius` as a class, so the wrapper, the content cell, the focus ring
  and `AvatarGroupOverflow`'s "+N" chip keep reading one property and a theme's
  derived `borderRadius` still reaches all of them.

`Item/` and `List/` left this ticket for ticket 44, which carried their density
padding, `--_item-inset-inline` and line-clamp dynamic style.

## Comments

The overlay's press texture is a class now and the alpha arms are still StyleX, so
`after:` reads a transition plus `var(--_press-overlay)` and the press machine
writes `--_press-paint-image` over it. The one StyleX survivor in `ClickableCard`
is the border-inset padding: `container()` sets `padding` from its variables, so a
utility would only tie with it and the sheet order would decide.

`--_avatar-radius` stays the lever it was. It is a derived variable in
`theme/derivedVarRegistry.ts`, so a theme's `borderRadius` on the avatar target
still lands on every shaped surface; only the per-shape publisher moved from
`shapeStyles` to `avatarShapeClassName`.

Both class maps are in the coverage walk of
`packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`, which stands
at 1977 rules against its 1980 ceiling. The sheet grows by three next time a
component adds a class, so raise the ceiling with the next landing.
