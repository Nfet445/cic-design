// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Breadcrumbs, BreadcrumbItem} from '@astryxdesign/core/Breadcrumbs';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

// Only a glyph the bidi algorithm does not already flip needs the mirror class.
// U+203A has Unicode Bidi_Mirrored=Yes, so the browser mirrors it under RTL on
// its own and a second flip would point it back the wrong way; U+2192 has
// Bidi_Mirrored=No and stays pointing left-to-right unless we mirror it.
const SEPARATORS = [
  {char: '›', label: 'Chevron', needsRtlMirror: false},
  {char: '→', label: 'Arrow', needsRtlMirror: true},
  {char: '·', label: 'Dot', needsRtlMirror: false},
];

export default function BreadcrumbsCustomSeparator() {
  return (
    <Stack direction="vertical" gap={4}>
      {SEPARATORS.map(({char, label, needsRtlMirror}) => (
        <Stack key={label} direction="vertical" gap={1}>
          <Text type="supporting" color="secondary">
            {label}
          </Text>
          <Breadcrumbs
            separator={
              needsRtlMirror ? (
                <span className="rtl:[transform:scaleX(-1)]">{char}</span>
              ) : (
                char
              )
            }>
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem href="/docs">Docs</BreadcrumbItem>
            <BreadcrumbItem isCurrent>API Reference</BreadcrumbItem>
          </Breadcrumbs>
        </Stack>
      ))}
    </Stack>
  );
}
