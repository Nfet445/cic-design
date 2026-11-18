// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';
import type React from 'react';
import type {ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import {mergeProps} from '../utils';
import {xstyleProps} from '../utils/xstyle';
import {themeProps} from '../utils/themeProps';

export interface TableHeaderProps extends BaseProps<HTMLTableSectionElement> {
  ref?: React.Ref<HTMLTableSectionElement>;
  children: ReactNode;
}

export function TableHeader({
  ref,
  children,
  xstyle,
  className,
  style,
  ...rest
}: TableHeaderProps) {
  return (
    <thead
      ref={ref}
      {...mergeProps(
        themeProps('table-header'),
        xstyleProps(xstyle),
        className,
        style,
      )}
      {...rest}>
      {children}
    </thead>
  );
}
TableHeader.displayName = 'TableHeader';
