// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs styling/styling-basics`: what a component's classes are,
 * the className and style merge order, a per-instance value as a class plus a
 * custom property, the xstyle escape hatch, and rest props.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'styling-basics',
  title: 'Basics',
  placement: {parent: 'namespace:styling', slot: 'guides', order: 10},
  category: 'guide',
  description:
    'What a component\u2019s classes are, the className and style merge order, a per-instance value as a class plus a custom property, the xstyle escape hatch, and rest props.',
  keywords: [
    'style',
    'className',
    'classes',
    'rest props',
    'data-testid',
    'ref',
  ],

  sections: [
    {
      title: 'Overview',
      content: [
        {
          type: 'prose',
          text: 'Style a component with its props, then a class on `className`, then a token in your own CSS. All three compute to the same design tokens.',
        },
        {
          type: 'table',
          headers: ['Approach', 'Use for', 'Example'],
          rows: [
            [
              'Component props',
              'A spacing step, an axis, a size, or a variant the component offers',
              '`<Stack gap={2}>`',
            ],
            [
              'className',
              'A property the props do not name, or a class of your own',
              '`<Card className="rounded-[var(--radius-element)]">`',
            ],
            [
              'Tokens in your CSS',
              'Your own markup and page chrome',
              '`background: var(--color-background-card);`',
            ],
            [
              'xstyle',
              'A component-specific override kept from existing code',
              '`<Card xstyle={styles.tight} />`',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'Theming and dark mode work whichever you choose. For other styling libraries, see {@link namespace:styling-libraries}.',
        },
      ],
    },
    {
      title: 'What a Component Renders',
      content: [
        {
          type: 'prose',
          text: 'A component writes literal classes, and the package stylesheet holds the declaration behind each one. Two props, two class sets:',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'The classes two props produce',
          code: `import {Button, Stack, StackItem} from '@astryxdesign/core';

// flex flex-col gap-2
<Stack gap={2}>
  <StackItem>One</StackItem>
  <StackItem>Two</StackItem>
</Stack>

// bg-[var(--color-accent)] text-[var(--color-on-accent)]
<Button label="Save" variant="primary" />`,
        },
        {
          type: 'prose',
          text: 'Each class reads a token, so a theme switch changes what it computes to and nothing is rebuilt. The class set is what a test asserts, and it stays stable: a class exists because the component writes it.',
        },
      ],
    },
    {
      title: 'className and style Props',
      content: [
        {
          type: 'prose',
          text: 'Every component accepts standard `className` and `style` props. `className` is appended after the component\u2019s own classes, and it carries no cascade layer, so a class you pass wins over the class the component set for the same property. `style` is merged last and beats every class, so keep it for a value one element really owns.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'One class, one override',
          code: `import {Card} from '@astryxdesign/core';

// The card's own class sets rounded-[var(--radius-container)];
// this one, appended after it, wins.
<Card className="rounded-[var(--radius-element)]">...</Card>`,
        },
        {
          type: 'prose',
          text: 'For layout and wrapper styling, Tailwind utilities on `className` work well. For a component-specific override, first check whether a prop already offers the value: a prop computes a class the theme still reaches, which a class of your own does not.',
        },
      ],
    },
    {
      title: 'A Value the Props Do Not Cover',
      content: [
        {
          type: 'prose',
          text: 'A per-instance value reaches the DOM two ways, and only the first is safe. A prop that takes the value writes it into a custom property on the element and names a class that reads it: `<Card width={320}>` renders `w-[var(--astryx-card-width)]` and sets `--astryx-card-width: 320px` inline. Nothing is declared inline, so your own class can still override the width.',
        },
        {
          type: 'prose',
          text: 'For your own element, do the same: the value goes in a custom property, the declaration in a class. An inline declaration instead would beat every class you pass, including one you meant to win inside a media query.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'A computed width as a class plus a variable',
          code: `import type {CSSProperties} from 'react';

const panelWidth = '20rem';

<div
  className="w-[var(--app-panel-width)]"
  style={{'--app-panel-width': panelWidth} as CSSProperties}
/>`,
        },
        {
          type: 'prose',
          text: 'Name the variable after its owner, so a second one on the same element cannot collide, and read it from one class only.',
        },
      ],
    },
    {
      title: 'The xstyle Escape Hatch',
      content: [
        {
          type: 'prose',
          text: 'Every component also accepts `xstyle`, which takes a StyleX style from `stylex.create()`, not an inline object and not a class name string. It is kept for one release for code that already passes one, and using it needs a StyleX compiler in your app, so new code should override with `className` instead.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'An override that must win',
          code: `import * as stylex from '@stylexjs/stylex';
import {Card} from '@astryxdesign/core';

const overrides = stylex.create({
  tight: {padding: 'var(--spacing-6)'},
});

<Card xstyle={overrides.tight}>...</Card>`,
        },
        {
          type: 'prose',
          text: 'A StyleX rule carries no cascade layer, so it wins over every class on the element, including a class the component set and one you pass in `className`. That makes it the strongest override, and the one that is hardest for a later reader to see.',
        },
      ],
    },
    {
      title: 'Rest Props (Prop Drilling)',
      content: [
        {
          type: 'prose',
          text: 'Components extend HTML attributes and spread rest props onto their root DOM element. This means data-* attributes, aria-* attributes, event handlers, and other HTML props pass through automatically.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Data attributes, event handlers, and ARIA',
          code: `<Card
  data-testid="user-card"
  data-user-id={user.id}
  onMouseEnter={handleHover}
  aria-label="User profile card"
>
  ...
</Card>`,
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Ref forwarding',
          code: `const cardRef = useRef<HTMLDivElement>(null);
<Card ref={cardRef}>...</Card>`,
        },
        {
          type: 'prose',
          text: 'A few HTML attributes are intentionally omitted from the base type (contentEditable, dangerouslySetInnerHTML). children is not in the base type either; components that accept children declare it explicitly, so slot-based components don\u2019t silently drop JSX children.',
        },
      ],
    },
  ],
};
