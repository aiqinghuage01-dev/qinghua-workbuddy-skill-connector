import React from 'react';
import {useCurrentFrame, interpolate, spring} from 'remotion';
import {FONT_FAMILY} from '../styles/theme';
import type {StepsData, SceneComponentProps} from './types';

const STEP_COLORS = ['#06b6d4', '#f59e0b', '#ec4899', '#10b981', '#8b5cf6', '#3b82f6'];

export const StepsScene: React.FC<SceneComponentProps> = ({data}) => {
  const frame = useCurrentFrame();
  const d = data as StepsData;
  const emoji = (d as any).emoji || '';
  const emojiScale = spring({frame: Math.max(0, frame - 3), fps: 30, config: {damping: 10, stiffness: 80}});

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      paddingBottom: '18%', padding: '0 70px',
      fontFamily: FONT_FAMILY,
    }}>
      {emoji && (
        <div style={{
          fontSize: 80, marginBottom: 12, lineHeight: 1,
          opacity: interpolate(frame, [0, 10], [0, 1], {extrapolateRight: 'clamp'}),
          transform: `scale(${emojiScale})`,
        }}>
          {emoji}
        </div>
      )}
      {d.title && (
        <div style={{
          fontSize: 48, fontWeight: 800, color: '#ffffff', marginBottom: 36,
          textAlign: 'center',
          opacity: interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'}),
        }}>
          {d.title}
        </div>
      )}
      {d.steps.map((step, i) => {
        const delay = (d.title ? 10 : 0) + i * 12;
        const scale = spring({frame: Math.max(0, frame - delay), fps: 30, config: {damping: 14, stiffness: 100}});
        const opacity = interpolate(frame, [delay, delay + 12], [0, 1], {extrapolateRight: 'clamp'});
        const color = STEP_COLORS[i % STEP_COLORS.length];

        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 20,
            marginBottom: 24, opacity, transform: `scale(${scale})`,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: color, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 800, color: '#000',
              flexShrink: 0, boxShadow: `0 0 16px ${color}44`,
            }}>
              {i + 1}
            </div>
            <div>
              <div style={{fontSize: 32, fontWeight: 700, color: '#ffffff', lineHeight: 1.4}}>
                {step.label}
              </div>
              {step.description && (
                <div style={{fontSize: 24, color: 'rgba(255,255,255,0.5)', marginTop: 4, lineHeight: 1.5}}>
                  {step.description}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
