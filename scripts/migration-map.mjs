// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file migration-map.mjs
 * @description Rebuilds the ticket table in the migration map from the ticket
 * headers, so the map cannot drift from the files that own the status.
 *
 * Usage:
 *   node scripts/migration-map.mjs --write   rewrite the map
 *   node scripts/migration-map.mjs --check   fail when the map is stale
 *
 * The ticket file is the source of truth: `Status:`, `Wave:`, `Blocked by:`,
 * `Family:` and the title line are read from each `issues/NN-*.md`. Only the
 * prose and the per-wave mechanism text live here, because no ticket owns them.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const ISSUES = path.join(ROOT, '.scratch/tailwind-migration/issues');
const MAP = path.join(ROOT, '.scratch/tailwind-migration/map.md');
const EPIC = '00-epic-stylex-to-tailwind-4';

/** What each wave proves; the ticket headers own everything else. */
const WAVE_MECHANISM = {
  0: 'The harness itself: cache, shared assertions, browser pages, export types',
  3: 'Shared infrastructure: tokens, markers, `Icon`, `Text`, `Indicator`, `Layer`, and `family:layout-regions`',
  4: 'Form controls: markers, `:checked`, rings — three pull requests',
  5: 'The shared style modules that still hand StyleX objects to components',
  6: 'Navigation: links, rows, tabs, side nav, top nav',
  7: 'Overlays: portals, layers, `::backdrop`, anchored placement — and `family:action-groups`',
  8: 'Data surfaces: `family:data-tables` (record first), charts, richtext, lab',
  9: 'Themes, consumer surfaces, deprecation, removal of StyleX',
  10: 'The last interaction paint, and the modules that only exist to outrank a layer utility',
};

const PREAMBLE = `# StyleX → Tailwind 4: migration map

One umbrella ticket carries the work:
\`issues/00-epic-stylex-to-tailwind-4.md\`. It lists the children, and it is
the only file a reader needs to open to see what is left.

One row per child ticket. The ticket file is the source of truth for its status;
this table repeats it so a reader sees the whole run without opening every file.
Contract: \`docs/specs/AST-119-tailwind-utility-styling/spec.md\`. Phase map:
\`docs/specs/AST-119-tailwind-utility-styling/plan.md\`.

Baseline for every size gate: the StyleX sheet of the package as built at
\`f35022021\` (wave 2 close). Gate: the Tailwind sheet's gzip may not exceed
\`GZIP_BUDGET_FACTOR\` of that baseline
(\`packages/core/src/__tests__/classNameAssertions.ts\`), except where a package
carries a measured budget with its reason in the same table.

Both tables below are generated: \`node scripts/migration-map.mjs --write\`.
\`pnpm check:migration-map\` fails when they drift from the ticket headers.
`;

function readHeader(text, key) {
  const match = text.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return match == null ? '' : match[1].trim();
}

