import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {FONT_FAMILY} from '../styles/theme';
import type {PieChartData, SceneComponentProps} from './types';

const DEFAULT_COLORS = ['#06b6d4', '#f59e0b', '#ec4899', '#10b981', '#8b5cf6', '#ef4444', '#3b82f6'];

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return {x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad)};
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polarToCartesian(cx, cy, r, endDeg);
  const end = polarToCartesian(cx, cy, r, startDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y} Z`;
}

export const PieChartScene: React.FC<SceneComponentProps> = ({data}) => {
  const frame = useCurrentFrame();
  const d = data as PieChartData;
  const total = d.slices.reduce((s, sl) => s + sl.value, 0);
  const sweepProgress = interpolate(frame, [10, 50], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const cx = 200, cy = 200, r = 160;
  let cumDeg = 0;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', paddingBottom: '18%',
      fontFamily: FONT_FAMILY, gap: 36,
    }}>
      {d.title && (
        <div style={{
          fontSize: 40, fontWeight: 800, color: '#ffffff',
          opacity: interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'}),
        }}>
          {d.title}
        </div>
      )}
      <div style={{display: 'flex', alignItems: 'center', gap: 48}}>
        <svg width={400} height={400} viewBox="0 0 400 400">
          {d.slices.map((slice, i) => {
            const deg = (slice.value / total) * 360;
            const startDeg = cumDeg;
            const endDeg = cumDeg + deg * sweepProgress;
            cumDeg += deg;
            const color = slice.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
            return (
              <path
                key={i}
                d={arcPath(cx, cy, r, startDeg, Math.max(startDeg + 0.1, endDeg))}
                fill={color}
                stroke="#0a0a14"
                strokeWidth={2}
                opacity={interpolate(frame, [10 + i * 5, 15 + i * 5], [0, 1], {extrapolateRight: 'clamp'})}
              />
            );
          })}
        </svg>
        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
          {d.slices.map((slice, i) => {
            const color = slice.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
            const pct = Math.round((slice.value / total) * 100);
            const delay = 20 + i * 8;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                opacity: interpolate(frame, [delay, delay + 10], [0, 1], {extrapolateRight: 'clamp'}),
              }}>
                <div style={{width: 16, height: 16, borderRadius: 4, background: color, flexShrink: 0}} />
                <span style={{fontSize: 24, color: 'rgba(255,255,255,0.8)'}}>{slice.label}</span>
                <span style={{fontSize: 22, color: 'rgba(255,255,255,0.4)', marginLeft: 4}}>{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
