// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file chatClasses.ts
 * @input Nothing; every chat element states one appearance here
 * @output Tailwind utility class names for the tokenized text, the system
 *   message, the message bubble and the composer's buttons
 * @position Internal to Chat.
 */

import {tw} from '../utils/tw';
import type {SpacingStep} from '../utils/types';
import type {ChatDensity, ChatMessageSender} from './ChatContext';
import type {ChatToolCallStatus} from './ChatToolCalls';

/** The send button: circular, and it keeps its width in a tight composer. */
export const chatSendButtonClassName =
  'shrink-0 rounded-[var(--_button-radius,var(--radius-full))]';

/**
 * A ring drawn inside an element whose edges are the viewport's or a clipping
 * box's. `focusOutlineStyles` supplies the width, style and colour from the
 * tokens; this overrides only the offset, and it wins because its rule and the
 * shared one both land in `astryx-base`, where sheet order decides.
 */
export const chatFocusRingInsetClassName =
  'focus-visible:[outline-offset:calc(-1*var(--focus-outline-width))]';

/** The tokenized text root: inline, so a token flows with the words. */
export const chatTokenizedTextClassName = 'inline';

/** One token in running text: an inline box one line tall, top-aligned. */
export const chatTokenizedTextTokenClassName = tw(
  'inline-flex items-center h-[1lh] align-top',
);

/** The pasted-text preview card: a column, capped so long text scrolls. */
export const chatPastedTextPreviewClassName = tw(
  'flex flex-col gap-2 max-w-[480px]',
);

/** The preview's text: monospaced, so the pasted indentation shows. */
export const chatPastedTextPreviewTextClassName = tw(
  '[font-family:var(--font-family-code)]',
  'text-[length:var(--text-supporting-size)] leading-[var(--text-supporting-leading)]',
  'text-[color:var(--color-text-primary)]',
  'whitespace-pre-wrap break-words max-h-[240px] overflow-y-auto',
);

/** The preview's footer: the count on one side, the Expand button on the other. */
export const chatPastedTextFooterClassName = tw(
  'flex items-center justify-between gap-2',
);

/** The pasted-text count, quieter than the preview it labels. */
export const chatPastedTextMetaClassName = tw(
  'text-[length:var(--text-supporting-size)] text-[color:var(--color-text-secondary)]',
);

/** A system notice: centered muted supporting text, one line of padding. */
export const chatSystemMessageClassName = tw(
  'flex items-center justify-center gap-2 py-1',
  '[font-family:var(--font-family-body)]',
  'text-[length:var(--text-supporting-size)] font-normal',
  'text-[color:var(--color-text-secondary)] text-center',
);

/** The divider variant's wrapper: the Divider spans the whole row. */
export const chatSystemMessageDividerClassName = 'w-full';

/** The notice's icon slot: it never shrinks away from the text. */
export const chatSystemMessageIconClassName =
  'inline-flex items-center shrink-0';

/** The notice's text row: the icon and the words sit six pixels apart. */
export const chatSystemMessageContentClassName =
  'inline-flex items-center gap-1.5';

/** The metadata row under a message: supporting text, one step below it. */
export const chatMessageMetadataClassName = tw(
  'flex items-center gap-1 mt-1',
  'text-[length:var(--text-supporting-size)] font-normal',
  'leading-[var(--text-supporting-leading)]',
  'text-[color:var(--color-text-secondary)]',
);

/** A user message reads from the writer's edge, so its row reverses. */
export const chatMessageMetadataUserClassName = 'flex-row-reverse';

/** An assistant message keeps the row in reading order. */
export const chatMessageMetadataAssistantClassName = 'flex-row';

/** The delivery status: an icon and its word, four pixels apart. */
export const chatMessageMetadataStatusRowClassName =
  'inline-flex items-center gap-1';

/** A failed delivery takes the error colour. */
export const chatMessageMetadataStatusErrorClassName =
  'text-[color:var(--color-text-error)]';

/**
 * A message in flight breathes; the motion arm yields to a reader who asked
 * for less movement.
 */
export const chatMessageMetadataStatusPulseClassName = tw(
  'animate-[astryxChatStatusPulse_1.5s_ease-in-out_infinite]',
  'motion-reduce:animate-none',
);

// ---------------------------------------------------------------------------
// ChatMessageBubble
// ---------------------------------------------------------------------------

/** The per-instance custom properties a bubble's sizing classes read. */
export const chatMessageBubbleSizeVars = {
  width: '--astryx-chat-bubble-width',
} as const;

/**
 * The bubble surface. One class per property: a bubble with an explicit width
 * states its own `max-width` here instead of relying on a later class to
 * outrank the default cap, and a compact bubble states its own radius.
 */
