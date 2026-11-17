// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TreeListItem.tsx
 * @input Uses React, StyleX, theme tokens, TreeListBranches, the shared press
 *   overlays and the compositor press layer
 * @output Exports TreeListItem component (internal, not publicly exported)
 * @position Internal implementation; consumed by TreeList.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TreeList/TreeList.doc.mjs
 * - /packages/core/src/TreeList/TreeList.tsx
 * - /packages/cli/assets/templates/blocks/components/TreeList/ (showcase blocks)
 */

import {useId, useMemo, useRef, type ReactNode} from 'react';
import {isRenderable} from '../utils/isRenderable';
import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';
import {focusOutlineProps} from '../utils/focusOutline.stylex';
import {interactionOverlayStyles} from '../utils/interactionOverlay.stylex';
import {rowPressLayerStyles} from '../privateAttributes/press.stylex';
import {usePressFeedback} from '../hooks/usePressFeedback';
import {
  cancelNestedPress,
  hasInteractiveAncestor,
  useClickableContainer,
} from '../hooks/useClickableContainer';
import {Icon} from '../Icon';
import {mergeProps} from '../utils/mergeProps';
import {tw} from '../utils/tw';
import {useFocusAcrossSwap} from '../utils/useFocusAcrossSwap';
import {useLinkComponent} from '../Link/useLinkComponent';
import {TreeListBranches} from './TreeListBranches';
import {
  treeListItemClassName,
  treeListItemDensityClassName,
} from './treeListItemClasses';
import type {TreeListDensity, TreeListVariant} from './TreeListTypes';
import {themeProps} from '../utils/themeProps';
import {disabledInteractionProps} from '../utils/disabledInteraction';
import {
  registerEnglishFallback,
  useComponentTranslator,
} from '../i18n/useComponentTranslator';
import english from '../i18n/generated-english/TreeList/TreeListItem.generated';

registerEnglishFallback(english);

// =============================================================================
// Styles
// =============================================================================

// `CSSProperties` has no index signature for custom properties, so the row's
// inline style — which publishes the computed indent distance as the private
// `--_tree-indent` — needs this augmentation to typecheck.
type IndentStyle = React.CSSProperties & Record<'--_tree-indent', string>;

// =============================================================================
// Types
// =============================================================================

export interface TreeListItemInternalProps {
  id: string;
  label: React.ReactNode;
  description?: string;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  href?: string;
  target?: string;
  isDisabled?: boolean;
  isSelected?: boolean;
  /** Consumer styles for the row element. See `TreeListItemData`. */
  xstyle?: stylex.StyleXStyles;
  className?: string;
  style?: React.CSSProperties;
  hasChildren: boolean;
  /**
   * Whether the tree contains at least one expandable item anywhere (i.e. a
   * caret exists somewhere to align labels under). A leaf reserves the chevron
   * column — the extra offset that lines its label up past an expandable
   * ancestor/sibling's caret — whenever this is true, so it stays indented
   * beyond its parent's label. Only a fully flat tree (no expandable items at
   * all) has no caret to align under, so its rows sit flush (no chevron-column
   * offset). Computed once for the whole tree by TreeList.
   */
  hasExpandableItems: boolean;
  nestedLevel: number;
  isLast: boolean;
  ancestorsIsLast: ReadonlyArray<boolean>;
  isExpanded: boolean;
  /**
   * The row collapsed and its child group is playing its exit: the group
   * stays rendered (the exit makes it inert) until it ends, and its rows
   * leave the tree's keyboard order at once.
   */
  isExiting?: boolean;
  onToggle?: (id: string) => void;
  density: TreeListDensity;
  /**
   * Guide-line visual treatment. `noGuides` suppresses the connector lines;
   * indentation is unaffected (it lives on the row's `marginLeft`, not the
   * guide element).
   */
  variant: TreeListVariant;
  /** Pre-rendered children subtree (rendered by the parent recursion) */
  renderedChildren?: ReactNode;
  /** 1-based position of this item among its siblings (aria-posinset). */
  posInSet: number;
  /** Number of siblings at this level (aria-setsize). */
  setSize: number;
  /**
   * Whether this treeitem is the initial roving-tabindex seed. Exactly one
   * treeitem is seeded tabbable at mount; useTreeFocus (hasRovingTabIndex)
   * then owns the tab stop dynamically.
   */
  isTabbable: boolean;
}

// =============================================================================
// Component
// =============================================================================

/** A plain anchor, for a disabled item whose link has no destination. */
const DisabledAnchor = 'a';

