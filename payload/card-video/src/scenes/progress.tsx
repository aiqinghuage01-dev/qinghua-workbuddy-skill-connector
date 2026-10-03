import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {FONT_FAMILY} from '../styles/theme';
import type {ProgressData, SceneComponentProps} from './types';

const DEFAULT_COLORS = ['#38bdf8', '#22c55e', '#fbbf24', '#ec4899', '#8b5cf6'];

export const ProgressScene: React.FC<SceneComponentProps> = ({data}) => {
  const frame = useCurrentFrame();
  const d = data as ProgressData;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', paddingBottom: '18%', padding: '0 80px', gap: 36,
      fontFamily: FONT_FAMILY,
    }}>
      {d.items.map((item, i) => {
        const delay = i * 12;
        const opacity = interpolate(frame, [delay, delay + 10], [0, 1], {extrapolateRight: 'clamp'});
        const max = item.max || 100;
        const pct = (item.value / max) * 100;
        const fillWidth = interpolate(frame, [delay + 8, delay + 40], [0, pct], {extrapolateRight: 'clamp'});
        const color = item.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];

        return (
          <div key={i} style={{opacity}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 12}}>
              <span style={{fontSize: 28, color: '#ffffff', fontWeight: 600}}>{item.label}</span>
              <span style={{fontSize: 24, color: 'rgba(255,255,255,0.5)'}}>
                {Math.round(interpolate(frame, [delay + 8, delay + 40], [0, item.value], {extrapolateRight: 'clamp'}))}
                {item.max ? ` / ${item.max}` : '%'}
              </span>
            </div>
            <div style={{height: 24, background: 'rgba(255,255,255,0.08)', borderRadius: 12}}>
              <div style={{
                height: '100%', borderRadius: 12,
                width: `${fillWidth}%`,
                background: `linear-gradient(90deg, ${color}, ${color}aa)`,
                boxShadow: `0 0 16px ${color}44`,
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
