import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {COLORS} from '../styles/theme';

export const DarkBackground: React.FC = () => {
  const frame = useCurrentFrame();

  // Slow breathing animation for glows
  const breathe = interpolate(
    frame % 180,
    [0, 90, 180],
    [0.8, 1, 0.8],
  );

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${COLORS.bgBase} 0%, #1a0a2e 30%, #0a1628 70%, ${COLORS.bgBase} 100%)`,
      }}
    >
      {/* Purple glow - left */}
      <div
        style={{
          position: 'absolute',
          width: 700,
          height: 700,
          left: -200,
          top: '40%',
          transform: 'translateY(-50%)',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(120,80,255,0.18) 0%, transparent 60%)',
          filter: 'blur(80px)',
          opacity: breathe,
        }}
      />
      {/* Warm orange glow - right top */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          right: -150,
          top: '10%',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(255,100,50,0.12) 0%, transparent 60%)',
          filter: 'blur(80px)',
          opacity: breathe,
        }}
      />
      {/* Cyan glow - bottom center */}
      <div
        style={{
          position: 'absolute',
          width: 600,
          height: 400,
          left: '40%',
          bottom: -100,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(50,200,255,0.10) 0%, transparent 60%)',
          filter: 'blur(80px)',
          opacity: breathe,
        }}
      />
      {/* Pink accent glow - right bottom */}
      <div
        style={{
          position: 'absolute',
          width: 400,
          height: 400,
          right: -80,
          bottom: '20%',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }}
      />
      {/* Subtle center spotlight */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background:
            'radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0.03) 0%, transparent 50%)',
        }}
      />
    </AbsoluteFill>
  );
};
