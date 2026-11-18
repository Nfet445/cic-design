// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file xstyle.test.ts
 * @input the consumer override shapes `xstyle` accepts
 * @output the `{className, style}` pair each shape produces
 * @position Guards the one place that classifies `xstyle`; a regression here
 *   silently drops a consumer's override on every component at once.
 */

import * as stylex from '@stylexjs/stylex';
import {describe, expect, it} from 'vitest';
import {xstyleProps} from './xstyle';

const probe = stylex.create({
  root: {color: 'red'},
  dynamic: (width: string) => ({minWidth: width}),
});

// An aliased call stays out of the compiler, so the list reaches `stylex.props`
// as a runtime value.
const runtimeProps = stylex.props;

describe('xstyleProps', () => {
  it('treats a class as a class', () => {
    expect(xstyleProps('my-app-button')).toEqual({className: 'my-app-button'});
  });

  it('treats a style object as inline style, so it wins over any rule', () => {
    const override = {'--button-width': '12rem'} as React.CSSProperties;
    expect(xstyleProps(override)).toEqual({style: override});
  });

  it('still carries a legacy StyleX value to its class', () => {
    const {className, style} = xstyleProps(probe.root);
    expect(className).toBe(stylex.props(probe.root).className);
    expect(style).toBeUndefined();
  });

  it('still carries a dynamic StyleX value, which arrives as a list', () => {
    const value = probe.dynamic('12rem');
    expect(xstyleProps(value)).toEqual(runtimeProps(value));
  });

  it('composes a list left to right, the later entry winning', () => {
    const first = {
      '--button-width': '8rem',
      color: 'blue',
    } as React.CSSProperties;
    const second = {color: 'red'} as React.CSSProperties;
    expect(xstyleProps([first, second])).toEqual({
      style: {'--button-width': '8rem', color: 'red'},
    });
  });

  it('appends a class after a StyleX value so the class still wins', () => {
    const {className} = xstyleProps([probe.root, 'my-app-button']);
    expect(className).toBe(
      `${stylex.props(probe.root).className} my-app-button`,
    );
  });

  it('flattens a nested list', () => {
    expect(
      xstyleProps([
        ['my-app-button', {color: 'red'}],
        undefined,
        'my-app-field',
      ]),
    ).toEqual({className: 'my-app-button my-app-field', style: {color: 'red'}});
  });

  it('states nothing when the consumer states nothing', () => {
    expect(xstyleProps(undefined)).toEqual({});
    expect(xstyleProps('')).toEqual({});
  });
});
