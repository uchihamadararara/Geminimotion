import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {C, CX, CY, FONT, SCENE, TOTAL, beatPulse, hexToRgb, prog, sp, ease} from './lib';
import {Captions} from './Captions';
import {S1, S2, S3, S4} from './Scenes1';
import {S5, S6, S7, S8} from './Scenes2';
import {S9, S10, S11} from './Scenes3';

type Key = {at: number; x: number; y: number; w: number; h: number; r: number; rot: number; c: [number, number, number]};
const K = (at: number, x: number, y: number, w: number, h: number, r: number, c: string, rot = 0): Key => ({at, x, y, w, h, r, rot, c: hexToRgb(c)});

// The one shape that never cuts: every key is a new target, each spring adds its delta (pure function of time)
const KEYS: Key[] = [
  K(0, 0, 0, 36, 36, 18, C.orange),
  K(14, 0, 0, 860, 484, 44, C.card),
  K(150, 0, 0, 760, 760, 120, C.orange),
  K(300, 0, 0, 900, 720, 48, C.card),
  K(450, -225, -225, 420, 420, 56, C.card),
  K(600, 0, 0, 920, 780, 40, '#0F0F14'),
  K(750, 0, 0, 940, 640, 36, C.card),
  K(900, 0, 285, 780, 160, 80, C.orange),
  K(1050, 0, 0, 640, 330, 165, C.card2),
  K(1110, 0, 0, 640, 330, 165, C.orange),
  K(1200, 0, 0, 700, 500, 48, C.blue),
  K(1260, 0, 20, 1200, 1280, 64, C.blue),
  K(1350, 0, 0, 300, 300, 150, C.orange),
  K(1380, 0, 0, 300, 300, 70, C.orange),
  K(1405, 0, 0, 300, 300, 14, C.orange),
  K(1500, 0, 0, 36, 36, 18, C.orange),
];

const heroAt = (f: number) => {
  const v = {x: KEYS[0].x, y: KEYS[0].y, w: KEYS[0].w, h: KEYS[0].h, r: KEYS[0].r, rot: 0, c: [...KEYS[0].c] as number[]};
  for (let i = 1; i < KEYS.length; i++) {
    const p = sp(f, KEYS[i].at, 20, 150);
    const a = KEYS[i - 1];
    const b = KEYS[i];
    v.x += p * (b.x - a.x);
    v.y += p * (b.y - a.y);
    v.w += p * (b.w - a.w);
    v.h += p * (b.h - a.h);
    v.r += p * (b.r - a.r);
    v.rot += p * (b.rot - a.rot);
    for (let k = 0; k < 3; k++) v.c[k] += p * (b.c[k] - a.c[k]);
  }
  return v;
};

const Hero: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= 1425 && f < 1495) return null; // the cube takes over (same square, same colour)
  const h = heroAt(f);
  const w = Math.max(0, h.w);
  const ht = Math.max(0, h.h);
  const big = w > 100;
  const col = h.c.map((n) => Math.max(0, Math.min(255, Math.round(n))));
  return (
    <div
      style={{
        position: 'absolute',
        left: CX + h.x - w / 2,
        top: CY + h.y - ht / 2,
        width: w,
        height: ht,
        borderRadius: Math.max(0, h.r),
        background: `rgb(${col[0]},${col[1]},${col[2]})`,
        border: big ? '1px solid rgba(255,255,255,0.07)' : undefined,
        boxShadow: big ? '0 40px 90px rgba(0,0,0,0.5)' : undefined,
        scale: String(big ? 1 + 0.012 * beatPulse(f) : 1),
      }}
    />
  );
};

const Background: React.FC = () => {
  const f = useCurrentFrame();
  const d = 50 * Math.sin((Math.PI * f) / TOTAL); // 0 at first & last frame -> loops
  return (
    <>
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.075) 2px, transparent 2.6px)',
          backgroundSize: '60px 60px',
          backgroundPosition: `${d}px ${d * 0.6}px`,
        }}
      />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 35%, transparent 40%, rgba(0,0,0,0.55) 100%)'}} />
    </>
  );
};

const Sweeps: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {Array.from({length: 10}).map((_, i) => {
        const k = f - (i + 1) * SCENE;
        if (k < 0 || k > 14) return null;
        return <div key={i} style={{position: 'absolute', left: 0, width: 1080, height: 3, top: 1920 * prog(k, 0, 14), background: C.orange, opacity: 0.55 * (1 - prog(k, 6, 14))}} />;
      })}
    </>
  );
};

const SCENES = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11];

export const Video: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = 1 + 0.035 * Math.sin((Math.PI * frame) / TOTAL);
  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT, overflow: 'hidden'}}>
      <Audio src={staticFile('music.wav')} />
      <Background />
      <AbsoluteFill style={{scale: String(cam), transformOrigin: `${CX}px ${CY}px`}}>
        <Hero />
        {SCENES.map((Sc, i) => (
          <Sequence key={i} from={i * SCENE} durationInFrames={i === 10 ? TOTAL - 1500 : SCENE} name={`Scene ${i + 1}`}>
            <Sc />
          </Sequence>
        ))}
      </AbsoluteFill>
      <Sweeps />
      <Captions />
    </AbsoluteFill>
  );
};
