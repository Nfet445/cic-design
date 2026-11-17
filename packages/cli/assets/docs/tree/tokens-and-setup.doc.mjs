// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs styling/tokens-and-setup`: the design token groups, the
 * stylesheet each package names, where the theme declares the token values,
 * and keeping Next.js webpack builds small.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'tokens-and-setup',
  title: 'Tokens & Setup',
  placement: {parent: 'namespace:styling', slot: 'guides', order: 30},
  category: 'guide',
  description:
    'The design token groups, the stylesheet each package names, where the token values are declared, and keeping Next.js webpack builds small.',
  keywords: [
    'tokens',
    'setup',
    'stylesheet',
    'Next.js',
    'optimizePackageImports',
    'Server Components',
  ],

  sections: [
    {
      title: 'Design Tokens',
      content: [
        {
          type: 'prose',
          text: 'When writing custom styles, use design tokens instead of hardcoded values. A token is a CSS custom property: it adapts to the active theme and color mode, and a theme package declares its value. The library declares none of them, so a theme switch changes what your styles compute to with no stylesheet rebuilt.',
        },
        {
          type: 'table',
          headers: ['Group', 'Names', 'Example'],
          rows: [
            [
              'Color',
              '`--color-text-*`, `--color-background-*`, `--color-border`, `--color-accent`, `--color-on-*`, status colors',
              '`--color-text-primary`, `--color-background-card`',
            ],
            [
              'Spacing',
              '`--spacing-0` through `--spacing-10`, in `0.25rem` steps',
              '`--spacing-4` is `1rem`',
            ],
            [
              'Radius',
              '`--radius-inner`, `--radius-element`, `--radius-container`, `--radius-page`, `--radius-full`',
              '`--radius-container`',
            ],
            [
              'Shadow',
              '`--shadow-low`, `--shadow-med`, `--shadow-high`, and the inset states',
              '`--shadow-med`',
            ],
            [
              'Size',
              '`--size-element-sm`, `--size-element-md`, `--size-element-lg`',
              '`--size-element-md`',
            ],
            [
              'Typography',
              '`--font-family-*`, `--font-size-*`, `--font-weight-*`, and the `--text-<role>-size|weight|leading` triples',
              '`--text-body-size`, `--font-weight-semibold`',
            ],
          ],
        },
        {
          type: 'code',
          lang: 'css',
          label: 'Tokens in your own CSS',
          code: `.surface {
  padding: var(--spacing-4);
  border-radius: var(--radius-container);
  border: 1px solid var(--color-border);
  background: var(--color-background-card);
  box-shadow: var(--shadow-low);
}`,
        },
        {
          type: 'prose',
          text: 'A token is also what a utility class reads: `p-4` computes to `var(--spacing-4)`, and `bg-surface` to `var(--color-background-surface)`. Writing the token directly and writing the utility class reach the same value, and a theme changes both.',
        },
        {
          type: 'prose',
          text: 'See {@link namespace:tokens} for the full token reference (all spacing, color, radius, shadow, and typography tokens with values). See {@link generic:author-a-theme} for how to override tokens via defineTheme.',
        },
      ],
    },
    {
      id: 'which-stylesheet',
      title: 'Which Stylesheet to Import',
      content: [
        {
          type: 'prose',
          text: 'Every code path loads the same prebuilt stylesheets, and no import compiles Astryx source. Core ships two component stylesheets while both forms of component exist; {@link generic:styling-overview} says which components each one styles, and the order to load them in.',
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
          text: 'A component class is declared once across the two sheets, so loading both never doubles a declaration. {@link generic:styling-overview} gives the layer statement and what loads after the theme.',
        },
        {
          type: 'prose',
          text: 'Pure theming needs no build step: a theme package is the stylesheet you import, and {@link generic:styling-overview} covers a page that loads none.',
        },
      ],
    },
    {
      id: 'nextjs-webpack',
      title: 'Next.js with webpack',
      content: [
        {
          type: 'prose',
          text: 'If your Next.js app builds with webpack (`next build --webpack`), add `@astryxdesign/core` to `experimental.optimizePackageImports`. With webpack, a Server Component that imports from the package root would otherwise ship every client component; this keeps first load to what the page uses. Turbopack, the default bundler in Next.js 16, needs no change, and the setting is safe to keep there.',
        },
        {
          type: 'code',
          lang: 'js',
          label: 'next.config.mjs',
          code: `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@astryxdesign/core'],
  },
};

export default nextConfig;`,
        },
        {
          type: 'prose',
          text: "In Server Components, also import each component from its own entry, for example `import {Button} from '@astryxdesign/core/Button'`. `{@command component <Name>}` prints that entry. Files that start with `'use client'` are not affected.",
        },
      ],
    },
  ],
};
