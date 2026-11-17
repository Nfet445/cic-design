// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file CommentParts.tsx
 * @input Uses React, theme tokens, and Astryx primitives (Avatar,
 *   Badge, Banner, Blockquote, Button, Card, Dialog, EmptyState, Item, Link,
 *   Section, Skeleton, Text, Thumbnail, Timestamp, Tooltip), plus Lab's
 *   loading-message and shared status-announcement helpers
 * @output Exports the presentational parts of a comment row: author name and
 *   avatar, metadata, quoted passages, progress, clamped body, error banner,
 *   reply rail, activity event row, edit history dialog, and loading skeletons
 * @position Internal building blocks of the Comments family
 */

import {
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Blockquote} from '@astryxdesign/core/Blockquote';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Center} from '@astryxdesign/core/Center';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Item} from '@astryxdesign/core/Item';
import {
  HStack,
  Layout,
  LayoutContent,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Link} from '@astryxdesign/core/Link';
import {Section} from '@astryxdesign/core/Section';
import {Skeleton} from '@astryxdesign/core/Skeleton';
import {Text} from '@astryxdesign/core/Text';
import {Thumbnail} from '@astryxdesign/core/Thumbnail';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {VisuallyHidden} from '@astryxdesign/core/VisuallyHidden';
import {useTranslator} from '@astryxdesign/core/i18n';
import {colorVars, spacingVars} from '@astryxdesign/core/theme/tokens.stylex';
import {tw} from '../tw';
import {
  commentPartsAgentLogoClassName,
  commentPartsAvatarFrameAgentClassName,
  commentPartsAvatarFrameClassName,
  commentPartsAvatarFramePersonClassName,
  commentPartsAvatarSpacerClassName,
  commentPartsBodyClampedClassName,
  commentPartsEventRowClassName,
  commentPartsFullWidthClassName,
  commentPartsLoadingComposerClassName,
  commentPartsNoWrapClassName,
  commentPartsQuoteTextClassName,
  commentPartsRailCollapsedClassName,
  commentPartsRailClassName,
  commentPartsRailFromAvatarClassName,
  commentPartsRailFromRowClassName,
  commentPartsRailToAvatarClassName,
  commentPartsRailToRowClassName,
  commentPartsSectionDividerOverlapClassName,
  commentPartsThreadQuoteClassName,
  commentPartsUnreadBadgeClassName,
} from './commentPartsClasses';
import {
  commentHighlightRuleStyle,
  commentPartsProgressLabelStyles,
} from './commentPartsOverrides.stylex';
import {CommentIcon} from './icons';
import {eventAnchorId, type AnyComment} from './utils';
import type {
  CommentAnchor,
  CommentHighlightColor,
  CommentProgress,
  CommentUser,
  CommentVersion,
  CommentActivityEvent,
} from './types';
import {LoadingMessage} from '../LoadingMessage';
import {useStatusAnnouncement} from '../useStatusAnnouncement';

/** The 28px avatar column every comment row, reply, and event aligns to. */
export const AVATAR_SIZE = `calc(${spacingVars['--spacing-6']} + ${spacingVars['--spacing-1']})`;
/**
 * A resolved thread's words step down to the secondary text color by
 * remapping the primary text token on their own elements (never on the
 * actions, which stay usable). Secondary text keeps a readable contrast, which
 * the disabled color does not: a resolved comment is still content, not an
 * inactive control. Markdown takes no text color of its own, and `xstyle`
 * takes no custom properties, so the remap is an inline style.
 */
export const RESOLVED_TEXT_STYLE: CSSProperties &
  Record<`--${string}`, string> = {
  '--color-text-primary': colorVars['--color-text-secondary'],
};

/** A failed action as an error Banner with its one recovery action. */
export type ErrorBannerContent = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  isActionDisabled?: boolean;
  /** Its own retry is running: say nothing until the outcome (FR6). */
  isRetrying?: boolean;
  /** The failure was already announced elsewhere; this Banner stays silent. */
  isAnnounced?: boolean;
};

/**
 * An inline failure as an error Banner. The Banner carries no live role: it
 * mounts already holding its text, which may not be announced. The failure is
 * announced once, assertively, through the shared channel instead, unless the
 * Banner sits inside a live container such as the chat log, which delivers it
 * (spec:AST-086 FR2, FR4, FR5).
 */
