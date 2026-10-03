import React from 'react';
import {useCurrentFrame, interpolate, spring} from 'remotion';
import {FONT_FAMILY} from '../styles/theme';
import type {ListData, SceneComponentProps} from './types';

const ACCENT_COLORS = ['#f59e0b', '#06b6d4', '#ec4899', '#10b981', '#8b5cf6', '#3b82f6', '#ef4444', '#22c55e'];

export const ListScene: React.FC<SceneComponentProps> = ({data}) => {
  const frame = useCurrentFrame();
  const d = data as ListData;
  const emoji = (d as any).emoji || '';
  const emojiScale = spring({frame: Math.max(0, frame - 3), fps: 30, config: {damping: 10, stiffness: 80}});

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      paddingBottom: '18%', padding: '0 70px',
      fontFamily: FONT_FAMILY,
    }}>
      {emoji && (
        <div style={{
          fontSize: 90, marginBottom: 16, lineHeight: 1,
          opacity: interpolate(frame, [0, 10], [0, 1], {extrapolateRight: 'clamp'}),
          transform: `scale(${emojiScale})`,
        }}>
          {emoji}
        </div>
      )}
      {d.title && (
        <div style={{
          fontSize: 50, fontWeight: 800, color: '#ffffff', marginBottom: 36,
          textAlign: 'center',
          opacity: interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'}),
        }}>
          {d.title}
        </div>
      )}
      {d.items.map((item, i) => {
        const delay = (d.title ? 10 : 0) + i * 10;
        const opacity = interpolate(frame, [delay, delay + 12], [0, 1], {extrapolateRight: 'clamp'});
        const x = interpolate(frame, [delay, delay + 12], [-30, 0], {extrapolateRight: 'clamp'});
        const color = ACCENT_COLORS[i % ACCENT_COLORS.length];
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 20,
            fontSize: 36, color: 'rgba(255,255,255,0.9)',
            lineHeight: 2.2, opacity,
            transform: `translateX(${x}px)`,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: color, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 700, color: '#000',
              flexShrink: 0,
            }}>
              {d.ordered ? i + 1 : '•'}
            </div>
            {item}
          </div>
        );
      })}
    </div>
  );
};