export function chatMessageBubbleClassName({
  hasWidth,
  isCompact,
}: {
  hasWidth: boolean;
  isCompact: boolean;
}): string {
  return tw(
    'flex flex-col break-words [word-break:break-word]',
    '[font-family:var(--font-family-body)]',
    'text-[length:var(--text-body-size)] leading-[var(--text-body-leading)]',
    hasWidth ? 'max-w-none' : 'max-w-[max(80%,280px)]',
    hasWidth && 'w-[var(--astryx-chat-bubble-width)]',
    // Bubbles are intentionally rounder than cards in the same view, so they
    // use the dedicated chat radius rather than coupling to --radius-page.
    isCompact
      ? 'rounded-[var(--radius-container)]'
      : 'rounded-[var(--radius-chat)]',
  );
}

/** A ghost bubble keeps its padding for alignment and paints nothing. */
export function chatMessageBubbleSurfaceClassName({
  isGhost,
}: {
  isGhost: boolean;
}): string {
  return isGhost ? 'bg-transparent' : 'bg-[var(--color-neutral)]';
}

/** The bubble's text colour, the same in every variant. */
export const chatMessageBubbleTextClassName =
  'text-[color:var(--color-text-primary)]';

/**
 * The bubble's inset: density sets both edges, and a ghost bubble keeps the
 * inline inset so its text still lines up with a filled bubble's.
 */
export function chatMessageBubblePaddingClassName({
  density,
  isGhost,
}: {
  density: ChatDensity;
  isGhost: boolean;
}): string {
  return tw(
    density === 'spacious' ? 'px-5' : 'px-4',
    isGhost ? 'py-0' : density === 'spacious' ? 'py-4' : 'py-3',
  );
}

/**
 * Grouped bubbles tighten the corner on the sender's own side. Logical radii,
 * so the tail follows reading direction: assistant tucks toward the inline
 * start, user toward the inline end, in both directions.
 */
export const chatMessageBubbleGroupClassName: Record<
  'assistant' | 'user',
  Record<'first' | 'middle' | 'last', string>
> = {
  assistant: {
    first: 'rounded-es-xs',
    middle: 'rounded-ss-xs rounded-es-xs',
    last: 'rounded-ss-xs',
  },
  user: {
    first: 'rounded-ee-xs',
    middle: 'rounded-se-xs rounded-ee-xs',
    last: 'rounded-se-xs',
  },
};

/** The name and metadata slots: they match the bubble's inline inset. */
export function chatMessageBubbleSlotPaddingClassName(
  density: ChatDensity,
): string {
  return density === 'spacious' ? 'px-5' : 'px-4';
}

/** The name slot above a bubble: one line tall, so the avatar can line up. */
export const chatMessageBubbleNameRowClassName = tw(
  'flex items-center h-5',
  // The bubble's own block padding closes the gap under the name.
  '-mb-1.5',
);

/** The metadata slot below a bubble: its own block padding closes that gap. */
export const chatMessageBubbleMetadataRowClassName = '-mt-1.5';

/** A user message reads from the writer's edge, so its slots align there. */
export const chatMessageBubbleAlignEndClassName = 'text-end';

// ---------------------------------------------------------------------------
// ChatMessage
// ---------------------------------------------------------------------------

/**
 * The message article. The avatar's offset lives on the article as a private
 * variable, judged from this element's own `:has()`, so the sheet keeps no
 * sibling-relative selector. A message with a name row shifts the avatar by
 * that row's height.
 */
export function chatMessageClassName({
  density,
  hasAvatar,
  sender,
}: {
  density: ChatDensity;
  hasAvatar: boolean;
  sender: ChatMessageSender;
}): string {
  return tw(
    'flex items-start max-w-full',
    sender === 'system'
      ? 'flex-row justify-center'
      : sender === 'user'
        ? 'flex-row-reverse justify-start'
        : 'flex-row justify-start',
    // The gap only ever separates the avatar from the content column.
    hasAvatar &&
      (density === 'compact'
        ? 'gap-1.5'
        : density === 'spacious'
          ? 'gap-3'
          : 'gap-2'),
    '[--_chat-avatar-offset:0px]',
    '[&:has([data-chat-name])]:[--_chat-avatar-offset:var(--spacing-5)]',
  );
}

/** The avatar slot: collapses when the caller's avatar renders nothing. */
export const chatMessageAvatarWrapClassName = tw(
  'shrink-0',
  'mt-[var(--_chat-avatar-offset)]',
  '[&:empty]:hidden',
);

