import React from 'react';
import {useCurrentFrame, interpolate, spring, Img, staticFile} from 'remotion';
import {FONT_FAMILY} from '../styles/theme';
import type {ImageData, SceneComponentProps} from './types';

export const ImageScene: React.FC<SceneComponentProps> = ({data, durationInFrames}) => {
  const frame = useCurrentFrame();
  const d = data as ImageData;

  const scale = interpolate(frame, [0, durationInFrames], [1, 1.08], {extrapolateRight: 'clamp'});
  const opacity = interpolate(frame, [0, 15], [0, 1], {extrapolateRight: 'clamp'});
  const captionOpacity = interpolate(frame, [15, 28], [0, 1], {extrapolateRight: 'clamp'});

  const src = d.src.startsWith('http') ? d.src : staticFile(d.src);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: FONT_FAMILY, padding: 60,
    }}>
      <div style={{
        width: '85%', maxHeight: '65%',
        borderRadius: 16, overflow: 'hidden',
        opacity,
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        <Img src={src} style={{
          width: '100%', height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
        }} />
      </div>
      {d.caption && (
        <div style={{
          fontSize: 28, color: 'rgba(255,255,255,0.7)',
          marginTop: 28, textAlign: 'center',
          opacity: captionOpacity,
        }}>
          {d.caption}
        </div>
      )}
    </div>
  );
};
