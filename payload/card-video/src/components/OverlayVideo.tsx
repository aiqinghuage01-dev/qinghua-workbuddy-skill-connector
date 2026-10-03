import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {OverlayVideoProps} from '../types-overlay';
import {GridBackground} from './GridBackground';
import {ProductCard} from './ProductCard';
import {PersonCircle} from './PersonCircle';
import {RealtimeSubtitle} from './RealtimeSubtitle';
import {HookTitle} from './HookTitle';

const FPS = 30;
const TILTS = [-2, 1.5, -1, 2, -1.5, 1, -2.5, 1.5];

export const OverlayVideo: React.FC<OverlayVideoProps> = ({script}) => {
  const frame = useCurrentFrame();
  const currentTime = frame / FPS;

  let isCardMode = false;
  for (const seg of script.segments) {
    if (currentTime >= seg.startTime && currentTime < seg.endTime) {
      isCardMode = seg.showOverlay && !!seg.overlay;
      break;
    }
  }

  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      {/*
        BASE VIDEO — ALWAYS present, provides both video AND audio.
        In person mode: visible full screen.
        In card mode: hidden (1px) but still plays audio for lip sync.
        NEVER use a separate <Audio> component — that causes sync drift.
      */}
      <OffthreadVideo
        src={staticFile(script.baseVideo)}
        style={isCardMode
          ? {position: 'absolute', width: 1, height: 1, opacity: 0}
          : {width: '100%', height: '100%', objectFit: 'cover'}
        }
        volume={1}
      />

      {/* Grid background for card mode */}
      {isCardMode && <GridBackground />}

      {/* Product cards + person circles */}
      {script.segments.map((seg, i) => {
        if (!seg.showOverlay || !seg.overlay) return null;
        const fromFrame = Math.round(seg.startTime * FPS);
        const dur = Math.round((seg.endTime - seg.startTime) * FPS);
        const layout = seg.layoutVariant ?? 0;

        return (
          <Sequence key={`card-${seg.index}`} from={fromFrame} durationInFrames={dur}>
            {layout === 1 ? (
              <>
                <PersonCircle videoSrc={script.baseVideo} position="top-center" size={480} />
                <ProductCard
                  mediaPath={seg.overlay}
                  mediaType={seg.overlayType || 'image'}
                  tilt={TILTS[i % TILTS.length]}
                  verticalPosition="bottom"
                />
              </>
            ) : (
              <>
                <ProductCard
                  mediaPath={seg.overlay}
                  mediaType={seg.overlayType || 'image'}
                  tilt={TILTS[i % TILTS.length]}
                  verticalPosition="top"
                />
                <PersonCircle videoSrc={script.baseVideo} position="bottom-center" size={480} />
              </>
            )}
          </Sequence>
        );
      })}

      {/* Hook title — only on person mode */}
      {script.hookTitle && !isCardMode && (
        <HookTitle title={script.hookTitle} subtitle={script.hookSubtitle} />
      )}

      {/* Real-time subtitles */}
      {(script.subtitles || []).map((sub, i) => {
        const fromFrame = Math.round(sub.startTime * FPS);
        const dur = Math.max(1, Math.round((sub.endTime - sub.startTime) * FPS));

        let subIsCard = false;
        for (const seg of script.segments) {
          if (sub.startTime >= seg.startTime && sub.startTime < seg.endTime) {
            subIsCard = seg.showOverlay && !!seg.overlay;
            break;
          }
        }

        return (
          <Sequence key={`sub-${i}`} from={fromFrame} durationInFrames={dur}>
            <RealtimeSubtitle text={sub.text} isCardMode={subIsCard} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
