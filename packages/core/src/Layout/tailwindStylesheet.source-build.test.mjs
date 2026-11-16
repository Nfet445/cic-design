// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tailwindStylesheet.source-build.test.mjs
 * @input Uses the Tailwind build script, the layout class maps, and the shared
 *   stylesheet harness in `__tests__/classNameAssertions`
 * @output Verifies the shipped stylesheet declares what the components can
 *   emit: every class the family's maps produce has a rule, the sheet stays
 *   inside its size gate, the rules sit in `astryx-base`, and no theme
 *   variable is declared
 * @position Cases for the declaration half of the styling contract (FR8,
 *   FR10); the components' own tests assert the class set
 */

import {buildAstryxTailwindCss} from '../../scripts/build-css-tailwind.mjs';
import {
  describeTailwindStylesheet,
  stylesheetOf,
} from '../__tests__/classNameAssertions';
import {
  buttonClassName,
  buttonForcedColorsEdgeClassName,
  buttonPressClassName,
} from '../Button/buttonClasses';
import {buttonGroupClassName} from '../ButtonGroup/buttonGroupClasses';
import {centerClassName, centerSizingClassName} from '../Center/centerClasses';
import {gridClassName, gridSpanClassName} from '../Grid/gridClasses';
import {paddingEdgeClassName} from '../Layout/paddingClasses';
import {stackClassName} from '../Stack/stackClasses';
import {stackItemClassName} from '../Stack/stackItemClasses';
import {tableHeaderCellClassName} from '../Table/tableHeaderCellClasses';
import {toggleButtonClassName} from '../ToggleButton/toggleButtonClasses';
import {toggleButtonGroupClassName} from '../ToggleButton/toggleButtonGroupClasses';
import {describe, expect, it} from 'vitest';

const sheet = await buildAstryxTailwindCss();
const stylesheet = stylesheetOf(sheet);

/**
 * Gzip size of `packages/core/dist/astryx.css` — 286 069 B raw — as built at
 * `f35022021`: 42 331 B at zlib level 9. The gate allows 1.15× this, so the
 * sheet may not pass 48 680 B gzipped.
 */
const STYLEX_GZIP_BASELINE = 42_331;
const STYLEX_BASELINE_COMMIT = 'f35022021';

/**
 * Every class string the family can produce, read from the maps the
 * components call, so a class added to a map without a matching rule fails
 * here rather than in a browser.
 */
function familyClassNames() {
  const names = new Set();
  const add = value => {
    for (const className of value.split(/\s+/)) {
      if (className !== '') {
        names.add(className);
      }
    }
  };

  for (const direction of ['horizontal', 'vertical']) {
    for (const wrap of ['nowrap', 'wrap', 'wrap-reverse']) {
      for (const scrollable of [false, true]) {
        add(
          stackClassName({
            crossAlign: 'center',
            direction,
            gap: 2,
            mainAlign: 'between',
            scrollable,
            wrap,
          }),
        );
      }
    }
  }
  for (const size of ['fill', 'static']) {
    add(
      stackItemClassName({crossAlignSelf: 'stretch', scrollable: true, size}),
    );
  }
  add(
    gridClassName({
      align: 'stretch',
      columnGap: 10,
      gap: 3,
      justify: 'end',
      rowGap: 0.5,
    }),
  );
  add(gridClassName({align: 'start', gap: 0, justify: 'center', rowGap: 8}));
  add(gridSpanClassName);
  add(centerClassName({axis: 'horizontal', isInline: true}));
  add(centerClassName({axis: 'vertical', isInline: false}));
  add(centerSizingClassName({height: 120, maxWidth: '50%', width: 300}));
  add(
    paddingEdgeClassName({
      paddingBlockEnd: 10,
      paddingBlockStart: 0.5,
      paddingInlineEnd: 1.5,
      paddingInlineStart: 4,
    }),
  );

  for (const variant of ['primary', 'secondary', 'ghost', 'destructive']) {
    for (const size of ['sm', 'md', 'lg']) {
      for (const elevation of ['none', 'low', 'med', 'high']) {
        add(
          buttonClassName({
            elevation,
            isGrouped: false,
            isIconOnly: false,
            isInactive: false,
            isTrulyDisabled: false,
            orientation: 'horizontal',
            size,
            variant,
          }),
        );
      }
    }
    add(
      buttonForcedColorsEdgeClassName({
        isError: variant === 'destructive',
        isGrouped: true,
        isSolid: variant === 'primary' || variant === 'destructive',
        orientation: 'vertical',
      }),
    );
  }
  add(buttonPressClassName());
  add(
    buttonClassName({
      elevation: 'none',
      isGrouped: true,
      isIconOnly: true,
      isInactive: true,
      isTrulyDisabled: true,
      orientation: 'vertical',
      size: 'lg',
      variant: 'ghost',
    }),
  );
  add(
    buttonGroupClassName({
      elevation: 'med',
      orientation: 'vertical',
      tracksPress: true,
    }),
  );
  add(toggleButtonClassName({isPressed: true}));
  add(toggleButtonGroupClassName({orientation: 'vertical', tracksPress: true}));

  for (const density of ['compact', 'balanced', 'spacious']) {
    for (const hasColumnDivider of [false, true]) {
      for (const hasContextMenu of [false, true]) {
        add(
          tableHeaderCellClassName({
            density,
            hasColumnDivider,
            hasContextMenu,
          }),
        );
      }
    }
  }

  return [...names].sort();
}

