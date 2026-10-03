import React from 'react';
import {useCurrentFrame, interpolate, spring, useVideoConfig} from 'remotion';

interface Props {
  text: string;
  mode: 'fullscreen' | 'card';  // fullscreen = white on video, card = gold badge on grid
}

/**
 * Caption text with two visual modes matching 开拍 style:
 *
 * "fullscreen" mode: white bold text at bottom, heavy shadow (person talking)
 * "card" mode: golden text in rounded badge (grid + B-roll layout)
 *
 * Both modes have character-by-character typing animation.
 */
export const CaptionBadge: React.FC<Props> = ({text, mode}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Character-by-character reveal: ~3 chars per frame at 30fps
  const charsToShow = Math.min(text.length, Math.floor(frame * 2.5) + 1);
  const visibleText = text.slice(0, charsToShow);
  const isComplete = charsToShow >= text.length;

  // Fade in
  const opacity = interpolate(frame, [0, 3], [0, 1], {extrapolateRight: 'clamp'});

  if (mode === 'fullscreen') {
    // White text at bottom center, heavy shadow — for person talking mode
    return (
      <div
        style={{
          position: 'absolute',
          bottom: 240,
          left: 24,
          right: 24,
          display: 'flex',
          justifyContent: 'center',
          opacity,
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 900,
            color: '#FFFFFF',
            fontFamily: "'PingFang SC', 'Noto Sans SC', sans-serif",
            textAlign: 'center',
            lineHeight: 1.4,
            letterSpacing: 3,
            paintOrder: 'stroke fill',
            WebkitTextStroke: '2.5px rgba(0,0,0,0.5)',
            textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 0 10px rgba(0,0,0,0.7)',
          }}
        >
          {visibleText}
          {!isComplete && <span style={{opacity: 0.4}}>|</span>}
        </div>
      </div>
    );
  }

  // Card mode: golden text in rounded badge — for grid + B-roll layout
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: 30,
        right: 30,
        display: 'flex',
        justifyContent: 'center',
        opacity,
      }}
    >
      <div
        style={{
          display: 'inline-block',
          padding: '14px 32px',
          borderRadius: 14,
          backgroundColor: 'rgba(60, 55, 20, 0.85)',
          border: '1.5px solid rgba(180, 165, 50, 0.4)',
        }}
      >
        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: '#C4B340',
            fontFamily: "'PingFang SC', 'Noto Sans SC', sans-serif",
            textAlign: 'center',
            lineHeight: 1.3,
            letterSpacing: 4,
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          {visibleText}
          {!isComplete && <span style={{opacity: 0.3}}>|</span>}
        </div>
      </div>
    </div>
  );
};
