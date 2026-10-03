import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {FONT_FAMILY} from '../styles/theme';
import type {TimelineData, SceneComponentProps} from './types';

export const TimelineScene: React.FC<SceneComponentProps> = ({data}) => {
  const frame = useCurrentFrame();
  const d = data as TimelineData;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', paddingBottom: '18%', padding: '0 100px',
      fontFamily: FONT_FAMILY,
    }}>
      {d.events.map((event, i) => {
        const delay = i * 15;
        const opacity = interpolate(frame, [delay, delay + 14], [0, 1], {extrapolateRight: 'clamp'});
        const y = interpolate(frame, [delay, delay + 14], [30, 0], {extrapolateRight: 'clamp'});
        const lineHeight = interpolate(frame, [delay + 5, delay + 20], [0, 100], {extrapolateRight: 'clamp'});

        return (
          <div key={i} style={{display: 'flex', gap: 28, opacity, transform: `translateY(${y}px)`}}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20}}>
              <div style={{
                width: 16, height: 16, borderRadius: '50%',
                background: '#f59e0b', boxShadow: '0 0 12px rgba(245,158,11,0.6)',
                flexShrink: 0,
              }} />
              {i < d.events.length - 1 && (
                <div style={{
                  width: 2, background: 'rgba(245,158,11,0.3)',
                  height: `${lineHeight}%`, minHeight: 30,
                }} />
              )}
            </div>
            <div style={{paddingBottom: 32}}>
              <div style={{fontSize: 28, fontWeight: 700, color: '#f59e0b'}}>{event.year}</div>
              <div style={{fontSize: 28, color: 'rgba(255,255,255,0.8)', marginTop: 8, lineHeight: 1.5}}>{event.text}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