describeTailwindStylesheet({
  name: 'dist/astryx-tailwind.css',
  css: sheet,
  classNames: familyClassNames(),
  stylexGzipBaseline: STYLEX_GZIP_BASELINE,
  stylexBaselineCommit: STYLEX_BASELINE_COMMIT,
});

describe('dist/astryx-tailwind.css declarations', () => {
  it('prints the core banner before the layer order', () => {
    expect(
      stylesheet.compact.startsWith(
        '/*AstryxCorePre-compiledTailwindCSS—layoutprimitives*//*Auto-generated.Donoteditmanually.*/@layerreset,astryx-base,astryx-theme;',
      ),
    ).toBe(true);
  });

  it('stays within the budget of its class maps', () => {
    // The layout maps and the words in their comments produce about 120
    // rules; the Button map adds about 115 and the Table header cell map
    // about 30. A scan that reaches component bodies or prose would add
    // hundreds more.
    expect(stylesheet.rules.size).toBeLessThan(320);
    // A Tailwind palette colour or a default font stack belongs to no map:
    // its presence means the build read text no map produced.
    expect(stylesheet.compact).not.toMatch(
      /\.(bg|text|border|ring|fill|stroke)-(red|blue|green|gray|slate|zinc|neutral|stone|amber|lime|emerald|teal|cyan|sky|indigo|violet|purple|fuchsia|pink|rose|white|black)-/,
    );
    expect(stylesheet.compact).not.toMatch(/font-(sans|serif|mono)\b/);
  });

  it('keeps token utilities inside the astryx-base layer', () => {
    const layerStart = stylesheet.compact.indexOf('@layerastryx-base{');
    expect(layerStart).toBeGreaterThan(-1);
    expect(stylesheet.compact.indexOf('.gap-2{')).toBeGreaterThan(layerStart);
  });

  it('declares token-dependent utilities against the theme variables', () => {
    expect(stylesheet.ruleFor('gap-2')).toBe('gap:calc(var(--spacing-1)*2);');
    expect(stylesheet.ruleFor('py-2')).toBe(
      'padding-block:calc(var(--spacing-1)*2);',
    );
    expect(stylesheet.ruleFor('[padding-block-start:var(--spacing-2)]')).toBe(
      'padding-block-start:var(--spacing-2);',
    );
    expect(
      stylesheet.ruleFor('grid-cols-[var(--astryx-grid-template-columns)]'),
    ).toBe('grid-template-columns:var(--astryx-grid-template-columns);');
  });

  it('draws the header divider and publishes its width', () => {
    // The pinned-column plugin reads the width back to continue the line over
    // the scrolled area, so the cell must declare it, not only draw it.
    expect(
      stylesheet.ruleFor('[--_table-row-divider-width:var(--border-width)]'),
    ).toBe('--_table-row-divider-width:var(--border-width);');
    expect(
      stylesheet.ruleFor('[border-bottom-width:var(--border-width)]'),
    ).toBe('border-bottom-width:var(--border-width);');
  });

  it('zeroes the column divider only on the last cell of a row', () => {
    // The base and the override are separate classes in the same layer, so the
    // `last:` variant has to win on specificity rather than on sheet order.
    expect(stylesheet.blockOf('last:[border-inline-end-width:0]')).toContain(
      '&:last-child{border-inline-end-width:0;}',
    );
  });

  it('keeps a state class later than the base declaration it overrides', () => {
    // `ToggleButton` shifts its label to semibold over Button's medium. Both
    // are arbitrary-property classes in the same layer, so the sheet order,
    // not the class attribute, decides: the shift must come after.
    expect(
      stylesheet.compact.indexOf('font-weight:var(--font-weight-semibold)'),
    ).toBeGreaterThan(
      stylesheet.compact.indexOf('font-weight:var(--font-weight-medium)'),
    );
  });

  it('lets a pressed toggle outrank the ghost surface it overrides', () => {
    // The ghost Button paints `bg-transparent`; the pressed overlay is a
    // different class in the same layer, so it carries the `aria-pressed`
    // variant to win on specificity. Without the variant the sheet order
    // decides, and the overlay loses in a browser.
    const pressed = stylesheet.blockOf(
      'aria-pressed:bg-[var(--color-overlay-pressed)]',
    );
    expect(pressed).toContain('&[aria-pressed="true"]');
    expect(pressed).toContain('background-color:var(--color-overlay-pressed)');
  });

  it('declares no theme variable of its own', () => {
    // `reference` keeps the declarations with the consumer's theme.
    expect(stylesheet.compact).not.toContain(':root{');
    expect(stylesheet.compact).not.toMatch(/--spacing-1:/);
  });
});