/** The content column: the name row, the children and the metadata slot. */
export function chatMessageContentClassName(sender: ChatMessageSender): string {
  return tw(
    'flex flex-col flex-1 min-w-0',
    sender === 'system'
      ? 'max-w-[90%] items-center'
      : sender === 'user'
        ? 'items-end'
        : 'items-start',
  );
}

/** The sender's name above the content, in supporting type. */
export const chatMessageNameClassName = tw(
  '[&:empty]:hidden',
  'text-[length:var(--text-supporting-size)] leading-[var(--text-supporting-leading)]',
  'font-semibold text-[color:var(--color-text-secondary)]',
  'mb-1',
);

/** The metadata slot collapses when the caller passes no metadata. */
export const chatMessageMetadataSlotClassName = '[&:empty]:hidden';

/** The children stack, aligned to the sender's edge and spaced by density. */
export function chatMessageChildrenClassName({
  density,
  sender,
}: {
  density: ChatDensity;
  sender: ChatMessageSender;
}): string {
  return tw(
    'flex flex-col min-w-0 w-full',
    sender === 'system'
      ? 'items-center'
      : sender === 'user'
        ? 'items-end'
        : 'items-start',
    density === 'compact'
      ? 'gap-0.5'
      : density === 'spacious'
        ? 'gap-1.5'
        : 'gap-1',
  );
}

// ---------------------------------------------------------------------------
// ChatLayout
// ---------------------------------------------------------------------------

/** The per-instance geometry a layout writes, in pixels, for a class to read. */
export const chatLayoutSizeVars = {
  dockLift: '--astryx-chat-dock-lift',
  endRoom: '--astryx-chat-end-room',
} as const;

/**
 * The layout root: a flex column, so the sticky dock's natural height is part
 * of the 100% the message area fills instead of spilling out below it once the
 * keyboard lifts it, and a container so children can query its inline size.
 */
export function chatLayoutRootClassName(isSelfScrolling: boolean): string {
  return tw(
    'relative [container-type:inline-size] min-h-0 flex-1 flex flex-col',
    isSelfScrolling && 'overflow-x-hidden overflow-y-auto',
  );
}

/**
 * The message area grows into the space the dock leaves and never shrinks
 * below its content, so long content overflows the root and scrolls. Its end
 * padding also holds whatever the dock covers: the part of the keyboard over
 * it and, when the dock is fixed, the dock's own height.
 */
export function chatLayoutMessageAreaClassName({
  density,
  hasEndRoom,
}: {
  density: ChatDensity;
  hasEndRoom: boolean;
}): string {
  return tw(
    'flex flex-col mx-auto grow shrink-0 basis-auto w-full',
    density === 'spacious' ? 'max-w-[800px] px-4' : 'max-w-full px-0',
    hasEndRoom
      ? 'pb-[calc(var(--spacing-6)+var(--astryx-chat-end-room))]'
      : 'pb-6',
  );
}

/** The placeholder for a conversation with no messages yet. */
export const chatLayoutEmptyStateClassName =
  'flex items-center justify-center flex-1 min-h-[200px]';

/**
 * The dock's box: it leaves the pointer to the dock itself, keeps the sticky
 * (or fixed) position, and lifts by the part of the keyboard that covers it.
 */
export function chatLayoutDockContainerClassName({
  isFixed,
  hasLift,
}: {
  isFixed: boolean;
  hasLift: boolean;
}): string {
  return tw(
    'inset-x-0 z-0 isolate pointer-events-none shrink-0',
    isFixed ? 'fixed' : 'sticky',
    hasLift ? 'bottom-[var(--astryx-chat-dock-lift)]' : 'bottom-0',
  );
}

/** The frosted layer: a blur that fades in over the first third of its height. */
export function chatLayoutBlurLayerClassName(density: ChatDensity): string {
  return tw(
    'absolute bottom-0 inset-x-0 pointer-events-none backdrop-blur-[12px]',
    density === 'compact'
      ? 'h-20 [mask-image:linear-gradient(to_bottom,transparent,black_24px)]'
      : density === 'spacious'
        ? 'h-[120px] [mask-image:linear-gradient(to_bottom,transparent,black_48px)]'
        : 'h-[100px] [mask-image:linear-gradient(to_bottom,transparent,black_36px)]',
  );
}

/** The composer's region: it takes the pointer back from the dock's box. */
export function chatLayoutDockClassName(density: ChatDensity): string {
  return tw(
    'relative z-[1] pointer-events-auto',
    density === 'compact'
      ? 'px-2 pb-2'
      : density === 'spacious'
        ? 'px-4 pb-3'
        : 'px-3 pb-3',
  );
}

/** The dock's inner column: the composer's own cap, not the viewport's. */
export function chatLayoutDockInnerClassName(density: ChatDensity): string {
  return tw(
    'mx-auto w-full',
    density === 'spacious' ? 'max-w-[800px]' : 'max-w-full',
  );
}