export function TreeListItem({
  id,
  label,
  description,
  startContent,
  endContent,
  xstyle,
  className,
  style,
  onClick,
  href,
  target,
  isDisabled = false,
  isSelected = false,
  hasChildren,
  hasExpandableItems,
  nestedLevel,
  isLast,
  ancestorsIsLast,
  isExpanded,
  isExiting = false,
  onToggle,
  density,
  variant,
  renderedChildren,
  posInSet,
  setSize,
  isTabbable,
}: TreeListItemInternalProps) {
  const pressable = usePressFeedback();
  const t = useComponentTranslator();
  const labelId = useId();
  const descriptionId = useId();
  const LinkComponent = useLinkComponent();
  const linkRef = useRef<HTMLAnchorElement>(null);
  // Disabling the item swaps the router link for a plain anchor, so React
  // replaces it; focus on the inner link (after a pointer click) follows the
  // swap instead of falling to the page (spec:AST-085 FR4).
  const anchorRef = useFocusAcrossSwap<HTMLAnchorElement>(linkRef);
  const isInteractive = onClick != null || href != null;

  const handleToggle = useMemo(
    () =>
      hasChildren && onToggle != null
        ? (e: React.MouseEvent) => {
            e.stopPropagation();
            onToggle(id);
          }
        : undefined,
    [hasChildren, onToggle, id],
  );

  const handleClick = useMemo(() => {
    if (onClick != null || (hasChildren && onToggle != null)) {
      return (e: React.MouseEvent) => {
        if (isDisabled) {
          return;
        }
        // Controls inside the row, native or role-based, keep their own
        // activation (FR7): the same rule link rows get from the shared
        // enlarged-surface hook below.
        if (hasInteractiveAncestor(e.target as Element, e.currentTarget)) {
          return;
        }
        if (onClick != null) {
          onClick(e);
        } else if (hasChildren && onToggle != null) {
          onToggle(id);
        }
      };
    }
    return undefined;
  }, [onClick, hasChildren, onToggle, id, isDisabled]);

  // A link row (an `href` and no other row action) is an enlarged surface for
  // its link: the indent is part of the row, so a click anywhere in it must
  // follow the link, as Enter already does. Built on the shared
  // enlarged-surface hook (family:navigation-destinations), which skips
  // clicks on nested controls, native or role-based, and text selections.
  // - Clicks are delegated: the hook re-dispatches the click on the anchor
  //   with its modifier keys, so the link component and the browser handle
  //   same-tab, new-tab and new-window activation, and stops the original, so
  //   ancestors see one click per press.
  // - Middle-click has no synthetic equivalent, so it takes the hook's href
  //   path, which opens the destination in a new tab after the shared
  //   navigation rule.
  // The container ref is attached to link rows only, so every other row stays
  // a plain element and both hook instances stay inert on it.
  const forwardsToLink = href != null && handleClick == null;
  const linkRowRef = useRef<HTMLDivElement>(null);
  const {onClick: delegateToLink} = useClickableContainer({
    containerRef: linkRowRef,
    interactiveRef: linkRef,
    disabled: isDisabled || !forwardsToLink,
  });

  // A finger press that starts on a control inside the row does not activate
  // the row, so the row shows no press for it. The row's own action, its link
  // or invisible button, activates it. The Chevron does too when the row's
  // surface toggles, since it runs that same toggle.
  const actionButtonRef = useRef<HTMLButtonElement>(null);
  const chevronRef = useRef<HTMLButtonElement>(null);
  const surfaceToggles = onClick == null && handleClick != null;
  const pressOnRow = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isDisabled) {
      return;
    }
    const chevron = chevronRef.current;
    const ownAction =
      surfaceToggles &&
      chevron != null &&
      event.target instanceof Node &&
      chevron.contains(event.target)
        ? chevron
        : (linkRef.current ?? actionButtonRef.current);
    cancelNestedPress(event, event.currentTarget, ownAction);
  };
  const {onMouseUp: openLinkOnMiddleClick} = useClickableContainer({
    containerRef: linkRowRef,
    href,
    target,
    disabled: isDisabled || !forwardsToLink,
  });

  // Per-level indent distance. The per-level step is the public, themeable
  // `--tree-list-indent` lever (default `--spacing-4`, set on the tree-list
  // root). A leaf adds a fixed chevron-column offset (chevron width + gap) so
  // its label lines up past an expandable ancestor/sibling's caret — but ONLY
  // when the tree actually contains an expandable item somewhere. In a fully
  // flat tree there is no caret to align under, so the offset is pointless and
  // every row sits flush, like a parent at that level. That offset is tied to
  // the chevron's own dimensions, not the indent step, so it does not scale
  // with the lever. Published as the private `--_tree-indent` and consumed by
  // `indentedContent`'s stylesheet `padding-inline-start`; the step stays
  // themeable through `--tree-list-indent` (see #4308).
  const reservesChevronColumn = !hasChildren && hasExpandableItems;
  const indentDistance = reservesChevronColumn
    ? `calc(${nestedLevel} * var(--tree-list-indent) + ${spacingVars['--spacing-4']} + ${spacingVars['--spacing-2']})`
    : `calc(${nestedLevel} * var(--tree-list-indent))`;
  const indentStyle: IndentStyle = {'--_tree-indent': indentDistance};

  const labelAndDescription = (
    <>
      <span
        id={labelId}
        {...mergeProps(
          // Stable theme target for the item's label text. The label carries no
          // themeable handle today, so a theme can only reach it through a
          // fragile structural selector (a content button's first span). This
          // adds an `astryx-tree-list-item-label` class and reflects the row's
          // `selected` state so a theme can, e.g., bold just the selected
          // item's label via `defineTheme`.
          themeProps('tree-list-item-label', {
            selected: isSelected ? 'selected' : null,
          }),
          treeListItemClassName.label,
        )}>
        {label}
      </span>
      {/* eslint-disable-next-line @astryx/no-nullish-jsx-guard -- `description` is a string field: an empty string still describes the item */}
      {description != null && (
        <span
          id={descriptionId}
          className={tw(
            treeListItemClassName.description,
            treeListItemClassName.descriptionSize,
          )}>
          {description}
        </span>
      )}
    </>
  );

  // <Icon> renders the glyph's span itself — carrying the pre-existing
  // astryx-icon target — so the rotation rides on that same element instead of
  // an extra wrapper: a theme can still restyle the mark and its open/closed
  // transform through one selector.
  const chevronIcon = (
    <Icon
      icon="chevronRight"
      // Nearest size to the 16px chevron column; `chevronSvg` re-pins the exact
      // box because the column is spacing-token-sized, not rem-sized.
      size="sm"
      // The button/container owns the chevron color (--color-icon-secondary);
      // inheriting keeps that as the single source.
      color="inherit"
      className={tw(
        treeListItemClassName.chevronGlyph,
        isExpanded
          ? treeListItemClassName.chevronExpanded
          : treeListItemClassName.chevronCollapsed,
      )}
    />
  );

  const chevron = hasChildren ? (
    handleToggle != null ? (
      // Real toggle button whenever expand/collapse is supported, so the row
      // can be expanded from the keyboard even when the item has no onClick/href
      // (row-level onClick is the only click path in that case, but there is no
      // focusable element to receive Enter/Space). The row's handleClick ignores
      // clicks originating inside a <button>, so this never double-toggles.
      <button
        ref={chevronRef}
        type="button"
        aria-expanded={isExpanded}
        aria-label={t('@astryx.treeList.toggleChildren')}
        // Stable identity for TreeList's activateItem selector — do not
        // remove without also updating TreeList.tsx.
        data-tree-toggle=""
        // Disabled stays focusable (spec:AST-085 FR1) but inert (FR2).
        aria-disabled={isDisabled || undefined}
        // Roving tabindex lives on the treeitem row; the chevron toggle is not
        // a separate tab stop. Row-level Enter/Space forwards to this button.
        tabIndex={-1}
        onClick={handleToggle}
        {...(isDisabled ? disabledInteractionProps() : null)}
        {...mergeProps(
          // Stable theme target for the expand/collapse control. `data-tree-toggle`
          // stays as the functional activation hook; this adds a themeable
          // `astryx-tree-list-chevron` class and reflects the open/closed state so
          // a theme can restyle the toggle (and each state) without a fragile
          // `[data-tree-toggle]` selector.
          themeProps('tree-list-chevron', {
            state: isExpanded ? 'expanded' : 'collapsed',
          }),
          treeListItemClassName.chevronButton,
        )}>
        {chevronIcon}
      </button>
    ) : (
      // Non-interactive chevron only when toggling is not wired up at all
      <span
        {...mergeProps(
          themeProps('tree-list-chevron', {
            state: isExpanded ? 'expanded' : 'collapsed',
          }),
          treeListItemClassName.chevronBox,
        )}>
        {chevronIcon}
      </span>
    )
  ) : null;

  const innerContent = (
    <>
      {chevron}
      {isRenderable(startContent) && (
        <span className={treeListItemClassName.startContent}>
          {startContent}
        </span>
      )}
      {href != null && isDisabled ? (
        // A disabled item's anchor has no destination, so neither the row's
        // forwarded activation nor a screen reader's click can navigate
        // (spec:AST-085 FR2). Like a disabled Link, it keeps the link role and
        // skips the router link component.
        <DisabledAnchor
          ref={anchorRef}
          role="link"
          aria-disabled={true}
          aria-labelledby={labelId}
          aria-describedby={description != null ? descriptionId : undefined}
          tabIndex={-1}
          className={treeListItemClassName.invisibleAnchor}>
          {labelAndDescription}
        </DisabledAnchor>
      ) : href != null ? (
        <LinkComponent
          ref={anchorRef}
          href={href}
          target={target}
          aria-labelledby={labelId}
          aria-describedby={description != null ? descriptionId : undefined}
          // Roving tabindex lives on the treeitem row; inner action is not a
          // separate tab stop. Activation is forwarded from the row.
          tabIndex={-1}
          className={treeListItemClassName.invisibleAnchor}>
          {labelAndDescription}
        </LinkComponent>
      ) : onClick != null ? (
        <button
          ref={actionButtonRef}
          type="button"
          onClick={onClick}
          aria-disabled={isDisabled || undefined}
          {...(isDisabled ? disabledInteractionProps() : null)}
          aria-labelledby={labelId}
          aria-describedby={description != null ? descriptionId : undefined}
          // Roving tabindex lives on the treeitem row; inner action is not a
          // separate tab stop. Activation is forwarded from the row.
          tabIndex={-1}
          className={treeListItemClassName.invisibleButton}>
          {labelAndDescription}
        </button>
      ) : (
        <span className={treeListItemClassName.content}>
          {labelAndDescription}
        </span>
      )}
      {isRenderable(endContent) && (
        <span className={treeListItemClassName.endContent}>{endContent}</span>
      )}
    </>
  );

  return (
    <li
      role="treeitem"
      // The row is named by its label alone and described by its description
      // (APG tree view): without these the name would be the row's whole text,
      // chevron button label and description included.
      aria-labelledby={labelId}
      aria-describedby={description != null ? descriptionId : undefined}
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={isSelected || undefined}
      aria-disabled={isDisabled || undefined}
      aria-level={nestedLevel + 1}
      aria-posinset={posInSet}
      aria-setsize={setSize}
      // Roving tabindex: exactly one visible treeitem is tabbable at a time.
      // Disabled items are skipped by the tree keyboard handler but remain
      // in the accessibility tree.
      tabIndex={isDisabled ? -1 : isTabbable ? 0 : -1}
      data-tree-id={id}
      data-tree-level={nestedLevel + 1}
      data-tree-disabled={isDisabled || undefined}
      {...mergeProps(
        focusOutlineProps.publishFocusVisibleVars(),
        treeListItemClassName.wrapper,
      )}>
      <div className={treeListItemClassName.rowWrapper}>
        {variant !== 'noGuides' && (
          // eslint-disable-next-line @astryx/no-style-only-wrapper -- TreeListBranches renders a fragment, so no child element can carry the indent column
          <div className={treeListItemClassName.treeBranches}>
            <TreeListBranches
              ancestorsIsLast={ancestorsIsLast}
              isLast={isLast}
              nestedLevel={nestedLevel}
            />
          </div>
        )}
        <div
          {...(isInteractive || (hasChildren && onClick == null)
            ? pressable
            : undefined)}
          {...mergeProps(
            themeProps('tree-list-item', {
              density,
              selected: isSelected ? 'selected' : null,
              disabled: isDisabled ? 'disabled' : null,
            }),
            isInteractive || (hasChildren && onClick == null)
              ? focusOutlineProps.focusWithinOrPublished(
                  interactionOverlayStyles.backgroundImage,
                  // The touch press on a compositor layer (after the
                  // overlay, whose own touch paint it turns off).
                  rowPressLayerStyles.cell,
                  rowPressLayerStyles.cellOnImage,
                  xstyle,
                )
              : stylex.props(xstyle),
            tw(
              treeListItemClassName.contentWrapper,
              treeListItemDensityClassName[density],
              (isInteractive || (hasChildren && onClick == null)) &&
                treeListItemClassName.focusLift,
              (isInteractive || (hasChildren && onClick == null)) &&
                treeListItemClassName.interactive,
              isDisabled && treeListItemClassName.disabled,
              isSelected && treeListItemClassName.selected,
              // Consumer row props are merged last so useContainerReveal can
              // publish both its classes and inline custom properties. Seed
              // the private indent first, then preserve the standard inline
              // style precedence promised by the TreeList contract.
              className,
            ),
            {...indentStyle, ...style},
          )}
          ref={forwardsToLink ? linkRowRef : undefined}
          onClick={forwardsToLink ? delegateToLink : handleClick}
          onMouseUp={forwardsToLink ? openLinkOnMiddleClick : undefined}
          onPointerDown={
            forwardsToLink || handleClick != null ? pressOnRow : undefined
          }>
          <div className={treeListItemClassName.indentedContent}>
            {innerContent}
          </div>
        </div>
      </div>
      {(isExpanded || isExiting) && isRenderable(renderedChildren) && (
        <ul
          role="group"
          data-tree-exiting={isExiting ? '' : undefined}
          className={treeListItemClassName.childGroup}>
          {renderedChildren}
        </ul>
      )}
    </li>
  );
}

TreeListItem.displayName = 'TreeListItem';
