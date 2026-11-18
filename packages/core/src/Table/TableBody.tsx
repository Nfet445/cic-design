// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';
import type React from 'react';
import type {ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import {mergeProps} from '../utils';
import {xstyleProps} from '../utils/xstyle';
import {themeProps} from '../utils/themeProps';

export interface TableBodyProps extends BaseProps<HTMLTableSectionElement> {
  ref?: React.Ref<HTMLTableSectionElement>;
  children: ReactNode;
}

export function TableBody({
  ref,
  children,
  xstyle,
  className,
  style,
  ...rest
}: TableBodyProps) {
  return (
    <tbody
      ref={ref}
      {...mergeProps(
        themeProps('table-body'),
        xstyleProps(xstyle),
        className,
        style,
      )}
      {...rest}>
      {children}
    </tbody>
  );
}
TableBody.displayName = 'TableBody';