// ---------------------------------------------------------------------------
// ChatMessageList
// ---------------------------------------------------------------------------

/**
 * The log and the rows column inside it: both fill the area that scrolls them,
 * and neither shrinks below its content.
 */
export const chatMessageListColumnClassName = 'flex flex-col flex-1 min-h-0';

/** The density's own row gap, used when the caller sets no gap. */
const chatMessageListDensityGapClassName: Record<ChatDensity, string> = {
  compact: 'gap-2',
  balanced: 'gap-4',
  spacious: 'gap-6',
};

/** A caller's row gap, on the spacing scale. */
const chatMessageListGapClassName: Record<SpacingStep, string> = {
  0: 'gap-0',
  0.5: 'gap-0.5',
  1: 'gap-1',
  1.5: 'gap-1.5',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  8: 'gap-8',
  10: 'gap-10',
};

/**
 * The rows column: density states its own inset, and a caller's gap replaces
 * the density's rather than competing with it, so only one gap class is ever
 * present.
 */
export function chatMessageListInnerClassName({
  density,
  gap,
}: {
  density: ChatDensity;
  gap: SpacingStep | undefined;
}): string {
  return tw(
    chatMessageListColumnClassName,
    density === 'compact'
      ? 'px-3 py-2'
      : density === 'spacious'
        ? 'px-6 py-6'
        : 'px-4 py-4',
    gap == null
      ? chatMessageListDensityGapClassName[density]
      : chatMessageListGapClassName[gap],
  );
}

/** The sentinel row at the top that asks for older messages. */
export const chatMessageListLoadingClassName = 'flex justify-center py-3';

/** The spacer that holds a short list against the composer. */
export const chatMessageListSpacerClassName = 'flex-1 min-h-0';

/** The accepted empty state, centered in the space the rows would fill. */
export const chatMessageListEmptyStateClassName =
  'flex items-center justify-center flex-1 min-h-0';

// ---------------------------------------------------------------------------
// ChatComposerDrawer
// ---------------------------------------------------------------------------

/**
 * The drawer panel: it tucks behind the composer, so it ends with a negative
 * margin one composer radius deep, and its own bottom inset clears that
 * overlap. The muted tint is a background image over the surface colour, both
 * in the element's own paint layer, so nothing needs a position or a z-index.
 */
export const chatComposerDrawerClassName = tw(
  'relative z-[1] flex flex-col overflow-hidden px-4 pt-3',
  'pb-[calc(var(--spacing-3)+var(--radius-chat))] -mb-[var(--radius-chat)]',
  'bg-[var(--color-background-surface)]',
  'bg-[linear-gradient(var(--color-background-muted),var(--color-background-muted))]',
  'rounded-ss-[var(--radius-chat)] rounded-se-[var(--radius-chat)]',
);

/**
 * The collapse toggle: one grid cell that stacks the summary and the handle,
 * so they crossfade without moving the drawer.
 */
export const chatComposerDrawerToggleRowClassName = tw(
  'grid grid-cols-[1fr] items-center h-5 px-4 -mx-4 cursor-pointer select-none',
  'aria-disabled:cursor-default',
);

/** The collapsed summary, centered on the toggle row and hidden while open. */
export function chatComposerDrawerToggleContentClassName(
  isHidden: boolean,
): string {
  return tw(
    'col-start-1 row-start-1 justify-self-start',
    'inline-flex items-center pointer-events-none h-5 gap-2',
    'rounded-[var(--radius-full)]',
    'transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
    isHidden ? 'opacity-0' : 'opacity-100',
  );
}

/** The collapsed summary's word beside the count. */
export const chatComposerDrawerLabelClassName = tw(
  'text-[length:var(--text-body-size)] leading-5',
  'text-[color:var(--color-text-secondary)]',
  'transition-[color] duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
);

/** The grab handle: a bar centered in the toggle row, hidden while open. */
export function chatComposerDrawerHandleClassName(isHidden: boolean): string {
  return tw(
    'col-start-1 row-start-1 justify-self-center self-start w-5 h-0.5',
    'rounded-[var(--radius-full)] bg-[var(--color-icon-secondary)]',
    'transition-[background-color,opacity] duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
    isHidden ? 'opacity-0 pointer-events-none' : 'opacity-100',
  );
}

/**
 * The content area collapses through its own row track, so it keeps the height
 * it animates from and the items stay in place.
 */
export function chatComposerDrawerContentGridClassName(
  isCollapsed: boolean,
): string {
  return tw(
    'grid transition-[grid-template-rows] duration-[var(--duration-medium)] ease-[var(--ease-standard)]',
    isCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]',
  );
}

