import React from 'react';
import {useCurrentFrame, interpolate, spring, Img, staticFile} from 'remotion';
import {FONT_FAMILY} from '../styles/theme';
import type {CTAData, SceneComponentProps} from './types';

export const CTAScene: React.FC<SceneComponentProps> = ({data}) => {
  const frame = useCurrentFrame();
  const d = data as CTAData;

  const titleScale = spring({frame, fps: 30, config: {damping: 10, stiffness: 80}});
  const subtitleOpacity = interpolate(frame, [15, 28], [0, 1], {extrapolateRight: 'clamp'});
  const avatarOpacity = interpolate(frame, [30, 44], [0, 1], {extrapolateRight: 'clamp'});

  // Concentric ring animation
  const rings = [0, 1, 2].map((i) => {
    const delay = i * 8;
    const ringScale = interpolate((frame + delay) % 90, [0, 90], [0.5, 1.5], {extrapolateRight: 'clamp'});
    const ringOpacity = interpolate((frame + delay) % 90, [0, 60, 90], [0.4, 0.15, 0], {extrapolateRight: 'clamp'});
    return {scale: ringScale, opacity: ringOpacity};
  });

  const hasAvatar = Boolean((d as any).avatar);
  const avatarSrc = hasAvatar ? staticFile((d as any).avatar) : '';
  const authorName = (d as any).author || '';

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', paddingBottom: '18%',
      fontFamily: FONT_FAMILY,
    }}>
      {/* Concentric rings */}
      {rings.map((ring, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: 300, height: 300,
          borderRadius: '50%',
          border: '2px solid #e8542e',
          opacity: ring.opacity,
          transform: `scale(${ring.scale})`,
        }} />
      ))}

      {/* Title */}
      <div style={{
        fontSize: 56, fontWeight: 900, color: '#ffffff',
        textAlign: 'center', lineHeight: 1.4,
        transform: `scale(${titleScale})`,
        zIndex: 1,
      }}>
        {d.title}
      </div>

      {/* Subtitle */}
      {d.subtitle && (
        <div style={{
          fontSize: 28, color: 'rgba(255,255,255,0.5)',
          marginTop: 20, opacity: subtitleOpacity,
          zIndex: 1,
        }}>
          {d.subtitle}
        </div>
      )}

      {/* Avatar + author (same style as cover) */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        marginTop: 32, opacity: avatarOpacity,
        transform: `translateY(${interpolate(frame, [30, 44], [16, 0], {extrapolateRight: 'clamp'})}px)`,
        zIndex: 1,
      }}>
        <div style={{
          width: 68, height: 68, borderRadius: '50%',
          overflow: 'hidden',
          border: '2.5px solid rgba(255,255,255,0.2)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          display: hasAvatar ? 'block' : 'none',
        }}>
          <Img src={avatarSrc || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </div>
        {authorName && (
          <span style={{
            fontSize: 20, color: 'rgba(255,255,255,0.5)',
            marginTop: 10, letterSpacing: 1,
          }}>
            {authorName}
          </span>
        )}
      </div>

      {/* Action button */}
      {d.action && (
        <div style={{
          marginTop: 28,
          padding: '16px 48px',
          borderRadius: 50,
          background: 'linear-gradient(135deg, #f59e0b, #e8542e)',
          fontSize: 28, fontWeight: 700, color: '#ffffff',
          opacity: interpolate(frame, [35, 48], [0, 1], {extrapolateRight: 'clamp'}),
          transform: `translateY(${interpolate(frame, [35, 48], [20, 0], {extrapolateRight: 'clamp'})}px)`,
          boxShadow: '0 8px 30px rgba(232,84,46,0.4)',
          zIndex: 1,
        }}>
          {d.action}
        </div>
      )}
    </div>
  );
};
