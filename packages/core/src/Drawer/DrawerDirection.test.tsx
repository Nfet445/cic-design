// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DrawerDirection.test.tsx
 * @input Drawer closed and open class sets for both logical sides
 * @output Regression coverage for resolved DOM LTR/RTL motion on both logical sides
 * @position Focused direction contract; complements Drawer.test.tsx behavior coverage
 */

import {describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Drawer} from './Drawer';
import {classesOf} from '../__tests__/classNameAssertions';

function closedClasses(): string[] {
  return classesOf(screen.getByRole('dialog', {hidden: true}));
}

/**
 * The sheet's `rtl:` variant expands to `:where(:dir(rtl), [dir="rtl"], [dir="rtl"] *)`,
 * whose descendant arm also matches an element that overrides its ancestor's
 * direction. `:dir()` asks the element for its own resolved direction instead.
 */
const RTL_SELECTOR = '[&:dir(rtl)]';

describe.each([
  {side: 'start' as const, ltr: 'translateX(-100%)', rtl: 'translateX(100%)'},
  {side: 'end' as const, ltr: 'translateX(100%)', rtl: 'translateX(-100%)'},
])('Drawer direction on side=$side', ({side, ltr, rtl}) => {
  it('parks closed on the logical edge its own direction resolves', () => {
    render(
      <Drawer
        isOpen={false}
        onOpenChange={() => {}}
        label="Details"
        side={side}>
        Content
      </Drawer>,
    );
    expect(closedClasses()).toContain(`[transform:${ltr}]`);
    expect(closedClasses()).toContain(`${RTL_SELECTOR}:[transform:${rtl}]`);
  });

  it('leaves a nearer direction override to :dir(), not to an ancestor arm', () => {
    render(
      <div dir="rtl">
        <Drawer
          isOpen={false}
          onOpenChange={() => {}}
          label="Details"
          side={side}
          dir="ltr">
          Content
        </Drawer>
      </div>,
    );
    const classes = closedClasses();
    expect(classes.some(className => className.includes(':dir(rtl)'))).toBe(
      true,
    );
    expect(classes.some(className => className.includes('[dir="rtl"]'))).toBe(
      false,
    );
  });
});
