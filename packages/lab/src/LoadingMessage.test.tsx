// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render} from '@testing-library/react';
import {LoadingMessage} from './LoadingMessage';
import {loadingMessageClassName} from './loadingMessageClasses';

describe('LoadingMessage', () => {
  it('styles the ring and its words through the class map', () => {
    const {container} = render(<LoadingMessage label="Loading" />);
    expect(container.firstElementChild?.className).toBe(
      loadingMessageClassName,
    );
  });
});
