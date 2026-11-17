// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @input Static header content: title, subtitle, a no-op close handler, and a divider
 * @output The DrawerHeader row at the top of a square-cornered, drawer-width panel, visible without opening an overlay
 * @position DrawerHeader's docsite showcase. Drawer has no inline mode
 *   like Dialog's isInline, so a plain panel stands in for the drawer; in an
 *   app, compose DrawerHeader in a Layout header slot inside a Drawer.
 */

import {DrawerHeader} from '@astryxdesign/core/Drawer';
import {
  Layout,
  LayoutContent,
  layoutPaddingResetClassName,
} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {tw} from '@astryxdesign/core/utils';

const styles = {
  // A card-like panel with square corners, matching the drawer's own corners.
  panel:
    'w-[360px] max-w-full box-border bg-[var(--color-background-card)] border-[length:var(--border-width)] border-solid border-[color:var(--color-border)] rounded-none',
  body: 'p-4 bg-[var(--color-background-muted)] rounded-none',
} as const;

export default function DrawerHeaderShowcase() {
  return (
    // Like the Drawer root, the panel is a padding boundary, so the Layout
    // regions inset by their own --spacing-4 default: the drawer's inset.
    <div className={tw(styles.panel, layoutPaddingResetClassName)}>
      <Layout
        height="auto"
        header={
          <DrawerHeader
            title="Host details"
            subtitle="web-prod-04"
            onOpenChange={() => {}}
            hasDivider
          />
        }
        content={
          <LayoutContent>
            <div className={styles.body}>
              <Text type="body" color="secondary">
                Drawer body content goes here.
              </Text>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
