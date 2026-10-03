import React, {useEffect, useState} from 'react';
import {delayRender, continueRender, cancelRender, staticFile} from 'remotion';

export const LocalFont: React.FC = () => {
  const [handle] = useState(() => delayRender('加载随包中文字体'));
  useEffect(() => {
    const font = new FontFace('Card Noto SC', `url("${staticFile('fonts/NotoSansSC.ttf')}")`, {weight: '100 900'});
    font.load().then(loaded => {document.fonts.add(loaded); continueRender(handle);}).catch(cancelRender);
  }, [handle]);
  return null;
};
