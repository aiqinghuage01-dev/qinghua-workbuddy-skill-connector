import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';

interface Props {
  title: string;
  subtitle: string;
}

/**
 * Fixed hook title at top-right — pixel-matched to reference:
 * - Deep maroon/chestnut color (#4A0E0E)
 * - Title: ~44px, subtitle: ~56px
 * - Very bold, tight line spacing
 * - Light shadow for readability on any background
 */
export const HookTitle: React.FC<Props> = ({title, subtitle}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const textBase: React.CSSProperties = {
    fontFamily: "'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif",
    color: '#4A0E0E',
    fontWeight: 900,
    textShadow: '1px 1px 2px rgba(255,255,255,0.5), -1px -1px 2px rgba(255,255,255,0.3)',
    letterSpacing: 3,
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 45,
        right: 20,
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 2,
      }}
    >
      {title && (
        <div style={{...textBase, fontSize: 30}}>
          {title}
        </div>
      )}
      {subtitle && (
        <div style={{
          ...textBase,
          fontSize: 38,
          maxWidth: 400,
          textAlign: 'right',
          lineHeight: 1.2,
        }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};
