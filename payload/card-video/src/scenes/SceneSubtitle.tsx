import React, {useMemo} from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {FONT_FAMILY} from '../styles/theme';

interface SceneSubtitleProps {
  text: string;
  startFrame: number;
  durationInFrames: number;
  keywords?: string[];
}

interface CharInfo {
  char: string;
  isKeyword: boolean;
}

function splitSentences(text: string): string[] {
  const raw = text.split(/(?<=[。，！？；、])/);
  const result: string[] = [];
  let buf = '';
  for (const seg of raw) {
    buf += seg;
    if (buf.length >= 8 || /[。！？]$/.test(buf.trim())) {
      result.push(buf.trim());
      buf = '';
    }
  }
  if (buf.trim()) result.push(buf.trim());
  return result.filter(Boolean);
}

function markKeywords(sentence: string, keywords: string[]): CharInfo[] {
  const result: CharInfo[] = sentence.split('').map((c) => ({char: c, isKeyword: false}));
  for (const kw of keywords) {
    let idx = 0;
    while ((idx = sentence.indexOf(kw, idx)) !== -1) {
      for (let j = idx; j < idx + kw.length; j++) {
        result[j].isKeyword = true;
      }
      idx += kw.length;
    }
  }
  return result;
}

export const SceneSubtitle: React.FC<SceneSubtitleProps> = ({
  text,
  startFrame,
  durationInFrames,
  keywords = [],
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  // ALL hooks must be called unconditionally (React rules of hooks)
  const sentences = useMemo(() => splitSentences(text), [text]);

  const sentenceTimings = useMemo(() => {
    if (sentences.length === 0) return [];
    const charCounts = sentences.map((s) => s.replace(/[。，！？；、\s]/g, '').length);
    const total = charCounts.reduce((a, b) => a + b, 0) || 1;
    let offset = 0;
    return sentences.map((s, i) => {
      const fraction = charCounts[i] / total;
      const dur = Math.max(10, Math.floor(fraction * durationInFrames));
      const from = offset;
      offset += dur;
      return {sentence: s, from, duration: dur};
    });
  }, [sentences, durationInFrames]);

  // Now safe to do early returns
  if (localFrame < 0 || localFrame > durationInFrames || sentences.length === 0) {
    return null;
  }

  // Find active sentence
  let activeSentence = sentenceTimings.find(
    (st) => localFrame >= st.from && localFrame < st.from + st.duration
  );
  // Fallback to last sentence if we're past all
  if (!activeSentence && sentenceTimings.length > 0) {
    activeSentence = sentenceTimings[sentenceTimings.length - 1];
  }
  if (!activeSentence) return null;

  const sentLocalFrame = localFrame - activeSentence.from;
  const sentDur = activeSentence.duration;
  const charInfos = markKeywords(activeSentence.sentence, keywords);

  const progress = interpolate(sentLocalFrame, [0, sentDur - 6], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const fadeIn = interpolate(sentLocalFrame, [0, 6], [0, 1], {extrapolateRight: 'clamp'});
  const fadeOut = interpolate(sentLocalFrame, [sentDur - 6, sentDur], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const highlightIndex = Math.floor(progress * charInfos.length);

  return (
    <div style={{
      position: 'absolute', bottom: '10%',
      left: 0, right: 0,
      display: 'flex', justifyContent: 'center',
      opacity: fadeIn * fadeOut, zIndex: 100,
    }}>
      <div style={{
        fontFamily: FONT_FAMILY,
        fontSize: 33, fontWeight: 700,
        lineHeight: 1.5, textAlign: 'center', maxWidth: '85%',
        textShadow: '0 2px 16px rgba(0,0,0,0.9), 0 0 24px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,1)',
      }}>
        {charInfos.map((ci, i) => {
          const isRevealed = i <= highlightIndex;
          let color: string;
          if (isRevealed && ci.isKeyword) {
            color = '#f5a623';
          } else if (isRevealed) {
            color = '#ffffff';
          } else {
            color = 'rgba(255,255,255,0.25)';
          }
          return (
            <span key={i} style={{
              color,
              textShadow: ci.isKeyword && isRevealed
                ? '0 0 12px rgba(245,166,35,0.6), 0 2px 16px rgba(0,0,0,0.9)'
                : undefined,
            }}>
              {ci.char}
            </span>
          );
        })}
      </div>
    </div>
  );
};
