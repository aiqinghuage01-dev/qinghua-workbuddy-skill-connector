import React from 'react';
import {useCurrentFrame, interpolate, spring} from 'remotion';
import {FONT_FAMILY} from '../styles/theme';
import type {TextData, SceneComponentProps} from './types';

export const TextScene: React.FC<SceneComponentProps> = ({data}) => {
  const frame = useCurrentFrame();
  const d = data as TextData;
  const lines = d.body.split('\n').filter(Boolean);
  const emoji = (d as any).emoji || '';
  const emojiScale = spring({frame: Math.max(0, frame - 5), fps: 30, config: {damping: 10, stiffness: 80}});

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      paddingBottom: '18%', padding: '0 70px',
      fontFamily: FONT_FAMILY, textAlign: 'center',
    }}>
      {emoji && (
        <div style={{
          fontSize: 100, marginBottom: 20, lineHeight: 1,
          opacity: interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'}),
          transform: `scale(${emojiScale})`,
        }}>
          {emoji}
        </div>
      )}
      {d.heading && (
        <div style={{
          fontSize: 56, fontWeight: 800, color: '#ffffff',
          marginBottom: 32, lineHeight: 1.3,
          opacity: interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'}),
          transform: `translateY(${interpolate(frame, [0, 12], [24, 0], {extrapolateRight: 'clamp'})}px)`,
        }}>
          {d.heading}
        </div>
      )}
      {lines.map((line, i) => {
        const delay = (d.heading ? 10 : 0) + i * 8;
        const opacity = interpolate(frame, [delay, delay + 14], [0, 1], {extrapolateRight: 'clamp'});
        const y = interpolate(frame, [delay, delay + 14], [24, 0], {extrapolateRight: 'clamp'});
        return (
          <div key={i} style={{
            fontSize: 38, color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.9, fontWeight: 400,
            opacity, transform: `translateY(${y}px)`,
          }}>
            {line}
          </div>
        );
      })}
    </div>
  );
};
