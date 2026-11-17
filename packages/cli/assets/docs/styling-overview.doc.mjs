// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs styling-overview`
 *
 * One question: "How do I load CSS, and where does my styling go?"
 * Two layers the packages ship (component classes, theme tokens), the order a
 * page loads them in, and the three ways to style: a class, a token, `xstyle`.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  name: 'styling-overview',
  title: 'Styling overview',
  category: 'guide',
  description:
    'Which stylesheets to load, the order they land in, and when to style with a class, a token, or the xstyle escape hatch.',
  keywords: [
    'styling',
    'CSS',
    'setup',
    'imports',
    'classes',
    'Tailwind',
    'astryx-tailwind.css',
    'globals.css',
  ],

  sections: [
    {
      id: 'what-ships',
      title: 'What a component ships',
      content: [
        {
          type: 'prose',
          text: 'A component carries literal utility classes, and the package stylesheet already holds the declaration behind each one. Nothing about a component is styled at runtime: no CSS-in-JS call, no injected sheet, no build step in your app. `<Stack gap={2}>` renders `flex flex-col gap-2`, and `.gap-2` is in the stylesheet you import.',
        },
        {
          type: 'prose',
          text: 'Those classes read design tokens as CSS custom properties, and the theme declares them. The package declares no token value of its own, so switching theme or color mode changes what every class computes to with no stylesheet rebuilt.',
        },
      ],
    },
    {
      id: 'load',
      title: 'Load the stylesheets',
      content: [
        {
          type: 'code',
          lang: 'bash',
          label: 'Install',
          code: '{@pm install @astryxdesign/core @astryxdesign/theme-neutral}',
        },
        {
          type: 'code',
          lang: 'css',
          label: 'globals.css',
          code: `@import "@astryxdesign/core/reset.css";
@import "@astryxdesign/core/astryx.css";
@import "@astryxdesign/core/astryx-tailwind.css";
@import "@astryxdesign/theme-neutral/theme.css";`,
        },
        {
          type: 'prose',
          text: 'Core ships two component stylesheets: `astryx-tailwind.css` for the components whose own styles are utility classes, and `astryx.css` for the ones still on the previous stylesheet. Load both in that slot. They register the same layer order and put every rule in the same `astryx-base` layer, so order between them does not matter. Swap `theme-neutral` for any theme package (`{@command theme list}` shows what is available).',
        },
        {
          type: 'prose',
          text: 'Done. Style with `className`, `style`, or `xstyle`. A page that skips these imports renders unstyled markup: the classes reach the DOM and no rule exists for them.',
        },
      ],
    },
    {
      id: 'order',
      title: 'The order a page needs',
      content: [
        {
          type: 'table',
          headers: ['Layer', 'Who writes rules there', 'Load'],
          rows: [
            [
              '`reset`',
              'Cross-browser reset, zero specificity.',
              '`reset.css`',
            ],
            [
              '`astryx-base`',
              'Every component class in the packages you use.',
              '`astryx.css`, `astryx-tailwind.css`',
            ],
            [
              '`astryx-theme`',
              'The active theme: token values and any component override it makes.',
              '`theme.css`',
            ],
            [
              'Your slots',
              'Your own CSS, CSS Modules, and Tailwind utilities.',
              'after `theme.css`',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'Declare the order once, before the imports, so your layer wins over a component class on the same element. On the Tailwind path, the slots are Tailwind\u2019s own `theme`, `base`, `components`, and `utilities`; {@link generic:tailwind} gives that file.',
        },
        {
          type: 'code',
          lang: 'css',
          label: 'globals.css',
          code: `@layer reset, astryx-base, astryx-theme, app;

@import "@astryxdesign/core/reset.css";
@import "@astryxdesign/core/astryx.css";
@import "@astryxdesign/core/astryx-tailwind.css";
@import "@astryxdesign/theme-neutral/theme.css";
@import "./app.css" layer(app);`,
        },
        {
          type: 'prose',
          text: '`className` and `style` are unlayered, so they need no slot in this statement: a class you pass is appended after the component\u2019s own classes and beats them.',
        },
      ],
    },
    {
      id: 'choose',
      title: 'A class, a token, or xstyle',
      content: [
        {
          type: 'table',
          headers: ['You want', 'Use', 'Example'],
          rows: [
            [
              'A different value from the one the props offer',
              '`className` with a utility class or your own class',
              '`className="rounded-[var(--radius-element)]"`',
            ],
            [
              'Your own card, panel, or page chrome',
              'A token in your CSS',
              '`background: var(--color-background-card);`',
            ],
            [
              'A component-specific override, kept from existing code',
              '`xstyle`',
              '`<Card xstyle={styles.tight} />`',
            ],
            [
              'A value nobody can name as a class, such as a computed width',
              'A class that reads a custom property, plus the property on the element',
              '`className="w-[var(--panel-width)]"`',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'Reach for props first: a step, an axis, or a variant the component already offers computes the class for you, and it is the only form that follows a theme change. A token in your own CSS is next. `xstyle` is the last resort, because it carries a StyleX style, is kept for one release, and is not a path to build new code on.',
        },
        {
          type: 'prose',
          text: 'A value the props do not cover stays in a class: put the value in a custom property on the element and read it from a class. An inline declaration instead would beat every class a caller passes, including a media-query override. {@link generic:styling-basics} shows both forms.',
        },
      ],
    },
    {
      id: 'what-each-file-does',
      title: 'What each import does',
      content: [
        {
          type: 'table',
          headers: ['Import', 'Layer', 'Purpose'],
          rows: [
            [
              'reset.css',
              'reset',
              'Cross-browser reset (box-sizing, margins, color-scheme). Zero specificity via :where().',
            ],
            [
              'astryx.css',
              'astryx-base',
              'Prebuilt component styles for the components still on the previous stylesheet. Required today.',
            ],
            [
              'astryx-tailwind.css',
              'astryx-base',
              'Prebuilt utility classes, and the declarations behind them, for the components styled that way. Required today.',
            ],
            [
              'theme.css',
              'astryx-theme',
              'Design tokens (colors, spacing, radius, typography) as CSS custom properties. Swap the package for a different theme.',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'Every Astryx package whose components carry styles ships its own stylesheet for each form. Import the ones for the packages you use; all of them put their rules in the same `astryx-base` layer, so a theme override still wins over every package.',
        },
      ],
    },
    {
      id: 'further-reading',
      title: 'Further reading',
      content: [
        {
          type: 'list',
          style: 'unordered',
          items: [
            '{@link generic:styling-basics} \u2014 worked examples: className, xstyle, a per-instance value, rest props.',
            '{@link generic:tokens-and-setup} \u2014 the token table, and the stylesheet each package names.',
            '{@link namespace:styling-libraries} \u2014 Tailwind, Panda, Chakra, MUI, CSS Modules, and non-CSS token resolution.',
            '{@link generic:use-a-theme} \u2014 applying themes, dark mode, nested themes. {@link generic:author-a-theme} \u2014 defineTheme, overrides, production builds.',
          ],
        },
      ],
    },
  ],
};
