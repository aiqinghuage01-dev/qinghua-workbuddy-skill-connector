import React, {useMemo} from 'react';
import {useCurrentFrame, interpolate, spring} from 'remotion';
import {FONT_FAMILY} from '../styles/theme';
import type {WordCloudData, SceneComponentProps} from './types';

const COLORS = ['#f59e0b', '#06b6d4', '#ec4899', '#10b981', '#8b5cf6', '#3b82f6', '#ef4444', '#ffffff'];

function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

export const WordCloudScene: React.FC<SceneComponentProps> = ({data}) => {
  const frame = useCurrentFrame();
  const d = data as WordCloudData;

  const positions = useMemo(() => {
    const rng = seededRandom(123);
    return d.words.map(() => ({
      x: 10 + rng() * 80,  // percentage
      y: 15 + rng() * 70,
      rotation: (rng() - 0.5) * 20,
    }));
  }, [d.words.length]);

  const maxWeight = Math.max(...d.words.map((w) => w.weight || 1));

  return (
    <div style={{
      position: 'absolute', inset: 0,
      fontFamily: FONT_FAMILY,
    }}>
      {d.words.map((word, i) => {
        const delay = i * 4;
        const scale = spring({frame: Math.max(0, frame - delay), fps: 30, config: {damping: 14, stiffness: 120}});
        const opacity = interpolate(frame, [delay, delay + 10], [0, 1], {extrapolateRight: 'clamp'});
        const weight = word.weight || 1;
        const fontSize = 20 + (weight / maxWeight) * 48;
        const color = COLORS[i % COLORS.length];
        const pos = positions[i];

        return (
          <div key={i} style={{
            position: 'absolute',
            left: `${pos.x}%`, top: `${pos.y}%`,
            fontSize, fontWeight: weight > maxWeight * 0.6 ? 700 : 400,
            color, opacity,
            transform: `scale(${scale}) rotate(${pos.rotation}deg)`,
            textShadow: `0 0 ${fontSize * 0.3}px ${color}44`,
            whiteSpace: 'nowrap',
          }}>
            {word.text}
          </div>
        );
      })}
    </div>
  );
};
