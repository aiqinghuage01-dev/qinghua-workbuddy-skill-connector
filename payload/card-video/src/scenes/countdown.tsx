import React from 'react';
import {useCurrentFrame, interpolate, spring} from 'remotion';
import {FONT_FAMILY} from '../styles/theme';
import type {CountdownData, SceneComponentProps} from './types';

export const CountdownScene: React.FC<SceneComponentProps> = ({data, durationInFrames}) => {
  const frame = useCurrentFrame();
  const d = data as CountdownData;

  const countdownValue = interpolate(frame, [10, durationInFrames - 15], [d.from, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const displayValue = Math.ceil(countdownValue);
  const fractional = countdownValue - Math.floor(countdownValue);
  const pulse = 0.95 + fractional * 0.05;

  const opacity = interpolate(frame, [0, 10], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', paddingBottom: '18%',
      fontFamily: FONT_FAMILY, opacity,
    }}>
      {d.label && (
        <div style={{fontSize: 32, color: 'rgba(255,255,255,0.5)', marginBottom: 24}}>
          {d.label}
        </div>
      )}
      <div style={{
        fontSize: 160, fontWeight: 900, color: '#ffffff',
        transform: `scale(${pulse})`,
        textShadow: '0 0 40px rgba(245,158,11,0.4)',
      }}>
        {displayValue}
      </div>
      {/* Ring decoration */}
      <svg width={300} height={300} style={{position: 'absolute', opacity: 0.3}}>
        <circle cx={150} cy={150} r={130} fill="none" stroke="#f59e0b" strokeWidth={2}
          strokeDasharray={`${(1 - countdownValue / d.from) * 817} 817`}
          transform="rotate(-90 150 150)" />
      </svg>
    </div>
  );
};