export function ErrorBanner({
  actionRef,
  content,
  onBeforeAction,
  ...dataProps
}: {
  actionRef?: Ref<HTMLButtonElement>;
  content: ErrorBannerContent;
  /** Runs before the action, e.g. to move focus off a Banner about to unmount. */
  onBeforeAction?: () => void;
  [dataAttribute: `data-${string}`]: string | undefined;
}) {
  const {actionLabel, description, isActionDisabled, onAction, title} = content;
  const t = useTranslator();
  const bannerRef = useRef<HTMLDivElement>(null);
  useStatusAnnouncement(
    content.isRetrying === true || content.isAnnounced === true
      ? null
      : description != null
        ? t('@astryx.comments.errorAnnouncement', {title, description})
        : title,
    'assertive',
    {ref: bannerRef},
  );
  return (
    <Banner
      ref={bannerRef}
      status="error"
      container="card"
      title={title}
      description={description}
      className={commentPartsFullWidthClassName}
      endContent={
        actionLabel != null && onAction != null ? (
          <Button
            ref={actionRef}
            label={actionLabel}
            variant="ghost"
            size="sm"
            isDisabled={isActionDisabled}
            onClick={() => {
              onBeforeAction?.();
              onAction();
            }}
          />
        ) : undefined
      }
      {...dataProps}
    />
  );
}

/**
 * One stretch of the 2px reply rail. Each row draws its own stretch down across
 * the row gap, from just below its avatar or through the whole row, to just
 * short of the next row's avatar or into a next row that carries it on. The
 * rail never runs behind an avatar, and ends at the last one.
 */
export function ThreadRailSegment({
  from,
  to,
}: {
  from: 'avatar' | 'row';
  to: 'avatar' | 'row';
}) {
  return (
    <VStack
      className={tw(
        commentPartsRailClassName,
        from === 'avatar'
          ? commentPartsRailFromAvatarClassName
          : commentPartsRailFromRowClassName,
        to === 'avatar'
          ? commentPartsRailToAvatarClassName
          : commentPartsRailToRowClassName,
      )}
      data-thread-rail-segment={`${from}-${to}`}
      aria-hidden="true">
      {null}
    </VStack>
  );
}

/** The fading rail of a collapsed thread with hidden replies. */
export function CollapsedThreadRail() {
  return (
    <VStack
      className={commentPartsRailCollapsedClassName}
      data-thread-rail-segment="collapsed"
      aria-hidden="true">
      {null}
    </VStack>
  );
}

export function MetadataSeparator({
  type = 'body',
}: {
  type?: 'body' | 'supporting';
}) {
  return (
    <Text as="span" type={type} color="secondary" aria-hidden="true">
      ·
    </Text>
  );
}

/** A secondary text link that runs an action, such as Edited or Cancel. */
export function MetadataActionLink({
  accessibleLabel,
  actionRole,
  isDisabled,
  label,
  onClick,
  textType = 'supporting',
}: {
  accessibleLabel?: string;
  /** Names the link for focus hand-off, e.g. back to Edited after history. */
  actionRole?: 'history';
  isDisabled?: boolean;
  label: string;
  onClick: () => void;
  textType?: 'body' | 'supporting';
}) {
  return (
    <Link
      label={accessibleLabel ?? label}
      type={textType}
      color="secondary"
      className={commentPartsNoWrapClassName}
      data-metadata-action={actionRole}
      // Link keeps a disabled link in the tab order (spec:AST-085 FR1).
      isDisabled={isDisabled}
      onClick={event => {
        event.preventDefault();
        if (isDisabled !== true) {
          onClick();
        }
      }}>
      {label}
    </Link>
  );
}

/**
 * A quoted passage in Markdown's blockquote style: italic, two lines at most.
 * A passage the host highlights carries the highlight's color on its rule.
 */
export function QuotedPassage({
  quote,
  highlightColor,
}: {
  quote: string;
  /** The highlight's color, or nothing for a neutral rule. */
  highlightColor?: CommentHighlightColor;
}) {
  return (
    <Blockquote
      xstyle={
        highlightColor != null
          ? commentHighlightRuleStyle(highlightColor)
          : undefined
      }
      data-quote-rule={highlightColor != null ? 'highlight' : 'neutral'}
      data-highlight-color={highlightColor}>
      <Text
        type="body"
        color="inherit"
        maxLines={2}
        className={commentPartsQuoteTextClassName}>
        {quote}
      </Text>
    </Blockquote>
  );
}

