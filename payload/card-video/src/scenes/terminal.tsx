import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {FONT_FAMILY} from '../styles/theme';
import type {TerminalData, SceneComponentProps} from './types';

export const TerminalScene: React.FC<SceneComponentProps> = ({data, durationInFrames}) => {
  const frame = useCurrentFrame();
  const d = data as TerminalData;

  const windowOpacity = interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'});
  const windowY = interpolate(frame, [0, 12], [30, 0], {extrapolateRight: 'clamp'});

  // Calculate total characters for typing animation
  const allText = d.lines.map((l) => l.text).join('');
  const totalChars = allText.length;
  const typingEnd = Math.min(durationInFrames - 15, 90);

  let charBudget = Math.floor(interpolate(frame, [15, typingEnd], [0, totalChars], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  }));

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', paddingBottom: '18%',
      fontFamily: FONT_FAMILY, padding: '0 50px',
    }}>
      {d.title && (
        <div style={{fontSize: 28, color: 'rgba(255,255,255,0.5)', marginBottom: 20, opacity: windowOpacity}}>
          {d.title}
        </div>
      )}
      <div style={{
        width: '100%', maxWidth: 900,
        background: '#1e1e1e', borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        opacity: windowOpacity,
        transform: `translateY(${windowY}px)`,
      }}>
        {/* macOS title bar */}
        <div style={{
          height: 40, background: '#3a3a3a',
          display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8,
        }}>
          <div style={{width: 12, height: 12, borderRadius: '50%', background: '#ff5f57'}} />
          <div style={{width: 12, height: 12, borderRadius: '50%', background: '#febc2e'}} />
          <div style={{width: 12, height: 12, borderRadius: '50%', background: '#28c840'}} />
          <span style={{marginLeft: 12, fontSize: 14, color: 'rgba(255,255,255,0.4)'}}>Terminal</span>
        </div>

        {/* Terminal content */}
        <div style={{padding: '20px 24px', minHeight: 200}}>
          {d.lines.map((line, i) => {
            const lineText = line.text;
            const visible = Math.min(lineText.length, charBudget);
            charBudget = Math.max(0, charBudget - lineText.length);
            if (visible <= 0 && charBudget <= 0 && i > 0) return null;

            const isCmd = line.type === 'command';
            return (
              <div key={i} style={{
                fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
                fontSize: 22, lineHeight: 1.8,
                color: isCmd ? '#e2e8f0' : '#9ca3af',
                display: 'flex', gap: 8,
              }}>
                {isCmd && <span style={{color: '#22c55e', fontWeight: 700}}>$</span>}
                <span style={{whiteSpace: 'pre-wrap'}}>
                  {isCmd ? (
                    <>
                      <span style={{fontWeight: 700}}>{lineText.substring(0, visible)}</span>
                      {visible === lineText.length ? null : (
                        frame % 30 < 15 && <span style={{
                          display: 'inline-block', width: 10, height: 22,
                          background: '#22c55e', marginLeft: 1, verticalAlign: 'text-bottom',
                        }} />
                      )}
                    </>
                  ) : lineText.substring(0, visible)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
