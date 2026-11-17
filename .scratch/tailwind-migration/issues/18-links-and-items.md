# links and items

Status: partly done — six of nine groups landed; `Item/`, `List/`, `Avatar/` and `ClickableCard/` wait (see Result)
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
- `Avatar`'s `shapeStyles` stays a StyleX export because
  `AvatarGroup/AvatarGroupOverflow.tsx` consumes it; moving it would change another
  family's file.

Still to do in a follow-up window: `Item/`, `List/` (`ListItem`, reorder handle),
`Avatar/` itself and `ClickableCard/`. The first three carry baseline-alignment
struts, per-density padding, `--_item-inset-inline` and a line-clamp dynamic style
that a class map has to re-home carefully; `ClickableCard`'s hover and press paint
is the shared overlay whose `[data-astryx-press]` arms depend on StyleX's
unlayered priority, which is the same reason the press machine stays.