/** The items inside the drawer: a wrapping row, fading with the row track. */
export function chatComposerDrawerContentClassName(
  isCollapsed: boolean,
): string {
  return tw(
    'min-h-0 flex flex-wrap gap-1 items-start',
    'transition-opacity ease-[var(--ease-standard)]',
    isCollapsed
      ? 'opacity-0 duration-[var(--duration-fast)] delay-0'
      : 'opacity-100 duration-[var(--duration-medium)] delay-[var(--duration-fast)]',
  );
}

// ---------------------------------------------------------------------------
// ChatLayoutScrollButton
// ---------------------------------------------------------------------------

/** The wrapper centres the pill and holds the gap above the composer. */
export const chatLayoutScrollButtonWrapperClassName =
  'flex justify-center pb-3';

/**
 * The pill. It clips its own content, so its height tracks the md Button it
 * wraps: a literal would clip that Button under a theme that retunes the
 * element scale. `visibility` rides the same transition as the fade, so the
 * fade-out still plays before the pill leaves the tab order.
 */
export function chatLayoutScrollButtonPillClassName({
  isVisible,
  isExpanded,
}: {
  isVisible: boolean;
  isExpanded: boolean;
}): string {
  return tw(
    '[contain:layout_style] overflow-hidden',
    'rounded-[var(--radius-full)] bg-[var(--color-background-popover)] shadow-[var(--shadow-med)]',
    'h-[var(--size-element-md)]',
    'transition-[opacity,transform,max-width,visibility] duration-[var(--duration-fast-max)] ease-[var(--ease-standard)]',
    'motion-reduce:duration-0',
    // A hidden pill paints nothing, so focus landing on it would have no
    // visible indicator (WCAG 2.2 SC 2.4.7). `visibility` also removes it from
    // sequential navigation after the fade; `inert` on the element stops new
    // focus immediately.
    isVisible
      ? 'opacity-100 pointer-events-auto visible'
      : 'opacity-0 pointer-events-none invisible',
    isExpanded ? 'max-w-[200px]' : 'max-w-[var(--size-element-md)]',
  );
}

/**
 * The inner Button: it takes the pill's own radius, and its trailing inset
 * grows when a label sits against the rounded edge.
 */
export function chatLayoutScrollButtonButtonClassName(
  hasLabel: boolean,
): string {
  return tw(
    '[--radius-element:var(--radius-full)] whitespace-nowrap px-2',
    hasLabel && 'pe-3',
  );
}

// ---------------------------------------------------------------------------
// ChatDictationButton
// ---------------------------------------------------------------------------

/** The per-instance geometry and colour of the listening bars. */
export const chatDictationBarVars = {
  gap: '--astryx-chat-dictation-bar-gap',
  height: '--astryx-chat-dictation-bar-height',
  color: '--astryx-chat-dictation-bar-color',
  scale: '--astryx-chat-dictation-bar-scale',
} as const;

/** The button's frame: the bars sit over it, so it positions them. */
export const chatDictationWrapperClassName =
  'relative inline-flex items-center justify-center';

/**
 * The bars' row. Its gap and height come from the size the caller picked, so
 * the class reads the two variables the component writes.
 */
export const chatDictationBarsClassName = tw(
  'absolute flex items-center justify-center pointer-events-none z-[1]',
  '[gap:var(--astryx-chat-dictation-bar-gap)]',
  '[height:var(--astryx-chat-dictation-bar-height)]',
);

/**
 * One bar: its width follows the button size, and each frame rewrites only the
 * scale and the colour, so the browser transitions between two frames.
 */
export function chatDictationBarClassName(size: 'sm' | 'md'): string {
  return tw(
    'h-full rounded-[var(--radius-full)] [transform-origin:center]',
    '[transform:scaleY(var(--astryx-chat-dictation-bar-scale))]',
    'bg-[var(--astryx-chat-dictation-bar-color)]',
    'transition-[transform,background-color] duration-[60ms] ease-out',
    'motion-reduce:duration-0',
    size === 'sm' ? 'w-[2px]' : 'w-[2.5px]',
  );
}

// ---------------------------------------------------------------------------
// ChatComposer
// ---------------------------------------------------------------------------

/**
 * The shell. It owns the two numbers every nested radius and inset reads: the
 * chat radius and the body padding, so a density change reaches both. The
 * button radius is concentric with the shell, and it stays on its own variable
 * so only buttons follow the shell's curve.
 */
export function chatComposerRootClassName(isDisabled: boolean): string {
  return tw(
    'relative z-0 isolate flex flex-col',
    '[--_chat-composer-radius:var(--radius-chat)]',
    '[--_chat-composer-padding:var(--spacing-3)]',
    '[--_button-radius:max(var(--radius-element),calc(var(--_chat-composer-radius)-var(--_chat-composer-padding)))]',
    isDisabled && 'opacity-60 pointer-events-none',
  );
}

