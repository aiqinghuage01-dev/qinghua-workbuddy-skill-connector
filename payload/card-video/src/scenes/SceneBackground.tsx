import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';

const PARTICLE_COUNT = 65;
const WIDTH = 1080;
const HEIGHT = 1920;

interface Particle {
  x: number; y: number; size: number; speed: number;
  delay: number; opacity: number; flickerSpeed: number;
}

function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

// Mood color palettes
const MOOD_COLORS: Record<string, {aurora1: string; aurora2: string; teal: string}> = {
  neutral: {aurora1: 'rgba(139,26,74,0.4)', aurora2: 'rgba(90,30,120,0.2)', teal: 'rgba(8,80,80,0.5)'},
  warm:    {aurora1: 'rgba(180,60,30,0.35)', aurora2: 'rgba(140,50,20,0.2)', teal: 'rgba(80,50,8,0.4)'},
  blue:    {aurora1: 'rgba(30,60,160,0.35)', aurora2: 'rgba(40,30,140,0.2)', teal: 'rgba(8,60,100,0.5)'},
  red:     {aurora1: 'rgba(160,30,40,0.35)', aurora2: 'rgba(120,20,60,0.2)', teal: 'rgba(80,20,30,0.3)'},
  cyan:    {aurora1: 'rgba(20,100,120,0.35)', aurora2: 'rgba(30,80,100,0.2)', teal: 'rgba(8,100,100,0.5)'},
  green:   {aurora1: 'rgba(20,120,60,0.3)', aurora2: 'rgba(30,100,50,0.2)', teal: 'rgba(8,100,60,0.5)'},
  gold:    {aurora1: 'rgba(180,120,20,0.35)', aurora2: 'rgba(160,80,10,0.2)', teal: 'rgba(80,60,8,0.4)'},
  purple:  {aurora1: 'rgba(100,30,160,0.4)', aurora2: 'rgba(80,20,140,0.25)', teal: 'rgba(40,20,80,0.4)'},
};

interface SceneRange {
  from: number; to: number; mood: string;
}

export const SceneBackground: React.FC<{sceneRanges?: SceneRange[]}> = ({sceneRanges}) => {
  const frame = useCurrentFrame();

  // Determine current mood with smooth blending
  let currentMood = 'neutral';
  if (sceneRanges) {
    for (const range of sceneRanges) {
      if (frame >= range.from && frame < range.to) {
        currentMood = range.mood;
        break;
      }
    }
  }
  const colors = MOOD_COLORS[currentMood] || MOOD_COLORS.neutral;

  const particles = useMemo<Particle[]>(() => {
    const rng = seededRandom(42);
    return Array.from({length: PARTICLE_COUNT}, () => ({
      x: rng() * WIDTH, y: rng() * HEIGHT,
      size: 2 + rng() * 5, speed: 0.2 + rng() * 0.8,
      delay: rng() * 400, opacity: 0.25 + rng() * 0.55,
      flickerSpeed: 0.06 + rng() * 0.15,
    }));
  }, []);

  return (
    <AbsoluteFill>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, #08080f 0%, #0d1117 40%, #091a24 100%)',
        transition: 'background 0.5s',
      }} />

      {/* Aurora 1 - main glow */}
      <div style={{
        position: 'absolute', top: '12%', left: '5%',
        width: 700, height: 700, borderRadius: '50%',
        background: `radial-gradient(circle, ${colors.aurora1} 0%, transparent 70%)`,
        filter: 'blur(90px)',
        transform: `scale(${1 + Math.sin(frame * 0.007) * 0.12})`,
        transition: 'background 1s',
      }} />

      {/* Aurora 2 - secondary glow */}
      <div style={{
        position: 'absolute', top: '20%', right: '5%',
        width: 500, height: 500, borderRadius: '50%',
        background: `radial-gradient(circle, ${colors.aurora2} 0%, transparent 70%)`,
        filter: 'blur(70px)',
        transform: `translateY(${Math.sin(frame * 0.009) * 25}px)`,
        transition: 'background 1s',
      }} />

      {/* Teal/bottom glow */}
      <div style={{
        position: 'absolute', bottom: '-8%', left: '15%',
        width: 900, height: 500, borderRadius: '50%',
        background: `radial-gradient(circle, ${colors.teal} 0%, transparent 70%)`,
        filter: 'blur(70px)',
        transform: `scale(${1 + Math.sin(frame * 0.005 + 1) * 0.1})`,
        transition: 'background 1s',
      }} />

      {/* Particles */}
      {particles.map((p, i) => {
        const t = (frame + p.delay) * p.speed * 0.3;
        const px = p.x + Math.sin(t * 0.018 + i * 0.5) * 40;
        const py = ((p.y - t * 0.4) % (HEIGHT + 60)) + 30;
        const finalY = py < 0 ? py + HEIGHT + 60 : py;
        const flicker = 0.5 + Math.sin(t * p.flickerSpeed + i * 2.3) * 0.5;
        return (
          <div key={i} style={{
            position: 'absolute', left: px, top: finalY,
            width: p.size, height: p.size, borderRadius: '50%',
            backgroundColor: '#ff6b35',
            opacity: p.opacity * flicker,
            boxShadow: `0 0 ${p.size * 3}px rgba(255,107,53,${0.3 * flicker})`,
          }} />
        );
      })}
    </AbsoluteFill>
  );
};
