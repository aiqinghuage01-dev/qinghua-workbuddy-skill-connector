import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';

interface Props {
  text: string;
}

/**
 * Large dynamic caption — pixel-matched to reference:
 * - HUGE white text (66px) with VERY heavy black outline
 * - Centered horizontally, positioned at ~55% from top
 * - Multi-layer stroke: CSS paint-order trick + heavy textShadow
 * - Nearly instant appear (2-frame fade = hard cut feel)
 */
export const CaptionBar: React.FC<Props> = ({text}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 2], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: '54%',
        left: 24,
        right: 24,
        display: 'flex',
        justifyContent: 'center',
        opacity,
      }}
    >
      <div
        style={{
          fontSize: 44,
          fontWeight: 900,
          color: '#FFFFFF',
          fontFamily: "'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif",
          textAlign: 'center',
          lineHeight: 1.35,
          letterSpacing: 4,
          // Heavy multi-layer black outline — matches reference's "carved" look
          paintOrder: 'stroke fill',
          WebkitTextStroke: '3px #000000',
          textShadow: [
            '3px 3px 0 #000',
            '-3px -3px 0 #000',
            '3px -3px 0 #000',
            '-3px 3px 0 #000',
            '0 3px 0 #000',
            '0 -3px 0 #000',
            '3px 0 0 #000',
            '-3px 0 0 #000',
            '0 0 12px rgba(0,0,0,0.8)',
          ].join(', '),
        }}
      >
        {text}
      </div>
    </div>
  );
};