/**
 * The body reads its padding from the shell's variable, and compact rewrites
 * that variable rather than the padding, so the flat elevation's inset border
 * calculation follows the same value.
 */
export function chatComposerBodyClassName(density: ChatDensity): string {
  return tw(
    'relative z-[2] flex flex-col p-[var(--_chat-composer-padding)]',
    'rounded-[var(--_chat-composer-radius)] bg-[var(--color-background-popover)]',
    'cursor-text [&:is(:disabled,[aria-disabled="true"])]:cursor-default',
    'transition-[box-shadow,border-color] ease-[var(--ease-standard)]',
    density === 'compact'
      ? 'gap-1 [--_chat-composer-padding:var(--spacing-2)]'
      : 'gap-2',
  );
}

export const chatComposerHeaderClassName =
  'flex items-center justify-between gap-2 min-h-7';

export const chatComposerHeaderLeftClassName = 'flex items-center gap-1';

/** The contextual slot: supporting type, pushed to the trailing edge. */
export const chatComposerHeaderRightClassName = tw(
  'flex items-center gap-2 ms-auto',
  'text-[length:var(--text-supporting-size)] leading-[var(--text-supporting-leading)]',
  'text-[color:var(--color-text-secondary)]',
);

export const chatComposerInputAreaClassName = 'flex flex-col';

/** The footer row, as tall as the send button the slots are meant to hold. */
export const chatComposerFooterClassName =
  'flex items-center justify-between gap-2 min-h-8';

export const chatComposerFooterLeftClassName = 'flex items-center gap-1';

/**
 * While a response streams the composer may block editing; the right side
 * takes hit-testing back so its Stop action stays reachable.
 */
export function chatComposerFooterRightClassName(
  isInterruptible: boolean,
): string {
  return tw(
    'flex items-center gap-1',
    isInterruptible && 'pointer-events-auto',
  );
}

/**
 * The status bar tucks under (or over) the body by one radius, so it shares the
 * body's corners on that edge and reads the shell's padding.
 */
export function chatComposerStatusClassName(
  position: 'top' | 'bottom',
  type: 'error' | 'warning',
): string {
  return tw(
    'relative z-0 flex items-center gap-2 px-4',
    'text-[length:var(--text-supporting-size)] leading-[var(--text-supporting-leading)]',
    'font-[family-name:var(--font-family-body)]',
    position === 'top'
      ? tw(
          'pt-[var(--_chat-composer-padding)]',
          'pb-[calc(var(--_chat-composer-padding)+var(--_chat-composer-radius))]',
          '-mb-[var(--_chat-composer-radius)]',
          'rounded-ss-[var(--_chat-composer-radius)] rounded-se-[var(--_chat-composer-radius)]',
        )
      : tw(
          'pt-[calc(var(--_chat-composer-padding)+var(--_chat-composer-radius))]',
          'pb-[var(--_chat-composer-padding)]',
          '-mt-[var(--_chat-composer-radius)]',
          'rounded-es-[var(--_chat-composer-radius)] rounded-ee-[var(--_chat-composer-radius)]',
        ),
    type === 'error'
      ? 'bg-[var(--color-error-muted)] text-[color:var(--color-on-error-muted)]'
      : 'bg-[var(--color-warning-muted)] text-[color:var(--color-on-warning-muted)]',
    // Forced colors replace the fill with Canvas; this boundary keeps its
    // shape visible.
    'forced-colors:outline-1 forced-colors:[outline-style:solid]',
    'forced-colors:[outline-color:CanvasText] forced-colors:[outline-offset:-1px]',
  );
}

// ---------------------------------------------------------------------------
// useTriggerMenu
// ---------------------------------------------------------------------------

/** The trigger menu's list: bounded height, and one inset around the rows. */
export const chatTriggerMenuListClassName = tw(
  'box-border max-h-60 overflow-y-auto p-1 min-w-[180px]',
);

/** The menu surface keeps the list's minimum width when the list is short. */
export const chatTriggerMenuSurfaceClassName = 'min-w-[180px]';

/** A menu row: a full-width option that reads as text, not as a button. */
export const chatTriggerMenuRowClassName = tw(
  'box-border flex items-center w-full p-2 text-start',
  'rounded-[var(--radius-element)] border-0 outline-none bg-transparent',
  'cursor-pointer [&:is(:disabled,[aria-disabled="true"])]:cursor-default',
  'font-[family-name:var(--font-family-body)]',
  'text-[length:var(--text-body-size)] leading-[var(--text-body-leading)]',
  'text-[color:var(--color-text-primary)]',
);

