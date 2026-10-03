import React from 'react';
import {AbsoluteFill, Img, Video, staticFile, useCurrentFrame, interpolate} from 'remotion';

interface Props {
  brollPath: string;
  brollType: 'video' | 'image';
  durationFrames: number;
}

/**
 * Full-screen B-roll background with dark overlay for text readability.
 * Supports both video and image (with Ken Burns zoom effect).
 */
export const BrollBackground: React.FC<Props> = ({brollPath, brollType, durationFrames}) => {
  const frame = useCurrentFrame();

  // Fade-in over 10 frames
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Ken Burns effect for images: slow zoom from 1.0 to 1.15
  const scale = brollType === 'image'
    ? interpolate(frame, [0, durationFrames], [1.0, 1.15], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  const mediaStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: `scale(${scale})`,
  };

  return (
    <AbsoluteFill style={{opacity}}>
      {/* B-roll media */}
      <AbsoluteFill>
        {brollType === 'video' ? (
          <Video
            src={staticFile(brollPath)}
            style={mediaStyle}
            volume={0}
            muted
          />
        ) : (
          <Img
            src={staticFile(brollPath)}
            style={mediaStyle}
          />
        )}
      </AbsoluteFill>

      {/* Dark overlay for text readability */}
      <AbsoluteFill
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
        }}
      />
    </AbsoluteFill>
  );
};
