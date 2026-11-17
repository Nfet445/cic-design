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
import {
  avatarStatusDotClassName,
  avatarStatusDotIconClassName,
  avatarStatusDotVariantClassName,
} from '../Avatar/avatarStatusDotClasses';
import {buttonGroupClassName} from '../ButtonGroup/buttonGroupClasses';
import {
  dropdownMenuCheckableRowClassName,
  dropdownMenuDividerClassName,
  dropdownMenuItemClassName,
  dropdownMenuMarkerClassName,
  dropdownMenuRadioGroupClassName,
  dropdownMenuSheetClassName,
  dropdownMenuGroupHeadingClassName,
  dropdownMenuTreeClassName,
  dropdownMenuTreeHiddenClassName,
} from '../DropdownMenu/dropdownMenuClasses';
import {
  menuBottomSheetActionListClassName,
  menuBottomSheetClassName,
} from '../DropdownMenu/menuBottomSheetClasses';
import {
  dropdownMenuSubMenuDrillInClassName,
  dropdownMenuSubMenuFlyoutClassName,
  dropdownMenuSubMenuScrollClassName,
  dropdownMenuSubMenuTouchClassName,
  dropdownMenuSubMenuTouchPinchClassName,
  dropdownMenuSubMenuTriggerClassName,
} from '../DropdownMenu/dropdownMenuSubMenuClasses';
import {
  alertDialogActionsRowClassName,
  alertDialogStackedActionClassName,
} from '../AlertDialog/alertDialogClasses';
import {
  dialogInlineClassName,
  dialogInnerClassName,
  dialogRootClassName,
} from '../Dialog/dialogClasses';
import {
  drawerContentClassName,
  drawerRootClassName,
} from '../Drawer/drawerClasses';
import {bottomSheetEdgeTintClassName} from '../BottomSheet/bottomSheetEdgeTintClasses';
import {
  popoverAnchorWrapperClassName,
  popoverCloseButtonWrapperClassName,
  popoverContentWrapperClassName,
  popoverExplicitWidthClassName,
  popoverMatchTriggerClassName,
  popoverSheetFallbackCloseClassName,
  popoverSurfaceClassName,
  popoverViewportFitClassName,
} from '../Popover/popoverClasses';
import {
  mobileNavContentClassName,
  mobileNavDialogClassName,
  mobileNavDrawerClassName,
  mobileNavHeaderClassName,
  mobileNavHeaderTextClassName,
} from '../MobileNav/mobileNavClasses';
import {
  layerHeaderActionsClassName,
  layerHeaderContainerClassName,
  layerHeaderSlotClassName,
  layerHeaderTitleBlockClassName,
} from '../Layer/layerHeaderClasses';
import {
  itemAlignClassName,
  itemClassName,
  itemContentClassName,
  itemDescriptionClassName,
  itemDisabledContentClassName,
  itemDensityClassName,
  itemEndContentClassName,
  itemFirstLineSlotClassName,
  itemHighlightedClassName,
  itemInlineContentClassName,
  itemInlineDescriptionClassName,
  itemInlineLabelClassName,
  itemInteractiveClassName,
  itemInvisibleAnchorClassName,
  itemInvisibleButtonClassName,
  itemLabelClassName,
  itemLinkRootClassName,
  itemMarkerContentClassName,
  itemMarkerContentFirstLineClassName,
  itemMultiLineTruncateClassName,
  itemSelectedClassName,
  itemSingleLineTruncateClassName,
  itemStartContentClassName,
} from '../Item/itemClasses';

