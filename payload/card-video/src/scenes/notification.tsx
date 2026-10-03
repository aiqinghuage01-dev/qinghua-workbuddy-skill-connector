import React from 'react';
import {useCurrentFrame, interpolate, spring} from 'remotion';
import {FONT_FAMILY} from '../styles/theme';
import type {NotificationData, SceneComponentProps} from './types';

export const NotificationScene: React.FC<SceneComponentProps> = ({data}) => {
  const frame = useCurrentFrame();
  const d = data as NotificationData;

  const slideY = spring({frame, fps: 30, config: {damping: 12, stiffness: 80}});
  const opacity = interpolate(frame, [0, 10], [0, 1], {extrapolateRight: 'clamp'});
  const glowPulse = 0.3 + Math.sin(frame * 0.08) * 0.15;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '18%',
      fontFamily: FONT_FAMILY,
    }}>
      <div style={{
        width: '85%', maxWidth: 800,
        background: 'rgba(30,30,40,0.8)',
        borderRadius: 24, padding: '36px 40px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: `0 0 40px rgba(6,182,212,${glowPulse})`,
        opacity,
        transform: `translateY(${interpolate(slideY, [0, 1], [-50, 0])}px)`,
      }}>
        <div style={{display: 'flex', alignItems: 'flex-start', gap: 20}}>
          {d.icon && (
            <div style={{fontSize: 48, flexShrink: 0}}>
              {d.icon}
            </div>
          )}
          <div style={{flex: 1}}>
            {d.app && (
              <div style={{fontSize: 18, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 2}}>
                {d.app}
              </div>
            )}
            <div style={{fontSize: 32, fontWeight: 700, color: '#ffffff', lineHeight: 1.4, marginBottom: 12}}>
              {d.title}
            </div>
            <div style={{fontSize: 26, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6}}>
              {d.body}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