/** The row the keyboard or the pointer points at. */
export const chatTriggerMenuRowHighlightedClassName =
  'bg-[var(--color-overlay-hover)]';

/** The row's label: one ellided line, so a long item never widens the menu. */
export const chatTriggerMenuRowLabelClassName = tw(
  'flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap',
);

/** The loading and empty rows share one supporting-type centering. */
export const chatTriggerMenuMessageClassName = tw(
  'p-3 text-center text-[length:var(--text-supporting-size)]',
  'text-[color:var(--color-text-secondary)]',
);

/** A group's heading: supporting type, inset tighter at the bottom. */
export const chatTriggerMenuGroupHeadingClassName = tw(
  'px-2 pt-2 pb-1 select-none',
  'text-[length:var(--text-supporting-size)] leading-[var(--text-supporting-leading)]',
  'text-[color:var(--color-text-secondary)]',
);

// ---------------------------------------------------------------------------
// ChatToolCalls
// ---------------------------------------------------------------------------

/** The tool-call block: a column of rows, one step below its message. */
export const chatToolCallsRootClassName = 'flex flex-col mt-2';

/** The wrench beside the group label. */
export const chatToolCallsGroupIconClassName = tw(
  'inline-flex items-center justify-center shrink-0 w-4 h-4',
  'text-[color:var(--color-text-secondary)]',
);

export const chatToolCallsGroupLabelClassName = tw(
  'font-[family-name:var(--font-family-body)] font-medium',
  'text-[length:var(--text-supporting-size)] leading-[var(--text-supporting-leading)]',
  'text-[color:var(--color-text-secondary)]',
);

/**
 * The disclosure chevron. It animates its own rotation, so the transition
 * names one property and the open state is a separate class.
 */
export const chatToolCallsChevronClassName = tw(
  'inline-flex items-center justify-center shrink-0 w-3.5 h-3.5',
  'text-[color:var(--color-text-secondary)]',
  'transition-transform duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
  'motion-reduce:transition-none',
);

/** The rotated chevron of an open group or an open result detail. */
export const chatToolCallsChevronOpenClassName = 'rotate-180';

/** The collapsing body: a row track, so the rows keep their height. */
export function chatToolCallsGroupContentClassName(
  isExpanded: boolean,
): string {
  return tw(
    'grid transition-[grid-template-rows] duration-[var(--duration-medium)] ease-[var(--ease-standard)]',
    'motion-reduce:transition-none',
    isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
  );
}

/**
 * The clip boundary of the row track. It mirrors the list's padding and
 * negative margin so the rows' hover fills can overhang the text column
 * without widening the layout, and so that overhang is absorbed here instead
 * of being clipped by the height animation.
 */
export const chatToolCallsGroupContentInnerClassName =
  'overflow-hidden min-h-0 px-1 -mx-1';

export const chatToolCallsListClassName = 'flex flex-col px-1 -mx-1';

/** One call row: an icon, the name, then whatever the call reports. */
export const chatToolCallsRowClassName =
  'flex items-center gap-1.5 min-h-6 py-0.5';

/**
 * A row with a detail to open. Its hover fill is the overlay, and the fill
 * overhangs the text column by one padding step on each inline edge.
 */
export const chatToolCallsRowClickableClassName = tw(
  'rounded-[var(--radius-element)] px-1 -mx-1',
  'cursor-pointer [&:is(:disabled,[aria-disabled="true"])]:cursor-default',
  'hover:[&:where(:not(:disabled,[aria-disabled="true"]))]:bg-[var(--color-overlay-hover)]',
);

/** A row that toggles without a detail: only the pointer changes. */
export const chatToolCallsRowToggleClassName =
  'cursor-pointer [&:is(:disabled,[aria-disabled="true"])]:cursor-default';

/** The group header: a toggling row whose text does not drag on press. */
export const chatToolCallsGroupHeaderClassName = tw(
  chatToolCallsRowClassName,
  chatToolCallsRowToggleClassName,
  'select-none',
);

/** The status slot: a fixed square the spinner or the glyph sits in. */
export const chatToolCallsStatusIconClassName = tw(
  'relative inline-flex items-center justify-center shrink-0 w-4 h-4',
  'rounded-[var(--radius-full)]',
);

/** The tool name: code type, one ellided line, never wider than 4ch. */
export const chatToolCallsNameClassName = tw(
  'font-[family-name:var(--font-family-code)] font-medium',
  'text-[length:var(--text-supporting-size)] leading-[var(--text-supporting-leading)]',
  'text-[color:var(--color-text-secondary)]',
  'whitespace-nowrap overflow-hidden text-ellipsis shrink min-w-[4ch]',
);

