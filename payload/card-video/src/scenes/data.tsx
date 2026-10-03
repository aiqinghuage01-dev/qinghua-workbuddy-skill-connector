import React from 'react';
import {useCurrentFrame, interpolate, spring} from 'remotion';
import {FONT_FAMILY} from '../styles/theme';
import type {DataData, SceneComponentProps} from './types';

export const DataScene: React.FC<SceneComponentProps> = ({data, durationInFrames}) => {
  const frame = useCurrentFrame();
  const d = data as DataData;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', paddingBottom: '18%',
      fontFamily: FONT_FAMILY, gap: 48, padding: '0 60px',
    }}>
      {d.items.map((item, i) => {
        const delay = i * 12;
        const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {extrapolateRight: 'clamp'});
        const countUp = interpolate(frame, [delay + 5, delay + 50], [0, item.value], {extrapolateRight: 'clamp'});
        const scale = spring({frame: Math.max(0, frame - delay), fps: 30, config: {damping: 12, stiffness: 120}});

        return (
          <div key={i} style={{
            textAlign: 'center', opacity,
            transform: `scale(${scale})`,
          }}>
            <div style={{fontSize: 80, fontWeight: 900, color: '#ffffff', lineHeight: 1.2}}>
              {item.prefix || ''}{Math.round(countUp).toLocaleString()}{item.unit || ''}
            </div>
            <div style={{fontSize: 28, color: 'rgba(255,255,255,0.5)', marginTop: 8}}>
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
