// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file no-invisible-class.js
 * @description Flags Tailwind class text the stylesheet scanner cannot read,
 * so a class that never reaches the sheet fails lint instead of failing
 * silently in the browser.
 *
 * The build compiles the utility sheet from the class text it finds in
 * `packages/<package>/src/**\/*Classes.ts` (`@source` in
 * `packages/core/tailwind/astryx.input.css`). Two shapes produce a class the
 * component applies but the sheet never declares, and neither is a type error,
 * a test failure, or a console warning:
 *
 *   1. class text with an interpolation. The scanner reads source text, so
 *      `` `w-[min(var(--spacing-4),var(${VAR}))]` `` is scanned as the literal
 *      fragment `w-[min(var(--spacing-4),var(` and emits nothing.
 *   2. class text outside a `*Classes.ts` file. The glob never opens the file,
 *      so `const MIRROR = 'rtl:[transform:scaleX(-1)]'` in a component ships a
 *      class with no rule behind it.
 *
 * Bad:
 *   const length = `w-[min(var(--spacing-4),var(${PANE_LENGTH_VAR}))]`;
 *   const RTL_MIRROR = 'rtl:[transform:scaleX(-1)]'; // in Calendar.tsx
 *
 * Good:
 *   const length = 'w-[min(var(--spacing-4),var(--astryx-pane-length))]';
 *   import {RTL_MIRROR_CLASS} from '../utils/rtlClasses';
 *
 * Scope — the rule only reports text it can tell is class text, so a style
 * string that builds an inline custom property (`${width}px`) stays quiet:
 *   - an interpolated template literal only when it is class text by
 *     contract — it initializes a `*Class`-named binding, it is an argument of
 *     `tw()`, it carries an arbitrary value (`w-[…]`, `[&:hover]:…`), or it
 *     interpolates the variant itself (`` `${selector}:cursor-default` ``);
 *   - a plain string only outside a class map, and only when it carries that
 *     same Tailwind syntax, so plain prose and plain utilities are left alone.
 *
 * CSS text in a template literal (a `::highlight()` rule, an attribute
 * selector, a theme descriptor) carries none of those shapes and stays quiet.
 * One shape stays out of reach by design: a bare local const that interpolates
 * inside an arbitrary value and is never passed to `tw()`. The rule cannot tell
 * that string from a CSS declaration without guessing, so the sheet test's
 * coverage assertion is the backstop there.
 *
 * Tests, docs and the deprecated `*.stylex.ts` modules are out of scope: the
 * first two never ship a class, and a StyleX module's class text is written by
 * its own compiler.
 */

/** Files the sheet scanner reads: the class maps. */
const CLASS_MAP_FILE = /\/[^/]*Classes\.tsx?$/;

/** Files whose strings never ship as class text. */
const IGNORED_FILE =
  /(?:\.test\.tsx?$|\.testing\.tsx?$|\/__tests__\/|\.doc\.mjs$|\.stylex\.tsx?$|\.stories\.tsx?$)/;

/** Tailwind syntax inside one literal fragment: an arbitrary value or variant. */
const ARBITRARY_VALUE = /-[[]|:\[/;

/**
 * A variant spelled as an interpolation: `` `${SELECTOR}:cursor-default` ``.
 * A selector fragment (`:where(:hover)`) or a label (`:value:`) carries a
 * bracket or a stray colon and stays quiet.
 */
const INTERPOLATED_VARIANT =
  /^:(?:\[[^\]]*\]|[a-z][a-z0-9]*(?:-[a-z0-9]+)*)\s?$/;

/** An identifier that names class text by contract. */
const CLASS_IDENTIFIER = /(?:Class|ClassName|Classes)$/;

/** Class text in a whole string: a variant or an arbitrary property. */
const CLASS_TOKEN =
  /(?:^|[\s"'])-?[a-z][a-z0-9-]*:\[[^\]]+\]|\[[a-z-]+:[^\]]+\]/;

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow Tailwind class text the stylesheet scanner cannot read',
    },
    schema: [],
    messages: {
      interpolation:
        'This class text never reaches the stylesheet: the scanner reads literal source, so `{{fragment}}` is what it sees. Write every class in full and pass the value as an inline custom property.',
      outsideMap:
        'Class text is only scanned in a `*Classes.ts` file, so `{{value}}` ships with no rule behind it. Move it into the component class map.',
    },
  },

  create(context) {
    const filename = context.filename ?? context.getFilename();
    if (IGNORED_FILE.test(filename)) {
      return {};
    }
    const inMap = CLASS_MAP_FILE.test(filename);

    function reportInterpolation(node) {
      if (node.parent?.type === 'TSLiteralType') {
        return;
      }
      if (node.expressions.length === 0) {
        return;
      }
      const parent = node.parent;
      const namesClass =
        (parent?.type === 'VariableDeclarator' &&
          parent.id?.type === 'Identifier' &&
          CLASS_IDENTIFIER.test(parent.id.name)) ||
        (parent?.type === 'CallExpression' &&
          parent.callee?.type === 'Identifier' &&
          (parent.callee.name === 'tw' || parent.callee.name === 'mergeProps'));
      const fragment = node.quasis.find(
        (quasi, index) =>
          ARBITRARY_VALUE.test(quasi.value.cooked ?? '') ||
          (index > 0 && INTERPOLATED_VARIANT.test(quasi.value.cooked ?? '')),
      );
      if (fragment == null && !namesClass) {
        return;
      }
      context.report({
        node,
        messageId: 'interpolation',
        data: {fragment: (fragment ?? node.quasis[0]).value.cooked ?? ''},
      });
    }

    function reportOutsideMap(node, value) {
      if (inMap || !CLASS_TOKEN.test(value)) {
        return;
      }
      context.report({node, messageId: 'outsideMap', data: {value}});
    }

    return {
      TemplateLiteral: reportInterpolation,
      Literal(node) {
        if (node.parent?.type === 'TSLiteralType') {
          return;
        }
        if (typeof node.value !== 'string') {
          return;
        }
        reportOutsideMap(node, node.value);
      },
    };
  },
};

export default rule;
