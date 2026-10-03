import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {ScriptSlide} from '../types';
import {LayoutConfig} from '../styles/theme';
import {TextLine} from './TextLine';
import {SlideDecoration} from './SlideDecoration';
import {SlideEmoji} from './SlideEmoji';
import {BrollBackground} from './BrollBackground';

interface Props {
  slide: ScriptSlide;
  slideIndex: number;
  totalSlides: number;
  durationFrames: number;
  layout: LayoutConfig;
}

export const SlideSequence: React.FC<Props> = ({slide, slideIndex, totalSlides, durationFrames, layout}) => {
  const frame = useCurrentFrame();

  // Fade-in transition (first 6 frames ≈ 0.2s)
  const slideOpacity = interpolate(frame, [0, 6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Find the accent color from emphasis or gradient lines (for decoration tint)
  const accentLine = slide.lines.find((l) => (l.style === 'emphasis' || l.style === 'gradient') && l.color);
  const accentColor = accentLine?.color
    ? `${accentLine.color}22`
    : 'rgba(255,255,255,0.06)';

  return (
    <AbsoluteFill style={{opacity: slideOpacity}}>
      {/* B-roll background (if available) */}
      {slide.brollPath && (
        <BrollBackground
          brollPath={slide.brollPath}
          brollType={slide.brollType || 'video'}
          durationFrames={durationFrames}
        />
      )}

      {/* Decorative elements */}
      <SlideDecoration
        slideIndex={slideIndex}
        totalSlides={totalSlides}
        layout={layout}
        durationFrames={durationFrames}
        accentColor={accentColor}
      />

      {/* Text content */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: `0 ${layout.contentPadding}px`,
          paddingBottom: 60,
        }}
      >
        {slide.lines.map((line, index) => (
          <TextLine
            key={index}
            line={line}
            index={index}
            localFrame={frame}
            durationFrames={durationFrames}
            layout={layout}
          />
        ))}
      </div>

      {/* Floating emoji decoration */}
      {slide.emoji && (
        <SlideEmoji
          emoji={slide.emoji}
          slideIndex={slideIndex}
          layout={layout}
        />
      )}
    </AbsoluteFill>
  );
};