/** The passage an inline comment discusses, quoted under its author's name. */
export function CommentAnchorQuote({
  anchor,
  highlightColor,
  isResolved,
}: {
  anchor: CommentAnchor;
  highlightColor: CommentHighlightColor;
  /** A resolved thread's passage leaves the host's highlights. */
  isResolved: boolean;
}) {
  const t = useTranslator();
  const isOrphaned = anchor.status === 'orphaned';
  return (
    <HStack
      gap={2}
      align="center"
      width="100%"
      className={commentPartsThreadQuoteClassName}
      style={isResolved ? RESOLVED_TEXT_STYLE : undefined}
      data-comment-anchor={isOrphaned ? 'orphaned' : 'anchored'}>
      <StackItem size={isOrphaned ? undefined : 'fill'}>
        <QuotedPassage
          quote={anchor.quote}
          highlightColor={
            !isOrphaned && !isResolved ? highlightColor : undefined
          }
        />
      </StackItem>
      {/* The passage was edited away; the quote is what the comment saw. */}
      {isOrphaned && (
        <StackItem size="static">
          <Badge variant="neutral" label={t('@astryx.comments.outdated')} />
        </StackItem>
      )}
    </HStack>
  );
}

/** A comment its author is still writing: what it is doing, and where to watch. */
export function CommentProgressStatus({progress}: {progress: CommentProgress}) {
  const labelRef = useRef<HTMLElement>(null);
  // The label carries no live role: it mounts already holding its text. It is
  // announced politely through the shared channel, unless the chat log around
  // it delivers it (spec:AST-086 FR2, FR4).
  useStatusAnnouncement(progress.label, 'polite', {ref: labelRef});
  return (
    <HStack
      gap={1}
      align="center"
      wrap="wrap"
      width="100%"
      data-comment-progress="shimmer">
      <Text
        ref={labelRef}
        type="body"
        color="secondary"
        xstyle={commentPartsProgressLabelStyles.base}>
        {progress.label}
      </Text>
      {progress.link != null && (
        <Link href={progress.link.href} target="_blank" type="body">
          {progress.link.label}
        </Link>
      )}
    </HStack>
  );
}

/** A comment body, clamped to three lines until its thread opens. */
export function ClampedBody({
  children,
  isExpanded,
  isMuted,
}: {
  children: ReactNode;
  isExpanded: boolean;
  isMuted: boolean;
}) {
  return (
    <VStack
      width="100%"
      className={isExpanded ? undefined : commentPartsBodyClampedClassName}
      style={isMuted ? RESOLVED_TEXT_STYLE : undefined}
      data-comment-body-clamp={isExpanded ? 'expanded' : '3'}>
      {children}
    </VStack>
  );
}

export function UnreadBadge() {
  const t = useTranslator();
  const [hasFaded, setHasFaded] = useState(false);
  if (hasFaded) {
    return null;
  }
  return (
    <HStack
      align="center"
      className={commentPartsUnreadBadgeClassName}
      data-comment-unread-badge="true"
      onAnimationEnd={event => {
        if (event.target === event.currentTarget) {
          setHasFaded(true);
        }
      }}>
      <Badge variant="info" label={t('@astryx.comments.unread')} />
    </HStack>
  );
}

/** Resolved, beside the time; names who resolved it when the host knows. */
export function ResolvedLabel({resolvedBy}: {resolvedBy?: CommentUser}) {
  const t = useTranslator();
  const label = (
    <Text
      type="body"
      color="secondary"
      className={commentPartsNoWrapClassName}
      data-comment-resolved-label="true">
      {t('@astryx.comments.resolved')}
    </Text>
  );
  return resolvedBy == null ? (
    label
  ) : (
    <Tooltip
      content={t('@astryx.comments.resolvedBy', {name: resolvedBy.name})}>
      {label}
    </Tooltip>
  );
}

export function AuthorName({
  author,
  id,
  className,
}: {
  author: CommentUser;
  id?: string;
  /** The caller's layout class, such as the room the name may take. */
  className?: string;
}) {
  return (
    <Text
      id={id}
      type="label"
      color="primary"
      weight="medium"
      maxLines={1}
      className={className}
      data-author-name={author.name}>
      {author.href != null ? (
        <Link href={author.href} type="inherit" color="inherit">
          {author.name}
        </Link>
      ) : (
        author.name
      )}
    </Text>
  );
}

function CommentAvatar({user}: {user: CommentUser}) {
  const t = useTranslator();
  const logo = user.avatarUrl?.trim();
  if (user.kind === 'agent' && logo != null && logo !== '') {
    return (
      <Thumbnail
        src={logo}
        alt={t('@astryx.comments.agentLogo', {name: user.name})}
        className={commentPartsAgentLogoClassName}
      />
    );
  }
  return (
    <Avatar
      name={user.name}
      src={logo === '' ? undefined : logo}
      size={32}
      className={commentPartsAgentLogoClassName}
      // An agent without a logo keeps the agent's square-cornered frame.
      shape={user.kind === 'agent' ? 'rounded' : 'circle'}
      tooltip={false}
    />
  );
}