import {
  listClassName,
  listCounterStartClassName,
  listHeaderClassName,
  listRootClassName,
  LIST_ANIMATED_ISOLATION,
  LIST_BLEED_CORNERS,
  LIST_BLEED_CORNERS_BELOW_HEADER,
  LIST_COARSE_ISOLATION,
  LIST_COUNTER,
  LIST_DIVIDED_GAP,
  LIST_NUMBER_COLUMNS,
  LIST_REACHES_CONTAINER_PADDING,
  LIST_ROW_GAP,
} from '../List/listClasses';
import {
  LIST_ITEM_BAND_RAISED,
  LIST_ITEM_BLEED,
  LIST_ITEM_COUNTER,
  LIST_ITEM_DIVIDED_RADIUS,
  LIST_ITEM_DIVIDER,
  LIST_ITEM_DIVIDER_END_WIDTH,
  LIST_ITEM_DIVIDER_LAST_RESET,
  LIST_ITEM_FLUSH_INSET,
  LIST_ITEM_NUMBER_COLUMNS,
  LIST_ITEM_OUTSET_END,
  LIST_ITEM_OUTSET_START,
  LIST_ITEM_SPAN_COLUMNS,
  listItemMarkerCircleClassName,
  listItemMarkerContainerClassName,
  listItemMarkerCounterClassName,
  listItemMarkerDotClassName,
  listItemMarkerGutterHangClassName,
  listItemMarkerNumberClassName,
  listItemMarkerSquareClassName,
  listItemRowClassName,
  listItemTaskMarkerContainerClassName,
} from '../List/listItemClasses';
import {
  listReorderHandleClassName,
  listReorderLineClassName,
} from '../List/listReorderHandleClasses';
import {listReorderHintButtonClassName} from '../List/listReorderHintClasses';

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
  dateInputControlClassName,
  dateInputSizeClassName,
  dateInputToggleClassName,
  nativeDateFieldIconButtonClassName,
  nativeDateFieldInputClassName,
  nativeDateFieldOverlayClassName,
  nativeDateFieldOverlayPlaceholderClassName,
  nativeDateFieldOverlayValueClassName,
  nativeDateFieldSlotClassName,
  nativeDateFieldWrapperClassName,
} from '../DateInput/dateInputClasses';
import {
  fileInputBoxClassName,
  fileInputHiddenInputClassName,
  fileInputTextClassName,
} from '../FileInput/fileInputClasses';
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
import {
  dateRangeInputCalendarPaneClassName,
  dateRangeInputIconButtonClassName,
  dateRangeInputPopoverLayoutClassName,
  dateRangeInputPopoverScrollClassName,
  dateRangeInputPresetButtonClassName,
  dateRangeInputPresetSidebarClassName,
  dateRangeInputSizeClassName,
  dateRangeInputTriggerClassName,
} from '../DateRangeInput/dateRangeInputClasses';
import {
  timeInputClassName,
  timeInputIconClassName,
  timeInputSizeClassName,
} from '../TimeInput/timeInputClasses';
import {
  touchTimeFieldFooterClassName,
  touchTimeFieldIconButtonClassName,
  touchTimeFieldInputClassName,
  touchTimeFieldSheetBodyClassName,
  touchTimeFieldSizeClassName,
  touchTimeFieldWheelsClassName,
} from '../TimeInput/touchTimeFieldClasses';
import {centerClassName, centerSizingClassName} from '../Center/centerClasses';
import {checkboxListItemClassName} from '../CheckboxList/checkboxListItemClasses';
import {radioListClassName} from '../RadioList/radioListClasses';
import {
  checkboxInputClassName,
  checkboxInputIndicatorSlotClassName,
  checkboxInputLabelWrapperClassName,
  checkboxInputNativeClassName,
  checkboxInputPressOverlayClassName,
  checkboxInputRowClassName,
  checkboxInputRowPressImageClassName,
  checkboxInputRowPressOverlayClassName,
  checkboxInputWrapperClassName,
} from '../CheckboxInput/checkboxInputClasses';
import {
  radioListItemIndicatorSlotClassName,
  radioListItemInputClassName,
  radioListItemPressOverlayClassName,
  radioListItemWrapperClassName,
} from '../RadioList/radioListItemClasses';
import {gridClassName, gridSpanClassName} from '../Grid/gridClasses';
import {iconBoxClassName} from '../Icon/iconBoxClasses';
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
import {sideNavClassName} from '../SideNav/sideNavClasses';
import {sideNavHeadingClassName} from '../SideNav/sideNavHeadingClasses';
import {
  navHeadingMenuClassName,
  navHeadingMenuItemClassName,
  navHeadingMenuItemContentClassName,
  navHeadingMenuMinWidthClassName,
} from '../NavMenu/navHeadingMenuClasses';
import {sideNavItemClassName} from '../SideNav/sideNavItemClasses';
import {
  treeListItemClassName,
  treeListItemDensityClassName,
} from '../TreeList/treeListItemClasses';
import {menuPressLitRowClassName} from '../privateAttributes/menuPressLitClasses';
import {reorderLineClassName} from '../privateAttributes/reorderLineClasses';
import {stackClassName} from '../Stack/stackClasses';
import {
  tokenClassName,
  tokenInvisibleButtonClassName,
  tokenLabelClassName,
  tokenLabelHiddenClassName,
  tokenRemoveButtonClassName,
} from '../Token/tokenClasses';
import {stackItemClassName} from '../Stack/stackItemClasses';
import {
  sectionInnerClassName,
  sectionOuterClassName,
} from '../Section/sectionClasses';
import {
  scrollableAreaContentClassName,
  scrollableAreaContentWithInlineOverflowClassName,
  scrollableAreaViewportClassName,
} from '../ScrollableArea/scrollableAreaClasses';
import {
  SELECTOR_OPTION_EMBEDDED_CLASS,
  SELECTOR_ROW_CONTENT_CLASS,
  SELECTOR_ROW_MARK_COLUMN_CLASS,
  selectorOptionRowClassName,
} from '../Selector/selectorOptionClasses';
import {
  MULTI_SELECTOR_ACTION_CELL_ACTIVE_CLASS,
  MULTI_SELECTOR_ACTION_CELL_CLASS,
  MULTI_SELECTOR_CHECKBOX_CLASS,
  MULTI_SELECTOR_CHECKBOX_END_CLASS,
  MULTI_SELECTOR_OPTION_CELL_CLASS,
  MULTI_SELECTOR_ROW_LABEL_CLASS,
  multiSelectorOptionRowClassName,
} from '../MultiSelector/multiSelectorOptionClasses';
import {
  TYPEAHEAD_DEFAULT_ITEM_CLASS,
  TYPEAHEAD_ITEM_CONTENT_CLASS,
  TYPEAHEAD_ITEM_DESCRIPTION_CLASS,
  TYPEAHEAD_ITEM_DISABLED_CLASS,
  TYPEAHEAD_ITEM_FRAME_CLASS,
  TYPEAHEAD_ITEM_LABEL_CLASS,
  TYPEAHEAD_ROW_CONTENT_CLASS,
  typeaheadRowClassName,
} from '../Typeahead/typeaheadClasses';
import {tableCellClassName} from '../Table/tableCellClasses';
import {tableHeaderCellClassName} from '../Table/tableHeaderCellClasses';
import {tableRowClassName} from '../Table/tableRowClasses';
import {
  FILTER_INLINE_SLOT_CLASS,
  FILTER_POPOVER_ACTIONS_CLASS,
  FILTER_POPOVER_ACTIONS_SPACER_CLASS,
  FILTER_POPOVER_CONTENT_CLASS,
  FILTER_POPOVER_SLOT_CLASS,
  filterPlaceholderClassName,
  filterTriggerClassName,
} from '../Table/plugins/filtering/filterClasses';
import {
  paginationActivePageClassName,
  paginationCompactFirstClassName,
  paginationCompactLastClassName,
  paginationControlsClassName,
  paginationDotActiveClassName,
  paginationDotClassName,
  paginationDotDisabledClassName,
  paginationDotSmClassName,
  paginationDotsContainerClassName,
  paginationEllipsisClassName,
  paginationEllipsisSmClassName,
  paginationInfoTextClassName,
  paginationInputGroupClassName,
  paginationInputLabelClassName,
  paginationInputLabelSmClassName,
  paginationInputTotalClassName,
  paginationInputTotalSmClassName,
  paginationPageSizeSelectorClassName,
  paginationRootClassName,
} from '../Pagination/paginationClasses';
import {SELECTION_CELL_CLASS} from '../Table/plugins/selection/selectionClasses';
import {
  TABLE_HEADER_LABEL_ROW_CLASS,
  TABLE_SCROLL_WRAPPER_BLOCK_VIEWPORT_CLASS,
  TABLE_SCROLL_WRAPPER_CLASS,
  TABLE_SCROLL_WRAPPER_RING_INSET_CLASS,
  tableClassName,
  tableGapCellClassName,
} from '../Table/tableClasses';
import {
  SORT_INDICATOR_CLASS,
  SORT_INDICATOR_UNSORTED_CLASS,
  SORT_RANK_CLASS,
  sortButtonClassName,
} from '../Table/plugins/sortable/sortClasses';
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
import {
  topNavCenterRegionClassName,
  topNavClassName,
  topNavDrawerDividerClassName,
  topNavDrawerItemsClassName,
  topNavEndContentClassName,
  topNavEndRegionClassName,
  topNavHeadingSlotClassName,
  topNavMobileBarClassName,
  topNavMobileEndClassName,
  topNavMobileHeadingClassName,
  topNavMobileHeadingTextClassName,
  topNavStartContentClassName,
  topNavStartRegionClassName,
} from '../TopNav/topNavClasses';
import {
  topNavHeadingChevronGlyphClassName,
  topNavHeadingChevronWithGlyphClassName,
  topNavHeadingClassName,
  topNavHeadingColumnsClassName,
  topNavHeadingEndContentClassName,
  topNavHeadingInteractiveClassName,
  topNavHeadingLinkedLineClassName,
  topNavHeadingLogoClassName,
  topNavHeadingMenuTriggerClassName,
  topNavHeadingPopoverAnchorClassName,
  topNavHeadingPopoverChevronWithGlyphClassName,
  topNavHeadingPopoverContentClassName,
  topNavHeadingPopoverHeadingClassName,
  topNavHeadingSupportingLineClassName,
  topNavHeadingTextContainerClassName,
  topNavHeadingTitleClassName,
  topNavHeadingTitleLinkClassName,
  topNavHeadingTitleRowClassName,
} from '../TopNav/topNavHeadingClasses';
import {
  topNavItemClassName,
  topNavItemIconOnlyClassName,
  topNavItemSelectedClassName,
} from '../TopNav/topNavItemClasses';
import {
  topNavFeaturedCardBodyClassName,
  topNavFeaturedCardClassName,
  topNavFeaturedCardDescriptionClassName,
  topNavFeaturedCardImageClassName,
  topNavFeaturedCardLinkArrowClassName,
  topNavFeaturedCardLinkClassName,
  topNavFeaturedCardTitleClassName,
} from '../TopNav/topNavMegaMenuFeaturedCardClasses';
import {
  topNavMegaMenuChevronClassName,
  topNavMegaMenuChevronOpenClassName,
  topNavMegaMenuDrawerChevronClassName,
  topNavMegaMenuDrawerChevronExpandedClassName,
  topNavMegaMenuDrawerFeaturedClassName,
  topNavMegaMenuDrawerHeaderClassName,
  topNavMegaMenuDrawerItemsClassName,
  topNavMegaMenuDrawerItemsInnerClassName,
  topNavMegaMenuDrawerSectionClassName,
  topNavMegaMenuFeaturedClassName,
  topNavMegaMenuItemsClassName,
  topNavMegaMenuPanelAnimationClassName,
  topNavMegaMenuPanelClassName,
  topNavMegaMenuPanelContentClassName,
  topNavMegaMenuPanelViewportFitClassName,
  topNavMegaMenuTriggerClassName,
  topNavMegaMenuTriggerOpenClassName,
} from '../TopNav/topNavMegaMenuClasses';
import {
  topNavMegaMenuItemClassName,
  topNavMegaMenuItemContentClassName,
  topNavMegaMenuItemDescriptionClassName,
  topNavMegaMenuItemDrawerClassName,
  topNavMegaMenuItemDrawerContentClassName,
  topNavMegaMenuItemDrawerDescriptionClassName,
  topNavMegaMenuItemDrawerIconClassName,
  topNavMegaMenuItemIconClassName,
  topNavMegaMenuItemTitleClassName,
} from '../TopNav/topNavMegaMenuItemClasses';
import {
  topNavMenuChevronClassName,
  topNavMenuChevronOpenClassName,
  topNavMenuContainerClassName,
  topNavMenuDrawerHeaderClassName,
  topNavMenuDrawerItemClassName,
  topNavMenuDrawerItemDescriptionClassName,
  topNavMenuDrawerItemIconClassName,
  topNavMenuDrawerItemTextClassName,
  topNavMenuDrawerItemsClassName,
  topNavMenuDrawerItemsInnerClassName,
  topNavMenuDrawerSectionClassName,
  topNavMenuItemClassName,
  topNavMenuItemContentClassName,
  topNavMenuItemDescriptionClassName,
  topNavMenuItemIconClassName,
  topNavMenuItemTitleClassName,
  topNavMenuTriggerClassName,
  topNavMenuTriggerOpenClassName,
} from '../TopNav/topNavMenuClasses';
import {
  hoverCardContentClassName,
  hoverCardHoverIndicationClassName,
  hoverCardSurfaceClassName,
  hoverCardWrapperClassName,
} from '../HoverCard/hoverCardClasses';
import {
  tooltipContentClassName,
  tooltipHoverIndicationClassName,
  tooltipSurfaceClassName,
  tooltipWrapperClassName,
} from '../Tooltip/tooltipClasses';
import {mediaThemeClassName} from '../theme/mediaThemeClasses';
import {toggleButtonClassName} from '../ToggleButton/toggleButtonClasses';
import {toggleButtonGroupClassName} from '../ToggleButton/toggleButtonGroupClasses';
import {describe, expect, it} from 'vitest';
import {
  breadcrumbButtonResetClassName,
  breadcrumbChevronClassName,
  breadcrumbContentClassName,
  breadcrumbCurrentClassName,
  breadcrumbCurrentColorClassName,
  breadcrumbItemClassName,
  breadcrumbLinkClassName,
  breadcrumbLinkColorClassName,
  breadcrumbSeparatorClassName,
  breadcrumbSizeClassName,
  breadcrumbStartIconClassName,
} from '../Breadcrumbs/breadcrumbItemClasses';
import {
  citationClassName,
  citationIconClassName,
  citationIconWrapClassName,
  citationLabelTextClassName,
} from '../Citation/citationClasses';
import {
  TAB_END_CONTENT_CLASS,
  TAB_ICON_CLASS,
  TAB_LABEL_CONTAINER_CLASS,
  TAB_LABEL_SIZER_CLASS,
  TAB_LABEL_TEXT_CLASS,
  TAB_MENU_CHEVRON_CLASS,
  TAB_MENU_CHEVRON_ICON_CLASS,
  TAB_MENU_CHEVRON_OPEN_CLASS,
  TAB_MENU_DROPDOWN_CLASS,
  TAB_MENU_HEADING_CLASS,
  TAB_MENU_ITEM_CONTENT_CLASS,
  TAB_MENU_TRIGGER_LABEL_CLASS,
  tabClassName,
  tabHoverLayerClassName,
  tabIconSizeClassName,
  tabIndicatorClassName,
  tabMenuHoverLayerClassName,
  tabMenuItemClassName,
  tabMenuTriggerClassName,
} from '../TabList/tabListClasses';
import {
  SEGMENT_ICON_CLASS,
  SEGMENT_LABEL_CLASS,
  segmentedControlClassName,
  segmentedItemClassName,
  segmentedItemIconSizeClassName,
} from '../SegmentedControl/segmentedControlClasses';
import {
  linkClassName,
  linkColorClassName,
  linkExternalIconInClampedTextClassName,
  linkLabelClassName,
} from '../Link/linkClasses';
import {
  badgeClassName,
  badgeGrowsClassName,
  badgeLabelClassName,
  badgeVariantClassName,
} from '../Badge/badgeClasses';
import {
  statusDotClassName,
  statusDotIconClassName,
  statusDotPulsingClassName,
  statusDotVariantClassName,
} from '../StatusDot/statusDotClasses';
import {
  blockquoteCiteClassName,
  blockquoteClassName,
} from '../Blockquote/blockquoteClasses';
import {
  codeClassName,
  codeColorClassName,
  codeInheritSizeClassName,
} from '../Code/codeClasses';
import {
  cardBorderClassName,
  cardClassName,
  cardCornersClassName,
  cardElevationClassName,
  cardOverflowClassName,
  cardSizingClassName,
  cardVariantClassName,
} from '../Card/cardClasses';
import {
  dividerClassName,
  dividerFullBleedClassName,
  dividerLabelClassName,
  dividerLineClassName,
  dividerLineVariantClassName,
  dividerVerticalLabelClassName,
} from '../Divider/dividerClasses';
import {
  emptyStateActionsClassName,
  emptyStateActionsCompactClassName,
  emptyStateClassName,
  emptyStateCompactClassName,
  emptyStateDescriptionClassName,
  emptyStateDescriptionCompactClassName,
  emptyStateTextGroupClassName,
  emptyStateTitleClassName,
  emptyStateTitleCompactClassName,
} from '../EmptyState/emptyStateClasses';
import {timestampClassName} from '../Timestamp/timestampClasses';
import {timerClassName} from '../Timer/timerClasses';
import {
  metadataListClassName,
  metadataListColumnsClassName,
  metadataListGridClassName,
  metadataListResetClassName,
  metadataListTitleClassName,
  metadataListToggleClassName,
} from '../MetadataList/metadataListClasses';
import {
  metadataListItemIconClassName,
  metadataListItemLabelClassName,
  metadataListItemStackedClassName,
  metadataListItemStackedLabelClassName,
  metadataListItemStackedValueClassName,
  metadataListItemValueClassName,
} from '../MetadataList/metadataListItemClasses';
import {
  chatMessageMetadataAssistantClassName,
  chatMessageMetadataClassName,
  chatMessageMetadataStatusErrorClassName,
  chatMessageMetadataStatusPulseClassName,
  chatMessageMetadataStatusRowClassName,
  chatMessageMetadataUserClassName,
  chatPastedTextFooterClassName,
  chatPastedTextMetaClassName,
  chatPastedTextPreviewClassName,
  chatPastedTextPreviewTextClassName,
  chatSendButtonClassName,
  chatSystemMessageClassName,
  chatSystemMessageContentClassName,
  chatSystemMessageDividerClassName,
  chatSystemMessageIconClassName,
  chatTokenizedTextClassName,
  chatTokenizedTextTokenClassName,
} from '../Chat/chatClasses';
import {
  timestampHoverCardActionClassName,
  timestampHoverCardGridTemplateClassName,
  timestampHoverCardLabelClassName,
  timestampHoverCardListClassName,
  timestampHoverCardRowClassName,
  timestampHoverCardValueCellsClassName,
  timestampHoverCardValueClassName,
} from '../Timestamp/timestampHoverCardClasses';
import {
  aspectRatioChildCenterClassName,
  aspectRatioChildClassName,
  aspectRatioChildContainClassName,
  aspectRatioChildCoverClassName,
  aspectRatioChildFillClassName,
  aspectRatioClassName,
  aspectRatioEllipseClassName,
  aspectRatioRatioClassName,
} from '../AspectRatio/aspectRatioClasses';
import {
  spinnerArcClassName,
  spinnerCircleClassName,
  spinnerClassName,
  spinnerRingClassName,
  spinnerRotorBoxClassName,
  spinnerRotorTurnClassName,
  spinnerShadeClassName,
  spinnerSizeClassName,
  spinnerTrackClassName,
  spinnerTrackOpacityClassName,
  spinnerWrapperClassName,
} from '../Spinner/spinnerClasses';
import {
  skeletonAnimateClassName,
  skeletonClassName,
  skeletonDelayClassName,
  skeletonDimensionsClassName,
  skeletonRadiusClassName,
} from '../Skeleton/skeletonClasses';
import {
  bannerChevronClassName,
  bannerChevronExpandedClassName,
  bannerClassName,
  bannerContentAreaCardClassName,
  bannerContentAreaClassName,
  bannerDescriptionClassName,
  bannerElevatedCardClassName,
  bannerElevationClassName,
  bannerEndAreaClassName,
  bannerHeaderCardStandaloneClassName,
  bannerHeaderCardWithContentClassName,
  bannerHeaderCenteredClassName,
  bannerHeaderClassName,
  bannerHeaderContentClassName,
  bannerHeaderContentWithEndContentClassName,
  bannerIconWrapperClassName,
  bannerStatusClassName,
  bannerStatusControlClassName,
  bannerStatusForegroundClassName,
  bannerTitleClassName,
} from '../Banner/bannerClasses';

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
  add(scrollableAreaViewportClassName({isFullBleed: false}));
  add(
    scrollableAreaViewportClassName({
      height: 200,
      isFullBleed: true,
      maxWidth: '64rem',
      minHeight: 40,
      width: '100%',
    }),
  );
  add(scrollableAreaContentClassName);
  add(scrollableAreaContentWithInlineOverflowClassName);
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
  // The dialog family: the native <dialog> in each geometry, and the inline
  // preview wrapper. Each entrance contributes its own animation-name arms.
  for (const isFullscreen of [false, true]) {
    for (const isPositioned of [false, true]) {
      for (const entrance of ['slide', 'fade', 'none']) {
        add(dialogRootClassName({entrance, isFullscreen, isPositioned}));
      }
    }
    add(dialogInlineClassName({isFullscreen}));
  }
  add(dialogInnerClassName);
  add(layerHeaderContainerClassName);
  add(layerHeaderSlotClassName);
  add(layerHeaderTitleBlockClassName);
  for (const hasBlockCompensation of [false, true]) {
    for (const hasInlineCompensation of [false, true]) {
      add(
        layerHeaderActionsClassName({
          hasBlockCompensation,
          hasInlineCompensation,
        }),
      );
    }
  }

  // The drawer panel: both anchored sides, each painting state, with and
  // without a scrim, and the settled open that collapses its transition.
  for (const side of ['start', 'end']) {
    for (const isRendered of [false, true]) {
      for (const isOpen of [false, true]) {
        for (const hasScrim of [false, true]) {
          for (const opensSettled of [false, true]) {
            add(
              drawerRootClassName({
                side,
                isRendered,
                isOpen,
                hasScrim,
                opensSettled,
              }),
            );
          }
        }
      }
    }
  }
  add(drawerContentClassName);
  // The bottom sheet's edge tint: the strip WebKit samples for the iOS toolbar
  // colour.
  add(bottomSheetEdgeTintClassName);

  // The popover: its surface and content wrapper, the anchor wrapper, both
  // viewport-fit states, the two sizing classes and both hidden close
  // wrappers.
  add(popoverAnchorWrapperClassName);
  add(popoverSurfaceClassName);
  add(popoverContentWrapperClassName);
  for (const isScrollable of [false, true]) {
    add(popoverViewportFitClassName({isScrollable}));
  }
  add(popoverExplicitWidthClassName);
  add(popoverMatchTriggerClassName);
  add(popoverCloseButtonWrapperClassName);
  add(popoverSheetFallbackCloseClassName);

  // The mobile nav: the dialog in its two display states, the scrim, both
  // drawer edges in both motion states, the header row and its content area.
  for (const isPresentationHeld of [false, true]) {
    for (const isOpen of [false, true]) {
      add(mobileNavDialogClassName({isPresentationHeld, isOpen}));
    }
  }
  for (const side of ['start', 'end']) {
    for (const isOpen of [false, true]) {
      add(mobileNavDrawerClassName({side, isOpen}));
    }
  }
  for (const hasTitle of [false, true]) {
    add(mobileNavHeaderClassName({hasTitle}));
  }
  add(mobileNavHeaderTextClassName);
  add(mobileNavContentClassName);

  // The alert dialog adds only the row's gesture policy and the stacked width;
  // Button already caps an action at `min-w-0 max-w-full`.
  add(alertDialogActionsRowClassName);
  add(alertDialogStackedActionClassName);

  // The top-nav family: the bar, its heading and three regions, and the mobile
  // bar and drawer rows.
  for (const className of [
    topNavClassName,
    topNavMobileBarClassName,
    topNavHeadingSlotClassName,
    topNavStartRegionClassName,
    topNavStartContentClassName,
    topNavCenterRegionClassName,
    topNavEndRegionClassName,
    topNavEndContentClassName,
    topNavMobileHeadingClassName,
    topNavMobileHeadingTextClassName,
    topNavMobileEndClassName,
    topNavDrawerItemsClassName,
    topNavDrawerDividerClassName,
    topNavFeaturedCardClassName,
    topNavFeaturedCardImageClassName,
    topNavFeaturedCardBodyClassName,
    topNavFeaturedCardTitleClassName,
    topNavFeaturedCardDescriptionClassName,
    topNavFeaturedCardLinkClassName,
    topNavFeaturedCardLinkArrowClassName,
  ]) {
    add(className());
  }

  // The horizontal item carries its selected fill keyed off `aria-current`,
  // so both state classes ship with the base one.
  add(topNavItemClassName());
  add(topNavItemSelectedClassName());
  add(topNavItemIconOnlyClassName());

  // The heading picks one column track per render path, so every track ships.
  add(topNavHeadingClassName());
  for (const columns of [
    'withLogo',
    'text',
    'withLogoAndLinks',
    'withLinks',
    'withLogoAndMenu',
    'withMenu',
  ]) {
    add(topNavHeadingColumnsClassName(columns));
  }
  for (const className of [
    topNavHeadingMenuTriggerClassName,
    topNavHeadingInteractiveClassName,
    topNavHeadingLogoClassName,
    topNavHeadingTextContainerClassName,
    topNavHeadingSupportingLineClassName,
    topNavHeadingTitleClassName,
    topNavHeadingTitleRowClassName,
    topNavHeadingTitleLinkClassName,
    topNavHeadingLinkedLineClassName,
    topNavHeadingChevronWithGlyphClassName,
    topNavHeadingChevronGlyphClassName,
    topNavHeadingEndContentClassName,
    topNavHeadingPopoverContentClassName,
    topNavHeadingPopoverHeadingClassName,
    topNavHeadingPopoverChevronWithGlyphClassName,
    topNavHeadingPopoverAnchorClassName,
  ]) {
    add(className());
  }

  // The menu trigger keeps its open fill and the drawer its collapse, both
  // keyed off the `aria-expanded` and `aria-hidden` the menu already writes.
  for (const className of [
    topNavMenuTriggerClassName,
    topNavMenuTriggerOpenClassName,
    topNavMenuChevronClassName,
    topNavMenuChevronOpenClassName,
    topNavMenuContainerClassName,
    topNavMenuItemClassName,
    topNavMenuItemIconClassName,
    topNavMenuItemContentClassName,
    topNavMenuItemTitleClassName,
    topNavMenuItemDescriptionClassName,
    topNavMenuDrawerSectionClassName,
    topNavMenuDrawerHeaderClassName,
    topNavMenuDrawerItemsClassName,
    topNavMenuDrawerItemsInnerClassName,
    topNavMenuDrawerItemClassName,
    topNavMenuDrawerItemIconClassName,
    topNavMenuDrawerItemTextClassName,
    topNavMenuDrawerItemDescriptionClassName,
  ]) {
    add(className());
  }

  // The mega menu keeps its open fill and its drawer collapse on the same
  // `aria-expanded`/`aria-hidden` keys, and its panel state on `:popover-open`.
  for (const className of [
    topNavMegaMenuTriggerClassName,
    topNavMegaMenuTriggerOpenClassName,
    topNavMegaMenuChevronClassName,
    topNavMegaMenuChevronOpenClassName,
    topNavMegaMenuPanelAnimationClassName,
    topNavMegaMenuPanelViewportFitClassName,
    topNavMegaMenuPanelClassName,
    topNavMegaMenuPanelContentClassName,
    topNavMegaMenuItemsClassName,
    topNavMegaMenuFeaturedClassName,
    topNavMegaMenuDrawerSectionClassName,
    topNavMegaMenuDrawerHeaderClassName,
    topNavMegaMenuDrawerChevronClassName,
    topNavMegaMenuDrawerChevronExpandedClassName,
    topNavMegaMenuDrawerItemsClassName,
    topNavMegaMenuDrawerItemsInnerClassName,
    topNavMegaMenuDrawerFeaturedClassName,
    topNavMegaMenuItemClassName,
    topNavMegaMenuItemIconClassName,
    topNavMegaMenuItemContentClassName,
    topNavMegaMenuItemTitleClassName,
    topNavMegaMenuItemDescriptionClassName,
    topNavMegaMenuItemDrawerClassName,
    topNavMegaMenuItemDrawerIconClassName,
    topNavMegaMenuItemDrawerContentClassName,
    topNavMegaMenuItemDrawerDescriptionClassName,
  ]) {
    add(className());
  }

  // The tooltip and hover-card surfaces, their content padding and the
  // trigger's dashed hint.
  for (const className of [
    tooltipSurfaceClassName,
    tooltipContentClassName,
    tooltipHoverIndicationClassName,
    tooltipWrapperClassName.contents,
    tooltipWrapperClassName.inline,
    hoverCardSurfaceClassName,
    hoverCardContentClassName,
    hoverCardHoverIndicationClassName,
    hoverCardWrapperClassName.contents,
    hoverCardWrapperClassName.inline,
  ]) {
    add(className);
  }

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

  // The body row answers three axes, the body cell six. Both are walked over
  // their cross product: a stripe or a divider is one utility per variant, so
  // a combination nobody thought of would otherwise miss its rule.
  for (const hasHover of [false, true]) {
    for (const hasKnownPosition of [false, true]) {
      for (const isStriped of [false, true]) {
        add(tableRowClassName({hasHover, hasKnownPosition, isStriped}));
      }
    }
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
        for (const hasRowDivider of [false, true]) {
          for (const textOverflow of ['wrap', 'truncate']) {
            for (const verticalAlign of ['middle', 'top', 'bottom']) {
              add(
                tableCellClassName({
                  density,
                  hasColumnDivider,
                  hasContextMenu,
                  hasRowDivider,
                  textOverflow,
                  verticalAlign,
                }),
              );
            }
          }
        }
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
  // The date range field: the closed trigger, its calendar button, the
  // popover body and the preset column.
  // The date field: its calendar toggle, the typed control and the wrapper's
  // size.
  for (const size of ['sm', 'md', 'lg']) {
    add(dateInputSizeClassName({size}));
  }
  for (const isDisabled of [false, true]) {
    add(dateInputToggleClassName({isDisabled}));
    for (const isInvalid of [false, true]) {
      add(dateInputControlClassName({isDisabled, isInvalid}));
      for (const isHidden of [false, true]) {
        add(nativeDateFieldInputClassName({isDisabled, isHidden, isInvalid}));
      }
    }
  }
  for (const className of [
    nativeDateFieldWrapperClassName,
    nativeDateFieldIconButtonClassName,
    nativeDateFieldSlotClassName,
    nativeDateFieldOverlayClassName,
    nativeDateFieldOverlayValueClassName,
    nativeDateFieldOverlayPlaceholderClassName,
  ]) {
    add(className);
  }
  for (const size of ['sm', 'md', 'lg']) {
    add(dateRangeInputSizeClassName({size}));
    add(timeInputSizeClassName({size}));
    add(touchTimeFieldSizeClassName({size}));
  }
  for (const hasValue of [false, true]) {
    for (const isDisabled of [false, true]) {
      add(dateRangeInputTriggerClassName({hasValue, isDisabled}));
    }
  }
  for (const isDisabled of [false, true]) {
    add(dateRangeInputIconButtonClassName({isDisabled}));
    add(dateRangeInputPresetButtonClassName({isDisabled}));
    add(timeInputClassName({isDisabled, isRejected: false}));
    add(timeInputClassName({isDisabled, isRejected: true}));
    add(touchTimeFieldIconButtonClassName({isDisabled}));
    add(touchTimeFieldInputClassName({isDisabled}));
  }
  for (const className of [
    dateRangeInputPopoverScrollClassName,
    dateRangeInputPopoverLayoutClassName,
    dateRangeInputPresetSidebarClassName,
    dateRangeInputCalendarPaneClassName,
    timeInputIconClassName,
    touchTimeFieldSheetBodyClassName,
    touchTimeFieldWheelsClassName,
    touchTimeFieldFooterClassName,
  ]) {
    add(className);
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
  for (const isDropzone of [false, true]) {
    for (const isDisabled of [false, true]) {
      for (const [isDragOver, isBusy] of [
        [false, false],
        [true, false],
        [false, true],
      ]) {
        for (const status of [null, 'warning', 'error', 'success']) {
          add(
            fileInputBoxClassName({
              isDropzone,
              isSelectionDisabled: false,
              isDragOver,
              isDisabled,
              isBusy,
              status,
            }),
          );
        }
      }
    }
  }
  for (const kind of ['placeholder', 'fileName']) {
    for (const isCompact of [false, true]) {
      for (const wraps of [false, true]) {
        add(fileInputTextClassName({kind, isCompact, wraps}));
      }
    }
  }
  add(fileInputHiddenInputClassName);
  add(textAreaStartIconClassName);
  add(textAreaEndSlotClassName);
  for (const isOverLimit of [false, true]) {
    add(textAreaCounterClassName({isOverLimit}));
  }

  for (const align of [undefined, 'start', 'center', 'end']) {
    add(sortButtonClassName(align));
  }
  add(SORT_INDICATOR_CLASS);
  add(SORT_INDICATOR_UNSORTED_CLASS);
  add(SORT_RANK_CLASS);
  add(filterTriggerClassName(true));
  add(filterTriggerClassName(false));
  add(filterPlaceholderClassName(true));
  add(filterPlaceholderClassName(false));
  add(FILTER_POPOVER_SLOT_CLASS);
  add(FILTER_POPOVER_CONTENT_CLASS);
  add(FILTER_POPOVER_ACTIONS_CLASS);
  add(FILTER_POPOVER_ACTIONS_SPACER_CLASS);
  add(FILTER_INLINE_SLOT_CLASS);
  add(SELECTION_CELL_CLASS);
  add(tableClassName({isAutoLayout: true}));
  add(tableClassName({isAutoLayout: false}));
  add(tableGapCellClassName({isInline: true}));
  add(tableGapCellClassName({isInline: false}));
  add(TABLE_HEADER_LABEL_ROW_CLASS);
  add(TABLE_SCROLL_WRAPPER_CLASS);
  add(TABLE_SCROLL_WRAPPER_RING_INSET_CLASS);
  add(TABLE_SCROLL_WRAPPER_BLOCK_VIEWPORT_CLASS);

  // The choice-input rows: every size crossed with the four row states, so a
  // state no other test renders still has its rule.
  for (const size of ['sm', 'md', 'lg']) {
    for (const isHighlighted of [false, true]) {
      for (const isKeyboardHighlighted of [false, true]) {
        for (const isSelected of [false, true]) {
          for (const isDisabled of [false, true]) {
            add(
              selectorOptionRowClassName({
                isDisabled,
                isHighlighted,
                isKeyboardHighlighted,
                isSelected,
                size,
              }),
            );
          }
        }
      }
    }
  }
  add(SELECTOR_ROW_CONTENT_CLASS);
  add(SELECTOR_ROW_MARK_COLUMN_CLASS);
  add(SELECTOR_OPTION_EMBEDDED_CLASS);
  // The nav heading popover: its column, both row states at every size, and
  // the minimum width each size states as its own fallback.
  add(navHeadingMenuClassName);
  add(navHeadingMenuItemContentClassName);
  for (const size of ['sm', 'md', 'lg']) {
    add(navHeadingMenuMinWidthClassName[size]);
    add(navHeadingMenuItemClassName({isDisabled: false, size}));
    add(navHeadingMenuItemClassName({isDisabled: true, size}));
  }

  // MultiSelector rows: both row kinds (option and Select All) across every
  // size, the grid layout and each runtime state.
  for (const size of ['sm', 'md', 'lg']) {
    for (const isSelectAll of [false, true]) {
      for (const isGrid of [false, true]) {
        for (const isHighlighted of [false, true]) {
          for (const isDisabled of [false, true]) {
            add(
              multiSelectorOptionRowClassName({
                isDisabled,
                isGrid,
                isHighlighted,
                isSelectAll,
                size,
              }),
            );
          }
        }
      }
    }
  }
  add(MULTI_SELECTOR_ROW_LABEL_CLASS);
  add(MULTI_SELECTOR_CHECKBOX_CLASS);
  add(MULTI_SELECTOR_CHECKBOX_END_CLASS);
  add(MULTI_SELECTOR_OPTION_CELL_CLASS);
  add(MULTI_SELECTOR_ACTION_CELL_CLASS);
  add(MULTI_SELECTOR_ACTION_CELL_ACTIVE_CLASS);

  // Typeahead result rows: each size crossed with highlighted and selected,
  // plus the default item's own parts.
  for (const size of ['sm', 'md', 'lg']) {
    for (const isHighlighted of [false, true]) {
      for (const isSelected of [false, true]) {
        add(typeaheadRowClassName({isHighlighted, isSelected, size}));
      }
    }
  }
  add(TYPEAHEAD_ROW_CONTENT_CLASS);
  add(TYPEAHEAD_DEFAULT_ITEM_CLASS);
  add(TYPEAHEAD_ITEM_FRAME_CLASS);
  add(TYPEAHEAD_ITEM_CONTENT_CLASS);
  add(TYPEAHEAD_ITEM_LABEL_CLASS);
  add(TYPEAHEAD_ITEM_DESCRIPTION_CLASS);
  add(TYPEAHEAD_ITEM_DISABLED_CLASS);

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
  for (const className of Object.values(iconBoxClassName)) {
    add(className);
  }
  add(menuPressLitRowClassName);
  add(reorderLineClassName);
  for (const placement of ['above', 'below', 'start', 'end']) {
    add(layerAnimations[placement]);
  }
  add(layerTextResetClassName);
  add(layerStructureResetClassName);

  // A link's root reads six inputs, so its map is walked over every
  // combination; its colour map adds one arm per text colour.
  for (const color of Object.keys(linkColorClassName)) {
    add(linkColorClassName[color]);
  }
  for (const hasUnderline of [false, true]) {
    for (const isDisabled of [false, true]) {
      for (const isButton of [false, true]) {
        for (const isInClampedText of [false, true]) {
          for (const isStandalone of [false, true]) {
            for (const isTruncating of [false, true]) {
              add(
                linkClassName({
                  hasUnderline,
                  isDisabled,
                  isButton,
                  isInClampedText,
                  isStandalone,
                  isTruncating,
                }),
              );
            }
          }
        }
      }
    }
  }
  add(linkLabelClassName);
  add(linkExternalIconInClampedTextClassName);

  // A citation is a label pill or a number badge, with or without a source
  // icon, linked or inert.
  for (const variant of ['label', 'number']) {
    for (const hasIcon of [false, true]) {
      for (const isLink of [false, true]) {
        add(citationClassName({variant, hasIcon, isLink}));
      }
    }
  }
  for (const variant of ['default', 'supporting']) {
    add(breadcrumbSizeClassName[variant]);
    add(breadcrumbCurrentColorClassName[variant]);
  }
  add(breadcrumbItemClassName);
  add(breadcrumbContentClassName);
  add(breadcrumbLinkClassName);
  add(breadcrumbButtonResetClassName);
  add(breadcrumbLinkColorClassName);
  add(breadcrumbCurrentClassName);
  add(breadcrumbStartIconClassName);
  add(breadcrumbSeparatorClassName);
  add(breadcrumbChevronClassName);

  for (const size of ['sm', 'md', 'lg']) {
    for (const color of [
      'default',
      'red',
      'orange',
      'yellow',
      'green',
      'teal',
      'cyan',
      'blue',
      'purple',
      'pink',
      'gray',
    ]) {
      add(
        tokenClassName({size, color, isInteractive: true, isDisabled: false}),
      );
      add(tokenClassName({size, color, isInteractive: true, isDisabled: true}));
      add(
        tokenClassName({size, color, isInteractive: false, isDisabled: false}),
      );
    }
  }
  add(tokenInvisibleButtonClassName);
  add(tokenLabelClassName);
  add(tokenLabelHiddenClassName);
  add(tokenRemoveButtonClassName);

  for (const className of [
    paginationRootClassName,
    paginationControlsClassName,
    paginationCompactFirstClassName,
    paginationCompactLastClassName,
    paginationEllipsisClassName,
    paginationEllipsisSmClassName,
    paginationInfoTextClassName,
    paginationDotsContainerClassName,
    paginationDotClassName,
    paginationDotSmClassName,
    paginationDotActiveClassName,
    paginationDotDisabledClassName,
    paginationActivePageClassName,
    paginationInputGroupClassName,
    paginationInputLabelClassName,
    paginationInputLabelSmClassName,
    paginationInputTotalClassName,
    paginationInputTotalSmClassName,
    paginationPageSizeSelectorClassName,
  ]) {
    add(className);
  }

  add(avatarStatusDotClassName);
  add(avatarStatusDotIconClassName);
  for (const variant of ['success', 'neutral', 'error']) {
    add(avatarStatusDotVariantClassName[variant]);
  }

  // A row's frame answers alignment, density and four state flags; the walk
  // crosses every pair a caller can reach and turns each flag on alone.
  for (const align of ['center', 'start', 'first-line']) {
    add(itemAlignClassName[align]);
    for (const density of ['compact', 'balanced', 'spacious']) {
      add(itemDensityClassName[density]);
      add(
        itemClassName({
          align,
          density,
          hasParentRole: false,
          isDisabled: false,
          isHighlighted: false,
          isInteractive: false,
          isLinkRoot: false,
          isSelected: false,
        }),
      );
      for (const [isInteractive, isHighlighted, isSelected, isDisabled] of [
        [true, false, false, false],
        [false, true, false, false],
        [false, false, true, false],
        [false, false, false, true],
        [true, true, false, false],
        [true, false, true, false],
        [true, false, false, true],
      ]) {
        for (const hasParentRole of [false, true]) {
          for (const isLinkRoot of [false, true]) {
            add(
              itemClassName({
                align,
                density,
                hasParentRole,
                isDisabled,
                isHighlighted,
                isInteractive,
                isLinkRoot,
                isSelected,
              }),
            );
          }
        }
      }
    }
  }
  for (const className of [
    itemContentClassName,
    itemInlineContentClassName,
    itemInlineLabelClassName,
    itemInlineDescriptionClassName,
    itemLabelClassName,
    itemDescriptionClassName,
    itemSingleLineTruncateClassName,
    itemMultiLineTruncateClassName,
    itemInteractiveClassName,
    itemHighlightedClassName,
    itemSelectedClassName,
    itemLinkRootClassName,
    itemDisabledContentClassName,
    itemInvisibleButtonClassName,
    itemInvisibleAnchorClassName,
    itemStartContentClassName,
    itemEndContentClassName,
    itemFirstLineSlotClassName,
    itemMarkerContentClassName,
    itemMarkerContentFirstLineClassName,
  ]) {
    add(className);
  }

  // The List frame answers its header, its dividers, its motion, its counted
  // columns and the container it reaches into; each flag is crossed with a
  // header, since that moves the published corners to the list's root.
  for (const hasHeader of [false, true]) {
    for (const hasDividers of [false, true]) {
      for (const animatesRows of [false, true]) {
        for (const publishesCorners of [false, true]) {
          add(
            listClassName({
              animatesRows,
              countsRows: true,
              hasDividers,
              hasHeader,
              publishesCorners,
              reachesContainerPadding: publishesCorners,
              startsCounter: true,
              usesNumberColumns: true,
            }),
          );
        }
      }
      add(
        listClassName({
          animatesRows: false,
          countsRows: false,
          hasDividers,
          hasHeader: false,
          publishesCorners: false,
          reachesContainerPadding: false,
          startsCounter: false,
          usesNumberColumns: false,
        }),
      );
    }
  }
  for (const className of [
    listRootClassName,
    listHeaderClassName,
    listCounterStartClassName,
    LIST_COUNTER,
    LIST_ROW_GAP,
    LIST_DIVIDED_GAP,
    LIST_COARSE_ISOLATION,
    LIST_ANIMATED_ISOLATION,
    LIST_NUMBER_COLUMNS,
    LIST_REACHES_CONTAINER_PADDING,
    LIST_BLEED_CORNERS,
    LIST_BLEED_CORNERS_BELOW_HEADER,
  ]) {
    add(className);
  }

  // A List row answers its edge treatment and four list-driven flags: the
  // walk crosses every edge with and without dividers, then turns the row's
  // whole machinery on at once.
  for (const edge of ['padded', 'flush', 'outset', 'bleed']) {
    for (const hasDividers of [false, true]) {
      add(
        listItemRowClassName({
          edge,
          hasDividers,
          hasMarkers: false,
          isTouchTargetInList: false,
          spansNumberColumns: false,
          usesNumberColumns: false,
        }),
      );
      add(
        listItemRowClassName({
          edge,
          hasDividers,
          hasMarkers: true,
          isTouchTargetInList: true,
          spansNumberColumns: true,
          usesNumberColumns: true,
        }),
      );
    }
  }
  for (const className of [
    LIST_ITEM_NUMBER_COLUMNS,
    LIST_ITEM_SPAN_COLUMNS,
    LIST_ITEM_COUNTER,
    LIST_ITEM_FLUSH_INSET,
    LIST_ITEM_OUTSET_START,
    LIST_ITEM_OUTSET_END,
    LIST_ITEM_BLEED,
    LIST_ITEM_DIVIDER,
    LIST_ITEM_DIVIDED_RADIUS,
    LIST_ITEM_BAND_RAISED,
    listItemMarkerContainerClassName,
    listItemMarkerDotClassName,
    listItemMarkerCircleClassName,
    listItemMarkerSquareClassName,
    listItemMarkerNumberClassName,
    listItemMarkerCounterClassName.decimal,
    listItemMarkerCounterClassName['lower-alpha'],
    listItemMarkerCounterClassName['lower-roman'],
    listItemMarkerGutterHangClassName,
    listItemTaskMarkerContainerClassName,
  ]) {
    add(className);
  }

  // The reorder machinery: the handle answers the row's `align`, and the
  // list's insertion line and the mode hint's buttons carry no axis.
  for (const rowAlign of [undefined, 'center', 'start', 'first-line']) {
    add(listReorderHandleClassName({rowAlign}));
  }
  add(listReorderLineClassName);
  add(listReorderHintButtonClassName({isText: false}));
  add(listReorderHintButtonClassName({isText: true}));

  add(citationIconWrapClassName);
  add(citationIconClassName);
  add(citationLabelTextClassName);

  // The tab family: a tab and a menu trigger answer the size, the selection
  // and the layout, and each size brings its own minimum block size and icon
  // box. The pieces below the trigger carry no axis.
  for (const size of ['sm', 'md', 'lg']) {
    for (const isSelected of [false, true]) {
      for (const isFill of [false, true]) {
        add(tabClassName({size, isSelected, isFill}));
      }
    }
    for (const hasSelectedOption of [false, true]) {
      add(tabMenuTriggerClassName({size, hasSelectedOption}));
    }
    add(tabHoverLayerClassName(size));
    add(tabMenuHoverLayerClassName(size));
    add(tabIconSizeClassName(size));
  }
  for (const isSelected of [false, true]) {
    add(tabIndicatorClassName({isSelected}));
    add(tabIndicatorClassName({isSelected, color: 'icon'}));
    add(tabMenuItemClassName(isSelected));
  }
  add(TAB_ICON_CLASS);
  add(TAB_LABEL_CONTAINER_CLASS);
  add(TAB_LABEL_TEXT_CLASS);
  add(TAB_LABEL_SIZER_CLASS);
  add(TAB_END_CONTENT_CLASS);
  add(TAB_MENU_TRIGGER_LABEL_CLASS);
  add(TAB_MENU_CHEVRON_CLASS);
  add(TAB_MENU_CHEVRON_ICON_CLASS);
  add(TAB_MENU_CHEVRON_OPEN_CLASS);
  add(TAB_MENU_DROPDOWN_CLASS);
  add(TAB_MENU_ITEM_CONTENT_CLASS);
  add(TAB_MENU_HEADING_CLASS);

  // The segmented control: the track answers the layout, the disabled state
  // and whether the lens paints; a segment answers the size, the selection,
  // the disabled state, the layout, a hidden label and touch presentation.
  for (const isFill of [false, true]) {
    for (const isDisabled of [false, true]) {
      for (const showsLens of [false, true]) {
        add(segmentedControlClassName({isFill, isDisabled, showsLens}));
      }
    }
  }
  for (const size of ['sm', 'md', 'lg']) {
    for (const isSelected of [false, true]) {
      for (const isDisabled of [false, true]) {
        add(
          segmentedItemClassName({
            size,
            isSelected,
            isDisabled,
            isFill: false,
            isLabelHidden: false,
            isTouchPresentation: false,
          }),
        );
      }
    }
    add(segmentedItemIconSizeClassName(size));
  }
  add(
    segmentedItemClassName({
      size: 'md',
      isSelected: true,
      isDisabled: false,
      isFill: true,
      isLabelHidden: true,
      isTouchPresentation: true,
    }),
  );
  add(SEGMENT_ICON_CLASS);
  add(SEGMENT_LABEL_CLASS);

  // The side nav: the rail answers the state of its own collapse, its zones
  // answer where they sit between the fixed edges, and the footer row turns
  // with the rail.
  add(sideNavClassName.root);
  add(sideNavClassName.rootCollapsed);
  add(sideNavClassName.stickyTop);
  add(sideNavClassName.stickyTopCollapsed);
  add(sideNavClassName.scrollable);
  add(sideNavClassName.scrollableCollapsed);
  add(sideNavClassName.scrollableNoTop);
  add(sideNavClassName.scrollableWithTop);
  add(sideNavClassName.scrollableNoBottom);
  add(sideNavClassName.scrollableWithBottom);
  add(sideNavClassName.stickyBottom);
  add(sideNavClassName.stickyBottomCollapsed);
  add(sideNavClassName.footerRow);
  add(sideNavClassName.footerRowCollapsed);
  add(sideNavClassName.footerIcons);
  add(sideNavClassName.footerIconsCollapsed);
  add(sideNavClassName.drawerFooter);
  add(sideNavClassName.drawerFooterIcons);
  add(sideNavClassName.resizableContainer);
  add(sideNavClassName.topbar);
  add(sideNavClassName.topbarIcons);
  for (const value of Object.values(sideNavItemClassName)) {
    add(value);
  }

  for (const value of Object.values(sideNavHeadingClassName)) {
    add(value);
  }

  for (const value of Object.values(treeListItemClassName)) {
    add(value);
  }

  for (const value of Object.values(treeListItemDensityClassName)) {
    add(value);
  }
  // Card: one background per variant, one variable per elevation, and the
  // sizing classes that read a variable.
  add(cardClassName);
  add(cardCornersClassName);
  add(cardBorderClassName);
  add(cardOverflowClassName({hasFixedHeight: false}));
  add(cardOverflowClassName({hasFixedHeight: true}));
  add(cardSizingClassName({height: 1, maxWidth: 1, minHeight: 1, width: 1}));
  for (const value of Object.values(cardVariantClassName)) {
    add(value);
  }
  for (const value of Object.values(cardElevationClassName)) {
    add(value);
  }
  // Divider: one row per orientation, one line per orientation and variant,
  // the label, and the full-bleed arms that read the container padding.
  for (const value of Object.values(dividerClassName)) {
    add(value);
  }
  for (const value of Object.values(dividerLineClassName)) {
    add(value);
  }
  for (const value of Object.values(dividerLineVariantClassName)) {
    add(value);
  }
  for (const value of Object.values(dividerFullBleedClassName)) {
    add(value);
  }
  add(dividerLabelClassName);
  add(dividerVerticalLabelClassName);
  // StatusDot: the plate, its icon field, the pulse, and one class per
  // variant.
  add(statusDotClassName);
  add(statusDotIconClassName);
  add(statusDotPulsingClassName);
  for (const value of Object.values(statusDotVariantClassName)) {
    add(value);
  }
  // Blockquote: the quote and its attribution.
  add(blockquoteClassName);
  add(blockquoteCiteClassName);
  // Code: the inline element, one class per color, and the size arm that
  // adopts the surrounding type.
  add(codeClassName);
  add(codeInheritSizeClassName);
  for (const value of Object.values(codeColorClassName)) {
    add(value);
  }
  // Badge: the pill, the arm that grows with the label, the label, and one
  // class per variant.
  add(badgeClassName);
  add(badgeGrowsClassName);
  add(badgeLabelClassName);
  for (const value of Object.values(badgeVariantClassName)) {
    add(value);
  }
  // Banner: the frame and its elevation, the status header and its fill, the
  // text column, the end area, the content area and the chevron.
  add(bannerClassName);
  add(bannerElevatedCardClassName);
  add(bannerHeaderClassName);
  add(bannerHeaderCenteredClassName);
  add(bannerHeaderCardStandaloneClassName);
  add(bannerHeaderCardWithContentClassName);
  add(bannerHeaderContentClassName);
  add(bannerHeaderContentWithEndContentClassName);
  add(bannerTitleClassName);
  add(bannerDescriptionClassName);
  add(bannerStatusForegroundClassName);
  add(bannerIconWrapperClassName);
  add(bannerEndAreaClassName);
  add(bannerContentAreaClassName);
  add(bannerContentAreaCardClassName);
  add(bannerChevronClassName);
  add(bannerChevronExpandedClassName);
  for (const value of Object.values(bannerElevationClassName)) {
    add(value);
  }
  for (const value of Object.values(bannerStatusClassName)) {
    add(value);
  }
  for (const value of Object.values(bannerStatusControlClassName)) {
    add(value);
  }
  // EmptyState: the container and its compact arm, the text column, the title
  // and description with their compact sizes, and the action row.
  add(emptyStateClassName);
  add(emptyStateCompactClassName);
  add(emptyStateTextGroupClassName);
  add(emptyStateTitleClassName);
  add(emptyStateTitleCompactClassName);
  add(emptyStateDescriptionClassName);
  add(emptyStateDescriptionCompactClassName);
  add(emptyStateActionsClassName);
  add(emptyStateActionsCompactClassName);
  // Timestamp: the `<time>` reset and the hover card's list, row, label, value
  // and action cells with its four grid templates.
  add(timestampClassName);
  add(timestampHoverCardListClassName);
  add(timestampHoverCardRowClassName);
  add(timestampHoverCardLabelClassName);
  add(timestampHoverCardValueClassName);
  add(timestampHoverCardValueCellsClassName);
  add(timestampHoverCardActionClassName);
  // Timer: the inherited-property reset of its `<time>`.
  add(timerClassName);
  // MetadataList: the root, the title, the `dl` reset, the three grid arms,
  // the runtime grid-template class and the show-more toggle.
  add(metadataListClassName);
  add(metadataListTitleClassName);
  add(metadataListResetClassName);
  add(metadataListColumnsClassName);
  for (const value of Object.values(metadataListGridClassName)) {
    add(value);
  }
  add(metadataListToggleClassName);
  // MetadataListItem: the label, the value, the stacked wrapper with its own
  // label and value, and the icon wrapper.
  add(metadataListItemLabelClassName);
  add(metadataListItemValueClassName);
  add(metadataListItemStackedClassName);
  add(metadataListItemStackedLabelClassName);
  add(metadataListItemStackedValueClassName);
  add(metadataListItemIconClassName);
  for (const value of Object.values(timestampHoverCardGridTemplateClassName)) {
    add(value);
  }
  // AspectRatio: the box, its ratio reading the private variable, the ellipse
  // clip, the child wrapper and its three fit arms.
  add(aspectRatioClassName);
  add(aspectRatioRatioClassName);
  add(aspectRatioEllipseClassName);
  add(aspectRatioChildClassName);
  add(aspectRatioChildCenterClassName);
  add(aspectRatioChildFillClassName);
  add(aspectRatioChildCoverClassName);
  add(aspectRatioChildContainClassName);
  // Spinner: the wrapper, the box with its three geometry variables, the ring,
  // the rotor's box and its one animation shorthand, the circle, the arc, the
  // track and one class per size, per shade and per track alpha.
  add(spinnerWrapperClassName);
  add(spinnerClassName);
  add(spinnerRingClassName);
  add(spinnerRotorBoxClassName);
  add(spinnerRotorTurnClassName);
  add(spinnerCircleClassName);
  add(spinnerArcClassName);
  add(spinnerTrackClassName);
  for (const value of Object.values(spinnerSizeClassName)) {
    add(value);
  }
  for (const value of Object.values(spinnerShadeClassName)) {
    add(value);
  }
  for (const value of Object.values(spinnerTrackOpacityClassName)) {
    add(value);
  }
  // Skeleton: the placeholder, the pulse, the two utility classes that read
  // the props' variables, and one class per radius.
  add(skeletonClassName);
  add(skeletonAnimateClassName);
  add(skeletonDelayClassName);
  add(skeletonDimensionsClassName);
  for (const value of Object.values(skeletonRadiusClassName)) {
    add(value);
  }
  // The menu family's leaves: the rule between groups, the heading that names
  // one.
  add(dropdownMenuDividerClassName);
  add(dropdownMenuMarkerClassName);
  add(dropdownMenuRadioGroupClassName);
  for (const isDisabled of [true, false]) {
    add(dropdownMenuCheckableRowClassName({isDisabled}));
  }
  for (const value of Object.values(dropdownMenuSheetClassName)) {
    add(value);
  }
  add(dropdownMenuGroupHeadingClassName);
  add(dropdownMenuTreeClassName);
  add(dropdownMenuTreeHiddenClassName);
  for (const value of Object.values(menuBottomSheetClassName)) {
    add(value);
  }
  for (const value of Object.values(menuBottomSheetActionListClassName)) {
    add(value);
  }
  for (const size of ['sm', 'md', 'lg']) {
    add(
      dropdownMenuItemClassName({
        isDestructive: false,
        isDisabled: false,
        size,
      }),
    );
  }
  add(
    dropdownMenuItemClassName({
      isDestructive: true,
      isDisabled: true,
      size: 'md',
    }),
  );
  add(dropdownMenuSubMenuDrillInClassName);
  add(dropdownMenuSubMenuFlyoutClassName);
  add(dropdownMenuSubMenuScrollClassName);
  add(dropdownMenuSubMenuTouchClassName);
  add(dropdownMenuSubMenuTouchPinchClassName);
  for (const isOpen of [true, false]) {
    add(
      dropdownMenuSubMenuTriggerClassName({
        isDisabled: false,
        size: 'md',
        isOpen,
      }),
    );
  }

  for (const isSelected of [true, false]) {
    add(checkboxListItemClassName({isSelected, className: undefined}));
  }

  // Chat: the tokenized text root and the inline box a token renders in.
  add(chatTokenizedTextClassName);
  add(chatTokenizedTextTokenClassName);
  add(chatSendButtonClassName);
  add(chatPastedTextPreviewClassName);
  add(chatPastedTextPreviewTextClassName);
  add(chatPastedTextFooterClassName);
  add(chatPastedTextMetaClassName);
  add(chatSystemMessageClassName);
  add(chatSystemMessageDividerClassName);
  add(chatSystemMessageIconClassName);
  add(chatSystemMessageContentClassName);
  add(chatMessageMetadataClassName);
  add(chatMessageMetadataUserClassName);
  add(chatMessageMetadataAssistantClassName);
  add(chatMessageMetadataStatusRowClassName);
  add(chatMessageMetadataStatusErrorClassName);
  add(chatMessageMetadataStatusPulseClassName);
  for (const orientation of ['vertical', 'horizontal']) {
    add(radioListClassName({orientation}));
  }
  add(radioListItemIndicatorSlotClassName);
  add(radioListItemPressOverlayClassName);
  for (const size of ['sm', 'md']) {
    add(radioListItemWrapperClassName({size}));
    add(radioListItemInputClassName({size}));
  }
  // CheckboxInput: the field root at both width states, the row in its four
  // shape states, and the fixed pieces.
  for (const width of [null, 240]) {
    add(checkboxInputClassName({width}));
  }
  for (const isLabelHidden of [false, true]) {
    for (const hasHitArea of [false, true]) {
      add(checkboxInputRowClassName({isLabelHidden, hasHitArea}));
    }
  }
  for (const size of ['sm', 'md']) {
    add(checkboxInputWrapperClassName({size}));
    add(checkboxInputNativeClassName({size}));
  }
  add(checkboxInputRowPressImageClassName);
  add(checkboxInputRowPressOverlayClassName);
  add(checkboxInputPressOverlayClassName);
  add(checkboxInputIndicatorSlotClassName);
  add(checkboxInputLabelWrapperClassName);

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
    // Toolbar about 40, the layout shell and region maps about 110, the input
    // field family about 60, Table's sorting, filtering and selection maps
    // about 60, the choice-input rows of Selector, MultiSelector and Typeahead
    // about 85, the link-and-item family about 100 (Link, Citation,
    // BreadcrumbItem, Token, Pagination and the avatar status dot), the date
    // and time inputs about 50, the dialog family about 35, the top-nav family
    // about 45, the item row machine about 45, and the tab family — TabList's
    // strip, masks and arrows, TabMenu, SegmentedControl — about 120. A scan
    // that reaches component bodies or prose would add hundreds more. The
    // top-nav menus and the row machine brought the sheet to about 975; the
    // side-nav row's class map added its own transition and popover utilities.
    // The display-and-feedback family added Card's thirteen variant
    // backgrounds, four elevation variables and its sizing classes, which took
    // the sheet from 1016 rules to 1042. Divider's row, line, weight, label
    // and full-bleed classes added 8, Banner's status fills and their
    // forced-colors outlines, the text column and the content area added 26.
    // The side-nav heading and the tree row reuse almost every utility their
    // own families already spell, and their few new ones (the indent column's
    // padding, the chevron's rotate pair) took the sheet to 1055. The drawer
    // panel added two sides, two painting states, two direction arms and the
    // scrim — about 60 — and the mobile nav about 30: its dialog, the scrim's
    // fade, both drawer edges in both motion states, and the header. Card's
    // four elevation variables were reused by the dialog family maps, so the
    // sum of the two families is smaller than their parts. The sub-menu's
    // flyout surface, its scroll gesture and the two cap fallbacks under
    // `@supports` added 13. The display-and-feedback family's Badge, Code,
    // Blockquote and StatusDot maps added about 45 more. The menu's checkable
    // rows, its marker placement, the radio group's column, the sheet's
    // content box and action list, and the two drill-in wrappers added 18:
    // mostly one rule each, with the marker's two coarse-pointer arms and the
    // row's three radius parts already spelled elsewhere. Skeleton's map added
    // 25 — the placeholder, the pulse, the two classes that read the props'
    // variables, and one per radius. With every family above the sheet sat at
    // 1212, and the windows merged since — the menu surface, EmptyState,
    // Timestamp — carried it further. The popover's map then moved from StyleX
    // to literal classes: its surface, both viewport-fit states, the two sizing
    // classes, the anchor wrapper and both hidden close wrappers. Spinner's box,
    // ring, rotor, circle, arc, track and its twelve size, shade and alpha
    // classes, AspectRatio's box, ratio, ellipse clip and four child arms, then
    // ScrollableArea's platform, inset and both fade arms measured 1330 with
    // every family above registered. The chat pasted-text preview, the system
    // notice and the metadata row share almost every utility those maps already
    // spell, and the checkbox field's row, box, press layers and native input
    // added six; the sheet measures 1318 here and the ceiling keeps headroom.
    expect(stylesheet.rules.size).toBeLessThan(1380);
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
    ).toBe('padding-block-start:calc(var(--border-width)+var(--spacing-1));');
    expect(stylesheet.ruleFor('h-5')).toBe('height:calc(var(--spacing-1)*5);');
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

  it('keeps the filter trigger a touch target only on a coarse pointer', () => {
    expect(stylesheet.blockOf('pointer-coarse:[min-width:44px]')).toContain(
      'min-width:44px;',
    );
    expect(stylesheet.blockOf('pointer-coarse:[min-width:44px]')).toContain(
      '@media(pointer:coarse)',
    );
  });

  it('sizes a windowed gap cell from its inline variable', () => {
    // A windowed body keeps the place of the rows it unmounts, and the size
    // it keeps is the one value no class can carry.
    expect(
      stylesheet.ruleFor('[block-size:var(--_table-gap-block-size)]'),
    ).toBe('block-size:var(--_table-gap-block-size);');
    expect(
      stylesheet.ruleFor('[inline-size:var(--_table-gap-inline-size)]'),
    ).toBe('inline-size:var(--_table-gap-inline-size);');
  });

  it('dims an unused header control until its header is hovered', () => {
    expect(stylesheet.blockOf('opacity-[0.35]')).toContain('opacity:0.35;');
    expect(stylesheet.blockOf('[&:is(th:hover_*)]:opacity-100')).toContain(
      '&:is(th:hover*){',
    );
  });

  it('stripes only the rows that are not detail panels', () => {
    // A panel is a sibling row in the same body, so the stripe counts only
    // rows that are not panels; an open panel cannot flip the parity.
    const block = stylesheet.blockOf(
      '[&:nth-child(even_of_:not([data-expansion-panel]))]:bg-[var(--color-background-muted)]',
    );
    expect(block).toContain('nth-child(evenof:not([data-expansion-panel]))');
    expect(block).toContain('background-color:var(--color-background-muted)');
  });

  it('paints the row highlight only where a pointer can hover', () => {
    expect(
      stylesheet.blockOf(
        '[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:bg-[var(--color-overlay-hover)]',
      ),
    ).toContain('@media(hover:hover)');
  });

  it('zeroes the row divider on the last row, paint and width alike', () => {
    // The pinned-column plugin reads the published width, so the reset has to
    // cover the variable as well as the border.
    expect(
      stylesheet.blockOf('[tr:last-child>&]:[--_table-row-divider-width:0px]'),
    ).toContain('tr:last-child>&{--_table-row-divider-width:0px;}');
    expect(
      stylesheet.blockOf(
        '[tr[data-table-final-row=true]>&]:[border-bottom-width:0]',
      ),
    ).toContain('tr[data-table-final-row=true]>&{border-bottom-width:0;}');
  });

  it('aligns a body cell on the axis the table asks for', () => {
    // The cell's own test reads the class; this pins what the class paints.
    expect(stylesheet.ruleFor('align-middle')).toBe('vertical-align:middle;');
    expect(stylesheet.ruleFor('align-top')).toBe('vertical-align:top;');
    expect(stylesheet.ruleFor('align-bottom')).toBe('vertical-align:bottom;');
  });

  it('moves the row highlight on the shared duration and easing', () => {
    expect(stylesheet.ruleFor('transition-[background-color]')).toContain(
      'transition-property:background-color;',
    );
    expect(stylesheet.ruleFor('duration-[var(--duration-fast)]')).toContain(
      'transition-duration:var(--duration-fast);',
    );
    expect(stylesheet.ruleFor('ease-[var(--ease-standard)]')).toContain(
      'transition-timing-function:var(--ease-standard);',
    );
  });

  it('wraps a body cell instead of clipping it when the table asks for wrap', () => {
    expect(stylesheet.ruleFor('[overflow-wrap:break-word]')).toBe(
      'overflow-wrap:break-word;',
    );
    expect(stylesheet.ruleFor('[word-break:break-word]')).toBe(
      'word-break:break-word;',
    );
    expect(stylesheet.ruleFor('text-ellipsis')).toBe('text-overflow:ellipsis;');
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

  it('sizes the icon box on its four steps', () => {
    // Button and the Table row expansion put the box beside the glyph, so the
    // box reads the theme's vars too and each step's rem value is the
    // fallback. The glyph's own size class reads the same vars.
    expect(stylesheet.ruleFor('[width:var(--_icon-width,0.75rem)]')).toBe(
      'width:var(--_icon-width,0.75rem);',
    );
    expect(stylesheet.ruleFor('[height:var(--_icon-height,1.5rem)]')).toBe(
      'height:var(--_icon-height,1.5rem);',
    );
    expect(
      stylesheet.ruleFor(
        '[font-size:min(var(--_icon-width,1rem),var(--_icon-height,1rem))]',
      ),
    ).toBe('font-size:min(var(--_icon-width,1rem),var(--_icon-height,1rem));');
  });

  it('paints the lit menu row from the mark it carries', () => {
    // The row reads the variable in its own `:focus` background, so the marked
    // row paints the pressed overlay. Neither variable has a default: a
    // default would print in the same layer as the mark and win on order.
    expect(
      stylesheet.blockOf(
        '[&[data-astryx-menu-press-lit]]:[--_menu-row-focus-paint:var(--color-overlay-pressed)]',
      ),
    ).toContain(
      '&[data-astryx-menu-press-lit]{--_menu-row-focus-paint:var(--color-overlay-pressed);}',
    );
    expect(
      stylesheet.blockOf(
        '[&[data-astryx-menu-press-lit]]:[--_menu-row-active-paint:var(--color-overlay-pressed)]',
      ),
    ).toContain(
      '&[data-astryx-menu-press-lit]{--_menu-row-active-paint:var(--color-overlay-pressed);}',
    );
  });

  it('shows the list insertion line only while the list is marked', () => {
    // The class moves `display` alone; the line's content, size and colour stay
    // in the list's own style. Both arms name `::after` themselves, because
    // Tailwind's `after:` variant would also declare `content`.
    expect(stylesheet.blockOf('[&::after]:hidden')).toContain('display:none;');
    const marked = stylesheet.blockOf(
      '[&[data-astryx-reorder-line]::after]:block',
    );
    expect(marked).toContain('display:block;');
    expect(marked).not.toContain('content');
  });

  it('clips the list inline, so a row dragged aside paints no further', () => {
    // `clip`, never `hidden`: hidden makes a scroll container, which fights
    // the list's vertical scroller.
    expect(stylesheet.ruleFor('overflow-x-clip')).toBe('overflow-x:clip;');
  });

  it('publishes the list corners a bled row takes', () => {
    // A bled row squares itself and reads the corner the list publishes for
    // the container's first and last rows. The plain class publishes zero, so
    // a list that is not the container's first child keeps a square corner.
    expect(stylesheet.blockOf('[--_list-corner-start-start:0px]')).toBe(
      '--_list-corner-start-start:0px;',
    );
    const corner =
      'first:[--_list-corner-start-start:max(0px,var(--container-corner-start-start,0px)-var(--container-padding-block-start,0px))]';
    expect(stylesheet.blockOf(corner)).toContain(
      '&:first-child{--_list-corner-start-start:max(0px,var(--container-corner-start-start,0px)-var(--container-padding-block-start,0px));}',
    );
  });

  it('reads a counted list start from the property the list writes', () => {
    // The number is a per-instance value no class can name, so it travels as
    // an inline property the class reads.
    expect(stylesheet.ruleFor(listCounterStartClassName)).toBe(
      'counter-reset:astryx-listvar(--astryx-list-counter-start);',
    );
    expect(stylesheet.ruleFor(LIST_COUNTER)).toBe('counter-reset:astryx-list;');
  });

  it('draws the list row divider and clears it after the last row', () => {
    // The divider is the row's block-end border, so the last row clears it on
    // the same longhand: a reset the row could not cancel would leave a line
    // under the list's last row.
    expect(stylesheet.ruleFor(LIST_ITEM_DIVIDER_END_WIDTH)).toBe(
      'border-block-end-width:var(--border-width);',
    );
    expect(stylesheet.blockOf(LIST_ITEM_DIVIDER_LAST_RESET)).toContain(
      'border-block-end-width:0px;',
    );
  });

  it('keys the row edge treatments on the edge the row carries', () => {
    // The row and the Item frame style one box, and the sheet decides a tie
    // between two plain utilities. Every declaration that has to win is keyed
    // on the edge attribute, and an attribute selector outranks a utility.
    expect(stylesheet.blockOf(LIST_ITEM_FLUSH_INSET)).toBe(
      '&[data-astryx-list-edge=flush]{--_item-inset-inline:0px;}',
    );
    // The outset only sets margins, which the frame leaves alone, so it needs
    // no key: each edge reads its own container padding variable.
    expect(stylesheet.ruleFor(LIST_ITEM_OUTSET_START)).toBe(
      'margin-inline-start:max(var(--container-padding-inline-start,0px)-var(--_item-inset-inline),0px);',
    );
    expect(stylesheet.blockOf(LIST_ITEM_OUTSET_END)).toContain(
      'margin-inline-end:max(var(--container-padding-inline-end,0px)-var(--_item-inset-inline),0px);',
    );
  });

  it('fills a bled row and squares it, keeping the container corners on the ends', () => {
    const bleed = stylesheet.blockOf(
      '[&[data-astryx-list-edge=bleed]]:ps-[max(var(--container-padding-inline-start,0px),var(--_item-inset-inline))]',
    );
    expect(bleed).toContain(
      'padding-inline-start:max(var(--container-padding-inline-start,0px),var(--_item-inset-inline));',
    );
    // A row that meets the container's straight sides takes no radius, and the
    // first and last rows take the corners the list publishes.
    expect(stylesheet.blockOf(LIST_ITEM_DIVIDED_RADIUS)).toContain(
      'border-radius:0px;',
    );
    const corner =
      '[&[data-astryx-list-edge=bleed]:first-child]:[border-start-start-radius:var(--_list-corner-start-start,0px)]';
    expect(stylesheet.blockOf(corner)).toContain(
      'border-start-start-radius:var(--_list-corner-start-start,0px);',
    );
  });

  it('raises the touch band only under a finger', () => {
    // The band rises above the rows after it, so a later row does not
    // hit-test over it; the row box itself stays no stacking context.
    expect(stylesheet.blockOf(LIST_ITEM_BAND_RAISED)).toBe(
      '@media(pointer:coarse){&::after{z-index:1;}}',
    );
  });

  it('counts a row in and hangs its counter from the row inset', () => {
    expect(stylesheet.ruleFor(LIST_ITEM_COUNTER)).toBe(
      'counter-increment:astryx-list;',
    );
    // The period after the number, then the hang into the row's inset.
    expect(
      stylesheet.blockOf('[&::before]:[content:counter(astryx-list)_"."]'),
    ).toBe('&::before{content:counter(astryx-list)".";}');
    expect(
      stylesheet.blockOf('[&::before]:ms-[calc(var(--_item-inset-inline)*-1)]'),
    ).toContain('margin-inline-start:calc(var(--_item-inset-inline)*-1);');
  });

  it('draws the segmented lens from the variables the motion writes', () => {
    // The lens is the track's own `::before`/`::after`, so each declaration
    // reads a variable the selection motion writes and falls back to the
    // resting value. `forced-color-adjust` keeps an already resolved surface
    // from being remapped a second time under forced colors.
    const before = stylesheet.blockOf(
      '[&::before]:[box-shadow:var(--_segmented-lens-box-shadow,none)]',
    );
    expect(before).toContain(
      'box-shadow:var(--_segmented-lens-box-shadow,none);',
    );
    expect(
      stylesheet.blockOf(
        '[&::before]:[visibility:var(--_segmented-lens-visibility,hidden)]',
      ),
    ).toContain('visibility:var(--_segmented-lens-visibility,hidden);');
    const after = stylesheet.blockOf(
      '[&::after]:[background-color:var(--_segmented-after-background-color,transparent)]',
    );
    expect(after).toContain(
      'background-color:var(--_segmented-after-background-color,transparent);',
    );
    expect(
      stylesheet.blockOf('[&::before]:[forced-color-adjust:none]'),
    ).toContain('forced-color-adjust:none;');
  });

  it('rounds a segment by the track radius less the track padding', () => {
    // Concentric radii: the segment's corners keep the track's inset, so a
    // theme that changes either variable keeps the nesting true.
    expect(
      stylesheet.blockOf(
        'rounded-[max(0px,calc(var(--_segmented-control-radius)_-_var(--_segmented-control-padding)))]',
      ),
    ).toContain(
      'border-radius:max(0px,calc(var(--_segmented-control-radius)-var(--_segmented-control-padding)));',
    );
  });

  it('caps a labelled track and leaves an icon-only track uncapped', () => {
    // Only a track whose segments carry a visible label can truncate, so only
    // that track takes the container's width as a cap.
    expect(
      stylesheet.blockOf(
        '[&:has([role=radio]:not([aria-label]))]:[max-width:100%]',
      ),
    ).toContain('max-width:100%;');
    expect(stylesheet.ruleFor('[max-width:none]')).toBe('max-width:none;');
  });

  it('keeps the selected segment perceivable under forced colors', () => {
    // The arms key off `aria-checked` so they outrank the segment's own
    // surface and colour inside `astryx-base`, where specificity decides.
    const surface = stylesheet.blockOf(
      'aria-checked:forced-colors:bg-[color:Highlight]',
    );
    expect(surface).toContain('@media(forced-colors:active)');
    expect(surface).toContain('background-color:Highlight');
    const label = stylesheet.blockOf(
      'aria-checked:forced-colors:text-[color:HighlightText]',
    );
    expect(label).toContain('@media(forced-colors:active)');
    expect(label).toContain('color:HighlightText');
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
      'astryxDialogEnter',
      'astryxDialogEnterFullscreen',
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

  it('carries the dialog entrance and the dialog state classes', () => {
    // The native `open` attribute is the dialog's open state, and its backdrop
    // is a pseudo-element of the same element.
    expect(stylesheet.blockOf('open:flex')).toContain('display:flex;');
    expect(stylesheet.ruleFor('hidden')).toBe('display:none;');
    expect(stylesheet.blockOf('backdrop:bg-[var(--color-overlay)]')).toContain(
      '::backdrop{background-color:var(--color-overlay);}',
    );
    expect(stylesheet.compact).toContain(
      '@keyframesastryxDialogEnter{from{opacity:0;transform:translate(var(--astryx-dialog-dir-x,0px),var(--astryx-dialog-dir-y,16px))scale(0.95);}',
    );
    expect(stylesheet.compact).toContain(
      '@keyframesastryxDialogEnterFullscreen{from{opacity:0;}to{opacity:1;}}',
    );
  });

  it('keeps the dialog coarse-pointer fade after its instant arm', () => {
    // Both arms are Reduce Motion matches that only a pointer splits, so the
    // later one in the sheet wins: the fade must follow the instant arm.
    const flat = stylesheet.compact.replace(/\\/g, '');
    const instant = flat.indexOf('.motion-reduce:open:[animation-name:none]{');
    const fade = flat.indexOf(
      '.motion-reduce:pointer-coarse:open:[animation-name:astryxDialogEnterFullscreen]{',
    );
    expect(instant).toBeGreaterThan(-1);
    expect(fade).toBeGreaterThan(instant);
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
