// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file InputGroupText.tsx
 * @input Uses React, StyleX, class map
 * @output Exports InputGroupText component
 * @position Text/icon element rendered inside InputGroup
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/InputGroup/InputGroup.doc.mjs
 * - /packages/core/src/InputGroup/InputGroupText.doc.mjs
 * - /packages/core/src/InputGroup/index.ts
 * - /packages/cli/assets/templates/blocks/components/InputGroup/
 */

import React, {type ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';
import {tw} from '../utils/tw';
import {inputGroupItemProps} from './groupStyles';
import {inputGroupTextClassName} from './inputGroupClasses';
import {textDirectionProps} from '../utils/textDirection';
import {xstyleProps} from '../utils/xstyle';

export interface InputGroupTextProps extends BaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Content to render in the text slot.
   * Can be text or an icon.
   */
  children: ReactNode;
}

/**
 * A prefix or suffix text element for use inside InputGroup.
 *
 * @example
 * ```
 * <InputGroup label="Website">
 *   <InputGroupText>https://</InputGroupText>
 *   <TextInput label="URL" isLabelHidden value={url} onChange={setUrl} />
 * </InputGroup>
 * ```
 */
export function InputGroupText({
  ref,
  children,
  xstyle,
  className,
  style,
  ...rest
}: InputGroupTextProps) {
  // The direction goes on a span inside the cell, not on the cell: the cell's
  // logical corners and border overlap follow the group's direction.
  const {dir} = textDirectionProps(children);
  return (
    <div
      ref={ref}
      {...rest}
      {...inputGroupItemProps}
      {...mergeProps(
        themeProps('input-group-text'),
        xstyleProps(xstyle),
        tw(inputGroupTextClassName, className),
        style,
      )}>
      {dir == null ? children : <span dir={dir}>{children}</span>}
    </div>
  );
}

InputGroupText.displayName = 'InputGroupText';