/** A 28×28 avatar on an opaque disc: a circle for people, a rounded square
 *  for agents. */
export function CommentAvatarFrame({user}: {user: CommentUser}) {
  const isAgent = user.kind === 'agent';
  return (
    <Center
      className={tw(
        commentPartsAvatarFrameClassName,
        isAgent
          ? commentPartsAvatarFrameAgentClassName
          : commentPartsAvatarFramePersonClassName,
      )}
      data-avatar-shape={isAgent ? 'agent' : 'person'}>
      <CommentAvatar user={user} />
    </Center>
  );
}

/** Runs beneath Dialog so useAnnounce reaches its modal scope. */
function BusyStatus({isBusy, message}: {isBusy: boolean; message: string}) {
  useStatusAnnouncement(isBusy ? message : null, 'polite', {
    skipPageLoad: true,
  });
  return null;
}

/** The empty 28px avatar column, for rows without an avatar. */
export function AvatarSpacer() {
  return (
    <Center className={commentPartsAvatarSpacerClassName} aria-hidden="true">
      {null}
    </Center>
  );
}

export function ActivityEventRow({
  event,
  renderEvent,
}: {
  event: CommentActivityEvent;
  renderEvent?: (event: CommentActivityEvent) => ReactNode;
}) {
  const anchorId = eventAnchorId(event.id);
  const href = event.href ?? `#${anchorId}`;
  if (renderEvent != null) {
    return (
      <VStack id={anchorId} width="100%" data-comments-event-id={event.id}>
        {renderEvent(event)}
      </VStack>
    );
  }
  return (
    <Item
      id={anchorId}
      data-comments-event-id={event.id}
      density="compact"
      align="start"
      className={commentPartsEventRowClassName}
      startContent={
        <Center
          className={commentPartsAvatarSpacerClassName}
          aria-hidden="true">
          <CommentIcon name="event" size="md" />
        </Center>
      }
      label={event.label}
      description={
        event.actor != null || event.description != null ? (
          <HStack gap={1} align="center" wrap="wrap">
            {event.actor != null && <AuthorName author={event.actor} />}
            {event.description != null && (
              <Text type="supporting" color="secondary">
                {event.description}
              </Text>
            )}
          </HStack>
        ) : undefined
      }
      endContent={
        <Link href={href} type="supporting" color="secondary">
          <Timestamp
            value={event.createdAt}
            format="relative_short"
            type="inherit"
            color="inherit"
            isLive
          />
        </Link>
      }
    />
  );
}

export type HistoryState = {
  comment: AnyComment;
  versions: readonly CommentVersion[];
  isLoading: boolean;
  error?: string;
};

export function HistoryDialog({
  history,
  onClose,
  renderVersionBody,
}: {
  history: HistoryState | null;
  onClose: () => void;
  renderVersionBody: (version: CommentVersion) => ReactNode;
}) {
  const t = useTranslator();
  if (history == null) {
    return null;
  }
  return (
    <Dialog isOpen onOpenChange={open => !open && onClose()} purpose="info">
      <Layout
        height="auto"
        header={
          <DialogHeader
            title={t('@astryx.comments.historyTitle')}
            subtitle={t('@astryx.comments.historySubtitle', {
              name: history.comment.author.name,
            })}
            onOpenChange={open => !open && onClose()}
            hasDivider
          />
        }
        content={
          <LayoutContent>
            {/* Keep the announcement owner beneath Dialog: the shared channel
                routes its busy start into this modal. */}
            <BusyStatus
              isBusy={history.isLoading}
              message={t('@astryx.comments.historyLoading')}
            />
            {/* The shared channel is not exposed while a native modal is open
                (spec:AST-086), so a failure here is delivered by a persistent
                alert slot inside the dialog. The slot is mounted empty and the
                Banner is added to it (FR3). */}
            <div role="alert">
              {!history.isLoading && history.error != null && (
                <Banner
                  status="error"
                  title={t('@astryx.comments.historyFailed')}
                  description={history.error}
                  container="section"
                />
              )}
            </div>
            {history.isLoading ? (
              <LoadingMessage
                size="lg"
                label={t('@astryx.comments.historyLoading')}
              />
            ) : history.error != null ? null : history.versions.length === 0 ? (
              <EmptyState
                title={t('@astryx.comments.historyEmptyTitle')}
                description={t('@astryx.comments.historyEmptyDescription')}
                isCompact
              />
            ) : (
              <VStack gap={3}>
                {history.versions.map(version => (
                  <Section
                    key={version.id}
                    variant={
                      version.isCurrent === true ? 'muted' : 'transparent'
                    }
                    padding={2}>
                    <VStack gap={1.5}>
                      <HStack gap={1} align="center" wrap="wrap">
                        <Timestamp
                          value={version.editedAt}
                          format="date_time"
                        />
                        {version.author != null && (
                          <Text type="supporting" color="secondary">
                            {t('@astryx.comments.versionAuthor', {
                              name: version.author.name,
                            })}
                          </Text>
                        )}
                        {version.isCurrent === true && (
                          <Text type="supporting" weight="semibold">
                            {t('@astryx.comments.currentVersion')}
                          </Text>
                        )}
                      </HStack>
                      {renderVersionBody(version)}
                    </VStack>
                  </Section>
                ))}
              </VStack>
            )}
          </LayoutContent>
        }
      />
    </Dialog>
  );
}

