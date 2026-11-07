import React from 'react';
import {Composition} from 'remotion';
import {Video} from './Video';
import {FPS, H, TOTAL, W} from './lib';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Showreel"
    component={Video}
    width={W}
    height={H}
    fps={FPS}
    durationInFrames={TOTAL}
  />
);
