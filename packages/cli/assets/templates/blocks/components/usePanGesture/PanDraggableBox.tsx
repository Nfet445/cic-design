// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useCallback, useRef, useState, type Ref} from 'react';
import {createPanGesture} from '@astryxdesign/core';
import {Card} from '@astryxdesign/core/Card';
import {Center} from '@astryxdesign/core/Center';
import {HStack} from '@astryxdesign/core/HStack';
import {usePanGesture, type PanGestureEvent} from '@astryxdesign/core/hooks';

// `CSSProperties` has no index signature for custom properties, so the drag's
// inline style needs this alias to typecheck.
type DragStyle = React.CSSProperties &
  Record<'--astryx-box-x' | '--astryx-box-y', string>;

const styles = {
  // A wash under the stage, so the box on top reads in light and dark themes.
  stage: 'bg-[var(--color-neutral)] rounded-[var(--radius-container)]',
  // The place the drag leaves the box in comes from the two variables.
  box: 'cursor-grab select-none [translate:var(--astryx-box-x)_var(--astryx-box-y)]',
  // Let go, the box springs back, unless the person reduces motion.
  springBack:
    'transition-[translate] [transition-duration:var(--duration-medium)] [transition-timing-function:var(--ease-move)] motion-reduce:transition-none',
} as const;

type Drag = {x: number; y: number; held: boolean};
const REST: Drag = {x: 0, y: 0, held: false};

/** The box follows a held drag and goes back to rest when it ends. */
function nextDrag({state, translation}: PanGestureEvent): Drag {
  const held = state === 'began' || state === 'changed';
  return held ? {...translation, held} : REST;
}

/** The same stage and card for both forms; the card names its API. */
function DraggableBox(props: {
  name: string;
  ref: Ref<HTMLDivElement>;
  drag: Drag;
}) {
  const {name, ref, drag} = props;
  const dragStyle: DragStyle = {
    '--astryx-box-x': `${drag.x}px`,
    '--astryx-box-y': `${drag.y}px`,
  };
  return (
    <Center width="min(280px, 80vw)" height={180} className={styles.stage}>
      <Card
        ref={ref}
        padding={6}
        elevation="med"
        className={`${styles.box} ${drag.held ? '' : styles.springBack}`}
        style={dragStyle}>
        {name}
      </Card>
    </Center>
  );
}

function WithHook() {
  const box = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState(REST);
  usePanGesture(box, {onPan: event => setDrag(nextDrag(event))});
  return <DraggableBox name="usePanGesture" ref={box} drag={drag} />;
}

function WithFactory() {
  const [drag, setDrag] = useState(REST);
  // A callback ref: its cleanup takes the pan down with the box.
  const draggable = useCallback((box: HTMLDivElement | null) => {
    if (box == null) {
      return undefined;
    }
    const pan = createPanGesture(box, {
      onPan: event => setDrag(nextDrag(event)),
    });
    return () => pan.destroy();
  }, []);
  return <DraggableBox name="createPanGesture" ref={draggable} drag={drag} />;
}

export default function PanDraggableBox() {
  return (
    <HStack gap={6} wrap="wrap" justify="center">
      <WithHook />
      <WithFactory />
    </HStack>
  );
}
