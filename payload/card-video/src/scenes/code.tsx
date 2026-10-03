import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {FONT_FAMILY} from '../styles/theme';
import type {CodeData, SceneComponentProps} from './types';

export const CodeScene: React.FC<SceneComponentProps> = ({data, durationInFrames}) => {
  const frame = useCurrentFrame();
  const d = data as CodeData;

  const codeChars = d.code.length;
  const typingEnd = Math.min(durationInFrames - 15, 120);
  const charsVisible = Math.floor(interpolate(frame, [10, typingEnd], [0, codeChars], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  }));

  const windowOpacity = interpolate(frame, [0, 10], [0, 1], {extrapolateRight: 'clamp'});
  const windowY = interpolate(frame, [0, 10], [30, 0], {extrapolateRight: 'clamp'});

  const visibleCode = d.code.substring(0, charsVisible);
  const lines = visibleCode.split('\n');

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', paddingBottom: '18%',
      fontFamily: FONT_FAMILY, padding: '0 50px',
    }}>
      {/* Terminal title */}
      {d.filename && (
        <div style={{
          fontSize: 24, color: 'rgba(255,255,255,0.5)',
          marginBottom: 16, opacity: windowOpacity,
        }}>
          {d.filename}
        </div>
      )}

      {/* Code window */}
      <div style={{
        width: '100%', maxWidth: 900,
        background: '#1e1e2e',
        borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        opacity: windowOpacity,
        transform: `translateY(${windowY}px)`,
      }}>
        {/* Title bar */}
        <div style={{
          height: 40, background: '#2d2d3d',
          display: 'flex', alignItems: 'center',
          padding: '0 16px', gap: 8,
        }}>
          <div style={{width: 12, height: 12, borderRadius: '50%', background: '#ff5f57'}} />
          <div style={{width: 12, height: 12, borderRadius: '50%', background: '#febc2e'}} />
          <div style={{width: 12, height: 12, borderRadius: '50%', background: '#28c840'}} />
          <span style={{marginLeft: 12, fontSize: 14, color: 'rgba(255,255,255,0.4)'}}>
            {d.language || 'code'}
          </span>
        </div>

        {/* Code content */}
        <div style={{padding: '20px 24px', minHeight: 200}}>
          {lines.map((line, i) => (
            <div key={i} style={{
              display: 'flex', gap: 16, fontSize: 22,
              fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
              lineHeight: 1.7,
            }}>
              <span style={{color: 'rgba(255,255,255,0.2)', width: 30, textAlign: 'right', flexShrink: 0}}>
                {i + 1}
              </span>
              <span style={{color: '#e2e8f0', whiteSpace: 'pre'}}>
                {line}
                {i === lines.length - 1 && frame % 30 < 15 && (
                  <span style={{
                    display: 'inline-block', width: 10, height: 22,
                    background: '#f59e0b', marginLeft: 2, verticalAlign: 'text-bottom',
                  }} />
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
