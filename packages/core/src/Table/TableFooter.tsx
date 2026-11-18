// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';
import type React from 'react';
import type {ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import {mergeProps} from '../utils';
import {xstyleProps} from '../utils/xstyle';
import {themeProps} from '../utils/themeProps';

export interface TableFooterProps extends BaseProps<HTMLTableSectionElement> {
  ref?: React.Ref<HTMLTableSectionElement>;
  children: ReactNode;
}

export function TableFooter({
  ref,
  children,
  xstyle,
  className,
  style,
  ...rest
}: TableFooterProps) {
  return (
    <tfoot
      ref={ref}
      {...mergeProps(
        themeProps('table-footer'),
        xstyleProps(xstyle),
        className,
        style,
      )}
      {...rest}>
      {children}
    </tfoot>
  );
}
TableFooter.displayName = 'TableFooter';
