import React from 'react';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame, staticFile} from 'remotion';
import {CardVideoProps} from '../types';
import {getLayout} from '../styles/theme';
import {DarkBackground} from './DarkBackground';
import {SlideSequence} from './SlideSequence';
import {PageIndicator} from './PageIndicator';
import {DigitalHumanOverlay} from './DigitalHumanOverlay';
import {LocalFont} from './LocalFont';

export const CardVideo: React.FC<CardVideoProps> = ({
  script,
  audioFiles,
  slideDurations,
  layout: layoutName,
}) => {
  const frame = useCurrentFrame();
  const layoutConfig = getLayout(layoutName);
  const fps = layoutConfig.fps;

  // Compute frame offsets for each slide
  const slideFrameOffsets: number[] = [];
  let cumulativeFrames = 0;
  for (const dur of slideDurations) {
    slideFrameOffsets.push(cumulativeFrames);
    cumulativeFrames += Math.ceil(dur * fps);
  }

  // Determine current slide index
  let currentSlideIndex = 0;
  for (let i = 0; i < slideFrameOffsets.length; i++) {
    if (frame >= slideFrameOffsets[i]) currentSlideIndex = i;
  }

  return (
    <AbsoluteFill>
      <LocalFont />
      {/* Persistent background */}
      <DarkBackground />

      {/* Slide sequences */}
      {script.slides.map((slide, i) => {
        const durationFrames = Math.ceil(slideDurations[i] * fps);
        return (
          <Sequence
            key={`slide-${i}`}
            from={slideFrameOffsets[i]}
            durationInFrames={durationFrames}
          >
            <SlideSequence
              slide={slide}
              slideIndex={i}
              totalSlides={script.slides.length}
              durationFrames={durationFrames}
              layout={layoutConfig}
            />
          </Sequence>
        );
      })}

      {/* Audio: single continuous track OR per-slide tracks */}
      {script.audioTrack ? (
        <Audio src={staticFile(script.audioTrack)} />
      ) : (
        audioFiles.map((audioPath, i) =>
          audioPath ? (
            <Sequence key={`audio-${i}`} from={slideFrameOffsets[i]}>
              <Audio src={staticFile(audioPath)} />
            </Sequence>
          ) : null,
        )
      )}

      {/* Digital human overlay (circle in bottom-right) */}
      {script.digitalHuman && (
        <DigitalHumanOverlay
          videoSrc={script.digitalHuman}
          layout={layoutConfig}
          cropPosition={script.digitalHumanCrop}
        />
      )}

      {/* Page indicator */}
      <PageIndicator
        currentIndex={currentSlideIndex}
        totalSlides={script.slides.length}
        layout={layoutConfig}
      />
    </AbsoluteFill>
  );
};
