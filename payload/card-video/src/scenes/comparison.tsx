import React from 'react';
import {useCurrentFrame, interpolate, spring} from 'remotion';
import {FONT_FAMILY} from '../styles/theme';
import type {ComparisonData, SceneComponentProps} from './types';

export const ComparisonScene: React.FC<SceneComponentProps> = ({data}) => {
  const frame = useCurrentFrame();
  const d = data as ComparisonData;

  const vsScale = spring({frame: Math.max(0, frame - 20), fps: 30, config: {damping: 8, stiffness: 120}});
  const vsOpacity = interpolate(frame, [18, 28], [0, 1], {extrapolateRight: 'clamp'});

  const leftCardOpacity = interpolate(frame, [0, 14], [0, 1], {extrapolateRight: 'clamp'});
  const leftCardX = interpolate(frame, [0, 14], [-60, 0], {extrapolateRight: 'clamp'});
  const rightCardOpacity = interpolate(frame, [8, 22], [0, 1], {extrapolateRight: 'clamp'});
  const rightCardX = interpolate(frame, [8, 22], [60, 0], {extrapolateRight: 'clamp'});

  const renderSide = (
    side: {label: string; items: string[]},
    isLeft: boolean,
    baseDelay: number,
  ) => {
    const accentColor = isLeft ? '#ef4444' : '#22c55e';
    const bgColor = isLeft ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)';
    const borderColor = isLeft ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)';
    const icon = isLeft ? '✗' : '✓';
    const iconBg = isLeft ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)';

    return (
      <div style={{
        flex: 1,
        background: bgColor,
        borderRadius: 20,
        border: `1.5px solid ${borderColor}`,
        padding: '32px 28px',
        backdropFilter: 'blur(10px)',
        boxShadow: `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 ${borderColor}`,
      }}>
        {/* Header */}
        <div style={{
          fontSize: 30, fontWeight: 800, color: accentColor,
          marginBottom: 28, textAlign: 'center',
          paddingBottom: 16,
          borderBottom: `1px solid ${borderColor}`,
        }}>
          {side.label}
        </div>

        {/* Items */}
        {side.items.map((item, i) => {
          const delay = baseDelay + 15 + i * 8;
          const opacity = interpolate(frame, [delay, delay + 10], [0, 1], {extrapolateRight: 'clamp'});
          const y = interpolate(frame, [delay, delay + 10], [12, 0], {extrapolateRight: 'clamp'});
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              marginBottom: 18, opacity,
              transform: `translateY(${y}px)`,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, color: accentColor, fontWeight: 700,
                flexShrink: 0,
              }}>
                {icon}
              </div>
              <span style={{
                fontSize: 26, color: 'rgba(255,255,255,0.85)',
                lineHeight: 1.4,
              }}>
                {item}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', paddingBottom: '18%',
      fontFamily: FONT_FAMILY, padding: '0 36px',
    }}>
      <div style={{
        display: 'flex', gap: 20, width: '100%',
        alignItems: 'stretch',
      }}>
        {/* Left card */}
        <div style={{
          flex: 1, opacity: leftCardOpacity,
          transform: `translateX(${leftCardX}px)`,
        }}>
          {renderSide(d.left, true, 0)}
        </div>

        {/* VS badge */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, width: 60,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, #f59e0b, #e8542e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 900, color: '#fff',
            opacity: vsOpacity,
            transform: `scale(${vsScale})`,
            boxShadow: '0 4px 20px rgba(245,158,11,0.4)',
          }}>
            VS
          </div>
        </div>

        {/* Right card */}
        <div style={{
          flex: 1, opacity: rightCardOpacity,
          transform: `translateX(${rightCardX}px)`,
        }}>
          {renderSide(d.right, false, 8)}
        </div>
      </div>
    </div>
  );
};
