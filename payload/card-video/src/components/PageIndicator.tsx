import React from 'react';
import {FONT_FAMILY, LayoutConfig} from '../styles/theme';

interface Props {
  currentIndex: number;
  totalSlides: number;
  layout: LayoutConfig;
}

export const PageIndicator: React.FC<Props> = ({
  currentIndex,
  totalSlides,
  layout,
}) => {
  const current = String(currentIndex + 1).padStart(2, '0');
  const total = String(totalSlides).padStart(2, '0');

  return (
    <div
      style={{
        position: 'absolute',
        bottom: layout.pageIndicatorBottom,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        fontSize: layout.pageIndicatorSize,
        color: 'rgba(255,255,255,0.4)',
        fontFamily: FONT_FAMILY,
        letterSpacing: 1,
      }}
    >
      <span style={{fontSize: layout.pageIndicatorSize - 2, opacity: 0.5}}>
        {'<'}
      </span>
      <span>
        {current} / {total}
      </span>
      <span style={{fontSize: layout.pageIndicatorSize - 2, opacity: 0.5}}>
        {'>'}
      </span>
    </div>
  );
};
