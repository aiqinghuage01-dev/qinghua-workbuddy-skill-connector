import React from 'react';
import {Img, OffthreadVideo, staticFile, useCurrentFrame, interpolate} from 'remotion';

interface Props {
  imagePath: string;
  mediaType?: 'image' | 'video';
  mode?: 'half' | 'full';
}

/**
 * Product overlay — pixel-matched to reference:
 *
 * "half" mode: product fills lower ~50% of screen.
 *   Top edge uses a wide gradient mask (25% of the overlay height)
 *   so the product "melts" into the person naturally —
 *   like the product is on a table in front of them.
 *
 * "full" mode: product fills entire screen, person hidden.
 */
export const ProductOverlay: React.FC<Props> = ({imagePath, mediaType = 'image', mode = 'half'}) => {
  const frame = useCurrentFrame();

  // Near-instant appear (3 frames ≈ 0.1s)
  const opacity = interpolate(frame, [0, 3], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const mediaStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  const renderMedia = () =>
    mediaType === 'video' ? (
      <OffthreadVideo src={staticFile(imagePath)} style={mediaStyle} volume={0} muted />
    ) : (
      <Img src={staticFile(imagePath)} style={mediaStyle} />
    );

  if (mode === 'full') {
    return (
      <div style={{position: 'absolute', inset: 0, opacity}}>
        {renderMedia()}
      </div>
    );
  }

  // Half mode: lower 50%, wide gradient mask at top
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
        opacity,
      }}
    >
      <div style={{
        width: '100%',
        height: '100%',
        // Wide gradient: top 25% fades from transparent → opaque
        maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 10%, rgba(0,0,0,0.7) 18%, black 25%, black 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 10%, rgba(0,0,0,0.7) 18%, black 25%, black 100%)',
      }}>
        {renderMedia()}
      </div>
    </div>
  );
};
