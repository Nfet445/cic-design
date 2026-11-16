# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those
roles to the strings this repo uses. With the local-markdown tracker, a role is
the value of the `Status:` line near the top of an issue file under
`.scratch/<feature>/issues/`.

| Label in mattpocock/skills | Label in our tracker | Meaning                                  |
| -------------------------- | -------------------- | ---------------------------------------- |
| `needs-triage`             | `needs-triage`       | Maintainer needs to evaluate this issue  |
| `needs-info`               | `needs-info`         | Waiting on reporter for more information |
| `ready-for-agent`          | `ready-for-agent`    | Fully specified, ready for an AFK agent  |
| `ready-for-human`          | `ready-for-human`    | Requires human implementation            |
| `wontfix`                  | `wontfix`            | Will not be actioned                     |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), write
the corresponding string as the file's `Status:` value. The wayfinding states
`claimed` and `resolved` (`triage-labels.md` in the tracker doc) are separate
from these roles.

Edit the "Label in our tracker" column to match whatever vocabulary you
actually use.
