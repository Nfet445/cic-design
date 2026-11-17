// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs styling-libraries/css-and-tailwind`: the integration
 * principle, plain CSS / CSS Modules, and Tailwind utilities that read the
 * system's tokens.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'css-and-tailwind',
  title: 'CSS & Tailwind',
  placement: {parent: 'namespace:styling-libraries', slot: 'guides', order: 10},
  category: 'guide',
  description:
    'The integration principle, plain CSS / CSS Modules, and Tailwind utilities over the system tokens.',

  sections: [
    {
      title: 'Core Principle',
      content: [
        {
          type: 'prose',
          text: 'Keep the system as the source of truth for theme values. Components carry Tailwind utility classes that read design tokens from CSS custom properties such as `--color-text-primary`, `--color-background-card`, `--spacing-4`, and `--radius-container`. Other styling libraries should map their own semantic tokens, utility names, or theme objects to those system CSS variables whenever possible.',
        },
        {
          type: 'prose',
          text: 'Use CSS variables for ordinary DOM styling because they inherit through the tree, follow `data-theme` color mode, respect nested `data-astryx-theme` scopes, and update when themes switch. Use token resolver APIs only for non-CSS consumers such as SVG attribute values, canvas, chart configuration, color calculations, or static config generation.',
        },
        {
          type: 'prose',
          text: 'For available token names and values, run {@link namespace:tokens}. Focused references are also available with {@link generic:color}, {@link generic:spacing}, {@link generic:shape}, {@link namespace:typography}, {@link generic:elevation}, and {@link generic:motion}.',
        },
      ],
    },
    {
      title: 'Choose an Integration Path',
      content: [
        {
          type: 'prose',
          text: 'Choose the narrowest integration path that fits the styling library. Most DOM styling should stay on the CSS-variable path; JavaScript token resolution is for APIs that cannot consume CSS custom properties.',
        },
        {
          type: 'table',
          headers: ['Path', 'Use when', 'Value shape'],
          rows: [
            [
              'The component classes',
              'You style a component with its own props, or override one class',
              '`className="rounded-[var(--radius-element)]"`',
            ],
            [
              'CSS variable aliases',
              'The library ultimately writes CSS and accepts string values',
              '`var(--color-text-primary)`',
            ],
            [
              'Tailwind utilities backed by tokens',
              'You write your own markup and want utility classes on the system tokens',
              '`text-primary bg-surface gap-2`',
            ],
            [
              'Design token resolver APIs',
              'JavaScript needs token values for charts, canvas, SVG, or config objects',
              "`resolveThemeToken(theme, '--color-data-categorical-blue', {mode})`",
            ],
          ],
        },
      ],
    },
    {
      title: 'Best Practices',
      content: [
        {
          type: 'list',
          style: 'do',
          items: [
            'Map by semantic intent: text, surface, border, accent, status, radius, spacing, typography.',
            'Let the system own color mode. The root Theme syncs `data-theme="light|dark"` and `data-astryx-theme` to `<html>` for portals and first-level theme scope.',
            'Prefer CSS variables for runtime theme switching and nested themes.',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            'Copy raw hex/px values into a second theme object when a `var(...)` reference would work.',
            'Run a second unsynchronized dark-mode provider that disagrees with Theme.',
            "Make another library's CSS variables the source of truth for the system. Some consumers need token values outside the DOM.",
          ],
        },
      ],
    },
    {
      title: 'Plain CSS and CSS Modules',
      content: [
        {
          type: 'prose',
          text: 'The simplest integration is direct CSS variable usage. CSS Modules scope class names, but system token variables are global/inherited values supplied by the theme stylesheet.',
        },
        {
          type: 'code',
          lang: 'css',
          label: 'Card.module.css',
          code: `.card {
  background: var(--color-background-card);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-container);
  padding: var(--spacing-4);
}`,
        },
        {
          type: 'prose',
          text: 'Sass variables are compile-time only. They are useful for generating static CSS, but they do not update when the system switches theme or color mode. Use native CSS custom properties for themeable values.',
        },
      ],
    },
    {
      title: 'Tailwind',
      content: [
        {
          type: 'prose',
          text: 'A component ships its classes in the same stylesheet you load. `@astryxdesign/core/astryx-tailwind.css` holds them inside `@layer astryx-base`, so your own utilities, which Tailwind writes in `utilities` above it, win on the same element without a specificity trick. Tokens reach both sides: a component class and your `bg-surface` or `gap-2` read the same custom properties, so a theme switch changes what every one of them computes to.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Your utilities beside a component',
          code: `<div className="flex flex-col gap-4">
  <div className="rounded-[var(--radius-container)] bg-surface p-4 text-primary">
    ...
  </div>
  <Button label="Save" variant="primary" />
</div>`,
        },
        {
          type: 'prose',
          text: 'Your utility pipeline needs the token mapping only for the token-named utilities you write yourself; {@link generic:tailwind} gives those imports and the layer order. Every class an Astryx component carries is already compiled into the package stylesheet, so a page needs no Astryx build step.',
        },
      ],
    },
    {
      title: 'Overriding a Component',
      content: [
        {
          type: 'prose',
          text: '`className` is appended after the classes the component writes, and your class is unlayered, so it wins over any declaration a component class sets — no `!important`. For one property on one element this is the whole override:',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'One class, one override',
          code: `<Card className="rounded-[var(--radius-element)]">...</Card>`,
        },
        {
          type: 'prose',
          text: '`xstyle` still renders a StyleX style, and is kept for one release for existing code. It carries no cascade layer, so it wins over every class, including a component class and your own utility. New code overrides with `className`.',
        },
        {
          type: 'prose',
          text: 'A value you compute per instance never goes in an inline declaration, which would beat every class a caller passes. Set a custom property on the element and read it from a class instead; {@link generic:styling-basics} has the worked example.',
        },
      ],
    },
  ],
};
