import React from 'react';
import {OffthreadVideo, staticFile, useCurrentFrame, interpolate} from 'remotion';
import {LayoutConfig} from '../styles/theme';

interface Props {
  videoSrc: string;
  layout: LayoutConfig;
  cropPosition?: string; // CSS objectPosition, default 'center 30%'
}

export const DigitalHumanOverlay: React.FC<Props> = ({videoSrc, layout, cropPosition = 'center 15%'}) => {
  const frame = useCurrentFrame();
  const fps = layout.fps;

  // Fade in during first 0.5 second, then stay at exactly 1
  const fadeInFrames = Math.round(fps * 0.5);
  const opacity = frame >= fadeInFrames
    ? 1
    : interpolate(frame, [0, fadeInFrames], [0, 1], {
        extrapolateRight: 'clamp',
        extrapolateLeft: 'clamp',
      });

  // Integer sizes to avoid sub-pixel jitter
  const size = layout.width >= 1280 ? 260 : 310;
  const margin = layout.width >= 1280 ? 24 : 28;
  // Position above page indicator
  const bottom = Math.round(margin + 40);

  return (
    <div
      style={{
        position: 'absolute',
        right: margin,
        bottom,
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        border: '3px solid rgba(255,255,255,0.3)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        opacity,
        // Force GPU compositing to prevent jitter
        transform: 'translateZ(0)',
        willChange: 'opacity',
      }}
    >
      <OffthreadVideo
        src={staticFile(videoSrc)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: cropPosition,
        }}
        volume={0}
      />
    </div>
  );
};
