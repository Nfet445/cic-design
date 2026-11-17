// Copyright (c) Meta Platforms, Inc. and affiliates.
/**
 * @file privateAttributes/menuPressLit.stylex.ts
 * @input The row that a held finger or pen lights in a menu
 * @output Exports markMenuPressLit and clearMenuPressLit, which mark that row,
 *   and isMenuPressLit, which reads the mark. It also re-exports
 *   menuPressLitRowClassName, which paints the marked row. The hold pair,
 *   holdMenuPressPaint and releaseMenuPressPaint, keeps the other rows off
 *   their pressed paint, and isMenuPressPaintHeld reads that hold.
 * @position Owner module of the private menu-press-lit attribute: the only
 *   file that writes its name. The menu press model (hooks/useMenuPress.ts)
 *   marks the row; DropdownMenu's rows compose the styles. No package entry
 *   exports it.
 *
 * SYNC: Each row that composes menuPressLitRowClassName reads
 *   `--_menu-row-focus-paint` in its `:focus` background, and a row with an
 *   `:active` background reads `--_menu-row-active-paint` there:
 * - /packages/core/src/DropdownMenu/DropdownMenuItem.tsx
 * - /packages/core/src/DropdownMenu/DropdownMenuCheckboxItem.tsx
 * - /packages/core/src/DropdownMenu/DropdownMenuRadioItem.tsx
 * - /packages/core/src/DropdownMenu/DropdownMenuSubMenu.tsx
 */

const MENU_PRESS_LIT = 'data-astryx-menu-press-lit';
const ACTIVE_PAINT = '--_menu-row-active-paint';

/** Marks `row` as the row that a held finger or pen lights. */
export function markMenuPressLit(row: Element): void {
  row.setAttribute(MENU_PRESS_LIT, '');
}

/** Removes the mark from `row`. */
export function clearMenuPressLit(row: Element): void {
  row.removeAttribute(MENU_PRESS_LIT);
}

/** Whether a held finger or pen lights `row`. */
export function isMenuPressLit(row: Element): boolean {
  return row.hasAttribute(MENU_PRESS_LIT);
}

/**
 * Keeps `menu`'s rows off their `:active` paint while a held finger or pen
 * presses in it. The row the press began on stays `:active` as the press
 * moves on. The lit row keeps the pressed overlay through its own mark.
 */
export function holdMenuPressPaint(menu: HTMLElement): void {
  menu.style.setProperty(ACTIVE_PAINT, 'transparent');
}

/** Gives `menu`'s rows their `:active` paint back. */
export function releaseMenuPressPaint(menu: HTMLElement): void {
  menu.style.removeProperty(ACTIVE_PAINT);
}

/** Whether a held finger or pen keeps `menu`'s rows off their `:active` paint. */
export function isMenuPressPaintHeld(menu: HTMLElement): boolean {
  return menu.style.getPropertyValue(ACTIVE_PAINT) !== '';
}

export {menuPressLitRowClassName} from './menuPressLitClasses';
