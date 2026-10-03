import React from 'react';
import {Img, OffthreadVideo, staticFile, useCurrentFrame, interpolate, spring, useVideoConfig} from 'remotion';

interface Props {
  mediaPath: string;
  mediaType?: 'image' | 'video';
  tilt?: number;
  verticalPosition?: 'top' | 'bottom';
}

/**
 * B-roll in rounded card with shadow and tilt.
 * Can be positioned at top or bottom of screen.
 */
export const ProductCard: React.FC<Props> = ({mediaPath, mediaType = 'image', tilt = -2, verticalPosition = 'top'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const scale = spring({frame, fps, from: 0.85, to: 1, durationInFrames: 12, config: {damping: 14}});
  const opacity = interpolate(frame, [0, 5], [0, 1], {extrapolateRight: 'clamp'});

  const mediaStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 16,
  };

  const posStyle: React.CSSProperties = verticalPosition === 'top'
    ? {top: 20, left: 25, right: 25, height: '46%'}
    : {bottom: 30, left: 25, right: 25, height: '42%'};

  return (
    <div
      style={{
        position: 'absolute',
        ...posStyle,
        opacity,
        transform: `scale(${scale}) rotate(${tilt}deg)`,
        transformOrigin: 'center center',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)',
          border: '2px solid rgba(255,255,255,0.08)',
        }}
      >
        {mediaType === 'video' ? (
          <OffthreadVideo src={staticFile(mediaPath)} style={mediaStyle} volume={0} muted />
        ) : (
          <Img src={staticFile(mediaPath)} style={mediaStyle} />
        )}
      </div>
    </div>
  );
};
