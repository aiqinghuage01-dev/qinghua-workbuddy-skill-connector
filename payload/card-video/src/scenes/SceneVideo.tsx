import React from 'react';
import {AbsoluteFill, Sequence, Audio, staticFile, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {SceneBackground} from './SceneBackground';
import {SceneSubtitle} from './SceneSubtitle';
import type {SceneVideoProps, SceneType, SceneComponentProps} from './types';

import {CoverScene} from './cover';
import {TextScene} from './text';
import {DataScene} from './data';
import {ComparisonScene} from './comparison';
import {ListScene} from './list';
import {TimelineScene} from './timeline';
import {CodeScene} from './code';
import {QuoteScene} from './quote';
import {FlowScene} from './flow';
import {SplitScene} from './split';
import {BarChartScene} from './bar-chart';
import {TerminalScene} from './terminal';
import {PieChartScene} from './pie-chart';
import {LineChartScene} from './line-chart';
import {WordCloudScene} from './word-cloud';
import {CountdownScene} from './countdown';
import {ProgressScene} from './progress';
import {DialogueScene} from './dialogue';
import {MatrixScene} from './matrix';
import {StepsScene} from './steps';
import {ImageScene} from './image';
import {NotificationScene} from './notification';
import {CTAScene} from './cta';

const SCENE_REGISTRY: Record<SceneType, React.FC<SceneComponentProps>> = {
  'cover': CoverScene, 'text': TextScene, 'data': DataScene,
  'comparison': ComparisonScene, 'list': ListScene, 'timeline': TimelineScene,
  'code': CodeScene, 'quote': QuoteScene, 'flow': FlowScene,
  'split': SplitScene, 'bar-chart': BarChartScene, 'terminal': TerminalScene,
  'pie-chart': PieChartScene, 'line-chart': LineChartScene, 'word-cloud': WordCloudScene,
  'countdown': CountdownScene, 'progress': ProgressScene, 'dialogue': DialogueScene,
  'matrix': MatrixScene, 'steps': StepsScene, 'image': ImageScene,
  'notification': NotificationScene, 'cta': CTAScene,
};

// Scene color moods for background tinting
const SCENE_MOOD: Partial<Record<SceneType, string>> = {
  'cover': 'warm',
  'data': 'blue',
  'text': 'neutral',
  'comparison': 'red',
  'notification': 'cyan',
  'steps': 'green',
  'cta': 'gold',
  'terminal': 'green',
  'code': 'purple',
  'bar-chart': 'blue',
  'quote': 'warm',
};

const TRANSITION_IN = 6;
const TRANSITION_OUT = 6;
const BREATH_BUFFER = 0; // no gap between scenes

// Transition wrapper with blur effect
const SceneTransitionWrapper: React.FC<{
  children: React.ReactNode;
  durationInFrames: number;
}> = ({children, durationInFrames}) => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, TRANSITION_IN], [0, 1], {extrapolateRight: 'clamp'});
  const scaleIn = interpolate(frame, [0, TRANSITION_IN], [0.88, 1], {extrapolateRight: 'clamp'});
  const blurIn = interpolate(frame, [0, TRANSITION_IN], [8, 0], {extrapolateRight: 'clamp'});

  const fadeOut = interpolate(frame, [durationInFrames - TRANSITION_OUT, durationInFrames], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const scaleOut = interpolate(frame, [durationInFrames - TRANSITION_OUT, durationInFrames], [1, 0.92], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const blurOut = interpolate(frame, [durationInFrames - TRANSITION_OUT, durationInFrames], [0, 6], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const opacity = fadeIn * fadeOut;
  const scale = scaleIn * scaleOut;
  const blur = blurIn + blurOut;

  return (
    <AbsoluteFill style={{
      opacity,
      transform: `scale(${scale})`,
      filter: blur > 0.5 ? `blur(${blur}px)` : 'none',
      willChange: 'transform, opacity, filter',
    }}>
      {children}
    </AbsoluteFill>
  );
};

// Progress bar at bottom
const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const progress = (frame / durationInFrames) * 100;

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: 3, background: 'rgba(255,255,255,0.06)', zIndex: 200,
    }}>
      <div style={{
        height: '100%', width: `${progress}%`,
        background: 'linear-gradient(90deg, #f59e0b, #e8542e)',
        boxShadow: '0 0 8px rgba(245,158,11,0.5)',
      }} />
    </div>
  );
};

export const SceneVideo: React.FC<SceneVideoProps> = ({script, audioFiles, sceneDurations}) => {
  const fps = 30;
  let frameOffset = 0;

  // Precompute scene frame ranges for background mood
  const sceneRanges: {from: number; to: number; mood: string}[] = [];

  const sequences = script.scenes.map((scene, i) => {
    const duration = sceneDurations[i] || scene.duration || 5;
    const durationInFrames = Math.ceil(duration * fps) + BREATH_BUFFER;
    const from = frameOffset;
    frameOffset += durationInFrames;

    sceneRanges.push({
      from,
      to: from + durationInFrames,
      mood: SCENE_MOOD[scene.type] || 'neutral',
    });

    const SceneComponent = SCENE_REGISTRY[scene.type];
    if (!SceneComponent) return null;

    const audioFile = audioFiles[i];
    const audioSrc = audioFile
      ? (audioFile.startsWith('http') ? audioFile : staticFile(audioFile))
      : null;

    return (
      <Sequence key={i} from={from} durationInFrames={durationInFrames}>
        <SceneTransitionWrapper durationInFrames={durationInFrames}>
          <SceneComponent data={scene.data} durationInFrames={durationInFrames} />
        </SceneTransitionWrapper>

        {audioSrc && <Audio src={audioSrc} />}

        <SceneSubtitle
          text={scene.narration}
          startFrame={0}
          durationInFrames={durationInFrames - BREATH_BUFFER}
          keywords={['清华', '9块9', '四十分钟', '三个故事', '十五年', '有病', '第一名', '几千万']}
        />
      </Sequence>
    );
  });

  return (
    <AbsoluteFill>
      {/* Global background with mood shifting */}
      <SceneBackground sceneRanges={sceneRanges} />

      {/* Background music - low volume ambient */}
      <Audio src={staticFile('audio/bgm-ambient.wav')} volume={0.12} loop />

      {/* Scene sequences */}
      {sequences}

      {/* Progress bar */}
      <ProgressBar />

      {/* Watermark */}
      <div style={{
        position: 'absolute', top: 20, right: 24,
        fontSize: 18, color: 'rgba(255,255,255,0.25)',
        fontFamily: "'PingFang SC', sans-serif",
        letterSpacing: 1, zIndex: 150,
      }}>
        {script.author?.name || ''}
      </div>
    </AbsoluteFill>
  );
};
