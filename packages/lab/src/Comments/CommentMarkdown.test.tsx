// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render} from '@testing-library/react';
import {CommentMarkdown} from './CommentMarkdown';
import {commentMarkdownImageClassName} from './commentMarkdownClasses';

describe('CommentMarkdown', () => {
  it('dresses a body image with the class map and its focus ring', () => {
    const {container} = render(
      <CommentMarkdown body="![A cat](cat.png)" agentCommands={[]} />,
    );
    const image = container.querySelector('img[data-comment-image]');
    expect(image).not.toBeNull();
    const classes = image?.className ?? '';
    expect(classes).toContain(commentMarkdownImageClassName);
    expect(classes).not.toBe(commentMarkdownImageClassName);
  });
});
