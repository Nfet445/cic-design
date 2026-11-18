// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file CommentMarkdown.tsx
 * @input Uses React, Markdown, Lightbox, ChatTokenizedText, Avatar
 * @output Exports CommentMarkdown (a comment body's Markdown, with images that
 *   open in a Lightbox and agent commands shown as chips) and agentToken
 * @position Internal body renderer shared by comment rows and the edit
 *   history dialog
 */

import {createContext, useContext, useMemo, useState} from 'react';
import {Avatar} from '@astryxdesign/core/Avatar';
import {
  ChatTokenizedText,
  type ChatComposerToken,
} from '@astryxdesign/core/Chat';
import {Lightbox, type LightboxMedia} from '@astryxdesign/core/Lightbox';
import {tw} from '../tw';
import {Markdown, type MarkdownInlinePlugin} from '@astryxdesign/core/Markdown';
import type {MarkdownPluginEntry} from '@astryxdesign/core/Markdown/plugins';
import {focusOutlineFocusVisibleClassName} from '@astryxdesign/core/utils';
import {commentMarkdownImageClassName} from './commentMarkdownClasses';
import type {CommentAgentCommand} from './types';

/** An agent's chip: what the composer's `/` menu inserts, and what a posted
 *  comment shows in place of the command. */
export function agentToken(agent: CommentAgentCommand): ChatComposerToken {
  return {
    value: `/${agent.command}`,
    label: agent.name,
    variant: 'info',
    icon: (
      <Avatar
        name={agent.name}
        src={agent.logoUrl}
        size="xsm"
        shape="rounded"
        tooltip={false}
      />
    ),
  };
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Shows `/<command>` in a posted comment as the agent's chip. */
function agentCommandPlugin(
  agents: readonly CommentAgentCommand[],
): MarkdownInlinePlugin {
  const byCommand = new Map(agents.map(agent => [agent.command, agent]));
  return {
    pattern: new RegExp(
      `(^|\\s)/(${agents.map(agent => escapeRegExp(agent.command)).join('|')})(?=\\s|$)`,
      'g',
    ),
    render: (match, key) => {
      const agent = byCommand.get(match[2] ?? '');
      if (agent == null) {
        return match[0];
      }
      const token = agentToken(agent);
      // Set in the line as the composer sets it: centered on the text.
      return (
        <span key={key}>
          {match[1]}
          <ChatTokenizedText
            tokens={[token]}
            data-agent-command={agent.command}>
            {token.value}
          </ChatTokenizedText>
        </span>
      );
    },
  };
}

/* One Lightbox per body, opened at whichever of its images is pressed. */
const CommentImageContext = createContext<
  ((media: LightboxMedia) => void) | null
>(null);

function CommentImage({src, alt}: {src: string; alt: string}) {
  const openImage = useContext(CommentImageContext);
  const open = () => openImage?.({src, alt});
  return (
    <img
      src={src}
      alt={alt}
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      data-comment-image="lightbox"
      className={tw(
        focusOutlineFocusVisibleClassName,
        commentMarkdownImageClassName,
      )}
      onClick={event => {
        // An image is its own control, not a press on the thread.
        event.stopPropagation();
        open();
      }}
      onKeyDown={event => {
        if (event.key !== 'Enter' && event.key !== ' ') {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        open();
      }}
    />
  );
}

const COMMENT_MARKDOWN_COMPONENTS = {image: CommentImage};

const NO_INLINE_PLUGINS: readonly MarkdownInlinePlugin[] = [];
const NO_PLUGINS: readonly MarkdownPluginEntry[] = [];

/** A comment body: compact Markdown whose images open in a Lightbox. */
export function CommentMarkdown({
  body,
  agentCommands,
  plugins = NO_PLUGINS,
  inlinePlugins = NO_INLINE_PLUGINS,
}: {
  body: string;
  agentCommands: readonly CommentAgentCommand[];
  plugins?: readonly MarkdownPluginEntry[];
  inlinePlugins?: readonly MarkdownInlinePlugin[];
}) {
  const allInlinePlugins = useMemo(
    () =>
      agentCommands.length === 0
        ? [...inlinePlugins]
        : [...inlinePlugins, agentCommandPlugin(agentCommands)],
    [agentCommands, inlinePlugins],
  );
  const [openedImage, setOpenedImage] = useState<LightboxMedia | null>(null);
  return (
    <CommentImageContext.Provider value={setOpenedImage}>
      <Markdown
        density="compact"
        plugins={plugins}
        inlinePlugins={allInlinePlugins}
        autolink="gfm"
        components={COMMENT_MARKDOWN_COMPONENTS}>
        {body}
      </Markdown>
      {openedImage != null && (
        <Lightbox
          isOpen
          media={openedImage}
          hasZoom
          onOpenChange={isOpen => {
            if (!isOpen) {
              setOpenedImage(null);
            }
          }}
        />
      )}
    </CommentImageContext.Provider>
  );
}
