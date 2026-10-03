export interface OverlaySegment {
  index: number;
  startTime: number;
  endTime: number;
  caption: string;
  narration: string;
  overlay: string | null;   // path relative to public/
  showOverlay: boolean;
  overlayMode?: 'half' | 'full';  // half = lower 48%, full = entire screen
  overlayType?: 'image' | 'video';  // media type
  layoutVariant?: number;  // 0,1,2 = different card layout positions
}

export interface SubtitleEntry {
  startTime: number;
  endTime: number;
  text: string;
}

export interface OverlayScript {
  hookTitle: string;
  hookSubtitle: string;
  baseVideo: string;        // path to oral video in public/
  audioTrack: string;       // path to audio in public/
  totalDuration: number;
  segments: OverlaySegment[];
  subtitles?: SubtitleEntry[];  // real-time subtitles synced to speech
}

export interface OverlayVideoProps {
  script: OverlayScript;
}
