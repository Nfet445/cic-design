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
import {
  fieldAttachedStatusLayerClassName,
  fieldClassName,
  fieldHorizontalLabelAlignClassName,
  fieldHorizontalLabelsClassName,
  fieldInputStatusWrapperClassName,
} from '../Field/fieldClasses';
import {
  fieldDescriptionClassName,
  fieldLabelClassName,
  fieldLabelGroupClassName,
  fieldLabelRowClassName,
  fieldLabelStatusClassName,
  fieldScreenReaderOnlyClassName,
} from '../Field/fieldLabelClasses';
import {inputClearButtonClassName} from '../Field/inputClearButtonClasses';
import {
  textAreaClassName,
  textAreaCounterClassName,
  textAreaEndSlotClassName,
  textAreaSizeClassName,
  textAreaStartIconClassName,
} from '../TextArea/textAreaClasses';
import {
  textInputClassName,
  textInputHeightClassName,
} from '../TextInput/textInputClasses';
import {centerClassName, centerSizingClassName} from '../Center/centerClasses';
import {gridClassName, gridSpanClassName} from '../Grid/gridClasses';
import {
  iconColorClassName,
  iconGlyphClassName,
  iconRegistryClassName,
} from '../Icon/iconClasses';
import {
  checkboxBoxClassName,
  checkboxCheckmarkClassName,
  checkboxIndeterminateClassName,
  checkSlotClassName,
  radioCircleClassName,
  radioDotClassName,
} from '../Indicator/indicatorClasses';
import {
  layoutAutoClassName,
  layoutContentClassName,
  layoutFillClassName,
  layoutFooterDividerClassName,
  layoutFooterInnerClassName,
  layoutFullBleedClassName,
  layoutHeaderDividerClassName,
  layoutHeaderInnerClassName,
  layoutInnerClassName,
  layoutMiddleClassName,
  layoutMiddleContentWidthClassName,
  layoutMiddleQueryClassName,
  layoutOuterClassName,
  layoutPanelClassName,
  layoutPanelCollapseEndClassName,
  layoutPanelCollapseStartClassName,
  layoutPanelDividerEndClassName,
  layoutPanelDividerStartClassName,
  layoutPanelWidthClassName,
  layoutRegionHeightClassName,
  layoutSingleColumnContentClassName,
  layoutSingleEndPanelClassName,
  layoutSinglePanelMiddleClassName,
  layoutSingleStartPanelClassName,
} from '../Layout/layoutClasses';
import {paddingEdgeClassName} from '../Layout/paddingClasses';
import {layerAnimations} from '../Layer/layerAnimationsClasses';
import {layerTextResetClassName} from '../Layer/layerTextResetClasses';
import {layerStructureResetClassName} from '../Layer/layerStructureResetClasses';
import {stackClassName} from '../Stack/stackClasses';
import {stackItemClassName} from '../Stack/stackItemClasses';
import {
  sectionInnerClassName,
  sectionOuterClassName,
} from '../Section/sectionClasses';
import {tableHeaderCellClassName} from '../Table/tableHeaderCellClasses';
import {
  textClassName,
  truncationTooltipContentClassName,
} from '../Text/textClasses';
import {themeWrapperClassName} from '../theme/themeClasses';
import {
  toolbarCenterSlotClassName,
  toolbarEndSlotClassName,
  toolbarGapClassName,
  toolbarLoneEndSlotClassName,
  toolbarLoneStartSlotClassName,
  toolbarRowClassName,
  toolbarSideLaneClassName,
  toolbarStartSlotClassName,
  toolbarTabIndicatorClassName,
} from '../Toolbar/toolbarClasses';
import {mediaThemeClassName} from '../theme/mediaThemeClasses';
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

  // Text answers five axes plus the type scale, so the map is walked axis by
  // axis rather than over its cross product.
  const textBase = {
    color: 'primary',
    display: 'inline',
    justify: 'start',
    maxLines: 0,
    type: 'body',
    wordBreak: 'break-word',
  };
  const textAxes = {
    type: [
      'body',
      'large',
      'label',
      'code',
      'supporting',
      'display-1',
      'display-2',
      'display-3',
      'inherit',
    ],
    color: ['secondary', 'disabled', 'placeholder', 'accent', 'inherit'],
    size: [
      '4xs',
      '3xs',
      '2xs',
      'xsm',
      'sm',
      'base',
      'lg',
      'xl',
      '2xl',
      '3xl',
      '4xl',
    ],
    weight: ['normal', 'medium', 'semibold', 'bold'],
    display: ['block'],
    justify: ['center', 'end'],
    textWrap: ['wrap', 'nowrap', 'balance', 'pretty'],
  };
  for (const [axis, values] of Object.entries(textAxes)) {
    for (const value of values) {
      add(textClassName({...textBase, [axis]: value}));
    }
  }
  for (const maxLines of [1, 3]) {
    for (const wordBreak of ['break-word', 'break-all']) {
      add(textClassName({...textBase, maxLines, wordBreak}));
    }
  }
  add(
    textClassName({
      ...textBase,
      hasCapsize: true,
      hasStrikethrough: true,
      hasTabularNumbers: true,
    }),
  );
  add(truncationTooltipContentClassName);

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

  for (const variant of ['section', 'transparent', 'muted']) {
    for (const dividers of [[], ['top'], ['bottom'], ['start'], ['end']]) {
      add(sectionInnerClassName({dividers, variant}));
    }
  }
  add(sectionOuterClassName({}));
  add(
    sectionOuterClassName({
      height: 200,
      maxWidth: '64rem',
      minHeight: 40,
      width: '100%',
    }),
  );
  for (const gap of [0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10]) {
    for (const hasCenterContent of [false, true]) {
      for (const isVertical of [false, true]) {
        add(toolbarRowClassName({gap, hasCenterContent, isVertical}));
      }
    }
    add(toolbarGapClassName(gap));
    add(toolbarSideLaneClassName({end: false, gap}));
    add(toolbarSideLaneClassName({end: true, gap}));
  }
  add(toolbarCenterSlotClassName());
  add(toolbarStartSlotClassName());
  add(toolbarEndSlotClassName());
  add(toolbarLoneStartSlotClassName());
  add(toolbarLoneEndSlotClassName());
  add(toolbarTabIndicatorClassName());
  // The layout family: the shell frame, then every region combination. A
  // region edge publishes its inset and reads it back, so each combination
  // contributes its own arbitrary-property classes.
  for (const className of [
    layoutOuterClassName,
    layoutInnerClassName,
    layoutFillClassName,
    layoutAutoClassName,
    layoutMiddleClassName,
    layoutMiddleQueryClassName,
    layoutMiddleContentWidthClassName,
    layoutSingleColumnContentClassName,
    layoutSinglePanelMiddleClassName,
    layoutSingleStartPanelClassName,
    layoutSingleEndPanelClassName,
    layoutFullBleedClassName,
    layoutHeaderInnerClassName,
    layoutHeaderDividerClassName,
    layoutFooterInnerClassName,
    layoutFooterDividerClassName,
    layoutRegionHeightClassName,
    layoutPanelWidthClassName,
    layoutPanelDividerEndClassName,
    layoutPanelDividerStartClassName,
    layoutPanelCollapseEndClassName,
    layoutPanelCollapseStartClassName,
  ]) {
    add(className);
  }
  for (const hasHeader of [false, true]) {
    for (const hasFooter of [false, true]) {
      for (const hasStart of [false, true]) {
        for (const hasEnd of [false, true]) {
          add(
            layoutContentClassName({
              hasFooter,
              hasHeader,
              hasStart,
              hasEnd,
              isScrollable: hasStart,
              isZeroPadding: hasEnd,
            }),
          );
          add(
            layoutPanelClassName({
              hasFooter,
              hasHeader,
              isStart: hasStart,
              isEnd: hasEnd,
              isScrollable: hasStart,
              isZeroWidth: hasEnd,
            }),
          );
        }
      }
    }
  }

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

  for (const size of ['sm', 'md']) {
    for (const isDisabled of [false, true]) {
      for (const isChecked of [false, true]) {
        add(checkboxBoxClassName({isChecked, isDisabled, size}));
        add(checkboxCheckmarkClassName({isVisible: isChecked, size}));
        add(checkboxIndeterminateClassName({isVisible: isChecked, size}));
        add(radioCircleClassName({isChecked, isDisabled, size}));
        add(checkSlotClassName({isDisabled}));
      }
    }
    add(radioDotClassName({size}));
  }

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

  // The input field family: the frame, the label slot and the text control.
  for (const isLabelHidden of [false, true]) {
    for (const width of [null, 240, '100%']) {
      add(fieldClassName({isLabelHidden, width}));
    }
    add(fieldLabelGroupClassName({isLabelHidden}));
    add(fieldLabelRowClassName({isLabelHidden}));
    add(
      fieldLabelClassName({
        isDisabled: isLabelHidden,
        isLabelHidden,
      }),
    );
    add(
      fieldDescriptionClassName({
        forwardsClick: isLabelHidden,
        isLabelHidden,
      }),
    );
  }
  for (const className of [
    fieldHorizontalLabelsClassName,
    fieldHorizontalLabelAlignClassName,
    fieldInputStatusWrapperClassName,
    fieldAttachedStatusLayerClassName,
    fieldScreenReaderOnlyClassName,
    fieldLabelStatusClassName,
    inputClearButtonClassName,
  ]) {
    add(className);
  }
  for (const size of ['sm', 'md', 'lg']) {
    add(textInputHeightClassName({size}));
  }
  add(textInputClassName({isDisabled: false}));
  add(textInputClassName({isDisabled: true}));
  for (const size of ['sm', 'md', 'lg']) {
    add(textAreaSizeClassName(size));
  }
  for (const isDisabled of [false, true]) {
    for (const hasStartIcon of [false, true]) {
      for (const hasCounter of [false, true]) {
        // The busy overlay replaces the status icon's inset, so the two never
        // appear together and the pairs below are every reachable overlay.
        for (const [isBusy, hasStatusIcon] of [
          [false, false],
          [false, true],
          [true, true],
        ]) {
          add(
            textAreaClassName({
              isDisabled,
              hasStartIcon,
              hasCounter,
              isBusy,
              hasStatusIcon,
            }),
          );
        }
      }
    }
  }
  add(textAreaStartIconClassName);
  add(textAreaEndSlotClassName);
  for (const isOverLimit of [false, true]) {
    add(textAreaCounterClassName({isOverLimit}));
  }

  // The theme wrapper styles the provider itself, so the modules that style
  // themselves share this sheet and its cover.
  for (const mode of ['light', 'dark', 'system']) {
    for (const reducesMotion of [false, true]) {
      add(themeWrapperClassName({mode, reducesMotion}));
    }
  }
  add(mediaThemeClassName({isActive: true}));
  add(mediaThemeClassName({isActive: false}));
  for (const color of Object.keys(iconColorClassName)) {
    add(iconGlyphClassName(color));
    add(iconRegistryClassName(color));
  }
  for (const placement of ['above', 'below', 'start', 'end']) {
    add(layerAnimations[placement]);
  }
  add(layerTextResetClassName);
  add(layerStructureResetClassName);

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
    // The layout primitives and the words in their comments produce about 190
    // rules, the Button map about 115, the Text map about 65, Section and
    // Toolbar about 40, and the layout shell and region maps about 110. A
    // scan that reaches component bodies or prose would add hundreds more.
    expect(stylesheet.rules.size).toBeLessThan(560);
  });

  it('prints the Text type scale, clamp and wrap tokens', () => {
    expect(stylesheet.ruleFor('text-[length:var(--text-body-size)]')).toBe(
      'font-size:var(--text-body-size);',
    );
    expect(stylesheet.ruleFor('[line-height:var(--text-code-leading)]')).toBe(
      'line-height:var(--text-code-leading);',
    );
    expect(stylesheet.ruleFor('[font-weight:var(--text-body-weight)]')).toBe(
      'font-weight:var(--text-body-weight);',
    );
    expect(
      stylesheet.ruleFor('[-webkit-line-clamp:var(--astryx-text-line-clamp)]'),
    ).toBe('-webkit-line-clamp:var(--astryx-text-line-clamp);');
    expect(
      stylesheet.ruleFor(
        '[overflow-wrap:var(--_astryx-text-overflow-wrap,break-word)]',
      ),
    ).toBe('overflow-wrap:var(--_astryx-text-overflow-wrap,break-word);');
  });

  it('prints the field family utilities', () => {
    // The width a consumer sets travels as a custom property the class reads,
    // so one class serves every width.
    expect(stylesheet.ruleFor('w-[var(--astryx-field-width)]')).toBe(
      'width:var(--astryx-field-width);',
    );
    expect(
      stylesheet.ruleFor(
        '[--_field-status-overlap:calc(var(--size-element-md)_/_2)]',
      ),
    ).toBe('--_field-status-overlap:calc(var(--size-element-md)/2);');
    expect(
      stylesheet.ruleFor(
        '[padding-block-start:calc(var(--border-width)_+_var(--spacing-1))]',
      ),
    ).toBe(
      'padding-block-start:calc(var(--border-width)+var(--spacing-1));',
    );
    expect(stylesheet.ruleFor('h-5')).toBe(
      'height:calc(var(--spacing-1)*5);',
    );
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

  it('draws the section divider on one border width', () => {
    expect(
      stylesheet.ruleFor('[border-top:1px_solid_var(--color-border)]'),
    ).toBe('border-top:1pxsolidvar(--color-border);');
    expect(
      stylesheet.ruleFor('[border-inline-start:1px_solid_var(--color-border)]'),
    ).toBe('border-inline-start:1pxsolidvar(--color-border);');
  });

  it('reads the section size from its inline variable', () => {
    expect(stylesheet.ruleFor('w-[var(--astryx-section-width)]')).toBe(
      'width:var(--astryx-section-width);',
    );
    expect(stylesheet.ruleFor('h-[var(--astryx-section-height)]')).toBe(
      'height:var(--astryx-section-height);',
    );
  });

  it('pulls a nested section out by the container padding it reads', () => {
    expect(
      stylesheet.ruleFor(
        'ms-[calc(-1*var(--container-padding-inline-start,0px))]',
      ),
    ).toBe(
      'margin-inline-start:calc(-1*var(--container-padding-inline-start,0px));',
    );
  });

  it('gives the compensated toolbar lane a basis only in the states that need it', () => {
    const basis = stylesheet.blockOf(
      '[&:has(>_[data-astryx-edge-comp]:first-child)]:[flex-basis:var(--astryx-toolbar-lane-inset)]',
    );
    expect(basis).toContain(
      '&:has(>[data-astryx-edge-comp]:first-child){flex-basis:var(--astryx-toolbar-lane-inset);}',
    );
    expect(stylesheet.ruleFor('[flex-basis:0px]')).toBe('flex-basis:0px;');
    const both = stylesheet.blockOf(
      '[&:has(>_[data-astryx-edge-comp]:first-child):has(>_[data-astryx-edge-comp]:last-child)]:[flex-basis:calc(2*var(--astryx-toolbar-lane-inset))]',
    );
    expect(both).toContain(
      'flex-basis:calc(2*var(--astryx-toolbar-lane-inset));',
    );
  });

  it('sizes the toolbar row to one element height', () => {
    expect(stylesheet.ruleFor('min-h-[var(--size-element-sm)]')).toBe(
      'min-height:var(--size-element-sm);',
    );
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

  it('hands the theme wrappers their color scheme and text treatment', () => {
    // `ruleFor` drops whitespace, so the two-value scheme is read from the
    // raw sheet as well.
    expect(stylesheet.ruleFor('[color-scheme:light_dark]')).toBe(
      'color-scheme:lightdark;',
    );
    expect(stylesheet.css).toContain('color-scheme: light dark;');
    expect(stylesheet.ruleFor('[color-scheme:light]')).toBe(
      'color-scheme:light;',
    );
    expect(stylesheet.ruleFor('[color-scheme:dark]')).toBe(
      'color-scheme:dark;',
    );
    expect(stylesheet.ruleFor('[--_astryx-reduced-motion:1]')).toBe(
      '--_astryx-reduced-motion:1;',
    );
    expect(stylesheet.ruleFor('[color:var(--color-text-primary)]')).toBe(
      'color:var(--color-text-primary);',
    );
    expect(stylesheet.ruleFor('[font-family:var(--font-family-body)]')).toBe(
      'font-family:var(--font-family-body);',
    );
  });

  it('declares the icon size and colour classes', () => {
    // The size step is an inline `--astryx-icon-size` value, and the class
    // reads it as the fallback, so a theme's vars win where a theme sets them.
    expect(
      stylesheet.ruleFor('[width:var(--_icon-width,var(--astryx-icon-size))]'),
    ).toBe('width:var(--_icon-width,var(--astryx-icon-size));');
    expect(
      stylesheet.ruleFor(
        '[height:var(--_icon-height,var(--astryx-icon-size))]',
      ),
    ).toBe('height:var(--_icon-height,var(--astryx-icon-size));');
    expect(
      stylesheet.ruleFor(
        '[font-size:min(var(--_icon-width,var(--astryx-icon-size)),var(--_icon-height,var(--astryx-icon-size)))]',
      ),
    ).toBe(
      'font-size:min(var(--_icon-width,var(--astryx-icon-size)),var(--_icon-height,var(--astryx-icon-size)));',
    );
    expect(stylesheet.ruleFor(iconColorClassName.primary)).toBe(
      'color:var(--color-icon-primary);',
    );
    expect(stylesheet.ruleFor(iconColorClassName.inherit)).toBe(
      'color:inherit;',
    );
  });

  it('draws the indicator box on the spacing step, round by its own radius', () => {
    // The 20 px and 24 px boxes ride the spacing step, so a consumer's
    // `--spacing-1` moves them with the rest of the layout.
    expect(stylesheet.ruleFor('size-5')).toBe(
      'width:calc(var(--spacing-1)*5);height:calc(var(--spacing-1)*5);',
    );
    expect(stylesheet.ruleFor('size-3')).toBe(
      'width:calc(var(--spacing-1)*3);height:calc(var(--spacing-1)*3);',
    );
    expect(stylesheet.ruleFor('rounded-[50%]')).toBe('border-radius:50%;');
    expect(stylesheet.ruleFor('border-[length:var(--border-width)]')).toBe(
      'border-style:var(--tw-border-style);border-width:var(--border-width);',
    );
  });

  it('keeps the indicator marks perceivable under forced colors', () => {
    // A flat Canvas box would hide a painted check or bar, so each mark moves
    // to CanvasText inside the forced palette (WCAG 1.4.11).
    const text = stylesheet.blockOf('forced-colors:text-[color:CanvasText]');
    expect(text).toContain('@media(forced-colors:active)');
    expect(text).toContain('color:CanvasText');
    const bar = stylesheet.blockOf('forced-colors:bg-[color:CanvasText]');
    expect(bar).toContain('@media(forced-colors:active)');
    expect(bar).toContain('background-color:CanvasText');
  });

  it('declares no theme variable of its own', () => {
    // `reference` keeps the declarations with the consumer's theme.
    expect(stylesheet.compact).not.toContain(':root{');
    expect(stylesheet.compact).not.toMatch(/--spacing-1:/);
  });
});

describe('dist/astryx-tailwind.css layer rules', () => {
  it('carries the layer resets below every astryx-base rule', () => {
    // A layer root is promoted, not detached: content opened from inside a
    // component still inherits its text formatting and structural values. The
    // reset therefore sits in a `reset` sublayer of `astryx-base`, where any
    // component rule or caller className on the same element outranks it.
    expect(stylesheet.compact).toContain(
      '@layerreset{.astryx-layer-text-reset{',
    );
    expect(stylesheet.ruleFor(layerTextResetClassName)).toBe(
      'font-family:var(--font-family-body);font-size:var(--text-body-size);font-weight:var(--text-body-weight);line-height:var(--text-body-leading);font-style:normal;text-align:start;text-align-last:auto;text-indent:0;text-transform:none;letter-spacing:normal;word-spacing:normal;text-shadow:none;white-space:normal;word-break:normal;overflow-wrap:normal;hyphens:manual;',
    );
    expect(stylesheet.ruleFor(layerStructureResetClassName)).toBe(
      '--step-connector-gap:initial;--_astryx-text-overflow-wrap:initial;',
    );
  });

  it('carries every entrance keyframe the class map names', () => {
    for (const keyframe of [
      'astryxLayerEnterBelow',
      'astryxLayerEnterAbove',
      'astryxLayerEnterEnd',
      'astryxLayerEnterStart',
      'astryxLayerEnterEndRtl',
      'astryxLayerEnterStartRtl',
      'astryxLayerFadeIn',
    ]) {
      expect(stylesheet.compact, keyframe).toContain(`@keyframes${keyframe}{`);
    }
  });

  it('keeps the entrance arm under the Reduce Motion arms', () => {
    // The arm reaches `animation-name` through a variable, so the Reduce
    // Motion arms only have to come after the declaration that reads it. A
    // direct `animation-name` arm would also have to come after the `rtl:`
    // variant that mirrors it, and the sheet sorts direction variants last.
    const readsTheVariable = stylesheet.compact.indexOf(
      'animation-name:var(--_astryx-layer-enter-animation)',
    );
    expect(readsTheVariable).toBeGreaterThan(-1);
    expect(stylesheet.compact.indexOf('animation-name:none;')).toBeGreaterThan(
      readsTheVariable,
    );
  });

  it('keeps the coarse-pointer fade after the instant arm', () => {
    // Both arms are Reduce Motion matches; only the pointer splits them, so
    // the later one in the sheet wins.
    expect(
      stylesheet.compact.indexOf('animation-name:astryxLayerFadeIn;'),
    ).toBeGreaterThan(stylesheet.compact.indexOf('animation-name:none;'));
  });

  it('mirrors only the horizontal entrance under RTL', () => {
    expect(
      stylesheet.compact.indexOf(
        '--_astryx-layer-enter-animation:astryxLayerEnterEndRtl;',
      ),
    ).toBeGreaterThan(
      stylesheet.compact.indexOf(
        '--_astryx-layer-enter-animation:astryxLayerEnterEnd;',
      ),
    );
    expect(stylesheet.compact).not.toContain('astryxLayerEnterBelowRtl');
  });
});
