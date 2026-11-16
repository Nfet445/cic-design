// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file indicatorHover.stylex.ts
 * @input Checkbox or radio state and the indicator marker scope
 * @output The hover tint a box or circle takes under the owning control's hover
 * @position StyleX remainder of Indicator; the marker stays in
 *           indicator.markers.stylex.ts
 *
 * The tint reads the ancestor marker, and only the marker's generated class
 * name reaches the hover arm, so this one paint stays on StyleX. Its repeated
 * class selector outranks a utility class, so it lands over the border and
 * fill `indicatorClasses.ts` sets at rest — in any sheet order.
 *
 * A disabled box or circle composes no arm: the owner drops the marker while
 * disabled, so no hover could reach it, and a rest-only class has nothing to
 * reset.
 */

import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';
import {indicatorScope} from './indicator.markers.stylex';

const styles = stylex.create({
  unchecked: {
    borderColor: {
      default: null,
      [stylex.when.ancestor(':hover', indicatorScope)]: {
        '@media (hover: hover)': `color-mix(in srgb, ${colorVars['--color-border-emphasized']}, ${colorVars['--color-tint-hover']} 20%)`,
      },
    },
    backgroundColor: {
      default: null,
      [stylex.when.ancestor(':hover', indicatorScope)]: {
        '@media (hover: hover)': `color-mix(in srgb, ${colorVars['--color-background-surface']}, ${colorVars['--color-tint-hover']} 5%)`,
      },
    },
  },
  checked: {
    borderColor: {
      default: null,
      [stylex.when.ancestor(':hover', indicatorScope)]: {
        '@media (hover: hover)': `color-mix(in srgb, ${colorVars['--color-accent']}, ${colorVars['--color-tint-hover']} 15%)`,
      },
    },
    backgroundColor: {
      default: null,
      [stylex.when.ancestor(':hover', indicatorScope)]: {
        '@media (hover: hover)': `color-mix(in srgb, ${colorVars['--color-accent']}, ${colorVars['--color-tint-hover']} 15%)`,
      },
    },
  },
});

/** The hover tint for a box or circle, or nothing while it is disabled. */
export function indicatorHoverProps({
  isChecked,
  isDisabled,
}: {
  isChecked: boolean;
  isDisabled: boolean;
}) {
  return isDisabled
    ? {}
    : stylex.props(isChecked ? styles.checked : styles.unchecked);
}
