export const COLORS = {
  bgBase: '#0a0a1a',
  titleColor: '#ffffff',
  bodyColor: '#c8d0dc',
  subtitleColor: '#ffffff',
  emphasis: {
    orange: '#f59e0b',
    yellow: '#eab308',
    cyan: '#06b6d4',
    pink: '#ec4899',
    red: '#ef4444',
    purple: '#8b5cf6',
    blue: '#3b82f6',
    green: '#10b981',
  },
} as const;

export const FONT_FAMILY = "'Card Noto SC', 'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif";

export const ANIMATION = {
  lineStaggerFrames: 8,
  lineFadeInFrames: 14,
  lineSlideUpPx: 24,
  slideTransitionFrames: 8,
} as const;

// Landscape: 1280x720 — dramatic size contrast
export const LANDSCAPE = {
  width: 1280,
  height: 720,
  fps: 30,
  gradientSize: 96,
  titleSize: 60,
  emphasisSize: 50,
  bodySize: 26,
  badgeSize: 28,
  subtitleSize: 28,
  pageIndicatorSize: 16,
  contentPadding: 80,
  subtitleBarHeight: 0,
  pageIndicatorBottom: 14,
  lineGap: 14,
} as const;

// Portrait: 1080x1920 — dramatic size contrast
export const PORTRAIT = {
  width: 1080,
  height: 1920,
  fps: 30,
  gradientSize: 128,
  titleSize: 80,
  emphasisSize: 66,
  bodySize: 34,
  badgeSize: 36,
  subtitleSize: 36,
  pageIndicatorSize: 20,
  contentPadding: 60,
  subtitleBarHeight: 0,
  pageIndicatorBottom: 24,
  lineGap: 18,
} as const;

export type LayoutConfig = typeof LANDSCAPE | typeof PORTRAIT;

export function getLayout(layout: 'landscape' | 'portrait'): LayoutConfig {
  return layout === 'portrait' ? PORTRAIT : LANDSCAPE;
}
