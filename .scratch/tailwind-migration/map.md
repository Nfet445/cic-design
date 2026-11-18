# StyleX → Tailwind 4: migration map

One umbrella ticket carries the work:
`issues/00-epic-stylex-to-tailwind-4.md`. It lists the children, and it is
the only file a reader needs to open to see what is left.

One row per child ticket. The ticket file is the source of truth for its status;
this table repeats it so a reader sees the whole run without opening every file.
Contract: `docs/specs/AST-119-tailwind-utility-styling/spec.md`. Phase map:
`docs/specs/AST-119-tailwind-utility-styling/plan.md`.

Baseline for every size gate: the StyleX sheet of the package as built at
`f35022021` (wave 2 close). Gate: the Tailwind sheet's gzip may not exceed
`GZIP_BUDGET_FACTOR` of that baseline
(`packages/core/src/__tests__/classNameAssertions.ts`), except where a package
carries a measured budget with its reason in the same table.

Both tables below are generated: `node scripts/migration-map.mjs --write`.
`pnpm check:migration-map` fails when they drift from the ticket headers.

## Waves

| Wave | Mechanism it proves                                                                                       | Tickets                     | State                      |
| ---- | --------------------------------------------------------------------------------------------------------- | --------------------------- | -------------------------- |
| 1–2  | Layout vocabulary, then the first interactive states (landed in PR #1)                                    | —                           | done                       |
| 0    | The harness itself: cache, shared assertions, browser pages, export types                                 | 01–04                       | 4 done                     |
| 3    | Shared infrastructure: tokens, markers, `Icon`, `Text`, `Indicator`, `Layer`, and `family:layout-regions` | 05, 06, 08–13, 39           | 9 done                     |
| 4    | Form controls: markers, `:checked`, rings — three pull requests                                           | 14–16, 40, 43               | 5 done                     |
| 5    | The shared style modules that still hand StyleX objects to components                                     | 17                          | 1 partly                   |
| 6    | Navigation: links, rows, tabs, side nav, top nav                                                          | 18–21, 44, 48–50            | 8 done                     |
| 7    | Overlays: portals, layers, `::backdrop`, anchored placement — and `family:action-groups`                  | 07, 22–25, 41               | 6 done                     |
| 8    | Data surfaces: `family:data-tables` (record first), charts, richtext, lab                                 | 26–30, 37, 42, 46, 47       | 9 done                     |
| 9    | Themes, consumer surfaces, deprecation, removal of StyleX                                                 | 31–36, 38, 45, 51–53, 58–67 | 16 done, 1 blocked, 4 open |
| 10   | The last interaction paint, and the modules that only exist to outrank a layer utility                    | 54–57                       | 4 done                     |

## Tickets

| #   | Ticket                              | Wave | Family                           | Blocked by | State   |
| --- | ----------------------------------- | ---- | -------------------------------- | ---------- | ------- |
| 00  | `00-epic-stylex-to-tailwind-4`      | all  | —                                | —          | epic    |
| 01  | `01-stylesheet-build-cache`         | 0    | —                                | —          | done    |
| 02  | `02-test-harness`                   | 0    | —                                | —          | done    |
| 03  | `03-browser-check-pages`            | 0    | —                                | —          | done    |
| 04  | `04-css-export-types`               | 0    | —                                | —          | done    |
| 05  | `05-tokens`                         | 3    | —                                | —          | done    |
| 06  | `06-theme-modules`                  | 3    | —                                | 5          | done    |
| 07  | `07-private-attributes`             | 7    | —                                | —          | done    |
| 08  | `08-icon`                           | 3    | —                                | 5          | done    |
| 09  | `09-text`                           | 3    | —                                | 5          | done    |
| 10  | `10-indicator`                      | 3    | —                                | 5          | done    |
| 11  | `11-layer-hooks-utils`              | 3    | —                                | 5          | done    |
| 12  | `12-layout-regions`                 | 3    | `family:layout-regions`          | 5,9        | done    |
| 13  | `13-section-toolbar`                | 3    | `family:layout-regions`          | 12         | done    |
| 14  | `14-field-and-text-inputs`          | 4    | `family:input-fields`            | 5,9,11     | done    |
| 15  | `15-choice-inputs`                  | 4    | `family:input-fields`            | 14         | done    |
| 16  | `16-date-inputs`                    | 4    | `family:input-fields`            | 14         | done    |
| 17  | `17-shared-stylex-modules`          | 5    | —                                | 11         | partly  |
| 18  | `18-links-and-items`                | 6    | `family:navigation-destinations` | 17         | done    |
| 19  | `19-tabs-and-headings`              | 6    | `family:navigation-destinations` | 18         | done    |
| 20  | `20-side-nav`                       | 6    | `family:navigation-destinations` | 18         | done    |
| 21  | `21-top-nav`                        | 6    | `family:navigation-destinations` | 18         | done    |
| 22  | `22-dialogs-and-sheets`             | 7    | `family:overlay-dismissal`       | 11,17      | done    |
| 23  | `23-menus`                          | 7    | `family:action-groups`           | 22         | done    |
| 24  | `24-tooltip-hovercard`              | 7    | `family:overlay-dismissal`       | 22         | done    |
| 25  | `25-search-surfaces`                | 7    | `family:overlay-dismissal`       | 23         | done    |
| 26  | `26-data-tables-record`             | 8    | `family:data-tables`             | —          | done    |
| 27  | `27-table-structure`                | 8    | `family:data-tables`             | 26         | done    |
| 28  | `28-table-behaviour`                | 8    | `family:data-tables`             | 27         | done    |
| 29  | `29-charts-and-richtext`            | 8    | —                                | 17         | done    |
| 30  | `30-lab`                            | 8    | —                                | 22,29      | done    |
| 31  | `31-themes`                         | 9    | —                                | 6          | done    |
| 32  | `32-cli-docs-and-templates`         | 9    | —                                | 31         | open    |
| 33  | `33-storybook-and-vibe-tests`       | 9    | —                                | 31         | done    |
| 34  | `34-swizzle-and-render-pipeline`    | 9    | —                                | 32         | done    |
| 35  | `35-deprecate-stylex-subpaths`      | 9    | —                                | 31,32      | done    |
| 36  | `36-remove-stylex`                  | 9    | —                                | 63         | blocked |
| 37  | `37-table-row-and-cell`             | 8    | —                                | —          | done    |
| 38  | `38-data-token-sheet`               | 9    | —                                | —          | done    |
| 39  | `39-layout-regions-page`            | 3    | —                                | —          | done    |
| 40  | `40-integration-regressions`        | 4    | —                                | —          | done    |
| 41  | `41-shared-modules-after-consumers` | 7    | —                                | —          | done    |
| 42  | `42-table-plugin-styles`            | 8    | —                                | 23, 41     | done    |
| 43  | `43-full-suite-green`               | 4    | —                                | —          | done    |
| 44  | `44-item-row-machine`               | 6    | `family:navigation-destinations` | none       | done    |
| 45  | `45-template-pages-and-blocks`      | 9    | —                                | 31         | done    |
| 46  | `46-display-and-feedback`           | 8    | —                                | 09         | done    |
| 47  | `47-form-controls-and-leftovers`    | 8    | —                                | 14, 15     | done    |
| 48  | `48-chat-surface`                   | 6    | —                                | 09, 11, 44 | done    |
| 49  | `49-overflow-and-gesture`           | 6    | —                                | —          | done    |
| 50  | `50-bottom-sheet-host`              | 6    | —                                | 22         | done    |
| 51  | `51-consumer-assertions`            | 9    | —                                | (none)     | open    |
| 52  | `52-published-class-seams`          | 9    | —                                | —          | done    |
| 53  | `53-press-and-own-ring`             | 9    | —                                | —          | done    |
| 54  | `54-layout-text-stack-utilities`    | 10   | —                                | —          | done    |
| 55  | `55-field-and-input-wrappers`       | 10   | —                                | —          | done    |
| 56  | `56-focus-and-overrides`            | 10   | —                                | 54         | done    |
| 57  | `57-tables-overlays-leaves`         | 10   | —                                | 54, 55     | done    |
| 58  | `58-closed-layer-option-race`       | 9    | —                                | —          | done    |
| 59  | `59-token-names`                    | 9    | —                                | —          | done    |
| 60  | `60-last-stylex-maps`               | 9    | —                                | 56, 57, 59 | done    |
| 61  | `61-retire-stylex-build`            | 9    | —                                | 60         | done    |
| 62  | `62-xstyle-adapter`                 | 9    | —                                | 61         | done    |
| 63  | `63-major-changeset`                | 9    | —                                | 62         | open    |
| 64  | `64-maps-after-xstyle`              | 9    | —                                | 62         | done    |
| 65  | `65-focus-return-regression`        | 9    | —                                | —          | done    |
| 66  | `66-typeahead-test-isolation`       | 9    | —                                | —          | done    |
| 67  | `67-marker-ancestors`               | 9    | —                                | none       | open    |
