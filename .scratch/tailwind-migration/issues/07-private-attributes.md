# private attributes

Status: blocked
Blocked by: 42, 48
Wave: 7
Ticket: 07
Parent: `00-epic-stylex-to-tailwind-4`

## What

Turn the two `defineMarker()` scopes into private attributes. A marker cannot flip while any consumer still calls `stylex.when.ancestor`: the StyleX compiler rejects a bare attribute selector as an ancestor condition ("Attribute selector must end with `]`") and requires a `defineMarker()` value. So this ticket waits until Indicator, CheckboxInput, RadioList, DropdownMenu, Selector and Token are class-based.

This ticket also owns the last `stylex.when.ancestor` consumer that a class cannot express at all: `Overlay/OverlayScrim.tsx`'s `showOn` reveal arms, which read the `overlayScope` marker applied in `Overlay/Overlay.tsx:126` and `Overlay/useOverlay.tsx:207`. It moved here from ticket 49 because the marker flip is the same edit.

## Files

- `packages/core/src/Indicator/indicator.markers.stylex.ts`
- `packages/core/src/internal/indicatorPress.stylex.ts`
- the `stylex.when.ancestor` call sites: `Indicator/CheckboxIndicator.tsx`, `Indicator/RadioIndicator.tsx`, `CheckboxInput/CheckboxInput.tsx`, `RadioList/RadioListItem.tsx`
- `packages/core/src/Overlay/OverlayScrim.tsx`, with `Overlay/Overlay.tsx:126` and `Overlay/useOverlay.tsx:207` where the `overlayScope` marker is applied

## Done when

- Both scopes are `data-astryx-indicator-scope` / `data-astryx-indicator-press` attributes, set by the component that owns them.
- No `defineMarker` call remains in `packages/core/src`.
- The press and checked visuals still switch on the ancestor, proven by the browser specs that cover them.

## Verification

- `pnpm exec vitest run packages/core/src/Indicator packages/core/src/CheckboxInput packages/core/src/RadioList`
- `pnpm exec vitest run packages/core/src/privateAttributes`
- `node packages/core/scripts/build-css-tailwind.mjs`

## Notes

- Current `stylex.when.ancestor` sites, measured on the integration branch after waves 3–7: `Indicator/indicatorHover.stylex.ts`, `Indicator/indicator.markers.stylex.ts`, `privateAttributes/press.stylex.ts`, `Overlay/OverlayScrim.tsx`, `Switch/switchHoverPress.stylex.ts`, `Chat/ChatComposerDrawer.tsx`, `Table/table.stylex.ts`, `Table/plugins/rowExpansion/useTableRowExpansion.tsx`, `Table/plugins/stickyColumns/useTableStickyColumns.tsx`. The Indicator, press and Overlay sites are ready to flip now, because their consumers render classes. The Switch, Chat and Table sites keep `defineMarker` alive, so "no `defineMarker` remains" cannot hold until ticket 42 (table plugin styles) and ticket 48 (chat composer drawer) finish, and until the Switch press survivor is revisited.

- The compiler refuses an attribute selector as an ancestor condition: `Attribute selector must end with "]"`, and the marker argument must be a `defineMarker()` value. That is the whole reason this ticket waits.
- Scope consumers after wave 5: `Indicator/{CheckboxIndicator,RadioIndicator}.tsx` (six `when.ancestor` calls each), `CheckboxInput/CheckboxInput.tsx:516` and `:125`, `RadioList/RadioListItem.tsx:402`, `privateAttributes/press.stylex.ts:453/:469-470`, plus the re-export `Indicator/index.ts:32`.

- The ten `stylex.create` calls that used to sit in this ticket moved to `17-shared-stylex-modules.md`: they are the shared press and overlay seam, and fifteen components compose them, so they belong with the other shared modules.
- Verified facts from the wave-3 investigation: the compiler error above; the consumers are `Button`, `Item`, `ListItem`, `ListReorderHandle`, `RadioListItem`, `CheckboxInput`, `CheckboxListItem`, `TreeListItem`, `DropdownMenu{Item,CheckboxItem,RadioItem,SubMenu}`, `Selector`, `Token`, `Carousel`.
- Follow the ticket rules in `.scratch/tailwind-migration/README.md`.
