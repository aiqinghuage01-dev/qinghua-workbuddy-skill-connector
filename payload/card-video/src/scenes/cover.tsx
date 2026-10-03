import React from 'react';
import {useCurrentFrame, interpolate, spring, Img, staticFile} from 'remotion';
import {FONT_FAMILY} from '../styles/theme';
import type {CoverData, SceneComponentProps} from './types';

export const CoverScene: React.FC<SceneComponentProps> = ({data, durationInFrames}) => {
  const frame = useCurrentFrame();
  const d = data as CoverData;

  const subtitleOpacity = interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'});
  const subtitleY = interpolate(frame, [0, 12], [20, 0], {extrapolateRight: 'clamp'});
  const titleScale = spring({frame: Math.max(0, frame - 4), fps: 30, config: {damping: 12, stiffness: 100}});
  const titleOpacity = interpolate(frame, [4, 16], [0, 1], {extrapolateRight: 'clamp'});
  const decoOpacity = interpolate(frame, [14, 26], [0, 1], {extrapolateRight: 'clamp'});
  const decoWidth = interpolate(frame, [14, 30], [0, 100], {extrapolateRight: 'clamp'});
  const avatarOpacity = interpolate(frame, [20, 34], [0, 1], {extrapolateRight: 'clamp'});
  const avatarScale = spring({frame: Math.max(0, frame - 20), fps: 30, config: {damping: 14, stiffness: 100}});

  const hasAvatar = Boolean(d.avatar);
  const avatarSrc = hasAvatar
    ? (d.avatar!.startsWith('http') ? d.avatar! : staticFile(d.avatar!))
    : '';

  // Auto font size: fit title in one line
  const len = d.title.length;
  const titleFontSize = len <= 4 ? 180 : len <= 5 ? 160 : len <= 6 ? 140 : len <= 8 ? 115 : len <= 10 ? 96 : 80;

  const tagline = (d as any).tagline || '';

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: FONT_FAMILY,
      padding: '0 40px', paddingBottom: '16%',
    }}>
      {/* Layer 1: Subtitle - bigger & more prominent */}
      {d.subtitle && (
        <div style={{
          fontSize: 36, color: 'rgba(255,255,255,0.6)',
          marginBottom: 10, opacity: subtitleOpacity,
          letterSpacing: 2, fontWeight: 500,
          transform: `translateY(${subtitleY}px)`,
        }}>
          {d.subtitle}
        </div>
      )}

      {/* Layer 2: Tagline (white bold) */}
      {tagline && (
        <div style={{
          fontSize: 46, fontWeight: 800, color: '#ffffff',
          marginBottom: 10, opacity: subtitleOpacity,
          letterSpacing: 1,
          transform: `translateY(${subtitleY}px)`,
        }}>
          {tagline}
        </div>
      )}

      {/* Layer 3: GIANT main title */}
      <div style={{
        fontSize: titleFontSize, fontWeight: 900,
        textAlign: 'center', lineHeight: 1.15,
        opacity: titleOpacity,
        transform: `scale(${titleScale})`,
        background: 'linear-gradient(170deg, #f5d060 0%, #f5a623 35%, #e8542e 75%, #c0392b 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        width: '100%',
        letterSpacing: -2,
        whiteSpace: 'nowrap',
      }}>
        {d.title}
      </div>

      {/* Layer 4: Thin gold divider */}
      <div style={{
        marginTop: 20, opacity: decoOpacity,
        width: `${decoWidth}%`, maxWidth: 360,
        height: 1.5,
        background: 'linear-gradient(90deg, transparent, rgba(245,166,35,0.5), transparent)',
      }} />

      {/* Layer 5: Large avatar + name */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        marginTop: 28,
        opacity: avatarOpacity,
        transform: `scale(${avatarScale})`,
      }}>
        <div style={{
          width: 180, height: 180, borderRadius: '50%',
          overflow: 'hidden',
          border: '2.5px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          display: hasAvatar ? 'block' : 'none',
        }}>
          <Img
            src={avatarSrc || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'}
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
          />
        </div>
        {d.author && (
          <span style={{
            fontSize: 28, color: 'rgba(255,255,255,0.55)',
            marginTop: 16, letterSpacing: 1,
          }}>
            {d.author}
          </span>
        )}
      </div>
    </div>
  );
};
