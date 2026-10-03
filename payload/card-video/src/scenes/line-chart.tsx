import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {FONT_FAMILY} from '../styles/theme';
import type {LineChartData, SceneComponentProps} from './types';

const DEFAULT_COLORS = ['#06b6d4', '#f59e0b', '#ec4899', '#10b981'];

export const LineChartScene: React.FC<SceneComponentProps> = ({data}) => {
  const frame = useCurrentFrame();
  const d = data as LineChartData;

  const W = 800, H = 400, PAD = 60;
  const chartW = W - PAD * 2, chartH = H - PAD * 2;
  const allVals = d.datasets.flatMap((ds) => ds.values);
  const minV = Math.min(...allVals), maxV = Math.max(...allVals);
  const range = maxV - minV || 1;
  const n = d.labels.length;

  const drawProgress = interpolate(frame, [15, 60], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const titleOpacity = interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', paddingBottom: '18%',
      fontFamily: FONT_FAMILY,
    }}>
      {d.title && (
        <div style={{fontSize: 40, fontWeight: 800, color: '#ffffff', marginBottom: 28, opacity: titleOpacity}}>
          {d.title}
        </div>
      )}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
          const y = PAD + chartH * (1 - f);
          return (
            <line key={i} x1={PAD} y1={y} x2={W - PAD} y2={y}
              stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
          );
        })}
        {/* Datasets */}
        {d.datasets.map((ds, di) => {
          const color = ds.color || DEFAULT_COLORS[di % DEFAULT_COLORS.length];
          const points = ds.values.map((v, i) => ({
            x: PAD + (i / (n - 1)) * chartW,
            y: PAD + chartH * (1 - (v - minV) / range),
          }));
          const visibleCount = Math.floor(drawProgress * points.length);
          const visiblePoints = points.slice(0, visibleCount + 1);
          if (visiblePoints.length < 2) return null;
          const pathD = visiblePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
          return (
            <g key={di}>
              <path d={pathD} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
              {visiblePoints.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={4} fill={color}
                  opacity={interpolate(frame, [15 + i * 3, 18 + i * 3], [0, 1], {extrapolateRight: 'clamp'})} />
              ))}
            </g>
          );
        })}
        {/* X-axis labels */}
        {d.labels.map((label, i) => {
          const x = PAD + (i / (n - 1)) * chartW;
          return (
            <text key={i} x={x} y={H - 10} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={18}>
              {label}
            </text>
          );
        })}
      </svg>
      {/* Legend */}
      <div style={{display: 'flex', gap: 28, marginTop: 16}}>
        {d.datasets.map((ds, i) => {
          const color = ds.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 8,
              opacity: interpolate(frame, [50 + i * 5, 58 + i * 5], [0, 1], {extrapolateRight: 'clamp'}),
            }}>
              <div style={{width: 12, height: 12, borderRadius: 3, background: color}} />
              <span style={{fontSize: 20, color: 'rgba(255,255,255,0.6)'}}>{ds.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