/** The target a call acted on: it gives way first, so it may collapse. */
export const chatToolCallsTargetClassName = tw(
  'font-[family-name:var(--font-family-body)]',
  'text-[length:var(--text-supporting-size)] leading-[var(--text-supporting-leading)]',
  'text-[color:var(--color-text-secondary)]',
  'whitespace-nowrap overflow-hidden text-ellipsis [flex-shrink:10] min-w-0',
);

export const chatToolCallsDurationClassName = tw(
  'font-[family-name:var(--font-family-body)] shrink-0 whitespace-nowrap',
  'text-[length:var(--text-supporting-size)] leading-[var(--text-supporting-leading)]',
  'text-[color:var(--color-text-secondary)]',
);

/** A node badge keeps its width beside a long name. */
export const chatToolCallsNodePillClassName = 'shrink-0';

/** The diff counts: one supporting-type line that keeps its width. */
export const chatToolCallsStatsClassName = tw(
  'flex items-center gap-1 shrink-0',
  'font-[family-name:var(--font-family-body)]',
  'text-[length:var(--text-supporting-size)] leading-[var(--text-supporting-leading)]',
  'text-[color:var(--color-text-secondary)]',
);

export const chatToolCallsStatsAdditionsClassName =
  'text-[color:var(--color-text-success)]';

export const chatToolCallsStatsDeletionsClassName =
  'text-[color:var(--color-text-error)]';

/** The detail chevron: pushed to the trailing edge of its row. */
export const chatToolCallsDetailChevronClassName = tw(
  'inline-flex items-center justify-center shrink-0 w-3.5 h-3.5 ms-auto',
  'text-[color:var(--color-text-secondary)]',
);

/** The detail block: inset to the text column, one step below its row. */
export const chatToolCallsDetailContentClassName =
  'ps-[calc(var(--spacing-4)+var(--spacing-1-5))] pb-2';

/** The call count beside the group header's chevron. */
export const chatToolCallsCountClassName = tw(
  'inline-flex items-center gap-0.5 shrink-0',
  'font-[family-name:var(--font-family-body)]',
  'text-[length:var(--text-supporting-size)] leading-[var(--text-supporting-leading)]',
  'text-[color:var(--color-text-secondary)]',
);

/** The status glyph colour, per status. */
export const chatToolCallsStatusClassName: Record<ChatToolCallStatus, string> =
  {
    pending: 'text-[color:var(--color-text-disabled)]',
    running: 'text-[color:var(--color-accent)]',
    complete: 'text-[color:var(--color-icon-success)]',
    error: 'text-[color:var(--color-icon-error)]',
  };

// ---------------------------------------------------------------------------
// ChatComposerInput
// ---------------------------------------------------------------------------

/**
 * The input shell. The editable and the placeholder are both one line tall at
 * rest, so height: auto keeps the field from collapsing on its first layout.
 */
export function chatComposerInputRootClassName(isDisabled: boolean): string {
  return tw(
    'relative flex flex-col min-h-[22px]',
    isDisabled && 'opacity-50 pointer-events-none',
  );
}

/**
 * The editable region. Its automatic minimum height is 0 as a scrolling flex
 * item, so an empty one would lay out at 0px after a restyle and a click would
 * no longer reach it; the height floor keeps it hit-testable. The 16px floor is
 * iOS-only: iOS Safari zooms the page when a focused control sits under 16px,
 * and only iOS WebKit implements the support query that gates it.
 */
export const chatComposerInputEditableClassName = tw(
  'min-h-[22px] px-1 outline-none whitespace-pre-wrap break-words overflow-y-auto',
  '[font-family:var(--font-family-body)] leading-[22px]',
  'text-[length:var(--text-body-size)]',
  'pointer-coarse:[@supports(-webkit-touch-callout:none)]:text-[length:max(1rem,var(--text-body-size))]',
  'text-[color:var(--color-text-primary)]',
  '[caret-color:var(--color-accent)]',
);

/** The placeholder stands in the editable's box with the same type. */
export const chatComposerInputPlaceholderClassName = tw(
  'absolute top-0 start-0 end-0 px-1 pointer-events-none select-none',
  '[font-family:var(--font-family-body)] leading-[22px]',
  'text-[length:var(--text-body-size)]',
  'pointer-coarse:[@supports(-webkit-touch-callout:none)]:text-[length:max(1rem,var(--text-body-size))]',
  'text-[color:var(--color-text-secondary)]',
);

/** A token chip: one line box tall, so it sits on the text baseline row. */
export const chatComposerTokenSpanClassName =
  'inline-flex items-center h-[1lh] align-top';
