import React from 'react';
import {useCurrentFrame, interpolate, spring} from 'remotion';
import {LayoutConfig, ANIMATION} from '../styles/theme';

interface Props {
  slideIndex: number;
  totalSlides: number;
  layout: LayoutConfig;
  durationFrames: number;
  accentColor?: string;
}

/**
 * Decorative animated elements that complement each slide.
 * Alternates between different subtle decoration styles.
 */
export const SlideDecoration: React.FC<Props> = ({
  slideIndex,
  layout,
  durationFrames,
  accentColor = 'rgba(255,255,255,0.08)',
}) => {
  const frame = useCurrentFrame();
  const fps = layout.fps;
  const style = slideIndex % 4;

  // Delay decoration appearance after text starts animating
  const delayFrames = ANIMATION.lineStaggerFrames * 2;

  const progress = interpolate(
    frame,
    [delayFrames, delayFrames + 20],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  // Gentle breathing/pulse animation
  const breathe = interpolate(
    frame % (fps * 3),
    [0, fps * 1.5, fps * 3],
    [0.6, 1, 0.6],
  );

  if (style === 0) {
    // Horizontal accent line — draws from center outward
    const lineWidth = interpolate(progress, [0, 1], [0, layout.width * 0.3]);
    return (
      <div
        style={{
          position: 'absolute',
          top: '22%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: lineWidth,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          opacity: breathe,
        }}
      />
    );
  }

  if (style === 1) {
    // Corner brackets — top-left and bottom-right
    const bracketSize = layout.width >= 1280 ? 40 : 50;
    const offset = layout.width >= 1280 ? 60 : 40;
    return (
      <>
        <div
          style={{
            position: 'absolute',
            top: offset,
            left: offset,
            width: bracketSize,
            height: bracketSize,
            borderTop: `2px solid ${accentColor}`,
            borderLeft: `2px solid ${accentColor}`,
            opacity: progress * breathe,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: offset + 60,
            right: offset,
            width: bracketSize,
            height: bracketSize,
            borderBottom: `2px solid ${accentColor}`,
            borderRight: `2px solid ${accentColor}`,
            opacity: progress * breathe,
          }}
        />
      </>
    );
  }

  if (style === 2) {
    // Small floating dots
    const dotCount = 3;
    return (
      <>
        {Array.from({length: dotCount}).map((_, i) => {
          const x = 15 + i * 30;
          const baseY = 18 + i * 8;
          const floatY = interpolate(
            (frame + i * 10) % (fps * 2),
            [0, fps, fps * 2],
            [0, -6, 0],
          );
          const dotProgress = interpolate(
            frame,
            [delayFrames + i * 8, delayFrames + i * 8 + 15],
            [0, 1],
            {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
          );
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                right: `${x}px`,
                top: `${baseY}%`,
                width: 4 + i * 2,
                height: 4 + i * 2,
                borderRadius: '50%',
                background: accentColor,
                opacity: dotProgress * breathe,
                transform: `translateY(${floatY}px)`,
              }}
            />
          );
        })}
      </>
    );
  }

  // style === 3: Vertical side accent
  const lineHeight = interpolate(progress, [0, 1], [0, layout.height * 0.25]);
  return (
    <div
      style={{
        position: 'absolute',
        left: layout.width >= 1280 ? 40 : 24,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 2,
        height: lineHeight,
        background: `linear-gradient(180deg, transparent, ${accentColor}, transparent)`,
        opacity: breathe,
      }}
    />
  );
};
