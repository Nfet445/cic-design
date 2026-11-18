// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file reducedMotionValues.test.ts
 * @input Core's class map sources and reducedMotionFadeConsts
 * @output Every Reduce Motion fade arm that spells the cross-fade's duration
 *   or curve as a literal spells reducedMotionFadeConsts' value exactly. So
 *   does an arm that caps a theme duration at it.
 * @position Unit test beside reducedMotion.test.ts. A swizzled component
 *   cannot import the internal reducedMotion.stylex.ts, so it spells the
 *   values in its class map. This test keeps them one definition.
 */

import {readdirSync, readFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {describe, expect, it} from 'vitest';
import {
  reducedMotionFadeConsts,
  reducedMotionKeys,
} from './reducedMotion.stylex';

describe("the cross-fade's values spelled in components", () => {
  it('equal reducedMotionFadeConsts wherever a fade arm spells them', () => {
    const root = resolve(__dirname, '..');
    // A class spells the Reduce Motion fade key either as Tailwind's two
    // stacked variants or as the media query itself, written as a variant.
    const spellings = [
      'motion-reduce:pointer-coarse:',
      `[@media_${reducedMotionKeys.fade
        .replace(/^@media /, '')
        .replace(/ and /g, '_and_')
        .replace(/ /g, '_')}]:`,
    ];
    const spelled: string[] = [];
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, {withFileTypes: true})) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== 'node_modules' && entry.name !== '__tests__') {
            walk(path);
          }
        } else if (
          entry.name.endsWith('Classes.ts') &&
          !/\.(test|spec|stories)\.ts$/.test(entry.name)
        ) {
          const source = readFileSync(path, 'utf8');
          for (const spelling of spellings) {
            for (
              let at = source.indexOf(spelling);
              at >= 0;
              at = source.indexOf(spelling, at + 1)
            ) {
              const className = source
                .slice(at + spelling.length)
                .split(/[\s'`]/)[0];
              const duration =
                /(?:duration-\[|\[transition-duration:)([^\]]+)\]/.exec(
                  className,
                )?.[1];
              const easing =
                /(?:ease-\[|\[transition-timing-function:)([^\]]+)\]/.exec(
                  className,
                )?.[1];
              const where = `${path.slice(root.length)}: ${className}`;

              if (duration != null) {
                const ms = /([\d.]+)m?s/.exec(duration)?.[1];
                // A token or a zero duration applies a change at once; it is
                // not a fade.
                if (ms != null && parseFloat(ms) !== 0) {
                  spelled.push(where);
                  if (
                    parseFloat(ms) !==
                    parseFloat(reducedMotionFadeConsts.duration)
                  ) {
                    offenders.push(where);
                  }
                }
              }
              if (easing != null && easing.startsWith('cubic-bezier')) {
                spelled.push(where);
                if (
                  easing.replace(/\s+/g, '') !==
                  reducedMotionFadeConsts.easing.replace(/\s+/g, '')
                ) {
                  offenders.push(where);
                }
              }
            }
          }
        }
      }
    };
    walk(root);
    // A pattern that stopped matching would pass with nothing checked.
    expect(spelled.length).toBeGreaterThan(0);
    expect(offenders).toEqual([]);
  });
});
