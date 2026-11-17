// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useId, useState} from 'react';
import {Card} from '@astryxdesign/core/Card';
import {Field, fieldInputWrapperClassName} from '@astryxdesign/core/Field';
import type {FieldStatusPlacement, InputStatus} from '@astryxdesign/core/Field';
import {useInputStatusIcon} from '@astryxdesign/core/hooks';
import {VStack} from '@astryxdesign/core/Layout';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Text} from '@astryxdesign/core/Text';
import {tw} from '@astryxdesign/core/utils';

const VALID_CODE = 'SAVE20';

const styles = {
  /*
   * The published box draws the border, its status colour and both rings; the
   * demo widens its inline padding to the third spacing step.
   */
  field: 'px-[var(--spacing-3)]',
  input:
    'grow min-w-0 border-none bg-transparent text-[color:var(--color-text-primary)] [font:inherit] outline-none',
} as const;

function CouponField({statusVariant}: {statusVariant: FieldStatusPlacement}) {
  const [code, setCode] = useState('SAVE10');
  const inputId = useId();
  const messageId = useId();

  const status: InputStatus | undefined =
    code === ''
      ? undefined
      : code.toUpperCase() === VALID_CODE
        ? {type: 'success', message: 'Code applied: 20% off.'}
        : {type: 'error', message: 'This code is not valid.'};

  // The hook decides what the field shows for this status and variant, and
  // returns the id of its tooltip only when that tooltip is in the DOM.
  const {statusIcon, describedBy} = useInputStatusIcon({
    status,
    statusVariant,
  });

  // `attached` and `detached` carry the text in a message box under the field;
  // `tooltip` carries it in the hook's tooltip instead.
  const hasMessageBox =
    statusVariant !== 'tooltip' && !!status && !!status.message;
  const ariaDescribedBy =
    [hasMessageBox ? messageId : null, describedBy].filter(Boolean).join(' ') ||
    undefined;

  return (
    <Field
      label="Coupon code"
      isLabelHidden
      inputID={inputId}
      status={status && {...status, messageID: messageId}}
      statusVariant={statusVariant}>
      <div
        className={tw(
          fieldInputWrapperClassName({status: status?.type}),
          styles.field,
        )}>
        <input
          id={inputId}
          type="text"
          aria-invalid={status?.type === 'error' || undefined}
          aria-describedby={ariaDescribedBy}
          placeholder="Enter a coupon code"
          value={code}
          onChange={e => setCode(e.target.value)}
          className={styles.input}
        />
        {statusIcon}
      </div>
    </Field>
  );
}

export default function UseInputStatusIconHookUsage() {
  const [statusVariant, setStatusVariant] =
    useState<FieldStatusPlacement>('attached');

  return (
    <Card width={360} padding={4}>
      <VStack gap={3}>
        <SegmentedControl
          label="Status variant"
          value={statusVariant}
          onChange={next => setStatusVariant(next as FieldStatusPlacement)}
          size="sm">
          <SegmentedControlItem value="attached" label="Attached" />
          <SegmentedControlItem value="detached" label="Detached" />
          <SegmentedControlItem value="tooltip" label="Tooltip" />
        </SegmentedControl>
        <CouponField statusVariant={statusVariant} />
        <Text type="supporting">
          Type {VALID_CODE} to see the success status.
        </Text>
      </VStack>
    </Card>
  );
}
