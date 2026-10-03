import React from 'react';
import {useCurrentFrame, interpolate, spring} from 'remotion';
import {FONT_FAMILY} from '../styles/theme';
import type {FlowData, SceneComponentProps} from './types';

const NODE_COLORS = ['#06b6d4', '#f59e0b', '#ec4899', '#10b981', '#8b5cf6', '#3b82f6'];

export const FlowScene: React.FC<SceneComponentProps> = ({data}) => {
  const frame = useCurrentFrame();
  const d = data as FlowData;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '18%',
      fontFamily: FONT_FAMILY, padding: '0 40px',
    }}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center'}}>
        {d.nodes.map((node, i) => {
          const delay = i * 12;
          const scale = spring({frame: Math.max(0, frame - delay), fps: 30, config: {damping: 12, stiffness: 100}});
          const opacity = interpolate(frame, [delay, delay + 10], [0, 1], {extrapolateRight: 'clamp'});
          const arrowOpacity = interpolate(frame, [delay + 6, delay + 12], [0, 1], {extrapolateRight: 'clamp'});
          const color = NODE_COLORS[i % NODE_COLORS.length];

          return (
            <React.Fragment key={i}>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                opacity, transform: `scale(${scale})`,
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 16,
                  background: '#1a1a2e',
                  border: `2px solid ${color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32,
                  boxShadow: `0 0 20px ${color}33`,
                }}>
                  {node.icon || '⚡'}
                </div>
                <span style={{fontSize: 22, color: 'rgba(255,255,255,0.8)', textAlign: 'center', maxWidth: 100}}>
                  {node.label}
                </span>
              </div>
              {i < d.nodes.length - 1 && (
                <div style={{
                  fontSize: 24, color: '#f59e0b', opacity: arrowOpacity,
                  margin: '0 4px', marginBottom: 28,
                }}>
                  ▶
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
