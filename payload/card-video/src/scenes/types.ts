export const SCENE_TYPES = [
  'cover', 'text', 'data', 'comparison', 'list',
  'timeline', 'code', 'quote', 'flow', 'split',
  'bar-chart', 'terminal', 'pie-chart', 'line-chart', 'word-cloud',
  'countdown', 'progress', 'dialogue', 'matrix', 'steps',
  'image', 'notification', 'cta',
] as const;

export type SceneType = typeof SCENE_TYPES[number];

// --- Per-scene data shapes ---

export interface CoverData {
  title: string;
  subtitle?: string;
  author?: string;
  avatar?: string; // URL or public/ path
}

export interface TextData {
  heading?: string;
  body: string; // supports \n for line breaks
}

export interface DataData {
  items: { label: string; value: number; unit?: string; prefix?: string }[];
}

export interface ComparisonData {
  left: { label: string; items: string[] };
  right: { label: string; items: string[] };
}

export interface ListData {
  title?: string;
  items: string[];
  ordered?: boolean;
}

export interface TimelineData {
  events: { year: string; text: string }[];
}

export interface CodeData {
  language?: string;
  code: string;
  filename?: string;
}

export interface QuoteData {
  quote: string;
  author?: string;
  source?: string;
}

export interface FlowData {
  nodes: { label: string; icon?: string }[];
}

export interface SplitData {
  left: { heading: string; body: string };
  right: { heading: string; body: string };
}

export interface BarChartData {
  title?: string;
  bars: { label: string; value: number; color?: string }[];
}

export interface TerminalData {
  title?: string;
  lines: { type: 'command' | 'output'; text: string }[];
}

export interface PieChartData {
  title?: string;
  slices: { label: string; value: number; color?: string }[];
}

export interface LineChartData {
  title?: string;
  labels: string[];
  datasets: { name: string; values: number[]; color?: string }[];
}

export interface WordCloudData {
  words: { text: string; weight?: number }[];
}

export interface CountdownData {
  from: number;
  label?: string;
}

export interface ProgressData {
  items: { label: string; value: number; max?: number; color?: string }[];
}

export interface DialogueData {
  messages: { role: 'left' | 'right'; text: string; name?: string }[];
}

export interface MatrixData {
  title?: string;
  headers: string[];
  rows: string[][];
}

export interface StepsData {
  title?: string;
  steps: { label: string; description?: string }[];
}

export interface ImageData {
  src: string; // URL or public/ path
  caption?: string;
}

export interface NotificationData {
  icon?: string;
  title: string;
  body: string;
  app?: string;
}

export interface CTAData {
  title: string;
  subtitle?: string;
  action?: string;
}

// --- Union type for scene data ---
export type SceneDataMap = {
  cover: CoverData;
  text: TextData;
  data: DataData;
  comparison: ComparisonData;
  list: ListData;
  timeline: TimelineData;
  code: CodeData;
  quote: QuoteData;
  flow: FlowData;
  split: SplitData;
  'bar-chart': BarChartData;
  terminal: TerminalData;
  'pie-chart': PieChartData;
  'line-chart': LineChartData;
  'word-cloud': WordCloudData;
  countdown: CountdownData;
  progress: ProgressData;
  dialogue: DialogueData;
  matrix: MatrixData;
  steps: StepsData;
  image: ImageData;
  notification: NotificationData;
  cta: CTAData;
};

// --- Scene item ---
export interface SceneItem<T extends SceneType = SceneType> {
  type: T;
  duration?: number;
  narration: string;
  data: SceneDataMap[T];
}

// --- Full script ---
export interface SceneScript {
  title: string;
  author?: { name: string; avatar?: string };
  scenes: SceneItem[];
}

// --- Props for the composition ---
export interface SceneVideoProps {
  script: SceneScript;
  audioFiles: string[];
  sceneDurations: number[];
}

// Scene component shared props
export interface SceneComponentProps {
  data: any;
  durationInFrames: number;
}
