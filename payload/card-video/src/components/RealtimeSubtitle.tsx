import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';

interface Props {
  text: string;
  isCardMode: boolean;
}

/**
 * Real-time subtitle synced to speech.
 * Adapts style based on current mode (person fullscreen vs card grid).
 */
export const RealtimeSubtitle: React.FC<Props> = ({text, isCardMode}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 2], [0, 1], {extrapolateRight: 'clamp'});

  if (isCardMode) {
    // Card mode: golden text in badge
    return (
      <div style={{
        position: 'absolute',
        top: '50%',
        left: 20,
        right: 20,
        display: 'flex',
        justifyContent: 'center',
        opacity,
      }}>
        <div style={{
          display: 'inline-block',
          padding: '10px 28px',
          borderRadius: 12,
          backgroundColor: 'rgba(60, 55, 20, 0.85)',
          border: '1.5px solid rgba(180, 165, 50, 0.4)',
        }}>
          <div style={{
            fontSize: 42,
            fontWeight: 900,
            color: '#C4B340',
            fontFamily: "'PingFang SC', 'Noto Sans SC', sans-serif",
            textAlign: 'center',
            lineHeight: 1.3,
            letterSpacing: 3,
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          }}>
            {text}
          </div>
        </div>
      </div>
    );
  }

  // Fullscreen mode: white text with heavy stroke
  return (
    <div style={{
      position: 'absolute',
      bottom: 200,
      left: 20,
      right: 20,
      display: 'flex',
      justifyContent: 'center',
      opacity,
    }}>
      <div style={{
        fontSize: 42,
        fontWeight: 900,
        color: '#FFFFFF',
        fontFamily: "'PingFang SC', 'Noto Sans SC', sans-serif",
        textAlign: 'center',
        lineHeight: 1.4,
        letterSpacing: 3,
        paintOrder: 'stroke fill',
        WebkitTextStroke: '2.5px rgba(0,0,0,0.5)',
        textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 0 10px rgba(0,0,0,0.7)',
      }}>
        {text}
      </div>
    </div>
  );
};
