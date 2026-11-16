# Component family contracts

Family contracts own behavior shared by sibling components, such as input
sizing, end lanes, overlay dismissal, or status presentation. A component spec
links to its family instead of copying the shared rule.

New records start as `draft`. They become `current` only after explicit owner
approval. Archived records remain for context and state why they no longer
govern. Use `docs/templates/knowledge/family-contract.md`.

## Records

| Record                                                  | Id                               |
| ------------------------------------------------------- | -------------------------------- |
| [Action groups](./action-groups.md)                     | `family:action-groups`           |
| [Buttons](./buttons.md)                                 | `family:buttons`                 |
| [Data tables](./data-tables.md)                         | `family:data-tables`             |
| [Input fields](./input-fields.md)                       | `family:input-fields`            |
| [Layout primitives](./layout-primitives.md)             | `family:layout-primitives`       |
| [Layout regions](./layout-regions.md)                   | `family:layout-regions`          |
| [Navigation destinations](./navigation-destinations.md) | `family:navigation-destinations` |
| [Overlay dismissal](./overlay-dismissal.md)             | `family:overlay-dismissal`       |
