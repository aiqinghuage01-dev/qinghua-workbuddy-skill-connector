import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {FONT_FAMILY} from '../styles/theme';
import type {MatrixData, SceneComponentProps} from './types';

export const MatrixScene: React.FC<SceneComponentProps> = ({data}) => {
  const frame = useCurrentFrame();
  const d = data as MatrixData;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', paddingBottom: '18%',
      fontFamily: FONT_FAMILY, padding: '0 50px',
    }}>
      {d.title && (
        <div style={{
          fontSize: 40, fontWeight: 800, color: '#ffffff', marginBottom: 36,
          opacity: interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'}),
        }}>
          {d.title}
        </div>
      )}
      <div style={{width: '100%', maxWidth: 900}}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${d.headers.length}, 1fr)`,
          gap: 2, marginBottom: 4,
        }}>
          {d.headers.map((h, i) => {
            const delay = 8 + i * 4;
            return (
              <div key={i} style={{
                padding: '14px 16px', textAlign: 'center',
                fontSize: 24, fontWeight: 700, color: '#f59e0b',
                background: 'rgba(245,158,11,0.1)',
                borderRadius: i === 0 ? '12px 0 0 0' : i === d.headers.length - 1 ? '0 12px 0 0' : 0,
                opacity: interpolate(frame, [delay, delay + 10], [0, 1], {extrapolateRight: 'clamp'}),
              }}>
                {h}
              </div>
            );
          })}
        </div>
        {/* Rows */}
        {d.rows.map((row, ri) => {
          const rowDelay = 15 + ri * 10;
          return (
            <div key={ri} style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${d.headers.length}, 1fr)`,
              gap: 2, marginBottom: 2,
            }}>
              {row.map((cell, ci) => (
                <div key={ci} style={{
                  padding: '12px 16px', textAlign: 'center',
                  fontSize: 22, color: 'rgba(255,255,255,0.8)',
                  background: 'rgba(255,255,255,0.04)',
                  opacity: interpolate(frame, [rowDelay, rowDelay + 10], [0, 1], {extrapolateRight: 'clamp'}),
                }}>
                  {cell}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
