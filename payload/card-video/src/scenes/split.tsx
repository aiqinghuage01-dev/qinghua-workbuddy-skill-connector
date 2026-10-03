import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {FONT_FAMILY} from '../styles/theme';
import type {SplitData, SceneComponentProps} from './types';

export const SplitScene: React.FC<SceneComponentProps> = ({data}) => {
  const frame = useCurrentFrame();
  const d = data as SplitData;

  const dividerOpacity = interpolate(frame, [8, 18], [0, 1], {extrapolateRight: 'clamp'});

  const renderPanel = (panel: {heading: string; body: string}, fromLeft: boolean, baseDelay: number) => {
    const x = fromLeft ? -50 : 50;
    const opacity = interpolate(frame, [baseDelay, baseDelay + 15], [0, 1], {extrapolateRight: 'clamp'});
    const tx = interpolate(frame, [baseDelay, baseDelay + 15], [x, 0], {extrapolateRight: 'clamp'});
    return (
      <div style={{
        flex: 1, padding: '0 40px', opacity,
        transform: `translateX(${tx}px)`,
      }}>
        <div style={{fontSize: 36, fontWeight: 800, color: '#ffffff', marginBottom: 24, lineHeight: 1.4}}>
          {panel.heading}
        </div>
        <div style={{fontSize: 26, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8}}>
          {panel.body}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center',
      fontFamily: FONT_FAMILY, padding: '0 40px',
    }}>
      {renderPanel(d.left, true, 0)}
      <div style={{
        width: 2, height: '40%',
        background: 'linear-gradient(180deg, transparent, rgba(245,158,11,0.5), transparent)',
        opacity: dividerOpacity, flexShrink: 0,
      }} />
      {renderPanel(d.right, false, 8)}
    </div>
  );
};
