import React from 'react';
import {useCurrentFrame, interpolate, spring} from 'remotion';
import {LayoutConfig, ANIMATION} from '../styles/theme';

interface Props {
  emoji: string;
  slideIndex: number;
  layout: LayoutConfig;
}

export const SlideEmoji: React.FC<Props> = ({emoji, slideIndex, layout}) => {
  const frame = useCurrentFrame();
  const fps = layout.fps;

  // Delayed entrance — appears after first text line
  const delay = ANIMATION.lineStaggerFrames * 2;

  const opacity = interpolate(
    frame,
    [delay, delay + 10],
    [0, 0.85],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  // Spring bounce entrance
  const scaleSpring = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: {damping: 10, stiffness: 160, mass: 0.6},
  });
  const scale = interpolate(scaleSpring, [0, 1], [0.3, 1]);

  // Gentle floating animation
  const floatY = interpolate(
    frame % (fps * 2),
    [0, fps, fps * 2],
    [0, -10, 0],
  );

  // Slight rotation wobble
  const rotate = interpolate(
    frame % (fps * 3),
    [0, fps * 1.5, fps * 3],
    [-6, 6, -6],
  );

  // Alternate position: upper-left vs upper-right based on slideIndex
  const isLeft = slideIndex % 2 === 0;
  const size = layout.width >= 1280 ? 64 : 80;
  const horizontalOffset = layout.contentPadding + 10;

  return (
    <div
      style={{
        position: 'absolute',
        ...(isLeft ? {left: horizontalOffset} : {right: horizontalOffset}),
        top: '15%',
        fontSize: size,
        opacity,
        transform: `translateY(${floatY}px) rotate(${rotate}deg) scale(${scale})`,
        filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.4))',
        lineHeight: 1,
        pointerEvents: 'none',
      }}
    >
      {emoji}
    </div>
  );
};
