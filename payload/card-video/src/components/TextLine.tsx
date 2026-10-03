import React from 'react';
import {interpolate, spring} from 'remotion';
import {ScriptLine} from '../types';
import {COLORS, FONT_FAMILY, ANIMATION, LayoutConfig} from '../styles/theme';

interface Props {
  line: ScriptLine;
  index: number;
  localFrame: number;
  durationFrames: number;
  layout: LayoutConfig;
}

const GRADIENT_PAIRS: Record<string, string> = {
  '#ef4444': 'linear-gradient(135deg, #ef4444, #f97316, #fbbf24)',
  '#f59e0b': 'linear-gradient(135deg, #f59e0b, #eab308, #fbbf24)',
  '#06b6d4': 'linear-gradient(135deg, #06b6d4, #3b82f6, #818cf8)',
  '#ec4899': 'linear-gradient(135deg, #ec4899, #a855f7, #818cf8)',
  '#10b981': 'linear-gradient(135deg, #10b981, #06b6d4, #3b82f6)',
  '#eab308': 'linear-gradient(135deg, #eab308, #f59e0b, #f97316)',
  '#3b82f6': 'linear-gradient(135deg, #3b82f6, #8b5cf6, #a855f7)',
  '#8b5cf6': 'linear-gradient(135deg, #8b5cf6, #ec4899, #f43f5e)',
};

function getGradient(color: string): string {
  return GRADIENT_PAIRS[color] || `linear-gradient(135deg, ${color}, #f59e0b, #fbbf24)`;
}

export const TextLine: React.FC<Props> = ({line, index, localFrame, durationFrames, layout}) => {
  const startFrame = index * ANIMATION.lineStaggerFrames;

  const opacity = interpolate(
    localFrame,
    [startFrame, startFrame + ANIMATION.lineFadeInFrames],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  const translateY = interpolate(
    localFrame,
    [startFrame, startFrame + ANIMATION.lineFadeInFrames],
    [ANIMATION.lineSlideUpPx, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  const baseStyle: React.CSSProperties = {
    opacity,
    transform: `translateY(${translateY}px)`,
    fontFamily: FONT_FAMILY,
    textAlign: 'center',
    maxWidth: '92%',
    lineHeight: 1.35,
  };

  // Gradient — huge dramatic text with spring scale-pop
  if (line.style === 'gradient') {
    const color = line.color || COLORS.emphasis.orange;
    const gradient = getGradient(color);

    // Spring bounce scale: 0.8 → overshoot → 1.0
    const scaleSpring = spring({
      frame: Math.max(0, localFrame - startFrame),
      fps: layout.fps,
      config: {damping: 12, stiffness: 180, mass: 0.8},
    });
    const scale = interpolate(scaleSpring, [0, 1], [0.8, 1]);

    return (
      <div
        style={{
          ...baseStyle,
          transform: `translateY(${translateY}px) scale(${scale})`,
          fontSize: layout.gradientSize,
          fontWeight: 900,
          background: gradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: layout.lineGap + 8,
          letterSpacing: 4,
          filter: `drop-shadow(0 0 30px ${color}44) drop-shadow(0 4px 8px rgba(0,0,0,0.5))`,
        }}
      >
        {line.text}
      </div>
    );
  }

  // Title — large white bold text
  if (line.style === 'title') {
    return (
      <div
        style={{
          ...baseStyle,
          fontSize: layout.titleSize,
          fontWeight: 800,
          color: line.color || COLORS.titleColor,
          marginBottom: layout.lineGap + 4,
          letterSpacing: 2,
          textShadow: '0 0 30px rgba(255,255,255,0.12), 0 2px 4px rgba(0,0,0,0.5)',
        }}
      >
        {line.text}
      </div>
    );
  }

  // Emphasis — colored text with glow + subtle scale-up
  if (line.style === 'emphasis') {
    const color = line.color || COLORS.emphasis.orange;

    // Subtle scale from 0.92 → 1.0 during fade-in
    const emphasisScale = interpolate(
      localFrame,
      [startFrame, startFrame + ANIMATION.lineFadeInFrames],
      [0.92, 1],
      {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
    );

    return (
      <div
        style={{
          ...baseStyle,
          transform: `translateY(${translateY}px) scale(${emphasisScale})`,
          fontSize: layout.emphasisSize,
          fontWeight: 800,
          color,
          marginBottom: layout.lineGap,
          letterSpacing: 1,
          textShadow: `0 0 20px ${color}66, 0 0 40px ${color}33, 0 2px 4px rgba(0,0,0,0.5)`,
        }}
      >
        {line.text}
      </div>
    );
  }

  // Badge — pill-shaped colored background
  if (line.style === 'badge') {
    const bgColor = line.color || COLORS.emphasis.red;
    return (
      <div style={{...baseStyle, marginBottom: layout.lineGap + 2}}>
        <span
          style={{
            fontSize: layout.badgeSize,
            fontWeight: 700,
            color: '#ffffff',
            background: bgColor,
            padding: '10px 32px',
            borderRadius: 50,
            display: 'inline-block',
            letterSpacing: 3,
            boxShadow: `0 4px 20px ${bgColor}44`,
          }}
        >
          {line.text}
        </span>
      </div>
    );
  }

  // Body — smaller supporting text
  return (
    <div
      style={{
        ...baseStyle,
        fontSize: layout.bodySize,
        fontWeight: 400,
        color: line.color || COLORS.bodyColor,
        marginBottom: layout.lineGap - 2,
        lineHeight: 1.6,
        letterSpacing: 1,
      }}
    >
      {line.text}
    </div>
  );
};