function LoadingCommentRow({
  container,
  index,
}: {
  container: 'section' | 'card';
  index: number;
}) {
  const content = (
    <HStack gap={2} align="start" width="100%">
      <Skeleton
        width={AVATAR_SIZE}
        height={AVATAR_SIZE}
        radius="rounded"
        index={index * 7}
      />
      <StackItem size="fill">
        <VStack gap={1} width="100%">
          <HStack gap={1} align="center" width="100%">
            <Skeleton
              width={index === 0 ? '38%' : '30%'}
              height={spacingVars['--spacing-4']}
              radius={1}
              index={index * 7 + 1}
            />
            <Skeleton
              width="18%"
              height={spacingVars['--spacing-3']}
              radius={1}
              index={index * 7 + 2}
            />
          </HStack>
          <Skeleton
            width="96%"
            height={spacingVars['--spacing-4']}
            radius={1}
            index={index * 7 + 3}
          />
          <Skeleton
            width={index === 0 ? '82%' : '68%'}
            height={spacingVars['--spacing-4']}
            radius={1}
            index={index * 7 + 4}
          />
          {index === 0 && (
            <Skeleton
              width="54%"
              height={spacingVars['--spacing-4']}
              radius={1}
              index={index * 7 + 5}
            />
          )}
          <HStack gap={1} align="center">
            <Skeleton
              width={`calc(${spacingVars['--spacing-8']} + ${spacingVars['--spacing-4']})`}
              height={spacingVars['--spacing-6']}
              radius={2}
              index={index * 7 + 5}
            />
            <Skeleton
              width={spacingVars['--spacing-8']}
              height={spacingVars['--spacing-6']}
              radius={2}
              index={index * 7 + 6}
            />
          </HStack>
        </VStack>
      </StackItem>
    </HStack>
  );

  return container === 'card' ? (
    <Section
      variant="transparent"
      dividers={['top', 'bottom']}
      padding={3}
      width="100%"
      className={commentPartsSectionDividerOverlapClassName}>
      {content}
    </Section>
  ) : (
    <Card variant="default" elevation="none" padding={3} width="100%">
      {content}
    </Card>
  );
}

/** Comment-shaped placeholders in the same Card or Section the threads use. */
export function CommentThreadLoadingSkeleton({
  container,
}: {
  container: 'section' | 'card';
}) {
  const t = useTranslator();
  return (
    <VStack
      gap={container === 'card' ? 0 : 2}
      width="100%"
      data-comments-loading="threads">
      <VisuallyHidden>{t('@astryx.comments.loading')}</VisuallyHidden>
      {[0, 1, 2].map(index => (
        <LoadingCommentRow key={index} container={container} index={index} />
      ))}
    </VStack>
  );
}

/** The two-row composer's shape: the input, then its buttons and Post. */
export function CommentComposerLoadingSkeleton({
  actionCount,
}: {
  actionCount: number;
}) {
  const actionSize = spacingVars['--spacing-8'];
  return (
    <Card
      variant="default"
      elevation="none"
      padding={2}
      width="100%"
      className={commentPartsLoadingComposerClassName}
      data-comments-loading="composer">
      <VStack gap={2} width="100%">
        <Skeleton
          width="42%"
          height={spacingVars['--spacing-4']}
          radius={1}
          index={22}
        />
        <HStack gap={1} align="center" justify="between" width="100%">
          <HStack gap={0.5} align="center">
            {Array.from({length: actionCount}, (_, offset) => (
              <Skeleton
                key={offset}
                width={actionSize}
                height={actionSize}
                radius={2}
                index={23 + offset}
              />
            ))}
          </HStack>
          <Skeleton
            width={actionSize}
            height={actionSize}
            radius={2}
            index={23 + actionCount}
          />
        </HStack>
      </VStack>
    </Card>
  );
}
