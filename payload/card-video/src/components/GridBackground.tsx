import React from 'react';
import {AbsoluteFill} from 'remotion';

/**
 * Dark grid background matching 开拍 style.
 * Subtle grid lines on near-black background.
 */
export const GridBackground: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#111111',
        backgroundImage: [
          'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
        ].join(', '),
        backgroundSize: '40px 40px',
      }}
    />
  );
};
