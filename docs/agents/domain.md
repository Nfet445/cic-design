# Domain Docs

How the engineering skills should consume this repo's domain documentation when
exploring the codebase.

## Before exploring, read these

- **`GLOSSARY.md`** at the repo root, or **`GLOSSARY-MAP.md`** at the repo root
  if it exists: it points at one `GLOSSARY.md` per context. Read each one
  relevant to the topic.
- **`docs/adr/`**: read ADRs that touch the area you're about to work in.

This repo keeps its design knowledge under `docs/specs/`,
`docs/architecture/`, and `docs/families/`. Where an ADR does not exist for an
area, those records decide: per `AGENTS.md`, only a record with
`authority: current` governs implementation and review. An ADR records a
decision in the short form an engineering skill expects; a knowledge record
carries the claim, its evidence, and its owner.

If any of these files don't exist, **proceed silently**. Don't flag their
absence; don't suggest creating them upfront. The `/domain-modeling` skill
(reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates
them lazily when terms or decisions actually get resolved.

## File structure

Single-context repo:

```
/
├── GLOSSARY.md
├── docs/adr/
│   ├── 0001-event-sourced-orders.md
│   └── 0002-postgres-for-write-model.md
└── src/
```

An ADR file is `docs/adr/NNNN-<slug>.md`, numbered from `0001`.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor
proposal, a hypothesis, a test name), use the term as defined in `GLOSSARY.md`.
Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either
you're inventing language the project doesn't use (reconsider) or there's a
real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than
silently overriding:

> _Contradicts ADR-0007 (event-sourced orders), but worth reopening because…_
