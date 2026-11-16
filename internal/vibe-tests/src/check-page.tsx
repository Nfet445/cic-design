// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The shared shell of a family check page: the fixture and its table.
 * @input A family's fixture markup and its resolved checks.
 * @output `CheckPage`, which renders the values a family page asserts.
 * @position internal/vibe-tests/src/check-page.tsx; a page module under
 *   environments/project-astryx-tailwind/pages/ supplies the fixture.
 *
 * The table prints every recorded value next to the declaration it comes from
 * and the value that declaration resolves to, so a reviewer reads the numbers
 * from the page. The page's script fills the measured column in a browser.
 */

import type {ReactNode} from 'react';
import type {Check, ResolvedCheck} from './check-values';

export interface CheckPageProps {
  /** The family the page covers, for example `family:buttons`. */
  title: string;
  /** One sentence on what the page renders and where its values come from. */
  intro: string;
  /** The checks the fixture asserts, resolved against the built sheets. */
  rows: ResolvedCheck[];
  /** The fixture: the elements the checks read. */
  children: ReactNode;
}

function sourceLabel(check: Check): string {
  return check.source.kind === 'class'
    ? check.source.className
    : check.source.name;
}

export function CheckPage({title, intro, rows, children}: CheckPageProps) {
  return (
    <main>
      <h1>{title}</h1>
      <p className="intro">{intro}</p>
      <h2>Fixture</h2>
      <div className="fixture">{children}</div>
      <h2>Values it asserts</h2>
      <p id="summary">
        Not measured. Open this page in a browser to fill the measured column.
      </p>
      <table className="checks">
        <thead>
          <tr>
            <th>check</th>
            <th>element</th>
            <th>from</th>
            <th>property</th>
            <th>declares</th>
            <th>resolves to</th>
            <th>recorded</th>
            <th>measured</th>
            <th>static check</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({check, declared, resolved, ok, reason}) => (
            <tr
              key={check.id}
              data-check={check.id}
              data-element={check.element ?? check.id}
              data-property={check.property}
              data-expected={check.expected}
              data-static={ok ? 'pass' : 'fail'}>
              <td>{check.id}</td>
              <td>
                <code>{check.element ?? check.id}</code>
              </td>
              <td>
                <code>{sourceLabel(check)}</code>
              </td>
              <td>
                <code>{check.property}</code>
              </td>
              <td>
                <code>{declared}</code>
              </td>
              <td>
                <code>{resolved}</code>
              </td>
              <td>
                <code>{check.expected}</code>
              </td>
              <td data-cell="measured">not measured</td>
              <td data-cell="verdict">{ok ? 'agrees' : reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="notes">
        {rows
          .filter(({check}) => check.note !== undefined)
          .map(({check}) => (
            <li key={check.id}>
              <code>{check.id}</code> — {check.note}
            </li>
          ))}
      </ul>
    </main>
  );
}
