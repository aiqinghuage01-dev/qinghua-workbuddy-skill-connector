import React from 'react';
import {Composition} from 'remotion';
import {CardVideo} from './components/CardVideo';
import {CardVideoProps} from './types';
import {OverlayVideo} from './components/OverlayVideo';
import {OverlayVideoProps} from './types-overlay';
import {SceneVideo} from './scenes/SceneVideo';
import {SceneVideoProps} from './scenes/types';
import {LANDSCAPE, PORTRAIT} from './styles/theme';
// Default props — actual data comes from JSON at render time
const defaultScript = {slides: [{lines: [], narration: '', duration: 5}]};
const defaultSlideDurations = [5];
const defaultProps: CardVideoProps = {
  script: defaultScript as any,
  audioFiles: [],
  slideDurations: defaultSlideDurations,
  layout: 'landscape',
};

const defaultPropsVertical: CardVideoProps = {
  ...defaultProps,
  layout: 'portrait',
};

function calcDuration(props: CardVideoProps, fps: number) {
  return props.slideDurations.reduce((frames, seconds) => frames + Math.ceil(seconds * fps), 0);
}

const defaultOverlayProps: OverlayVideoProps = {
  script: {
    hookTitle: 'Title',
    hookSubtitle: 'Subtitle',
    baseVideo: 'sample.mp4',
    audioTrack: '',
    totalDuration: 10,
    segments: [
      {index: 0, startTime: 0, endTime: 5, caption: 'Caption 1', narration: '', overlay: null, showOverlay: false},
      {index: 1, startTime: 5, endTime: 10, caption: 'Caption 2', narration: '', overlay: null, showOverlay: false},
    ],
  },
};

// SceneVideo defaults
const defaultSceneScript = {scenes: [{type: 'text', duration: 5, lines: []}]};
const defaultSceneDurations = [5];
const defaultSceneProps: SceneVideoProps = {
  script: defaultSceneScript as any,
  audioFiles: [],
  sceneDurations: defaultSceneDurations,
};

function calcSceneDuration(props: SceneVideoProps, fps: number) {
  return props.sceneDurations.reduce((frames: number, seconds: number) => frames + Math.ceil(seconds * fps), 0);
}

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SceneVideo"
        component={SceneVideo}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={calcSceneDuration(defaultSceneProps, 30)}
        defaultProps={defaultSceneProps}
        calculateMetadata={({props}) => ({
          durationInFrames: calcSceneDuration(props, 30),
        })}
      />
      <Composition
        id="OverlayVideo"
        component={OverlayVideo}
        width={720}
        height={1280}
        fps={30}
        durationInFrames={Math.ceil(defaultOverlayProps.script.totalDuration * 30)}
        defaultProps={defaultOverlayProps}
        calculateMetadata={({props}) => ({
          durationInFrames: Math.ceil(props.script.totalDuration * 30),
        })}
      />
      <Composition
        id="CardVideo"
        component={CardVideo}
        width={LANDSCAPE.width}
        height={LANDSCAPE.height}
        fps={LANDSCAPE.fps}
        durationInFrames={calcDuration(defaultProps, LANDSCAPE.fps)}
        defaultProps={defaultProps}
        calculateMetadata={({props}) => ({
          durationInFrames: calcDuration(props, LANDSCAPE.fps),
        })}
      />
      <Composition
        id="CardVideoVertical"
        component={CardVideo}
        width={PORTRAIT.width}
        height={PORTRAIT.height}
        fps={PORTRAIT.fps}
        durationInFrames={calcDuration(defaultPropsVertical, PORTRAIT.fps)}
        defaultProps={defaultPropsVertical}
        calculateMetadata={({props}) => ({
          durationInFrames: calcDuration(props, PORTRAIT.fps),
        })}
      />
    </>
  );
};
