# StyleX → Tailwind 4: migration map

One row per ticket. The ticket file is the source of truth for its status; this
table repeats it so a reader sees the whole run without opening 36 files.
Contract: `docs/specs/AST-119-tailwind-utility-styling/spec.md`. Phase map:
`docs/specs/AST-119-tailwind-utility-styling/plan.md`.

Baseline for every size gate: the StyleX sheet of the package as built at
`f35022021` (wave 2 close). Gate: the Tailwind sheet's gzip may not exceed
`1.15 ×` that baseline.

## Waves

| Wave | Mechanism it proves                                                                                       | Tickets | State |
| ---- | --------------------------------------------------------------------------------------------------------- | ------- | ----- |
| 1–2  | Layout vocabulary, then the first interactive states (done in PR #1)                                      | —       | done  |
| 0    | The harness itself: cache, shared assertions, browser pages, export types                                 | 1–4     | ready |
| 3    | Shared infrastructure: tokens, markers, `Icon`, `Text`, `Indicator`, `Layer`, and `family:layout-regions` | 5–13    | ready |
| 4    | Form controls: markers, `:checked`, rings — three pull requests                                           | 14–16   | ready |
| 5    | The shared style modules that still hand StyleX objects to components                                     | 17      | ready |
| 6    | Navigation: links, rows, tabs, side nav, top nav                                                          | 18–21   | ready |
| 7    | Overlays: portals, layers, `::backdrop`, anchored placement — and `family:action-groups`                  | 22–25   | ready |
| 8    | Data surfaces: `family:data-tables` (record first), charts, richtext, lab                                 | 26–30   | ready |
| 9    | Themes, consumer surfaces, deprecation, removal of StyleX                                                 | 31–36   | ready |

Two families ride a wave they do not name: `family:layout-regions` sits in wave
3 because it reads the padding vocabulary wave 1 proved, and
`family:action-groups` sits in wave 7 because its members are menus over the
overlay layer.

## Tickets

| #   | Ticket                           | Wave | Family                           | Blocked by |
| --- | -------------------------------- | ---- | -------------------------------- | ---------- |
| 01  | `01-stylesheet-build-cache`      | 0    | —                                | —          |
| 02  | `02-test-harness`                | 0    | —                                | —          |
| 03  | `03-browser-check-pages`         | 0    | —                                | —          |
| 04  | `04-css-export-types`            | 0    | —                                | —          |
| 05  | `05-tokens`                      | 3    | —                                | —          |
| 06  | `06-theme-modules`               | 3    | —                                | 05         |
| 07  | `07-private-attributes`          | 3    | —                                | 05         |
| 08  | `08-icon`                        | 3    | —                                | 05         |
| 09  | `09-text`                        | 3    | —                                | 05         |
| 10  | `10-indicator`                   | 3    | —                                | 05, 07     |
| 11  | `11-layer-hooks-utils`           | 3    | —                                | 05, 07     |
| 12  | `12-layout-regions`              | 3    | `family:layout-regions`          | 05, 09     |
| 13  | `13-section-toolbar`             | 3    | `family:layout-regions`          | 12         |
| 14  | `14-field-and-text-inputs`       | 4    | `family:input-fields`            | 05, 09, 11 |
| 15  | `15-choice-inputs`               | 4    | `family:input-fields`            | 14         |
| 16  | `16-date-inputs`                 | 4    | `family:input-fields`            | 14         |
| 17  | `17-shared-stylex-modules`       | 5    | —                                | 07, 11     |
| 18  | `18-links-and-items`             | 6    | `family:navigation-destinations` | 17         |
| 19  | `19-tabs-and-headings`           | 6    | `family:navigation-destinations` | 18         |
| 20  | `20-side-nav`                    | 6    | `family:navigation-destinations` | 18         |
| 21  | `21-top-nav`                     | 6    | `family:navigation-destinations` | 18         |
| 22  | `22-dialogs-and-sheets`          | 7    | `family:overlay-dismissal`       | 11, 17     |
| 23  | `23-menus`                       | 7    | `family:action-groups`           | 22         |
| 24  | `24-tooltip-hovercard`           | 7    | `family:overlay-dismissal`       | 22         |
| 25  | `25-search-surfaces`             | 7    | `family:overlay-dismissal`       | 23         |
| 26  | `26-data-tables-record`          | 8    | `family:data-tables`             | —          |
| 27  | `27-table-structure`             | 8    | `family:data-tables`             | 26         |
| 28  | `28-table-behaviour`             | 8    | `family:data-tables`             | 27         |
| 29  | `29-charts-and-richtext`         | 8    | —                                | 17         |
| 30  | `30-lab`                         | 8    | —                                | 22, 29     |
| 31  | `31-themes`                      | 9    | —                                | 06         |
| 32  | `32-cli-docs-and-templates`      | 9    | —                                | 31         |
| 33  | `33-storybook-and-vibe-tests`    | 9    | —                                | 31         |
| 34  | `34-swizzle-and-render-pipeline` | 9    | —                                | 32         |
| 35  | `35-deprecate-stylex-subpaths`   | 9    | —                                | 31, 32     |
| 36  | `36-remove-stylex`               | 9    | —                                | 35         |

## Scope

In scope: `packages/core`, `packages/lab`, `packages/charts`,
`packages/richtext`, and the consumer surfaces they feed.

Out of scope, stated so nobody reopens it: `packages/native` and
`packages/vega` contain no StyleX (0 `stylex.create`, no `@stylexjs` import)
and Tailwind CSS does not apply to React Native. `packages/themes` is a
migration target only in the shape of the CSS it emits (ticket 31), because no
theme source imports StyleX today.
