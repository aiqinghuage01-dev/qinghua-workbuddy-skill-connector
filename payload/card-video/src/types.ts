export type LineStyle = 'title' | 'emphasis' | 'body' | 'badge' | 'gradient';

export interface ScriptLine {
  text: string;
  style: LineStyle;
  color?: string;
}

export interface ScriptSlide {
  lines: ScriptLine[];
  narration: string;
  duration?: number; // seconds; if omitted, derived from TTS audio length
  emoji?: string;    // decorative emoji shown floating on the slide
  brollPath?: string;    // path to B-roll media relative to public/, e.g. "broll/demo/slide-000.mp4"
  brollType?: 'video' | 'image';  // type of B-roll media
}

export interface VideoScript {
  title: string;
  slides: ScriptSlide[];
  digitalHuman?: string;       // path to digital human video in public/
  digitalHumanCrop?: string;   // CSS objectPosition auto-detected by face detection, e.g. "center 57.9%"
  audioTrack?: string;         // path to single continuous audio in public/
}

export interface CardVideoProps {
  script: VideoScript;
  audioFiles: string[];
  slideDurations: number[];
  layout: 'landscape' | 'portrait';
}
