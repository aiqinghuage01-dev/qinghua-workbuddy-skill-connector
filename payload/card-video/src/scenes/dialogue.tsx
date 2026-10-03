import React from 'react';
import {useCurrentFrame, interpolate, spring} from 'remotion';
import {FONT_FAMILY} from '../styles/theme';
import type {DialogueData, SceneComponentProps} from './types';

export const DialogueScene: React.FC<SceneComponentProps> = ({data}) => {
  const frame = useCurrentFrame();
  const d = data as DialogueData;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', paddingBottom: '18%', padding: '0 60px', gap: 20,
      fontFamily: FONT_FAMILY,
    }}>
      {d.messages.map((msg, i) => {
        const delay = i * 18;
        const scale = spring({frame: Math.max(0, frame - delay), fps: 30, config: {damping: 14, stiffness: 100}});
        const opacity = interpolate(frame, [delay, delay + 10], [0, 1], {extrapolateRight: 'clamp'});
        const isLeft = msg.role === 'left';

        return (
          <div key={i} style={{
            display: 'flex', flexDirection: 'column',
            alignItems: isLeft ? 'flex-start' : 'flex-end',
            opacity, transform: `scale(${scale})`,
            transformOrigin: isLeft ? 'left center' : 'right center',
          }}>
            {msg.name && (
              <span style={{fontSize: 18, color: 'rgba(255,255,255,0.4)', marginBottom: 6, padding: '0 8px'}}>
                {msg.name}
              </span>
            )}
            <div style={{
              maxWidth: '75%', padding: '16px 24px',
              borderRadius: isLeft ? '4px 20px 20px 20px' : '20px 4px 20px 20px',
              background: isLeft ? 'rgba(255,255,255,0.1)' : 'rgba(6,182,212,0.2)',
              border: `1px solid ${isLeft ? 'rgba(255,255,255,0.1)' : 'rgba(6,182,212,0.3)'}`,
              fontSize: 28, color: '#ffffff', lineHeight: 1.6,
            }}>
              {msg.text}
            </div>
          </div>
        );
      })}
    </div>
  );
};