function readTickets() {
  const tickets = [];
  for (const entry of fs.readdirSync(ISSUES)) {
    if (!entry.endsWith('.md')) {
      continue;
    }
    const slug = entry.replace(/\.md$/, '');
    if (slug === EPIC) {
      continue;
    }
    const text = fs.readFileSync(path.join(ISSUES, entry), 'utf8');
    const title = (text.match(/^# (.+)$/m) ?? ['', slug])[1].trim();
    const wave = readHeader(text, 'Wave');
    const status = readHeader(text, 'Status');
    tickets.push({
      slug,
      // A ticket file is `NN-slug`; the number is what a reader sorts by.
      number: slug.slice(0, 2),
      title,
      wave: wave === 'all' ? 'all' : Number.parseInt(wave, 10),
      status,
      blockedBy: readHeader(text, 'Blocked by'),
      family: readHeader(text, 'Family'),
    });
  }
  return tickets.sort((a, b) => a.slug.localeCompare(b.slug));
}

/** One word a reader can scan: what the ticket's status means for the run. */
function stateOf(status) {
  if (status.startsWith('done')) {
    return 'done';
  }
  if (status.startsWith('blocked')) {
    return 'blocked';
  }
  if (status.startsWith('partly')) {
    return 'partly';
  }
  return 'open';
}

/**
 * The ticket numbers of one wave as `05, 06, 08–13`: a run of three or more
 * collapses, a pair stays spelled out, because a reader diffs this column.
 */
function runsOf(numbers) {
  const sorted = [...numbers].sort((a, b) => a - b);
  const pad = value => String(value).padStart(2, '0');
  const parts = [];
  for (let i = 0; i < sorted.length; ) {
    let end = i;
    while (end + 1 < sorted.length && sorted[end + 1] === sorted[end] + 1) {
      end++;
    }
    const run = end - i + 1;
    parts.push(
      run >= 3 ? `${pad(sorted[i])}–${pad(sorted[end])}` : sorted.slice(i, end + 1).map(pad).join(', '),
    );
    i = end + 1;
  }
  return parts.join(', ');
}

function wavesSection(tickets) {
  const byWave = new Map();
  for (const ticket of tickets) {
    if (ticket.wave === 'all') {
      continue;
    }
    const bucket = byWave.get(ticket.wave) ?? [];
    bucket.push(ticket);
    byWave.set(ticket.wave, bucket);
  }
  const rows = [...byWave.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([wave, bucket]) => {
      const range = runsOf(
        bucket.map(ticket => Number.parseInt(ticket.number, 10)),
      );
      const counts = bucket.reduce((acc, ticket) => {
        const state = stateOf(ticket.status);
        acc[state] = (acc[state] ?? 0) + 1;
        return acc;
      }, {});
      const state = ['done', 'partly', 'blocked', 'open']
        .filter(key => counts[key] != null)
        .map(key => `${counts[key]} ${key}`)
        .join(', ');
      return `| ${wave} | ${WAVE_MECHANISM[wave] ?? '—'} | ${range} | ${state} |`;
    });
  return [
    '## Waves',
    '',
    '| Wave | Mechanism it proves | Tickets | State |',
    '| ---- | ------------------- | ------- | ----- |',
    '| 1–2 | Layout vocabulary, then the first interactive states (landed in PR #1) | — | done |',
    ...rows,
    '',
  ].join('\n');
}

function ticketsSection(tickets) {
  const rows = tickets.map(ticket => {
    const family = ticket.family === '' ? '—' : ticket.family;
    const blocked = ticket.blockedBy === '' ? '—' : ticket.blockedBy;
    return `| ${ticket.number} | \`${ticket.slug}\` | ${ticket.wave} | ${family} | ${blocked} | ${stateOf(ticket.status)} |`;
  });
  return [
    '## Tickets',
    '',
    '| # | Ticket | Wave | Family | Blocked by | State |',
    '| --- | --- | --- | --- | --- | --- |',
    `| 00 | \`${EPIC}\` | all | — | — | ${''}epic |`,
    ...rows,
    '',
  ].join('\n');
}

function render(tickets) {
  return `${PREAMBLE}\n${wavesSection(tickets)}\n${ticketsSection(tickets)}`;
}

const tickets = readTickets();
const rendered = render(tickets);
const current = fs.existsSync(MAP) ? fs.readFileSync(MAP, 'utf8') : '';

if (process.argv.includes('--write')) {
  fs.writeFileSync(MAP, rendered);
  console.log(`Wrote .scratch/tailwind-migration/map.md (${tickets.length} tickets)`);
} else {
  // Prettier pads table columns and rewraps prose, so compare the content, not
  // the layout: one space between cells is the canonical form on both sides.
  const normalize = text =>
    text
      .replace(/\s+/g, ' ')
      .replace(/-{2,}/g, '---')
      .replace(/ ?\| ?/g, ' | ')
      .trim();
  if (normalize(current) !== normalize(rendered)) {
    console.error(
      'The migration map does not match the ticket headers. Run `node scripts/migration-map.mjs --write`.',
    );
    process.exit(1);
  }
  console.log(
    `Migration map matches ${tickets.length} ticket headers.`,
  );
}
