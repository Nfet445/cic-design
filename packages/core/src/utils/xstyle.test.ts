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

const probe = stylex.create({root: {color: 'red'}});

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

  it('states nothing when the consumer states nothing', () => {
    expect(xstyleProps(undefined)).toEqual({});
    expect(xstyleProps('')).toEqual({});
  });
});
