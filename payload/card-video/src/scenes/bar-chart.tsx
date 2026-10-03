import React from 'react';
import {useCurrentFrame, interpolate, spring} from 'remotion';
import {FONT_FAMILY} from '../styles/theme';
import type {BarChartData, SceneComponentProps} from './types';

const DEFAULT_COLORS = ['#06b6d4', '#f59e0b', '#ec4899', '#10b981', '#8b5cf6', '#3b82f6', '#ef4444'];

export const BarChartScene: React.FC<SceneComponentProps> = ({data}) => {
  const frame = useCurrentFrame();
  const d = data as BarChartData;
  const maxVal = Math.max(...d.bars.map((b) => b.value));

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', paddingBottom: '18%', padding: '0 80px',
      fontFamily: FONT_FAMILY,
    }}>
      {d.title && (
        <div style={{
          fontSize: 40, fontWeight: 800, color: '#ffffff',
          marginBottom: 40, textAlign: 'center',
          opacity: interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'}),
        }}>
          {d.title}
        </div>
      )}
      <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
        {d.bars.map((bar, i) => {
          const delay = 10 + i * 10;
          const opacity = interpolate(frame, [delay, delay + 10], [0, 1], {extrapolateRight: 'clamp'});
          const widthPct = interpolate(frame, [delay + 5, delay + 35], [0, (bar.value / maxVal) * 100], {extrapolateRight: 'clamp'});
          const color = bar.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
          return (
            <div key={i} style={{opacity}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
                <span style={{fontSize: 24, color: 'rgba(255,255,255,0.8)'}}>{bar.label}</span>
                <span style={{fontSize: 24, color: 'rgba(255,255,255,0.5)'}}>{bar.value}</span>
              </div>
              <div style={{height: 28, background: 'rgba(255,255,255,0.08)', borderRadius: 14}}>
                <div style={{
                  height: '100%', borderRadius: 14,
                  width: `${widthPct}%`,
                  background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                  boxShadow: `0 0 12px ${color}44`,
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
