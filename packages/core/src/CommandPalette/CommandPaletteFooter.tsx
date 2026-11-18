// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandPaletteFooter.tsx
 * @input Uses React, the class map, Kbd
 * @output Exports CommandPaletteFooter component
 * @position Sub-component; footer with keyboard hints
 *
 * SYNC: When modified, update:
 * - /packages/cli/assets/templates/blocks/components/CommandPalette/ (showcase blocks)
 */

'use client';

import type {ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import {mergeProps} from '../utils';
import {tw} from '../utils/tw';
import {
  commandPaletteFooterClassName,
  commandPaletteFooterHintClassName,
} from './commandPaletteFooterClasses';
import {Kbd} from '../Kbd';
import {themeProps} from '../utils/themeProps';
import {xstyleProps} from '../utils/xstyle';
import {
  registerEnglishFallback,
  useComponentTranslator,
} from '../i18n/useComponentTranslator';
import english from '../i18n/generated-english/CommandPalette/CommandPaletteFooter.generated';

registerEnglishFallback(english);

export interface CommandPaletteFooterProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the footer element. */
  ref?: React.Ref<HTMLDivElement>;

  /**
   * Footer content. When provided, renders custom content instead of default hints.
   * Custom children inherit the footer font treatment (supporting/12px, secondary color).
   * When omitted, renders default keyboard navigation hints using Kbd.
   */
  children?: ReactNode;
}

/**
 * Footer for the command palette showing keyboard navigation hints.
 *
 * When no children are provided, renders default hints using Kbd
 * for arrow keys, Enter to select, and Escape to close.
 *
 * @compositionHint Pass to CommandPalette's `footer` slot.
 *
 * @example
 * ```
 * <CommandPalette
 *   isOpen={isOpen}
 *   onOpenChange={setIsOpen}
 *   searchSource={source}
 *   footer={
 *     <CommandPaletteFooter>
 *       Type to filter available commands.
 *     </CommandPaletteFooter>
 *   }
 * />
 * ```
 */
export function CommandPaletteFooter({
  children,
  ref,
  xstyle,
  className,
  style,
  ...props
}: CommandPaletteFooterProps) {
  const t = useComponentTranslator();

  return (
    <div
      ref={ref}
      {...mergeProps(
        themeProps('command-palette-footer'),
        xstyleProps(xstyle),
        tw(commandPaletteFooterClassName, className),
        style,
      )}
      {...props}>
      {children ?? (
        <>
          <span className={commandPaletteFooterHintClassName}>
            <Kbd keys="up" />
            <Kbd keys="down" />
            {t('@astryx.commandPalette.footer.navigate')}
          </span>
          <span className={commandPaletteFooterHintClassName}>
            <Kbd keys="enter" />
            {t('@astryx.commandPalette.footer.select')}
          </span>
          <span className={commandPaletteFooterHintClassName}>
            <Kbd keys="escape" />
            {t('@astryx.commandPalette.footer.close')}
          </span>
        </>
      )}
    </div>
  );
}

CommandPaletteFooter.displayName = 'CommandPaletteFooter';
