import React from 'react';
import {useCurrentFrame, interpolate, spring} from 'remotion';
import {FONT_FAMILY} from '../styles/theme';
import type {QuoteData, SceneComponentProps} from './types';

export const QuoteScene: React.FC<SceneComponentProps> = ({data}) => {
  const frame = useCurrentFrame();
  const d = data as QuoteData;

  const quoteMarkScale = spring({frame, fps: 30, config: {damping: 10, stiffness: 80}});
  const textOpacity = interpolate(frame, [10, 24], [0, 1], {extrapolateRight: 'clamp'});
  const authorOpacity = interpolate(frame, [25, 38], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', paddingBottom: '18%',
      fontFamily: FONT_FAMILY, padding: '0 80px',
    }}>
      <div style={{
        fontSize: 120, color: 'rgba(245,158,11,0.3)', lineHeight: 0.6,
        transform: `scale(${quoteMarkScale})`, marginBottom: 20,
      }}>
        "
      </div>
      <div style={{
        fontSize: 48, color: '#ffffff', fontWeight: 600,
        textAlign: 'center', lineHeight: 1.8,
        fontStyle: 'italic', opacity: textOpacity,
        transform: `translateY(${interpolate(frame, [10, 24], [20, 0], {extrapolateRight: 'clamp'})}px)`,
      }}>
        {d.quote}
      </div>
      {(d.author || d.source) && (
        <div style={{
          fontSize: 28, color: 'rgba(255,255,255,0.5)',
          marginTop: 36, opacity: authorOpacity,
        }}>
          — {d.author}{d.source ? ` · ${d.source}` : ''}
        </div>
      )}
    </div>
  );
};
