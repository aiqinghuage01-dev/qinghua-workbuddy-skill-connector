import React from 'react';
import {OffthreadVideo, staticFile, useCurrentFrame, interpolate} from 'remotion';

interface Props {
  videoSrc: string;
  position?: 'bottom-center' | 'top-center' | 'top-left';
  size?: number;
}

/**
 * Person shown as a large circle.
 */
export const PersonCircle: React.FC<Props> = ({videoSrc, position = 'bottom-center', size = 260}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 6], [0, 1], {extrapolateRight: 'clamp'});
  const scale = interpolate(frame, [0, 6], [0.85, 1], {extrapolateRight: 'clamp'});

  const posMap: Record<string, React.CSSProperties> = {
    'bottom-center': {bottom: 20, left: '50%', marginLeft: -(size / 2)},
    'top-center':    {top: 80, left: '50%', marginLeft: -(size / 2)},
    'top-left':      {top: 40, left: 30},
  };

  return (
    <div
      style={{
        position: 'absolute',
        ...posMap[position],
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        border: '4px solid rgba(255,255,255,0.3)',
        boxShadow: '0 6px 28px rgba(0,0,0,0.7)',
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <OffthreadVideo
        src={staticFile(videoSrc)}
        style={{width: '100%', height: '100%', objectFit: 'cover'}}
        volume={0} muted
      />
    </div>
  );
};
