import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {ScriptSlide} from '../types';
import {COLORS, FONT_FAMILY, LayoutConfig} from '../styles/theme';

interface Props {
  slides: ScriptSlide[];
  slideFrameOffsets: number[];
  slideDurations: number[];
  layout: LayoutConfig;
}

export const SubtitleBar: React.FC<Props> = ({
  slides,
  slideFrameOffsets,
  slideDurations,
  layout,
}) => {
  const frame = useCurrentFrame();
  const fps = layout.fps;

  // Find current slide
  let idx = 0;
  for (let i = 0; i < slideFrameOffsets.length; i++) {
    if (frame >= slideFrameOffsets[i]) idx = i;
  }

  const slideStart = slideFrameOffsets[idx];
  const slideDurationFrames = Math.ceil(slideDurations[idx] * fps);
  const localFrame = frame - slideStart;

  const fadeIn = interpolate(localFrame, [0, 12], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });
  const fadeOut = interpolate(
    localFrame,
    [slideDurationFrames - 12, slideDurationFrames],
    [1, 0],
    {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'},
  );
  const opacity = Math.min(fadeIn, fadeOut);

  const narration = slides[idx]?.narration || '';

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: layout.subtitleBarHeight + 30,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: layout.subtitleBarHeight > 80 ? 50 : 36,
        background:
          'linear-gradient(transparent 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.75) 100%)',
        opacity,
      }}
    >
      <div
        style={{
          fontSize: layout.subtitleSize,
          color: COLORS.subtitleColor,
          fontFamily: FONT_FAMILY,
          fontWeight: 500,
          textShadow: '0 2px 10px rgba(0,0,0,0.9)',
          padding: '0 60px',
          textAlign: 'center',
          maxWidth: '85%',
          lineHeight: 1.5,
        }}
      >
        {narration}
      </div>
    </div>
  );
};
